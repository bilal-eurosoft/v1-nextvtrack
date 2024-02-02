"use client";
// livetrack.tsx
import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import uniqueDataByIMEIAndLatestTimestamp from "@/utils/uniqueDataByIMEIAndLatestTimestamp";
import { zonelistType } from "@/types/zoneType";
import { VehicleData } from "@/types/vehicle";
import { ClientSettings } from "@/types/clientSettings";
import {
  getClientSettingByClinetIdAndToken,
  getVehicleDataByClientId,
  getZoneListByClientId,
} from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { socket } from "@/utils/socket";
import countCars from "@/utils/countCars";
import LiveSidebar from "@/components/LiveTracking/LiveSidebar";
import Image from "next/image";
import logo from "../../../public/Images/logo.png";
const LiveMap = dynamic(() => import("@/components/LiveTracking/LiveMap"), {
  loading: () => (
    <div>
      <div className="inline fixed top-0 right-0 bottom-0 left-0 m-auto w-56 h-10  text-green dark:text-green fill-black">
        <Image src={logo} alt="" style={{ height: "4vh", width: "40%" }} />
        <br></br>
      </div>{" "}
      <div role="status">
        {" "}
        <svg
          aria-hidden="true"
          className="inline fixed top-0 right-0 bottom-0 left-0 m-auto  w-8 h-8  text-green animate-spin dark:text-green fill-black"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only text-3xl"></span>
      </div>
    </div>
  ),
  ssr: false,
});

const LiveTracking = () => {
  const { data: session } = useSession();
  const carData = useRef<VehicleData[]>([]);
  const [clientSettings, setClientSettings] = useState<ClientSettings[]>([]);
  const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const [activeColor, setIsActiveColor] = useState<any>("");

  const [isOnline, setIsOnline] = useState(false);
  const [isFirstTimeFetchedFromGraphQL, setIsFirstTimeFetchedFromGraphQL] =
    useState(false);
  const [lastDataReceivedTimestamp, setLastDataReceivedTimestamp] = useState(
    new Date()
  );
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(
    null
  );

  // This useEffect is responsible for checking internet connection in the browser.
  useEffect(() => {
    setIsOnline(navigator.onLine);
    function onlineHandler() {
      setIsOnline(true);
    }

    function offlineHandler() {
      setIsOnline(false);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("online", onlineHandler);
      window.addEventListener("offline", offlineHandler);

      return () => {
        window.removeEventListener("online", onlineHandler);
        window.removeEventListener("offline", offlineHandler);
      };
    }
  }, []);

  useEffect(() => {
    (async function () {
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
          carData.current = uniqueData;
          setIsFirstTimeFetchedFromGraphQL(true);
        }

        const clientSettingData = await getClientSettingByClinetIdAndToken({
          token: session?.accessToken,
          clientId: session?.clientId,
        });
        if (clientSettingData) {
          setClientSettings(clientSettingData);
        }
      }
    })();
  }, [session]);

  // This useEffect is responsible for fetching data from the GraphQL Server.
  // Runs if:
  // Data is not being recieved in last 60 seconds from socket.

  const fetchTimeoutGraphQL = 60 * 1000; //60 seconds
  useEffect(() => {
    const dataFetchHandler = () => {
      // Does not run for the first time when page is loaded
      if (isFirstTimeFetchedFromGraphQL) {
        const now = new Date();
        const elapsedTimeInSeconds = Math.floor(
          (now.getTime() - lastDataReceivedTimestamp.getTime()) / 1000
        );
        if (elapsedTimeInSeconds <= fetchTimeoutGraphQL) {
          if (session?.clientId) {
            getVehicleDataByClientId(session?.clientId);
          }
        }
      }
    };
    const interval = setInterval(dataFetchHandler, fetchTimeoutGraphQL); // Runs every fetchTimeoutGraphQL seconds

    return () => {
      clearInterval(interval); // Clean up the interval on component unmount
    };
  }, [
    isFirstTimeFetchedFromGraphQL,
    session?.clientId,
    lastDataReceivedTimestamp,
    fetchTimeoutGraphQL,
  ]);

  // This useEffect is responsible for getting the data from socket and updating it into the state.
  useEffect(() => {
    if (isOnline && session?.clientId) {
      try {
        socket.io.opts.query = { clientId: session?.clientId };
        socket.connect();
        socket.on(
          "message",
          (data: { cacheList: VehicleData[] } | null | undefined) => {
            if (data === null || data === undefined) {
              return;
            }
            const uniqueData = uniqueDataByIMEIAndLatestTimestamp(
              data?.cacheList
            );
            carData.current = uniqueData;
            setLastDataReceivedTimestamp(new Date());
          }
        );
      } catch (err) {
        console.log("Socket Error", err);
      }
    }
    if (!isOnline) {
      socket.disconnect();
    }
    return () => {
      socket.disconnect();
    };
  }, [isOnline, session?.clientId]);

  const { countParked, countMoving, countPause } = countCars(carData?.current);

  return (
    <>
      <div className="grid lg:grid-cols-5 sm:grid-cols-5 md:grid-cols-5 grid-cols-1 ">
        <LiveSidebar
          carData={carData.current}
          countMoving={countMoving}
          countPause={countPause}
          countParked={countParked}
          setSelectedVehicle={setSelectedVehicle}
          activeColor={activeColor}
          setIsActiveColor={setIsActiveColor}
        />

        {carData?.current?.length !== 0 && (
          <LiveMap
            carData={carData?.current}
            clientSettings={clientSettings}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            setIsActiveColor={setIsActiveColor}
          />
        )}
      </div>
    </>
  );
};

export default LiveTracking;
