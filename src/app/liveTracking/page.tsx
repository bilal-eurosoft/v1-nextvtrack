"use client";
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import uniqueDataByIMEIAndLatestTimestamp from "@/utils/uniqueDataByIMEIAndLatestTimestamp";
import { VehicleData } from "@/types/vehicle";
import { ClientSettings } from "@/types/clientSettings";
import L, { LatLng } from "leaflet";
import {
  getVehicleDataByClientId,
  getAllVehicleByUserId,
} from "@/utils/API_CALLS";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { socket } from "@/utils/socket";
import countCars from "@/utils/countCars";
import LiveSidebar from "@/components/LiveTracking/LiveSidebar";
const LiveMap = dynamic(() => import("@/components/LiveTracking/LiveMap"), {  
  ssr: false,
});

const LiveTracking = () => {
  let { data: session } = useSession();
  if (!session) {
    session = JSON.parse(localStorage?.getItem("user"));
  }
  const carData = useRef<VehicleData[]>([]);
  const [updatedData, setUpdateData] = useState<VehicleData[]>([]);

  const [clientSettings, setClientSettings] = useState<ClientSettings[]>([]);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const [activeColor, setIsActiveColor] = useState<any>("");
  const [showAllVehicles, setshowAllVehicles] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // const [showZonePopUp, setShowZonePopUp] = useState(true);
  const [isFirstTimeFetchedFromGraphQL, setIsFirstTimeFetchedFromGraphQL] =
    useState(false);
  // const [lastDataReceivedTimestamp, setLastDataReceivedTimestamp] = useState(
  //   new Date()
  // );
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(
    null
  );
  const [selectedOdoVehicle, setSelectedOdoVehicle] = useState(null);
  const [userVehicle, setuserVehicle] = useState([]);
  const [unselectVehicles, setunselectVehicles] = useState(false);
  const [zoom, setZoom] = useState(10);
  const [showZones, setShowZones] = useState(false);

  const [mapCoordinates, setMapCoordinates] = useState<LatLng | null | []>(
    null
  );
  const clientMapSettings = clientSettings?.filter(
    (el) => el?.PropertDesc === "Map"
  )[0]?.PropertyValue;
  const clientZoomSettings = clientSettings?.filter(
    (el) => el?.PropertDesc === "Zoom"
  )[0]?.PropertyValue;
  const searchParams = useSearchParams();
  const fullparams = searchParams.get("screen");
  useEffect(() => {
    const regex = /lat:([^,]+),lng:([^}]+)/;
    if (clientMapSettings) {
      const match = clientMapSettings.match(regex);

      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        setMapCoordinates([lat, lng]);
      }
    }
    let zoomLevel = clientZoomSettings ? parseInt(clientZoomSettings) : 11;
    setZoom(zoomLevel);
  }, [clientMapSettings]);
  // This useEffect is responsible for checking internet connection in the browser.
  // useEffect(() => {
  //   setIsOnline(navigator.onLine);
  //   function onlineHandler() {
  //     setIsOnline(true);
  //   }
    
  //   function offlineHandler() {
  //     setIsOnline(false);
  //   }
  //   // if (typeof window !== "undefined") {
  //   //   window.addEventListener("online", onlineHandler);
  //   //   window.addEventListener("offline", offlineHandler);
  //   //   return () => {
  //   //     window.removeEventListener("online", onlineHandler);
  //   //     window.removeEventListener("offline", offlineHandler);
  //   //   };
  //   // }
  // }, []);

  useEffect(() => {
    async function userVehicles() {
      if (session && session.userRole === "Controller") {
        const data = await getAllVehicleByUserId({
          token: session.accessToken,
          userId: session.userId,
        });
        setuserVehicle(data.data);
      }
    }
    userVehicles();
  }, []);
  const role = session?.userRole;
  const fetchTimeoutGraphQL = fullparams == "full" ? 10 * 1000 : 60 * 1000; //60 seconds

  useEffect(() => {
    
    async function dataFetchHandler() {
      if (session?.clientId) {
        const clientVehicleData = await getVehicleDataByClientId(
          session?.clientId
        );

        if (clientVehicleData?.data?.Value) {
          let parsedData = JSON.parse(
            clientVehicleData?.data?.Value
          )?.cacheList;
          // call a filter function here to filter by IMEI and latest time stamp
          let uniqueData = uniqueDataByIMEIAndLatestTimestamp(parsedData);
          // carData.current = uniqueData;
          let matchingVehicles;
          if (role === "Controller") {
            let vehicleIds = userVehicle.map((item: any) => item._id);
            // Filter carData.current based on vehicleIds
            matchingVehicles = uniqueData.filter((vehicle) =>
              vehicleIds.includes(vehicle.vehicleId)
            );
            setUpdateData(matchingVehicles)

            carData.current = matchingVehicles;
          } else {
           
            setUpdateData(uniqueData)
            carData.current = uniqueData;
          }
          
          // setIsFirstTimeFetchedFromGraphQL(true);
        }
        // const clientSettingData = await getClientSettingByClinetIdAndToken({
        //   token: session?.accessToken,
        //   clientId: session?.clientId,
        // });
        if (clientSettings.length == 0) {
          setClientSettings(session?.clientSetting);
        }
      }
    }
    dataFetchHandler();
    // let interval:any;
    
    // if (!isFirstTimeFetchedFromGraphQL) {
    
    // } else {
    
    //   interval = setInterval(dataFetchHandler, fetchTimeoutGraphQL); // Runs every fetchTimeoutGraphQL seconds

    // }
    // return () => {
    //   clearInterval(interval); // Clean up the interval on component unmount
    // };
  }, [isFirstTimeFetchedFromGraphQL
    ]);

    useEffect(()=>{
  let interval = setInterval(()=>{    
    setIsFirstTimeFetchedFromGraphQL(prev=>!prev)
  }, fetchTimeoutGraphQL); // Runs every fetchTimeoutGraphQL seconds

  return () => {
    clearInterval(interval); // Clean up the interval on component unmount
  };
},[isOnline,
  session?.clientId,userVehicle])
  // This useEffect is responsible for fetching data from the GraphQL Server.
  // Runs if:
  // Data is not being recieved in last 60 seconds from socket.
  // useEffect(() => {
  //   const dataFetchHandler = async () => {
  //     // Does not run for the first time when page is loaded
  //     if (isFirstTimeFetchedFromGraphQL) {
  //       // const now = new Date();
  //       // const elapsedTimeInSeconds = Math.floor(
  //       // (now.getTime() - lastDataReceivedTimestamp.getTime()) / 1000
  //       // );
  //       if (session?.clientId) {
  //         // getVehicleDataByClientId(session?.clientId);
  //         const clientVehicleData = await getVehicleDataByClientId(
  //           session?.clientId
  //         );

  //         if (clientVehicleData?.data?.Value) {
  //           let parsedData = JSON.parse(
  //             clientVehicleData?.data?.Value
  //           )?.cacheList;
  //           // call a filter function here to filter by IMEI and latest time stamp
  //           let uniqueData = uniqueDataByIMEIAndLatestTimestamp(parsedData);
  //           // carData.current = uniqueData;
  //           let matchingVehicles;
  //           if (role === "Controller") {
  //             let vehicleIds = userVehicle.map((item: any) => item._id);
  //             // Filter carData.current based on vehicleIds
  //             matchingVehicles = uniqueData.filter((vehicle) =>
  //               vehicleIds.includes(vehicle.vehicleId)
  //             );
  //             carData.current = matchingVehicles;
  //           } else {
  //             carData.current = uniqueData;
  //           }

  //           setIsFirstTimeFetchedFromGraphQL(true);
  //         }
  //       }
  //       // if (elapsedTimeInSeconds <= fetchTimeoutGraphQL) {
  //       // }
  //     }
  //   };
  //   const interval = setInterval(dataFetchHandler, fetchTimeoutGraphQL); // Runs every fetchTimeoutGraphQL seconds
  //   return () => {
  //     clearInterval(interval); // Clean up the interval on component unmount
  //   };
  // }, [
  //   isFirstTimeFetchedFromGraphQL,
  //   session?.clientId,
  //   // lastDataReceivedTimestamp,
  //   fetchTimeoutGraphQL
  // ]);

  // This useEffect is responsible for getting the data from socket and updating it into the state.
  useEffect(() => {
    if (isOnline && session?.clientId && fullparams != "full") {
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

            let matchingVehicles;
            if (role === "Controller") {
              let vehicleIds = userVehicle.map((item: any) => item._id);
              // Filter carData.current based on vehicleIds
              matchingVehicles = uniqueData.filter((vehicle) =>
                vehicleIds.includes(vehicle.vehicleId)
              );
            setUpdateData(matchingVehicles)


              carData.current = matchingVehicles;
            } else {
            setUpdateData(uniqueData)

              carData.current = uniqueData;
            }
            // carData.current = uniqueData;

            // setLastDataReceivedTimestamp(new Date());
          }
        );
      } catch (err) {

      }
    }
    if (!isOnline) {
      socket.disconnect();
    }
    return () => {
      socket.disconnect();
    };
  }, [isOnline, session?.clientId, userVehicle]);
