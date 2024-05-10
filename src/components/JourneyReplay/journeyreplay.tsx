"use client";
import React, { useEffect, useState } from "react";
import DateFnsMomemtUtils from "@date-io/moment";
import { DatePicker } from "@material-ui/pickers";
import BlinkingTime from "@/components/General/BlinkingTime";
import axios, { all } from "axios";
import PlaceIcon from "@mui/icons-material/Place";
import EventIcon from "@material-ui/icons/Event";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import dynamic from "next/dynamic";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import moment from "moment-timezone";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import Image from "next/image";
import { Popup } from "react-leaflet";
import harshIcon from "../../../public/Images/HarshBreak.png";
import HarshAccelerationIcon from "../../../public/Images/HarshAccelerationIcon.png";
import markerA from "../../../public/Images/marker-a.png";
import markerB from "../../../public/Images/marker-b.png";
import harshAcceleration from "../../../public/Images/brake-discs.png";
import { useSelector } from "react-redux";
import Speedometer, {
  Background,
  Arc,
  Needle,
  Progress,
  Marks,
  Indicator
} from "react-speedometer";
import {
  TravelHistoryByBucketV2,
  TravelHistoryByBucketV3,
  TripsByBucketAndVehicleV3,
  TripsByBucketAndVehicle,
  getAllVehicleByUserId,
  // getClientSettingByClinetIdAndToken,
  getCurrentAddress,
  // getZoneListByClientId,
  vehicleListByClientId
} from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { zonelistType } from "@/types/zoneType";
import { ClientSettings } from "@/types/clientSettings";
import { replayreport } from "@/types/IgnitionReport";
import TripsByBucket, { TravelHistoryData } from "@/types/TripsByBucket";
import L, { LatLng, LatLngTuple } from "leaflet";
import { Marker } from "react-leaflet/Marker";
import { Toaster, toast } from "react-hot-toast";
import { useMap } from "react-leaflet";
import {
  Tripaddressresponse,
  calculateZoomCenter,
  createMarkerIcon
} from "@/utils/JourneyReplayFunctions";
import { StopAddressData } from "@/types/StopDetails";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { Tooltip, Button } from "@material-tailwind/react";
// import Select from "react-select";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";

import MenuItem from "@mui/material/MenuItem";
// import Select from "@mui/material/Select";
import car_icon from "../../../public/Images/journey_car_icon.png";
import Select from "react-select";

// const { Option } = Select;
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 50
    }
  }
};

import "./index.css";
interface Option {
  value: string;
  label: string;
}

const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((module) => module.Polyline),
  { ssr: false }
);
const Polygon = dynamic(
  () => import("react-leaflet").then((module) => module.Polygon),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((module) => module.Circle),
  { ssr: false }
);

function filterWeekends(date: any) {
  // Return false if Saturday or Sunday
  return date.value === 0 || date === 6;
}
import { makeStyles } from "@mui/styles";
import Slider from "@mui/material/Slider";

