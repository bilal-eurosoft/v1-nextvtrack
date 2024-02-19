"use client";
import {
  getAllVehicleByUserId,
  vehicleListByClientId,
} from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { IgnitionReport } from "@/types/IgnitionReport";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DateFnsMomemtUtils from "@date-io/moment";
import "./report.css";

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import {
  IgnitionReportByTrip,
  IgnitionReportByDailyactivity,
  IgnitionReportByIgnition,
  IgnitionReportByEvents,
  IgnitionReportByDetailReport,
  IgnitionReportByIdlingActivity,
} from "@/utils/API_CALLS";
import { InputLabel } from "@mui/material";
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

export default function Reports() {
  const { data: session } = useSession();
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  const [startdate, setstartdate] = useState(new Date());
  const [enddate, setenddate] = useState(new Date());
  const [Ignitionreport, setIgnitionreport] = useState<IgnitionReport>({
    TimeZone: session?.timezone || "",
    VehicleReg: "",
    clientId: session?.clientId || "",
    fromDateTime: "",
    period: "",
    reportType: 0,
    toDateTime: "",
    unit: session?.unit || "",
  });

  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "SuperAmin") {
          const Data = await vehicleListByClientId({
            token: session.accessToken,
            clientId: session?.clientId,
          });
          setVehicleList(Data);
        } else {
          if (session) {
            const data = await getAllVehicleByUserId({
              token: session.accessToken,
              userId: session.userId,
            });
            setVehicleList(data);
          }
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleListData();
  }, [session]);

  let currentTime = new Date().toLocaleString("en-US", {
    timeZone: session?.timezone,
  });

  let timeOnly = currentTime.split(",")[1].trim();
  timeOnly = timeOnly.replace(/\s+[APap][Mm]\s*$/, "");

  const [hours, minutes, seconds] = timeOnly
    .split(":")
    .map((part) => part.trim());

  const formattedHours = hours.padStart(2, "0");
  const formattedMinutes = minutes.padStart(2, "0");
  const formattedSeconds = seconds.padStart(2, "0");
  const currentDate = new Date().toISOString().split("T")[0];
  const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

  const parsedDateTime = new Date(currentTime);
  const currenTDates = new Date();
  var moment = require("moment");
  const formattedDateTime = `${parsedDateTime
    .toISOString()
    .slice(0, 10)}TO${timeOnly}`;

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [name]: value,
    }));

    if (name === "period" && value === "custom") {
      setIsCustomPeriod(true);
    } else if (name === "period" && value != "custom") {
      setIsCustomPeriod(false);
    }
  };

  const handleStartdateChange = (value: any) => {
    setstartdate(value);
  };

  const handleEnddateChange = (value: any) => {
    setenddate(value);
  };
  const handleCustomDateChange = (key: string, e: any) => {
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [key]: e.toISOString(),
    }));
    setstartdate(e);
    setenddate(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let startDateTime;
    let endDateTime;

    if (session) {
      const { reportType, VehicleReg, period } = Ignitionreport;
      if (period === "today") {
        const today = moment();
        startDateTime =
          today.clone().startOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        endDateTime =
          today.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        // Handle other periods if needed
      }
      if (period === "yesterday") {
        const yesterday = moment().subtract(1, "day");
        startDateTime =
          yesterday.clone().startOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        endDateTime =
          yesterday.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
      }
      if (period === "week") {
        const startOfWeek = moment().subtract(7, "days").startOf("day");
        const oneday = moment().subtract(1, "day");

        startDateTime = startOfWeek.format("YYYY-MM-DDTHH:mm:ss") + "Z";
        endDateTime =
          oneday.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
      }
      if (period === "custom") {
        startDateTime =
          moment(startdate).startOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        endDateTime;
        moment(enddate).endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
      }
      if (reportType && VehicleReg && period) {
        let newdata = { ...Ignitionreport };

        const apiFunctions: Record<
          string,
          (data: {
            token: string;
            clientId: string;
            payload: any;
          }) => Promise<any>
        > = {
          Trip: IgnitionReportByTrip,
          DailyActivity: IgnitionReportByDailyactivity,
          Ignition: IgnitionReportByIgnition,
          Events: IgnitionReportByEvents,
          DetailReportByStreet: IgnitionReportByDetailReport,
          IdlingActivity: IgnitionReportByIdlingActivity,
        };

        if (apiFunctions[newdata.reportType]) {
          const apiFunction = apiFunctions[newdata.reportType];
          if (isCustomPeriod) {
            newdata = {
              ...newdata,
              fromDateTime: `${Ignitionreport.fromDateTime}T00:00:00Z`,
              toDateTime: `${Ignitionreport.toDateTime}T23:59:59Z`,
            };
          } else {
            newdata = {
              // ...newdata,
              unit: session?.unit,
              reportType: 0,
              period: period,
              VehicleReg: VehicleReg,
              TimeZone: session?.timezone,
              clientId: session?.clientId,
              fromDateTime: startDateTime,
              toDateTime: endDateTime,
              // fromDateTime: "2024-02-01T00:00:00Z",
              // toDateTime: "2024-02-01T23:59:59Z",
            };
          }
          try {
            const response = await toast.promise(
              apiFunction({
                token: session.accessToken,
                clientId: session.clientId,
                payload: newdata,
              }),
              {
                loading: "Loading...",
                success: "",
                error: "",
              },
              {
                style: {
                  border: "1px solid #00B56C",
                  padding: "16px",
                  color: "#1A202C",
                },
                success: {
                  duration: 10,
                  iconTheme: {
                    primary: "#00B56C",
                    secondary: "#FFFAEE",
                  },
                },
                error: {
                  duration: 10,
                  iconTheme: {
                    primary: "#00B56C",
                    secondary: "#FFFAEE",
                  },
                },
              }
            );

            if (response.success === true) {
              const buffer = Buffer.from(response.pdfData, "base64");
              window.open(
                URL.createObjectURL(
                  new Blob([buffer], { type: "application/pdf" })
                )
              );
              toast.success(`${response.message}`, {
                style: {
                  border: "1px solid #00B56C",
                  padding: "16px",
                  color: "#1A202C",
                },
                duration: 4000,
                iconTheme: {
                  primary: "#00B56C",
                  secondary: "#FFFAEE",
                },
              });
            } else {
              toast.error(`${response.message}`, {
                style: {
                  border: "1px solid red",
                  padding: "16px",
                  color: "red",
                },
                iconTheme: {
                  primary: "red",
                  secondary: "white",
                },
              });
            }
          } catch (error) {
            console.error(
              `Error calling API for ${newdata.reportType}:`,
              error
            );
          }
        } else {
          console.error(`API function not found for ${newdata.reportType}`);
        }
      } else {
        console.error(
          "Please fill in all three fields: reportType, VehicleReg, and period"
        );

        toast.error(
          "Please fill in all three fields: reportType, VehicleReg, and period",
          {
            style: {
              border: "1px solid #00B56C",
              padding: "16px",
              color: "#1A202C",
            },
            iconTheme: {
              primary: "#00B56C",
              secondary: "#FFFAEE",
            },
          }
        );
      }
    }
  };

  return (
    <div>
      <form
        className="container mx-auto  lg:max-w-screen-lg bg-bgLight shadow-lg"
        onSubmit={handleSubmit}
      >
        <div className="bg-green-50 mt-20">
          <div className="grid grid-cols-1">
            <p className="bg-green text-center font-popins font-bold text-xl px-4 py-3 rounded-md text-white">
              Reports{" "}
            </p>
          </div>
          <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 mt-5 mb-8  grid-cols-2 pt-5 px-10 gap-2 flex justify-center ">
            <div className="lg:col-span-1 md:col-span-1 sm:col-span-1 col-span-2 ">
              <div className="grid grid-cols-12">
                <div className="lg:col-span-3 col-span-12">
                  <label className="text-labelColor">
                    Report Type: &nbsp;&nbsp;
                  </label>
                </div>
                <div className="lg:col-span-8 col-span-12">
                  <Select
                    className="h-8 text-sm w-full text-gray  outline-green"
                    name="reportType"
                    value={Ignitionreport.reportType}
                    onChange={handleInputChange}
                    displayEmpty
                    MenuProps={MenuProps}
                    renderValue={(value: any) => (
                      <span
                        style={{
                          color: value === 0 ? "black" : "normal",
                          fontSize: value === 0 ? "15px" : "normal",
                          paddingLeft: isCustomPeriod ? "10px" : "5px",
                        }}
                      >
                        {value === 0 ? "Select Report Type" : value}
                      </span>
                    )}
                  >
                    <MenuItem id="report_select_hover" value="Trip">
                      Trip
                    </MenuItem>
                    <MenuItem id="report_select_hover" value="DailyActivity">
                      Daily Activity
                    </MenuItem>
                    <MenuItem id="report_select_hover" value="Ignition">
                      Ignition
                    </MenuItem>
                    <MenuItem id="report_select_hover" value="Events">
                      Events
                    </MenuItem>
                    <MenuItem
                      id="report_select_hover"
                      value="DetailReportByStreet"
                    >
                      Detail Report By Street
                    </MenuItem>
                    <MenuItem id="report_select_hover" value="IdlingActivity">
                      Idling Activity
                    </MenuItem>
                  </Select>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 md:col-span-1 sm:col-span-1 col-span-2 lg:mt-0 md:mt-0 sm:mt-0 mt-4">
              <label className="text-labelColor">Vehicle: &nbsp;&nbsp;</label>
              <Select
                className="h-8 lg:w-4/6 w-full text-labelColor outline-green px-1e"
                name="VehicleReg"
                value={Ignitionreport.vehicleNo}
                onChange={handleInputChange}
                MenuProps={MenuProps}
                style={{
                  paddingLeft: isCustomPeriod ? "10px" : "5px",
                  paddingTop: isCustomPeriod ? "5px" : "2px",
                }}
                displayEmpty
              >
                <InputLabel hidden>Select Vehicle Name</InputLabel>
                {vehicleList?.data?.map((item: DeviceAttach) => (
                  <MenuItem
                    id="report_select_hover"
                    key={item.id}
                    value={item.vehicleReg}
                  >
                    {item.vehicleNo} (Reg#{item.vehicleReg})
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          <div className=" grid lg:grid-cols-8  mb-5 md:grid-cols-6 sm:grid-cols-5 gap-5 lg:text-center lg:mx-52 md:mx-24 sm:mx-10  flex justify-center">
            <div className="lg:col-span-2 md:col-span-2 sm:col-span-2">
              <label>
                <input
                  type="radio"
                  className="w-5 h-4 form-radio  "
                  style={{ accentColor: "green" }}
                  name="period"
                  value="today"
                  checked={Ignitionreport.period === "today"}
                  onChange={handleInputChange}
                />
                &nbsp;&nbsp;Today
              </label>
            </div>
            <div className="lg:col-span-2 md:col-span-2 sm:col-span-2">
              <label>
                <input
                  type="radio"
                  className="w-5 h-4 "
                  name="period"
                  value="yesterday"
                  style={{ accentColor: "green" }}
                  checked={Ignitionreport.period === "yesterday"}
                  onChange={handleInputChange}
                />
                &nbsp;&nbsp;Yesterday
              </label>
            </div>

            <div className="lg:col-span-2 md:col-span-2">
              <label>
                <input
                  type="radio"
                  className="w-5 h-4"
                  name="period"
                  value="week"
                  style={{ accentColor: "green" }}
                  checked={Ignitionreport.period === "week"}
                  onChange={handleInputChange}
                />
                &nbsp;&nbsp;Week
              </label>
            </div>

            <div className="lg:col-span-2 md:col-span-2">
              <label>
                <input
                  type="radio"
                  className="w-5 h-4"
                  name="period"
                  value="custom"
                  style={{ accentColor: "green" }}
                  checked={Ignitionreport.period === "custom"}
                  onChange={handleInputChange}
                />
                &nbsp;&nbsp;Custom
              </label>
            </div>
          </div>

          {isCustomPeriod && (
            <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 mt-5 mb-8  grid-cols-2 pt-5 px-10 gap-2 flex justify-center ">
              <div className="lg:col-span-1 md:col-span-1 sm:col-span-1 col-span-2 lg:mt-0 md:mt-0 sm:mt-0 mt-4 ">
                <label className="text-labelColor">
                  From Date: &nbsp;&nbsp;&nbsp;
                  <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                    <KeyboardDatePicker
                      format="MM/DD/yyyy"
                      value={Ignitionreport.fromDateTime}
                      onChange={(e) =>
                        handleCustomDateChange("fromDateTime", e)
                      }
                      variant="inline"
                      maxDate={currenTDates}
                      className="xl:w-80  lg:w-80 w-auto"
                      autoOk
                      inputProps={{ readOnly: true }}
                    />
                  </MuiPickersUtilsProvider>
                  {/* <input
                    type="date"
                    className="ms-1 h-8 lg:w-4/6 w-full  text-labelColor  outline-green border border-grayLight px-1"
                    name="fromDateTime"
                    placeholder="Select Date"
                    autoComplete="off"
                    // onChange={handleStartdateChange}
                    defaultValue={currentDate}
                    onChange={(e) =>
                      handleCustomDateChange("fromDateTime", e.target.value)
                    }
                  /> */}
                </label>
              </div>
              <div className="lg:col-span-1 md:col-span-1 sm:col-span-1 col-span-2 lg:mt-0 md:mt-0 sm:mt-0 mt-4 w-full ">
                <label className="text-labelColor "></label>
                To Date: &nbsp;&nbsp;&nbsp;
                <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                  <KeyboardDatePicker
                    format="MM/DD/yyyy"
                    value={Ignitionreport.toDateTime}
                    onChange={(newDate: any) =>
                      handleCustomDateChange("toDateTime", newDate)
                    }
                    variant="inline"
                    maxDate={currenTDates}
                    className="xl:w-80  lg:w-80 w-auto"
                    autoOk
                    inputProps={{ readOnly: true }}
                    // style={{ width: "70%" }}
                  />
                </MuiPickersUtilsProvider>
                {/* <input
                  type="date"
                  className="h-8 lg:w-4/6 w-full  text-labelColor  outline-green border border-grayLight px-1"
                  name="toDateTime"
                  onChange={(e) =>
                    handleCustomDateChange("toDateTime", e.target.value)
                  }
                /> */}
              </div>
            </div>
          )}
          <div className="text-white h-20 flex justify-center items-center">
            <button
              className={`bg-green py-2 px-5 mb-5 rounded-md shadow-md  hover:shadow-gray transition duration-500
                        ${
                          (Ignitionreport.reportType &&
                            Ignitionreport.VehicleReg &&
                            Ignitionreport.period === "today") ||
                          (Ignitionreport.reportType &&
                            Ignitionreport.VehicleReg &&
                            Ignitionreport.period === "yesterday") ||
                          (Ignitionreport.reportType &&
                            Ignitionreport.VehicleReg &&
                            Ignitionreport.period === "week") ||
                          (Ignitionreport.reportType &&
                            Ignitionreport.VehicleReg &&
                            Ignitionreport.period === "custom")
                            ? ""
                            : "opacity-50 cursor-not-allowed"
                        }`}
              type="submit"
              // disabled={
              //   !Ignitionreport.reportType ||
              //   !Ignitionreport.VehicleReg ||
              //   !Ignitionreport.period ||
              //   !Ignitionreport.fromDateTime ||
              //   !Ignitionreport.toDateTime
              // }
            >
              Submit
            </button>
          </div>
        </div>
      </form>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