useEffect(()=>{  
  
  carData.current =updatedData 
  
},[carData.current])
  const { countParked, countMoving, countPause } = countCars(carData?.current);

  return (
    <>
      <div className="grid lg:grid-cols-5 sm:grid-cols-5 md:grid-cols-5 grid-cols-1">
        <LiveSidebar
          carData={carData.current}
          countMoving={countMoving}
          countPause={countPause}
          countParked={countParked}
          setSelectedVehicle={setSelectedVehicle}
          activeColor={activeColor}
          setIsActiveColor={setIsActiveColor}
          setshowAllVehicles={setshowAllVehicles}
          setunselectVehicles={setunselectVehicles}
          unselectVehicles={unselectVehicles}
          setZoom={setZoom}
          setShowZones={setShowZones}
          // setShowZonePopUp={setShowZonePopUp}
          setSelectedOdoVehicle={setSelectedOdoVehicle}
          selectedOdoVehicle={selectedOdoVehicle}
          setPosition={setPosition}
        />
        {carData?.current?.length !== 0 && (
          <LiveMap
            carData={carData?.current}
            clientSettings={clientSettings}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            setIsActiveColor={setIsActiveColor}
            showAllVehicles={showAllVehicles}
            setunselectVehicles={setunselectVehicles}
            unselectVehicles={unselectVehicles}
            mapCoordinates={mapCoordinates}
            zoom={zoom}
            setShowZones={setShowZones}
            showZones={showZones}
            selectedOdoVehicle={selectedOdoVehicle}
            position={position}
          />
        )}
      </div>
    </>
  );
};

export default LiveTracking;
