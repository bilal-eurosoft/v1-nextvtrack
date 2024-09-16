"use client";
import React from "react";
import { useState, useEffect } from "react";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import {
  GprsCommandbyCliendId,
  vehiclebyClientidbyimmobilising
} from "@/utils/API_CALLS";
import Image from "next/image";
import Select from "react-select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import moment from "moment";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { Toaster, toast } from "react-hot-toast";
import "./newstyle.css";
import { List, ListItem, ListItemText, Collapse } from "@material-ui/core";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DateFnsMomentUtils from "@date-io/date-fns";
import EventIcon from "@material-ui/icons/Event";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import Request from "./request";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import logo from "../../../public/Images/loadinglogo.png";
import { useSession } from "next-auth/react";
import { set } from "date-fns";
export default function Command() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [gprsdataget, setgprsdataget] = useState(false);

  const [currentPage, setCurrentPage] = useState<any>(1);
  const [input, setInput] = useState<any>(1);
  const [activeTab, setActiveTab] = useState("View");
  const handleClick = (tab: string) => {
    setLoading(true);
    setActiveTab((prevTab) => (prevTab === tab ? "View" : tab));
  };
  const [selectedVehiclelist, setSelectedVehiclelist] = useState<any>("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filteredDataIsAvaialable, setfilteredDataIsAvaialable] =
    useState<boolean>(true);
  const [gprsData, setGprsData] = useState([]);

  const handleVehicleChange = (e: any) => {
    if (e == null) {
      setFilteredRecords(gprsData);
    }
    setSelectedVehiclelist(e);
  };
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const handleDateChange = (
    type: string,
    date: MaterialUiPickersDate | null
  ) => {
    if (date !== null) {
      const dateValue = moment(date).toDate();
      if (type === "from") {
        setFromDate(dateValue);
      } else if (type === "to") {
        setToDate(dateValue);
      }
    }
  };
  const handleSearch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!selectedVehiclelist) {
      toast.error("Please select Vehicle");
      return;
    }
    // if (!fromDate) {
    //   toast.error("Please select From Date");
    //   return;
    // }

    // if (!toDate) {
    //   toast.error("Please select To Date");
    //   return;
    // }
    if (fromDate && toDate) {
      const fromDateString = (fromDate as any).toISOString().split("T")[0];
      const toDateString = (toDate as any).toISOString().split("T")[0];

      const filtered = gprsData.filter((record: any) => {
        const recordDate = (record.createdAt as any).split("T")[0];

        return recordDate >= fromDateString && recordDate <= toDateString;
      });
      if (selectedVehiclelist === null || selectedVehiclelist === "") {
        setFilteredRecords(filtered);
        setCurrentPage(1);
        // if (filtered.length === 0) {
        //   setfilteredDataIsAvaialable(false);
        // }
      } else {
        const filteredWithVehicle = filtered.filter(
          (record: any) => record.Label1 === selectedVehiclelist?.value
        );
        setFilteredRecords(filteredWithVehicle);
        setCurrentPage(1);
        // if (filteredWithVehicle.length === 0) {
        //   setfilteredDataIsAvaialable(false);
        // }
      }
    } else if (selectedVehiclelist !== null || selectedVehiclelist !== "") {
      const filteredWithVehicle = gprsData.filter(
        (record: any) => record.Label1 === selectedVehiclelist?.value
      );

      setFilteredRecords(filteredWithVehicle);
      setCurrentPage(1);
      //   if (filteredWithVehicle.length === 0) {
      //     setfilteredDataIsAvaialable(false);
      //   }
    }
    //   else {
    //     setFilteredRecords(filteredRecords);
    //   }
  };
  const handleClear = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setFromDate(null);
    setToDate(null);

    if (selectedVehiclelist !== null && selectedVehiclelist !== "") {
      const filteredWithVehicle = gprsData.filter(
        (record: any) => record.Label1 === selectedVehiclelist?.value
      );
      setFilteredRecords(filteredWithVehicle);
      setCurrentPage(1);
    } else {
      setFilteredRecords(gprsData);
    }
  };

  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setInput(value);
    setCurrentPage(value);
  };
  const currenTDates = new Date();
  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const Data = await vehiclebyClientidbyimmobilising({
            token: session.accessToken,
            clientId: session?.clientId
          });

          setVehicleList(Data.data);
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };

    if (vehicleList.length == 0) {
      vehicleListData();
    }
  }, []);
  useEffect(() => {
    const getGprsData = async () => {
      try {
        if (session) {
          const response = await GprsCommandbyCliendId({
            token: session?.accessToken,
            clientId: session?.clientId
          });
          
          let data: any = [];
          response.map((i: any, index: any) => {
            let r: any = vehicleList.find((j) => {
              return j.deviceIMEI == i.deviceIMEI;
            });
          

            if (r) {
              let { clientId, vehicleReg, Label1, dualCam, immobilising } = r;
              let devicestatus;
              if (dualCam && immobilising) {
                let c = i.commandtext.split(" ");
                if (
                  c[0] == "setdigout" &&
                  c[1] == "2" &&
                  i.status == "Pending"
                ) {
                  // if(i.status=="Pending"){
                  if (!i.commandResponse) {
                    devicestatus = "Activation in process";
                  } else {
                    devicestatus = "Activated";
                  }
                } else if (
                  c[0] == "setdigout" &&
                  c[1] == "0" &&
                  i.status == "Pending"
                ) {
                 
                  if (!i.commandResponse) {
                    devicestatus = "Deactivation in process";
                  } else {
                    devicestatus = "Deactivated";
                  }
                }
              } else if (immobilising) {
                let c = i.commandtext.split(" ");
                if (c[0] == "setdigout" && c[1] == "1") {
                
                  if (!i.commandResponse) {
                    devicestatus = "Activation in process";
                  } else {
                    devicestatus = "Activated";
                  }
                } else if (c[0] == "setdigout" && c[1] == "0") {
                 
                  if (!i.commandResponse) {
                    devicestatus = "Deactivation in process";
                  } else {
                    devicestatus = "Deactivated";
                  }
                }
              }

              if (devicestatus != undefined) {
                data.push({
                  ...i,
                  clientId,
                  vehicleReg,
                  Label1,
                  dualCam,
                  immobilising,
                  devicestatus
                });
              }
            }

            if (index == (response.length - 1)) {
              setGprsData(data);
              
              setFilteredRecords(data);
              setLoading(false);
              setfilteredDataIsAvaialable(true)
            }
          });
        }
      } catch (error) {
        console.error("Error fetching  data:", error);
      }
    };

    // if (vehicleList?.length > 0 && (filteredRecords?.length == 0 || loading || gprsdataget) ) {
    if (filteredRecords?.length == 0 || gprsData.length == 0) {
      
      getGprsData();
      setgprsdataget(false);
    }
  }, [session]);
  const recordsPerPage = 8;
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = filteredRecords.slice(firstIndex, lastIndex);

  const totalCount: any = Math.ceil(filteredRecords?.length / recordsPerPage);
 
 
 useEffect(()=>{
 
 },[filteredRecords])
  // const options2 =
  //   vehicleList?.map((item: any) => ({
  //     value: item.vehicleReg,
  //     label: item.vehicleReg
  //   })) || [];

  return (
    <div>
      <hr className="text-white"></hr>
      <p className="bg-green px-4 py-1 text-white mb-5 font-bold text-center">
        Immobilizing Management
      </p>
      <div>
        <Request setgprsdataget={setgprsdataget} />
      </div>
      <br></br>

      <div className="tab-pane" id="">
        <div>
          {/*  <div className="grid lg:grid-cols-5  mt-5  "> */}
          <div className="grid gap-1 grid-cols-1 sm:grid-cols-1 md:grid-cols-7">
            <div
              className="col-span-1 gap-2 "
              /*  style={{ marginRight: "50px", marginLeft: "20px" }} */
              style={{ marginLeft: "16px" }}
            >
              <Select
                onChange={handleVehicleChange}
                options={vehicleList?.map((item: any) => ({
                  value: item.vehicleReg,
                  label: item.vehicleReg
                }))}
                placeholder="Pick Vehicle"
                isClearable
                isSearchable
                noOptionsMessage={() => "No options available"}
                className="rounded-md w-full  outline-green border border-grayLight  hover:border-green select_vehicle"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    border: "none",
                    boxShadow: state.isFocused ? null : null
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
                      color: "black"
                    }
                  })
                }}
              />
            </div>
            <div className="col-span-3">
              <form>
                {/* Container for large screens (from 1024px upwards) */}
                {/* <div className="hidden lg:grid lg:grid-cols-12 px-4 md:px-6 lg:px-10 items-center"> */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 px-4 md:px-6 lg:px-10 items-center">
                  <div className="lg:col-span-4 flex flex-col">
                    <label className="txt-green mb-1">From</label>
                    <MuiPickersUtilsProvider utils={DateFnsMomentUtils}>
                      <DatePicker
                        format="MM/dd/yyyy"
                        value={fromDate}
                        onChange={(date) => handleDateChange("from", date)}
                        variant="inline"
                        maxDate={currenTDates}
                        placeholder="Start Date"
                        autoOk
                        style={{ width: "90%" }}
                        inputProps={{ readOnly: true }}
                        InputProps={{
                          endAdornment: (
                            <EventIcon style={{ width: 20, height: 20 }} />
                          )
                        }}
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                  <div className="lg:col-span-4 flex flex-col">
                    <label className="text-green mb-1">To</label>
                    <MuiPickersUtilsProvider utils={DateFnsMomentUtils}>
                      <DatePicker
                        format="MM/dd/yyyy"
                        value={toDate}
                        onChange={(date) => handleDateChange("to", date)}
                        variant="inline"
                        placeholder="End Date"
                        maxDate={currenTDates}
                        autoOk
                        style={{ width: "90%" }}
                        inputProps={{ readOnly: true }}
                        InputProps={{
                          endAdornment: (
                            <EventIcon style={{ width: 20, height: 20 }} />
                          )
                        }}
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                  <div className="lg:col-span-2 flex items-center ">
                    <button
                      style={{ background: "none" }}
                      className="text-green text-2xl"
                      onClick={(e) => handleClear(e)}
                    >
                      x
                    </button>
                  </div>
                  <div className="lg:col-span-2 flex items-center justify-center">
                    <button
                      className="bg-green py-2 text-white flex items-center justify-center font-popins shadow-md hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none px-4 rounded-lg"
                      onClick={(e) => handleSearch(e)}
                      style={{ fontWeight: "bold" }}
                    >
                      <svg
                        className="h-5 w-5 text-white mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinejoin="round"
                      >
                        <circle cx="10" cy="10" r="7"></circle>
                        <line x1="21" y1="21" x2="15" y2="15"></line>
                      </svg>
                      <span>Search</span>
                    </button>
                  </div>
                </div>

                {/* Container for smaller screens (up to 770px) */}
                <div className="lg:hidden flex flex-col gap-4 px-4 md:px-6 lg:px-10">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col flex-grow mb-2">
                      <label className="text-green mb-1">From</label>
                      <MuiPickersUtilsProvider utils={DateFnsMomentUtils}>
                        <DatePicker
                          format="MM/dd/yyyy"
                          value={fromDate}
                          onChange={(date) => handleDateChange("from", date)}
                          variant="inline"
                          maxDate={currenTDates}
                          placeholder="Start Date"
                          autoOk
                          style={{ width: "100%" }}
                          inputProps={{ readOnly: true }}
                          InputProps={{
                            endAdornment: (
                              <EventIcon style={{ width: 20, height: 20 }} />
                            )
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </div>

                    <div className="flex flex-col flex-grow mb-2">
                      <label className="text-green mb-1">To</label>
                      <MuiPickersUtilsProvider utils={DateFnsMomentUtils}>
                        <DatePicker
                          format="MM/dd/yyyy"
                          value={toDate}
                          onChange={(date) => handleDateChange("to", date)}
                          variant="inline"
                          placeholder="End Date"
                          maxDate={currenTDates}
                          autoOk
                          inputProps={{ readOnly: true }}
                          InputProps={{
                            endAdornment: (
                              <EventIcon style={{ width: 20, height: 20 }} />
                            )
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </div>

                    <div className="flex">
                      <button
                        style={{ background: "none" }}
                        className="text-green text-2xl"
                        onClick={(e) => handleClear(e)}
                      >
                        x
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <button
                      className="bg-green py-2 text-white flex items-center justify-center font-popins shadow-md hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none px-4 rounded-lg"
                      onClick={(e) => handleSearch(e)}
                      style={{ fontWeight: "bold", margin: "auto" }}
                    >
                      <svg
                        className="h-5 w-5 text-white mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinejoin="round"
                      >
                        <circle cx="10" cy="10" r="7"></circle>
                        <line x1="21" y1="21" x2="15" y2="15"></line>
                      </svg>
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div
            className="grid lg:grid-cols-5  sm:grid-cols-5 md:grid-cols-5 grid-cols-1  mt-5 "
            style={{
              display: "block",
              justifyContent: "center"
            }}
          >
            <div className="lg:col-span-4  md:col-span-4  sm:col-span-5 col-span-4  ">
              {loading ? (
                <div className="camera_loading">
                  <Image src={logo} alt="" className="loading_all_page" />
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="inline fixed top-20 right-0 bottom-0 left-0 m-auto lg:w-12 lg:h-12 md:w-12 md:h-12 sm:w-12 sm:h-12 w-10 h-10  text-green animate-spin dark:text-green fill-black"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only text-3xl">Loading...</span>
                  </div>
                </div>
              ) : (
                // <Loading />
                <div className="grid grid-cols-1  gap-5 ">
                  <div className="col-span-1 shadow-lg w-full ">
                    <div className="bg-green shadow-lg sticky top-0">
                      <h1
                        className="text-center text-xl text-white font-serif pb-2 pt-2"
                        style={{ fontWeight: "900" }}
                      >
                        Immobilizing Data
                      </h1>
                    </div>

                    <TableContainer component={Paper}>
                      <div>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                          <TableHead className="sticky top-0   font-bold">
                            <TableRow className=" text-white font-bold   ">
                              <TableCell
                                align="center"
                                className="border-r border-green  font-popins font-bold "
                                style={{ fontSize: "20px" }}
                              >
                                S.No
                              </TableCell>
                              <TableCell
                                align="center"
                                className="border-r border-green  font-popins font-bold "
                                style={{ fontSize: "20px" }}
                              >
                                Vehicle Reg
                              </TableCell>
                              <TableCell
                                align="center"
                                className="border-r border-green  font-popins font-bold "
                                style={{ fontSize: "20px" }}
                              >
                                Request DateTime
                              </TableCell>
                              <TableCell
                                align="center"
                                className="border-r border-green  font-popins font-bold "
                                style={{ fontSize: "20px" }}
                              >
                                Status
                              </TableCell>
                              {/* <TableCell
                                        align="center"
                                        className="border-r border-green text-center font-popins font-bold "
                                        style={{ fontSize: "20px" }}
                                      >
                                        Action
                                      </TableCell> */}
                            </TableRow>
                          </TableHead>
                          {filteredDataIsAvaialable === false ? (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                <p
                                  className="mt-10 font-bold"
                                  style={{ fontSize: "24px" }}
                                >
                                  No data found
                                </p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            <TableBody>
                              {records.map((item: any, index: any) => {
                                return (
                                  <TableRow
                                    key={index}
                                    className="cursor-pointer hover:bg-[#e2f6f0]"
                                  >
                                    <TableCell
                                      align="center"
                                      className="border-r border-green font-popins text-black font-normal"
                                      style={{
                                        fontSize: "16px",
                                        padding: "4px 8px"
                                      }}
                                    >
                                      {(currentPage - 1) * recordsPerPage +
                                        index +
                                        1}
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green font-popins text-black font-normal"
                                      style={{
                                        fontSize: "16px",
                                        padding: "2px 4px"
                                      }}
                                    >
                                      {item?.Label1}
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green font-popins text-black font-normal"
                                      style={{
                                        fontSize: "16px",
                                        padding: "4px 8px"
                                      }}
                                    >
                                      {
                                        item?.createdDate
                                        // new Date(
                                        //   item.createdDate
                                        // ).toLocaleString("en-US", {
                                        //   timeZone: session?.timezone
                                        // })
                                      }
                                      {/* {item?.createdAt?.split(".")[0].split("T").join(" ")} */}
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      className="border-r border-green font-popins text-black font-normal"
                                      style={{
                                        fontSize: "16px",
                                        padding: "2px 4px"
                                      }}
                                    >
                                      {item?.devicestatus}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          )}
                        </Table>
                      </div>
                    </TableContainer>

                    <div
                      className="flex  justify-end mt-8"
                      // style={{ position: "fixed", bottom: "1%" }}
                    >
                      <div className="grid lg:grid-cols-4 my-4 ">
                        <div className="col-span-1">
                          <p className="mt-1 text-labelColor text-end text-sm">
                            Total {filteredRecords.length} items
                          </p>
                        </div>
                        <div className="col-span-2 ">
                          <Stack spacing={2}>
                            <Pagination
                              count={totalCount}
                              page={input}
                              onChange={handleChange}
                              className="text-sm"
                              // siblingCount={-totalCount}
                            />
                          </Stack>
                        </div>
                        <div className="col-lg-1 mt-1">
                          <span className="text-sm">Go To</span>
                          <input
                            type="text"
                            className="w-14 border border-grayLight outline-green mx-2 px-2"
                            onChange={(e) => {
                              let inputValues: any =
                                e.target.value.match(/\d+/g);
                              if (inputValues > 0 && inputValues < totalCount) {
                                setInput(parseInt(e.target.value));

                                setCurrentPage(e.target.value);
                              } else {
                                setInput("");
                              }
                            }}
                          />
                          <span
                            className="text-labelColor text-sm"
                            // onClick={handleClickPagination}
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
      </div>
      <br></br>
      <br></br>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
