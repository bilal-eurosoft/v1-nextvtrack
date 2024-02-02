"use client";
import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import toast, { Toaster } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import MenuItem from "@mui/material/MenuItem";
import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import "./driver.css";
import {
  postDriverDataByClientId,
  GetDriverDataByClientId,
  GetRfIdByClientId,
} from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { MenuList, Select } from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-100%)",
  // width: 680,
  bgcolor: "background.paper",
  boxShadow: 24,
};

export default function DriverProfile() {
  const { data: session } = useSession();
  const [DriverData, setDriverData] = useState<pictureVideoDataOfVehicleT[]>(
    []
  );
  const router = useRouter();
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPages, setRowsPerPages] = React.useState(11);
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [inputs, setInputs] = useState("");
  const [selectedData, setSelectedData] = useState<any>(null);
  const [getRfid, setRfid] = useState([]);
  const [selectedRFID, setSelectedRFID] = useState("");
  const [inactiveRFIDs, setInactiveRFIDs] = useState<any>([]);
  const handleClose = () => {
    setOpen(false);
    setShowCardNumber(false);
    setFormData({
      id: "",
      clientId: "61e6d00fd9cc7102ac6464a3",
      driverNo: "",
      driverfirstName: "",
      driverMiddleName: "",
      driverLastName: "",
      driverContact: "",
      driverIdNo: "",
      driverAddress1: "",
      driverAddress2: "",
      driverRFIDCardNumber: "",
      isAvailable: "",
    });
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setShowCardNumber(false);
  };
  const [formData, setFormData] = useState<any>({
    id: "",
    clientId: "61e6d00fd9cc7102ac6464a3",
    driverNo: "",
    driverfirstName: "",
    driverMiddleName: "",
    driverLastName: "",
    driverContact: "",
    driverIdNo: "",
    driverAddress1: "",
    driverAddress2: "",
    driverRFIDCardNumber: "",
    isAvailabl: "",
  });

  const handleEdit = (id: any) => {
    setOpenEdit(true);
    const filterData: any = DriverData.find((item: any) => item.id == id);
    setSelectedData(filterData);
  };

  const [singleFormData, setSingleFormData] = useState<any>({
    id: "",
    clientId: "61e6d00fd9cc7102ac6464a3",
    driverNo: "",
    driverfirstName: "",
    driverMiddleName: "",
    driverLastName: "",
    driverContact: "",
    driverIdNo: "",
    driverAddress1: "",
    driverAddress2: "",
    driverRFIDCardNumber: "",
    isAvailabl: false,
  });

  useEffect(() => {
    if (selectedData) {
      setSingleFormData({
        id: selectedData.id,
        clientId: "61e6d00fd9cc7102ac6464a3",
        driverNo: selectedData.driverNo,
        driverfirstName: selectedData.driverfirstName,
        driverMiddleName: selectedData.driverMiddleName,
        driverLastName: selectedData.driverLastName,
        driverContact: selectedData.driverContact,
        driverIdNo: selectedData.driverIdNo,
        driverAddress1: selectedData.driverAddress1,
        driverAddress2: selectedData.driverAddress2,
        driverRFIDCardNumber: selectedData.driverRFIDCardNumber,
        isAvailable: selectedData.isAvailable,
      });
    }
  }, [selectedData]);

  // Rest of your component code...

  const handleOpen = () => {
    setOpen(true);
  };

  // const lastIndex = rowsPerPages * currentPage;
  // const firstIndex = currentPage * rowsPerPages + rowsPerPages;
  const filteredData: any = DriverData?.filter((item: any) => {
    if (item === "") {
      return item;
    } else if (
      // item.driverMiddleName?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverfirstName?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverLastName?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverContact?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverIdNo?.toLowerCase().includes(inputs.toLowerCase()) ||
      item.driverAddress1?.toLowerCase().includes(inputs.toLowerCase())
      // item.driverRFIDCardNumber.toLowerCase().includes(inputs.toLowerCase())
    ) {
      return item;
    }
    return false;
  });
  const startIndexs: any = currentPage * rowsPerPages;
  const endIndex: any = startIndexs + rowsPerPages;
  const result = filteredData.slice(startIndexs, endIndex);
  // const result: any = filteredData.slice(
  //   rowsPerPages * currentPage,
  //   currentPage * rowsPerPages + rowsPerPages
  // );

  console.log("driver Data", DriverData);
  console.log("rfid", inactiveRFIDs);
  const totalCount = DriverData.length / currentPage;

  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPages(+event.target.value);
    setCurrentPage(0);
  };

  const handleChangeDriver = (key: any, e: any) => {
    setFormData({ ...formData, [key]: e?.target?.value?.trim() });
    setSelectedRFID(e.target.value);
  };

  const handleEditDriver = (key: any, e: any) => {
    setSelectedData({ ...singleFormData, [key]: e.target.value.trim() });
  };

  const id: any = selectedData?._id;

  const handleDriverEditedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payLoad: any = {
      id: selectedData.id,
      driverNo: selectedData.driverNo,
      driverfirstName: selectedData.driverfirstName,
      driverMiddleName: selectedData.driverMiddleName,
      driverLastName: selectedData.driverLastName,
      driverContact: selectedData.driverContact,
      driverIdNo: selectedData.driverIdNo,
      driverAddress1: selectedData.driverAddress1,
      driverAddress2: selectedData.driverAddress2,
      driverRFIDCardNumber: selectedData.driverRFIDCardNumber,
      isAvailabl: selectedData.isAvailable,
    };

    try {
      if (session) {
        const newformdata = {
          ...payLoad,
          clientId: session?.clientId,
        };

        const response = await toast.promise(
          postDriverDataByClientId({
            token: session?.accessToken,
            newformdata: newformdata,
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
        vehicleListData();
        console.log("driver", vehicleListData());
      }
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
    setOpenEdit(false);
  };

  const handleDriverSubmit = async (e: any) => {
    e.preventDefault();
    const existingDriver = DriverData.find(
      (driver: any) => driver.driverNo === formData.driverNo
    );
    if (existingDriver) {
      alert("This Driver Number Is Already Exit");
    } else {
      // if (!formData.driverfirstName) {
      //   alert("please Fill The First Name");
      // }

      // if (!formData.driverLastName) {
      //   alert("please Fill The Last Name");
      // }

      // if (!formData.driverNo) {
      //   alert("please Fill The Last Name");
      // }

      setOpen(false);
      if (session) {
        const newformdata: any = {
          ...formData,
          clientId: session?.clientId,
        };

        const response = await toast.promise(
          postDriverDataByClientId({
            token: session?.accessToken,
            newformdata: newformdata,
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
        vehicleListData();
      }

      setFormData({
        id: "",
        clientId: "61e6d00fd9cc7102ac6464a3",
        driverNo: "",
        driverfirstName: "",
        driverMiddleName: "",
        driverLastName: "",
        driverContact: "",
        driverIdNo: "",
        driverAddress1: "",
        driverAddress2: "",
        driverRFIDCardNumber: "",
        isAvailable: "",
      });
    }
  };

  const vehicleListData = async () => {
    try {
      if (session) {
        const response = await GetDriverDataByClientId({
          token: session?.accessToken,
          clientId: session?.clientId,
        });
        setDriverData(response.filter((item: any) => item.isDeleted === false));
      }
      // setLaoding(false);
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  const RFid = async () => {
    try {
      if (session) {
        const response = await GetRfIdByClientId({
          token: session?.accessToken,
          ClientId: session?.clientId,
        });
        setRfid(response.data || []);
      }
      // setLaoding(false);
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  useEffect(() => {
    vehicleListData();
    RFid();
  }, [session]);

  useEffect(() => {
    // Load state from localStorage when the component mounts
    const savedInactiveRFIDs = localStorage.getItem("inactiveRFIDs");
    if (savedInactiveRFIDs) {
      setInactiveRFIDs(JSON.parse(savedInactiveRFIDs));
    }
  }, []);

  useEffect(() => {
    if (inactiveRFIDs.length > 0) {
      localStorage.setItem("inactiveRFIDs", JSON.stringify(inactiveRFIDs));
    } else {
      // Optionally, you can remove the item from local storage if the array is empty
      localStorage.removeItem("inactiveRFIDs");
    }
  }, [inactiveRFIDs]);

  const handleSearch = (event: any) => {
    const newSearchTerm = event.target.value;
    setInputs(newSearchTerm);
  };
  const handleCloseInput = () => {
    setInputs("");
  };
  const handleDelete = async (data: any) => {
    const payLoad: any = {
      id: data.id,
      driverNo: data.driverNo,
      driverfirstName: data.driverfirstName,
      driverMiddleName: data.driverMiddleName,
      driverLastName: data.driverLastName,
      driverContact: data.driverContact,
      driverIdNo: data.driverIdNo,
      driverAddress1: data.driverAddress1,
      driverAddress2: data.driverAddress2,
      driverRFIDCardNumber: data.driverRFIDCardNumber,
      isAvailable: data.isAvailable,
      isDeleted: true,
    };

    try {
      if (session) {
        const newformdata = {
          ...payLoad,
          clientId: session?.clientId,
        };

        const response = await toast.promise(
          postDriverDataByClientId({
            token: session?.accessToken,
            newformdata: newformdata,
          }),
          {
            loading: "Saving data...",
            success: "User successfully InActive!",
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
        vehicleListData();
      }
    } catch (e) {}
    // await vehicleListData();
    // console.log("Updated Data from API:", updatedData);
  };

  const handleActive = async (data: any) => {
    const payLoad: any = {
      id: data.id,
      driverNo: data.driverNo,
      driverfirstName: data.driverfirstName,
      driverMiddleName: data.driverMiddleName,
      driverLastName: data.driverLastName,
      driverContact: data.driverContact,
      driverIdNo: data.driverIdNo,
      driverAddress1: data.driverAddress1,
      driverAddress2: data.driverAddress2,
      driverRFIDCardNumber: data.driverRFIDCardNumber,
      isAvailable: data.isAvailable,
      isDeleted: false,
    };

    try {
      if (session) {
        const newformdata = {
          ...payLoad,
          clientId: session?.clientId,
        };

        const response = await toast.promise(
          postDriverDataByClientId({
            token: session?.accessToken,
            newformdata: newformdata,
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
        vehicleListData();
      }
    } catch (e) {}
    // await vehicleListData();
    // console.log("Updated Data from API:", updatedData);
  };

  const handleInactiveClick = () => {
    if (selectedRFID) {
      setInactiveRFIDs((prevInactiveRFIDs: any) => [
        ...prevInactiveRFIDs,
        getRfid?.find((rfid: any) => rfid?.RFIDCardNo === selectedRFID),
      ]);
      setSelectedRFID("");
    }
  };
  const handleActivateClick = (rfid: any) => {
    setInactiveRFIDs((prevInactiveRFIDs: any) =>
      prevInactiveRFIDs.filter(
        (item: any) => item?.RFIDCardNo !== rfid?.RFIDCardNo
      )
    );
  };
  const handleNoEdit = () => {
    toast.error("Please Driver UnAssign", {
      duration: 3000, // Toast will be shown for 3 seconds
    });
  };

  console.log("drivers", DriverData);
  const test = 20;
  return (
    <div>
      {data.map((item: any, index) => {
        return (
          <div key={index}>
            <p>{item.driverfirstName}</p>
          </div>
        );
      })}
      <Toaster />
      {/* {getRfid.map((item: any) => {
        return <p>{item.RFIDCardNo}</p>;
      })} */}
      <p className="bg-green px-4 py-1 border-t border-bgLight text-black text-center text-2xl text-white font-bold font-popins">
        Driver Profile
      </p>
      <Paper>
        <div className="grid xl:grid-cols-12 lg:grid-cols-12 md:grid-cols-12  sm:grid-cols-2  p-4  bg-bgLight">
          <div className="xl:col-span-8 lg:col-span-6 md:col-span-6 sm:col-span-1 lg:mb-0  ">
            <button
              onClick={handleOpen}
              className="bg-green px-4 py-1  text-white rounded-md font-popins font-bold"
            >
              Add New Driver
            </button>

            <button
              onClick={() => router.push("http://localhost:3010/ActiveDriver")}
              className="bg-red px-4 py-1 mx-3  text-white rounded-md font-popins font-bold"
            >
              InActive Driver List
            </button>
          </div>
          <div
            className="xl:col-span-2 lg:col-span-3 md:col-span-4 sm:grid-col-span-1   text-center"
            // id="hover_bg"
          >
            <h1
              style={{ fontSize: "19px" }}
              className=" font-popins font-bold text-green pt-2"
            >
              Total Active Drivers: {DriverData.length}
            </h1>
          </div>
          <div
            className="xl:col-span-2  lg:col-span-3 md:col-span-2 sm:grid-col-span-1 border-b border-grayLight  text-center"
            id="hover_bg"
          >
            <div className="grid grid-cols-12">
              <div className="xl:col-span-1 lg:col-span-2 md:col-span-2">
                <svg
                  className="h-5  w-5 text-gray mt-1"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <circle cx="10" cy="10" r="7" />{" "}
                  <line x1="21" y1="21" x2="15" y2="15" />
                </svg>
              </div>
              <div className="xl:col-span-10 lg:col-span-9 md:col-span-9">
                <input
                  type="text"
                  className=" border-none outline-none bg-transparent "
                  placeholder="Seacrch"
                  onChange={handleSearch}
                  value={inputs}
                />
              </div>
              <div
                className="col-span-1 cursor-pointer"
                onClick={handleCloseInput}
              >
                <svg
                  className="h-5 w-5 text-gray mt-1"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <line x1="18" y1="6" x2="6" y2="18" />{" "}
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={handleClose}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={open}>
            <Box sx={style} className="popup_style">
              <Typography
                id="transition-modal-title"
                variant="h6"
                component="h2"
                className="text-black"
              >
                <div className="grid grid-cols-12 bg-green">
                  <div className="col-span-11">
                    <p className="p-3 text-white w-full font-popins font-bold ">
                      Add Driver
                    </p>
                  </div>
                  <div className="col-span-1" onClick={handleClose}>
                    <svg
                      className="h-6 w-6 text-labelColor mt-3 cursor-pointer"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {" "}
                      <path stroke="none" d="M0 0h24v24H0z" />{" "}
                      <line x1="18" y1="6" x2="6" y2="18" />{" "}
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                </div>
              </Typography>
              <form onSubmit={handleDriverSubmit}>
                <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                  <div className="grid grid-cols-12 mx-2 ">
                    <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2">
                      <label className="text-sm text-black font-popins font-medium">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.driverfirstName}
                        className="border border-grayLight w-full outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) =>
                          handleChangeDriver("driverfirstName", e)
                        }
                      />
                    </div>
                    <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2">
                      <label className="text-sm text-black font-popins font-medium">
                        <span className="text-red">*</span> Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.driverLastName}
                        className="border border-grayLight w-full  outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) =>
                          handleChangeDriver("driverLastName", e)
                        }
                      />
                    </div>
                    <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2">
                      <label className="text-sm text-black font-popins font-medium">
                        Driver Number
                      </label>
                      <input
                        value={formData.driverNo}
                        type="text"
                        className="border border-grayLight w-full  outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) => handleChangeDriver("driverNo", e)}
                      />
                    </div>
                    <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2">
                      <label className="text-sm text-black font-popins font-medium">
                        ID Number
                      </label>
                      <input
                        type="text"
                        value={formData.driverIdNo}
                        className="border border-grayLight w-full outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) =>
                          handleChangeDriver("driverIdNo", e)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 m-2  ">
                    <div className="lg:col-span-6 md:col-span-6 col-span-6   mx-2">
                      <label className="text-sm text-black font-popins font-medium">
                        Address 1
                      </label>
                      <br></br>
                      <textarea
                        value={formData.driverAddress1}
                        className="w-full border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out h-16 "
                        onChange={(e: any) =>
                          handleChangeDriver("driverAddress1", e)
                        }
                      ></textarea>
                    </div>
                    <div className="lg:col-span-4 md:col-span-4 col-span-6 mx-2 ">
                      <div
                        className="grid grid-cols-12  "
                        // style={{ display: "flex", justifyContent: "start" }}
                      >
                        <div className="lg:col-span-3 col-span-1 w-full ">
                          <label className="text-sm text-black font-popins font-medium ">
                            RFID
                            <input
                              type="checkbox"
                              onClick={() => setShowCardNumber(!showCardNumber)}
                              style={{ accentColor: "green" }}
                              className="border border-green  outline-green  cursor-pointer  ms-2 "
                            />
                          </label>
                        </div>
                        {showCardNumber ? (
                          <div
                            className="lg:col-span-12 col-span-12 -mt-2"
                            style={{ width: "100%" }}
                          >
                            <label className="text-sm text-black font-popins font-medium">
                              Card Number
                            </label>
                            <br></br>
                            {/* <input
                          type="text"
                          value={formData.driverRFIDCardNumber}
                          className="border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out "
                          onChange={(e: any) =>
                            handleChangeDriver("driverRFIDCardNumber", e)
                          }
                        /> */}
                            <Select
                              onChange={(e: any) =>
                                handleChangeDriver("driverRFIDCardNumber", e)
                              }
                              value={selectedRFID}
                              style={{ width: "100%" }}
                              className="h-6 "
                            >
                              {getRfid
                                .filter(
                                  (rfid: any) =>
                                    !inactiveRFIDs.find(
                                      (inactive: any) =>
                                        inactive?.RFIDCardNo ===
                                        rfid?.RFIDCardNo
                                    )
                                )
                                .map((item: any) => (
                                  <MenuItem
                                    key={item?.RFIDCardNo}
                                    value={item?.RFIDCardNo}
                                  >
                                    {item?.RFIDCardNo}
                                  </MenuItem>
                                ))}

                              {/* .map((item: any) => (
                            <MenuItem
                              key={item?.RFIDCardNo}
                              value={item?.RFIDCardNo}
                            >
                              {item?.RFIDCardNo}
                            </MenuItem>
                          ))} */}
                            </Select>
                            {/* <button onClick={handleInactiveClick}>
                              Active
                            </button>

                            <div>
                              <h3>Inactive RFIDs:</h3>
                              <ul>
                                {inactiveRFIDs.map((rfid: any) => (
                                  <li key={rfid.RFIDCardNo}>
                                    {rfid?.RFIDCardNo}{" "}
                                    <button
                                      onClick={() => handleActivateClick(rfid)}
                                    >
                                      InActive
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div> */}
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="lg:col-span-2 md:col-span-2 col-span-4  px-3 lg:-mt-0 md:-mt-0 sm:-mt-0  -mt-8">
                      <button
                        className="bg-green text-white font-bold font-popins  w-full  py-2 rounded-sm"
                        type="submit"
                        // disabled={}
                        style={{
                          float: "right",
                          marginTop: "40%",
                          cursor:
                            formData.driverfirstName.trim() === "" ||
                            formData.driverLastName.trim() === "" ||
                            formData.driverNo.trim() === ""
                              ? "not-allowed"
                              : "",
                        }}
                        disabled={
                          formData.driverfirstName.trim() === "" ||
                          formData.driverLastName.trim() === "" ||
                          formData.driverNo.trim() === ""
                            ? true
                            : false
                        }
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </Typography>
              </form>
            </Box>
          </Fade>
        </Modal>

        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={openEdit}
          onClose={handleCloseEdit}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={openEdit}>
            <Box sx={style} className="popup_style">
              <Typography
                id="transition-modal-title"
                variant="h6"
                component="h2"
                className="text-black"
              >
                <div className="grid grid-cols-12 bg-green">
                  <div className="col-span-11">
                    <p className="  p-3 text-white w-full font-popins font-bold w-full ">
                      Edit Driver
                    </p>
                  </div>
                  <div className="col-span-1">
                    <svg
                      className="h-6 w-6 text-labelColor mt-3"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {" "}
                      <path stroke="none" d="M0 0h24v24H0z" />{" "}
                      <line x1="18" y1="6" x2="6" y2="18" />{" "}
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                </div>
              </Typography>
              <form onSubmit={handleDriverEditedSubmit}>
                <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                  <div
                    className="grid grid-cols-12 m-6 mt-8 gap-1 "
                    // style={{ display: "flex", justifyContent: "center" }}
                  >
                    <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2 ">
                      <label className="text-sm text-black font-popins font-medium">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={singleFormData.driverfirstName}
                        className="border border-grayLight w-full  outline-green hover:border-green px-2 transition duration-700 ease-in-out "
                        onChange={(e: any) =>
                          handleEditDriver("driverfirstName", e)
                        }
                      />
                    </div>
                    <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2 ">
                      {/* <label className="text-sm text-labelColor">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={singleFormData.driverMiddleName}
                        className="border border-grayLight w-full outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) =>
                          handleEditDriver("driverMiddleName", e)
                        }
                      /> */}
                      <label className="text-sm text-black font-popins font-medium">
                        <span className="text-red">*</span> Last Name
                      </label>
                      <input
                        type="text"
                        value={singleFormData.driverLastName}
                        className="border px-2 border-grayLight w-full  outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) =>
                          handleEditDriver("driverLastName", e)
                        }
                      />
                    </div>
                    <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2 ">
                      <label className="text-sm text-black font-popins font-medium">
                        Driver Number
                      </label>
                      <input
                        value={singleFormData.driverNo}
                        type="text"
                        className="border px-2 border-grayLight  w-full outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) => handleEditDriver("driverNo", e)}
                      />
                    </div>
                    <div className="lg:col-span-3 md:col-span-3 col-span-6 mx-2 ">
                      <label className="text-sm text-black font-popins font-medium">
                        ID Number
                      </label>
                      <input
                        type="text"
                        value={singleFormData.driverIdNo}
                        className="border px-2 border-grayLight w-full outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) => handleEditDriver("driverIdNo", e)}
                      />
                    </div>
                  </div>

                  {/* <div
                    className="grid grid-cols-12 m-6 mt-8 gap-8 "
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <div className="lg:col-span-3 col-span-1 ">
                      <label className="text-sm text-labelColor">
                        Driver Number
                      </label>
                      <input
                        value={singleFormData.driverNo}
                        type="text"
                        className="border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) => handleEditDriver("driverNo", e)}
                      />
                    </div>
                    <div className="lg:col-span-3 col-span-1 ">
                      <label className="text-sm text-labelColor">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={singleFormData.driverContact}
                        className="border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) =>
                          handleEditDriver("driverContact", e)
                        }
                      />
                    </div>
                    <div className="lg:col-span-3 col-span-1 ">
                      <label className="text-sm text-labelColor">
                        ID Number
                      </label>
                      <input
                        type="text"
                        value={singleFormData.driverIdNo}
                        className="border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out "
                        onChange={(e: any) => handleEditDriver("driverIdNo", e)}
                      />
                    </div>
                  </div> */}
                  <div className="grid grid-cols-12 m-6 mt-2 gap-4 ">
                    <div className="lg:col-span-6 md:col-span-6 col-span-6   mx-2 ">
                      <label className="text-sm text-black font-popins font-medium">
                        Address
                      </label>
                      <br></br>
                      <textarea
                        value={singleFormData.driverAddress1}
                        className="w-full border border-grayLight  outline-green hover:border-green w-full transition duration-700 ease-in-out h-16 "
                        onChange={(e: any) =>
                          handleEditDriver("driverAddress1", e)
                        }
                      ></textarea>
                    </div>
                    {/* <div className="col-span-4">
                      <div
                        className="grid grid-cols-12   gap-4 "
                      >
                        {showCardNumber ? (
                          <div className="lg:col-span-8 col-span-1 ">
                            <label className="text-sm text-labelColor">
                              Card Number
                            </label>
                            <br></br>
                            <input
                              type="text"
                              value={singleFormData.driverRFIDCardNumber}
                              className="border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out "
                              onChange={(e: any) =>
                                handleEditDriver("driverRFIDCardNumber", e)
                              }
                            />
                          </div>
                        ) : (
                          ""
                        )}
                        <div className="lg:col-span-1 col-span-1 ">
                          <label className="text-sm text-labelColor ">
                            RFID
                            <input
                              type="checkbox"
                              onClick={() => setShowCardNumber(!showCardNumber)}
                              style={{ accentColor: "green" }}
                              className="border border-green  outline-green  cursor-pointer  ms-2"
                            />
                          </label>
                        </div>
                      </div>
                    </div> */}
                    <div className="lg:col-span-4 md:col-span-4 col-span-6 mx-2 ">
                      <div
                        className="grid grid-cols-12  "
                        // style={{ display: "flex", justifyContent: "start" }}
                      >
                        <div className="lg:col-span-3 col-span-1 w-full ">
                          <label className="text-sm text-black font-popins font-medium ">
                            RFID
                            <input
                              type="checkbox"
                              onClick={() => setShowCardNumber(!showCardNumber)}
                              style={{ accentColor: "green" }}
                              className="border border-green  outline-green  cursor-pointer  ms-2 "
                            />
                          </label>
                        </div>
                        {showCardNumber ? (
                          <div
                            className="lg:col-span-11 col-span-12 -mt-2"
                            style={{ width: "100%" }}
                          >
                            <label className="text-sm text-black font-popins font-medium">
                              Card Number
                            </label>
                            <br></br>
                            {/* <input
                          type="text"
                          value={formData.driverRFIDCardNumber}
                          className="border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out "
                          onChange={(e: any) =>
                            handleChangeDriver("driverRFIDCardNumber", e)
                          }
                        /> */}
                            {showCardNumber ? (
                              <div className="lg:col-span-8 col-span-1 ">
                                <input
                                  type="text"
                                  value={singleFormData.driverRFIDCardNumber}
                                  className="border px-2 w-full border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out "
                                  onChange={(e: any) =>
                                    handleEditDriver("driverRFIDCardNumber", e)
                                  }
                                />
                              </div>
                            ) : (
                              ""
                            )}
                            {/* <button onClick={handleInactiveClick}>
                              Active
                            </button>

                            <div>
                              <h3>Inactive RFIDs:</h3>
                              <ul>
                                {inactiveRFIDs.map((rfid: any) => (
                                  <li key={rfid.RFIDCardNo}>
                                    {rfid?.RFIDCardNo}{" "}
                                    <button
                                      onClick={() => handleActivateClick(rfid)}
                                    >
                                      InActive
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div> */}
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-2 md:col-span-2 col-span-6   lg:-mt-0 md:-mt-0 sm:-mt-0  -mt-8  ">
                      {/* <label className="text-sm text-labelColor">
                        Address 2
                      </label>
                      <br></br>
                      <textarea
                        value={singleFormData.driverAddress2}
                        className="w-full border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out h-20 "
                        onChange={(e: any) =>
                          handleEditDriver("driverAddress2", e)
                        }
                      ></textarea> */}
                      <button
                        style={{ float: "right" }}
                        className="bg-green text-white font-popins w-full font-bold lg:mt-12 mt-6  py-2 rounded-sm"
                        type="submit"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </Typography>
              </form>
            </Box>
          </Fade>
        </Modal>
        {inactiveRFIDs.map((rfid: any) => (
          <li key={rfid.RFIDCardNo}>
            {rfid?.RFIDCardNo}{" "}
            {/* <button onClick={() => handleActivateClick(rfid)}>InActive</button> */}
          </li>
        ))}
        <TableContainer component={Paper}>
          <Table aria-label="custom pagination table">
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={2}
                  id="table_head"
                  className="font-popins  font-bold text-black"
                >
                  S.NO
                </TableCell>
                <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                >
                  First Name
                </TableCell>
                {/* <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                >
                  Middle Name
                </TableCell> */}
                <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                >
                  Last Name
                </TableCell>
                <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                >
                  Driver ID
                </TableCell>
                <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                >
                  Driver Contact N.O
                </TableCell>
                <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                >
                  RFID Card
                </TableCell>
                <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                >
                  Address
                </TableCell>
                {/* <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                >
                  Address 2
                </TableCell> */}
                <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                >
                  Availaibilty
                </TableCell>
                <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                >
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  id="table_head"
                  className="font-popins  font-bold text-black "
                  colSpan={2}
                >
                  Actions
                </TableCell>{" "}
              </TableRow>
            </TableHead>
            <TableBody className="bg-bgLight cursor-pointer ">
              {result
                .filter((row: any) => row.isDeleted === false)
                ?.map((row: any, index) => (
                  <TableRow className="hover:bg-bgHoverTabel text-black">
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {index + 1}
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {row.driverfirstName}
                    </TableCell>
                    {/* <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {row.driverMiddleName}
                    </TableCell> */}
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {row.driverLastName}
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {row.driverIdNo}
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {row.driverNo}
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {inactiveRFIDs
                        .filter((rfid: any) => rfid.driverId === row.id)
                        .map((rfid: any) => (
                          <li key={rfid.RFIDCardNo}>{rfid?.RFIDCardNo}</li>
                        ))}
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {row.driverAddress1}
                    </TableCell>
                    {/* <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {row.driverAddress2}
                    </TableCell> */}
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {row.isAvailable === true ? "UnAssign" : "Assign"}
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {row.isDeleted === true ? "InActive" : "Active"}
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      className="table_text"
                    >
                      {row.isAvailable === true ? (
                        <button
                          className="text-white bg-green p-1 rounded-md shadow-md hover:shadow-gray transition duration-500 "
                          onClick={() => handleEdit(row.id)}
                        >
                          <BorderColorIcon className="" />
                        </button>
                      ) : (
                        <button
                          className="text-white bg-green p-1 rounded-md shadow-md hover:shadow-gray transition duration-500 "
                          onClick={handleNoEdit}
                        >
                          <BorderColorIcon className="" />
                        </button>
                      )}{" "}
                      &nbsp;&nbsp;{" "}
                      {/* <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red  text-sm px-2 hover:border-red border-b border-bgLight"
                      >
                        InActive
                      </button> */}
                      {row.isDeleted ? (
                        <button
                          className="text-green hover:border-green border-b border-bgLight"
                          onClick={() => handleActive(row)}
                        >
                          Active
                        </button>
                      ) : (
                        <button
                          className="text-red hover:border-red border-b border-bgLight"
                          onClick={() => handleDelete(row)}
                        >
                          InActive
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        // style={{
        //   display: "flex",
        //   justifyContent: "end",
        //   alignItems: "end",
        // }}
        component="div"
        count={DriverData.length}
        rowsPerPage={rowsPerPages}
        page={currentPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        className="bg-bgLight"
      />
    </div>
  );
}
