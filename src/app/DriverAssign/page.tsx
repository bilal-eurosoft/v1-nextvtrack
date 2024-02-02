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
import Button from "@mui/material/Button";
import { toast } from "react-hot-toast";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import {
  GetDriverDataByClientId,
  GetDriverDataAssignByClientId,
  postDriverDataAssignByClientId,
  GetDriverforvehicel,
  postDriverDeDataAssignByClientId,
} from "@/utils/API_CALLS";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { vehicleListByClientId } from "@/utils/API_CALLS";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import "./assign.css";
interface Column {
  id: "name" | "code" | "population" | "size" | "density";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: "name", label: "Driver Number", minWidth: 170 },
  { id: "code", label: "Fisrt Name", minWidth: 100 },
  {
    id: "population",
    label: "Middle Name",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "size",
    label: "Last Name",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toLocaleString("en-US"),
  },
  {
    id: "density",
    label: "Driver Id",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(2),
  },
  {
    id: "density",
    label: "Driver Contact",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(2),
  },

  {
    id: "density",
    label: "Driver Card",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(2),
  },

  {
    id: "density",
    label: "Driver Address 1",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(2),
  },

  {
    id: "density",
    label: "Driver Address 2",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(2),
  },

  {
    id: "density",
    label: "Driver Aviability",
    minWidth: 170,
    align: "right",
    format: (value: number) => value.toFixed(2),
  },
];
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 50,
    },
  },
};
interface Data {
  name: string;
  code: string;
  population: number;
  size: number;
  density: number;
}

function createData(
  name: string,
  code: string,
  population: number,
  size: number
): Data {
  const density = population / size;
  return { name, code, population, size, density };
}

