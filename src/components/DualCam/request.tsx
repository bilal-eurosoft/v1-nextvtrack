"use client";
import React, { ChangeEvent, useRef } from "react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { portalGprsCommand, vehicleListByClientId, videoList , vehiclebyClientid } from "@/utils/API_CALLS";
import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import Select from 'react-select';
import moment from 'moment';
import { DeviceAttach } from "@/types/vehiclelistreports";
import { Toaster, toast } from "react-hot-toast";
import './newstyle.css'; 
import { dateTimeToTimestamp } from "@/utils/unixTimestamp";
// import { List, ListItem, ListItemText, Collapse, RadioGroup, Radio } from '@material-ui/core';
import DateFnsMomentUtils from '@date-io/date-fns';
import EventIcon from '@material-ui/icons/Event';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import {   Box } from "@mui/material";
import {
  MuiPickersUtilsProvider, DatePicker,
} from "@material-ui/pickers";
import { isPagesAPIRouteMatch } from "next/dist/server/future/route-matches/pages-api-route-match";
import { VehicleData } from "@/types/vehicle";

export default function Request() {
  const [pictureVideoDataOfVehicle, setPictureVideoDataOfVehicle] = useState<
    pictureVideoDataOfVehicleT[]
  >([]);
  const { data: session } = useSession();
  const [loading, setLaoding] = useState(false);
  const [currentPageVideo, setCurrentPageVideo] = useState(1);
  const [input, setInput] = useState<any>("");
  const [activeTab1, setActiveTab1] = useState('View');

  const [disabledButton, setdisabledButton] = useState(true);
  const [disabledRequestButton, setdisabledRequestButton] = useState(true);
  const carData = useRef<VehicleData[]>([]);


//   const handleClick = (tab: string) => {
//     setActiveTab1((prevTab) => (prevTab === tab ? 'View' : tab));
//   };
  const [CustomDateField, setCustomDateField] = useState(false);
  const [openFrontAndBackCamera, setOpenFrontAndBackCamera] = useState(false);
  const [selectedCameraType, setSelectedCameraType] = useState(null);
  const [mediaType, setMediaType] = useState('images');
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);
  const [customDate, setCustomDate] = useState(false);
  const [showDurationTab, setshowDurationTab] = useState(false);