// Define custom styles using makeStyles
const useStyles = makeStyles((theme) => ({
  select: {
    "&:before": {
      borderColor: "green" // Change this to the desired border color
    },
    "&:after": {
      borderColor: "green" // Change this to the desired border color
    }
  }
}));
export default function journeyReplayComp() {
  const { data: session } = useSession();
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const [clientsetting, setClientsetting] = useState<ClientSettings[] | null>(
    null
  );
  const [stops, setstops] = useState<any>([]);
  const [dataresponse, setDataResponse] = useState<any>();
  const [TravelHistoryresponse, setTravelHistoryresponse] = useState<
    TravelHistoryData[]
  >([]);
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  const [mapcenter, setMapcenter] = useState<LatLngTuple | null>(null);
  const [mapcenterToFly, setMapcenterToFly] = useState<LatLngTuple | null>(
    null
  );
  const [zoomToFly, setzoomToFly] = useState(10);
  const [zoom, setzoom] = useState(10);
  const [polylinedata, setPolylinedata] = useState<[number, number][]>([]);
  const [Ignitionreport, setIgnitionreport] = useState<any>({
    TimeZone: session?.timezone || "",
    VehicleReg: "",
    clientId: session?.clientId || "",
    // fromDateTime: new Date(),
    fromDateTime: "",
    period: "",
    // toDateTime: new Date(),
    toDateTime: "",
    unit: session?.unit || ""
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [carPosition, setCarPosition] = useState<LatLng | null>(null);
  const [carMovementInterval, setCarMovementInterval] = useState<
    NodeJS.Timeout | undefined
  >(undefined);
  const [speedFactor, setSpeedFactor] = useState<any>(1);
  const [showZones, setShowZones] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPauseColor, setIsPauseColor] = useState(false);
  const [TripAddressData, setTripAddressData] = useState("");
  const [stopDetails, setStopDetails] = useState<StopAddressData[]>([]);
  const [progressWidth, setProgressWidth] = useState<any>(0);
  const [getShowRadioButton, setShowRadioButton] = useState(false);
  const [getShowdetails, setShowDetails] = useState(false);
  const [getShowICon, setShowIcon] = useState(false);
  const [clearMapData, setClearMapData] = useState(false);
  const [getCheckedInput, setCheckedInput] = useState<any>(false);
  const [currentDate, setCurrentDate] = useState("");
  const [currentDateDefault, setCurrentDateDefaul] = useState(false);
  const [currentToDateDefault, setCurrentToDateDefaul] = useState(false);
  const [isDynamicTime, setIsDynamicTime] = useState<any>([]);
  const [stopVehicle, setstopVehicle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDates, setCurrentDates] = useState<any>(0);
  const [weekDataGrouped, setweekDataGrouped] = useState(false);
  const [weekData, setWeekData] = useState(false);
  const [playbtn, setPlayBtn] = useState(false);
  const [stopbtn, setStopBtn] = useState(false);
  const [pausebtn, setPauseBtn] = useState(false);
  const [stopDetailsOpen, setStopDetailsOpen] = useState(false);
  const [activeTripColor, setactiveTripColor] = useState<any>("");
  const [loadingMap, setLaodingMap] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [searchJourney, setsearchJourney] = useState(true);
  const [seacrhLoading, setSearchLoading] = useState(true);
  const [fromDateInput, setFromDateInput] = useState(false);
  const [harshPopUp, setHarshPopUp] = useState(true);
  const [harshAccPopUp, setAccHarshPopUp] = useState(true);
  const [addressTravelHistory, setAddressTravelHistory] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isPickerOpenFromDate, setIsPickerOpenFromDate] = useState(false);

  const [travelV2, setTravelV2] = useState(false);
  const [travelV3, setTravelV3] = useState(false);

  const handleChange = (panel: any) => (event: any, isExpanded: any) => {
    setExpanded(isExpanded ? panel : null);
  };
  const allData = useSelector((state) => state?.zone);
  // useEffect(() => {
  //   setZoneList(allZones?.zone);
  // }, [allZones]);

  const moment = require("moment-timezone");
  const togglePicker = () => {
    setIsPickerOpen(!isPickerOpen);
  };
  const togglePickerFromDate = () => {
    setIsPickerOpenFromDate(!isPickerOpenFromDate);
  };
  const SetViewOnClick = ({ coords }: { coords: any }) => {
    if (isPaused) {
      setMapcenterToFly(null);
      setzoomToFly(0);
    }

    const map = useMap();
    if (coords) {
      if (coords) {
        if (speedFactor == 2) {
          map.setView(coords, 16);
        } else if (speedFactor == 1) {
          map.setView(coords, 16);
        } else if (speedFactor == 4) {
          map.setView(coords, 16);
        } else if (speedFactor == 6) {
          map.setView(coords, 14);
        } else {
          map.setView(coords, 16);
        }
      }
    }
    return null;
  };

  const SetViewfly = ({ coords, zoom }: { coords: any; zoom: number }) => {
    const map = useMap();
    if (coords && !Number.isNaN(coords[0]) && coords[0] != null) {
      map.flyTo(coords, zoom);
    }

    return null;
  };

  const tick = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setSpeedFactor(1);
    setPlayBtn(false);
    setStopBtn(true);
    setPauseBtn(true);
    setstopVehicle(false);
    setIsPauseColor(false);
    setHarshPopUp(false);
    setAccHarshPopUp(false);

    if (!carMovementInterval) {
      if (currentPositionIndex >= polylinedata.length) {
        setCurrentPositionIndex(0);
      }
    }
  };
  const pauseTick = async () => {
    setIsPlaying(false);
    setPauseBtn(false);
    setStopBtn(true);
    setPlayBtn(true);
    setstopVehicle(false);
    setIsPauseColor(true);
    setIsPaused(true);
    setHarshPopUp(true);
    setAccHarshPopUp(true);

    if (carMovementInterval) {
      clearInterval(carMovementInterval);
      setCarMovementInterval(undefined);
    }
    if (carPosition && session) {
      const Dataresponse = await Tripaddressresponse(
        carPosition?.lat,
        carPosition?.lng,
        session?.accessToken
      );
      setTripAddressData(Dataresponse);
    }
  };
  const stopTick = async () => {
    setIsPlaying(false);
    setIsPaused(false);
    setPlayBtn(true);
    setPauseBtn(false);
    setIsPauseColor(false);
    setStopBtn(false);
    setstopVehicle(true);
    setHarshPopUp(true);
    setAccHarshPopUp(true);
    setProgressWidth(0);
    if (polylinedata.length > 0) {
      setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][1]));
    }
    setCurrentPositionIndex(0);
  };

  useEffect(() => {
    if (isPlaying && !isPaused) {
      const totalSteps = TravelHistoryresponse.length - 1;
      let step = currentPositionIndex;

      const currentData = TravelHistoryresponse[step];
      const nextData = TravelHistoryresponse[step + 1];
      const addRessOne: any = TravelHistoryresponse[step];
      const addressSplit = addRessOne?.address?.display_name?.split(",");
      setAddressTravelHistory(addressSplit);

      if (currentData && nextData) {
        const currentLatLng = new L.LatLng(currentData.lat, currentData.lng);
        const nextLatLng = new L.LatLng(nextData.lat, nextData.lng);
        // const address=new L.latLng()

        const totalObjects = TravelHistoryresponse.length;
        let numSteps;
        let stepSize: number;
        if (speedFactor == 2) {
          numSteps = 190;
          stepSize = (1 / numSteps) * speedFactor * 0.9;
        } else if (speedFactor == 4) {
          numSteps = 380;
          stepSize = (1 / numSteps) * speedFactor * 0.9;
        } else if (speedFactor == 6) {
          numSteps = 560;
          stepSize = (1 / numSteps) * speedFactor * 0.9;
        } else {
          numSteps = 100;
          stepSize = (1 / numSteps) * speedFactor * 0.9;
        }

        let progress: number = 0;
        let animationId: number;

        const updatePosition = () => {
          if (progress < 1) {
            const interpolatedLatLng = new L.LatLng(
              currentLatLng.lat +
                (nextLatLng.lat - currentLatLng.lat) * progress,
              currentLatLng.lng +
                (nextLatLng.lng - currentLatLng.lng) * progress
            );

            setMapcenter([interpolatedLatLng.lat, interpolatedLatLng.lng]);
            progress += stepSize * speedFactor;

            animationId = requestAnimationFrame(updatePosition);
            setCarPosition(interpolatedLatLng);
            const newProgress = Math.round(
              ((currentPositionIndex + 1.8) / totalObjects) * 100
            );
            setProgressWidth(newProgress);
          } else {
            step++;
            setCurrentPositionIndex(step);

            if (step < totalSteps) {
              progress = 0;
            } else {
              setIsPlaying(false);
              const { zoomlevel, centerLat, centerLng } = calculateZoomCenter(
                TravelHistoryresponse
              );
              setCurrentPositionIndex(0);
              setMapcenterToFly([centerLat, centerLng]);
              setzoomToFly(zoomlevel);
              setzoom(zoomlevel);
              setPlayBtn(true);
              setPauseBtn(false);
              setStopBtn(false);
            }
          }
        };

        animationId = requestAnimationFrame(updatePosition);
        return () => {
          cancelAnimationFrame(animationId);
        };
      }
    } else if (isPaused) {
      pauseTick();
    } else {
      // stopTick();
    }
  }, [
    isPlaying,
    currentPositionIndex,
    isPaused,
    TravelHistoryresponse,
    speedFactor,
    stopVehicle
  ]);
  // console.log("TravelHistoryresponse", TravelHistoryresponse);
  useEffect(() => {
    if (polylinedata.length > 0) {
      setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][1]));
      setMapcenter([polylinedata[0][0], polylinedata[0][1]]);
    }
  }, [polylinedata]);

  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "SuperAmin") {
          if (session) {
            if (allData?.vehicle.length <= 0) {
              const Data = await vehicleListByClientId({
                token: session.accessToken,
                clientId: session?.clientId
              });
              setVehicleList(Data);
            }
            setVehicleList(allData?.vehicle);
          }
        } else {
          if (session) {
            const data = await getAllVehicleByUserId({
              token: session.accessToken,
              userId: session.userId
            });
            setVehicleList(data);
          }
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleListData();
    // (async function () {
    //   if (session) {

    //     await dispatch(
    //       fetchZone({
    //         token: session?.accessToken,
    //         clientId: session?.clientId,
    //       })
    //     );
    //   }
    // })();

    (async function () {
      if (session) {
        // const clientSettingData = await getClientSettingByClinetIdAndToken({
        //   token: session?.accessToken,
        //   clientId: session?.clientId,
        // });
        if (session) {
          const centervalue = await session?.clientSetting.filter(
            (item: any) => item.PropertDesc == "Map"
          );
          const centerMapValue = centervalue.map((item) => item.PropertyValue);

          if (centerMapValue) {
            const match = centerMapValue?.[0]?.match(
              /\{lat:([^,]+),lng:([^}]+)\}/
            );
            if (match) {
              const lat = parseFloat(match[1]);
              const lng = parseFloat(match[2]);

              if (!isNaN(lat) && !isNaN(lng)) {
                setMapcenter([lat, lng]);
              }
            }
          }
          setClientsetting(session?.clientSetting);
          const clientZoomSettings = clientsetting?.filter(
            (el) => el?.PropertDesc === "Zoom"
          )[0]?.PropertyValue;
          const zoomLevel = clientZoomSettings
            ? parseInt(clientZoomSettings)
            : 13;
          setzoom(zoomLevel);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const clientZoomSettings = clientsetting?.filter(
      (el) => el?.PropertDesc === "Zoom"
    )[0]?.PropertyValue;
    const zoomLevel = clientZoomSettings ? parseInt(clientZoomSettings) : 11;
    setzoom(zoomLevel);
  }, [clientsetting]);

  let currentTime = new Date().toLocaleString("en-US", {
    timeZone: session?.timezone
  });

  let timeOnly = currentTime.split(",")[1].trim();
  timeOnly = timeOnly.replace(/\s+[APap][Mm]\s*$/, "");

  const [hours, minutes, seconds] = timeOnly
    .split(":")
    .map((part) => part.trim());

  const formattedHours = hours.padStart(2, "0");
  const formattedMinutes = minutes.padStart(2, "0");
  const formattedSeconds = seconds.padStart(2, "0");

  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10); // Format the date as 'YYYY-MM-DD'
    setCurrentDate(formattedDate);
  }, []);

  const handleCloseDateTime = () => {
    setShowRadioButton(false);
    setFromDateInput(true);
    setIgnitionreport((preData: any) => ({
      ...preData,
      fromDateTime: "",
      toDateTime: ""
    }));

    // setIgnitionreport({
    //   fromDateTime: "",
    //   toDateTime: "",
    // });
  };
  const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  const parsedDateTime = new Date(currentTime);
  const formattedDateTime = `${parsedDateTime}
    .toISOString()
    .slice(0, 10)}TO${timeOnly}`;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTravelV3(false);
    setTravelV2(true);
    setIsDynamicTime("");
    setstops([]);
    setIsPaused(false);
    setPlayBtn(false);
    setStopBtn(false);
    setPauseBtn(false);
    setLaodingMap(false);
    setIsPlaying(false);
    setCarPosition(null);
    setactiveTripColor("");
    setTravelHistoryresponse([]);
    setClearMapData(false);
    setProgressWidth(0);
    setLoading(true);
    // setSearchLoading(true);
    setDataResponse(null);
    setExpanded(null);
    setSearchLoading(false);
    if (polylinedata.length > 0) {
      setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][0]));
    }
    setCurrentPositionIndex(0);
    setClearMapData(true);
    if (
      (Ignitionreport?.VehicleReg && Ignitionreport?.period === "today") ||
      (Ignitionreport?.VehicleReg && Ignitionreport?.period === "yesterday") ||
      (Ignitionreport?.VehicleReg && Ignitionreport?.period === "week") ||
      (Ignitionreport?.VehicleReg &&
        Ignitionreport?.VehicleReg &&
        Ignitionreport?.toDateTime &&
        Ignitionreport?.fromDateTime)
    ) {
      if (session) {
        const { VehicleReg, period } = await Ignitionreport;
        if (period == "week") {
          setWeekData(true);
        }
        if (period == "today") {
          setWeekData(false);
        }
        if (VehicleReg && period) {
          let newdata = {
            ...Ignitionreport
          };
          const timestart: string = "00:00:00";
          const timeend: string = "23:59:59";
          const currentDayOfWeek = new Date().getDay();
          const currentDay = new Date().getDay();
          const daysUntilMonday =
            currentDayOfWeek === currentDay ? 7 : currentDayOfWeek - 1;
          const fromDateTime = new Date();
          fromDateTime.setDate(fromDateTime.getDate() - daysUntilMonday);
          const toDateTime = new Date(fromDateTime);
          toDateTime.setDate(toDateTime.getDate() + 6);
          const formattedFromDateTime = formatDate(fromDateTime);
          const formattedToDateTime = formatDate(toDateTime);
          if (isCustomPeriod) {
            newdata = {
              ...newdata,
              fromDateTime: `${
                weekData ? formattedFromDateTime : Ignitionreport.fromDateTime
              }T${timestart}Z`,
              toDateTime: `${
                weekData ? formattedToDateTime : Ignitionreport.toDateTime
              }T${timeend}Z`
            };
          } else {
            newdata = {
              ...newdata,
              fromDateTime: `${
                weekData ? formattedFromDateTime : currentDate
              }T${timestart}Z`,
              toDateTime: `${
                weekData ? formattedToDateTime : currentDate
              }T${timeend}Z`
            };
          }
          const fromDate: any = new Date(Ignitionreport?.fromDateTime);
          const toDate: any = new Date(Ignitionreport?.toDateTime);

          const differenceMs = toDate - fromDate;
          const differenceDays = differenceMs / (1000 * 60 * 60 * 24);
          // setIgnitionreport(newdata);
          // if (
          //   Ignitionreport.period == "today" ||
          //   Ignitionreport.period == "yesterday"
          // ) {
          //   setTimeout(() => setweekDataGrouped(false), 1000);
          // }
          // if (
          //   Ignitionreport.period == "week" ||
          //   Ignitionreport.period == "custom"
          // ) {
          //   setTimeout(() => setweekDataGrouped(true), 3000);
          // }
          if (differenceDays > 5 || differenceDays < 0) {
            toast.error("please Select 0nly Five Days");
          } else {
            try {
              const response = await toast.promise(
                TripsByBucketAndVehicle({
                  token: session.accessToken,
                  payload: newdata
                }),

                {
                  loading: "Loading...",
                  success: "",
                  error: ""
                },
                {
                  style: {
                    border: "1px solid #00B56C",
                    padding: "16px",
                    color: "#1A202C"
                  },
                  success: {
                    duration: 10,
                    iconTheme: {
                      primary: "#00B56C",
                      secondary: "#FFFAEE"
                    }
                  },
                  error: {
                    duration: 10,
                    iconTheme: {
                      primary: "#00B56C",
                      secondary: "#FFFAEE"
                    }
                  }
                }
              );
              if (
                Ignitionreport.period == "today" ||
                Ignitionreport.period == "yesterday"
              ) {
                // setTimeout(() => setweekDataGrouped(false), 1000);
                setweekDataGrouped(false);
              }
              if (
                Ignitionreport.period == "week" ||
                Ignitionreport.period == "custom"
              ) {
                // setTimeout(() => setweekDataGrouped(true), 3000);
                setweekDataGrouped(true);
              }
              setDataResponse(response?.data);

              if (response.success === true) {
                toast.success(`${response.message}`, {
                  style: {
                    border: "1px solid #00B56C",
                    padding: "16px",
                    color: "#1A202C"
                  },
                  duration: 4000,
                  iconTheme: {
                    primary: "#00B56C",
                    secondary: "#FFFAEE"
                  }
                });
              } else {
                toast.error(`${response.message}`, {
                  style: {
                    border: "1px solid red",
                    padding: "16px",
                    color: "red"
                  },
                  iconTheme: {
                    primary: "red",
                    secondary: "white"
                  }
                });
              }
            } catch (error) {
              console.error(`Error calling API for ${newdata}:`, error);
            }
          }
        }
      }
    }
    setSearchLoading(true);
    setLoading(false);
  };

  const handleSubmitTwo = async (e: React.FormEvent) => {
    setTravelV3(true);

    setTravelV2(false);
    e.preventDefault();
    setIsDynamicTime("");
    setstops([]);
    setIsPaused(false);
    setPlayBtn(false);
    setStopBtn(false);
    setPauseBtn(false);
    setLaodingMap(false);
    setIsPlaying(false);
    setCarPosition(null);
    setactiveTripColor("");
    setTravelHistoryresponse([]);
    setClearMapData(false);
    setProgressWidth(0);
    setLoading(true);
    // setSearchLoading(true);
    setDataResponse(null);
    setExpanded(null);
    setSearchLoading(false);
    if (polylinedata.length > 0) {
      setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][0]));
    }
    setCurrentPositionIndex(0);
    setClearMapData(true);
    if (
      (Ignitionreport?.VehicleReg && Ignitionreport?.period === "today") ||
      (Ignitionreport?.VehicleReg && Ignitionreport?.period === "yesterday") ||
      (Ignitionreport?.VehicleReg && Ignitionreport?.period === "week") ||
      (Ignitionreport?.VehicleReg &&
        Ignitionreport?.VehicleReg &&
        Ignitionreport?.toDateTime &&
        Ignitionreport?.fromDateTime)
    ) {
      if (session) {
        const { VehicleReg, period } = await Ignitionreport;
        if (period == "week") {
          setWeekData(true);
        }
        if (period == "today") {
          setWeekData(false);
        }
        if (VehicleReg && period) {
          let newdata = {
            ...Ignitionreport
          };
          const timestart: string = "00:00:00";
          const timeend: string = "23:59:59";
          const currentDayOfWeek = new Date().getDay();
          const currentDay = new Date().getDay();
          const daysUntilMonday =
            currentDayOfWeek === currentDay ? 7 : currentDayOfWeek - 1;
          const fromDateTime = new Date();
          fromDateTime.setDate(fromDateTime.getDate() - daysUntilMonday);
          const toDateTime = new Date(fromDateTime);
          toDateTime.setDate(toDateTime.getDate() + 6);
          const formattedFromDateTime = formatDate(fromDateTime);
          const formattedToDateTime = formatDate(toDateTime);
          if (isCustomPeriod) {
            newdata = {
              ...newdata,
              fromDateTime: `${
                weekData ? formattedFromDateTime : Ignitionreport.fromDateTime
              }T${timestart}Z`,
              toDateTime: `${
                weekData ? formattedToDateTime : Ignitionreport.toDateTime
              }T${timeend}Z`
            };
          } else {
            newdata = {
              ...newdata,
              fromDateTime: `${
                weekData ? formattedFromDateTime : currentDate
              }T${timestart}Z`,
              toDateTime: `${
                weekData ? formattedToDateTime : currentDate
              }T${timeend}Z`
            };
          }
          const fromDate: any = new Date(Ignitionreport?.fromDateTime);
          const toDate: any = new Date(Ignitionreport?.toDateTime);

          const differenceMs = toDate - fromDate;

          const differenceDays = differenceMs / (1000 * 60 * 60 * 24);

          // setIgnitionreport(newdata);
          // if (
          //   Ignitionreport.period == "today" ||
          //   Ignitionreport.period == "yesterday"
          // ) {
          //   setTimeout(() => setweekDataGrouped(false), 1000);
          // }
          // if (
          //   Ignitionreport.period == "week" ||
          //   Ignitionreport.period == "custom"
          // ) {
          //   setTimeout(() => setweekDataGrouped(true), 3000);
          // }
          if (differenceDays > 5 || differenceDays < 0) {
            toast.error("please Select 0nly Five Days");
          } else {
            try {
              const response = await toast.promise(
                TripsByBucketAndVehicleV3({
                  token: session.accessToken,
                  payload: newdata
                }),

                {
                  loading: "Loading...",
                  success: "",
                  error: ""
                },
                {
                  style: {
                    border: "1px solid #00B56C",
                    padding: "16px",
                    color: "#1A202C"
                  },
                  success: {
                    duration: 10,
                    iconTheme: {
                      primary: "#00B56C",
                      secondary: "#FFFAEE"
                    }
                  },
                  error: {
                    duration: 10,
                    iconTheme: {
                      primary: "#00B56C",
                      secondary: "#FFFAEE"
                    }
                  }
                }
              );
              if (
                Ignitionreport.period == "today" ||
                Ignitionreport.period == "yesterday"
              ) {
                // setTimeout(() => setweekDataGrouped(false), 1000);
                setweekDataGrouped(false);
              }
              if (
                Ignitionreport.period == "week" ||
                Ignitionreport.period == "custom"
              ) {
                // setTimeout(() => setweekDataGrouped(true), 3000);
                setweekDataGrouped(true);
              }
              setDataResponse(response?.data);

              if (response.success === true) {
                toast.success(`${response.message}`, {
                  style: {
                    border: "1px solid #00B56C",
                    padding: "16px",
                    color: "#1A202C"
                  },
                  duration: 4000,
                  iconTheme: {
                    primary: "#00B56C",
                    secondary: "#FFFAEE"
                  }
                });
              } else {
                toast.error(`${response.message}`, {
                  style: {
                    border: "1px solid red",
                    padding: "16px",
                    color: "red"
                  },
                  iconTheme: {
                    primary: "red",
                    secondary: "white"
                  }
                });
              }
            } catch (error) {
              console.error(`Error calling API for ${newdata}:`, error);
            }
          }
        }
      }
    }
    setSearchLoading(true);
    setLoading(false);
  };

  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // var stopPoints = [];
  // const result = TravelHistoryresponse.map((item) => {
  //   if (item.speed === "0 Kph") return item;
  // });
  // console.log(result);
  // if (TravelHistoryresponse.speed == "KM") {
  //   stopPoints = res.data
  //     .filter((x: any) => x.speed == "0 Kph")
  //     .sort((x) => x.date);
  // } else {
  //   stopPoints = res.data
  //     .filter((x: any) => x.speed == "0 Mph")
  //     .sort((x) => x.date);
  // }
  const handleClickClear = () => {
    setPolylinedata([]);
    setCarPosition(null);
    setTravelHistoryresponse([]);
    setIsPlaying(false);
    setClearMapData(false);
    setIsDynamicTime("");
    setstops([]);
    setPlayBtn(false);
    setStopBtn(false);
    setPauseBtn(false);
    setactiveTripColor("");
    setProgressWidth(0);
    if (polylinedata.length > 0) {
      setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][0]));
    }
    setCurrentPositionIndex(0);
  };
  const handleClick = () => {
    setShowRadioButton(!getShowRadioButton);
  };

  function getFormattedDate(date: any) {
    return date.toISOString().slice(0, 10);
  }

  let displayName: any;
  const handleDivClick = async (
    TripStart: TripsByBucket["TripStart"],
    TripEnd: TripsByBucket["TripEnd"]
  ) => {
    setlat(null);
    setlng(null);
    setPlayBtn(true);
    setStopBtn(false);
    setStopDetailsOpen(true);
    setIsPlaying(false);
    setIsPaused(false);
    setstopVehicle(false);
    try {
      setTravelHistoryresponse([]);
      setIsPauseColor(false);
      setProgressWidth(0);
      // if (polylinedata.length > 0) {
      //   setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][0]));
      // }
      setCurrentPositionIndex(0);
      if (session) {
        let newresponsedata = {
          ...Ignitionreport,
          fromDateTime: `${TripStart}`,
          toDateTime: `${TripEnd}`
        };
        setLaodingMap(false);
        const TravelHistoryresponseapi = await toast.promise(
          TravelHistoryByBucketV2({
            token: session.accessToken,
            payload: newresponsedata
          }),
          {
            loading: "Loading...",
            success: "",
            error: ""
          },
          {
            style: {
              border: "1px solid #00B56C",
              padding: "16px",
              color: "#1A202C"
            },
            success: {
              duration: 10,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE"
              }
            },
            error: {
              duration: 10,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE"
              }
            }
          }
        );
        // if (session?.unit == "Mile") {
        //   unit = "Mph";
        // } else {
        //   unit = "Kph";
        // }
        var stopPoints = [];
        if (session?.unit == "KM") {
          stopPoints = TravelHistoryresponseapi.data
            .filter((x: any) => x.speed == "0 Kph")
            .sort((x: any) => x.date);
        } else {
          stopPoints = TravelHistoryresponseapi.data
            .filter((x: any) => x.speed == "0 Mph")
            .sort((x: any) => x.date);
        }
        // displayName = TravelHistoryresponse.map((item) => {
        //   return item?.address?.display_name;
        // });
        var addresses: any = [];
        if (TravelHistoryresponse)
          stopPoints.map(async function (singlePoint: any) {
            let completeAddress;
            if (!singlePoint.address?.display_name) {
              completeAddress = await axios
                .get(
                  `http://osm.vtracksolutions.com/nominatim/reverse.php?lat=${singlePoint.lat}&lon=${singlePoint.lng}&zoom=19&format=jsonv2`
                )
                .then(async (response: any) => {
                  return response.data;
                });
            } else {
              completeAddress = singlePoint.address;
            }

            var record: any = {};
            record["_id"] = singlePoint._id;
            record["lat"] = singlePoint.lat;
            record["lng"] = singlePoint.lng;
            record["date"] = singlePoint.date;
            record["speed"] = singlePoint.speed;
            record["TimeStamp"] = singlePoint.TimeStamp;
            record["address"] = completeAddress.display_name;
            if (
              addresses.filter(
                (x: any) => x.lat == record.lat && x.lng == record.lng
              ).length == 0
            ) {
              addresses.push(record);
            }
          });
        setstops(
          addresses.sort((a: any, b: any) => {
            return moment(a.date).diff(b.date);
          })
        );
        // }

        setTravelHistoryresponse(TravelHistoryresponseapi.data);
      }
    } catch (error) {
      console.error(`Error calling API for:`, error);
    }
    setLaodingMap(true);
  };
  const handleDivClickv3 = async (
    TripStart: TripsByBucket["TripStart"],
    TripEnd: TripsByBucket["TripEnd"],
    id: any
  ) => {
    setlat(null);
    setlng(null);
    setPlayBtn(true);
    setStopBtn(false);
    setStopDetailsOpen(true);
    setIsPlaying(false);
    setIsPaused(false);
    setstopVehicle(false);

    try {
      setTravelHistoryresponse([]);
      setIsPauseColor(false);
      setProgressWidth(0);
      // if (polylinedata.length > 0) {
      //   setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][0]));
      // }
      setCurrentPositionIndex(0);
      if (session) {
        let newresponsedata = {
          ...Ignitionreport,
          fromDateTime: `${TripStart}`,
          toDateTime: `${TripEnd}`,
          id: id
        };
        setLaodingMap(false);
        const TravelHistoryresponseapi = await toast.promise(
          TravelHistoryByBucketV3({
            token: session.accessToken,
            payload: newresponsedata
          }),
          {
            loading: "Loading...",
            success: "",
            error: ""
          },
          {
            style: {
              border: "1px solid #00B56C",
              padding: "16px",
              color: "#1A202C"
            },
            success: {
              duration: 10,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE"
              }
            },
            error: {
              duration: 10,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE"
              }
            }
          }
        );
        // if (session?.unit == "Mile") {
        //   unit = "Mph";
        // } else {
        //   unit = "Kph";
        // }
        var stopPoints = [];
        if (session?.unit == "KM") {
          stopPoints = TravelHistoryresponseapi.data
            .filter((x: any) => x.speed == "0 Kph")
            .sort((x: any) => x.date);
        } else {
          stopPoints = TravelHistoryresponseapi.data
            .filter((x: any) => x.speed == "0 Mph")
            .sort((x: any) => x.date);
        }
        // displayName = TravelHistoryresponse.map((item) => {
        //   return item?.address?.display_name;
        // });
        var addresses: any = [];
        if (TravelHistoryresponse)
          stopPoints.map(async function (singlePoint: any) {
            let completeAddress;
            if (!singlePoint.address?.display_name) {
              completeAddress = await axios
                .get(
                  `http://osm.vtracksolutions.com/nominatim/reverse.php?lat=${singlePoint.lat}&lon=${singlePoint.lng}&zoom=19&format=jsonv2`
                )
                .then(async (response: any) => {
                  return response.data;
                });
            } else {
              completeAddress = singlePoint.address;
            }

            var record: any = {};
            record["_id"] = singlePoint._id;
            record["lat"] = singlePoint.lat;
            record["lng"] = singlePoint.lng;
            record["date"] = singlePoint.date;
            record["speed"] = singlePoint.speed;
            record["TimeStamp"] = singlePoint.TimeStamp;
            record["address"] = completeAddress.display_name;
            if (
              addresses.filter(
                (x: any) => x.lat == record.lat && x.lng == record.lng
              ).length == 0
            ) {
              addresses.push(record);
            }
          });
        setstops(
          addresses.sort((a: any, b: any) => {
            return moment(a.date).diff(b.date);
          })
        );
        // }

        setTravelHistoryresponse(TravelHistoryresponseapi.data);
      }
    } catch (error) {
      console.error(`Error calling API for:`, error);
    }
    setLaodingMap(true);
  };

  useEffect(() => {
    if (TravelHistoryresponse && TravelHistoryresponse.length > 0) {
      setPolylinedata(
        TravelHistoryresponse.map((item: TravelHistoryData) => [
          item.lat,
          item.lng
        ])
      );

      const { zoomlevel, centerLat, centerLng } = calculateZoomCenter(
        TravelHistoryresponse
      );
      setMapcenterToFly([centerLat, centerLng]);
      setzoomToFly(zoomlevel);
    }
  }, [TravelHistoryresponse]);

  useEffect(() => {
    (async function () {
      let unit: string;
      if (session?.unit == "Mile") {
        unit = "Mph";
      } else {
        unit = "Kph";
      }
      const stopPoints = TravelHistoryresponse.filter((x) => {
        return x.speed === `0 ${unit}`;
      });

      const stopDetailsArray: StopAddressData[] = [];

      for (const point of stopPoints) {
        const { lat, lng } = point;
        try {
          if (!point.address) {
            if (session) {
              const Data = await getCurrentAddress({
                token: session.accessToken,
                lat: lat,
                lon: lng
              });

              stopDetailsArray.push(Data);
            }
          } else {
            stopDetailsArray.push(point.address);
          }
        } catch (error) {
          console.error("Error fetching zone data:", error);
        }
      }

      const seen: Record<string | number, boolean> = {};

      const uniqueStopDetailsArray = stopDetailsArray.filter((item) => {
        const key = item.place_id;
        if (!seen[key]) {
          seen[key] = true;
          return true;
        }
        return false;
      });

      setStopDetails(uniqueStopDetailsArray);
    })();
  }, [TravelHistoryresponse]);

  const getSpeedAndDistance = () => {
    if (
      currentPositionIndex >= 0 &&
      currentPositionIndex < TravelHistoryresponse.length
    ) {
      const item = TravelHistoryresponse[currentPositionIndex];
      return {
        speed: item.speed,
        distanceCovered: item.distanceCovered
      };
    }
    return null;
  };

  const getCurrentAngle = () => {
    if (
      currentPositionIndex >= 0 &&
      currentPositionIndex < TravelHistoryresponse.length
    ) {
      return TravelHistoryresponse[currentPositionIndex].angle;
    }
    return 0;
  };

  const handleZoneClick = () => {
    if (showZones == false) {
      setShowZones(true);
    } else {
      setShowZones(false);
    }
  };

  const handleShowDetails = () => {
    setShowDetails(!getShowdetails);
    setShowIcon(!getShowICon);
  };

  const handleChangeChecked = () => {
    setCheckedInput(!getCheckedInput);
  };

  // const handleCustomDateChange = (fieldName: string, date: any) => {
  //   setCurrentDateDefaul(true);
  //   setIgnitionreport((prevReport: any) => ({
  //     ...prevReport,
  //     [fieldName]: date,
  //   }));
  // };

  const handleDateChange = (fieldName: string, newDate: any) => {
    // if (newDate && moment(newDate, 'MM/DD/yyyy', true).isValid()) {
    //   const formattedDate = moment(newDate, 'MM/DD/yyyy').toDate()
    //   setIgnitionreport((prevReport: any) => ({
    //     ...prevReport,
    //     [fieldName]: formattedDate?.toISOString(),
    //   }));

    // }
    setFromDateInput(false);
    setCurrentDateDefaul(true);
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [fieldName]: newDate?.toISOString()
    }));
  };

  const currenTDates = new Date();
  const isCurrentDate = (date: any) => {
    if (date instanceof Date) {
      const currentDate = new Date();
      return (
        date.getDate() === currentDate.getDate() &&
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      );
    }
    return false;
  };

  const handleGetItem = (item: any, index: any) => {
    setIsDynamicTime(item);
    const filterData = dataresponse?.find((items: any) => items.id === item.id);
    setactiveTripColor(filterData);
  };

  // const selectOption: Option[] = vehicleList?.map((item: any) => {
  //   return { value: item.vehicleReg, label: item.vehicleReg };
  // });

  // const [selectedOption, setSelectedOption] = useState<any>(null);

  // const handleSelectChange = (newValue: any, actionMeta: any) => {
  //   const name = "period";
  //   const value = "yesterday";
  //   setSelectedOption(newValue);
  // };
  const handleMenuClose = () => {
    setIgnitionreport([]);
  };
  const handleInputChangeSelect = (e: any) => {
    setsearchJourney(false);
    if (!e) {
      return setIgnitionreport((prevReport: any) => ({
        ...prevReport,
        period: ""
      }));
    }
    const { value, label } = e;
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      ["VehicleReg"]: value,
      ["label"]: label
    }));
    setFromDateInput(true);
  };

  const handleInputChange: any = (e: any) => {
    setClearMapData(false);
    // if (e.target == undefined) {
    //   const { name, value } = e;
    //   setIgnitionreport((prevReport: any) => ({
    //     ...prevReport,
    //     ["VehicleReg"]: value,
    //   }));
    // } else {
    const { name, value } = e.target;
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [name]: value
    }));

    if (value == "week") {
      setWeekData(true);
    }
    0;
    if (value == "today" || value == "yesterday" || value == "custom") {
      setWeekData(false);
    }
    if (name === "period" && value === "week") {
      setCurrentDates(1);
    }

    if (name === "period" && value === "today") {
      setCurrentDates(0);
    }

    if (name === "period" && value === "custom") {
      setIsCustomPeriod(true);
    } else if (name === "period" && value != "custom") {
      setIsCustomPeriod(false);
    }
    // }
  };

  const [lat, setlat] = useState<any>("");
  const [lng, setlng] = useState<any>("");

  const handleClickStopCar = (item: any) => {
    if (item?.lat === lat) {
      setlat(null);
    } else {
      setlat(item?.lat);
    }

    if (item?.lng === lat) {
      setlng(null);
    } else {
      setlng(item?.lng);
    }
  };
  const handleChangeValueSlider = (value: any) => {
    // if (TravelHistoryresponse.length > 100) {
    //   setCurrentPositionIndex(value.target.value + currentPositionIndex);
    // } else {
    setCurrentPositionIndex(value.target.value);
  };
  // const groupedData: any = {};
  // dataresponse?.forEach((item: any) => {
  //   if (!groupedData[item.TripStartDateLabel]) {
  //     groupedData[date] = [];
  //   }
  //   groupedData[date].push(item);
  // });

  // const renderGroupedData = () => {
  //   return Object.keys(groupedData).map((date) => (
  //     <div key={date}>
  //       <h2>{date}</h2>
  //       <ul>
  //         {groupedData[date].map((item: any, index: any) => (
  //           <li key={index}>{item.TripStartDateLabel}</li>
  //         ))}
  //       </ul>
  //     </div>
  //   ));
  // };
  function getDayName(date: any) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    return days[date.getDay()];
  }
  const groupedData: any = {};

  dataresponse?.map((item: any) => {
    const tripDate = new Date(item.TripStartDateLabel);
    const dayName = getDayName(tripDate);
    if (!groupedData[item.TripStartDateLabel]) {
      // If the date group doesn't exist, create it with an empty array and count set to 1
      groupedData[item.TripStartDateLabel] = {
        trips: [item],
        count: 1,
        day: dayName
      };
    } else {
      // If the date group already exists, push the trip and increment the count
      groupedData[item.TripStartDateLabel].trips.push(item);
      groupedData[item.TripStartDateLabel].count += 1;
    }
  });
  const options =
    vehicleList?.data?.map((item: any) => ({
      value: item.vehicleReg,
      label: item.vehicleReg
    })) || [];

  const SpeedOption = [
    { value: "1", label: "1X" },
    { value: "2", label: "2X" },
    { value: "4", label: "4X" },
    { value: "6", label: "6X" }
  ];
  return (
    <>
      <div className="main_journey">
        <p className="bg-green px-4 py-1 border-t  text-center text-2xl text-white font-bold journey_heading">
          Journey Replay
        </p>
        {/* {groupedData?.map((item: any) => {
          return <div>{item?.EndingPoint}</div>;
        })} */}

        {/* {renderGroupedData()} */}
        {/* <div>
          {dataresponse?.map((item: any) => {
            return (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>{item?.TripStart}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{item.TotalDistance}</Typography>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div> */}
        {/* <p className="bg-[#00B56C] px-4 py-1 text-white">JourneyReplay</p> */}
        <div
          className="grid xl:grid-cols-10 lg:grid-cols-10 md:grid-cols-12  gap-2
         lg:px-4 text-start  bg-bgLight select_box_journey"
        >
          <div
            className="xl:col-span-1 lg:col-span-2 md:col-span-3   col-span-12
            select_box_column 
          "
            // style={{ gridColumnEnd: "span 1.5" }}
          >
            <Select
              // value={Ignitionreport}
              onChange={handleInputChangeSelect}
              options={options}
              placeholder="Pick Vehicle"
              isClearable
              isSearchable
              noOptionsMessage={() => "No options available"}
              className="   rounded-md w-full  outline-green border border-grayLight  hover:border-green select_vehicle"
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
                    ? "#e1f0e3"
                    : "transparent",
                  color: state.isSelected
                    ? "white"
                    : state.isFocused
                    ? "black"
                    : "black",
                  "&:hover": {
                    backgroundColor: "#e1f0e3",
                    color: "black"
                  }
                })
              }}
            />

            {/* <select
              id="select_box"
              className="   h-8 text-gray  w-full  outline-green border border-grayLight px-1 hover:border-green"
              onChange={handleInputChange}
              name="VehicleReg"
              value={Ignitionreport.VehicleReg}
            >
              <option value="" disabled selected hidden>
                Select Vehicle
              </option>
              {vehicleList.map((item: DeviceAttach) => (
                <option key={item.id}>{item.vehicleReg}</option>
              ))}
            </select> */}

            {/* <Select
              onChange={handleInputChange}
              name="VehicleReg"
              className="Select_box"
              options={selectOption}
              value={selectedOption}
              theme={(theme) => ({
                ...theme,
                borderRadius: 0,

                colors: {
                  ...theme.colors,

                  primary25: "#00B56C",
                  primary: "gray",
                },
              })}
            /> */}
            {/* <FormControl sx={{ m: 1, minWidth: 120 }}> */}
            {/* <Select
              value={Ignitionreport.VehicleReg}
              onChange={handleInputChange}
              MenuProps={MenuProps}
              disabled={loading}
              name="VehicleReg"
              id="select_box_journey"
              displayEmpty
              className={`h-8 text-black font-popins font-bold w-full outline-green  ${
                getShowRadioButton
                  ? " text-black font-popins font-extrabold"
                  : " text-black font-popins  "
              }`}
              style={{
                color: getShowRadioButton ? "black" : "",
                paddingTop: getShowRadioButton ? "4%" : "2%",
                paddingLeft: getShowRadioButton ? "6%" : "3%",
                fontWeight: getShowRadioButton ? "bold" : "bold",
              }}
            >
              <MenuItem value="" disabled selected hidden className="text-sm">
                Select Vehicle
              </MenuItem>
              {vehicleList?.data?.map((item: DeviceAttach) => (
                <MenuItem
                  // className=" w-full text-start font-semibold "
                  key={item.id}
                  value={item.vehicleReg}
                  id="bg_hover_select_vehicle"
                >
                  {item.vehicleReg}
                </MenuItem>
              ))}
            </Select> */}

            {/* <Select
              value={Ignitionreport.VehicleReg}
              onChange={handleInputChange}
              MenuProps={MenuProps}
              disabled={loading}
              options={options}
              isClearable
              isSearchable  
              name="VehicleReg"
              id="select_box_journey"
              displayEmpty
              className={`h-8 text-black font-popins font-bold w-full outline-green  ${
                getShowRadioButton
                  ? " text-black font-popins font-extrabold"
                  : " text-black font-popins  "
              }`}
              style={{
                color: getShowRadioButton ? "black" : "",
                paddingTop: getShowRadioButton ? "4%" : "2%",
                paddingLeft: getShowRadioButton ? "6%" : "3%",
                fontWeight: getShowRadioButton ? "bold" : "bold",
              }}
            > */}
          </div>
          {/* <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
            <KeyboardDatePicker
              format="MM/DD/yyyy"
              value={Ignitionreport.fromDateTime}
              onChange={(newDate: any) =>
                handleDateChange("fromDateTime", newDate)
              }
              variant="inline"
              maxDate={currenTDates}
              autoOk
            />
          </MuiPickersUtilsProvider> */}
          <div className="xl:col-span-3 lg:col-span-4 md:col-span-6 col-span-12 days_select">
            {getShowRadioButton ? (
              <div className="grid lg:grid-cols-12 md:grid-cols-12  sm:grid-cols-12  -mt-2  grid-cols-12  xl:px-10 lg:px-10 xl:gap-5 lg:gap-5 gap-2 flex justify-center ">
                <div
                  className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-5 lg:mt-0 md:mt-0 sm:mt-0  "
                  // onClick={togglePickerFromDate}
                >
                  <label className="text-green">From</label>
                  <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                    <DatePicker
                      // open={isPickerOpenFromDate}
                      format="MM/DD/yyyy"
                      value={
                        fromDateInput
                          ? "start date"
                          : Ignitionreport.fromDateTime
                      }
                      onChange={(newDate: any) =>
                        handleDateChange("fromDateTime", newDate)
                      }
                      style={{ marginTop: "-3%" }}
                      variant="inline"
                      placeholder="Start Date"
                      maxDate={currenTDates}
                      autoOk
                      inputProps={{ readOnly: true }}
                      InputProps={{
                        endAdornment: (
                          <EventIcon
                            style={{ width: "20", height: "20" }}
                            className="text-gray"
                          />
                        )
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </div>
                <div
                  className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-5 "
                  onClick={togglePicker}
                >
                  <label className="text-green">To</label>
                  <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                    <DatePicker
                      // open={isPickerOpen}
                      style={{ marginTop: "-3%" }}
                      format="MM/DD/yyyy"
                      value={
                        fromDateInput ? "End Date" : Ignitionreport.toDateTime
                      }
                      onChange={(newDate: any) =>
                        handleDateChange("toDateTime", newDate)
                      }
                      variant="inline"
                      // maxDate={currenTDates}
                      placeholder="End Date"
                      inputProps={{ readOnly: true }}
                      maxDate={currenTDates}
                      // shouldDisableDate={(date) => !isCurrentDate(date)}
                      InputProps={{
                        endAdornment: (
                          <EventIcon
                            style={{ width: "20", height: "20" }}
                            className="text-gray"
                          />
                        )
                      }}
                      autoOk
                    />
                  </MuiPickersUtilsProvider>
                </div>
                <div className="lg:col-span-1 col-span-1   ">
                  <button
                    className="text-green ms-5  text-2xl font-bold"
                    onClick={handleCloseDateTime}
                  >
                    x
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="grid xl:grid-cols-11 lg:grid-cols-12  md:grid-cols-12 grid-cols-12 -mt-2 "
                // style={{ display: "flex", justifyContent: "start" }}
              >
                <div
                  className="xl:col-span-2 lg:col-span-3  md:col-span-3 sm:col-span-2 col-span-4 period_select"
                  id="today_journey"
                >
                  <label className="text-sm text-black font-bold font-popins ">
                    <input
                      type="radio"
                      className="w-5 h-4 form-radio"
                      style={{ accentColor: "green" }}
                      name="period"
                      disabled={loading}
                      value="today"
                      checked={Ignitionreport?.period === "today"}
                      onChange={handleInputChange}
                    />
                    &nbsp;Today
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3  md:col-span-3 sm:col-span-2  lg:-ms-4 col-span-4 period_select">
                  <label className="text-sm  text-black font-bold font-popins  w-full pt-3 ">
                    <input
                      type="radio"
                      className="lg:w-5 w-4  md:w-4 h-4 md:-ms-3 -ms-0 lg:-ms-0 xl:-ms-0   form-radio text-green"
                      name="period"
                      id="yesterday_radio_button"
                      disabled={loading}
                      value="yesterday"
                      style={{ accentColor: "green" }}
                      checked={Ignitionreport?.period === "yesterday"}
                      onChange={handleInputChange}
                    />
                    <span className="lg:ms-1 md:ms-1 sm:ms-1 ms-2">
                      Yesterday
                    </span>
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3 md:col-span-3  lg:-ms-1 col-span-4 period_select">
                  <label className="text-sm text-black font-bold font-popins  ">
                    <input
                      type="radio"
                      className="w-5 h-4 lg:w-4  "
                      name="period"
                      disabled={loading}
                      value="week"
                      style={{ accentColor: "green" }}
                      checked={Ignitionreport?.period === "week"}
                      onChange={handleInputChange}
                    />
                    &nbsp;&nbsp;Week
                  </label>
                </div>

                <div
                  className="xl:col-span-2 lg:col-span-3 md:col-span-3 lg:-ms-4
                md:-ms-4 sm:-ms-4 -ms-0 col-span-3 period_select_custom"
                  id="custom_journey"
                >
                  <label className="text-sm text-black font-bold font-popins ">
                    <input
                      type="radio"
                      className="w-5 h-4  lg:w-4 "
                      disabled={loading}
                      name="period"
                      value="custom"
                      style={{ accentColor: "green" }}
                      checked={Ignitionreport?.period === "custom"}
                      onChange={handleInputChange}
                      onClick={handleClick}
                    />
                    &nbsp;&nbsp;Custom
                  </label>
                </div>
              </div>
              // responsive code
              // <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-1">
              //   <div>
              //     <label className="text-sm text-gray">
              //       <input
              //         type="radio"
              //         className="w-5 form-radio"
              //         name="period"
              //         disabled={loading}
              //         value="today"
              //         checked={Ignitionreport.period === "today"}
              //         onChange={handleInputChange}
              //       />
              //       &nbsp;Today
              //     </label>
              //   </div>

              //   <div>
              //     <label className="text-sm text-gray">
              //       <input
              //         type="radio"
              //         className="w-5 form-radio text-green"
              //         name="period"
              //         disabled={loading}
              //         value="yesterday"
              //         checked={Ignitionreport.period === "yesterday"}
              //         onChange={handleInputChange}
              //       />
              //       &nbsp;Yesterday
              //     </label>
              //   </div>

              //   <div>
              //     <label className="text-sm text-gray">
              //       <input
              //         type="radio"
              //         className="w-5 form-radio"
              //         name="period"
              //         disabled={loading}
              //         value="week"
              //         checked={Ignitionreport.period === "week"}
              //         onChange={handleInputChange}
              //       />
              //       &nbsp;Week
              //     </label>
              //   </div>

              //   <div>
              //     <label className="text-sm text-gray">
              //       <input
              //         type="radio"
              //         className="w-5 form-radio"
              //         disabled={loading}
              //         name="period"
              //         value="custom"
              //         checked={Ignitionreport.period === "custom"}
              //         onChange={handleInputChange}
              //         onClick={handleClick}
              //       />
              //       &nbsp;Custom
              //     </label>
              //   </div>
              // </div>
            )}
          </div>

          <div className="xl:col-span-1 lg:col-span-1 md:col-span-1 col-span-12 text-white font-bold flex justify-center items-center mt-2 journey_replay_search">
            {/* {clearMapData ? (
              <button
                onClick={handleClickClear}
                className={`bg-green py-2 px-5 mb-5 rounded-md shadow-md  hover:shadow-gray transition duration-500 text-white
                ${
                  (Ignitionreport.VehicleReg &&
                    Ignitionreport.period === "today") ||
                  (Ignitionreport.VehicleReg &&
                    Ignitionreport.period === "yesterday") ||
                  (Ignitionreport.VehicleReg &&
                    Ignitionreport.period === "week") ||
                  (Ignitionreport.VehicleReg &&
                    Ignitionreport.period === "custom")
                    ? ""
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                Search
              </button>
            ) : (
           
            )} */}
            <div
              onClick={(e) => seacrhLoading && handleSubmit(e)}
              className={` grid grid-cols-12  h-10 bg-green py-2 px-4 mb-5 rounded-md shadow-md  hover:shadow-gray transition duration-500 text-white cursor-pointer    search_btn_journey
                    ${
                      (Ignitionreport?.VehicleReg &&
                        Ignitionreport?.period === "today") ||
                      (Ignitionreport?.VehicleReg &&
                        Ignitionreport?.period === "yesterday") ||
                      (Ignitionreport?.VehicleReg &&
                        Ignitionreport?.period === "week") ||
                      (Ignitionreport?.VehicleReg &&
                        Ignitionreport?.period === "custom" &&
                        Ignitionreport?.toDateTime &&
                        Ignitionreport?.fromDateTime)
                        ? ""
                        : "opacity-50 cursor-not-allowed"
                    }`}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div className="col-span-3">
                <svg
                  className="lg:h-18 lg:w-10 md:h-12 md:w-12 sm:h-10 sm:w-10 h-12 w-12 py-3 px-2  text-white"
                  // width="24"
                  // height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="4"
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
              <div className="lg:col-span-8 md:col-span-8">
                <button>Search</button>
              </div>
            </div>
            <div
              onClick={handleSubmitTwo}
              className={` grid grid-cols-12  h-10 bg-green py-2 px-4 mb-5 rounded-md shadow-md  hover:shadow-gray transition duration-500 text-white cursor-pointer    search_btn_journey
                    ${
                      (Ignitionreport?.VehicleReg &&
                        Ignitionreport?.period === "today") ||
                      (Ignitionreport?.VehicleReg &&
                        Ignitionreport?.period === "yesterday") ||
                      (Ignitionreport?.VehicleReg &&
                        Ignitionreport?.period === "week") ||
                      (Ignitionreport?.VehicleReg &&
                        Ignitionreport?.period === "custom" &&
                        Ignitionreport?.toDateTime &&
                        Ignitionreport?.fromDateTime)
                        ? ""
                        : "opacity-50 cursor-not-allowed"
                    }`}
              style={{ display: "flex", alignItems: "center" }}
            >
              <div className="col-span-3">
                <svg
                  className="lg:h-18 lg:w-10 md:h-12 md:w-12 sm:h-10 sm:w-10 h-12 w-12 py-3 px-2  text-white"
                  // width="24"
                  // height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="4"
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
              <div className="lg:col-span-8 md:col-span-8">
                <button>SearchS</button>
              </div>
            </div>
            {/* <button
              onClick={handleSubmit}
              className={`bg-green py-2 px-5 mb-5 rounded-md shadow-md  hover:shadow-gray transition duration-500 text-white
                        ${
                          (Ignitionreport.VehicleReg &&
                            Ignitionreport.period === "today") ||
                          (Ignitionreport.VehicleReg &&
                            Ignitionreport.period === "yesterday") ||
                          (Ignitionreport.VehicleReg &&
                            Ignitionreport.period === "week") ||
                          (Ignitionreport.VehicleReg &&
                            Ignitionreport.period === "custom" &&
                            Ignitionreport.toDateTime &&
                            Ignitionreport.fromDateTime)
                            ? ""
                            : "opacity-50 cursor-not-allowed"
                        }`}
            >
              Search
            </button> */}
          </div>

          <div className="xl:col-span-3 lg:col-span-1 md:col-span-12 col-span-12 journey_replay_harsh">
            {" "}
          </div>
          {TravelHistoryresponse.length > 0 && (
            <div className="xl:col-span-1 lg:col-span-2  md:col-span-12 col-span-6  -mt-1 journey_replay_harsh_child  ">
              <div className="grid grid-cols-12  ">
                <div className="col-span-2">
                  <Image
                    src={markerA}
                    alt="harshIcon"
                    className="h-6 journay_HarshAcceleration"
                  />
                  <Image src={markerB} alt="harshIcon" className="h-6 mt-1 " />
                </div>
                <div className="col-span-10 text-sm font-semibold">
                  location Start
                  <br></br>
                  <p className="mt-3">Location End</p>
                </div>
              </div>
            </div>
          )}
          <div className="xl:col-span-1  lg:col-span-2 md:col-span-1 col-span-6 mt-1 -ms-5 mb-3 journey_replay_harsh_acce">
            {TravelHistoryresponse.filter((item: any) => {
              return (
                item.vehicleEvents.filter(
                  (items: any) => items.Event === "HarshAcceleration"
                ).length > 0
              );
            }).length > 0 && (
              <div className="grid grid-cols-12">
                <div className="col-span-2">
                  <Image
                    src={HarshAccelerationIcon}
                    alt="harshIcon "
                    className="h-6 journay_HarshAcceleration"
                  />
                </div>
                <div className="col-span-10 text-sm font-semibold">
                  Harsh Acc.. (x
                  {TravelHistoryresponse.reduce((count, item) => {
                    return (
                      count +
                      item.vehicleEvents.filter(
                        (items: any) => items.Event === "HarshAcceleration"
                      ).length
                    );
                  }, 0)}
                  )
                </div>
              </div>
            )}

            {TravelHistoryresponse.filter((item: any) => {
              return (
                item.vehicleEvents.filter(
                  (items: any) => items.Event == "HarshBreak"
                ).length > 0
              );
            }).length > 0 && (
              <div className="grid grid-cols-12">
                <div className="col-span-2">
                  <Image
                    src={harshAcceleration}
                    alt="harshIcon"
                    className="h-6 mt-1 journay_HarshAcceleration"
                  />
                </div>
                <div className="col-span-10 text-sm">
                  <p className="mt-2 font-semibold">
                    Harsh Break (x
                    {TravelHistoryresponse.reduce((count, item) => {
                      return (
                        count +
                        item.vehicleEvents.filter(
                          (items: any) => items.Event === "HarshBreak"
                        ).length
                      );
                    }, 0)}
                    )
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid lg:grid-cols-5  sm:grid-cols-5 md:grid-cols-12 sm:grid-cols-12 grid-cols-1 journey_sidebar">
          <div className="xl:col-span-1 lg:col-span-2 md:col-span-5 sm:col-span-12 col-span-4 trips_journey">
            <p className="bg-green px-4 py-1 text-white font-semibold journey_sidebar_text flex items-center">
              Trips ({dataresponse?.length})
            </p>
            <div
              id="trips_handle"
              className="overflow-y-scroll overflow-x-hidden bg-bgLight "
            >
              {weekDataGrouped == true
                ? Object.entries(groupedData).map(
                    ([date, items]: any, index) => (
                      <div key={date}>
                        <ul>
                          <div>
                            <Accordion
                              className="cursor-pointer"
                              expanded={expanded === `panel${index}`}
                              onChange={handleChange(`panel${index}`)}
                            >
                              <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                                style={{
                                  paddingLeft: getShowRadioButton ? "5%" : "5%",
                                  paddingRight: getShowRadioButton
                                    ? "5%"
                                    : "5%",
                                  borderBottom: "1px solid gray",
                                  width: "100%",
                                  paddingTop: "2%",
                                  paddingBottom: "2%"
                                }}
                              >
                                {/* <b>
                                    {date} &nbsp;&nbsp; {items.day}
                                    &nbsp;&nbsp; &nbsp;&nbsp; (x
                                    {items.count}){" "}
                                  </b> */}
                                <div className="grid grid-cols-12 space-x-3 justify-center text-green font-semibold">
                                  <div className="col-span-5 w-full text-start">
                                    <p>{date}</p>
                                  </div>
                                  <div className="col-span-5 w-full text-start">
                                    <p>{items.day}</p>
                                  </div>
                                  <div className="col-span-1 w-full text-center">
                                    <p>x{items.count}</p>
                                  </div>
                                </div>
                              </AccordionSummary>
                              {items?.trips?.map((item: any, index: any) => (
                                <AccordionDetails
                                  key={index}
                                  onClick={() =>
                                    handleDivClick(
                                      item.fromDateTime,
                                      item.toDateTime
                                    )
                                  }
                                  className="border-b hover:bg-[#e1f0e3]"
                                  style={{
                                    backgroundColor:
                                      activeTripColor.id === item.id
                                        ? "#e1f0e3"
                                        : ""
                                  }}
                                >
                                  <Typography>
                                    <div
                                      className="py-5 cursor-pointer"
                                      onClick={() => handleGetItem(item, index)}
                                    >
                                      <div className="grid grid-cols-12 space-x-4 ">
                                        <div className="col-span-1">
                                          {/* <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-10 w-10 text-green "
                                            width="24"
                                            height="24"
                                            style={{
                                              filter:
                                                "drop-shadow(1px 2px 2px #000000)",
                                            }}
                                            viewBox="0 0 512 512"
                                          >
                                            <rect
                                              width="512"
                                              height="512"
                                              fill="none"
                                            />
                                            <path
                                              fill="currentColor"
                                              d="M488 224c-3-5-32.61-17.79-32.61-17.79c5.15-2.66 8.67-3.21 8.67-14.21c0-12-.06-16-8.06-16h-27.14c-.11-.24-.23-.49-.34-.74c-17.52-38.26-19.87-47.93-46-60.95C347.47 96.88 281.76 96 256 96s-91.47.88-126.49 18.31c-26.16 13-25.51 19.69-46 60.95c0 .11-.21.4-.4.74H55.94c-7.94 0-8 4-8 16c0 11 3.52 11.55 8.67 14.21C56.61 206.21 28 220 24 224s-8 32-8 80s4 96 4 96h11.94c0 14 2.06 16 8.06 16h80c6 0 8-2 8-16h256c0 14 2 16 8 16h82c4 0 6-3 6-16h12s4-49 4-96s-5-75-8-80m-362.74 44.94A516.94 516.94 0 0 1 70.42 272c-20.42 0-21.12 1.31-22.56-11.44a72.16 72.16 0 0 1 .51-17.51L49 240h3c12 0 23.27.51 44.55 6.78a98 98 0 0 1 30.09 15.06C131 265 132 268 132 268Zm247.16 72L368 352H144s.39-.61-5-11.18c-4-7.82 1-12.82 8.91-15.66C163.23 319.64 208 304 256 304s93.66 13.48 108.5 21.16C370 328 376.83 330 372.42 341Zm-257-136.53a96.23 96.23 0 0 1-9.7.07c2.61-4.64 4.06-9.81 6.61-15.21c8-17 17.15-36.24 33.44-44.35c23.54-11.72 72.33-17 110.23-17s86.69 5.24 110.23 17c16.29 8.11 25.4 27.36 33.44 44.35c2.57 5.45 4 10.66 6.68 15.33c-2 .11-4.3 0-9.79-.19Zm347.72 56.11C461 273 463 272 441.58 272a516.94 516.94 0 0 1-54.84-3.06c-2.85-.51-3.66-5.32-1.38-7.1a93.84 93.84 0 0 1 30.09-15.06c21.28-6.27 33.26-7.11 45.09-6.69a3.22 3.22 0 0 1 3.09 3a70.18 70.18 0 0 1-.49 17.47Z"
                                            />
                                          </svg> */}
                                          <svg
                                            fill="#00b576"
                                            // className="h-10 w-10 text-green "
                                            height="50"
                                            width="40"
                                            viewBox="0 -43.92 122.88 122.88"
                                            version="1.1"
                                            id="Layer_1"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlnsXlink="http://www.w3.org/1999/xlink"
                                            style={{
                                              filter:
                                                "drop-shadow(1px 2px 2px #000000)",
                                              marginTop: "-0.8rem"
                                            }}
                                            xmlSpace="preserve"
                                            transform="matrix(1, 0, 0, 1, 0, 0)"
                                            stroke="#00b576"
                                          >
                                            <g
                                              id="SVGRepo_bgCarrier"
                                              strokeWidth="0"
                                            />
                                            <g
                                              id="SVGRepo_tracerCarrier"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                            <g id="SVGRepo_iconCarrier">
                                              {/* <style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style> */}
                                              <g>
                                                <path
                                                  className="st0"
                                                  d="M99.42,13.57c5.93,0,10.73,4.8,10.73,10.73c0,5.93-4.8,10.73-10.73,10.73s-10.73-4.8-10.73-10.73 C88.69,18.37,93.49,13.57,99.42,13.57L99.42,13.57z M79.05,5c-0.59,1.27-1.06,2.69-1.42,4.23c-0.82,2.57,0.39,3.11,3.19,2.06 c2.06-1.23,4.12-2.47,6.18-3.7c1.05-0.74,1.55-1.47,1.38-2.19c-0.34-1.42-3.08-2.16-5.33-2.6C80.19,2.23,80.39,2.11,79.05,5 L79.05,5z M23.86,19.31c2.75,0,4.99,2.23,4.99,4.99c0,2.75-2.23,4.99-4.99,4.99c-2.75,0-4.99-2.23-4.99-4.99 C18.87,21.54,21.1,19.31,23.86,19.31L23.86,19.31z M99.42,19.31c2.75,0,4.99,2.23,4.99,4.99c0,2.75-2.23,4.99-4.99,4.99 c-2.75,0-4.99-2.23-4.99-4.99C94.43,21.54,96.66,19.31,99.42,19.31L99.42,19.31z M46.14,12.5c2.77-2.97,5.97-4.9,9.67-6.76 c8.1-4.08,13.06-3.58,21.66-3.58l-2.89,7.5c-1.21,1.6-2.58,2.73-4.66,2.84H46.14L46.14,12.5z M23.86,13.57 c5.93,0,10.73,4.8,10.73,10.73c0,5.93-4.8,10.73-10.73,10.73s-10.73-4.8-10.73-10.73C13.13,18.37,17.93,13.57,23.86,13.57 L23.86,13.57z M40.82,10.3c3.52-2.19,7.35-4.15,11.59-5.82c12.91-5.09,22.78-6,36.32-1.9c4.08,1.55,8.16,3.1,12.24,4.06 c4.03,0.96,21.48,1.88,21.91,4.81l-4.31,5.15c1.57,1.36,2.85,3.03,3.32,5.64c-0.13,1.61-0.57,2.96-1.33,4.04 c-1.29,1.85-5.07,3.76-7.11,2.67c-0.65-0.35-1.02-1.05-1.01-2.24c0.06-23.9-28.79-21.18-26.62,2.82H35.48 C44.8,5.49,5.04,5.4,12.1,28.7C9.62,31.38,3.77,27.34,0,18.75c1.03-1.02,2.16-1.99,3.42-2.89c-0.06-0.05,0.06,0.19-0.15-0.17 c-0.21-0.36,0.51-1.87,1.99-2.74C13.02,8.4,31.73,8.52,40.82,10.3L40.82,10.3z"
                                                />
                                              </g>
                                            </g>
                                          </svg>
                                        </div>
                                        <div className="col-span-10 ">
                                          <p className="text-start text-md   text-black font-popins font-semibold">
                                            Duration: {item.TripDurationHr}{" "}
                                            Hour(s) {item.TripDurationMins}{" "}
                                            Minute(s)
                                          </p>
                                          <p className=" text-green text-start font-popins font-semibold text-sm">
                                            {" "}
                                            Distance: {item.TotalDistance}
                                            {item?.DriverName && (
                                              <div>
                                                <p style={{ display: "flex" }}>
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    style={{
                                                      filter:
                                                        "drop-shadow(1px 2px 2px #000000)",
                                                      marginRight: "0.5%"
                                                    }}
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path
                                                      fill="currentColor"
                                                      d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12m-8 8v-2.8q0-.85.438-1.562T5.6 14.55q1.55-.775 3.15-1.162T12 13q1.65 0 3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20z"
                                                    />
                                                  </svg>
                                                  {item?.DriverName}
                                                </p>
                                              </div>
                                            )}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-12 gap-10 mt-5">
                                        <div className="col-span-1">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-green"
                                            viewBox="0 0 512 512"
                                            style={{
                                              filter:
                                                "drop-shadow(1px 2px 2px #000000)"
                                            }}
                                          >
                                            <circle
                                              cx="256"
                                              cy="192"
                                              r="32"
                                              // fill="currentColor"
                                            />
                                            <path
                                              fill="currentColor"
                                              d="M256 32c-88.22 0-160 68.65-160 153c0 40.17 18.31 93.59 54.42 158.78c29 52.34 62.55 99.67 80 123.22a31.75 31.75 0 0 0 51.22 0c17.42-23.55 51-70.88 80-123.22C397.69 278.61 416 225.19 416 185c0-84.35-71.78-153-160-153m0 224a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64"
                                            />
                                          </svg>
                                          <div className=" border-l-2 h-10 border-green  mx-4 my-3"></div>
                                        </div>
                                        <div className="col-span-8 ">
                                          <p className="text-start font-popins font-semibold text-md lg:mr-0 md:mr-10  text-labelColor">
                                            <p className="text-green ">
                                              {" "}
                                              Location Start:
                                            </p>{" "}
                                            <p className="text-black text-sm font-popins">
                                              {item.StartingPoint}
                                            </p>
                                          </p>
                                          <p className=" text-black text-start font-semibold text-sm font-popins">
                                            {" "}
                                            Trip Start:{" "}
                                            {item.TripStartDateLabel} &nbsp;
                                            {item.TripStartTimeLabel}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-12 gap-10">
                                        <div className="col-span-1">
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-green"
                                            viewBox="0 0 512 512"
                                            style={{
                                              filter:
                                                "drop-shadow(1px 2px 2px #000000)"
                                            }}
                                          >
                                            <circle
                                              cx="256"
                                              cy="192"
                                              r="32"
                                              // fill="currentColor"
                                            />
                                            <path
                                              fill="currentColor"
                                              d="M256 32c-88.22 0-160 68.65-160 153c0 40.17 18.31 93.59 54.42 158.78c29 52.34 62.55 99.67 80 123.22a31.75 31.75 0 0 0 51.22 0c17.42-23.55 51-70.88 80-123.22C397.69 278.61 416 225.19 416 185c0-84.35-71.78-153-160-153m0 224a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64"
                                            />
                                          </svg>
                                        </div>
                                        <div className="col-span-8 ">
                                          <div className="text-start font-bold text-md text-labelColor">
                                            <p className="text-start font-popins font-semibold text-md lg:mr-0 md:mr-10  text-labelColor">
                                              <span className="text-green">
                                                {" "}
                                                Location End:
                                              </span>{" "}
                                              <br></br>
                                              <p className="text-black text-sm font-popins">
                                                {" "}
                                                {item.EndingPoint}
                                              </p>
                                            </p>
                                          </div>
                                          <p className=" text-black text-start font-semibold text-sm">
                                            {" "}
                                            Trip End:{
                                              item.TripEndDateLabel
                                            }{" "}
                                            &nbsp;
                                            {item.TripEndTimeLabel}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </Typography>
                                </AccordionDetails>
                              ))}
                            </Accordion>
                          </div>
                        </ul>
                      </div>
                    )
                  )
                : dataresponse?.map((item: TripsByBucket, index: number) => (
                    <button
                      key={index}
                      // className=" my-2 "
                      // onClick={() =>
                      //   handleDivClickv3(item.fromDateTime, item.toDateTime)
                      // }
                      onClick={() => {
                        travelV2 &&
                          handleDivClick(item.fromDateTime, item.toDateTime);
                        travelV3 &&
                          handleDivClickv3(
                            item.fromDateTime,
                            item.toDateTime,
                            item.id
                          );
                      }}
                    >
                      <div
                        className="py-5 hover:bg-[#e1f0e3] px-5 cursor-pointer border-b"
                        onClick={() => handleGetItem(item, index)}
                        style={{
                          backgroundColor:
                            activeTripColor.id === item.id ? "#e1f0e3" : ""
                        }}
                      >
                        <div className="grid grid-cols-12 space-x-3">
                          <div className="col-span-1">
                            {/* <svg
                              className="h-8 w-8 text-green"
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
                              <circle cx="7" cy="17" r="2" />{" "}
                              <circle cx="17" cy="17" r="2" />{" "}
                              <path d="M5 17h-2 v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                            </svg> */}

                            {/* <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-10 w-10 text-green "
                              width="24"
                              height="24"
                              style={{
                                filter: "drop-shadow(1px 2px 2px #000000)",
                              }}
                              viewBox="0 0 512 512"
                            >
                              <rect width="512" height="512" fill="none" />
                              <path
                                fill="currentColor"
                                d="M488 224c-3-5-32.61-17.79-32.61-17.79c5.15-2.66 8.67-3.21 8.67-14.21c0-12-.06-16-8.06-16h-27.14c-.11-.24-.23-.49-.34-.74c-17.52-38.26-19.87-47.93-46-60.95C347.47 96.88 281.76 96 256 96s-91.47.88-126.49 18.31c-26.16 13-25.51 19.69-46 60.95c0 .11-.21.4-.4.74H55.94c-7.94 0-8 4-8 16c0 11 3.52 11.55 8.67 14.21C56.61 206.21 28 220 24 224s-8 32-8 80s4 96 4 96h11.94c0 14 2.06 16 8.06 16h80c6 0 8-2 8-16h256c0 14 2 16 8 16h82c4 0 6-3 6-16h12s4-49 4-96s-5-75-8-80m-362.74 44.94A516.94 516.94 0 0 1 70.42 272c-20.42 0-21.12 1.31-22.56-11.44a72.16 72.16 0 0 1 .51-17.51L49 240h3c12 0 23.27.51 44.55 6.78a98 98 0 0 1 30.09 15.06C131 265 132 268 132 268Zm247.16 72L368 352H144s.39-.61-5-11.18c-4-7.82 1-12.82 8.91-15.66C163.23 319.64 208 304 256 304s93.66 13.48 108.5 21.16C370 328 376.83 330 372.42 341Zm-257-136.53a96.23 96.23 0 0 1-9.7.07c2.61-4.64 4.06-9.81 6.61-15.21c8-17 17.15-36.24 33.44-44.35c23.54-11.72 72.33-17 110.23-17s86.69 5.24 110.23 17c16.29 8.11 25.4 27.36 33.44 44.35c2.57 5.45 4 10.66 6.68 15.33c-2 .11-4.3 0-9.79-.19Zm347.72 56.11C461 273 463 272 441.58 272a516.94 516.94 0 0 1-54.84-3.06c-2.85-.51-3.66-5.32-1.38-7.1a93.84 93.84 0 0 1 30.09-15.06c21.28-6.27 33.26-7.11 45.09-6.69a3.22 3.22 0 0 1 3.09 3a70.18 70.18 0 0 1-.49 17.47Z"
                              />
                            </svg> */}
                            <svg
                              fill="#00b576"
                              // className="h-10 w-10 text-green "
                              height="50"
                              width="45"
                              viewBox="0 -43.92 122.88 122.88"
                              version="1.1"
                              id="Layer_1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                              style={{
                                filter: "drop-shadow(1px 2px 2px #000000)",
                                marginTop: "-0.8rem"
                              }}
                              xmlSpace="preserve"
                              transform="matrix(1, 0, 0, 1, 0, 0)"
                              stroke="#00b576"
                            >
                              <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                              <g
                                id="SVGRepo_tracerCarrier"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <g id="SVGRepo_iconCarrier">
                                {/* <style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style> */}
                                <g>
                                  <path
                                    className="st0"
                                    d="M99.42,13.57c5.93,0,10.73,4.8,10.73,10.73c0,5.93-4.8,10.73-10.73,10.73s-10.73-4.8-10.73-10.73 C88.69,18.37,93.49,13.57,99.42,13.57L99.42,13.57z M79.05,5c-0.59,1.27-1.06,2.69-1.42,4.23c-0.82,2.57,0.39,3.11,3.19,2.06 c2.06-1.23,4.12-2.47,6.18-3.7c1.05-0.74,1.55-1.47,1.38-2.19c-0.34-1.42-3.08-2.16-5.33-2.6C80.19,2.23,80.39,2.11,79.05,5 L79.05,5z M23.86,19.31c2.75,0,4.99,2.23,4.99,4.99c0,2.75-2.23,4.99-4.99,4.99c-2.75,0-4.99-2.23-4.99-4.99 C18.87,21.54,21.1,19.31,23.86,19.31L23.86,19.31z M99.42,19.31c2.75,0,4.99,2.23,4.99,4.99c0,2.75-2.23,4.99-4.99,4.99 c-2.75,0-4.99-2.23-4.99-4.99C94.43,21.54,96.66,19.31,99.42,19.31L99.42,19.31z M46.14,12.5c2.77-2.97,5.97-4.9,9.67-6.76 c8.1-4.08,13.06-3.58,21.66-3.58l-2.89,7.5c-1.21,1.6-2.58,2.73-4.66,2.84H46.14L46.14,12.5z M23.86,13.57 c5.93,0,10.73,4.8,10.73,10.73c0,5.93-4.8,10.73-10.73,10.73s-10.73-4.8-10.73-10.73C13.13,18.37,17.93,13.57,23.86,13.57 L23.86,13.57z M40.82,10.3c3.52-2.19,7.35-4.15,11.59-5.82c12.91-5.09,22.78-6,36.32-1.9c4.08,1.55,8.16,3.1,12.24,4.06 c4.03,0.96,21.48,1.88,21.91,4.81l-4.31,5.15c1.57,1.36,2.85,3.03,3.32,5.64c-0.13,1.61-0.57,2.96-1.33,4.04 c-1.29,1.85-5.07,3.76-7.11,2.67c-0.65-0.35-1.02-1.05-1.01-2.24c0.06-23.9-28.79-21.18-26.62,2.82H35.48 C44.8,5.49,5.04,5.4,12.1,28.7C9.62,31.38,3.77,27.34,0,18.75c1.03-1.02,2.16-1.99,3.42-2.89c-0.06-0.05,0.06,0.19-0.15-0.17 c-0.21-0.36,0.51-1.87,1.99-2.74C13.02,8.4,31.73,8.52,40.82,10.3L40.82,10.3z"
                                  />
                                </g>
                              </g>
                            </svg>
                          </div>
                          <div className="col-span-10 ">
                            <p className="text-start text-md   text-black font-popins font-semibold">
                              Duration: {item.TripDurationHr} Hour(s){" "}
                              {item.TripDurationMins} Minute(s)
                            </p>
                            <p className=" text-green text-start font-popins font-semibold text-sm">
                              {" "}
                              Distance: {item.TotalDistance}
                              {item?.DriverName && (
                                <div>
                                  <p style={{ display: "flex" }}>
                                    {" "}
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      style={{
                                        filter:
                                          "drop-shadow(1px 2px 2px #000000)",
                                        marginRight: "0.5%"
                                      }}
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        fill="currentColor"
                                        d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12m-8 8v-2.8q0-.85.438-1.562T5.6 14.55q1.55-.775 3.15-1.162T12 13q1.65 0 3.25.388t3.15 1.162q.725.375 1.163 1.088T20 17.2V20z"
                                      />
                                    </svg>
                                    {item?.DriverName}
                                  </p>
                                </div>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-10 mt-5">
                          <div className="col-span-1">
                            {/* <svg
                              className="h-8 w-8 text-green"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg> */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-green"
                              viewBox="0 0 512 512"
                              style={{
                                filter: "drop-shadow(1px 2px 2px #000000)"
                              }}
                            >
                              <circle
                                cx="256"
                                cy="192"
                                r="32"
                                // fill="currentColor"
                              />
                              <path
                                fill="currentColor"
                                d="M256 32c-88.22 0-160 68.65-160 153c0 40.17 18.31 93.59 54.42 158.78c29 52.34 62.55 99.67 80 123.22a31.75 31.75 0 0 0 51.22 0c17.42-23.55 51-70.88 80-123.22C397.69 278.61 416 225.19 416 185c0-84.35-71.78-153-160-153m0 224a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64"
                              />
                            </svg>
                            <div className=" border-l-2 h-10 border-green  mx-4 my-3"></div>
                          </div>
                          <div className="col-span-8 ">
                            <p className="text-start font-popins font-semibold text-md lg:mr-0 md:mr-10  text-labelColor">
                              <p className="text-green "> Location Start:</p>{" "}
                              {/* <br></br>{" "} */}
                              <p className="text-black text-sm font-popins">
                                {item.StartingPoint}
                              </p>
                            </p>
                            <p className=" text-black font-popins text-start font-semibold text-sm lg:mr-0 md:mr-10">
                              {" "}
                              Trip Start: {item.TripStartDateLabel} &nbsp;
                              {item.TripStartTimeLabel}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-10">
                          <div className="col-span-1">
                            {/* <svg
                              className="h-8 w-8 text-green"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg> */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8 text-green"
                              viewBox="0 0 512 512"
                              style={{
                                filter: "drop-shadow(1px 2px 2px #000000)"
                              }}
                            >
                              <circle
                                cx="256"
                                cy="192"
                                r="32"
                                // fill="currentColor"
                              />
                              <path
                                fill="currentColor"
                                d="M256 32c-88.22 0-160 68.65-160 153c0 40.17 18.31 93.59 54.42 158.78c29 52.34 62.55 99.67 80 123.22a31.75 31.75 0 0 0 51.22 0c17.42-23.55 51-70.88 80-123.22C397.69 278.61 416 225.19 416 185c0-84.35-71.78-153-160-153m0 224a64 64 0 1 1 64-64a64.07 64.07 0 0 1-64 64"
                              />
                            </svg>
                          </div>
                          <div className="col-span-8 ">
                            <p className="text-start font-popins font-semibold text-md lg:mr-0 md:mr-10  text-labelColor">
                              <span className="text-green"> Location End:</span>{" "}
                              <br></br>
                              <p className="text-black text-sm font-popins">
                                {" "}
                                {item.EndingPoint}
                              </p>
                            </p>
                            <p className=" text-black  lg:mr-0 md:mr-10 text-start font-bold text-sm">
                              {" "}
                              Trip End:{item.TripEndDateLabel} &nbsp;
                              {item.TripEndTimeLabel}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
            </div>
          </div>
          <div
            className="xl:col-span-4 lg:col-span-3 md:col-span-7 sm:col-span-12 col-span-4 journey_map"
            style={{ position: "relative" }}
          >
            <div onClick={() => setMapcenterToFly(null)}>
              {mapcenter !== null && (
                <MapContainer
                  id="map"
                  zoom={zoom}
                  center={mapcenter}
                  className="z-0 journey_map"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
                  />

                  {loadingMap ? (
                    <Polyline
                      pathOptions={{ color: "red", weight: 6 }}
                      positions={polylinedata}
                    />
                  ) : (
                    ""
                  )}
                  {isPlaying ? (
                    <SetViewOnClick coords={mapcenter} />
                  ) : (
                    <SetViewfly coords={mapcenterToFly} zoom={zoomToFly} />
                  )}

                  {showZones &&
                    zoneList.map(function (singleRecord) {
                      const isRestrictedArea =
                        singleRecord.GeoFenceType === "Restricted-Area"; // && session?.clickToCall === true;
                      const isCityArea =
                        singleRecord.GeoFenceType === "City-Area"; // && session?.clickToCall === true;

                      return singleRecord.zoneType == "Circle" ? (
                        <>
                          <Circle
                            center={[
                              Number(singleRecord.centerPoints.split(",")[0]),
                              Number(singleRecord.centerPoints.split(",")[1])
                            ]}
                            radius={Number(singleRecord.latlngCordinates)}
                            color={
                              isCityArea
                                ? "green"
                                : isRestrictedArea
                                ? "red"
                                : "blue"
                            }
                          >
                            <Popup>{singleRecord.zoneName}</Popup>
                          </Circle>
                        </>
                      ) : (
                        // <Polygon
                        //   positions={JSON.parse(singleRecord.latlngCordinates)}
                        // />
                        <Polygon
                          key={singleRecord.zoneName}
                          positions={JSON.parse(singleRecord.latlngCordinates)}
                          color={
                            isCityArea
                              ? "green"
                              : isRestrictedArea
                              ? "red"
                              : "blue"
                          }
                        >
                          <Popup>{singleRecord.zoneName}</Popup>
                        </Polygon>
                      );
                    })}

                  {loadingMap
                    ? carPosition && (
                        <Marker
                          position={carPosition}
                          icon={createMarkerIcon(getCurrentAngle())}
                        ></Marker>
                      )
                    : ""}

                  {lat && lng && (
                    <Marker
                      position={[lat, lng]}
                      icon={
                        new L.Icon({
                          iconUrl:
                            "https://img.icons8.com/fluency/48/000000/stop-sign.png",
                          iconAnchor: [22, 47],
                          popupAnchor: [1, -34]
                        })
                      }
                    ></Marker>
                  )}
                  {TravelHistoryresponse.length > 0 && (
                    <div>
                      {loadingMap ? (
                        <Marker
                          position={[
                            TravelHistoryresponse[0].lat,
                            TravelHistoryresponse[0].lng
                          ]}
                          icon={
                            new L.Icon({
                              iconUrl:
                                "https://img.icons8.com/fluent/48/000000/marker-a.png",
                              iconAnchor: [22, 47],
                              popupAnchor: [1, -34]
                            })
                          }
                        ></Marker>
                      ) : (
                        ""
                      )}

                      {loadingMap ? (
                        <Marker
                          position={[
                            TravelHistoryresponse[
                              TravelHistoryresponse.length - 1
                            ].lat,
                            TravelHistoryresponse[
                              TravelHistoryresponse.length - 1
                            ].lng
                          ]}
                          icon={
                            new L.Icon({
                              iconUrl:
                                "https://img.icons8.com/fluent/48/000000/marker-b.png",
                              iconAnchor: [22, 47],
                              popupAnchor: [1, -34]
                            })
                          }
                        ></Marker>
                      ) : (
                        ""
                      )}
                    </div>
                  )}

                  {TravelHistoryresponse.map((item) => {
                    if (item.vehicleEvents.length > 0) {
                      return item.vehicleEvents.map((items) => {
                        if (items.Event === "HarshBreak") {
                          return loadingMap ? (
                            <Marker
                              position={[item.lat, item.lng]}
                              icon={
                                new L.Icon({
                                  iconUrl:
                                    "https://img.icons8.com/color/48/000000/brake-discs.png",
                                  iconSize: [40, 40],
                                  iconAnchor: [16, 37]
                                })
                              }
                            >
                              {harshPopUp && <Popup>Harsh Break</Popup>}
                            </Marker>
                          ) : (
                            ""
                          );
                        }
                        if (items.Event === "HarshAcceleration") {
                          return loadingMap ? (
                            <Marker
                              position={[item.lat, item.lng]}
                              icon={
                                new L.Icon({
                                  iconUrl:
                                    " https://img.icons8.com/nolan/64/speed-up.png",
                                  iconSize: [30, 30],
                                  iconAnchor: [16, 37]
                                })
                              }
                            >
                              {harshAccPopUp && (
                                <Popup>Harsh Acceleration</Popup>
                              )}
                            </Marker>
                          ) : (
                            ""
                          );
                        }
                      });
                    }
                  })}
                </MapContainer>
              )}
            </div>

            <div className="absolute lg:top-4 lg:left-20 lg:right-5 left-12 top-6 right-2 grid lg:grid-cols-10 md:grid-cols-10 sm:grid-cols-10 grid-cols-10 lg:mt-0 ">
              <div className="xl:col-span-2 mr-5 lg:col-span-4 md:col-span-5 sm:col-span-3 col-span-6 stop_journey">
                <div
                  className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 grid-cols-12 bg-green py-2 shadow-lg  rounded-md cursor-pointer"
                  onClick={() => stopDetailsOpen && handleShowDetails()}
                >
                  <div className="lg:col-span-11  md:col-span-10 sm:col-span-10 col-span-11 stop_details_responsive">
                    <p className="text-white lg:px-3 ps-1 text-lg text_responsive">
                      Stop Details ({loadingMap ? stops.length : ""})
                    </p>
                  </div>
                  <div className="col-span-1 mt-1 lg:-ms-3 md:-ms-2 -ms-3">
                    {getShowICon ? (
                      <svg
                        className="h-5 w-5 text-white"
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
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-white"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        // onClick={handleShowDetails}
                      >
                        {" "}
                        <path stroke="none" d="M0 0h24v24H0z" />{" "}
                        <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />{" "}
                        <path d="M4 16v2a2 2 0 0 0 2 2h2" />{" "}
                        <path d="M16 4h2a2 2 0 0 1 2 2v2" />{" "}
                        <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />{" "}
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </div>
                </div>

                {getShowdetails ? (
                  <div className="bg-white lg:h-60 md:h-60 sm:h-60 h-24 overflow-y-scroll resposive_stop_details">
                    {stops?.map((item: any) => {
                      return loadingMap ? (
                        <div
                          onClick={() => handleClickStopCar(item)}
                          className="cursor-pointer"
                        >
                          <p className="text-black font-popins px-3 py-3 text-sm">
                            <b>{item?.address?.substring(0, 50)}</b>
                          </p>

                          <div className="grid grid-cols-12">
                            <div className="lg:col-span-6 md:col-span-6 sm:col-span-6 col-span-2"></div>
                            <div className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-9  mx-2 text-center text-red text-bold px-1 w-full   text-sm border-2 border-red stop_details_time">
                              {moment(item?.date)
                                .tz("Europe/London")
                                .format("HH:mm:ss A")}
                            </div>
                          </div>
                          <br></br>
                          <hr className="text-gray"></hr>
                        </div>
                      ) : (
                        ""
                      );
                    })}
                    {/* {stops.map((item: any) => (
                      <div key={item}>
                        <p className="text-gray px-3 py-3 text-sm">
                          {item.address}
                          <br></br>
                          {item.date}
                        </p>
                        <hr className="text-gray"></hr>
                      </div>
                    ))} */}
                  </div>
                ) : (
                  ""
                )}
              </div>

              <div
                className="xl:col-span-7 lg:col-span-3 md:col-span-2 sm:col-span-2
              col-span-1 "
              ></div>

              {/* <div className="grid grid-cols-1 absolute shadow-lg rounded-md lg:top-10 xl:top-10 md:top-10 top-5 right-10 bg-bgLight py-2 px-2">
                <div className="col-span-1" style={{ color: "green" }}>
                  <input
                    type="checkbox"
                    onClick={() => {
                      setShowZones(!showZones);
                    }}
                    className="mx-2  mt-1"
                    style={{ accentColor: "green" }}
                  />
                  <button className="text-labelColor font-popins text-sm font-bold">
                    Show Zones
                  </button>
                </div>
              </div> */}
              {zoneList !== null && zoneList.length > 0 && (
                <div
                  className="grid grid-cols-1 absolute lg:top-10 xl:top-1 md:top-10 top-0 xl:right-10 lg:right-10 md:right-10 sm:right-10 right-1  bg-bgLight py-2 px-2 show_zone_journey_replay"
                  style={{
                    borderRadius: "10px",
                    borderColor: "green",
                    borderWidth: "3px",
                    borderStyle: "solid"
                  }}
                >
                  <div className="col-span-1" style={{ color: "green" }}>
                    <input
                      type="checkbox"
                      onClick={() => {
                        setShowZones(!showZones);
                      }}
                      className="mx-2 mt-1"
                      style={{ accentColor: "green" }}
                    />
                    <button className="text-labelColor font-popins text-sm font-bold">
                      Show Zones
                    </button>
                  </div>

                  {/* Three rows with colored dots and text meaning */}
                  {showZones && (
                    <>
                      <div className="flex items-center mt-2 ml-2">
                        <div className="lg:col-span-1">
                          <svg
                            className={`h-6 w-3 text-blue mr-2`}
                            viewBox="0 0 24 24"
                            fill="blue"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        </div>
                        <span className="text-sm text-labelColor">
                          On/Off-site
                        </span>
                      </div>
                      <div className="flex items-center mt-2 ml-2">
                        <div className="lg:col-span-1">
                          <svg
                            className={`h-6 w-3 text-red mr-2`}
                            viewBox="0 0 24 24"
                            fill="red"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        </div>
                        <span className="text-sm text-labelColor">
                          Restricted
                        </span>
                      </div>
                      <div className="flex items-center mt-2 ml-2">
                        <div className="lg:col-span-1">
                          <svg
                            className={`h-6 w-3 text-green mr-2`}
                            viewBox="0 0 24 24"
                            fill="green"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                          </svg>
                        </div>
                        <span className="text-sm text-labelColor">
                          City Area
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div
              className="grid lg:grid-cols-10  grid-cols-10"
              id="speed_meter"
            >
              <div className="col-span-2  lg:w-52 md:w-44 sm:w-44 w-48 rounded-md ">
                {isPlaying || isPaused ? (
                  <div>
                    {/* <ReactSpeedometer
                      width={120}
                      height={90}
                      maxValue={180}
                      value={getSpeedAndDistance()?.speed.replace("Mph", "")}
                      needleColor="#00b56c"
                      startColor="green"
                      segments={1}
                      endColor="blue"
                      needleTransitionDuration={100}
                      segmentColors={["#3a4848"]}
                    /> */}
                    <Speedometer
                      value={
                        getSpeedAndDistance()?.speed.includes("Mph")
                          ? getSpeedAndDistance()?.speed.replace("Mph", "")
                          : getSpeedAndDistance()?.speed.replace("Kph", "")
                      }
                      max={140}
                      angle={160}
                      fontFamily="squada-one"
                      accentColor="#00B56C"
                      width={200}
                      // segmentColors="green"
                    >
                      <Background angle={180} />
                      <Arc />
                      <Needle />
                      <Progress />
                      <Marks />
                    </Speedometer>
                    <p className="text-white text-sm px-2 py-1 -mt-16 w-full bg-bgPlatBtn rounded-md">
                      Distance: {getSpeedAndDistance()?.distanceCovered}
                    </p>
                  </div>
                ) : null}

                {isPlaying || isPaused ? (
                  <p
                    className="bg-bgPlatBtn text-white mt-3 w-full px-2 py-3 rounded-md
                  trip_address
                  "
                  >
                    {addressTravelHistory?.slice(0, 3).map((item, index) => (
                      <div key={index}>{<p>{item}</p>}</div>
                    ))}
                  </p>
                ) : (
                  ""
                )}
                {isPlaying && (
                  <div>
                    {/* <Speedometer
                      value={getSpeedAndDistance()?.speed.replace("Mph", "")}
                      max={140}
                      angle={160}
                      fontFamily="squada-one"
                      accentColor="#00B56C"
                      width={200}
                      // segmentColors="green"
                    >
                      <Background angle={180} />
                      <Arc />
                      <Needle />
                      <Progress />
                      <Marks />
                    </Speedometer>
                    <p className="bg-bgPlatBtn text-white mt-3 px-2 py-3 rounded-md">
                      {TripAddressData}
                    </p> */}
                  </div>
                )}
              </div>
            </div>

            <div
              // style={{
              //   position: "absolute",
              //   left: "0%",
              //   right: "5%",
              //   bottom: "0%",
              // }}
              className="absolute xl:left-56 lg:left-10 xl:right-20 lg:right-10 xl:bottom-8 lg:bottom-8 md:bottom-8 sm:bottom-8  bottom-2  left-1 right-3
              journey_replay_center_box
              "
            >
              <div className="grid xl:grid-cols-7 lg:grid-cols-12 md:grid-12 grid-cols-12 lg:gap-5 gap-2 ">
                <div className="xl:col-span-1 mt-5  lg:col-span-4 md:col-span-4 col-span-4">
                  {/* <div className="bg-bgPlatBtn rounded-md">
                    <div className="lg:text-xl text-white font-medium text-center  py-2 text-md mx-1">
                      <BlinkingTime timezone={session?.timezone} />
                    </div>

                    <div className=" border-t border-white my-1 lg:w-32 mx-2"></div>
                    <div className="  ms-1 pb-3">
                      <Tooltip content="Pause" className="bg-black">
                        <button
                          onClick={() => pausebtn && pauseTick()}
                          className={`${
                            pausebtn ? "cursor-pointer" : "cursor-not-allowed"
                          }`}
                        >
                          <svg
                            className="h-5 w-5 lg:mx-2 lg:ms-5 md:mx-3 sm:mx-3 md:ms-4 sm:ms-6  mx-1"
                            // style={{
                            //   color: stopVehicle === true ? "gray" : "white",
                            // }}
                            style={{ color: isPauseColor ? "green" : "white" }}
                            fill={isPauseColor ? "none" : "none"}
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {" "}
                            <path stroke="none" d="M0 0h24v24H0z" />{" "}
                            <line x1="4" y1="4" x2="4" y2="20" />{" "}
                            <line x1="20" y1="4" x2="20" y2="20" />{" "}
                            <rect x="9" y="6" width="6" height="12" rx="2" />
                          </svg>
                        </button>
                      </Tooltip>
                      <Tooltip content="Play" className="bg-black">
                        <button
                          onClick={() => playbtn && tick()}
                          className={`${
                            playbtn ? "cursor-pointer" : "cursor-not-allowed"
                          }`}
                        >
                          <svg
                            className="h-5 w-5  lg:mx-2  md:mx-3 sm:mx-3 mx-1"
                            viewBox="0 0 24 24"
                            style={{ color: isPlaying ? "green" : "white" }}
                            fill={isPlaying ? "green" : "white"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {" "}
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </button>
                      </Tooltip>
                      <Tooltip content="Stop" className="bg-black">
                        <button
                          onClick={() => stopbtn && stopTick()}
                          className={`${
                            stopbtn ? "cursor-pointer" : "cursor-not-allowed"
                          }`}
                        >
                          <svg
                            className="h-4 w-4 lg:mx-2 md:mx-3 sm:mx-3 mx-1"
                            width="24"
                            style={{ color: stopVehicle ? "green" : "white" }}
                            fill={stopVehicle ? "green" : "white"}
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {" "}
                            <path stroke="none" d="M0 0h24v24H0z" />{" "}
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                  </div> */}
                </div>
                <div className="xl:col-span-4 lg:col-span-8 col-span-12  journey_replay_slider ">
                  <div className="grid lg:grid-cols-12 grid-cols-12 gap-1 lg:py-5 py-2 mt-8 pt-4 lg:pt-4 rounded-md  mx-2 px-5 bg-white space-x-4 ">
                    <div
                      className="lg:col-span-10 md:col-span-9 col-span-8 journey_replay_slider_res"
                      // style={{ height: "4vh" }}
                    >
                      <Slider
                        value={currentPositionIndex}
                        // defaultValue={progressWidth}
                        // max={maxSliderValue}
                        // min={minSliderValue}
                        onChange={handleChangeValueSlider}
                        color="secondary"
                        style={{
                          color: "#00B56C",
                          cursor: isPlaying ? "pointer" : "not-allowed"
                        }}
                        max={polylinedata.length}
                        disabled={isPlaying ? false : true}
                        // style={{
                        //   backgroundColor: "lightgreen",
                        //   color: "red !important",
                        //   height: "0.6vh",
                        // }}
                        // min={progressminvalue}
                        // onChange={changeProgressOnClick}
                        // max={progressmaxvalue}
                        // value={progressVal || cursor}
                        // className="replay-slider-inner"
                      />
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <div className="grid grid-cols-12 ">
                          <div className="col-span-5 ">
                            {isDynamicTime.TripStartTimeLabel}
                          </div>
                          {/* <div className="col-span-3"></div> */}
                          <div className="col-span-6 play_pause_icon">
                            <Tooltip content="Pause" className="bg-black">
                              <button
                                onClick={() => pausebtn && pauseTick()}
                                className={`${
                                  pausebtn
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed"
                                }`}
                              >
                                <svg
                                  className="h-5 w-5 lg:mx-2 lg:ms-5 md:mx-3 sm:mx-3 md:ms-4 sm:ms-6 mx-1"
                                  // style={{
                                  //   color: stopVehicle === true ? "gray" : "white",
                                  // }}
                                  style={{
                                    color: isPauseColor ? "green" : "black"
                                  }}
                                  fill={isPauseColor ? "none" : "none"}
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  {" "}
                                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                                  <line x1="4" y1="4" x2="4" y2="20" />{" "}
                                  <line x1="20" y1="4" x2="20" y2="20" />{" "}
                                  <rect
                                    x="9"
                                    y="6"
                                    width="6"
                                    height="12"
                                    rx="2"
                                  />
                                </svg>
                              </button>
                            </Tooltip>
                            <Tooltip content="Play" className="bg-black">
                              <button
                                onClick={() => playbtn && tick()}
                                className={`${
                                  playbtn
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed"
                                }`}
                              >
                                <svg
                                  className="h-5 w-5  lg:mx-2  md:mx-3 sm:mx-3 mx-1"
                                  viewBox="0 0 24 24"
                                  style={{
                                    color: isPlaying ? "green" : "black"
                                  }}
                                  fill={isPlaying ? "green" : "black"}
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  {" "}
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                              </button>
                            </Tooltip>
                            <Tooltip content="Stop" Stop Details="bg-black">
                              <button
                                onClick={() => stopbtn && stopTick()}
                                className={`${
                                  stopbtn
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed"
                                }`}
                              >
                                <svg
                                  className="h-4 w-4 lg:mx-2 md:mx-3 sm:mx-3 mx-1"
                                  width="24"
                                  style={{
                                    color: stopVehicle ? "green" : "black"
                                  }}
                                  fill={stopVehicle ? "green" : "black    "}
                                  height="24"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  {" "}
                                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                                  <rect
                                    x="4"
                                    y="4"
                                    width="16"
                                    height="16"
                                    rx="2"
                                  />
                                </svg>
                              </button>
                            </Tooltip>
                          </div>
                          <div className="col-span-1">
                            {isDynamicTime.TripEndTimeLabel}
                          </div>
                        </div>
                      </div>
                      {/* <div className="grid grid-cols-12 ">
                        <div className="col-span-11">
                          <p className="text-sm color-labelColor">
                            {" "}
                            {isDynamicTime.TripStartTimeLabel}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-sm color-labelColor text-start">
                            {isDynamicTime.TripEndTimeLabel}
                          </p>
                        </div>
                      </div> */}
                    </div>

                    <div className="lg:col-span-2 md:col-span-3 col-span-4 mt-2 select_journey_speed">
                      {isPlaying && (
                        // <Select
                        //   className="text-black  outline-green border h-8 w-16 border-grayLight px-1"
                        //   value={speedFactor}
                        //   onChange={(e) => setSpeedFactor(Number(e.value))}
                        //   style={{
                        //     color: getShowRadioButton ? "black" : "",
                        //     paddingTop: getShowRadioButton ? "4%" : "2%",
                        //     paddingLeft: getShowRadioButton ? "12%" : "3%",
                        //     fontWeight: getShowRadioButton ? "bold" : "bold",
                        //   }}
                        // >
                        //   <MenuItem
                        //     className="hover:bg-green hover:text-white text-sm w-full"
                        //     value={1}
                        //     id="select_slider"
                        //   >
                        //     1x
                        //   </MenuItem>
                        //   <MenuItem
                        //     className="hover:bg-green hover:text-white text-sm w-full"
                        //     value={2}
                        //     id="select_slider"
                        //   >
                        //     2x
                        //   </MenuItem>
                        //   <MenuItem
                        //     className=" text-md w-full "
                        //     value={4}
                        //     id="select_slider"
                        //   >
                        //     4x{" "}
                        //   </MenuItem>
                        //   <MenuItem
                        //     className="hover:bg-green hover:text-white text-sm w-full"
                        //     value={6}
                        //     id="select_slider"
                        //   >
                        //     6x
                        //   </MenuItem>
                        // </Select>
                        <Select
                          onChange={(e: any) => setSpeedFactor(Number(e.value))}
                          options={SpeedOption}
                          placeholder="1x"
                          isSearchable={false}
                          className="rounded-md h-10 -mt-3 w-full outline-green border border-grayLight"
                          defaultValue={SpeedOption[0]}
                          styles={{
                            control: (provided, state) => ({
                              ...provided,
                              border: "none",
                              boxShadow: state.isFocused ? null : null
                            }),
                            menu: (provided, state) => ({
                              ...provided,
                              zIndex: 9999, // Ensure the menu appears above other elements
                              position: "absolute",
                              top: "auto",
                              bottom: "100%" // Position the menu above the select input
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              backgroundColor: state.isSelected
                                ? "#00B56C"
                                : state.isFocused
                                ? "white"
                                : "transparent",
                              color: state.isSelected
                                ? "white"
                                : state.isFocused
                                ? "black"
                                : "black",
                              "&:hover": {
                                backgroundColor: "#00B56C",
                                color: "white"
                              }
                            })
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  );
}
