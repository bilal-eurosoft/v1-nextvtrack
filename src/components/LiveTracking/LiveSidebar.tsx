import { VehicleData } from "@/types/vehicle";
import { useEffect, useState } from "react";
import { ActiveStatus } from "../General/ActiveStatus";
import { useSession } from "next-auth/react";
import { zonelistType } from "../../types/zoneType";
import { getZoneListByClientId } from "../../utils/API_CALLS";
import { useSearchParams } from "next/navigation";
import { fetchZone } from "@/lib/slices/zoneSlice";
import { useSelector } from "react-redux";
import "./index.css";
import { duration } from "moment";
const LiveSidebar = ({
  carData,
  countMoving,
  countPause,
  countParked,
  setSelectedVehicle,
  activeColor,
  setIsActiveColor,
  setshowAllVehicles,
  setunselectVehicles,
  unselectVehicles,
  setZoom,
  setShowZonePopUp,
  setShowZones,
}: {
  carData: VehicleData[];
  countPause: Number;
  countParked: Number;
  countMoving: Number;
  setSelectedVehicle: any;
  activeColor: any;
  setIsActiveColor: any;
  setshowAllVehicles: any;
  setunselectVehicles: any;
  unselectVehicles: any;
  setZoom: any;
  setShowZonePopUp: any;
  setShowZones: any;
}) => {
  const { data: session } = useSession();
  const moment = require("moment-timezone");
  const [searchData, setSearchData] = useState({
    search: "",
  });
  const [filteredData, setFilteredData] = useState<any>([]);
  const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const [differnceTimes, setDiffernceTimes] = useState(
    moment.tz(session?.timezone)
  );
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchData({ ...searchData, [name]: value });
  };
  const searchParams = useSearchParams();
  const fullparams = searchParams.get("screen");
  const allZones = useSelector((state) => state.zone);
  useEffect(() => {
    if (session) {
      setZoneList(allZones?.zone);
    }
  }, [allZones]);
  // if (allZones?.zone?.length <= 0) {
  //   const func = async () => {
  //     const Data = await getZoneListByClientId({
  //       token: session?.accessToken,
  //       clientId: session?.clientId,
  //     });
  //     setZoneList(Data);
  //   };
  //   func();
  // }
  // useEffect(() => {
  //   // (async function () {
  //   //   if (session) {
  //   //     // const allzoneList = await getZoneListByClientId({
  //   //     //   token: session?.accessToken,
  //   //     //   clientId: session?.clientId,
  //   //     // });
  //   //     // setZoneList(allzoneList);
  //   //     await dispatch(
  //   //       fetchZone({
  //   //         token: session?.accessToken,
  //   //         clientId: session?.clientId,
  //   //       })
  //   //     );
  //   //   }
  //   // })();
  // }, [session]);
  function isPointInPolygon(point: any, polygon: any) {
    let intersections = 0;
    for (let i = 0; i < polygon.length; i++) {
      const edge = [polygon[i], polygon[(i + 1) % polygon.length]];
      if (rayIntersectsSegment(point, edge)) {
        intersections++;
      }
    }
    return intersections % 2 === 1;
  }
  function rayIntersectsSegment(point: any, segment: any) {
    const [p1, p2] = segment;
    const p = point;
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const t = ((p[0] - p1[0]) * dy - (p[1] - p1[1]) * dx) / (dx * dy);
    return t >= 0 && t <= 1;
  }
  const toggleLiveCars = () => {
    setSelectedVehicle(null);
    setshowAllVehicles(true);
    setunselectVehicles(false);
    setIsActiveColor(0);
    setZoom(10);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDiffernceTimes(moment.tz(session?.timezone));
    }, 1000); // Update every second

    return () => {
      clearInterval(interval); // Clean up interval on component unmount
    };
  }, []);
  const currentMoment = moment.tz(session?.timezone);
  // const formattedDateTime = currentMoment.format("MMMM DD YYYY hh:mm:ss A");
  

  const formattedTimes = filteredData?.map((item: any) => {
    const timestampMoment = moment.tz(
      item?.lastignitionoff,
      "MMMM DD YYYY hh:mm:ss A",
      session?.timezone
    );
    const formattedTime = timestampMoment.format("MMMM DD YYYY hh:mm:ss A");

    // Calculate the duration in milliseconds
    const durationMiliSecond = differnceTimes.diff(timestampMoment);
    const duration = moment.duration(durationMiliSecond);

    // Extract duration in days, hours, minutes, and seconds
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    return {
      formattedTime,
      duration: `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`,
    };
  });

  // let hourConvertIntoDay;
  // if (formattedTimes?.hours >= 24) {
  //   hourConvertIntoDay = formattedTimes?.hours;
  
  // }

  

  
  // const dataArray = Object.values(dataFilter);
  // const mappedDataArray = dataArray.map((item: any, index) => {
  //   return {
  //     ...item,
  //     duration: dataFilter,
  //   };
  // });
  
  useEffect(() => {
    const zoneLatlog = zoneList?.map((item: any) => {
      if (item.zoneType == "Polygon") {
        return [...JSON.parse(item.latlngCordinates)]?.map((item2: any) => {
          return [item2.lat, item2.lng];
        });
      } else {
        return undefined;
      }
    });
    const filtered = carData
      ?.filter((data) =>
        data.vehicleReg.toLowerCase().includes(searchData.search.toLowerCase())
      )
      .sort((a: any, b: any) => {
        const aReg = a.vehicleReg;
        const bReg = b.vehicleReg;

        // Check if both are numbers
        const aIsNumeric = !isNaN(parseInt(aReg));
        const bIsNumeric = !isNaN(parseInt(bReg));

        if (aIsNumeric && bIsNumeric) {
          return parseInt(aReg) - parseInt(bReg);
        } else {
          return aReg.localeCompare(bReg);
        }
      })
      .map((item: any) => {
        const i = zoneLatlog?.findIndex((zone: any) => {
          if (zone != undefined) {
            return isPointInPolygon(
              [item.gps.latitude, item.gps.longitude],
              zone
            );
          }
        });
        if (i && i != -1) {
          item.zone = zoneList[i]?.zoneName;
        }
        return item;
      });
    // const updatedFiltered = {
    //   ...filtered,
    //   duaration: filterTimes, // Add your new key and its value here
    // };
    setFilteredData(filtered);
    // setDataFilter({ ...filtered, dauartions: formattedTimes });
    // setFilteredData((preData: any) => ({
    //   filtered,
    // }));
  }, [searchData.search, carData]);
  const handleClickVehicle = (item: any) => {
    const filterData = carData.filter(
      (items) => items.vehicleId === item.vehicleId
    );
    
    setSelectedVehicle(item);
    setshowAllVehicles(false);
    setIsActiveColor(item.vehicleId);
    setShowZones(false);
  };

  // useEffect(() => {
  //   const setTime = setInterval(() => {
  //     const today = moment().tz(session?.timezone);
  //     setDiffernceTimes(today);
  //   }, 1000);

  //   // // Clear the interval when the component unmounts
  //   return () => clearInterval(setTime);
  // }, []);

  // const duration = moment.duration(filterTime.diff(differnceTime));

  // // Format the duration to show the difference in time
  // const formattedDuration = `${Math.abs(duration.hours())} hours, ${Math.abs(
  //   duration.minutes()
  // )} minutes, ${Math.abs(duration.seconds())} seconds`;

  

  return (
    <div className="xl:col-span-1  lg:col-span-2  md:col-span-2 sm:col-span-2  col-span-5 main_sider_bar">
      <div
        className={
          fullparams == "full"
            ? "grid grid-cols-12 bg-white py-3  lg:gap-0 gap-3"
            : "grid grid-cols-12 bg-white py-3  lg:gap-0 gap-3 search_live_tracking"
        }
      >
        <div className="lg:col-span-7 w-full  md:col-span-5 sm:col-span-5 col-span-6 sticky top-0 search_vehicle_live_tracking">
          <div className="grid grid-cols-12 vehicle_search_left">
            <div className="lg:col-span-1 md:col-span-1 sm:col-span-1">
              <svg
                className="h-5 w-5 ms-1 mt-1 text-green"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              >
                {" "}
                <circle cx="11" cy="11" r="8" />{" "}
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="lg:col-span-11 md:col-span-11 sm:col-span-10  col-span-11 ms-2">
              <input
                type="text"
                name="search"
                className="text-lg bg-transparent text-green w-full px-1  placeholder-green border-b  border-black outline-none "
                placeholder="Search"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="flex text-center lg:col-span-5  md:col-span-6  sm:col-span-7 col-span-6  w-full show_vehicle_left">
          <button
            className="text-center mx-auto text-md   w-full font-medium text-green mt-1"
            onClick={toggleLiveCars}
          >
            Show ({carData?.length}) Vehicles
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2  md:pb-8 text-center border-y-2  border-green bg-zoneTabelBg py-4 text-white vehicle_summary">
        <div className="lg:col-span-1 w-full">
          <p className="text-md mt-1 text-black font-popins font-semibold">
            Vehicle Summary:
          </p>
        </div>
        <div className="lg:col-span-1">
          <div className="grid grid-cols-10">
            <div className="lg:col-span-1">
              <svg
                className="h-6 w-3 text-black mr-2"
                viewBox="0 0 24 24"
                fill="green"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              >
                {" "}
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div className="lg:col-span-1 text-black font-popins font-bold">{`${countMoving}`}</div>
            <div className="lg:col-span-1"></div>
            <div className="lg:col-span-1">
              <svg
                className="h-6 w-3 text-black mr-2"
                viewBox="0 0 24 24"
                fill="yellow"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              >
                {" "}
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div className="lg:col-span-1 text-black font-popins font-bold">{`${countPause}`}</div>
            <div className="lg:col-span-1"></div>
            <div className="lg:col-span-1">
              <svg
                className="h-6 w-3 text-black mr-2"
                viewBox="0 0 24 24"
                fill="#CF000F"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              >
                {" "}
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div className="lg:col-span-1 text-black font-popins font-bold">{`${countParked}`}</div>
          </div>
        </div>
      </div>
      <div
        className="overflow-y-scroll bg-zoneTabelBg"
        id="scroll_side_bar"
        style={{ height: fullparams == "full" ? "81vh" : "" }}
      >
        {filteredData?.map((item: VehicleData, index: any) => {
          return (
            <div key = {index}
              style={{
                backgroundColor: activeColor == item.vehicleId ? "#e1f0e3" : "",
              }}
              className="hover:bg-[#e1f0e3] cursor-pointer pt-2"
            >
              <div onClick={() => handleClickVehicle(item)} key={index}>
                <div
                  key={item?.IMEI}
                  className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 grid-cols-12 md:space-x-4 text-center py-2"
                >
                  <div className="xl:col-span-6 lg:col-span-5  md:col-span-4 sm:col-span-6 col-span-4 status_car_btn">
                    <div className=" font-popins font-semibold text-start w-full lg:text-2xl text-1xl">
                      {item.vehicleStatus === "Parked" ? (
                        <p className="text-[#CF000F] text-start">
                          {item?.vehicleReg}
                        </p>
                      ) : item.vehicleStatus === "Moving" ? (
                        <p className="text-green text-start">
                          {item?.vehicleReg}
                        </p>
                      ) : (
                        <p
                          className={`
                      ${
                        item?.vehicleStatus === "Hybrid"
                          ? "text-black"
                          : !item?.vehicleStatus
                          ? "text-[#CF000F] "
                          : "text-yellow"
                      }
                    `}
                        >
                          {item?.vehicleReg}
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    className=" xl:col-span-2 lg:col-span-3 md:col-span-3 sm:col-span-3 col-span-3"
                    // style={{
                    //   display: "flex",
                    //   justifyContent: "start",
                    //   marginLeft: "-15%",
                    // }}
                    id="btn_left_margin"
                  >
                    <button
                      className={`${
                        item?.vehicleStatus === "Hybrid"
                          ? "bg-white text-black"
                          : item?.vehicleStatus === "Moving"
                          ? "bg-green text-white font-bold"
                          : item?.vehicleStatus === "Parked"
                          ? "bg-[#CF000F]  text-white font-bold"
                          : !item?.vehicleStatus
                          ? "bg-[#CF000F]  text-white font-bold"
                          : "bg-yellow text-white font-bold"
                      } p-1 px-3 -mt-1 shadow-lg`}
                    >
                      {item?.vehicleStatus ? item?.vehicleStatus : "Parked"}
                    </button>
                  </div>
                  <div
                    className="xl:col-span-4 lg:col-span-4 col-span-5 mph_speed"
                    // id="mph_left"
                  >
                    <div className="grid grid-cols-4">
                      <div className="lg:col-span-3 md:col-span-3 col-span-2 font-bold">
                        {item.gps.speedWithUnitDesc}
                      </div>
                      <div className="text-labelColor lg:col-span-1 md:col-span-1 sm:col-span-1 col-span-1">
                        {session?.timezone !== undefined ? (
                          <ActiveStatus
                            currentTime={new Date().toLocaleString("en-US", {
                              timeZone: session.timezone,
                            })}
                            targetTime={item.timestamp}
                            reg={item.vehicleReg}
                          />
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:text-start md:text-start sm:text-start text-center   mt-1  text-md font-bold text-labelColor">
                  <h1 className="font-popins text-start"> {item.timestamp}</h1>

                  {/* <p className="text-labelColor">{item.zone}</p> */}
                  {/* <p> */}
                  {item.DriverName &&
                    (item?.vehicleStatus === "Moving" ||
                      item?.vehicleStatus === "Pause") && (
                      <p className="text-start">
                        Driver Name: {item.DriverName.replace("undefine", "")}
                      </p>
                    )}
                 
                 
                </div>
              </div>
              <button className="border-b-2  border-green w-full text-end -mt-10">
              
                {/* {formattedTimes[index].duration !==
                  "NaN hours, NaN minutes, NaN seconds" &&
                  formattedTimes[index].duration} */}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default LiveSidebar;