const sortedRecords = pictureVideoDataOfVehicle
  .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()); 
  const [filteredRecords, setFilteredRecords] = useState(sortedRecords);
  
  const handlevideodate = ( date: MaterialUiPickersDate | null) => {
    if (date !== null) {
      const dateValue = moment(date).toDate(); 
      setSelectedDate(dateValue);
    }
  };
  
  // useEffect(() => {
  //   // Set filtered records when the component mounts
  //   setFilteredRecords(sortedRecords);
  // }, []);

  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<DeviceAttach | null>(null);


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
  const [selectedDate, setSelectedDate] =  useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedduration, setSelectedDuration] = useState('');
  const handleChangeVideo = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPageVideo(value);
  };


  const hanldeCameraType = () => {
    setOpenFrontAndBackCamera(!openFrontAndBackCamera);
  };
  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const Data = await vehicleListByClientId({
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
  }, [])

  useEffect(() => {
    const vehicleListData = async () => {
      try {
        setLaoding(true);
        if (session) {
          const response = await videoList({
            token: session?.accessToken,
            clientId: session?.clientId,
          });
          setPictureVideoDataOfVehicle(response);
          setFilteredRecords(response);
        }
        setLaoding(false);
      } catch (error) {selectedVehicle
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleListData();
  }, [session]);

  const handleCustom = () => {
    setCustomDate(true);
  };
  const handleWeekend = () => {
    setCustomDate(false);
  };
  const handleClickCustom = () => {
    setCustomDateField(!CustomDateField);
  };
  
  const handleSelectChange = (e: any) => {
    const selectedVehicleId = e;
    const selectedVehicle = vehicleList.find(vehicle => vehicle.vehicleReg === selectedVehicleId?.value);
   setSelectedVehicle(selectedVehicle || null); 
  };
const options =
vehicleList.map((item: any) => ({
  value: item.vehicleReg,
  label: item.vehicleReg,
})) || [];


  const handleCameraTypeChange = (event: { target: { value: any; }; }) => {
    setSelectedCameraType(event.target.value);
  };
  const handleFileTypeChange =  (event: { target: { value: any; }; }) => {
    let filetype = event.target.value
    setSelectedFileType(filetype);
    if(filetype === "Video"){
    setshowDurationTab(true)}
    else {
      setshowDurationTab(false)
    }
  };
  // here camera on code:
  // useEffect(() => {
  //   (async function () {
  //     if (session?.clientId) {
  //       const clientVehicleData = await getVehicleDataByClientId(
  //         session?.clientId
  //       );
  //       if (clientVehicleData?.data?.Value) {
  //         let parsedData = JSON.parse(
  //           clientVehicleData?.data?.Value
  //         )?.cacheList;
  //         // call a filter function here to filter by IMEI and latest time stamp
  //         let uniqueData = uniqueDataByIMEIAndLatestTimestamp(parsedData);
  //        carData.current = uniqueData;
  //        if(carData.current){
  //         const foundVehicle = carData.current.find((vehicle: { vehicleReg: string; }) => vehicle.vehicleReg === selectedVehicle?.vehicleReg);
  //       console.log("Dvfdbvf",foundVehicle )
  //       if (foundVehicle?.frontCamera.value == 3 && foundVehicle?.backCamera.value == 3){
  //         console.log("if" )
  //         setdisabledButton(true)
  //         setdisabledRequestButton(false)
  //       }
  //       else if (foundVehicle?.frontCamera.value == 0 && foundVehicle?.backCamera.value == 0 ) {
  //         console.log("else if" )
  //         setdisabledButton(false)
  //         setdisabledRequestButton(true)
  //       }
  //       else {
  //         console.log("else " )
  //         setdisabledButton(true)
  //         setdisabledRequestButton(true)
  //       }
  //      //   setdisabledButton()
  //        }
  //        console.log("cardata", carData.current )
  //       }
  //  }
  //   })();
  // }, [ session, selectedVehicle]);
  const handlecameraOn = async () =>{
  
    let duration = 500
    let formvalues = {
      commandtext: `setdigout 1 ${duration}` ,
      vehicleReg: selectedVehicle?.vehicleReg,
      command : "",
        createdDate: "",
        modifyDate: "",
        parameter: "",
        deviceIMEI: "",
        status: "Pending",
    }
    if (selectedVehicle == null){
      return toast.error("Please select vehicle")
    }
    if (session ){
    const response = await toast.promise(
      portalGprsCommand({
        token: session?.accessToken, payload: formvalues
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
  }

  const handleDateFilterChange = (event: { target: { value: any; }; }) => {
    const selectedValue = event.target.value;
    setSelectedDateFilter(selectedValue);
    if (selectedValue === "custom") {
      setCustomDate(true);
    } else {
      setCustomDate(false);
    }
  };


  const handleSubmit = async () => {
    const selectedValues = {
      vehicle: selectedVehicle,
      cameraType: selectedCameraType,
      fileType: selectedFileType,
      dateFilter: selectedDateFilter,
    };
    const dateTime = {
      date: selectedDate || new Date(),
      time: selectedTime ,
    };
    const timestamp = dateTimeToTimestamp(dateTime.date.toISOString(), selectedTime);
    let Duration;
    if(Number(selectedduration) <= 10) {
       Duration = selectedduration
    }
    else {
      return toast.error("Please enter duration between 1-10 seconds")
    }
    let commandText;
    if( selectedFileType === "Photo") {
      if(selectedCameraType === "Front"){
        commandText = "camreq: 1,1"
      }
      else if (selectedCameraType === "Back"){
        commandText = "camreq: 1,2"
      }
    }
    else if (selectedFileType === "Video" ) {
      if(selectedCameraType === "Front"){
        commandText = `camreq: 0,1,${timestamp},${Duration}`
      }
      else if (selectedCameraType === "Back"){
        commandText = `camreq: 0,2,${timestamp},${Duration}`
      }
    }
    let formvalues = {
      command : "",
      commandtext: commandText,
      createdDate: "",
      modifyDate: "",
      parameter: "",
      deviceIMEI: "",
      status: "Pending",
      vehicleReg: selectedVehicle?.vehicleReg
    }
    if (session) {
    const response = await toast.promise(
      portalGprsCommand({
        token: session?.accessToken, payload: formvalues
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
    if (response.success) {
      setSelectedVehicle(null)
      setSelectedFileType(null) 
      setSelectedCameraType(null)
      setSelectedDuration('') 
      setSelectedTime('') 
      setSelectedDate(null)
      //   // Additional logic for success
       }
   
    }
    // Perform any further actions, such as sending the selected values to the server
  };

  
  // get video indexing issue
  // const [getVideoPagination, setVideoPagination] = useState<any>([]);
  // useEffect(() => {
  //   const func = async () => {
  //     const data = await pictureVideoDataOfVehicle.map((item) => {
  //       if (item.fileType == 2) {
  //         return item.Vehicle;
  //       }
  //     });
  //     setVideoPagination(data);
  //   };
  //   func();
  // }, []);



  return (
    <div>
        <div className="tab-pane" id="">
        <div className="grid lg:grid-cols-7  md:grid-cols-6  px-4 text-start gap-5 bg-bgLight pt-3 gap-16">
        <div className="css-b62m3t-container ">
   
<Select
              onChange={handleSelectChange}
              options={options}
              placeholder="Pick Vehicle"
              isClearable
              isSearchable
              noOptionsMessage={() => "No options available"}
              className="rounded-md w-full  outline-green border border-grayLight  hover:border-green select_vehicle"
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
                    ? "#E1F0E3"
                    : "transparent",
                  color: state.isSelected
                    ? "white"
                    : state.isFocused
                    ? "black"
                    : "black",
                  "&:hover": {
                    backgroundColor: "#E1F0E3",
                    color: "black",
                  },
                }),
              }}
            />
        </div>
        <div className="col-span-1">
        <div className="border border-gray ">
        <p className="text-sm text-green -mt-3  bg-bgLight lg:w-32 ms-14 px-4 ">
          Camera Type
        </p>
        <div className="flex items-center">
        <label className="text-sm  px-7">
          <input
            type="radio"
            style={{accentColor: "green"}}
            className="w-3 h-3 mr-2 form-radio text-green"
            name="cameraType"
            value="Front"
            checked={selectedCameraType === "Front"}
            onChange={handleCameraTypeChange}
          />
          Front
        </label>
        <label className="text-sm mr-5">
          <input
            type="radio"
            style={{accentColor: "green"}}
            className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
            name="cameraType"
            value="Back"
            checked={selectedCameraType === "Back"}
            onChange={handleCameraTypeChange}
          />
          Back
        </label>
        </div>
      </div>
        </div >
        <div className="col-span-1">
        <div className="border border-gray">
        <p className="text-sm text-green  -mt-3  bg-bgLight lg:w-24 ms-16 px-4">
          File Type
        </p>
        <div className="flex items-center">
        <label className="text-sm px-5">
          <input
            type="radio"
            style={{accentColor: "green"}}
            className="w-3 h-3 mr-2 form-radio text-green"
            name="fileType"
            value="Photo"
            checked={selectedFileType === "Photo"}
            onChange={handleFileTypeChange}
          />
        Image
        </label>
        <label className="text-sm mr-5">
          <input
            type="radio"
            style={{accentColor: "green"}}
            className="w-3 h-3 mr-2 form-radio text-green lg:ms-5"
            name="fileType"
            value="Video"
            checked={selectedFileType === "Video"}
            onChange={handleFileTypeChange}
          />
          &nbsp;Video
        </label>
        </div>
      </div>
          </div>
   {/* here add suraksha */}
   <div className="col-span-2">
  <button
    className={`bg-green px-5 py-2 text-white ${selectedFileType === null || selectedCameraType === null || selectedVehicle === null || (selectedFileType === 'Video' && (selectedDate === null || selectedTime === '' || selectedduration === '')) ? 'disabled' : ''}`}
    onClick={handleSubmit}
    disabled={
      selectedFileType === null ||
      selectedCameraType === null ||
      selectedVehicle === null ||
      (selectedFileType === 'Video' && (selectedDate === null || selectedTime === '' || selectedduration === ''))
    }
  >
    Request
  </button>
  <button 
      className={`bg-green px-2 py-2 text-white  ${disabledButton ? ' cursor-not-allowed' : ''} ` }
      onClick={handlecameraOn}
      disabled={disabledButton}
      style={{marginLeft: "10px"}}
    >
      camera On
    </button>
</div>
          </div>
            <br></br> 
            <br></br>
      <div className="lg:col-span-6 md:col-span-2 ">
  <div className="grid lg:grid-cols-12 md:grid-cols-12 ">
          {showDurationTab && 
      <div className="dateTimeForm lg:col-span-3 md:col-span-12">
      <form className="grid grid-cols-3 gap-2">
        <div className="formGroup col-span-1">
          <label htmlFor="date">Date:</label>
          <Box sx={{ width: '100%',  border: "1px solid #ccc", borderBottom: "none", paddingTop: "7px" }}>
          <MuiPickersUtilsProvider utils={DateFnsMomentUtils}>
      <DatePicker
        format="MM/dd/yyyy"
        value={selectedDate}
        onChange={(item) => handlevideodate(item)}
        variant="inline"
        maxDate={currenTDates}
        autoOk
        style={{ width: '100%' }} // Set the width to 100% to fill the entire div
        inputProps={{ readOnly: true }}
        InputProps={{ endAdornment: <EventIcon style={{width: "20", height: "20"}} /> }}
      />
    </MuiPickersUtilsProvider>
    </Box>
        </div>
        <div className="formGroup">
          <label htmlFor="time">Time:</label>
       <input
            type="time"
            id="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            step="1"
            onKeyPress={(e) => e.preventDefault()}
          /> 
        </div>
        <div className="formGroup">
          <label htmlFor="time">Duration: (in seconds)</label>
          <input
            type="number"
            id="Duration"
            value={selectedduration}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[1-9]$|^10$/.test(value)) {
                setSelectedDuration(value);
              }
            }}
            placeholder="Enter duration between 1-10 sec"
            style={{padding: "9px", border: "1px solid #ccc"}}           
          />
        </div>

      </form>
    </div>
    }
          </div>
        </div>
        </div>
      <br></br>
      <br></br>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
