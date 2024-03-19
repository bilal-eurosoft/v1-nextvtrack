"use client";
import React, { ChangeEvent } from "react";
import { Dialog } from "@material-tailwind/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { portalGprsCommand, vehicleListByClientId, videoList } from "@/utils/API_CALLS";
import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import Loading from "../loading";
import Image from "next/image";
import Select from 'react-select';
import { DeviceAttach } from "@/types/vehiclelistreports";
import { Toaster, toast } from "react-hot-toast";
import './newstyle.css'; // Import CSS file for styling
import { dateTimeToTimestamp } from "@/utils/unixTimestamp";

export default function DualCam() {
  const [pictureVideoDataOfVehicle, setPictureVideoDataOfVehicle] = useState<
    pictureVideoDataOfVehicleT[]
  >([]);
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [openSecond, setOpenSecond] = React.useState(false);
  const [singleImage, setSingleImage] = useState<any>();
  const [singleVideo, setSingleVideo] = useState<any>();
  const [loading, setLaoding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageVideo, setCurrentPageVideo] = useState(1);
  const [input, setInput] = useState<any>("");
  const [inputVideo, setInputVideo] = useState<any>("");

  const [CustomDateField, setCustomDateField] = useState(false);
  const [openFrontAndBackCamera, setOpenFrontAndBackCamera] = useState(false);
  const [selectedCameraType, setSelectedCameraType] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);
  const [customDate, setCustomDate] = useState(false);
