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
import { toast, Toaster } from "react-hot-toast";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";

import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import {
  postDriverDataByClientId,
  GetDriverDataByClientId,
} from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./inactiveDriver.css";
const style = {
  position: "absolute" as "absolute",
  top: "70%",
  left: "50%",
  transform: "translate(-50%,-100%)",
  width: 680,
  bgcolor: "background.paper",
  boxShadow: 24,
};

export default function DriverProfile() {
  const { data: session } = useSession();
  const [DriverData, setDriverData] = useState<pictureVideoDataOfVehicleT[]>(
    []
  );
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPages, setRowsPerPages] = React.useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [inputs, setInputs] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [isColor, setIsColor] = useState<any>(false);
  const [formData, setFormDate] = useState({
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
  const router = useRouter();
  const lastIndex = rowsPerPages * currentPage;
  const firstIndex = lastIndex - rowsPerPages;
  const result = DriverData.slice(firstIndex, lastIndex);
  const totalCount = DriverData.length / currentPage;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPages(event.target.value);
    setCurrentPage(1);
  };

  const handleChangeDriver = (key: any, e: any) => {
    setFormDate({ ...formData, [key]: e.target.value });
  };
  console.log("data", DriverData);
  const handleDriverSubmit = async (e: any) => {
    e.preventDefault();

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
    }
  };

  const vehicleListData = async () => {
    try {
      // setLaoding(true);
      if (session) {
        const response = await GetDriverDataByClientId({
          token: session?.accessToken,
          clientId: session?.clientId,
        });
        setDriverData(response.filter((item: any) => item.isDeleted === true));
      }
      // setLaoding(false);
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };
  useEffect(() => {
    vehicleListData();
  }, []);

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
            success: "User successfully Active!",
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

  return (
    <div>
      <p className="bg-green px-4 py-1 border-t border-bgLight text-black text-center text-2xl text-white font-bold font-popins">
        InActive Drivers List
      </p>
      <Paper>
        <div className="grid lg:grid-cols-12 md:grid-cols-2  sm:grid-cols-2  p-4  bg-bgLight">
          <div className="lg:col-span-10 md:grid-col-span-1 sm:grid-col-span-1 lg:mb-0 flex lg: justify-center sm:justify-start mb-4 ">
            {/* <button className="bg-green px-4 py-1  text-white rounded-md">
              Active Driver
            </button> */}

            <button
              className="bg-red px-4 py-1  text-white rounded-md font-popins font-bold"
              onClick={() => router.push("DriverProfile")}
            >
              Cancel
            </button>
          </div>

          {/* <div
            className="lg:col-span-2 md:grid-col-span-1 sm:grid-col-span-1 border-b border-grayLight  text-center "
            id="hover_bg"
          >
            <div className="grid grid-cols-12">
              <div className="col-span-1">
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
              <div className="col-span-10">
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
          </div> */}
        </div>

        <TableContainer component={Paper}>
          <Table aria-label="custom pagination table">
            <TableHead className="sticky top-0 bg-white z-10">
              <TableRow>
                {/* <TableCell align="center" colSpan={2}>
                  <input
                    type="checkbox"
                    className="w-4 h-4 "
                    checked={isColor}
                    onChange={handleChangeCheckbox}
                  />
                </TableCell> */}
                <TableCell
                  align="center"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                  id="table_head_inactive"
                >
                  S.NO
                </TableCell>
                <TableCell
                  align="center"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                  id="table_head_inactive"
                >
                  First Name
                </TableCell>
                <TableCell
                  align="center"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                  id="table_head_inactive"
                >
                  Last Name
                </TableCell>
                <TableCell
                  align="center"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                  id="table_head_inactive"
                >
                  Driver ID
                </TableCell>
                <TableCell
                  align="center"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                  id="table_head_inactive"
                >
                  Driver Contact.NO
                </TableCell>
                <TableCell
                  align="center"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                  id="table_head_inactive"
                >
                  RFID Card
                </TableCell>
                <TableCell
                  align="center"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                  id="table_head_inactive"
                >
                  Address
                </TableCell>
                {/* <TableCell align="center" colSpan={2}>
                  Driver Availaibilty
                </TableCell> */}
                <TableCell
                  align="center"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                  id="table_head_inactive"
                >
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  className="font-popins  font-bold text-black"
                  colSpan={2}
                  id="table_head_inactive"
                >
                  Actions
                </TableCell>{" "}
              </TableRow>
            </TableHead>
            <TableBody className="bg-bgLight cursor-pointer ">
              {result.map((row: any, index: any) => (
                <TableRow
                  className="hover:bg-bgHoverTabel"
                  // style={{ backgroundColor: isColor == "on" ? "gray" : "" }}
                >
                  {/* <TableCell align="center" colSpan={2}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 "
                      style={{ accentColor: "green" }}
                      checked={isColor}
                      onClick={handleChangeCheckbox}
                    />
                  </TableCell> */}

                  {/* <TableCell align="center" colSpan={2}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 "
                      style={{ accentColor: "green" }}
                      checked={isColor}
                      onClick={handleChangeCheckbox}
                    />
                  </TableCell> */}
                  <TableCell
                    align="center"
                    colSpan={2}
                    className="
                  table_text_inactive"
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    className="
                  table_text_inactive"
                  >
                    {row.driverfirstName}
                  </TableCell>

                  <TableCell
                    align="center"
                    colSpan={2}
                    className="
                  table_text_inactive"
                  >
                    {row.driverLastName}
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    className="
                  table_text_inactive"
                  >
                    {row.driverIdNo}
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    className="
                  table_text_inactive"
                  >
                    {row.driverContact}
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    className="
                  table_text_inactive"
                  >
                    {row.driverRFIDCardNumber}
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    className="
                  table_text_inactive"
                  >
                    {row.driverAddress1}
                  </TableCell>

                  {/* <TableCell align="center" colSpan={2}>
                    {row.isAvailable === true ? "Available" : "Not Available"}
                  </TableCell> */}

                  <TableCell
                    align="center"
                    colSpan={2}
                    className="
                  table_text_inactive"
                  >
                    {row.isDeleted === true ? "InActive" : "Active"}
                  </TableCell>
                  <TableCell
                    align="center"
                    colSpan={2}
                    className="
                  table_text_inactive"
                  >
                    {row.isDeleted ? (
                      <button
                        className="text-green hover:border-green border-b border-bgLight"
                        onClick={() => handleActive(row)}
                      >
                        Active
                      </button>
                    ) : (
                      <button
                        className="text-green hover:border-green border-b border-bgLight"
                        onClick={() => handleDelete(row)}
                      >
                        InActive
                      </button>
                    )}
                    {/* <button
                        onClick={() => handleDelete(row.id)}
                        className="bg-red text-white text-sm px-2 py-1 shadow-lg" 
                      >
                        Active
                      </button> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* <div
        className="grid grid-cols-12"
        style={{
          display: "flex",

          justifyContent: "end",
          alignItems: "end",
        }}
      >
        <div className="col-span-2 mx-6 my-2 text-white ">
          <button className="bg-green p-2 px-4 shadow-lg">Active</button>
        </div>
      </div> */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        style={{
          display: "flex",
          justifyContent: "end",
          alignItems: "end",
        }}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPages}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        className="bg-bgLight"
      />
    </div>
  );
}
