"use client";
import React, { useRef } from "react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  portalGprsCommand,
  vehicleListByClientId,
  videoList,
  vehiclebyClientid,
  getDualCamVehicleByclientId,
  getVehicleDataByClientId,
  // getGprsCommandLatest,
} from "@/utils/API_CALLS";
// import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import Select from "react-select";
import moment from "moment";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { Toaster, toast } from "react-hot-toast";
import "./newstyle.css";
import { dateTimeToTimestamp } from "@/utils/unixTimestamp";
// import { List, ListItem, ListItemText, Collapse, RadioGroup, Radio } from '@material-ui/core';
import { socket } from "@/utils/socket";
import uniqueDataByIMEIAndLatestTimestamp from "@/utils/uniqueDataByIMEIAndLatestTimestamp";
import { useRouter } from "next/navigation";
import DateFnsMomentUtils from "@date-io/date-fns";
import EventIcon from "@material-ui/icons/Event";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { Box } from "@mui/material";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { io } from "socket.io-client";
import { VehicleData } from "@/types/vehicle";

export default function Request({ socketdata, deviceCommandText }) {
  // const [pictureVideoDataOfVehicle, setPictureVideoDataOfVehicle] = useState<
  //   pictureVideoDataOfVehicleT[]
  // >([]);
  const { data: session } = useSession();
  // const [loading, setLaoding] = useState(false);
  // const [currentPageVideo, setCurrentPageVideo] = useState(1);
  // const [disabledButton, setdisabledButton] = useState(true);
  const [disabledcameraButton, setdisabledcameraButton] = useState(true);
  const [disabledrequestButton, setdisabledrequestButton] = useState(true);
  const [disableallButton, setdisableallButton] = useState(false);
  // const [CustomDateField, setCustomDateField] = useState(false);
  // const [openFrontAndBackCamera, setOpenFrontAndBackCamera] = useState(false);
  const [selectedCameraType, setSelectedCameraType] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);
  // const [selectedDateFilter, setSelectedDateFilter] = useState(null);
  // const [customDate, setCustomDate] = useState(false);
  const [showDurationTab, setshowDurationTab] = useState(false);
  // const [latestGprs, setLatestGprs] = useState(false);
  // const [deviceResponse, setDeviceResponse] = useState<any>("");
  const [toastId, setToastId] = useState<any>(null);
  const [CameraResponseToastId,   setCameraResponseToastId  ] = useState<any>(null);
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<DeviceAttach | null>(
    ""
  );
  const selectedVehicleRef = useRef(selectedVehicle);
  useEffect(() => {
    selectedVehicleRef.current = selectedVehicle;
  }, [selectedVehicle]);
  const [foundVehicleData, setFoundVehicleData] = useState<VehicleData[]>([]);

  const cameraOnRef = useRef(CameraResponseToastId);
  useEffect(() => {
    cameraOnRef.current = CameraResponseToastId;
  }, [CameraResponseToastId]);

  // const sortedRecords = pictureVideoDataOfVehicle.sort(
  //   (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  // );
  // const [filteredRecords, setFilteredRecords] = useState(sortedRecords);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedduration, setSelectedDuration] = useState("");
  /*  const [disabledRequestButton, setdisabledRequestButton] = useState(true); */

  // const router = useRouter();
  const carData = useRef<VehicleData[]>([]);

  // const handlevideodate = (date: MaterialUiPickersDate | null) => {
  //   if (date !== null) {
  //     const dateValue = moment(date).format("YYYY-MM-DD");
  //     setSelectedDate(dateValue);
  //   }
  // };
  
  const handlevideodate = (date: any | null) => {
    if (date !== null) {
      const dateValue = moment(date).format("YYYY-MM-DD");
      setSelectedDate(dateValue);
    }
  };

  const currenTDates = new Date();

  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const Data = await vehiclebyClientid({
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
  }, []);

  // useEffect(() => {
  //   const vehicleListData = async () => {
  //     try {
  //       // setLaoding(true);
  //       if (session) {
  //         const response = await videoList({
  //           token: session?.accessToken,
  //           clientId: session?.clientId,
  //         });
  //         setPictureVideoDataOfVehicle(response);
  //         // setFilteredRecords(response);
  //       }
  //       // setLaoding(false);
  //     } catch (error) {
  //       selectedVehicle;
  //       console.error("Error fetching zone data:", error);
  //     }
  //   };
  //   vehicleListData();
  // }, [session]);

  useEffect(() => {
    // Connect to the server
    const socket = io("https://socketio.vtracksolutions.com:1102", {
      autoConnect: false,
      query: { clientId: session?.clientId }, // This gets updated later on with client code.
      transports: ["websocket", "polling", "flashsocket"],
    });
    socket.connect();
    // Listen for "message" event from the server
    socket.on("device", async (data) => {
      // let message= "Wait for your file for downloading"
      // if (
      //   data.commandtext ===
      //   "Photo request from source 1. Preparing to send file from timestamp 1719846377."
      // ) {
      //   message = "Wait for your file for downloading";
      // } else {
      //   message = "Wait for your file for downloading";
      // }
      /* if(!CameraResponseToastId){
        toast.dismiss(CameraResponseToastId);
      } */
      if(data?.commandtext !== "DOUT1:1 Timeout:100s "){
        toast.success(data?.commandtext, {
          position: "top-center",
        });
      }

      
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  /* useEffect(() => {
  // Check if selectedVehicle is not null
  if (selectedVehicle) {
    // Retrieve carData from localStorage and parse it into an array
  //  const storedData = localStorage.getItem('carData');

    if (carData.current) {
     
      // Find the selected vehicle in carData
      const foundVehicle = carData.current.find((vehicle: { vehicleReg: string; }) => vehicle.vehicleReg === selectedVehicle.vehicleReg);
      
      // If the vehicle is found and its status is "Parked", enable the button
      if (foundVehicle && foundVehicle.vehicleStatus === "Parked") {
       
        setdisabledButton(false);
      } else {
 
        setdisabledButton(true);
      }
    } else {
      // Handle the case where carData is not found in localStorage
    }
  }
}, [selectedVehicle]); */
  // const getVehicleData = async () => {
  //   if (session) {
  //     const result = await getVehicleDataByClientId(session?.clientId);
  //   }
  // };
  useEffect(() => {
    (async function () {
      if (
        session?.clientId &&
        selectedVehicle?.vehicleReg &&
        selectedCameraType &&
        selectedFileType
      ) {
        const clientVehicleData = await getVehicleDataByClientId(
          session?.clientId
        );

        if (clientVehicleData?.data?.Value) {
          let parsedData = JSON.parse(
            clientVehicleData?.data?.Value
          )?.cacheList;
          // call a filter function here to filter by IMEI and latest time stamp
          let uniqueData = uniqueDataByIMEIAndLatestTimestamp(parsedData);
          carData.current = uniqueData;
       
          if (carData.current) {
            /*  console.log(
              "i0977 222",
              selectedVehicle,
              "||",

              localStorage.getItem("selectedVehicle")
            ); */
           
            const foundVehicle = carData.current.find(
              (vehicle: { vehicleReg: string }) =>
                vehicle.vehicleReg === selectedVehicle?.vehicleReg
              // localStorage.getItem("selectedVehicle")
            );
            setFoundVehicleData(foundVehicle);
            /*   console.log(foundVehicle); */
           
           
            if (
              foundVehicle?.ignition == 0 &&
              foundVehicle?.camStatus?.value == 0
            ) {
              /*  console.log("disable request button"); */
              setdisabledcameraButton(false);
              setdisabledrequestButton(true);
              
              
            } else if (
              foundVehicle?.frontCamera?.value == 1 ||
              foundVehicle?.frontCamera?.value == 2 ||
              foundVehicle?.frontCamera?.value == 4
            ) {
              toast.error("Memory card detect failed");

              setdisabledcameraButton(true);
              setdisabledrequestButton(true);
              
              
            } else if (foundVehicle?.frontCamera?.value == 3) {
              setdisabledcameraButton(true);
              setdisabledrequestButton(false);
              
             
            }
          }
        }
      }
    })();
  }, [session, selectedVehicle, selectedCameraType, selectedFileType]);

  // useEffect(() => {
  //   if (
  //     (foundVehicleData?.frontCamera?.value == 3 &&
  //       selectedCameraType == "Front") ||
  //     (foundVehicleData?.backCamera?.value == 3 && selectedCameraType == "Back")
  //   ) {
  //     setdisabledButton(true);
  //     setdisabledRequestButton(false);
  //   } else if (
  //     (foundVehicleData?.frontCamera?.value == 0 &&
  //       selectedCameraType == "Front") ||
  //     (foundVehicleData?.backCamera?.value == 0 && selectedCameraType == "Back")
  //   ) {
  //     toast.error("Camera Is Off", {
  //       position: "top-center",
  //     });
  //     setdisabledButton(false);
  //     setdisabledRequestButton(true);
  //   }
  //   if (
  //     (selectedFileType === "Photo" || selectedFileType === "Video") &&
  //     selectedCameraType == "Front" &&
  //     foundVehicleData?.frontCamera?.value == 1
  //   ) {
  //     toast.error("Memory Card Is Missing", {
  //       position: "top-center",
  //     });
  //   }
  // }, [selectedFileType, selectedCameraType, foundVehicleData]);
  // console.log("selectedVehicle", selectedVehicle);
  useEffect(() => {
    if (session?.clientId) {
      /*  console.log(
        "i0977",
        selectedVehicle,
        "||||",
        disabledrequestButton,
        localStorage.getItem("selectedVehicle")
      ); */
      try {
        /*   const socket2 = io("https://socketio.vtracksolutions.com:1102", {
          autoConnect: false,
          query: { clientId: "64f9c5c3b7f9957d81e36908" }, // This gets updated later on with client code.
          transports: ["websocket", "polling", "flashsocket"],
        });
        socket2.connect();
        socket2.on( */
        socket.io.opts.query = { clientId: session?.clientId };
        socket.connect();
        socket.on(
          "message",
          async (data: { cacheList: VehicleData[] } | null | undefined) => {
            if (data === null || data === undefined) {
              return;
            }

            const uniqueData = uniqueDataByIMEIAndLatestTimestamp(
              data?.cacheList
            );
            /*  console.log(
              "i0977 111",
              selectedVehicle,
              "||",
              selectedVehicleRef.current,
              "||",
              localStorage.getItem("selectedVehicle")
            ); */
            carData.current = uniqueData;

            if (carData.current) {
              /*  console.log("i0977", selectedVehicle); */
              /*   console.log(carData.current); */
              const foundVehicle = carData.current.find(
                (vehicle: { vehicleReg: string }) =>
                  vehicle.vehicleReg === selectedVehicleRef?.current?.vehicleReg
                // localStorage.getItem("selectedVehicle")
              );
           
              setFoundVehicleData(foundVehicle);
              /*     console.log(foundVehicle); */
              // if (foundVehicle?.frontCamera?.value == 0) {
              //   setdisabledButton(false);
              //   setdisabledcameraButton(true);
              //   setdisabledrequestButton(false);
              // } else {
              //   setdisabledcameraButton(false);
              //   setdisabledrequestButton(true);
              // }

              if (
                foundVehicle?.ignition == 0 &&
                foundVehicle?.camStatus?.value == 0
              ) {
                setdisabledcameraButton(false);
                setdisabledrequestButton(true);
                if(cameraOnRef.current){
                 
                  toast.dismiss(CameraResponseToastId);
                  setCameraResponseToastId(null)
                }
              } else if (
                foundVehicle?.frontCamera?.value == 1 ||
                foundVehicle?.frontCamera?.value == 2 ||
                foundVehicle?.frontCamera?.value == 4
              ) {
                toast.error("Memory card detect failed");

                setdisabledcameraButton(true);
                setdisabledrequestButton(true);
                if(cameraOnRef.current){
                  
                  toast.dismiss(CameraResponseToastId);
                  setCameraResponseToastId(null)
                }
              } else if (foundVehicle?.frontCamera?.value == 3 ) {
                setdisabledcameraButton(true);
                setdisabledrequestButton(false);
                if(cameraOnRef.current){
                
                  toast.dismiss(CameraResponseToastId);
                  setCameraResponseToastId(null)
                  toast.success("Now, you can make a Request", {
                    autoClose: 4000,
                  });
                }
                


              }
            }
            /*          const existingData = localStorage.getItem('carData');
          if (existingData) {
            localStorage.removeItem('carData');
          }
          localStorage.setItem('carData', JSON.stringify(uniqueData)); */
          }
        );
      } catch (err) {
        console.log("Error: ", err);
      }
    }

    return () => {
      socket.disconnect();
    };
  }, [session?.clientId]);

  const handleSelectChange = (e: any) => {
    const selectedVehicleId = e;
    const selectedVehicle = vehicleList.find(
      (vehicle) => vehicle.vehicleReg === selectedVehicleId?.value
    );
    /*     console.log(selectedVehicle, selectedVehicleId?.value, "=========");
    localStorage.setItem("selectedVehicle", selectedVehicle?.vehicleReg); */
    setSelectedVehicle(selectedVehicle || null);
  };

  const options =
    vehicleList?.map((item: any) => ({
      value: item.vehicleReg,
      label: item.vehicleReg,
    })) || [];

  const handleCameraTypeChange = (event: { target: { value: any } }) => {
    setSelectedCameraType(event.target.value);
  };
  const handleFileTypeChange = (event: { target: { value: any } }) => {
    let filetype = event.target.value;
    setSelectedFileType(filetype);
    if (filetype === "Video") {
      setshowDurationTab(true);
    } else {
      setshowDurationTab(false);
    }
  };
  interface HandleCameraOnProps {
    duration?: number;
  }
  const handlecameraOn = async () => {
    //   if (duration == 100) toast("Data sent successfully");
    // let duration = 100;
    if(!selectedVehicle || !selectedCameraType || !selectedFileType){
      return toast.error("Please select the fields")
    }
   /*  if(showDurationTab == true){
      if(!selectedDate || !selectedTime || !selectedduration){
        return toast.error("Please select the fields")
      }
    } */
   
    let duration;
    if (selectedFileType == "Video") {
      duration = 200//(Number(selectedduration) + 2) * 60;
    } else {
      duration = 100;
    }
    let formvalues = {
      commandtext: `setdigout 1 ${duration}`,
      vehicleReg: selectedVehicle?.vehicleReg,
      command: "",
      createdDate: "",
      modifyDate: "",
      parameter: "",
      deviceIMEI: "",
      status: "Pending",
    };
    if (selectedVehicle == null) {
      return toast.error("Please select vehicle");
    }

    if (session) {
      const response = await toast.promise(
        portalGprsCommand({
          token: session?.accessToken,
          payload: formvalues,
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

        if (!CameraResponseToastId) {
          const id = toast.loading("Waiting for Camera on", {
            position: "top-center",
          });
          setCameraResponseToastId(id);
        }
      
      if(response.success){
        setdisableallButton(true)
        if(selectedFileType === "Video"){
          setshowDurationTab(true)
        }
       
      }
    }
  };

  const handleSubmit = async () => {
    // setLatestGprs(true);

    // const selectedValues = {
    //   vehicle: selectedVehicle,
    //   cameraType: selectedCameraType,
    //   fileType: selectedFileType,
    //   dateFilter: selectedDateFilter,
    // };

    // const dateTime = {
    //   date: selectedDate || new Date(),
    //   time: selectedTime,
    // };
    if(selectedFileType === "Video"){
      if(!selectedDate || !selectedTime || !selectedduration){
        return toast.error("Please select the fields")
      }
    } 
    const timestamp = dateTimeToTimestamp(selectedDate, selectedTime);
    let Duration;
    if (Number(selectedduration) <= 10) {
      Duration = Number(selectedduration) + 1;
    } else {
      return toast.error("Please enter duration between 1-10 seconds");
    }
    let commandText;
    if (selectedFileType === "Photo") {
      if (selectedCameraType === "Front") {
        commandText = "camreq: 1,1";
      } else if (selectedCameraType === "Back") {
        commandText = "camreq: 1,2";
      }
    } else if (selectedFileType === "Video") {
      if (selectedCameraType === "Front") {
        commandText = `camreq: 0,1,${timestamp},${Duration}`;
      } else if (selectedCameraType === "Back") {
        commandText = `camreq: 0,2,${timestamp},${Duration}`;
      }
    }
    /*  if (selectedFileType == "Video") {
      await handlecameraOn({ duration: (Duration + 2) * 60 });
    } else {
      await handlecameraOn({ duration: 200 });
    } */
    let formvalues = {
      command: "",
      commandtext: commandText,
      createdDate: "",
      modifyDate: "",
      parameter: "",
      deviceIMEI: "",
      status: "Pending",
      vehicleReg: selectedVehicle?.vehicleReg,
    };

    if (session) {
      const response = await toast.promise(
        portalGprsCommand({
          token: session?.accessToken,
          payload: formvalues,
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

      if (socketdata.filetype !== ".h265" || socketdata.filetype !== ".jpeg") {
        if (!toastId) {
          const id = toast.loading("Waiting for Device Response", {
            position: "top-center",
          });
          setToastId(id);
        }
      }

      if (response.success) {
        // setSelectedVehicle(null);
   
          setdisableallButton(false)
        
        setSelectedFileType(null);
        setSelectedCameraType(null);
        setSelectedDuration("");
        setSelectedTime("");
        setSelectedDate("");
      }
    }
    // setToastId(null);
  };
  // if (socketdata) {
  //   toast.dismiss(toastId);
  // }
  if (socketdata.filetype == ".h265" || socketdata.filetype == ".jpeg") {
    /*  console.log(socketdata, toastId); */
    toast.dismiss(toastId);
  }

  const selectedOption =
    options.find((option) => option.value === selectedVehicle?.vehicleReg) ||
    null;

  const getDate = new Date();
  let getHour = getDate.getHours();
  let getMinute = getDate.getMinutes();
  let getSecond = getDate.getSeconds();
  let fullTime = `${getHour}:${getMinute}:${getSecond}`;

  return (
    <div>
      <div className="tab-pane" id="">
        <div className="grid lg:grid-cols-5  md:grid-cols-3 sm:grid-col-1   px-4 text-start gap-5 bg-bgLight pt-3 gap-16">
          <div className="css-b62m3t-container ">
            <Select
              value={selectedOption}
              // value={selectedVehicle}
              onChange={handleSelectChange}
              options={options}
              placeholder="Pick Vehicle"
              isClearable
              isSearchable
              noOptionsMessage={() => "No options available"}
              className="rounded-md w-full  outline-green border border-grayLight  hover:border-green select_vehicle"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  border: "none",
                  boxShadow: state.isFocused ? null : null,
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? "#00B56C"
                    : state.isFocused
                    ? "#E1F0E3"
                    : "transparent",
                  color: state.isSelected
                    ? "white"
                    : state.isFocused
                    ? "black"
                    : "black",
                  "&:hover": {
                    backgroundColor: "#E1F0E3",
                    color: "black",
                  },
                }),
              }}
            />
          </div>
          <div className="col-span-1">
            <div className="border border-gray ">
              <p className="text-sm text-green -mt-3  bg-bgLight lg:w-32 ms-14 px-4 ">
                Camera Type
              </p>
              <div className="flex items-center">
                <label className="text-sm  px-7">
                  <input
                    type="radio"
                    style={{ accentColor: "green" }}
                    className="w-3 h-3 mr-2 form-radio text-green"
                    /*    disabled={foundVehicleData?.frontCamera ? false : true} */
                    name="cameraType"
                    value="Front"
                     disabled={disableallButton}
                    checked={selectedCameraType === "Front"}
                    onChange={handleCameraTypeChange}
                  />
                  Front
                </label>

                <label className="text-sm mr-5">
                  <input
                    type="radio"
                    style={{ accentColor: "green" }}
                    className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
                    /*    disabled={foundVehicleData?.backCamera ? false : true} */
                    name="cameraType"
                    value="Back"
                    // disabled={ foundVehicleData?.backCamera?.value !=3}
                    disabled={disableallButton}
                    checked={selectedCameraType === "Back"}
                    onChange={handleCameraTypeChange}
                  />
                  Back
                </label>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <div className="border border-gray">
              <p className="text-sm text-green  -mt-3  bg-bgLight lg:w-24 ms-16 px-4">
                File Type
              </p>
              <div className="flex items-center">
                <label className="text-sm px-5">
                  <input
                    type="radio"
                    style={{ accentColor: "green" }}
                    className="w-3 h-3 mr-2 form-radio text-green"
                    name="fileType"
                    value="Photo"
                    disabled={disableallButton}
                    checked={selectedFileType === "Photo"}
                    onChange={handleFileTypeChange}
                  />
                  Image
                </label>
                <label className="text-sm mr-5">
                  <input
                    type="radio"
                    style={{ accentColor: "green" }}
                    className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
                    name="fileType"
                    value="Video"
                    disabled={disableallButton}
                    checked={selectedFileType === "Video"}
                    onChange={handleFileTypeChange}
                  />
                  &nbsp;Video
                </label>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <button
              className={`bg-green px-2 py-2 text-white
              ${disabledrequestButton ? "opacity-50 cursor-not-allowed" : ""}`}
              // className={`bg-green px-5 py-2 text-white ${
              //   disabledRequestButton == true
              //     ? "opacity-50 cursor-not-allowed"
              //     : "" ||
              //       selectedFileType === null ||
              //       selectedCameraType === null ||
              //       selectedVehicle === null ||
              //       (selectedFileType === "Video" &&
              //         (selectedDate === null ||
              //           selectedTime === "" ||
              //           selectedduration === ""))
              //     ? "disabled"
              //     : ""
              // }`}
              onClick={handleSubmit}
              disabled={
                disabledrequestButton == true /*  ||
                selectedFileType === null ||
                selectedCameraType === null ||
                selectedVehicle === null ||
                (selectedFileType === "Video" &&
                  (selectedDate === null ||
                    selectedTime === "" ||
                    selectedduration === "")) */
              }
            >
              Request
            </button>{" "}
            {/* <button
              className={`bg-green px-5 py-2 text-white `}
              // onClick={handleSubmit2}
            >
              check Status
            </button> */}
            <button
              className={`bg-green px-2 py-2 text-white
                    ${
                      disabledcameraButton
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
              onClick={() => {
                handlecameraOn({});
              }}
              disabled={disabledcameraButton}
              style={{ marginLeft: "10px" }}
            >
              camera On
            </button>
          </div>
        </div>
        <br></br>
        <br></br>
        <div>
        {showDurationTab && (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', padding: '20px', backgroundColor: '#f9f9f9' }}>
    <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', borderRadius: '5px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <label htmlFor="date" style={{ marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Date:</label>
        <input
          type="date"
          id="date"
          form="MM/dd/yyyy"
          value={selectedDate}
          onChange={(item) => handlevideodate(item)}
          step="1"
          onKeyPress={(e) => e.preventDefault()}
          required
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '10px', borderRadius: '5px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <label htmlFor="time" style={{ marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Time:</label>
        <input
          type="time"
          id="time"
          value={selectedTime >= fullTime ? '' : selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          step="1"
          onKeyPress={(e) => e.preventDefault()}
          required
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
        />
      </div>
      <div style={{ display: 'flex', width: '150%', flexDirection: 'column', padding: '10px', borderRadius: '5px', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <label htmlFor="duration" style={{ marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Duration: (in seconds)</label>
        <input
          type="number"
          id="duration"
          value={selectedduration}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[1-9]$|^10$/.test(value)) {
              setSelectedDuration(value);
            }
          }}
          placeholder="Enter duration between 1-10 sec"
          required
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
        />
      </div>
    </form>
  </div>
)}


        </div>
      </div>
      <br></br>
      <br></br>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
