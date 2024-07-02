"use client";
import { vehicleListByClientId } from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { TripsByBucket } from "@/types/TripsByBucket";
import { IgnitionReport } from "@/types/IgnitionReport";
import React, { useEffect, useState } from "react";
import EventIcon from "@material-ui/icons/Event";
import { Toaster, toast } from "react-hot-toast";
// import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DateFnsMomemtUtils from "@date-io/moment";
import TablePagination from "@mui/material/TablePagination";
import Select from "react-select";
import { useSelector } from "react-redux";
import "./report.css";

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  DatePicker,
} from "@material-ui/pickers";

import {
  IgnitionReportByTrip,
  IgnitionReportByDailyactivity,
  IgnitionReportByIgnition,
  IgnitionReportByEvents,
  IgnitionReportByDetailReport,
  IgnitionReportByIdlingActivity,
  getAllVehicleByUserId,
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
  const [showWeekDays, setShowWeekDays] = useState(true);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [startdate, setstartdate] = useState(new Date());
  const [enddate, setenddate] = useState(new Date());
  const [customDate, setcustomDate] = useState(true);
  // suraksha code
  const [trisdata, setTrisdata] = useState<TripsByBucket[]>([]);
  const [rowsPerPages, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);

  const [tableShow, setTableShow] = useState(true);
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
  const allData = useSelector((state) => state?.zone);

  const firstIndex = currentPage * rowsPerPages;
  const lastIndex = Math.min(firstIndex + rowsPerPages, trisdata.length); // Ensure lastIndex does not exceed trisdata.length

  // Slice the data array to get the data for the current page

  const filterData = trisdata.slice(firstIndex, lastIndex);
  const handleChangeRowsPerPage = (e: any) => {
    setCurrentPage(0);
    setRowsPerPage(parseInt(e.target.value, 10));
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setCurrentPage(newPage);
  };

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
          if (allData?.vehicle.length <= 0) {
            const Data = await vehicleListByClientId({
              token: session.accessToken,
              clientId: session?.clientId,
            });
            setVehicleList(Data);
          }
          setVehicleList(allData?.vehicle);
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
  var moment = require("moment-timezone");
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
      setIsCustomPeriod(!isCustomPeriod);
      setShowWeekDays(false);
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
    // setIgnitionreport((prevReport: any) => ({
    //   ...prevReport,
    //   [fieldName]: e.toISOString().split("T")[0],
    // }));
    // setstartdate(e);
    // setenddate(e);

    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [fieldName]: e?.toISOString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      Ignitionreport.reportType &&
      Ignitionreport.VehicleReg &&
      (Ignitionreport.period === "today" ||
        Ignitionreport.period === "yesterday" ||
        Ignitionreport.period === "week" ||
        (Ignitionreport.toDateTime && Ignitionreport.fromDateTime))
    ) {
      let startDateTime;
      let endDateTime;

      if (session) {
        const { reportType, VehicleReg, period } = Ignitionreport;
        if (period === "today") {
          const today = moment().tz(session?.timezone);
          startDateTime =
            today.clone().startOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
          endDateTime =
            today.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
          // Handle other periods if needed
        }
        if (period === "yesterday") {
          const yesterday = moment().subtract(1, "day");
          startDateTime =
            yesterday.clone().startOf("day").format("YYYY-MM-DDTHH:mm:ss") +
            "Z";
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
        }
        if (period === "custom") {
          startDateTime =
            moment(startdate).startOf("day").format("YYYY-MM-DDTHH:mm:ss") +
            "Z";
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
                setTableShow(true);
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
                } else if (
                  Ignitionreport.reportType.toString() === "Ignition"
                ) {
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
                  const filteredData = response.data.tableData.filter(
                    (eventitem: { event: string }) =>
                      eventitem.event !== "ignitionOn" &&
                      eventitem.event !== "ignitionOff" &&
                      eventitem.event !== "ignition On" &&
                      eventitem.event !== "ignition Off"
                  );
                  setTrisdata(filteredData);
                  newColumnHeaders = ["event", "date", "Address"];
                  setcustomHeaderTitles(newColumnHeaders);
                } else if (
                  Ignitionreport.reportType.toString() === "IdlingActivity"
                ) {
                  // console.log("idling---------", response.data.tableData);

                  // Constructing new column headers based on the data format
                  newColumnHeaders = ["0", "1", "2"];
                  custom1HeaderTitles = ["date", "Address", "duration"];
                  setcustomHeaderTitles(custom1HeaderTitles);
                } else if (
                  Ignitionreport.reportType.toString() ===
                  "DetailReportByStreet"
                ) {
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
              } else if (response.success === false) {
                // setTrisdata(response.success);
                setTableShow(false);
                toast.error("No Data Found", {
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
    } else {
      return null; // or simply omit this else block as it defaults to undefined
    }
  };
  const handleInputChangeSelect = (e: any) => {
    if (!e) {
      return setIgnitionreport((prevReport: any) => ({
        ...prevReport,
        VehicleReg: "",
        period: "",
        // ["label"]: label,
      }));
    }
    setIgnitionreport((preData) => ({
      ...preData,
      VehicleReg: e?.value,
    }));
  };

  const handleInputChangeTrip = (e: any) => {
    if (!e) {
      return setIgnitionreport((prevReport: any) => ({
        ...prevReport,
        reportType: 0,
        period: "",
        // ["label"]: label,
      }));
    }

    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      reportType: e?.value,
    }));
  };
  const optionsTrip = [
    { value: "Trip", label: "Trip" },
    { value: "DailyActivity", label: "Daily Activity" },
    { value: "Ignition", label: "Ignition" },
    { value: "Events", label: "Events" },
    { value: "DetailReportByStreet", label: "Detail Report By Street" },
    { value: "IdlingActivity", label: "Idling Activity" },
  ];
  const options: { value: string; label: string; data: any }[] =
    vehicleList?.data?.map((item: VehicleData) => ({
      value: item.vehicleReg,
      label: item.vehicleReg,
    })) || [];
  // handle exportPdf
  const handleExportPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      Ignitionreport.reportType &&
      Ignitionreport.VehicleReg &&
      (Ignitionreport.period === "today" ||
        Ignitionreport.period === "yesterday" ||
        Ignitionreport.period === "week" ||
        (Ignitionreport.toDateTime && Ignitionreport.fromDateTime))
    ) {
      let startDateTime;
      let endDateTime;

      if (session) {
        const { reportType, VehicleReg, period } = Ignitionreport;
        if (period === "today") {
          const today = moment().tz(session?.timezone);
          startDateTime =
            today?.clone().startOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
          endDateTime =
            today?.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        }
        if (period === "yesterday") {
          const yesterday = moment().subtract(1, "day").tz(session?.timezone);
          startDateTime =
            yesterday?.clone().startOf("day").format("YYYY-MM-DDTHH:mm:ss") +
            "Z";
          endDateTime =
            yesterday?.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        }
        if (period === "week") {
          const startOfWeek = moment()
            .subtract(7, "days")
            .startOf("day")
            .tz(session?.timezone);
          const oneday = moment().subtract(1, "day");
          startDateTime = startOfWeek.format("YYYY-MM-DDTHH:mm:ss") + "Z";
          endDateTime =
            oneday?.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        }
        if (period === "custom") {
          startDateTime =
            moment(startdate).startOf("day").format("YYYY-MM-DDTHH:mm:ss") +
            "Z";
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
      } else {
        return null;
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

  const hanldeCloseDateTap = () => {
    setIsCustomPeriod(!isCustomPeriod);
    setShowWeekDays(true);
  };

  const hanldeCustomClick = () => {
    setIsCustomPeriod(!isCustomPeriod);
    setShowWeekDays(false);
  };

  return (
    <div>
      <p className="bg-green px-4 py-1 border-t-2  text-center text-2xl text-white font-bold zone_heading">
        Reports Filter
      </p>
      <form
        className="bg-bgLight  height_report_form"
        // onSubmit={handleSubmit}
      >
        <div className="bg-green-50 mt-5">
          <div className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 mt-5 mb-1 grid-cols-2  px-10 gap-2 ">
            <div className="xl:col-span-3 lg:col-span-6 md:col-span-6 sm:col-span-5 col-span-2 ">
              <div className="grid grid-cols-12 roport_vehicle">
                <div className="xl:col-span-3 lg:col-span-4 md:col-span-12  sm:col-span-10  col-span-12 mt-2 ">
                  <label className="text-labelColor ">
                    <b>Report Type:</b> &nbsp;&nbsp;
                  </label>
                </div>
                <div className="lg:col-span-8 md:col-span-8 col-span-12">
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
                    // value={Ignitionreport?.vehicleNo}
                    onChange={handleInputChangeTrip}
                    options={optionsTrip}
                    placeholder="Select Report Type"
                    isSearchable
                    isClearable
                    noOptionsMessage={() => "No options available"}
                    className="   rounded-md w-full  outline-green border border-grayLight z-50"
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
                          ? "#e1f0e3"
                          : "transparent",
                        color: state.isSelected
                          ? "white"
                          : state.isFocused
                          ? "black"
                          : "black",
                        "&:hover": {
                          backgroundColor: "#e1f0e3",
                          color: "black",
                        },
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="xl:col-span-3 lg:col-span-6 md:col-span-6 sm:col-span-7 col-span-2 lg:mt-0 md:mt-0 sm:mt-0 mt-4 ">
              <div className="grid grid-cols-12 roport_vehicle">
                <div className="lg:col-span-2 col-span-12 mt-2">
                  <label className="text-labelColor">
                    <b>Vehicle:</b> &nbsp;&nbsp;{" "}
                  </label>
                </div>
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
                <div className="lg:col-span-8 md:col-span-9 sm:col-span-9  col-span-12 ">
                  <Select
                    value={Ignitionreport.vehicleNo}
                    onChange={handleInputChangeSelect}
                    options={options}
                    placeholder="Select Vehicle"
                    isClearable
                    isSearchable
                    noOptionsMessage={() => "No options available"}
                    className="   rounded-md w-full outline-green border border-grayLight  hover:border-green z-50"
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
                          ? "#e1f0e3"
                          : "transparent",
                        color: state.isSelected
                          ? "white"
                          : state.isFocused
                          ? "black"
                          : "black",
                        "&:hover": {
                          backgroundColor: "#e1f0e3",
                          color: "black",
                        },
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
            {showWeekDays && (
              <>
                <div
                  className="xl:col-span-1 lg:col-span-2 md:col-span-2 sm:col-span-3  mt-2 report_periods_today
                  flex lg:justify-center  md:justify-center sm:justify-center justify-start
                  "
                >
                  <label>
                    <input
                      type="radio"
                      className="w-5 h-4 form-radio"
                      style={{ accentColor: "green" }}
                      name="period"
                      value="today"
                      checked={Ignitionreport.period === "today"}
                      onChange={handleInputChange}
                    />
                    &nbsp;&nbsp;<b>Today</b>
                  </label>
                </div>
                <div className="xl:col-span-1 lg:col-span-2 md:col-span-2 sm:col-span-3 mt-2 report_periods flex lg:justify-center md:justify-center sm:justify-center justify-start">
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
                    &nbsp;&nbsp;<b>Yesterday</b>
                  </label>
                </div>
                <div
                  className="xl:col-span-1 lg:col-span-2 md:col-span-2 sm:col-span-3 mt-2 
                  report_periods_today
                  flex lg:justify-center md:justify-center sm:justify-center justify-start
                  "
                >
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
                    &nbsp;&nbsp;<b>Week</b>
                  </label>
                </div>
                <div
                  className="xl:col-span-1 lg:col-span-2 md:col-span-2 sm:col-span-3 mt-2 report_periods
                  flex lg:justify-center md:justify-center sm:justify-center justify-start
                  "
                >
                  <label>
                    <input
                      type="radio"
                      className="w-5 h-4"
                      name="period"
                      value="custom"
                      style={{ accentColor: "green" }}
                      checked={Ignitionreport.period === "custom"}
                      onChange={handleInputChange}
                      onClick={hanldeCustomClick}
                    />
                    &nbsp;&nbsp;<b>Custom</b>
                  </label>
                </div>{" "}
              </>
            )}
            {isCustomPeriod && (
              <>
                <div className="xl:col-span-2 lg:col-span-3 md:col-span-4 sm:col-span-3 col-span-2 lg:mt-0 md:mt-0 sm:mt-0 mt-4">
                  <label className="text-labelColor">
                    <label className="text-green"> From Date:</label>{" "}
                    &nbsp;&nbsp;&nbsp;
                    <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                      <DatePicker
                        // open={isPickerOpenFromDate}/
                        format="MM/DD/yyyy"
                        value={Ignitionreport.fromDateTime || null}
                        onChange={(e) =>
                          handleCustomDateChange("fromDateTime", e)
                        }
                        variant="inline"
                        maxDate={currenTDates}
                        autoOk
                        inputProps={{ readOnly: true }}
                        InputProps={{
                          endAdornment: (
                            <EventIcon
                              style={{ width: "20", height: "20" }}
                              className="text-gray"
                            />
                          ),
                        }}
                        placeholder="Start Date"
                        // className="xl:w-80  lg:w-80 w-auto"
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
                <div className="xl:col-span-2 lg:col-span-3  md:col-span-4 sm:col-span-3 col-span-2 lg:mt-0 md:mt-0 sm:mt-0  w-full ">
                  <div className="grid grid-cols-12">
                    <div className="col-span-10">
                      <label className="text-green"> To Date:</label>
                      <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                        <DatePicker
                          // open={isPickerOpen}
                          format="MM/DD/yyyy"
                          value={Ignitionreport.toDateTime || null}
                          onChange={(newDate: any) =>
                            handleCustomDateChange("toDateTime", newDate)
                          }
                          variant="inline"
                          maxDate={currenTDates}
                          autoOk
                          inputProps={{ readOnly: true }}
                          placeholder="End Date"
                          InputProps={{
                            endAdornment: (
                              <EventIcon
                                style={{ width: "20", height: "20" }}
                                className="text-gray"
                              />
                            ),
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    </div>
                    <div className="lg:col-span-2 md:col-span-2 sm:col-span-2 col-span-2 lg:mt-0 md:mt-0 sm:mt-0 lg:ms-0 md:ms-0 sm:ms-0 -mt-16 ms-4">
                      <button
                        className="text-green -mt-5 -mb-5 text-2xl font-bold"
                        onClick={hanldeCloseDateTap}
                      >
                        x
                      </button>
                    </div>
                  </div>

                  {/* <input
                  type="date"
                  className="h-8 lg:w-4/6 w-full  text-labelColor  outline-green border border-grayLight px-1"
                  name="toDateTime"
                  onChange={(e) =>
                    handleCustomDateChange("toDateTime", e.target.value)
                  }
                /> */}
                </div>
              </>
            )}
            <div
              className="xl:col-span-1 lg:col-span-2 md:col-span-2 sm:col-span-3 submit_report_btn "
              id="submit_btn"
            >
              <button
                className={`bg-green py-2 px-5 mb-5 rounded-md shadow-md  hover:shadow-gray transition duration-500 text-white
                        ${
                          Ignitionreport.reportType &&
                          Ignitionreport.VehicleReg &&
                          (Ignitionreport.period === "today" ||
                            Ignitionreport.period === "yesterday" ||
                            Ignitionreport.period === "week" ||
                            (Ignitionreport.toDateTime &&
                              Ignitionreport.fromDateTime))
                            ? ""
                            : "opacity-50 cursor-not-allowed"
                        }`}
                // disabled={customDate}
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
            </div>
            <div className="xl:col-span-1 lg:col-span-2 sm:col-span-3 md:col-span-2 -ms-5 submit_report_btn">
              <button
                className={`bg-green py-2 px-5 mb-5 rounded-md shadow-md  hover:shadow-gray transition duration-500 text-white
                ${
                  Ignitionreport.reportType &&
                  Ignitionreport.VehicleReg &&
                  (Ignitionreport.period === "today" ||
                    Ignitionreport.period === "yesterday" ||
                    Ignitionreport.period === "week" ||
                    (Ignitionreport.toDateTime && Ignitionreport.fromDateTime))
                    ? ""
                    : "opacity-50 cursor-not-allowed"
                }`}
                onClick={handleExportPdf}
              >
                Export Pdf
              </button>
            </div>
          </div>

          <div className=" grid lg:grid-cols-8  mb-5 md:grid-cols-6 sm:grid-cols-5 gap-5 lg:text-center lg:mx-52 md:mx-24 sm:mx-10   justify-center">
            {/* <div className="lg:col-span-2 md:col-span-2 sm:col-span-2">
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
            </div> */}
          </div>

          {/* {isCustomPeriod && (
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
              </div>
            </div>
          )} */}
          {/* <div className="text-white h-20 flex justify-center items-center">
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
            </div> */}
        </div>
      </form>

      {/* Render your table below the form */}

      {trisdata && trisdata.length > 0 && tableShow && (
        <div>
          <div className="mt-8 mx-auto height_table">
            <div style={{ width: "100%", borderRadius: "2px" }}>
              <table className="w-full border-collapse border border-gray-300">
                <thead
                  style={{ position: "sticky", top: -1 }}
                  className="bg-green"
                >
                  <tr>
                    {customHeaderTitles.map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-4 py-2"
                      >
                        <p className="text-white text-start font-popins font-medium">
                          {header}
                        </p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filterData?.map((trip, tripIndex) => (
                    <tr key={tripIndex}>
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
                              ? `${
                                  trip.OsmElement.display_name.split(",")[0]
                                } ${
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
                          <span style={{ color: "white" }}>&nbsp; Total:</span>
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
                            {
                              calculateTotalDurationAndDistance(trisdata)
                                .duration
                            }
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
                            {
                              calculateTotalDurationAndDistance(trisdata)
                                .distance
                            }{" "}
                            {session?.unit}
                          </span>
                        )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            className="pagination-wrapper"
            style={{ width: "100%" }} // Set the width to 100% using inline style
          >
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={trisdata.length}
              rowsPerPage={rowsPerPages}
              page={currentPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              className="report_paginations_one"
            />
          </div>
        </div>
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
