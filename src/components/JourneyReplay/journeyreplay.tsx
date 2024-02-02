"use client";
import React, { useEffect, useState } from "react";
import DateFnsMomemtUtils from "@date-io/moment";
import { DatePicker } from "@material-ui/pickers";
import BlinkingTime from "@/components/General/BlinkingTime";
import axios from "axios";
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
import moment from "moment";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import Image from "next/image";
import harshIcon from "../../../public/Images/HarshBreak.png";
import HarshAccelerationIcon from "../../../public/Images/HarshAccelerationIcon.png";
import markerA from "../../../public/Images/marker-a.png";
import markerB from "../../../public/Images/marker-b.png";
import harshAcceleration from "../../../public/Images/brake-discs.png";
import Speedometer, {
  Background,
  Arc,
  Needle,
  Progress,
  Marks,
  Indicator,
} from "react-speedometer";
import {
  TravelHistoryByBucketV2,
  TripsByBucketAndVehicle,
  getClientSettingByClinetIdAndToken,
  getCurrentAddress,
  getZoneListByClientId,
  vehicleListByClientId,
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
  createMarkerIcon,
} from "@/utils/JourneyReplayFunctions";
import { StopAddressData } from "@/types/StopDetails";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { Tooltip, Button } from "@material-tailwind/react";
// import Select from "react-select";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

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
      borderColor: "green", // Change this to the desired border color
    },
    "&:after": {
      borderColor: "green", // Change this to the desired border color
    },
  },
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
    fromDateTime: new Date(),
    period: "",
    toDateTime: new Date(),
    unit: session?.unit || "",
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
  const [stopVehicle, setStopVehicle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDates, setCurrentDates] = useState<any>(0);
  const [weekDataGrouped, setweekDataGrouped] = useState(false);
  const [weekData, setWeekData] = useState(false);
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

    if (!carMovementInterval) {
      if (currentPositionIndex >= polylinedata.length) {
        setCurrentPositionIndex(0);
      }
    }
  };

  const stopTick = () => {
    setIsPlaying(false);
    setIsPaused(false);
    // setStopVehicle(true);
    // setStopVehicle(true)

    // if (carMovementInterval) {
    //   clearInterval(carMovementInterval);
    //   setCarMovementInterval(undefined);
    // }
  };
  const pauseTick = async () => {
    setIsPlaying(false);
    setIsPaused(true);
    if (polylinedata.length > 0) {
      setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][1]));
    }
    setCurrentPositionIndex(0);

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
  useEffect(() => {
    if (isPlaying && !isPaused) {
      const totalSteps = TravelHistoryresponse.length - 1;
      let step = currentPositionIndex;

      const currentData = TravelHistoryresponse[step];
      const nextData = TravelHistoryresponse[step + 1];

      if (currentData && nextData) {
        const currentLatLng = new L.LatLng(currentData.lat, currentData.lng);
        const nextLatLng = new L.LatLng(nextData.lat, nextData.lng);

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

              setMapcenterToFly([centerLat, centerLng]);
              setzoomToFly(zoomlevel);
              setzoom(zoomlevel);
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
      stopTick();
    }
  }, [
    isPlaying,
    currentPositionIndex,
    isPaused,
    TravelHistoryresponse,
    speedFactor,
    stopVehicle,
  ]);
  useEffect(() => {
    if (polylinedata.length > 0) {
      setCarPosition(new L.LatLng(polylinedata[0][0], polylinedata[0][1]));
      setMapcenter([polylinedata[0][0], polylinedata[0][1]]);
    }
  }, [polylinedata]);

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
    (async function () {
      if (session) {
        const allzoneList = await getZoneListByClientId({
          token: session?.accessToken,
          clientId: session?.clientId,
        });
        setZoneList(allzoneList);
      }
    })();

    (async function () {
      if (session) {
        const clientSettingData = await getClientSettingByClinetIdAndToken({
          token: session?.accessToken,
          clientId: session?.clientId,
        });

        if (clientSettingData) {
          const centervalue = await clientSettingData?.[0].PropertyValue;

          if (centervalue) {
            const match = centervalue.match(/\{lat:([^,]+),lng:([^}]+)\}/);
            if (match) {
              const lat = parseFloat(match[1]);
              const lng = parseFloat(match[2]);

              if (!isNaN(lat) && !isNaN(lng)) {
                setMapcenter([lat, lng]);
              }
            }
          }
          setClientsetting(clientSettingData);
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

  useEffect(() => {
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10); // Format the date as 'YYYY-MM-DD'
    setCurrentDate(formattedDate);
  }, []);

  const formattedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  const parsedDateTime = new Date(currentTime);
  const formattedDateTime = `${parsedDateTime}
    .toISOString()
    .slice(0, 10)}TO${timeOnly}`;
  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);

    e.preventDefault();

    setClearMapData(true);
    if (session) {
      const { VehicleReg, period } = Ignitionreport;
      if (period == "week") {
        setWeekData(true);
      }
      if (period == "today") {
        setWeekData(false);
      }
      if (VehicleReg && period) {
        let newdata = {
          ...Ignitionreport,
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
            }T${timeend}Z`,
          };
        } else {
          newdata = {
            ...newdata,
            fromDateTime: `${
              weekData ? formattedFromDateTime : currentDate
            }T${timestart}Z`,
            toDateTime: `${
              weekData ? formattedToDateTime : currentDate
            }T${timeend}Z`,
          };
        }
        setIgnitionreport(newdata);
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
        try {
          const response = await toast.promise(
            TripsByBucketAndVehicle({
              token: session.accessToken,

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
          setDataResponse(response.data);

          if (response.success === true) {
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
          console.error(`Error calling API for ${newdata}:`, error);
        }
      }
    }
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
  };
  const handleClick = () => {
    setShowRadioButton(!getShowRadioButton);
  };

  function getFormattedDate(date: any) {
    return date.toISOString().slice(0, 10);
  }

  const handleDivClick = async (
    TripStart: TripsByBucket["TripStart"],
    TripEnd: TripsByBucket["TripEnd"]
  ) => {
    setlat(null);
    setlng(null);
    try {
      setIsPlaying(false);
      if (session) {
        let newresponsedata = {
          ...Ignitionreport,
          fromDateTime: `${TripStart}`,
          toDateTime: `${TripEnd}`,
        };

        const TravelHistoryresponseapi = await toast.promise(
          TravelHistoryByBucketV2({
            token: session.accessToken,

            payload: newresponsedata,
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
        var addresses: any = [];
        stopPoints.map(async function (singlePoint: any) {
          var completeAddress = await axios
            .get(
              `https://eurosofttechosm.com/nominatim/reverse.php?lat=${singlePoint.lat}&lon=${singlePoint.lng}&zoom=19&format=jsonv2`
            )
            .then(async (response: any) => {
              return response.data;
            });
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
        setTravelHistoryresponse(TravelHistoryresponseapi.data);
      }
    } catch (error) {
      console.error(`Error calling API for:`, error);
    }
  };

  useEffect(() => {
    if (TravelHistoryresponse && TravelHistoryresponse.length > 0) {
      setPolylinedata(
        TravelHistoryresponse.map((item: TravelHistoryData) => [
          item.lat,
          item.lng,
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
          if (session) {
            const Data = await getCurrentAddress({
              token: session.accessToken,
              lat: lat,
              lon: lng,
            });

            stopDetailsArray.push(Data);
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
        distanceCovered: item.distanceCovered,
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
    setCurrentDateDefaul(true);
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [fieldName]: newDate?.toISOString().split("T")[0],
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

  const handleGetItem = (item: any) => {
    setIsDynamicTime(item);
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

  const handleInputChange: any = (e: any) => {
    setClearMapData(false);
    const { name, value } = e.target;
    setIgnitionreport((prevReport: any) => ({
      ...prevReport,
      [name]: value,
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
      // setweekDataGrouped("week");
      setIsCustomPeriod(true);
    } else if (name === "period" && value != "custom") {
      // setweekDataGrouped("week");
      setIsCustomPeriod(false);
    }
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

  const groupedData: any = {};

  dataresponse?.map((item: any) => {
    if (!groupedData[item.TripStartDateLabel]) {
      // If the date group doesn't exist, create it with an empty array and count set to 1
      groupedData[item.TripStartDateLabel] = {
        trips: [item],
        count: 1,
      };
    } else {
      // If the date group already exists, push the trip and increment the count
      groupedData[item.TripStartDateLabel].trips.push(item);
      groupedData[item.TripStartDateLabel].count += 1;
    }
  });

  return (
    <>
      <div style={{ height: "90vh" }}>
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
        <div className="grid xl:grid-cols-10 lg:col-span-10 md:grid-cols-12  gap-5 px-4 text-start pt-4 bg-bgLight">
          <div className="xl:col-span-1 lg:col-span-2 md:col-span-2  col-span-12 mt-2 ">
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
            <Select
              value={Ignitionreport.VehicleReg}
              onChange={handleInputChange}
              MenuProps={MenuProps}
              disabled={loading}
              name="VehicleReg"
              id="select_box_journey"
              displayEmpty
              className="h-8 text-black font-popins font-bold w-full outline-green px-1"
            >
              <MenuItem value="" disabled selected hidden className="text-sm">
                Select Vechile
              </MenuItem>
              {vehicleList?.data?.map((item: DeviceAttach) => (
                <MenuItem
                  className="hover:bg-green hover:text-white"
                  key={item.id}
                  value={item.vehicleReg}
                >
                  {item.vehicleReg}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className="xl:col-span-3 lg:col-span-4 md:col-span-6 col-span-12     pt-2">
            {getShowRadioButton ? (
              <div className="grid lg:grid-cols-12 md:grid-cols-2 sm:grid-cols-2  -mt-5  grid-cols-2  px-10 gap-5 flex justify-center ">
                <div className="lg:col-span-5 md:col-span-1 sm:col-span-1 col-span-2 lg:mt-0 md:mt-0 sm:mt-0  ">
                  <label className="text-green">From</label>
                  <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                    <KeyboardDatePicker
                      format="MM/DD/yyyy"
                      value={Ignitionreport.fromDateTime}
                      onChange={(newDate: any) =>
                        handleDateChange("fromDateTime", newDate)
                      }
                      variant="inline"
                      maxDate={currenTDates}
                    />
                  </MuiPickersUtilsProvider>
                </div>
                <div className="lg:col-span-5 md:col-span-1 sm:col-span-1 col-span-2  ">
                  <label className="text-green">To</label>
                  <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                    <KeyboardDatePicker
                      format="MM/DD/yyyy"
                      value={Ignitionreport.toDateTime}
                      onChange={(newDate: any) =>
                        handleDateChange("toDateTime", newDate)
                      }
                      variant="inline"
                      maxDate={currenTDates}
                      // maxDate={currenTDates}
                      // shouldDisableDate={(date) => !isCurrentDate(date)}
                    />
                  </MuiPickersUtilsProvider>
                </div>
                <div className="lg:col-span-1 ">
                  <button
                    className="text-green ms-5  text-2xl "
                    onClick={() => setShowRadioButton(false)}
                  >
                    x
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="grid xl:grid-cols-11 lg:grid-cols-12  md:grid-cols-12 grid-cols-12 mt-1 "
                // style={{ display: "flex", justifyContent: "start" }}
              >
                <div className="xl:col-span-2 lg:col-span-3  md:col-span-3 sm:col-span-2 col-span-3">
                  <label className="text-sm text-black font-bold font-popins ">
                    <input
                      type="radio"
                      className="w-5 lg:w-4 pt-10 form-radio  "
                      style={{ accentColor: "green", height: "1.5vh" }}
                      name="period"
                      disabled={loading}
                      value="today"
                      checked={Ignitionreport.period === "today"}
                      onChange={handleInputChange}
                    />
                    &nbsp;Today
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3  md:col-span-3 sm:col-span-2  lg:-ms-4 col-span-3 ">
                  <label className="text-sm  text-black font-bold font-popins  w-full pt-3 ">
                    <input
                      type="radio"
                      className="lg:w-5 w-3 lg:w-4 md:w-4 md:-ms-3 lg:-ms-0 xl:-ms-0 -ms-2   form-radio text-green"
                      name="period"
                      disabled={loading}
                      value="yesterday"
                      style={{ accentColor: "green", height: "1.5vh" }}
                      checked={Ignitionreport.period === "yesterday"}
                      onChange={handleInputChange}
                    />
                    &nbsp;Yesterday
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3 md:col-span-3  lg:-ms-1 col-span-3">
                  <label className="text-sm text-black font-bold font-popins  ">
                    <input
                      type="radio"
                      className="w-5 lg:w-4  "
                      name="period"
                      disabled={loading}
                      value="week"
                      style={{ accentColor: "green", height: "1.5vh" }}
                      checked={Ignitionreport.period === "week"}
                      onChange={handleInputChange}
                    />
                    &nbsp;&nbsp;Week
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3 md:col-span-3 -ms-4 col-span-3">
                  <label className="text-sm text-black font-bold font-popins ">
                    <input
                      type="radio"
                      className="w-5  lg:w-4 "
                      disabled={loading}
                      name="period"
                      value="custom"
                      style={{ accentColor: "green", height: "1.5vh" }}
                      checked={Ignitionreport.period === "custom"}
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

          <div className=" xl:col-span-1 lg:col-span-1 md:col-span-4 col-span-12   text-white font-bold h-16 flex justify-center items-center">
            {clearMapData ? (
              <button
                onClick={handleClickClear}
                className={`bg-green py-2 px-8 mb-5 shadow-md`}
              >
                Search
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className={`bg-green py-2 px-8 mb-5 shadow-md`}
              >
                Search
              </button>
            )}
          </div>
          <div className="xl:col-span-3 lg:col-span-1 col-span-12 "> </div>
          {TravelHistoryresponse.length > 0 && (
            <div className="xl:col-span-1 lg:col-span-2 col-span-6  -mt-1 ">
              <div className="grid grid-cols-12  ">
                <div className="col-span-2">
                  <Image src={markerA} alt="harshIcon " className="h-6" />
                  <Image src={markerB} alt="harshIcon " className="h-6 mt-1" />
                </div>
                <div className="col-span-10 text-sm">
                  location Start
                  <br></br>
                  <p className="mt-3">Location End</p>
                </div>
              </div>
            </div>
          )}
          <div className="xl:col-span-1  lg:col-span-2 col-span-6 -mt-1 -ms-5 mb-3">
            {TravelHistoryresponse.filter((item: any) => {
              return (
                item.vehicleEvents.filter(
                  (items: any) => items.Event == "HarshAcceleration"
                ).length > 0
              );
            }).length > 0 && (
              <div className="grid grid-cols-12">
                <div className="col-span-2">
                  <Image
                    src={harshAcceleration}
                    alt="harshIcon "
                    className="h-6 "
                  />
                </div>
                <div className="col-span-10 text-sm">Harsh Acceleration</div>
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
                    src={HarshAccelerationIcon}
                    alt="harshIcon "
                    className="h-6 mt-1"
                  />
                </div>
                <div className="col-span-10 text-sm">
                  <p className="mt-2">Harsh Break</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid lg:grid-cols-5  sm:grid-cols-5 md:grid-cols-12 sm:grid-cols-12 grid-cols-1">
          <div className="xl:col-span-1 lg:col-span-2 md:col-span-5 sm:col-span-12 col-span-4 ">
            <p className="bg-green px-4 py-1 text-white font-bold">
              Trips ({dataresponse?.length})
            </p>
            <div
              id="trips_handle"
              className="overflow-y-scroll overflow-x-hidden bg-bgLight "
            >
              {weekDataGrouped == true
                ? Object.entries(groupedData).map(([date, items]: any) => (
                    <div key={date}>
                      <ul>
                        <div>
                          <Accordion className=" hover:bg-tripBg  cursor-pointer">
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls="panel1a-content"
                              id="panel1a-header"
                            >
                              <Typography>
                                <b>
                                  {date} &nbsp;&nbsp;&nbsp; (x{items.count})
                                </b>
                              </Typography>
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
                              >
                                <Typography>
                                  <div
                                    className="py-5 hover:bg-tripBg  cursor-pointer"
                                    onClick={() => handleGetItem(item)}
                                  >
                                    <div className="grid grid-cols-12 gap-10">
                                      <div className="col-span-1">
                                        <svg
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
                                          <path
                                            stroke="none"
                                            d="M0 0h24v24H0z"
                                          />{" "}
                                          <circle cx="7" cy="17" r="2" />{" "}
                                          <circle cx="17" cy="17" r="2" />{" "}
                                          <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                                        </svg>
                                      </div>
                                      <div className="col-span-10 ">
                                        <p className="text-start font-bold text-sm text-gray">
                                          Duration: {item.TripDurationHr}{" "}
                                          Hour(s) {item.TripDurationMins}{" "}
                                          Minute(s)
                                        </p>
                                        <p className=" text-green text-start font-bold text-sm">
                                          {" "}
                                          Distance: {item.TotalDistance}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-12 gap-10 mt-5">
                                      <div className="col-span-1">
                                        <svg
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
                                        </svg>
                                        <div className=" border-l-2 h-10 border-green  mx-4 my-3"></div>
                                      </div>
                                      <div className="col-span-8 ">
                                        <p className="text-start font-bold text-sm text-labelColor">
                                          <span className="text-green">
                                            {" "}
                                            Location Start:dd
                                          </span>{" "}
                                          <br></br>{" "}
                                          <span className="text-gray">
                                            {item.StartingPoint}
                                          </span>
                                        </p>
                                        <p className=" text-gray text-start font-bold text-sm">
                                          {" "}
                                          Trip Start: {
                                            item.TripStartDateLabel
                                          }{" "}
                                          &nbsp;
                                          {item.TripStartTimeLabel}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-12 gap-10">
                                      <div className="col-span-1">
                                        <svg
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
                                        </svg>
                                      </div>
                                      <div className="col-span-8 ">
                                        <div className="text-start font-bold text-sm text-labelColor">
                                          <span className="text-green">
                                            {" "}
                                            Location End:
                                          </span>{" "}
                                          <br></br>
                                          <span className="text-gray">
                                            {" "}
                                            {item.EndingPoint}
                                          </span>
                                        </div>
                                        <p className=" text-gray text-start font-bold text-sm">
                                          {" "}
                                          Trip End:{item.TripEndDateLabel}{" "}
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
                  ))
                : dataresponse?.map((item: TripsByBucket, index: number) => (
                    <button
                      key={index}
                      className=" my-2 "
                      onClick={() =>
                        handleDivClick(item.fromDateTime, item.toDateTime)
                      }
                    >
                      <div
                        className="py-5 hover:bg-tripBg px-5 cursor-pointer"
                        onClick={() => handleGetItem(item)}
                      >
                        <div className="grid grid-cols-12 gap-10">
                          <div className="col-span-1">
                            <svg
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
                              <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                            </svg>
                          </div>
                          <div className="col-span-10 ">
                            <p className="text-start font-bold text-sm text-gray">
                              Duration: {item.TripDurationHr} Hour(s){" "}
                              {item.TripDurationMins} Minute(s)
                            </p>
                            <p className=" text-green text-start font-bold text-sm">
                              {" "}
                              Distance: {item.TotalDistance}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-10 mt-5">
                          <div className="col-span-1">
                            <svg
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
                            </svg>
                            <div className=" border-l-2 h-10 border-green  mx-4 my-3"></div>
                          </div>
                          <div className="col-span-8 ">
                            <p className="text-start font-bold text-sm lg:mr-0 md:mr-10  text-labelColor">
                              <span className="text-green">
                                {" "}
                                Location Start:
                              </span>{" "}
                              <br></br>{" "}
                              <span className="text-gray">
                                {item.StartingPoint}
                              </span>
                            </p>
                            <p className=" text-gray text-start font-bold text-sm lg:mr-0 md:mr-10">
                              {" "}
                              Trip Start: {item.TripStartDateLabel} &nbsp;
                              {item.TripStartTimeLabel}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-10">
                          <div className="col-span-1">
                            <svg
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
                            </svg>
                          </div>
                          <div className="col-span-8 ">
                            <p className="text-start lg:mr-0 md:mr-10 font-bold text-sm text-labelColor">
                              <span className="text-green"> Location End:</span>{" "}
                              <br></br>
                              <span className="text-gray">
                                {" "}
                                {item.EndingPoint}
                              </span>
                            </p>
                            <p className=" text-gray lg:mr-0 md:mr-10 text-start font-bold text-sm">
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
            className="xl:col-span-4 lg:col-span-3 md:col-span-7 sm:col-span-12 col-span-4"
            style={{ position: "relative" }}
          >
            <div>
              {mapcenter !== null && (
                <MapContainer
                  id="map"
                  zoom={zoom}
                  center={mapcenter}
                  className="z-0"
                  style={{ height: "calc(90vh - 100px)" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
                  />

                  <Polyline
                    pathOptions={{ color: "red", weight: 12 }}
                    positions={polylinedata}
                  />
                  {isPlaying ? (
                    <SetViewOnClick coords={mapcenter} />
                  ) : (
                    <SetViewfly coords={mapcenterToFly} zoom={zoomToFly} />
                  )}

                  {showZones &&
                    zoneList.map(function (singleRecord) {
                      return singleRecord.zoneType == "Circle" ? (
                        <>
                          <Circle
                            center={[
                              Number(singleRecord.centerPoints.split(",")[0]),
                              Number(singleRecord.centerPoints.split(",")[1]),
                            ]}
                            radius={Number(singleRecord.latlngCordinates)}
                          />
                        </>
                      ) : (
                        <Polygon
                          positions={JSON.parse(singleRecord.latlngCordinates)}
                        />
                      );
                    })}

                  {carPosition && (
                    <Marker
                      position={carPosition}
                      icon={createMarkerIcon(getCurrentAngle())}
                    ></Marker>
                  )}

                  {lat && lng && (
                    <Marker
                      position={[lat, lng]}
                      icon={
                        new L.Icon({
                          iconUrl:
                            "https://img.icons8.com/fluency/48/000000/stop-sign.png",
                          iconAnchor: [22, 47],
                          popupAnchor: [1, -34],
                        })
                      }
                    ></Marker>
                  )}
                  {TravelHistoryresponse.length > 0 && (
                    <div>
                      <Marker
                        position={[
                          TravelHistoryresponse[0].lat,
                          TravelHistoryresponse[0].lng,
                        ]}
                        icon={
                          new L.Icon({
                            iconUrl:
                              "https://img.icons8.com/fluent/48/000000/marker-a.png",
                            iconAnchor: [22, 47],
                            popupAnchor: [1, -34],
                          })
                        }
                      ></Marker>

                      <Marker
                        position={[
                          TravelHistoryresponse[
                            TravelHistoryresponse.length - 1
                          ].lat,
                          TravelHistoryresponse[
                            TravelHistoryresponse.length - 1
                          ].lng,
                        ]}
                        icon={
                          new L.Icon({
                            iconUrl:
                              "https://img.icons8.com/fluent/48/000000/marker-b.png",
                            iconAnchor: [22, 47],
                            popupAnchor: [1, -34],
                          })
                        }
                      ></Marker>
                    </div>
                  )}

                  {TravelHistoryresponse.map((item) => {
                    if (item.vehicleEvents.length > 0) {
                      return item.vehicleEvents.map((items) => {
                        if (items.Event === "HarshBreak") {
                          return (
                            <Marker
                              position={[item.lat, item.lng]}
                              icon={
                                new L.Icon({
                                  iconUrl:
                                    "https://img.icons8.com/nolan/64/speed-up.png",
                                  iconSize: [40, 40],
                                  iconAnchor: [16, 37],
                                })
                              }
                            ></Marker>
                          );
                        }
                        if (items.Event === "HarshAcceleration") {
                          return (
                            <Marker
                              position={[item.lat, item.lng]}
                              icon={
                                new L.Icon({
                                  iconUrl:
                                    "https://img.icons8.com/color/48/000000/brake-discs.png",
                                  iconSize: [30, 30],
                                  iconAnchor: [16, 37],
                                })
                              }
                            ></Marker>
                          );
                        }
                      });
                    }
                  })}
                </MapContainer>
              )}
            </div>

            <div className="absolute lg:top-4 lg:left-20 lg:right-5 left-12 top-6 right-2 grid lg:grid-cols-10 md:grid-cols-10 sm:grid-cols-10 grid-cols-10 lg:mt-0  ">
              <div className="xl:col-span-2 lg:col-span-4 md:col-span-5 sm:col-span-3 col-span-5">
                <div className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 grid-cols-12 bg-green py-2 shadow-lg">
                  <div className="lg:col-span-10  md:col-span-10 sm:col-span-10 col-span-11">
                    <p className="text-white lg:px-3 ps-1 text-lg">
                      Stop Details ({stops.length})
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
                        onClick={handleShowDetails}
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
                        onClick={handleShowDetails}
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
                  <div className="bg-white h-60 overflow-y-scroll">
                    {stops?.map((item: any) => {
                      return (
                        <div
                          onClick={() => handleClickStopCar(item)}
                          className="cursor-pointer"
                        >
                          <p className="text-gray px-3 py-3 text-sm">
                            {item?.address}
                          </p>

                          <div className="grid grid-cols-12">
                            <div className="col-span-7"></div>
                            <div className="col-span-5 text-center text-red text-bold px-1 w-24   text-sm border-2 border-red">
                              {moment(new Date(item?.date)).format("h:mm:ss a")}
                            </div>
                          </div>
                          <br></br>
                          <hr className="text-gray"></hr>
                        </div>
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

              <div className="xl:col-span-7 lg:col-span-4 md:col-span-2 sm:col-span-4 "></div>

              <div className="xl:col-span-1 lg:col-span-2  md:col-span-3 sm-col-span-2 col-span-4 text-end  ">
                <div
                  className="grid xl:grid-cols-3  grid-cols-5 sm:grid-cols-3 bg-bgLight  py-3 shadow-lg"
                  onClick={handleZoneClick}
                >
                  <div className="col-span-1  text-center ">
                    <input
                      type="checkbox"
                      onChange={handleChangeChecked}
                      checked={getCheckedInput}
                      // style={{ accentColor: "green" }}
                    />
                  </div>
                  <div className="lg:col-span-2 sm:col-span-2 col-span-4  lg:-ms-5">
                    <button className="text-sm" onClick={handleChangeChecked}>
                      <h1 className="xl:-ms-32 lg:-ms-24  sm:-ms-32 -ms-24">
                        {" "}
                        Show zones
                      </h1>
                    </button>
                  </div>
                </div>
                {/* <div
                  className="grid grid-cols-11 mt-3"
                  style={{ justifyContent: "center", display: "flex" }}
                >
                  <div className="col-span-9 bg-bgPlatBtn w-20 h-10 rounded-tr-full rounded-tl-full"></div>
                </div> */}
              </div>
            </div>
            <div
              className="grid lg:grid-cols-10  grid-cols-10"
              id="speed_meter"
            >
              <div className="col-span-2  lg:w-52 md:w-44 sm:w-44 w-44 rounded-md ">
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
                    <p className="text-white text-sm px-2 py-1 -mt-16 w-full bg-bgPlatBtn rounded-md">
                      Distance: {getSpeedAndDistance()?.distanceCovered}
                    </p>
                  </div>
                ) : null}

                {isPaused && (
                  <p className="bg-bgPlatBtn text-white mt-3 w-full px-2 py-3 rounded-md">
                    {TripAddressData}
                  </p>
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
              className="absolute xl:left-56 lg:left-10 xl:right-20 lg:right-10 xl:bottom-0 lg:bottom-24 md:bottom-8 bottom-2  left-1 right-3"
            >
              <div className="grid xl:grid-cols-7 lg:grid-cols-12 md:grid-12 grid-cols-12 lg:gap-5 gap-2 ">
                <div className="xl:col-span-1 lg:col-span-3 md:col-span-4 col-span-4  ">
                  <div className="bg-bgPlatBtn rounded-md">
                    <div className="lg:text-xl text-white font-medium text-center  py-2 text-md mx-1">
                      <BlinkingTime timezone={session?.timezone} />
                    </div>

                    <div className=" border-t border-white my-1 lg:w-32 mx-2"></div>
                    <div className="mt-3 pb-3 ms-1">
                      <Tooltip content="Pause" className="bg-black">
                        <button onClick={stopTick}>
                          <svg
                            className="h-5 w-5 lg:mx-2 lg:ms-5 md:mx-3 sm:mx-3 md:ms-4 sm:ms-6  mx-1 "
                            style={{
                              color: stopVehicle === true ? "gray" : "white",
                            }}
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
                            <line x1="4" y1="4" x2="4" y2="20" />{" "}
                            <line x1="20" y1="4" x2="20" y2="20" />{" "}
                            <rect x="9" y="6" width="6" height="12" rx="2" />
                          </svg>
                        </button>
                      </Tooltip>
                      <Tooltip content="Play" className="bg-black">
                        <button onClick={tick}>
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
                        <button onClick={pauseTick}>
                          <svg
                            className="h-4   w-4  lg:mx-2 md:mx-3 sm:mx-3 mx-1"
                            width="24"
                            style={{ color: isPaused ? "green" : "white" }}
                            fill={isPaused ? "green" : "white"}
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
                  </div>
                </div>
                <div className="xl:col-span-4 lg:col-span-8 col-span-8   ">
                  <div className="grid lg:grid-cols-12 grid-cols-12 gap-1 lg:py-5 py-2 mt-8 pt-4 lg:pt-8 rounded-md  mx-2 px-5 bg-white">
                    <div
                      className="lg:col-span-11 col-span-10"
                      style={{ height: "4vh" }}
                    >
                      <Slider
                        value={progressWidth}
                        // defaultValue={progressWidth}
                        // max={maxSliderValue}
                        // min={minSliderValue}
                        onChange={handleChangeValueSlider}
                        color="secondary"
                        style={{
                          color: "#00B56C",
                          paddingBottom: "2%",
                        }}
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

                      <div className="grid grid-cols-12 ">
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
                      </div>
                    </div>
                    <div className="lg:col-span-1 col-span-1 ">
                      {isPlaying && (
                        <Select
                          className="text-black  outline-green border h-8 w-16 border-grayLight px-1"
                          value={speedFactor}
                          onChange={(e) =>
                            setSpeedFactor(Number(e.target.value))
                          }
                        >
                          <MenuItem
                            className="hover:bg-green hover:text-white text-sm"
                            value={1}
                          >
                            1x
                          </MenuItem>
                          <MenuItem
                            className="hover:bg-green hover:text-white text-sm"
                            value={2}
                          >
                            2x
                          </MenuItem>
                          <MenuItem
                            className="hover:bg-green hover:text-white text-sm"
                            value={4}
                          >
                            4x{" "}
                          </MenuItem>
                          <MenuItem
                            className="hover:bg-green hover:text-white text-sm"
                            value={6}
                          >
                            6x
                          </MenuItem>
                        </Select>
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
