"use client";
import React from "react";
import { Dialog } from "@material-tailwind/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { videoList } from "@/utils/API_CALLS";
import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import Loading from "../loading";
import Image from "next/image";
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
  const [CustomDate, setCustomDate] = useState(false);
  const [CustomDateField, setCustomDateField] = useState(false);
  const [openFrontAndBackCamera, setOpenFrontAndBackCamera] = useState(false);

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

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

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
          <select className=" w-full bg-transparent border-b-2 p-1 outline-none border-grayLight bg-white ">
            <option>Select Vehicle</option>
          </select>
        </div>
        <div className="col-span-2 border border-gray">
          <p className="text-sm text-green -mt-3  bg-bgLight lg:w-32 ms-16 px-4 ">
            Camera Type
          </p>
          <label className="text-sm  px-5">
            <input
              type="radio"
              className="w-3 h-3 mr-2 form-radio text-green"
              name="period"
              value="yesterday"
              style={{ accentColor: "green" }}
            />
            Front
          </label>
          <label className="text-sm mr-5">
            <input
              type="radio"
              className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
              name="period"
              value="yesterday"
              style={{ accentColor: "green" }}
            />
            Back
          </label>
          <label className="text-sm mr-5">
            <input
              type="radio"
              className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
              name="period"
              value="yesterday"
              style={{ accentColor: "green" }}
              onClick={hanldeCameraType}
            />
            Both
          </label>
        </div>
        <div className="col-span-2 border border-gray ">
          <p className="text-sm text-green  -mt-3  bg-bgLight lg:w-24 ms-16 px-4">
            File Type
          </p>
          <label className="text-sm px-4">
            <input
              type="radio"
              className="w-3 h-3 mr-2 form-radio text-green"
              name="period"
              value="yesterday"
              style={{ accentColor: "green" }}
            />
            Photo
          </label>
          <label className="text-sm mr-5">
            <input
              type="radio"
              className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
              name="period"
              value="yesterday"
              style={{ accentColor: "green" }}
            />
            &nbsp;Video
          </label>
          <label className="text-sm mr-5">
            <input
              type="radio"
              className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
              name="period"
              value="yesterday"
              style={{ accentColor: "green" }}
            />
            &nbsp;Both
          </label>
        </div>

        <div className="lg:col-span-1 md:col-span-3  py-5">
          <div className="grid lg:grid-cols-12 md:grid-cols-12 gap-5 "></div>
        </div>
        <div className="col-span-1"></div>
      </div>

      <div className="grid lg:grid-cols-9   md:grid-cols-4  px-4 text-start gap-5 pt-3 bg-bgLight pb-4 pt-3">
        <div className="col-span-5 border border-gray">
          <p className="text-sm text-green -mt-3 mb-1 bg-bgLight lg:w-28 ms-16 px-5 w-28">
            Date Filter
          </p>
          <label className="text-sm px-5">
            <input
              type="radio"
              className="w-3 h-3 mr-2 form-radio text-green"
              name="period"
              value="yesterday"
              style={{ accentColor: "green" }}
              onClick={handleWeekend}
            />
            Today
          </label>
          <label className="text-sm mr-5">
            <input
              type="radio"
              className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
              name="period"
              value="yesterday"
              style={{ accentColor: "green" }}
              onClick={handleWeekend}
            />
            &nbsp;Yesterday
          </label>
          <label className="text-sm mr-5">
            <input
              type="radio"
              className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
              name="period"
              value="yesterday"
              style={{ accentColor: "green" }}
              onClick={handleWeekend}
            />
            Week
          </label>

          <label className="text-sm ">
            <input
              type="radio"
              className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
              name="period"
              value="custom"
              style={{ accentColor: "green" }}
              onClick={handleCustom}
            />
            &nbsp;Custom
          </label>
          {CustomDate && (
            <div className="text-end lg:-mt-6 sm:-mt-8">
              {" "}
              <label className="text-sm -mr-2">To Date</label>
              <input
                type="date"
                className=" mr-2 form-radio text-green lg:ms-5"
                name="period"
                value="yesterday"
                style={{ accentColor: "green" }}
              />
              <label className="text-sm -mr-2">To Form</label>
              <input
                type="date"
                className=" mr-2 form-radio text-green lg:ms-5"
                name="period"
                value="yesterday"
                style={{ accentColor: "green" }}
              />
            </div>
          )}
        </div>

        <div className="col-span-1">
          <button className="bg-green px-5 py-2 text-white mt-2">Search</button>
        </div>

        <div className="col-span-1"></div>
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
    </div>
  );
}
