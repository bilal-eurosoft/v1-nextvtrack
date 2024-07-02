"use client";
import Loading from "../loading";
import { useState, useEffect } from "react";
import Card from '@mui/material/Card';
import { updateEventPermissionByClientId, getEventPermissionByClientId, clientbyClientid, clientsave } from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { button } from "@material-tailwind/react";
import "./newstyle.css";
import { Toaster, toast } from "react-hot-toast";
import { fabClasses } from "@mui/material";
export default function Notifications() {
  const { data: session } = useSession();
  const [eventsp, setEventsp] = useState({
    ignitionOn: false,
    ignitionOff: true,
    targetEnteredZone: false,
    targetLeftZone: false,
    overSpeeding: false,
    towing: false,
    harshCornering: false,
    harshBreak: false,
    harshAcceleration: false,
  });

  const [notifications, setNotifications] = useState({
    IgnitionOnPushNotification: false,
    IgnitionOnSMS: false,
    IgnitionOnEmail: false,
    IgnitionOffPushNotification: false, 
    IgnitionOffSMS: false, 
    IgnitionOffEmail: false,
    HarshBreakPushNotification: false,
    HarshBreakSMS: false, 
    HarshBreakEmail: false,
    HarshCorneringPushNotification: false,
    HarshCorneringSMS: false, 
    HarshCorneringEmail: false,
    HarshAccelerationPushNotification: false, 
    HarshAccelerationSMS: false, 
    HarshAccelerationmail: false,
    GeofenceNotification: false, 
    GeofenceSMS: false, 
    GeofenceEmail: false,
    OverSpeedNotification: false,
    OverSpeedSMS: false,
    OverSpeedEmail: false,


  });
 


  useEffect(() => {
    const eventsbyclientId = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const data = await getEventPermissionByClientId({
            token: session.accessToken,
            clientId: session?.clientId,
          });
          setEventsp(data);
         console.log("data ", data)
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    }
    eventsbyclientId();

  }, []);


  useEffect(() => {
    const eventsbyclientId = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const response = await clientbyClientid({
            token: session.accessToken,
            clientId: session?.clientId,
          });
         const {IgnitionOnPushNotification, IgnitionOnSMS, IgnitionOnEmail,
          IgnitionOffPushNotification, IgnitionOffSMS, IgnitionOffEmail,
          HarshBreakPushNotification, HarshBreakSMS, HarshBreakEmail,
          HarshCorneringPushNotification, HarshCorneringSMS, HarshCorneringEmail,
          HarshAccelerationPushNotification, HarshAccelerationSMS, HarshAccelerationmail,
          GeofenceNotification, GeofenceSMS, GeofenceEmail,
          OverSpeedNotification, OverSpeedSMS, OverSpeedEmail,
        } = response;
        

        const notifications = {
          IgnitionOnPushNotification, IgnitionOnSMS, IgnitionOnEmail,
          IgnitionOffPushNotification, IgnitionOffSMS, IgnitionOffEmail,
          HarshBreakPushNotification, HarshBreakSMS, HarshBreakEmail,
          HarshCorneringPushNotification, HarshCorneringSMS, HarshCorneringEmail,
          HarshAccelerationPushNotification, HarshAccelerationSMS, HarshAccelerationmail,
          GeofenceNotification, GeofenceSMS, GeofenceEmail,
          OverSpeedNotification, OverSpeedSMS, OverSpeedEmail,
        };


        setNotifications(notifications);

         console.log("client data ", notifications)
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    }
    eventsbyclientId();

  }, [session]);


  const handleUpdatePermissions = async (e: any) => {
    e.preventDefault();
    try {
      if (session) {
        // Call updateEventsPermission function
        const response1 = await updateEventPermissionByClientId({
          token: session.accessToken,
          clientId: session.clientId,
          payload: eventsp,
        });
        console.log("set response for events permission is ", response1);
  
        // Call updateNotifications function
        const response2 = await clientsave({
          token: session.accessToken,
          clientId: session.clientId,
          payload: notifications,
        });
        console.log("set response for notifications is ", response2);
        toast("save Data Successfully");
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
    }
  };

  // const updateEventsPermission = async (e: any) => {
  //   e.preventDefault();
  //   try {
  //     if (session) {
  //       const response = await updateEventPermissionByClientId({
  //         token: session?.accessToken,
  //         clientId: session?.clientId,
  //         payload: eventsp,
  //       });
  //       console.log("set response is ", response);
  //     }
  //   } catch (error) {
  //     console.error("Error updating event permission:", error);
  //   }
  // };


  // const updateNotifications = async (e: any) => {
  //   e.preventDefault();
  //   try{
  //     if (session) {
  //       const response = await clientsave({
  //         token: session?.accessToken,
  //         clientId: session?.clientId,
  //         payload: notifications,
  //       });
  //       console.log("set response is ", response);
  //     }
  //   }
  //   catch (error) {
  //     console.error("Error updating notification permission:", error);
  //   }
  // }


  const handleEventsPermissionChange =async (e: any) => {
    console.log("eeee ", e.target)
    const { name, checked } = e.target;
 
    if (name === "geofence") {
      setEventsp(prevState => ({
        ...prevState,
        [name]: checked,
        targetEnteredZone: checked,
        targetLeftZone: checked
      }));
    } else {
      setEventsp(prevState => ({
        ...prevState,
        [name]: checked
      }));
    }

    setNotifications(prevState => ({
      ...prevState,
      [name]: checked
    }));
  }


  return (
    <div>
       <hr className="text-white"></hr>
      <p className="bg-green px-4 py-1 text-white mb-5 font-bold text-center">
      Events And Notifications
      </p>
      <div className="overflow-y-scroll overflow-x-hidden bg-bgLight" style={{height: "720px", width: "98%",border: "1px solid #ccc", margin: "auto", marginTop: "30px"}}>
   
<form className="form-material mt-4">
  <div>
  <input
          type="checkbox"
          name="ignitionOn"
          checked={eventsp.ignitionOn}
          onChange={handleEventsPermissionChange}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded dark:focus:ring-green-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 ml-4 "
        />
    <span className="text-green" style={{fontSize: "23px"}}> Ignition On</span>   
    <div className="flex flex-wrap mb-4">
      
    <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.ignitionOn ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}
>
        <CardContent>
          <Typography variant="h5" component="div">
            <input
          type="checkbox"
          name="IgnitionOnPushNotification"
          checked={notifications.IgnitionOnPushNotification}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.ignitionOn}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
        />
        <span style={{fontSize: "21px"}}>  Push Notification </span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.ignitionOn ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="IgnitionOnSMS"
          checked={notifications.IgnitionOnSMS}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.ignitionOn}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
        /> <span style={{fontSize: "21px"}}> SMS </span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.ignitionOn ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="IgnitionOnEmail"
          checked={notifications.IgnitionOnEmail}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.ignitionOn}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
        /> <span style={{fontSize: "21px"}}> Email </span>
          </Typography>
        </CardContent>
      </Card>
    </div>
  </div>
  {/* 2nd */}
  <div>

  <input
          type="checkbox"
          name="ignitionOff"
          checked={eventsp.ignitionOff}
          onChange={handleEventsPermissionChange}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
        />
    <span className="text-green  pt-4" style={{fontSize: "23px", paddingTop: "10px"}}> Ignition Off</span>
    <div className="flex flex-wrap mb-4">
    <Card 
    style={{borderBottom: "none !important"}}
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.ignitionOff ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}
>
  <CardContent>
    <Typography variant="h5" component="div">
      <input
        type="checkbox"
        name="IgnitionOffPushNotification"
        checked={notifications.IgnitionOffPushNotification}
        onChange={handleEventsPermissionChange}
        disabled={!eventsp.ignitionOff}
        style={{accentColor: "green"}}
        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded dark:focus:ring-green-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 ml-4"
      />
      <span style={{fontSize: "21px"}}> Push Notification </span>
    </Typography>
  </CardContent>
</Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.ignitionOff ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="IgnitionOffSMS"
          checked={notifications.IgnitionOffSMS}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.ignitionOff}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4 "

         /><span style={{fontSize: "21px"}}>  SMS </span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.ignitionOff ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="IgnitionOffEmail"
          checked={notifications.IgnitionOffEmail}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.ignitionOff}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"

         /><span style={{fontSize: "21px"}}>  Email </span>
          </Typography>
        </CardContent>
      </Card>
    </div>
  </div>
 
 {/* 3rd */}
   <div>
  <input
          type="checkbox"
          name="geofence"
          checked={eventsp.targetEnteredZone && eventsp.targetLeftZone}
          onChange={handleEventsPermissionChange}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
    <span className="text-green"style={{fontSize: "23px"}}> Geofence</span>
    <div className="flex flex-wrap mb-4">
          <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.targetEnteredZone ? "opacity-50 cursor-not-allowed" : "cursor-pointer"  && !eventsp.targetLeftZone ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
            <input
          type="checkbox"
          name="GeofenceNotification"
          checked={notifications.GeofenceNotification}
          onChange={handleEventsPermissionChange}
          style={{accentColor: "green"}}
          disabled={!eventsp.targetEnteredZone && !eventsp.targetLeftZone}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          /> 
           <span style={{fontSize: "21px"}}>  Push Notification </span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.targetEnteredZone ? "opacity-50 cursor-not-allowed" : "cursor-pointer"  && !eventsp.targetLeftZone ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="GeofenceSMS"
          checked={notifications.GeofenceSMS}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.targetEnteredZone && !eventsp.targetLeftZone}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
        <span style={{fontSize: "21px"}}> SMS</span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105  ${
    !eventsp.targetEnteredZone ? "opacity-50 cursor-not-allowed" : "cursor-pointer"  && !eventsp.targetLeftZone ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="GeofenceEmail"
          checked={notifications.GeofenceEmail}
          onChange={handleEventsPermissionChange}
          style={{accentColor: "green"}}
          disabled={!eventsp.targetEnteredZone && !eventsp.targetLeftZone}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
           <span style={{fontSize: "21px"}}> Email </span>
          </Typography>
        </CardContent>
      </Card>
    </div>
  </div>
  
  {/* 4th */}
  <div>
  <input
          type="checkbox"
          name="overSpeeding"
          checked={eventsp.overSpeeding}
          onChange={handleEventsPermissionChange}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
    <span className="text-green "style={{fontSize: "23px"}}> Over Speed</span>
    <div className="flex flex-wrap mb-4">
             <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.overSpeeding ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="OverSpeedNotification"
          checked={notifications.OverSpeedNotification}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.overSpeeding}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
            <span style={{fontSize: "21px"}}> Push Notification</span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.overSpeeding ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="OverSpeedSMS"
          checked={notifications.OverSpeedSMS}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.overSpeeding}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />   <span style={{fontSize: "21px"}}>SMS</span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.overSpeeding ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="OverSpeedEmail"
          checked={notifications.OverSpeedEmail}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.overSpeeding}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
         <span style={{fontSize: "21px"}}> Email</span>
          </Typography>
        </CardContent>
      </Card>
    </div>
  </div>
  {/* 5th */}
 
  <div>
  <input
          type="checkbox"
          name="harshBreak"
          checked={eventsp.harshBreak}
          onChange={handleEventsPermissionChange}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
        />
    <span className="text-green "style={{fontSize: "23px"}}> Harsh Break</span>
    <div className="flex flex-wrap mb-4">
          <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.harshBreak ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="HarshBreakPushNotification"
          checked={notifications.HarshBreakPushNotification}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.harshBreak} 
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
          <span style={{fontSize: "21px"}}> Push Notification </span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.harshBreak ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="HarshBreakSMS"
          checked={notifications.HarshBreakSMS}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.harshBreak} 
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4 "
          /> <span style={{fontSize: "21px"}}> SMS </span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.harshBreak ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="HarshBreakEmail"
          checked={notifications.HarshBreakEmail}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.harshBreak} 
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          /> <span style={{fontSize: "21px"}}>  Email </span>
          </Typography>
        </CardContent>
      </Card>
    </div>
  </div>
  
    {/* 6th */}
  <div>
  <input
          type="checkbox"
          name="harshCornering"
          checked={eventsp.harshCornering}
          onChange={handleEventsPermissionChange}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
        />
    <span className="text-green "style={{fontSize: "23px"}}> Harsh Cornering</span>
    <div className="flex flex-wrap mb-4">
           <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.harshCornering ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="HarshCorneringPushNotification"
          checked={notifications.HarshCorneringPushNotification}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.harshCornering} 
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"

        />
           <span style={{fontSize: "21px"}}>   Push Notification </span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.harshCornering ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="HarshCorneringSMS"
          checked={notifications.HarshCorneringSMS}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.harshCornering} 
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          /> <span style={{fontSize: "21px"}}>  SMS </span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.harshCornering ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="HarshCorneringEmail"
          checked={notifications.HarshCorneringEmail}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.harshCornering} 
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          /> <span style={{fontSize: "21px"}}> Email </span>
          </Typography>
        </CardContent>
      </Card>
    </div>
  </div>
   {/* 7th */}
  <div>
  <input
          type="checkbox"
          name="harshAcceleration"
          checked={eventsp.harshAcceleration}
          onChange={handleEventsPermissionChange}
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
    <span className="text-green"style={{fontSize: "23px"}}> Harsh Acceleration</span>
    <div className="flex flex-wrap mb-4">
            <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.harshAcceleration ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="HarshAccelerationPushNotification"
          checked={notifications.HarshAccelerationPushNotification}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.harshAcceleration }
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
        <span style={{fontSize: "21px"}}>  Push Notification </span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.harshAcceleration ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="HarshAccelerationSMS"
          checked={notifications.HarshAccelerationSMS}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.harshAcceleration }
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
          <span style={{fontSize: "21px"}}>  SMS </span>
          </Typography>
        </CardContent>
      </Card>
      <Card 
  className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/3 xl:w-1/3 p-2 transition-all duration-300 ease-in-out transform hover:bg-gray-300 hover:shadow-2xl hover:scale-105 ${
    !eventsp.harshAcceleration ? "opacity-50 cursor-not-allowed" : "cursor-pointer" 
  }`}>
        <CardContent>
          <Typography variant="h5" component="div">
          <input
          type="checkbox"
          name="HarshAccelerationmail"
          checked={notifications.HarshAccelerationmail}
          onChange={handleEventsPermissionChange}
          disabled={!eventsp.harshAcceleration }
          style={{accentColor: "green"}}
          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded  dark:focus:ring-green-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600 ml-4"
          />
        <span style={{fontSize: "21px"}}>  Email </span>
          </Typography>
        </CardContent>
      </Card>
    </div>
  </div>
 
</form>
</div>
<br></br><br></br>
<div >
                 
                </div>
           <div className="flex justify-end mx-5">     
                          <button style={{ color: "white", display: "flex", alignItems: "center", font: "bold", 
                          fontSize: "16px",
                          backgroundColor: "#00B56C",
                          border: "none",
                          fontWeight: "bold",
                          borderRadius: "10px"
        }}
                className={`  text-white font-popins shadow-md hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none hover:border-none px-4 `}
                              onClick={handleUpdatePermissions}
                              >
                                 <svg
                    className="h-10 py-3 w-full text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                              <span className="pl-2"> Save</span>
                              </button>

                              
        </div>  
                              <Toaster position="top-center" reverseOrder={false} />
    </div>
    
  );
}