const [showDurationTab, setshowDurationTab] = useState(false);

  
  const recordsPerPage = 6;
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = pictureVideoDataOfVehicle.slice(firstIndex, lastIndex);
  const totalCount: any = Math.ceil(
    pictureVideoDataOfVehicle.length / recordsPerPage
  );
  const recordsPerPageVideo = 6;
  const lastIndexVideo = currentPageVideo * recordsPerPageVideo;
  const firstIndexVideo = lastIndexVideo - recordsPerPageVideo;
  const recordsVideo = pictureVideoDataOfVehicle.slice(
    firstIndexVideo,
    lastIndexVideo
  );
  const totalCountVideo: any = Math.ceil(
    pictureVideoDataOfVehicle.length / recordsPerPageVideo
  );
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<DeviceAttach | null>(null);;
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedduration, setSelectedDuration] = useState('');

  const handleChangeVideo = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPageVideo(value);
  };
  const handleClickPagination = () => {
    setCurrentPage(input);
  };

  const handleClickPaginationVideo = () => {
    setCurrentPageVideo(inputVideo);
  };
  const handleOpen = (item: any) => {
    setOpen(!open);
    setSingleImage(item.path);
  };

  const handleOpenSecond = (item: any) => {
    setOpenSecond(!openSecond);
    setSingleVideo(item.path);
  };

  const hanldeCameraType = () => {
    setOpenFrontAndBackCamera(!openFrontAndBackCamera);
  };
  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const Data = await vehicleListByClientId({
            token: session.accessToken,
            clientId: session?.clientId,
          });
          setVehicleList(Data.data);
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleListData();
  }, [])
  console.log("vehicl;e", vehicleList)
  useEffect(() => {
    const vehicleListData = async () => {
      try {
        setLaoding(true);
        if (session) {
          const response = await videoList({
            token: session?.accessToken,
            clientId: session?.clientId,
          });
          setPictureVideoDataOfVehicle(response);
        }
        setLaoding(false);
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleListData();
  }, [session]);

  const handleCustom = () => {
    setCustomDate(true);
  };
  const handleWeekend = () => {
    setCustomDate(false);
  };
  const handleClickCustom = () => {
    setCustomDateField(!CustomDateField);
  };
  
  const handleSelectChange = (event: { target: { value: any; }; }) => {
    const selectedVehicleId = event.target.value;
    const selectedVehicle = vehicleList.find(vehicle => vehicle.id === selectedVehicleId);
    setSelectedVehicle(selectedVehicle || null); // If selectedVehicle is undefined, set it to null
    console.log("selectedVehicle",selectedVehicle);
  };

  
 
  const handleCameraTypeChange = (event: { target: { value: any; }; }) => {
    setSelectedCameraType(event.target.value);
  };
  const handleFileTypeChange =  (event: { target: { value: any; }; }) => {
    let filetype = event.target.value
    setSelectedFileType(filetype);
    console.log("fdvdfv", event.target.value)
    if(filetype === "Video"){
    setshowDurationTab(true)}
    else {
      setshowDurationTab(false)
    }
  };

  const handleDateFilterChange = (event: { target: { value: any; }; }) => {
    const selectedValue = event.target.value;
    setSelectedDateFilter(selectedValue);
    if (selectedValue === "custom") {
      setCustomDate(true);
    } else {
      setCustomDate(false);
    }
  };

  const handleSubmit = async () => {
    // Gather all selected values
    const selectedValues = {
      vehicle: selectedVehicle,
      cameraType: selectedCameraType,
      fileType: selectedFileType,
      dateFilter: selectedDateFilter,
    };
    const dateTime = {
      date: selectedDate,
      time: selectedTime
    };
    console.log('Selected Date and Time:', dateTime);
    const timestamp = dateTimeToTimestamp(selectedDate, selectedTime);
    console.log("Unix Timestamp:", timestamp);
    let Duration;
    if(Number(selectedduration) <= 10) {
       Duration = selectedduration
    }
    else {
      return toast.error("Please enter duration between 1-10 seconds")
    }
   
  //  console.log("vfdgbdfvgfvfdgv",selectedValues);
    let commandText;
    if( selectedFileType === "Photo") {
      if(selectedCameraType === "Front"){
        commandText = "camreq: 1,1"
      }
      else if (selectedCameraType === "Back"){
        commandText = "camreq: 1,2"
      }
    }
    else if (selectedFileType === "Video" ) {
      if(selectedCameraType === "Front"){
        commandText = `camreq: 0,1,${timestamp},${Duration}`
      }
      else if (selectedCameraType === "Back"){
        commandText = "camreq: 0,2"
      }
    }

    let formvalues = {
      command : "",
      commandtext: commandText,
      createdDate: "",
      modifyDate: "",
      parameter: "",
      deviceIMEI: "",
      status: "Pending",
      vehicleReg: selectedVehicle?.vehicleReg
    }
    console.log("foemvalues", formvalues)

    if (session) { }
    // const resp = await portalGprsCommand({   token: session?.accessToken, payload: formvalues})

    // }
   /*  const response = await toast.promise(
      portalGprsCommand({
        token: session?.accessToken, payload: formvalues
      }),
      {
        loading: "Saving data...",
        success: "Data saved successfully!",
        error: "Error saving data. Please try again.",
      },
      {
        style: {
          border: "1px solid #00B56C",
          padding: "16px",
          color: "#1A202C",
        },
        success: {
          duration: 2000,
          iconTheme: {
            primary: "#00B56C",
            secondary: "#FFFAEE",
          },
        },
        error: {
          duration: 2000,
          iconTheme: {
            primary: "#00B56C",
            secondary: "#FFFAEE",
          },
        },
      }
    );
    } */
    // Perform any further actions, such as sending the selected values to the server
  };

  
  // get video indexing issue
  // const [getVideoPagination, setVideoPagination] = useState<any>([]);
  // useEffect(() => {
  //   const func = async () => {
  //     const data = await pictureVideoDataOfVehicle.map((item) => {
  //       if (item.fileType == 2) {
  //         return item.Vehicle;
  //       }
  //     });
  //     setVideoPagination(data);
  //   };
  //   func();
  // }, []);

  // console.log("tessst", getVideoPagination);



  return (
    <div>
      <p className="bg-green px-4 py-1 text-white mb-5 font-bold">
        View Image & Videos
      </p>
      <div className="grid lg:grid-cols-10  md:grid-cols-4  px-4 text-start gap-5 bg-bgLight pt-3 gap-16">
        <div className="col-span-2 mt-1">
          {/* <select className=" w-full bg-transparent border-b-2 p-1 outline-none border-grayLight bg-white ">
            <option>Select Vehicle</option>
          </select> */}
       <select onChange={handleSelectChange} >
        <option value="">Select a vehicle</option>
        {vehicleList.map(vehicle => (
          <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicleReg}</option>
        ))}
      </select>
   {/*    {selectedVehicle && (
        <div>
          <h2>Selected Vehicle</h2>
          <p>Name: {selectedVehicle.vehicleReg}</p>
          <p>Other details...</p>
        </div>
      )} */}
        </div>
        <div className="col-span-2 border border-gray">
        <p className="text-sm text-green -mt-3  bg-bgLight lg:w-32 ms-16 px-4 ">
          Camera Type
        </p>
        <label className="text-sm  px-5">
          <input
            type="radio"
            className="w-3 h-3 mr-2 form-radio text-green"
            name="cameraType"
            value="Front"
            checked={selectedCameraType === "Front"}
            onChange={handleCameraTypeChange}
          />
          Front
        </label>
        <label className="text-sm mr-5">
          <input
            type="radio"
            className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
            name="cameraType"
            value="Back"
            checked={selectedCameraType === "Back"}
            onChange={handleCameraTypeChange}
          />
          Back
        </label>
        <label className="text-sm mr-5">
          <input
            type="radio"
            className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
            name="cameraType"
            value="Both"
            checked={selectedCameraType === "Both"}
            onChange={handleCameraTypeChange}
          />
          Both
        </label>
      </div>
      <div className="col-span-2 border border-gray">
        <p className="text-sm text-green  -mt-3  bg-bgLight lg:w-24 ms-16 px-4">
          File Type
        </p>
        <label className="text-sm px-4">
          <input
            type="radio"
            className="w-3 h-3 mr-2 form-radio text-green"
            name="fileType"
            value="Photo"
            checked={selectedFileType === "Photo"}
            onChange={handleFileTypeChange}
          />
          Photo
        </label>
        <label className="text-sm mr-5">
          <input
            type="radio"
            className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
            name="fileType"
            value="Video"
            checked={selectedFileType === "Video"}
            onChange={handleFileTypeChange}
          />
          &nbsp;Video
        </label>
        <label className="text-sm mr-5">
          <input
            type="radio"
            className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
            name="fileType"
            value="Both"
            checked={selectedFileType === "Both"}
            onChange={handleFileTypeChange}
          />
          &nbsp;Both
        </label>
      </div>

        <div className="lg:col-span-1 md:col-span-3  py-5">
          <div className="grid lg:grid-cols-12 md:grid-cols-12 gap-5 "></div>
        </div>
        <div className="col-span-1"></div>
      </div>

   {/*    <div className="grid lg:grid-cols-9   md:grid-cols-4  px-4 text-start gap-5 pt-3 bg-bgLight pb-4 pt-3">
      <div className="col-span-5 border border-gray">
        <p className="text-sm text-green -mt-3 mb-1 bg-bgLight lg:w-28 ms-16 px-5 w-28">
          Date Filter
        </p>
        <label className="text-sm px-5">
          <input
            type="radio"
            className="w-3 h-3 mr-2 form-radio text-green"
            name="dateFilter"
            value="Today"
            checked={selectedDateFilter === "Today"}
            onChange={handleDateFilterChange}
          />
          Today
        </label>
        <label className="text-sm mr-5">
          <input
            type="radio"
            className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
            name="dateFilter"
            value="Yesterday"
            checked={selectedDateFilter === "Yesterday"}
            onChange={handleDateFilterChange}
          />
          &nbsp;Yesterday
        </label>
        <label className="text-sm mr-5">
          <input
            type="radio"
            className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
            name="dateFilter"
            value="Week"
            checked={selectedDateFilter === "Week"}
            onChange={handleDateFilterChange}
          />
          Week
        </label>
        <label className="text-sm">
          <input
            type="radio"
            className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
            name="dateFilter"
            value="custom"
            checked={selectedDateFilter === "custom"}
            onChange={handleDateFilterChange}
          />
          &nbsp;Custom
        </label>
        {customDate && (
          <div className="text-end lg:-mt-6 sm:-mt-8">
            <label className="text-sm -mr-2">To Date</label>
            <input
              type="date"
              className=" mr-2 form-radio text-green lg:ms-5"
              name="toDate"
              // Add necessary attributes and event handlers for toDate
            />
            <label className="text-sm -mr-2">From Date</label>
            <input
              type="date"
              className=" mr-2 form-radio text-green lg:ms-5"
              name="fromDate"
              // Add necessary attributes and event handlers for fromDate
            />
          </div>
        )}
      </div>

        <div className="col-span-1">
          <button className="bg-green px-5 py-2 text-white mt-2"  onClick={handleSubmit}>Request</button>
        </div>

        <div className="col-span-1"></div>
      </div> */}


{showDurationTab && 
      <div className="dateTimeForm">
      <h2>Select Date and Time</h2>
      <form >
        {/* Date Selection */}
        <div className="formGroup">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Time Selection */}
        <div className="formGroup">
          <label htmlFor="time">Time:</label>
          <input
            type="time"
            id="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            step="1"
          />
        </div>
        <div className="formGroup">
          <label htmlFor="time">Duration:</label>
          <input
            type="text"
            id="Duration"
            value={selectedduration}
            onChange={(e) => setSelectedDuration(e.target.value)}
            placeholder="Enter duration between 1-10 seconds"
           
          />
        </div>
        {/* Submit Button */}
    {/*     <button type="submit">Submit</button> */}
      </form>
    </div>
    }
    <div className="col-span-1">
          <button className="bg-green px-5 py-2 text-white mt-2 ml-[850px]"  onClick={handleSubmit}>Request</button>
        </div>
      <div>
        <p className="bg-green h-8 mt-5"> </p>
      </div>
      {openFrontAndBackCamera ? (
        <div>
          <div className="grid lg:grid-cols-6 text-center mt-5  ">
            <div className="col-span-1">
              <p>Vehicle:</p>
            </div>
            <div className="col-span-1">
              <p>Date:</p>
            </div>
            <div className="col-span-1">
              <p>Camera Type:</p>
            </div>
          </div>

          <div
            className="grid lg:grid-cols-8  sm:grid-cols-5 md:grid-cols-5 grid-cols-1 mt-5 "
            style={{
              display: "block",
              justifyContent: "center",
            }}
          >
            <div className="lg:col-span-4  md:col-span-4  sm:col-span-5 col-span-4  ">
              {loading ? (
                <Loading />
              ) : (
                <div className="grid grid-cols-12  gap-6 mx-10 ">
                  <div
                    className="col-span-3 w-full shadow-lg "
                    // style={{ height: "34em" }}
                  >
                    <p>Front Camera:</p>

                    <div className="bg-green shadow-lg sticky top-0">
                      <h1 className="text-center text-5xl text-white font-serif pt-3 ">
                        Image
                      </h1>
                      <hr className="w-36 ms-auto mr-auto pb-5 text-white"></hr>
                    </div>
                    <div className="grid grid-cols-6 text-center pt-5">
                      <div className="col-span-1">
                        <p className="font-bold text-sm">S.No</p>
                      </div>
                      <div className="col-span-1">
                        <p className="font-bold text-sm">Car.No</p>
                      </div>
                      <div className="col-span-2 ">
                        <p className="font-bold text-sm ">Date</p>
                      </div>
                      <div className="col-span-2 ms-6">
                        <p className="font-bold text-sm -ms-5">Check</p>
                      </div>
                    </div>
                    {records.map((item: pictureVideoDataOfVehicleT, index) => {
                      if (item.fileType === 1) {
                        return (
                          <div
                            className="grid grid-cols-6 text-center pt-5"
                            key={index}
                          >
                            <div className="col-span-1 mt-2">
                              <p className="text-sm">{index + 1}</p>
                            </div>
                            <div className="col-span-1 mt-2">
                              <p className="text-sm">{item.Vehicle}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm mt-2">
                                {new Date(item?.dateTime).toLocaleString(
                                  "en-US",
                                  {
                                    timeZone: session?.timezone,
                                  }
                                )}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <button
                                onClick={() => {
                                  handleOpen(item);
                                }}
                                className="text-white bg-green py-2 px-5 "
                              >
                                Image
                              </button>
                            </div>
                          </div>
                        );
                      }
                    })}

                    <div className="flex  justify-center mt-8 ">
                      <div className="grid lg:grid-cols-5 my-4 ">
                        <div className="col-span-1">
                          <p className="mt-1 text-labelColor text-start text-sm">
                            Total {pictureVideoDataOfVehicle.length} item
                          </p>
                        </div>

                        <div className="col-span-3 ">
                          <Stack spacing={2}>
                            <Pagination
                              count={totalCount}
                              page={currentPage}
                              onChange={handleChange}
                              className="text-sm "
                              siblingCount={-totalCount}
                            />
                          </Stack>
                        </div>
                        <div className="col-lg-1 mt-1">
                          <input
                            type="text"
                            className="w-8 border border-grayLight outline-green mx-2 px-1"
                            onChange={(e: any) => setInput(e.target.value)}
                          />
                          <span
                            className="text-labelColor text-sm cursor-pointer"
                            onClick={handleClickPagination}
                          >
                            <span className="text-sm">Page</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Dialog
                    open={open}
                    handler={handleOpen}
                    className="w-3/6 ms-auto mr-auto bg-bgLight"
                  >
                    <Image
                      src={singleImage}
                      width="1000"
                      height="100"
                      style={{ height: "100vh" }}
                      alt="Image"
                    />
                  </Dialog>
                  <div
                    className="col-span-3 shadow-lg w-full lg:-ms-4 "
                    // style={{ height: "auto" }}
                  >
                    <p className="text-white">.</p>
                    <div className="bg-green shadow-lg sticky top-0">
                      <h1 className="text-center text-5xl text-white font-serif pt-3 ">
                        Video
                      </h1>
                      <hr className="w-36 ms-auto mr-auto pb-5 text-white"></hr>
                    </div>
                    <div className="grid grid-cols-6 text-center pt-5">
                      <div className="col-span-1">
                        <p className="font-bold text-sm">S.No</p>
                      </div>
                      <div className="col-span-1">
                        <p className="font-bold text-sm">Car.No</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-bold text-sm">Date</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-bold text-sm ">Check</p>
                      </div>
                    </div>
                    {recordsVideo.map(
                      (item: pictureVideoDataOfVehicleT, index) => {
                        if (item.fileType === 2) {
                          return (
                            <div key={index}>
                              <div className="grid grid-cols-6 text-center pt-5">
                                <div className="col-span-1 mt-2">
                                  <p>{index + 1}</p>
                                </div>
                                <div className="col-span-1">
                                  <p className="text-sm mt-2">{item.Vehicle}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-sm mt-2">
                                    {new Date(item?.dateTime).toLocaleString(
                                      "en-US",
                                      {
                                        timeZone: session?.timezone,
                                      }
                                    )}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <button
                                    onClick={() => handleOpenSecond(item)}
                                    className="text-white bg-green py-2 px-5 "
                                  >
                                    Video
                                  </button>
                                  <Dialog
                                    open={openSecond}
                                    handler={handleOpenSecond}
                                    className="w-3/6 ms-auto mr-auto bg-bgLight"
                                  >
                                    <video
                                      muted
                                      loop
                                      autoPlay
                                      src={singleVideo}
                                      className="h-screen"
                                    ></video>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      }
                    )}

                    <div className="flex  justify-center mt-8 ">
                      <div className="grid lg:grid-cols-5 my-4">
                        <div className="col-span-1">
                          <p className="mt-1 text-labelColor text-end text-sm">
                            Total {recordsVideo.length} item
                          </p>
                        </div>

                        <div className="col-span-3 ">
                          <Stack spacing={2}>
                            <Pagination
                              count={totalCountVideo}
                              page={currentPageVideo}
                              onChange={handleChangeVideo}
                              siblingCount={-totalCountVideo}
                              className="text-sm"
                            />
                          </Stack>
                        </div>
                        <div className="col-lg-1 mt-1">
                          {/* <span className="text-sm">Go To</span> */}
                          <input
                            type="text"
                            className="w-8 border border-grayLight outline-green mx-2 px-1"
                            onChange={(e: any) => setInputVideo(e.target.value)}
                          />
                          <span
                            className="text-labelColor text-sm cursor-pointer"
                            onClick={handleClickPaginationVideo}
                          >
                            page &nbsp;&nbsp;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* second part */}

                  <div
                    className="col-span-3 w-full shadow-lg "
                    // style={{ height: "34em" }}
                  >
                    <p>Back Camera:</p>
                    <div className="bg-green shadow-lg sticky top-0">
                      <h1 className="text-center text-5xl text-white font-serif pt-3 ">
                        Image
                      </h1>
                      <hr className="w-36 ms-auto mr-auto pb-5 text-white"></hr>
                    </div>
                    <div className="grid grid-cols-6 text-center pt-5">
                      <div className="col-span-1">
                        <p className="font-bold text-sm">S.No</p>
                      </div>
                      <div className="col-span-1">
                        <p className="font-bold text-sm">Car.No</p>
                      </div>
                      <div className="col-span-2 ">
                        <p className="font-bold text-sm ">Date</p>
                      </div>
                      <div className="col-span-2 ">
                        <p className="font-bold text-sm ">Check</p>
                      </div>
                    </div>
                    {records.map((item: pictureVideoDataOfVehicleT, index) => {
                      if (item.fileType === 1) {
                        return (
                          <div
                            className="grid grid-cols-6 text-center pt-5"
                            key={index}
                          >
                            <div className="col-span-1 mt-2">
                              <p className="text-sm">{index + 1}</p>
                            </div>
                            <div className="col-span-1 mt-2">
                              <p className="text-sm">{item.Vehicle}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm mt-2">
                                {new Date(item?.dateTime).toLocaleString(
                                  "en-US",
                                  {
                                    timeZone: session?.timezone,
                                  }
                                )}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <button
                                onClick={() => {
                                  handleOpen(item);
                                }}
                                className="text-white bg-green py-2 px-5 "
                              >
                                Image
                              </button>
                            </div>
                          </div>
                        );
                      }
                    })}

                    <div
                      className="flex  justify-end mt-8 "
                      // style={{ position: "fixed", bottom: "1%" }}
                    >
                      <div className="grid lg:grid-cols-5 my-4 ">
                        <div className="col-span-1">
                          <p className="mt-1 text-labelColor text-start text-sm">
                            Total {pictureVideoDataOfVehicle.length} item
                          </p>
                        </div>

                        <div className="col-span-3 ">
                          <Stack spacing={2}>
                            <Pagination
                              count={totalCount}
                              page={currentPage}
                              onChange={handleChange}
                              siblingCount={-totalCount}
                              className="text-sm "
                            />
                          </Stack>
                        </div>
                        <div className="col-lg-1 mt-1">
                          <input
                            type="text"
                            className="w-8 border border-grayLight outline-green mx-1 px-1"
                            onChange={(e: any) => setInput(e.target.value)}
                          />
                          <span
                            className="text-labelColor text-sm cursor-pointer"
                            onClick={handleClickPagination}
                          >
                            <span className="text-sm"> Page</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Dialog
                    open={open}
                    handler={handleOpen}
                    className="w-3/6 ms-auto mr-auto bg-bgLight"
                  >
                    <Image
                      src={singleImage}
                      width="1000"
                      height="100"
                      style={{ height: "100vh" }}
                      alt="Image"
                    />
                  </Dialog>
                  <div
                    className="col-span-3 shadow-lg w-full lg:-ms-4  "
                    // style={{ height: "auto" }}
                  >
                    <p className="text-white">.</p>
                    <div className="bg-green shadow-lg sticky top-0">
                      <h1 className="text-center text-5xl text-white font-serif pt-3 ">
                        Video
                      </h1>
                      <hr className="w-36 ms-auto mr-auto pb-5 text-white"></hr>
                    </div>
                    <div className="grid grid-cols-6 text-center pt-5">
                      <div className="col-span-1">
                        <p className="font-bold text-sm">S.No</p>
                      </div>
                      <div className="col-span-1">
                        <p className="font-bold text-sm">Car.No</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-bold text-sm">Date</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-bold text-sm ">Check</p>
                      </div>
                    </div>
                    {recordsVideo.map(
                      (item: pictureVideoDataOfVehicleT, index) => {
                        if (item.fileType === 2) {
                          return (
                            <div key={index}>
                              <div className="grid grid-cols-6 text-center pt-5">
                                <div className="col-span-1 mt-2">
                                  <p>{index + 1}</p>
                                </div>
                                <div className="col-span-1">
                                  <p className="text-sm mt-2">{item.Vehicle}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-sm mt-2">
                                    {new Date(item?.dateTime).toLocaleString(
                                      "en-US",
                                      {
                                        timeZone: session?.timezone,
                                      }
                                    )}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <button
                                    onClick={() => handleOpenSecond(item)}
                                    className="text-white bg-green py-2 px-5 "
                                  >
                                    Video
                                  </button>
                                  <Dialog
                                    open={openSecond}
                                    handler={handleOpenSecond}
                                    className="w-3/6 ms-auto mr-auto bg-bgLight"
                                  >
                                    <video
                                      muted
                                      loop
                                      autoPlay
                                      src={singleVideo}
                                      className="h-screen"
                                    ></video>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      }
                    )}

                    <div className="flex  justify-end mt-8 ">
                      <div className="grid lg:grid-cols-5 my-4">
                        <div className="col-span-1">
                          <p className="mt-1 text-labelColor text-end text-sm">
                            Total {recordsVideo.length} item
                          </p>
                        </div>

                        <div className="col-span-3 ">
                          <Stack spacing={2}>
                            <Pagination
                              count={totalCountVideo}
                              page={currentPageVideo}
                              onChange={handleChangeVideo}
                              siblingCount={-totalCountVideo}
                              className="text-sm"
                            />
                          </Stack>
                        </div>
                        <div className="col-lg-1 mt-1">
                          {/* <span className="text-sm">Go To</span> */}
                          <input
                            type="text"
                            className="w-8 border border-grayLight outline-green mx-2 px-1"
                            onChange={(e: any) => setInputVideo(e.target.value)}
                          />
                          <span
                            className="text-labelColor text-sm cursor-pointer"
                            onClick={handleClickPaginationVideo}
                          >
                            page &nbsp;&nbsp;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid lg:grid-cols-6 text-center mt-5  ">
            <div className="col-span-1">
              <p>Vehicle:</p>
            </div>
            <div className="col-span-1">
              <p>Date:</p>
            </div>
            <div className="col-span-1">
              <p>Camera Type:</p>
            </div>
          </div>
          <div
            className="grid lg:grid-cols-5  sm:grid-cols-5 md:grid-cols-5 grid-cols-1 mx-20 mt-5 "
            style={{
              display: "block",
              justifyContent: "center",
            }}
          >
            <div className="lg:col-span-4  md:col-span-4  sm:col-span-5 col-span-4  ">
              {loading ? (
                <Loading />
              ) : (
                <div className="grid grid-cols-2 mx-10 gap-5 ">
                  <div
                    className="col-span-1 w-full shadow-lg "
                    // style={{ height: "34em" }}
                  >
                    <div className="bg-green shadow-lg sticky top-0">
                      <h1 className="text-center text-5xl text-white font-serif pt-3 ">
                        Image
                      </h1>
                      <hr className="w-36 ms-auto mr-auto pb-5 text-white"></hr>
                    </div>
                    <div className="grid grid-cols-5 text-center pt-5">
                      <div className="col-span-1">
                        <p className="font-bold">S.No</p>
                      </div>
                      <div className="col-span-1">
                        <p className="font-bold">Car.No</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-bold">Date</p>
                      </div>
                      <div className="col-span-1">
                        <p className="font-bold">Check</p>
                      </div>
                    </div>
                    {records.map((item: pictureVideoDataOfVehicleT, index) => {
                      if (item.fileType === 1) {
                        return (
                          <div
                            className="grid grid-cols-5 text-center pt-5"
                            key={index}
                          >
                            <div className="col-span-1 mt-2">
                              <p>{index + 1}</p>
                            </div>
                            <div className="col-span-1 mt-2">
                              <p>{item.Vehicle}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm mt-2">
                                {new Date(item?.dateTime).toLocaleString(
                                  "en-US",
                                  {
                                    timeZone: session?.timezone,
                                  }
                                )}
                              </p>
                            </div>
                            <div className="col-span-1">
                              <button
                                onClick={() => {
                                  handleOpen(item);
                                }}
                                className="text-white bg-green py-2 px-5 "
                              >
                                Image
                              </button>
                            </div>
                          </div>
                        );
                      }
                    })}

                    <div
                      className="flex  justify-center mt-8 "
                      // style={{ position: "fixed", bottom: "1%" }}
                    >
                      <div className="grid lg:grid-cols-4 my-4 ">
                        <div className="col-span-1">
                          <p className="mt-1 text-labelColor text-end text-sm">
                            Total {pictureVideoDataOfVehicle.length} items
                          </p>
                        </div>

                        <div className="col-span-2 ">
                          <Stack spacing={2}>
                            <Pagination
                              count={totalCount}
                              page={currentPage}
                              onChange={handleChange}
                              className="text-sm"
                            />
                          </Stack>
                        </div>
                        <div className="col-lg-1 mt-1">
                          <span className="text-sm">Go To</span>
                          <input
                            type="text"
                            className="w-7 border border-grayLight outline-green mx-2 px-2"
                            onChange={(e: any) => setInput(e.target.value)}
                          />
                          <span
                            className="text-labelColor text-sm cursor-pointer"
                            onClick={handleClickPagination}
                          >
                            page &nbsp;&nbsp;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Dialog
                    open={open}
                    handler={handleOpen}
                    className="w-3/6 ms-auto mr-auto bg-bgLight"
                  >
                    <Image
                      src={singleImage}
                      width="1000"
                      height="100"
                      style={{ height: "100vh" }}
                      alt="Image"
                    />
                  </Dialog>
                  <div
                    className="col-span-1 shadow-lg w-full"
                    // style={{ height: "auto" }}
                  >
                    <div className="bg-green shadow-lg sticky top-0">
                      <h1 className="text-center text-5xl text-white font-serif pt-3 ">
                        Video
                      </h1>
                      <hr className="w-36 ms-auto mr-auto pb-5 text-white"></hr>
                    </div>
                    <div className="grid grid-cols-5 text-center pt-5">
                      <div className="col-span-1">
                        <p className="font-bold">S.No</p>
                      </div>
                      <div className="col-span-1">
                        <p className="font-bold">Car.No</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-bold">Date</p>
                      </div>
                      <div className="col-span-1">
                        <p className="font-bold">Check</p>
                      </div>
                    </div>
                    {recordsVideo.map(
                      (item: pictureVideoDataOfVehicleT, index) => {
                        if (item.fileType === 2) {
                          return (
                            <div key={index}>
                              <div className="grid grid-cols-5 text-center pt-5">
                                <div className="col-span-1 mt-2">
                                  <p>{index + 1}</p>
                                </div>
                                <div className="col-span-1">
                                  <p className="text-sm mt-2">{item.Vehicle}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-sm mt-2">
                                    {new Date(item?.dateTime).toLocaleString(
                                      "en-US",
                                      {
                                        timeZone: session?.timezone,
                                      }
                                    )}
                                  </p>
                                </div>
                                <div className="col-span-1">
                                  <button
                                    onClick={() => handleOpenSecond(item)}
                                    className="text-white bg-green py-2 px-5 "
                                  >
                                    Video
                                  </button>
                                  <Dialog
                                    open={openSecond}
                                    handler={handleOpenSecond}
                                    className="w-3/6 ms-auto mr-auto bg-bgLight"
                                  >
                                    <video
                                      muted
                                      loop
                                      autoPlay
                                      src={singleVideo}
                                      className="h-screen"
                                    ></video>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      }
                    )}

                    <div className="flex  justify-center mt-8 ">
                      <div className="grid lg:grid-cols-4 my-4">
                        <div className="col-span-1">
                          <p className="mt-1 text-labelColor text-end text-sm">
                            Total {recordsVideo.length} items
                          </p>
                        </div>

                        <div className="col-span-2 ">
                          <Stack spacing={2}>
                            <Pagination
                              count={totalCountVideo}
                              page={currentPageVideo}
                              onChange={handleChangeVideo}
                              className="text-sm"
                            />
                          </Stack>
                        </div>
                        <div className="col-lg-1 mt-1">
                          <span className="text-sm">Go To</span>
                          <input
                            type="text"
                            className="w-7 border border-grayLight outline-green mx-2 px-2"
                            onChange={(e: any) => setInputVideo(e.target.value)}
                          />
                          <span
                            className="text-labelColor text-sm cursor-pointer"
                            onClick={handleClickPaginationVideo}
                          >
                            page &nbsp;&nbsp;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <br></br>
      <br></br>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