const rows = [
  createData("India", "IN", 1324171354, 3287263),
  // createData('China', 'CN', 1403500365, 9596961),
  // createData('Italy', 'IT', 60483973, 301340),
  // createData('United States', 'US', 327167434, 9833520),
  // createData('Canada', 'CA', 37602103, 9984670),
  // createData('Australia', 'AU', 25475400, 7692024),
  // createData('Germany', 'DE', 83019200, 357578),
  // createData('Ireland', 'IE', 4857000, 70273),
  // createData('Mexico', 'MX', 126577691, 1972550),
  // createData('Japan', 'JP', 126317000, 377973),
  // createData('France', 'FR', 67022000, 640679),
  // createData('United Kingdom', 'GB', 67545757, 242495),
  // createData('Russia', 'RU', 146793744, 17098246),
  // createData('Nigeria', 'NG', 200962417, 923768),
  // createData('Brazil', 'BR', 210147125, 8515767),
];

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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [DriverList, setDriverList] = useState([]);
  const [vehicleNums, setvehicleNum] = useState([]);
  const [getAllAsignData, setgetAllAsignData] = useState<any>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>({});
  const [selectVehicleNum, setSelectVehicleNum] = useState<any>({});
  useEffect(() => {
    const vehicleName = async () => {
      try {
        // setLaoding(true);
        if (session) {
          const response = await GetDriverDataByClientId({
            token: session?.accessToken,
            clientId: session?.clientId,
          });
          setDriverList(
            response.filter(
              (item: any) =>
                item.isAvailable == true && item.isDeleted === false
            )
          );
        }
        // setLaoding(false);
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleName();
  }, [session]);

  const AllAsignData = async () => {
    try {
      // setLaoding(true);
      if (session) {
        const response = await GetDriverDataAssignByClientId({
          token: session?.accessToken,
          clientId: session?.clientId,
        });
        setgetAllAsignData(response);
      }
      // setLaoding(false);
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };
  useEffect(() => {
    AllAsignData();
  }, []);

  const handleVehicle = (e: any) => {
    const selectedVehicle: any = vehicleNums?.find(
      (driver: any) => driver.id === e.target.value
    );
    setSelectVehicleNum(selectedVehicle);
    // setSelectVehicleNum(e.target.value);
  };

  const handleSelectDriver = (e: any) => {
    const selectedDriverObject: any = DriverList.find(
      (driver: any) => driver._id === e.target.value
    );
    setSelectedDriver(selectedDriverObject);
  };
  // useEffect(() => {
  const vehicleNum = async () => {
    try {
      // setLaoding(true);
      if (session) {
        const response = await GetDriverforvehicel({
          token: session?.accessToken,
          clientId: session?.clientId,
        });

        setvehicleNum(response.data);
      }
      // setLaoding(false);
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };
  // }, [session]);
  useEffect(() => {
    vehicleNum();
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload: any = {
      DriverDetails: {
        id: selectedDriver._id,
        driverfirstName: selectedDriver.driverfirstName,
        driverMiddleName: selectedDriver.driverMiddleName,
        driverLastName: selectedDriver.driverLastName,
        driverContact: selectedDriver.driverContact,
        driverIdNo: selectedDriver.driverIdNo,
        driverAddress1: selectedDriver.driverAddress1,
        driverAddress2: selectedDriver.driverAddress2,
      },
      id: "",
      timezone: "Europe/London",
      vehicleDetails: {
        id: selectVehicleNum?._id,
        vehicleNo: selectVehicleNum?.vehicleNo,
        vehicleMake: selectVehicleNum?.vehicleMake,
        vehicleModel: selectVehicleNum?.vehicleModel,
        vehicleReg: selectVehicleNum?.vehicleReg,
      },
      // dateAssign: item.timestamp,
      // dateDeassign: null,
    };

    try {
      if (session) {
        const newformdata: any = {
          ...payload,
          clientId: session?.clientId,
        };
        const response = await toast.promise(
          postDriverDataAssignByClientId({
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
        // vehicleListData();
        AllAsignData();
      }
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
    vehicleNum();
  };

  const handleDeasign = async (item: any) => {
    const selectedDriverObject: any = await getAllAsignData?.data?.find(
      (driver: any) => driver._id === item
    );
    console.log("item", selectedDriverObject.id);
    const payload: any = {
      DriverDetails: {
        driverfirstName: selectedDriverObject?.DriverDetails?.driverfirstName,
        driverLastName: selectedDriverObject?.DriverDetails?.driverLastName,
        driverContact: selectedDriverObject?.DriverDetails?.driverContact,
        driverIdNo: selectedDriverObject?.DriverDetails?.driverIdNo,
        driverAddress1: selectedDriverObject?.DriverDetails?.driverAddress1,
        driverAddress2: selectedDriverObject?.DriverDetails?.driverAddress2,
        id: selectedDriverObject?.DriverDetails?.id,
      },
      clientId: session?.clientId,
      dateAssign: "2024-01-26T09:11:14",
      dateDeassign: null,
      id: selectedDriverObject.id,
      timezone: "Europe/London",
      tableData: {
        id: "0",
      },
      vehicleDetails: {
        id: selectedDriverObject?.vehicleDetails?.id,
        vehicleNo: selectedDriverObject?.vehicleDetails?.vehicleNo,
        vehicleMake: selectedDriverObject?.vehicleDetails?.vehicleMake,
        vehicleModel: selectedDriverObject?.vehicleDetails?.vehicleModel,
        vehicleReg: selectedDriverObject?.vehicleDetails?.vehicleReg,
      },
    };
    try {
      if (session) {
        const newformdata: any = {
          ...payload,
          clientId: session?.clientId,
        };
        console.log("deAssign", newformdata);
        const response = await toast.promise(
          postDriverDeDataAssignByClientId({
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
        // vehicleListData();
        AllAsignData();
      }
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  return (
    <div>
      <Paper sx={{ width: "98%" }} className="bg-green-50 ms-3 mr-3 mt-3">
        {/* <Button>Add New Driver</Button> */}
        <div className="flex lg: justify-center sm:justify-start">
          <button
            onClick={handleOpen}
            className="bg-[#00B56C] px-4 py-1 m-5 text-white rounded-md"
          >
            {" "}
            Assign To A Vehicle
          </button>
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
                      Assign Driver
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

              <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                <form onSubmit={handleSubmit}>
                  <div className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 grid-cols-12 m-6 mt-8 gap-5">
                    <div className="lg:col-span-6 md:col-span-6 sm:col-span-6 col-span-12  ">
                      <label className="text-gray-700 ">
                        <i className="text-black font-popins font-medium mt-5">
                          *
                        </i>{" "}
                        Drives:
                      </label>

                      <Select
                        MenuProps={MenuProps}
                        onChange={handleSelectDriver}
                        className="h-8 w-full  border border-grayLight  outline-green hover:border-green transition duration-700 ease-in-outoutline-none color-gray"
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          Drives
                        </MenuItem>
                        {DriverList &&
                          DriverList.map((item: any, i: any) => {
                            return (
                              <MenuItem
                                className="hover:bg-green hover:text-white"
                                key={item._id}
                                value={item._id}
                              >
                                {item.driverfirstName} {item.driverLastName}{" "}
                                {item.driverMiddleName}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </div>

                    <div className="lg:col-span-6 md:col-span-6 sm:col-span-6 col-span-12 lg:mt-0 md:mt-0 sm:mt-0  mt-4 ">
                      <label>
                        {" "}
                        <i className="text-black font-popins font-medium  mt-5">
                          *
                        </i>{" "}
                        Vehicles:
                        <Select
                          MenuProps={MenuProps}
                          onChange={handleVehicle}
                          displayEmpty
                          className="h-8  border w-full border-grayLight  outline-green hover:border-green transition duration-700 ease-in-out"
                        >
                          <MenuItem value="" disabled selected hidden>
                            Vehicles
                          </MenuItem>
                          {vehicleNums &&
                            vehicleNums?.map((item: any) => {
                              return (
                                <MenuItem
                                  className="hover:bg-green hover:text-white"
                                  key={item._id}
                                  value={item._id}
                                >
                                  {item.vehicleReg}
                                </MenuItem>
                              );
                            })}
                        </Select>
                      </label>
                      <br></br>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-[#00B56C]  px-4 py-1 mt-10  text-end text-white rounded-md "
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </Typography>
            </Box>
          </Fade>
        </Modal>
        <TableContainer sx={{ height: 640 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="center" colSpan={2}>
                  Driver Number
                </TableCell>
                <TableCell align="center" colSpan={2}>
                  First Name
                </TableCell>
                <TableCell align="center" colSpan={2}>
                  Middle Name
                </TableCell>
                <TableCell align="center" colSpan={2}>
                  Last Name
                </TableCell>
                <TableCell align="center" colSpan={2}>
                  Driver ID
                </TableCell>
                <TableCell align="center" colSpan={2}>
                  Driver Contact
                </TableCell>
                <TableCell align="center" colSpan={2}>
                  Vehicle No
                </TableCell>
                <TableCell align="center" colSpan={2}>
                  Driver Address 1
                </TableCell>
                <TableCell align="center" colSpan={2}>
                  Driver Address 2
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="bg-bgLight cursor-pointer  ">
              {getAllAsignData?.data?.map((row: any) => (
                <TableRow className="hover:bg-bgHoverTabel w-full">
                  <TableCell align="center" colSpan={2}>
                    {row?.DriverDetails?.driverNo}
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    {" "}
                    {row?.DriverDetails?.driverfirstName}
                  </TableCell>

                  <TableCell align="center" colSpan={2}>
                    {row?.DriverDetails?.driverMiddleName}
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    {row?.DriverDetails?.driverLastName}
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    {row?.DriverDetails?.driverIdNo}
                  </TableCell>
                  <TableCell>{row?.DriverDetails?.driverIdNo}</TableCell>
                  <TableCell align="center">
                    {row?.DriverDetails?.driverContact}
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    {row?.vehicleDetails?.vehicleReg}
                  </TableCell>
                  <TableCell align="center" colSpan={2}>
                    {row?.DriverDetails?.driverAddress2}
                  </TableCell>

                  <TableCell
                    align="center"
                    colSpan={2}
                    onClick={() => handleDeasign(row.id)}
                  >
                    Deasign
                    {/* {row.DriverDetails.driverAddress2} */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        /> */}
      </Paper>
    </div>
  );
}
