"use client";
import { vehicleListByClientId } from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { TripsByBucket } from "@/types/TripsByBucket";
import { IgnitionReport } from "@/types/IgnitionReport";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
// import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DateFnsMomemtUtils from "@date-io/moment";
import Select from "react-select";
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
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [startdate, setstartdate] = useState(new Date());
  const [enddate, setenddate] = useState(new Date());
  // suraksha code
  const [trisdata, setTrisdata] = useState<TripsByBucket[]>([]);
  const [columnHeaders, setColumnHeaders] = useState<
    (
      | "duration"
      | "0"
      | "DriverName"
      | "1"
      | "2"
      | "3"
      | "4"
      | "5"
      | "6"
      | "7"
      | "EndTime"
      | "streetCount"
      | "Final Location"
      | "Total Time"
      | "Start Date"
      | "Idling Point"
      | "Time Duration"
      | "BeginingDateTime"
      | "Starting Location"
      | "TripStart"
      | "AvgSpeed"
      | "Millage"
      | "Max Speed"
      | "MaxSpeed"
      | "InitialLocation"
      | "Duration"
      | "EndingDateTime"
      | "event"
      | "date"
      | "Address"
      | "BegginingTime"
      | "StartingPoint"
      | "TripEnd"
      | "Final Location "
      | "TripDuration"
      | "Mileage"
      | "TotalDistance"
      | "Avg Speed"
      | "AverageSpeed"
      | "MaxSpeed"
      | "IMEI"
      | "Status"
      | "Type"
    )[]
  >([]);
  const [customHeaderTitles, setcustomHeaderTitles] = useState<
    (
      | "duration"
      | "DriverName"
      | "0"
      | "1"
      | "2"
      | "3"
      | "4"
      | "5"
      | "EndTime"
      | "streetCount"
      | "Total Time"
      | "Final Location"
      | "6"
      | "7"
      | "Start Date"
      | "Idling Point"
      | "Time Duration"
      | "Starting Location"
      | "BeginingDateTime"
      | "TripStart"
      | "AvgSpeed"
      | "Max Speed"
      | "Millage"
      | "MaxSpeed"
      | "InitialLocation"
      | "Duration"
      | "EndingDateTime"
      | "event"
      | "date"
      | "Address"
      | "BegginingTime"
      | "StartingPoint"
      | "TripEnd"
      | "Final Location "
      | "TripDuration"
      | "Mileage"
      | "TotalDistance"
      | "Avg Speed"
      | "AverageSpeed"
      | "MaxSpeed"
      | "IMEI"
      | "Status"
      | "Type"
    )[]
  >([]);
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
        if (session) {
          const Data = await vehicleListByClientId({
            token: session.accessToken,
            clientId: session?.clientId,
          });
          setVehicleList(Data);
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
  // console.log("inigintion", Ignitionreport);

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
  const handleCustomDateChange = (fieldName: string, e: any) => {
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [fieldName]: e.toISOString().split("T")[0],
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
        //console.log("week is starting");
        const startOfWeek = moment().subtract(7, "days").startOf("day");
        //console.log("start of week", startOfWeek);
        const oneday = moment().subtract(1, "day");

        startDateTime = startOfWeek.format("YYYY-MM-DDTHH:mm:ss") + "Z";
        //console.log("start date time ", startDateTime);
        endDateTime =
          oneday.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        //console.log("end date time", endDateTime);
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
            // suraksha code
            if (response.success === true) {
              console.log("Trips Data isssssssss:", response);
              //  setIsFormSubmitted(true);
              setTrisdata(response.data.tableData);

              let newColumnHeaders: (
                | "BeginingDateTime"
                | "DriverName"
                | "0"
                | "1"
                | "2"
                | "3"
                | "4"
                | "5"
                | "6"
                | "7"
                | "Start Date"
                | "streetCount"
                | "EndTime"
                | "Mileage"
                | "Total Time"
                | "Max Speed"
                | "Idling Point"
                | "Time Duration"
                | "duration"
                | "AvgSpeed"
                | "Millage"
                | "MaxSpeed"
                | "TripStart"
                | "Starting Location"
                | "InitialLocation"
                | "EndingDateTime"
                | "Duration"
                | "event"
                | "date"
                | "Address"
                | "BegginingTime"
                | "StartingPoint"
                | "TripEnd"
                | "Final Location"
                | "TripDuration"
                | "TotalDistance"
                | "Avg Speed"
                | "AverageSpeed"
                | "MaxSpeed"
                | "IMEI"
                | "Status"
                | "Type"
              )[] = [];
              let custom1HeaderTitles: (
                | "BeginingDateTime"
                | "0"
                | "1"
                | "2"
                | "3"
                | "4"
                | "5"
                | "6"
                | "7"
                | "Start Date"
                | "streetCount"
                | "EndTime"
                | "Mileage"
                | "Total Time"
                | "Max Speed"
                | "Idling Point"
                | "Time Duration"
                | "duration"
                | "AvgSpeed"
                | "Millage"
                | "MaxSpeed"
                | "TripStart"
                | "InitialLocation"
                | "Starting Location"
                | "EndingDateTime"
                | "Duration"
                | "event"
                | "date"
                | "Address"
                | "BegginingTime"
                | "StartingPoint"
                | "TripEnd"
                | "Final Location"
                | "TripDuration"
                | "TotalDistance"
                | "AverageSpeed"
                | "Avg Speed"
                | "MaxSpeed"
                | "IMEI"
                | "Status"
                | "Type"
              )[] = [];
              if (Ignitionreport.reportType.toString() === "Trip") {
                console.log("trips data ", response.data);

                if (response.data.clientModelProfile) {
                  newColumnHeaders = [
                    "AverageSpeed",
                    "IMEI",
                    "Status",
                    "TripDuration",
                    "TotalDistance",
                    "DriverName",
                  ];
                } else {
                  newColumnHeaders = [
                    "AverageSpeed",
                    "IMEI",
                    "Status",
                    "TripDuration",
                    "TotalDistance",
                  ];
                }

                setcustomHeaderTitles(newColumnHeaders);
              } else if (
                Ignitionreport.reportType.toString() === "DailyActivity"
              ) {
                newColumnHeaders = ["0", "1", "2", "3", "4", "5", "6", "7"];
                custom1HeaderTitles = [
                  "BegginingTime",
                  "Starting Location",
                  "EndTime",
                  "Final Location",
                  "Total Time",
                  "Mileage",
                  "Avg Speed",
                  "Max Speed",
                ];

                setcustomHeaderTitles(custom1HeaderTitles);
              } else if (Ignitionreport.reportType.toString() === "Ignition") {
                console.log("ignition", response.data.tableData);
                newColumnHeaders = ["0", "1", "2", "3", "4", "5"];
                custom1HeaderTitles = [
                  "event",
                  "date",
                  "Address",
                  "event",
                  "date",
                  "Address",
                ];
                setcustomHeaderTitles(custom1HeaderTitles);
              } else if (Ignitionreport.reportType.toString() === "Events") {
                console.log("event", response.data.tableData);
                const filteredData = response.data.tableData.filter(
                  (eventitem: { event: string }) =>
                    eventitem.event !== "ignitionOn" &&
                    eventitem.event !== "ignitionOff"
                );
                setTrisdata(filteredData);
                newColumnHeaders = ["event", "date", "Address"];
                setcustomHeaderTitles(newColumnHeaders);
              } else if (
                Ignitionreport.reportType.toString() === "IdlingActivity"
              ) {
                console.log("idling---------", response.data.tableData);

                // Constructing new column headers based on the data format
                newColumnHeaders = ["0", "1", "2"];
                custom1HeaderTitles = ["date", "Address", "duration"];
                setcustomHeaderTitles(custom1HeaderTitles);
              } else if (
                Ignitionreport.reportType.toString() === "DetailReportByStreet"
              ) {
                console.log("streets", response.data);
                newColumnHeaders = ["0", "1", "2", "3", "4", "5", "6", "7"];
                custom1HeaderTitles = [
                  "BeginingDateTime",
                  "AvgSpeed",
                  "streetCount",
                  "Millage",
                  "MaxSpeed",
                  "InitialLocation",
                  "EndingDateTime",
                  "Duration",
                ];
                setcustomHeaderTitles(custom1HeaderTitles);
              }

              setColumnHeaders(newColumnHeaders);
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
  const handleInputChangeSelect = (e: any) => {
    console.log("ee", e);
    // const { value, label } = e;
    if (!e) return;
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      VehicleReg: e?.value,
      // ["label"]: label,
    }));
  };
  const handleInputChangeTrip = (e: any) => {
    console.log("tt", e);
    // const { value, label } = e;
    if (!e) return;
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      reportType: e?.value,
      // ["label"]: label,
    }));
  };
  const optionsTrip = [
    { value: "Trip", label: "Trip" },
    { value: "DailyActivity", label: "Daily Activity" },
    { value: "Ignition", label: "Ignition" },
    { value: "Events", label: "Events" },
    { value: "DetailReportByStreet", label: "Detail Report By Street" },
    { value: "IdlingActivity", label: "Id ling Activity" },
  ];
  const options: { value: string; label: string; data: any }[] =
    vehicleList?.data?.map((item: VehicleData) => ({
      value: item.vehicleReg,
      label: item.vehicleReg,
    })) || [];
  // handle exportPdf
  const handleExportPdf = async (e: React.FormEvent) => {
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
        //console.log("week is starting");
        const startOfWeek = moment().subtract(7, "days").startOf("day");
        //console.log("start of week", startOfWeek);
        const oneday = moment().subtract(1, "day");

        startDateTime = startOfWeek.format("YYYY-MM-DDTHH:mm:ss") + "Z";
        //console.log("start date time ", startDateTime);
        endDateTime =
          oneday.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        //console.log("end date time", endDateTime);
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
              const buffer = Buffer.from(response.data.pdfData, "base64");

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
  // suraksha code
  function calculateTotalDurationAndDistance(data: TripsByBucket[]): {
    duration: string;
    distance: number;
  } {
    let totalHours = 0;
    let totalMinutes = 0;
    let totalDistance = 0;

    data.forEach((trip) => {
      totalHours += trip.TripDurationHr;
      totalMinutes += trip.TripDurationMins;

      if (trip.TotalDistance && typeof trip.TotalDistance === "string") {
        const distanceMatch = trip.TotalDistance.match(/([\d.]+)/);
        if (distanceMatch) {
          const distanceValue = parseFloat(distanceMatch[0]);
          if (!isNaN(distanceValue)) {
            totalDistance += distanceValue;
          }
        }
      }
    });
    totalHours += Math.floor(totalMinutes / 60);
    totalMinutes %= 60;

    // Format total duration
    const duration = `${totalHours} hrs ${totalMinutes} mins`;
    const distance = parseFloat(totalDistance.toFixed(2));
    return { duration, distance };
  }

  return (
    <div>
      <form
        className="container mx-auto  lg:max-w-screen-lg bg-bgLight shadow-lg"
        onSubmit={handleSubmit}
      >
        <div className="bg-green-50 mt-20">
          <div className="grid grid-cols-1">
            <p className="bg-green text-center font-popins font-bold text-xl px-4 py-3 rounded-md text-white">
              Reports Filter{" "}
            </p>
          </div>
          <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 mt-5 mb-8  grid-cols-2 pt-5 px-10 gap-2 flex justify-center ">
            <div className="lg:col-span-1 md:col-span-1 sm:col-span-1 col-span-2 ">
              <div className="grid grid-cols-12">
                <div className="col-span-3">
                  <label className="text-labelColor">
                    Report Type: &nbsp;&nbsp;
                  </label>
                </div>
                <div className="col-span-8">
                  {/* <Select
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
                    <MenuItem
                      className="hover:bg-green w-full hover:text-white text-sm"
                      value="Trip"
                    >
                      Trip
                    </MenuItem>
                    <MenuItem
                      className="hover:bg-green w-full hover:text-white text-sm"
                      value="DailyActivity"
                    >
                      Daily Activity
                    </MenuItem>
                    <MenuItem
                      className="hover:bg-green w-full hover:text-white text-sm"
                      value="Ignition"
                    >
                      Ignition
                    </MenuItem>
                    <MenuItem
                      className="hover:bg-green w-full hover:text-white text-sm"
                      value="Events"
                    >
                      Events
                    </MenuItem>
                    <MenuItem
                      className="hover:bg-green w-full hover:text-white text-sm"
                      value="DetailReportByStreet"
                    >
                      Detail Report By Street
                    </MenuItem>
                    <MenuItem
                      className="hover:bg-green w-full hover:text-white text-sm"
                      value="IdlingActivity"
                    >
                      Idling Activity
                    </MenuItem>
                  </Select> */}
                  <Select
                    value={Ignitionreport?.vehicleNo}
                    onChange={handleInputChangeTrip}
                    options={optionsTrip}
                    placeholder="Select Report Type"
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "No options available"}
                    className="   rounded-md w-full  outline-green border border-grayLight  hover:border-green"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        border: "none",
                        boxShadow: state.isFocused ? null : null, // Add any box-shadow you want here
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused
                          ? "#00B56C"
                          : "transparent", // Change 'blue' to your desired hover color
                        color: state.isFocused ? "white" : "black", // Change 'white' to your desired text color
                        "&:hover": {
                          backgroundColor: "#00B56C", // Change 'blue' to your desired hover color
                          color: "white", // Change 'white' to your desired text color
                        },
                      }),
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 md:col-span-1 sm:col-span-1 col-span-2 lg:mt-0 md:mt-0 sm:mt-0 mt-4">
              <label className="text-labelColor">
                Vehicle: &nbsp;&nbsp;
                {/* <Select
                  className="h-8 lg:w-4/6 w-full text-labelColor outline-green px-1e"
                  name="VehicleReg"
                  value={Ignitionreport.VehicleReg}
                  onChange={handleInputChange}
                  displayEmpty
                  MenuProps={MenuProps}
                  style={{
                    paddingLeft: isCustomPeriod ? "10px" : "5px",
                    paddingTop: isCustomPeriod ? "5px" : "2px",
                  }}
                >
                  <MenuItem value="" disabled hidden>
                    Select Vehicle Name
                  </MenuItem>
                  {vehicleList?.data?.map((item: DeviceAttach) => (
                    <MenuItem
                      className="hover:bg-green hover:text-white w-full text-start"
                      key={item.id}
                      value={item.vehicleReg}
                    >
                      {item.vehicleNo} (Reg#{item.vehicleReg})
                    </MenuItem>
                  ))}
                </Select> */}
                <Select
                  value={Ignitionreport.vehicleNo}
                  onChange={handleInputChangeSelect}
                  options={options}
                  placeholder="Select Vehicle"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => "No options available"}
                  className="   rounded-md w-full outline-green border border-grayLight  hover:border-green"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      border: "none",
                      boxShadow: state.isFocused ? null : null, // Add any box-shadow you want here
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isFocused
                        ? "#00B56C"
                        : "transparent", // Change 'blue' to your desired hover color
                      color: state.isFocused ? "white" : "black", // Change 'white' to your desired text color
                      "&:hover": {
                        backgroundColor: "#00B56C", // Change 'blue' to your desired hover color
                        color: "white", // Change 'white' to your desired text color
                      },
                    }),
                  }}
                />
              </label>
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
              onClick={handleSubmit}
              // disabled={
              //   !Ignitionreport.reportType ||
              //   !Ignitionreport.VehicleReg ||
              //   !Ignitionreport.period ||
              //   !Ignitionreport.fromDateTime ||
              //   !Ignitionreport.toDateTime
              // }
            >
              Submit
            </button>{" "}
            <button
              className="bg-green py-2 px-5 mb-5 rounded-md shadow-md  hover:shadow-gray test-white"
              onClick={handleExportPdf}
            >
              Export Pdf
            </button>
          </div>
        </div>
      </form>

      {/* Render your table below the form */}

      {trisdata && trisdata.length > 0 && (
        <div
          className="mt-8 mx-auto"
          style={{
            width: "111rem",
            maxHeight: "500px",
            overflowY: "auto",
            borderRadius: "2px",
          }}
        >
          <table className="w-full border-collapse border border-gray-300">
            <thead
              style={{ position: "sticky", top: -1, zIndex: 2 }}
              className="bg-green "
            >
              <tr>
                {customHeaderTitles.map((header, index) => (
                  <th key={index} className="border border-gray-300 px-4 py-2">
                    <span style={{ color: "white" }}>{header}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trisdata.map((trip, tripIndex) => (
                <tr key={tripIndex}>
                  {/* Render data cells dynamically based on the headers */}
                  {columnHeaders.map((header, headerIndex) => {
                    const dataKey = header.replace(
                      /\s+/g,
                      ""
                    ) as keyof TripsByBucket;
                    return (
                      <td
                        key={headerIndex}
                        className="border border-gray-300 px-4 py-2"
                      >
                        {header === "TripStart" ||
                        header === "TripEnd" ||
                        header === "date" ||
                        header === "BeginingDateTime" ||
                        header === "EndingDateTime" ? (
                          <>
                            {moment(trip[dataKey]).format("MMM D, YYYY")}{" "}
                            {trip[dataKey] &&
                              trip[dataKey]
                                .toString()
                                .split("T")[1]
                                ?.trim()
                                ?.slice(0, -1)
                                .trim()
                                .split(".")[0]}
                          </>
                        ) : header === "TripDuration" ? (
                          `${trip.TripDurationHr} hrs ${trip.TripDurationMins} mins`
                        ) : header === "DriverName" && !trip[dataKey] ? (
                          "Driver Not Assigned"
                        ) : (
                          trip[dataKey]?.toString() ?? ""
                        )}
                        {header === "Address" && trip.OsmElement
                          ? `${trip.OsmElement.display_name.split(",")[0]} ${
                              trip.OsmElement.display_name.split(",")[1]
                            } ${trip.OsmElement.display_name.split(",")[2]}`
                          : ""}
                        {}
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr
                style={{ position: "sticky", bottom: 0, zIndex: 2 }}
                className="bg-green"
              >
                {calculateTotalDurationAndDistance(trisdata) &&
                  calculateTotalDurationAndDistance(trisdata).duration !==
                    "NaN hrs NaN mins" && (
                    <td colSpan={3}>
                      <span style={{ color: "white" }}>Total:</span>
                    </td>
                  )}
                {calculateTotalDurationAndDistance(trisdata) &&
                  calculateTotalDurationAndDistance(trisdata).duration !==
                    "NaN hrs NaN mins" && (
                    <td
                      colSpan={1}
                      className="border border-gray-300 px-4 py-2"
                    >
                      <span style={{ color: "white" }}>
                        {calculateTotalDurationAndDistance(trisdata).duration}
                      </span>
                    </td>
                  )}
                <td
                  colSpan={columnHeaders.length}
                  className="border border-gray-300 px-4 py-2"
                >
                  {calculateTotalDurationAndDistance(trisdata) &&
                    calculateTotalDurationAndDistance(trisdata).duration !==
                      "NaN hrs NaN mins" && (
                      <span style={{ color: "white" }}>
                        {calculateTotalDurationAndDistance(trisdata).distance}{" "}
                        miles
                      </span>
                    )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
