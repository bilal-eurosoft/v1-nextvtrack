"use client";
import React, { useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  portalGprsCommand,
  vehicleListByClientId,
  videoList,
  vehiclebyClientid,
  getDualCamVehicleByclientId,
  getVehicleDataByClientId,
  sentSmsForCamera,
  // getGprsCommandLatest,
} from "@/utils/API_CALLS";
// import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import Select from "react-select";
import moment from "moment";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { Toaster, toast } from "react-hot-toast";
import "./newstyle.css";
import { dateTimeToTimestamp } from "@/utils/unixTimestamp";
// import { List, ListItem, ListItemText, Collapse, RadioGroup, Radio } from '@material-ui/core';
import { socket } from "@/utils/socket";
import uniqueDataByIMEIAndLatestTimestamp from "@/utils/uniqueDataByIMEIAndLatestTimestamp";
import { useRouter } from "next/navigation";
import DateFnsMomentUtils from "@date-io/date-fns";
import EventIcon from "@material-ui/icons/Event";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { Box } from "@mui/material";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { io } from "socket.io-client";
import { VehicleData } from "@/types/vehicle";

export default function Request({ socketdata, deviceCommandText }) {
  // const [pictureVideoDataOfVehicle, setPictureVideoDataOfVehicle] = useState<
  //   pictureVideoDataOfVehicleT[]
  // >([]);
  const { data: session } = useSession();

  // const [currentPageVideo, setCurrentPageVideo] = useState(1);
  // const [disabledButton, setdisabledButton] = useState(true);
  const [disabledcameraButton, setdisabledcameraButton] = useState(true);
  const [disabledrequestButton, setdisabledrequestButton] = useState(true);
  const [disableallButton, setdisableallButton] = useState(false);
  // const [CustomDateField, setCustomDateField] = useState(false);
  // const [openFrontAndBackCamera, setOpenFrontAndBackCamera] = useState(false);
  const [selectedCameraType, setSelectedCameraType] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState(null);
  // const [selectedDateFilter, setSelectedDateFilter] = useState(null);
  // const [customDate, setCustomDate] = useState(false);
  const [showDurationTab, setshowDurationTab] = useState(false);
  // const [latestGprs, setLatestGprs] = useState(false);
  // const [deviceResponse, setDeviceResponse] = useState<any>("");
  const [toastId, setToastId] = useState<any>(null);
  const [CameraResponseToastId, setCameraResponseToastId] = useState<any>(null);
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<DeviceAttach | null>(
    ""
  );
  const selectedVehicleRef = useRef(selectedVehicle);
  useEffect(() => {
    selectedVehicleRef.current = selectedVehicle;
  }, [selectedVehicle]);
  const [foundVehicleData, setFoundVehicleData] = useState<VehicleData[]>([]);

  const cameraOnRef = useRef(CameraResponseToastId);
  useEffect(() => {
    cameraOnRef.current = CameraResponseToastId;
  }, [CameraResponseToastId]);

  // const sortedRecords = pictureVideoDataOfVehicle.sort(
  //   (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  // );
  // const [filteredRecords, setFilteredRecords] = useState(sortedRecords);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [cameraHidediv, setcameraHidediv] = useState(true);
  const [selectedduration, setSelectedDuration] = useState("");
  /*  const [disabledRequestButton, setdisabledRequestButton] = useState(true); */
  const [deviceresponse, setdeviceresponse] = useState(null);
  // const router = useRouter();
  const carData = useRef<VehicleData[]>([]);
  const [seconds, setSeconds] = useState<number>(0);
  const [secondsduration, setSecondsduration] = useState<number>();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [durationInSecond, setDurationInSeconds] = useState(0);
  const timeZone = session?.timezone;
  const [isFlipped, setIsFlipped] = useState(false); // State for flip animation

  // const handlevideodate = (date: MaterialUiPickersDate | null) => {
  //   if (date !== null) {
  //     const dateValue = moment(date).format("YYYY-MM-DD");
  //     setSelectedDate(dateValue);
  //   }
  // };

  /*  const handlevideodate = (date: any | null) => {
    if (date !== null) {
      const dateValue = moment(date).format("YYYY-MM-DD");
      setSelectedDate(dateValue);
    }
  }; */
  const handlevideodate = (e) => {
    const selectedDate = e.target.value;
    const currentDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

    if (selectedDate > currentDate) {
      toast.error("Selected date cannot be in the future");
      return;
    }

    setSelectedDate(selectedDate);

    // Clear time if the selected date is now in the past
    /* if (selectedTime && selectedDate) {
      const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const currentDateTime = new Date();
  
      if (selectedDateTime > currentDateTime) {
        setSelectedTime("");
      }
    } */
  };

  const currenTDates = new Date();

  useEffect(() => {
    const endTime = localStorage.getItem('endTime');
    if (endTime) {
      setcameraHidediv(false);
    } else {
      setcameraHidediv(true);
    }
  }, []);

  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const Data = await vehiclebyClientid({
            token: session.accessToken,
            clientId: session?.clientId,
          });
          setVehicleList(Data.data);
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleListData();
  }, []);

  const sentSmsForCameraApi = async () => {
    try {
      const Data = await sentSmsForCamera({
        token: session?.accessToken,
        vehicleId: selectedVehicle?._id,
        clientId: session?.clientId,
      });
      toast.success("Vehicle data successfully fetched!");
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (CameraResponseToastId && deviceresponse  == null) {
        toast.dismiss(CameraResponseToastId);
        setCameraResponseToastId(null);
        toast.error(
          "There is an issue for camera on..!   Please try again later",
          {
            duration: 6000,
          }
        );
        // sentSmsForCameraApi()
       // setdeviceresponse(null);
        setdisableallButton(false);
        setSelectedVehicle(null);
        setSelectedFileType(null);
        setSelectedCameraType(null);
      }
      if (toastId && !deviceresponse) {
        toast.dismiss(toastId);
        setToastId(null);
        toast.error(
          "There is an issue for request..!     Please try again later",
          {
            duration: 6000,
          }
        );
        setdeviceresponse(null);
        setdisableallButton(false);
        setSelectedVehicle(null);
        setSelectedFileType(null);
        setSelectedCameraType(null);
        setSelectedDuration("");
        setSelectedTime("");
        setSelectedDate("");
      }
    }, 30000); // 10000 milliseconds = 10 seconds

    // Cleanup function to clear the timeout if the component unmounts or the effect is re-run
    return () => clearTimeout(timeoutId);
  }, [CameraResponseToastId, toastId, deviceresponse]);

  // useEffect(() => {
  //   const vehicleListData = async () => {
  //     try {

  //       if (session) {
  //         const response = await videoList({
  //           token: session?.accessToken,
  //           clientId: session?.clientId,
  //         });
  //         setPictureVideoDataOfVehicle(response);
  //         // setFilteredRecords(response);
  //       }

  //     } catch (error) {
  //       selectedVehicle;
  //       console.error("Error fetching zone data:", error);
  //     }
  //   };
  //   vehicleListData();
  // }, [session]);

  useEffect(() => {
    // Connect to the server
    const socket = io("https://socketio.vtracksolutions.com:1102", {
      autoConnect: false,
      query: { clientId: session?.clientId }, // This gets updated later on with client code.
      transports: ["websocket", "polling", "flashsocket"],
    });
    socket.connect();
    // Listen for "message" event from the server
    socket.on("device", async (data) => {
      // let message= "Wait for your file for downloading"
      // if (
      //   data.commandtext ===
      //   "Photo request from source 1. Preparing to send file from timestamp 1719846377."
      // ) {
      //   message = "Wait for your file for downloading";
      // } else {
      //   message = "Wait for your file for downloading";
      // }
      /* if(!CameraResponseToastId){
        toast.dismiss(CameraResponseToastId);
      } */

      if (data?.commandtext !== "DOUT1:1 Timeout:180s ") {
        /* toast.success(data?.commandtext, {
          position: "top-center",
        }); */
      //  setSeconds(180);
      } else if (data?.commandtext !== "DOUT1:1 Timeout:500s ") {
        /* toast.success(data?.commandtext, {
          position: "top-center",
        }); */
     //   setSeconds(500);
      }
      setdeviceresponse(data?.commandtext);
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  /* useEffect(() => {
  // Check if selectedVehicle is not null
  if (selectedVehicle) {
    // Retrieve carData from localStorage and parse it into an array
  //  const storedData = localStorage.getItem('carData');

    if (carData.current) {
     
      // Find the selected vehicle in carData
      const foundVehicle = carData.current.find((vehicle: { vehicleReg: string; }) => vehicle.vehicleReg === selectedVehicle.vehicleReg);
      
      // If the vehicle is found and its status is "Parked", enable the button
      if (foundVehicle && foundVehicle.vehicleStatus === "Parked") {
       
        setdisabledButton(false);
      } else {
 
        setdisabledButton(true);
      }
    } else {
      // Handle the case where carData is not found in localStorage
    }
  }
}, [selectedVehicle]); */
  // const getVehicleData = async () => {
  //   if (session) {
  //     const result = await getVehicleDataByClientId(session?.clientId);
  //   }
  // };
  useEffect(() => {
    (async function () {
      if (
        session?.clientId &&
        selectedVehicle?.vehicleReg &&
        selectedCameraType &&
        selectedFileType
      ) {
        const clientVehicleData = await getVehicleDataByClientId(
          session?.clientId
        );

        if (clientVehicleData?.data?.Value) {
          let parsedData = JSON.parse(
            clientVehicleData?.data?.Value
          )?.cacheList;
          // call a filter function here to filter by IMEI and latest time stamp
          let uniqueData = uniqueDataByIMEIAndLatestTimestamp(parsedData);
          carData.current = uniqueData;

          if (carData.current) {
            const foundVehicle = carData.current.find(
              (vehicle: { vehicleReg: string }) =>
                vehicle.vehicleReg === selectedVehicle?.vehicleReg
              // localStorage.getItem("selectedVehicle")
            );
            setFoundVehicleData(foundVehicle);

            if (
              foundVehicle?.ignition == 0 &&
              foundVehicle?.camStatus?.value == 0
            ) {
              setdisabledcameraButton(false);
              setdisabledrequestButton(true);
            } else if (
              foundVehicle?.frontCamera?.value == 1 ||
              foundVehicle?.frontCamera?.value == 2 ||
              foundVehicle?.frontCamera?.value == 4
            ) {
              toast.error("Memory card detect failed");

              setdisabledcameraButton(true);
              setdisabledrequestButton(true);
            } else if (foundVehicle?.frontCamera?.value == 3) {
            
              setdisabledcameraButton(true);
              setdisabledrequestButton(false);
            }
          }
        }
      }
    })();
  }, [session, selectedVehicle, selectedCameraType, selectedFileType]);

  useEffect(() => {
    if (session?.clientId) {
      try {
        socket.io.opts.query = { clientId: session?.clientId };
        socket.connect();
        socket.on(
          "message",
          async (data: { cacheList: VehicleData[] } | null | undefined) => {
            if (data === null || data === undefined) {
              return;
            }

            const uniqueData = uniqueDataByIMEIAndLatestTimestamp(
              data?.cacheList
            );

            carData.current = uniqueData;

            if (carData.current) {
              const foundVehicle = carData.current.find(
                (vehicle: { vehicleReg: string }) =>
                  vehicle.vehicleReg === selectedVehicleRef?.current?.vehicleReg
              );

              setFoundVehicleData(foundVehicle);

              if (
                foundVehicle?.ignition == 0 &&
                foundVehicle?.camStatus?.value == 0
              ) {
                setdisabledcameraButton(false);
                setdisabledrequestButton(true);
                if (toastId) {
                  toast.dismiss(toastId);
                  setToastId(null);
                }
                /* if(cameraOnRef.current){
                
                  toast.dismiss(CameraResponseToastId);
                  setCameraResponseToastId(null)
                } */
              } else if (
                foundVehicle?.frontCamera?.value == 1 ||
                foundVehicle?.frontCamera?.value == 2 ||
                foundVehicle?.frontCamera?.value == 4
              ) {
                toast.error("Memory card detect failed");

                setdisabledcameraButton(true);
                setdisabledrequestButton(true);
                /* if(cameraOnRef.current){
                  
                  toast.dismiss(CameraResponseToastId);
                  setCameraResponseToastId(null)
                } */
              } else if (foundVehicle?.frontCamera?.value == 3) {
                setdisabledcameraButton(true);
                setdisabledrequestButton(false);
                if (cameraOnRef.current) {
                  toast.dismiss(CameraResponseToastId);
                  setCameraResponseToastId(null);
                  toast.success("Now, you can make a Request");

if (selectedFileType == "Video") {
  
  startTimer(500);
  setcameraHidediv(false)
} else {
  startTimer(120);
  setcameraHidediv(false)
}
                 
                
                }
              }
            }
            /*          const existingData = localStorage.getItem('carData');
          if (existingData) {
            localStorage.removeItem('carData');
          }
          localStorage.setItem('carData', JSON.stringify(uniqueData)); */
          }
        );
      } catch (err) {}
    }

    return () => {
      socket.disconnect();
    };
  }, [session?.clientId]);

  const handleSelectChange = (e: any) => {
    const selectedVehicleId = e;
    const selectedVehicle = vehicleList.find(
      (vehicle) => vehicle.vehicleReg === selectedVehicleId?.value
    );

    // localStorage.setItem("selectedVehicle", selectedVehicle?.vehicleReg);
    setSelectedVehicle(selectedVehicle || null);
  };

  const options =
    vehicleList?.map((item: any) => ({
      value: item.vehicleReg,
      label: item.vehicleReg,
    })) || [];

  const handleCameraTypeChange = (event: { target: { value: any } }) => {
    setSelectedCameraType(event.target.value);
  };
  const handleFileTypeChange = (event: { target: { value: any } }) => {
    let filetype = event.target.value;
    setSelectedFileType(filetype);
    if (filetype === "Video") {
      setshowDurationTab(true);
    } else {
      setshowDurationTab(false);
    }
  };
  interface HandleCameraOnProps {
    duration?: number;
  }

 
  const handlecameraOn = async () => {
    //   if (duration == 100) toast("Data sent successfully");
    // let duration = 100;
    if (!selectedVehicle || !selectedCameraType || !selectedFileType) {
      return toast.error("Please select the fields");
    }
    if (CameraResponseToastId) {
      return toast.error("Please wait");
    }
    /*  if(showDurationTab == true){
      if(!selectedDate || !selectedTime || !selectedduration){
        return toast.error("Please select the fields")
      }
    } */

    let duration;
    if (selectedFileType == "Video") {
      duration = 500; //(Number(selectedduration) + 2) * 60;
    } else {
      duration = 120;
    }
    setSecondsduration(duration)
    let formvalues = {
      commandtext: `setdigout 1 ${duration}`,
      vehicleReg: selectedVehicle?.vehicleReg,
      command: "",

      modifyDate: "",
      parameter: "",
      deviceIMEI: selectedVehicle?.deviceIMEI,
      createdDate: moment(new Date())
        .tz(session?.timezone)
        .format("MM/DD/YYYY hh:mm:ss"),
      status: "Pending",
    };
    if (selectedVehicle == null) {
      return toast.error("Please select vehicle");
    }
    
    if (session) {
      
      const response = await toast.promise(
        portalGprsCommand({
          token: session?.accessToken,
          payload: formvalues,
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

        if (!CameraResponseToastId) {
          const id = toast.loading("Waiting for Camera on", {
            position: "top-center",
          });
          setCameraResponseToastId(id);
        }
      
      if(response.success){
        
      //  setdisableallButton(true)
        if(selectedFileType === "Video"){
          setshowDurationTab(true)
        }
       
      }
    }
  };

  const handleSubmit = async () => {
    // setLatestGprs(true);

    // const selectedValues = {
    //   vehicle: selectedVehicle,
    //   cameraType: selectedCameraType,
    //   fileType: selectedFileType,
    //   dateFilter: selectedDateFilter,
    // };

    // const dateTime = {
    //   date: selectedDate || new Date(),
    //   time: selectedTime,
    // };
    if (selectedFileType === "Video") {
      if (!selectedDate || !selectedTime || !selectedduration) {
        return toast.error("Please select the fields");
      }
    }
    if (toastId) {
      // return toast.error("Please wait 11")
    }

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const currentDateTime = new Date();

    if (selectedDateTime > currentDateTime) {
      return toast.error("Selected date and time cannot be in the future");
    }

    const timestamp = dateTimeToTimestamp(selectedDate, selectedTime);
    let Duration;
    if (Number(selectedduration) <= 10) {
      Duration = Number(selectedduration) + 1;
    } else {
      return toast.error("Please enter duration between 1-10 seconds");
    }
    let commandText;
    if (selectedFileType === "Photo") {
      if (selectedCameraType === "Front") {
        commandText = "camreq: 1,1";
      } else if (selectedCameraType === "Back") {
        commandText = "camreq: 1,2";
      }
    } else if (selectedFileType === "Video") {
      if (selectedCameraType === "Front") {
        commandText = `camreq: 0,1,${timestamp},${Duration}`;
      } else if (selectedCameraType === "Back") {
        commandText = `camreq: 0,2,${timestamp},${Duration}`;
      }
    }
    /*  if (selectedFileType == "Video") {
      await handlecameraOn({ duration: (Duration + 2) * 60 });
    } else {
      await handlecameraOn({ duration: 200 });
    } */
    let formvalues = {
      command: "",
      commandtext: commandText,
      modifyDate: "",
      parameter: "",
      deviceIMEI: selectedVehicle?.deviceIMEI,
      createdDate: moment(new Date())
        .tz(session?.timezone)
        .format("MM/DD/YYYY hh:mm:ss"),
      status: "Pending",
      vehicleReg: selectedVehicle?.vehicleReg,
    };
    if (!formvalues.commandtext) {
      return toast.error("Please select the fields");
    }
    if (session) {
      const response = await toast.promise(
        portalGprsCommand({
          token: session?.accessToken,
          payload: formvalues,
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

      // if (socketdata.filetype !== ".h265" || socketdata.filetype !== ".jpeg") {
      //   if (!toastId) {
      //     const id = toast.loading("Waiting for Device Response", {
      //       position: "top-center",
      //     });
      //     setToastId(id);
      //   }
      // }

      if (response.success) {
        // setSelectedVehicle(null);

        if (!toastId) {
          const id = toast.loading("Waiting for Device Response", {
            position: "top-center",
          });
          setToastId(id);
        }

        setdisableallButton(false);

        setSelectedFileType(null);
        setSelectedCameraType(null);
        setSelectedDuration("");
        setSelectedTime("");
        setSelectedDate("");
      }
    }
    // setToastId(null);
  };
  // if (socketdata) {
  //   toast.dismiss(toastId);
  // }
  useEffect(() => {
    if (socketdata.filetype == ".h265" || socketdata.filetype == ".jpeg") {
      if (socketdata.progress > 1 && socketdata.progress < 100) {
        setToastId(null);
        toast.dismiss(toastId);
      }
    }
  }, [toastId, socketdata]);
  /* if (socketdata.filetype == ".h265" || socketdata.filetype == ".jpeg") {
    
   // setToastId(null)
    toast.dismiss(toastId);
  } */

  const selectedOption =
    options.find((option) => option.value === selectedVehicle?.vehicleReg) ||
    null;

  const getDate = new Date();
  let getHour = getDate.getHours();
  let getMinute = getDate.getMinutes();
  let getSecond = getDate.getSeconds();
  let fullTime = `${getHour}:${getMinute}:${getSecond}`;

  ///const [seconds, setSeconds] = useState(60);
  /*  const initialTime = 80; // Set initial countdown time (in seconds)
  const [seconds, setSeconds] = useState(() => {
    const savedTime = localStorage.getItem('countdownTime');
    return savedTime ? Number(savedTime) : initialTime;
  });

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined); // Use undefined instead of null

  useEffect(() => {
    if (seconds > 0) {
      timerRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds - 1;
          localStorage.setItem('countdownTime', String(newSeconds)); // Convert to string
          return newSeconds;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current); // Clear the timer when seconds reach 0
      localStorage.removeItem('countdownTime'); // Clear the saved time when it reaches zero
      toast.error("Camera is off");
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current); // Cleanup the interval on unmount
      }
    };
  }, [seconds]); */

  /* useEffect(() => {
    // Function to calculate remaining seconds based on timezone
    const calculateRemainingSeconds = () => {
      const currentTime = new Date();
      const timezone = session?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const localTime = new Date(currentTime.toLocaleString("en-US", { timeZone: timezone }));

      const remainingSeconds = Math.floor((localTime.getTime() - seconds) / 1000);
     
      return remainingSeconds > 0 ? remainingSeconds : 0;
    };

    // Set the initial countdown
    setSeconds(calculateRemainingSeconds());

    const interval = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds > 0) {
          return prevSeconds - 1;
        } else {
          clearInterval(interval);
          return 0; // Stop the timer when it reaches 0
        }
      });
      // Update time for display purposes
      setTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [session?.timezone, seconds]); // Only re-run if the timezone changes */

  /*   useEffect(() => {
    const currentTime = new Date();
    const localTime = new Date(currentTime.toLocaleString("en-US", { timeZone: session?.timezone }));
    
    // Format the time as hours, minutes, and seconds
    const getHourcount = localTime.getHours();
    const getMinutecount = localTime.getMinutes();
    const getSecondcount = localTime.getSeconds();
    
    // Get full current time in seconds
    const fullTimeInSeconds = getHourcount * 3600 + getMinutecount * 60 + getSecondcount;

    // Retrieve stored times from local storage
    const storedStartTime = localStorage.getItem('startdownTime');
    const storedCountTime = localStorage.getItem('countdownTime');

    if (storedStartTime && storedCountTime) {
      const startTimeInSeconds = parseInt(storedStartTime, 10);
      const countdownTime = parseInt(storedCountTime, 10);

      // Calculate the elapsed time
      const elapsedTime = fullTimeInSeconds - startTimeInSeconds;
    
      const updatedSeconds = countdownTime - elapsedTime;

      // Update state if there's time left
      if (updatedSeconds > 0) {
        setSeconds(updatedSeconds);
        localStorage.setItem('countdownTime', String(updatedSeconds)); // Update countdown time in local storage
      } else {
       // toast.error("Camera is off");
        setSeconds(0);
        localStorage.removeItem('countdownTime')
        localStorage.removeItem('startdownTime')
      }
    }

    // Save the current time as start time in local storage
    localStorage.setItem('startdownTime', String(fullTimeInSeconds));

    const timerId = setInterval(() => {
      setSeconds(prevSeconds => {
        
        if (prevSeconds > 0) {
          const newSeconds = prevSeconds - 1;
          localStorage.setItem('countdownTime', String(newSeconds)); // Update countdown time in local storage
          return newSeconds;
        }
        else if ( storedStartTime && storedCountTime) {
          clearInterval(timerId);
          toast.error("Camera is off");
          localStorage.removeItem('countdownTime')
        localStorage.removeItem('startdownTime')
          return 0;
        }
        else {
          const storedStartdownTime = localStorage.getItem('startdownTime');
          const startdownTimeInSeconds = parseInt(storedStartdownTime, 10);
      //    setSeconds(startdownTimeInSeconds);
        localStorage.setItem('countdownTime', String(startdownTimeInSeconds)); // Update countdown time in local storage
         
          return startdownTimeInSeconds; // Stop the timer when it reaches zero
        }
      });
    }, 1000);

    return () => clearInterval(timerId); // Cleanup on unmount
  }, [session?.timezone]); // Run effect when timezone changes */
  /*  useEffect(() => {
    const currentTime = new Date();
    const startTime = localStorage.getItem('startdownTime');

    // If there's a start time, calculate elapsed time
    if (startTime) {
      const startDate = new Date(startTime);
      const elapsedSeconds = Math.floor((currentTime.getTime() - startDate.getTime()) / 1000);
      const updatedSeconds = seconds - elapsedSeconds;

      // Only update the state if there's time left
      if (updatedSeconds > 0) {
        setSeconds(updatedSeconds);
        localStorage.setItem('countdownTime', String(updatedSeconds)); // Update countdown time
      } else {
        toast.error("Camera is off");
        setSeconds(0); // Timer has run out
        localStorage.removeItem('countdownTime'); // Clean up localStorage
      }
    }

    // Set the current time as the start time in local storage
    localStorage.setItem('startdownTime', currentTime.toISOString());

    const timerId = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds > 0) {
          const newSeconds = prevSeconds - 1;
          localStorage.setItem('countdownTime', String(newSeconds)); // Save updated seconds
          return newSeconds;
        } else {
          clearInterval(timerId);
          toast.error("Camera is off");
          return 0; // Stop the timer when it reaches zero
        }
      });
    }, 1000);

    return () => clearInterval(timerId); // Cleanup on unmount
  }, [session?.timezone]); // Run effect when timezone changes */

  /*  useEffect(() => {
    if (seconds > 0) {
      const timerId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
      
      return () => clearInterval(timerId); // Cleanup the interval on unmount
    }
    else {
      toast.error("Camera is off")
    }
  }, [seconds]); */

  /* 
working suppose i hit api and save the seconds in a state suppose 80 and on every seconds counter runs and subtract 1 second but first set localstorage of start time and seconds store and update state and localstorage both first get data from localstorage and subtract according to it . some times i change hte page so the timer will continue when i move back but subtract the time i spent on another page  */


  const startTimer = async (durationInSeconds) => {
    const currentTime = moment.tz(session?.timeZone);
    const endTime = currentTime.add(durationInSeconds, 'seconds');

    localStorage.setItem('endTime', endTime.toISOString());
    
    setSeconds(durationInSeconds);
  //  setSecondsduration(0)
    setIsActive(true);
  };

  useEffect(() => {
    const endTimeString = localStorage.getItem('endTime');

    if (endTimeString) {
      const endTime = moment(endTimeString);
      const currentTime = moment.tz(session?.timeZone);
      const duration = endTime.diff(currentTime, 'seconds');

      if (duration > 0) {
        setSeconds(duration);
        setIsActive(true);
      } else {
        localStorage.removeItem('endTime');
      }
    }

    const interval = setInterval(() => {
      if (isActive) {
        setSeconds((prev) => {
          const newSeconds = prev - 1;

          if (newSeconds !== prev) {
            setIsFlipped(true); // Trigger flip animation
            setTimeout(() => setIsFlipped(false), 600); // Reset flip state after animation duration
          }

          if (newSeconds <= 0) {
            clearInterval(interval);
            setIsActive(false);

            toast.error('Camera closed');
            toast.dismiss(toastId)
            setToastId(null)
            setcameraHidediv(true)
            localStorage.removeItem('endTime');
            return 0;
          }

          return newSeconds;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, session?.timeZone]);

  const formatTime = (time) => (time < 10 ? `0${time}` : time);

  const containerStyle = {
    borderRadius: '8px',
    border: '2px solid green',
    padding: '16px',
    backgroundColor: 'white',
    textAlign: 'center',
    width: '100%', // Change to 100% for full width responsiveness
    maxWidth: '800px', // Add max width for larger screens
    margin: 'auto',
  };
  
  const labelStyle = {
    fontFamily: 'Cormorant, serif',
    fontWeight: '600',
    fontSize: '20px',
    color: '#4A5568',
    marginBottom: '8px',
  };
  
  const timerContainerStyle = {
    display: 'flex',
    alignItems: 'center', // Center items vertically
    justifyContent: 'center',
    gap: '8px', // Adjust gap between elements for better spacing
    /* width: '100%', */ // Ensure it takes full width
  };
  
  const timerStyle = {
    width: '54px',
  };
  
  
  const boxStyle = {
    backgroundColor: '#00B56C',
    padding: '0px 0px',
    borderRadius: '8px',
    overflow: 'hidden',
    perspective: '1000px',
  };
  
  const flipStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    transition: 'transform 0.6s ease',
    transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
    backfaceVisibility: 'hidden',
  };


  const percentage =
    durationInSecond > 0 ? (seconds / durationInSecond) * 100 : 0;
  

  return (
    <div className="p-4 bg-bgLight"> 
    {/* Container for responsive layout */}
    <div className="grid gap-5 grid-cols-1 md:grid-cols-5">
      {/* Vehicle Select */}
      <div className="col-span-1">
        <Select
          value={selectedOption}
          onChange={handleSelectChange}
          options={options}
          placeholder="Pick Vehicle"
          isClearable
          isSearchable
          noOptionsMessage={() => "No options available"}
          className="rounded-md w-full outline-green border border-grayLight hover:border-green"
          styles={{
            control: (provided, state) => ({
              ...provided,
              border: "none",
              boxShadow: state.isFocused ? null : null,
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected ? "#00B56C" : state.isFocused ? "#E1F0E3" : "transparent",
              color: state.isSelected ? "white" : state.isFocused ? "black" : "black",
              "&:hover": {
                backgroundColor: "#E1F0E3",
                color: "black",
              },
            }),
          }}
        />
      </div>

      {/* Camera Type */}
      <div className="col-span-1">
        <div className="border rounded-md border-gray p-2 flex flex-col sm:flex-row items-center">
          <p className="text-sm text-green bg-bgLight px-4 mr-4">Camera Type</p>
          <div className="flex items-center flex-wrap">
            <label className="text-sm flex items-center mr-4">
              <input
                type="radio"
                style={{ accentColor: "green" }}
                className="w-3 h-3 mr-2"
                name="cameraType"
                value="Front"
                disabled={disableallButton}
                checked={selectedCameraType === "Front"}
                onChange={handleCameraTypeChange}
              />
              Front
            </label>
            <label className="text-sm flex items-center">
              <input
                type="radio"
                style={{ accentColor: "green" }}
                className="w-3 h-3 mr-2"
                name="cameraType"
                value="Back"
                disabled={disableallButton}
                checked={selectedCameraType === "Back"}
                onChange={handleCameraTypeChange}
              />
              Back
            </label>
          </div>
        </div>
      </div>

      {/* File Type */}
      <div className="col-span-1">
        <div className="border rounded-md border-gray p-2 flex flex-col sm:flex-row items-center">
          <p className="text-sm text-green bg-bgLight px-4 mr-4">File Type</p>
          <div className="flex items-center flex-wrap">
            <label className="text-sm flex items-center mr-4">
              <input
                type="radio"
                style={{ accentColor: "green" }}
                className="w-3 h-3 mr-2"
                name="fileType"
                value="Photo"
                disabled={disableallButton}
                checked={selectedFileType === "Photo"}
                onChange={handleFileTypeChange}
              />
              Image
            </label>
            <label className="text-sm flex items-center">
              <input
                type="radio"
                style={{ accentColor: "green" }}
                className="w-3 h-3 mr-2"
                name="fileType"
                value="Video"
                disabled={disableallButton}
                checked={selectedFileType === "Video"}
                onChange={handleFileTypeChange}
              />
              Video
            </label>
          </div>
        </div>
      </div>

      {/* Timer Container */}
      {!cameraHidediv && (   
      <div className="col-span-1">
  <div className="pb-2 flex items-center justify-between">
    <p className="text-lg text-green bg-bgLight pl-4">Camera On Duration</p>
    <div style={timerContainerStyle}>
      <div style={timerStyle}>
        <div style={boxStyle}>
          <h6 style={{ fontFamily: 'Cormorant, serif', fontWeight: '400', fontSize: '22px', color: 'white', textAlign: 'center', padding: "2px" }}>
            {formatTime(Math.floor(seconds / 60))} m {/* Minutes */}
          </h6>
        </div>
      </div>
      <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '800', fontSize: '24px', color: '#00B56' }}>:</h3>
      <div style={timerStyle}>
        <div style={boxStyle}>
          <h6 style={{ fontFamily: 'Cormorant, serif', fontWeight: '400', fontSize: '22px', color: 'white', textAlign: 'center', padding: "2px" }}>
            {formatTime(seconds % 60)} s {/* Seconds */}
          </h6>
        </div>
      </div>
    </div>
  </div>
</div>
      )}
    </div>
 



      {/* Buttons */}
      <div className="flex flex-wrap gap-4 my-6">
        <button
          className={`bg-green h-12 px-4  text-white rounded-lg ${
            disabledrequestButton ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSubmit}
          disabled={disabledrequestButton}
        >
          Request
        </button>
        <button
          className={`bg-green h-12 px-4  text-white rounded-lg ${
            disabledcameraButton ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => handlecameraOn({})}
          disabled={disabledcameraButton}
        >
          Camera On
        </button>
       {/*  <div
          className={`timer w-18 bg-green px-4 rounded-lg ${
            seconds === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className=" bg-indigo-600 rounded-lg overflow-hidden ">
            <h3 className="countdown-element seconds font-Cormorant font-semibold text-lg text-white text-center animate-countinsecond">
              {seconds}
            </h3>
          </div>

          <p className="text-lg font-Cormorant font-normal text-white text-center w-full">
            seconds
          </p>
        </div> */}
      {/*   {!cameraHidediv && (       
        <div style={containerStyle}>
      <div style={labelStyle}>Camera On Duration</div>
      <div style={timerContainerStyle}>
        <div style={timerStyle}>
          <div style={boxStyle}>
            <h3 style={{ fontFamily: 'Cormorant, serif', fontWeight: '600', fontSize: '24px', color: 'white', textAlign: 'center' }}>
              {formatTime(Math.floor(seconds / 60))}
            </h3>
          </div>
          <p style={{ fontSize: '16px', textAlign: 'center', marginTop: '8px', color: '#4A5568' }}>
            minutes
          </p>
        </div>
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: '600', fontSize: '24px', color: '#4A5568' }}>:</h3>
        <div style={timerStyle}>
          <div style={boxStyle}>
            <div style={flipStyle}>
              <h3 style={{ fontFamily: 'Cormorant, serif', fontWeight: '600', fontSize: '24px', color: 'white', textAlign: 'center' }}>
                {formatTime(seconds % 60)} 
              </h3>
            </div>
          </div>
          <p style={{ fontSize: '16px', textAlign: 'center', marginTop: '8px', color: '#4A5568' }}>
            seconds
          </p>
        </div>
      </div>
    </div>
     )} */}

        {/*       <div className={`relative h-16 w-32 ${seconds === 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
  <div className="overflow-hidden absolute inset-0 rounded-full bg-green">
    <div
      className="absolute top-0 left-0 h-full bg-[#cccccc]"
      style={{ width: `${100 - percentage}%` }} // Keeps the gray overlay
    />
  </div>
  <div className="flex justify-center items-center absolute inset-0">
    <span className="text-lg font-bold text-black">{seconds} seconds</span> 
  </div>
</div> */}

        {/*      <div class="flex items-start justify-center w-full gap-4 count-down-main">
      
      <div class="timer w-18 bg-[#07bc0c]">
      <div
      class=" bg-indigo-600 py-4 px-2 rounded-lg overflow-hidden ">
      <h3
        class="countdown-element seconds font-Cormorant font-semibold text-2xl text-black text-center animate-countinsecond">15
      </h3>
      </div>
      <p class="text-lg font-Cormorant font-normal text-gray-900 mt-1 text-center w-full">seconds</p>
      </div>
      </div> */}
      </div>
     
      {/* Date, Time, and Duration Form */}
      {showDurationTab && (
        <div className="my-6 bg-gray-100 p-4 rounded-lg shadow-md">
          <form className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col p-2 bg-white border rounded-md shadow-sm">
              <label htmlFor="date" className="font-bold text-gray-700 mb-1">
                Date:
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(item) => handlevideodate(item)}
                step="1"
                onKeyPress={(e) => e.preventDefault()}
                required
                className="border p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col p-2 bg-white border rounded-md shadow-sm">
              <label htmlFor="time" className="font-bold text-gray-700 mb-1">
                Time:
              </label>
              <input
                type="time"
                id="time"
                /*  value={selectedTime >= fullTime ? '' : selectedTime} */
                value={selectedTime}
                onChange={(e) => {
                  if (selectedDate) {
                    const selectedDateTime = new Date(
                      `${selectedDate}T${e.target.value}`
                    );

                    const currentDateTime = new Date();

                    if (selectedDateTime > currentDateTime) {
                      toast.error(
                        "Selected time cannot be in the future for the chosen date"
                      );
                      return;
                    }
                  }
                  setSelectedTime(e.target.value);
                }}
                step="1"
                onKeyPress={(e) => e.preventDefault()}
                required
                className="border p-2 rounded-md"
              />
            </div>
            <div className="flex flex-col p-2 bg-white border rounded-md shadow-sm">
              <label
                htmlFor="duration"
                className="font-bold text-gray-700 mb-1"
              >
                Duration: (in seconds)
              </label>
              <input
                type="number"
                id="duration"
                value={selectedduration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[1-9]$|^10$/.test(value)) {
                    setSelectedDuration(value);
                  }
                }}
                placeholder="Enter duration between 1-10 sec"
                required
                className="border p-2 rounded-md"
              />
            </div>
          </form>
        </div>
      )}

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
