import { VehicleData } from "@/types/vehicle";

import React, { MouseEvent, useEffect, useState } from "react";
import { ActiveStatus } from "../General/ActiveStatus";
import { useSession } from "next-auth/react";
import { zonelistType } from "../../types/zoneType";
import { getZoneListByClientId, getallattributes, getalluserview } from "../../utils/API_CALLS";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchZone } from "@/lib/slices/zoneSlice";
import { useSelector } from "react-redux";
import "./index.css";
import infoIcon from "../../../public/icon2.svg"
import infoIcon2 from "../../../public/icon3.svg"
import { duration } from "moment";
import Image from "next/image";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
const moment = require("moment-timezone");
const CountryFlag = ({ country }) => {
  const flagMap = {
    France: "https://flagpedia.net/data/flags/h80/fr.png",
    Switzerland: "https://flagpedia.net/data/flags/h80/ch.png",
    Pakistan: "https://flagpedia.net/data/flags/h80/pk.png",
    "United Arab Emirates": "https://flagpedia.net/data/flags/h80/ae.png",
    "United Kingdom": "https://flagpedia.net/data/flags/h80/gb.png",
    Canada: "https://flagpedia.net/data/flags/h80/ca.png",
    Australia: "https://flagpedia.net/data/flags/h80/au.png",
  };

  const flagUrl = flagMap[country] || "";

  return (
    <>
      {flagUrl &&
        <img
          src={flagUrl}
          alt="Flag"
          className="h-5 w-5 object-cover" // Adjust size as necessary
        />
      }
    </>

  );
};

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
  // setShowZonePopUp,
  setShowZones,
  // setSelectedOdoVehicle,
  // selectedOdoVehicle,
  setPosition,
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
  // setShowZonePopUp: any;
  setShowZones: any;
  // setSelectedOdoVehicle:any;
  // selectedOdoVehicle:any;
  setPosition:any;


}) => {
  const { data: session } = useSession();

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
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [allattributes, setallattributes] = useState([]);
  const [allfields, setAllfields] = useState([])
  useEffect(() => {
    (async function () {
      if (session?.defaultView == false) {
        const data = await getalluserview(session.userId, session.accessToken)
        setallattributes(data.data)
      }
      const data = await getallattributes({
        token: session.accessToken,
        userId: session.userId,
      });
      setAllfields(data.data);


    })()
  }, [])

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
  function timeAgo(timestamp: any) {
    const now =
      (new Date(new Date().toLocaleString("en-US", { timeZone: session.timezone }))).getTime()
    const past = (new Date(timestamp)).getTime();
    const diffInSeconds = Math.floor((now - past) / 1000); // Difference in seconds   

    if (diffInSeconds < 60) { // 60 sec
      return "few seconds ago";
    } else if (diffInSeconds < 1800) { //1800s = 30 min
      const minutes = Math.floor(diffInSeconds / 60);
      return minutes === 1 ? "a minute ago" : `few minutes ago`;
    } else if (diffInSeconds < 3600) { // 3600 sec 1 hour (lies in this block between 30 min to 1 hour)
      return "half an hour ago"
    }
    else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return hours === 1 ? "an hour ago" : `few hours ago`;
    } else if (diffInSeconds < 172800) {
      return "yesterday";
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1 ? "a day ago" : `few days ago`;
    }
  }
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
  const [activeIndex, setActiveIndex] = useState(0); // Tracks the active button
  const [activeLabel, setactiveLabel] = useState("All"); // Tracks the active button


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
    if (activeLabel == "All") {

      if (searchData.search) {
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

            let allatribute = allattributes?.find((i: any) => {
              return i.vehicleId == item.vehicleId
            })

            allatribute?.attributes?.map((i) => {
              if (i.allow == false) {
                delete item[i.key]
              }
            })


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
      }
      else {

        setFilteredData(carData)
      }

    }
    else {
      const filtered = carData
        ?.filter((data) =>
          data.vehicleStatus?.toLowerCase().includes(activeLabel?.toLowerCase())
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

          let allatribute = allattributes?.find((i: any) => {
            return i.vehicleId == item.vehicleId
          })

          allatribute?.attributes?.map((i) => {
            if (i.allow == false) {
              delete item[i.key]
            }
          })


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
    }

  }, [searchData.search, carData, activeLabel]);
  let router = useRouter()

  const handleClickVehicle = (item: any) => {
    //const filterData = carData.filter(
    //   (items) => items.vehicleId === item.vehicleId
    // );
    router.push(`/liveTracking?IMEI=${item.IMEI}`)

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


  // const handleodometer = (item: any, e: any) => {

  //   const rect = e.currentTarget.getBoundingClientRect();
  //   if (selectedOdoVehicle?.vehicleReg == item.vehicleReg) {
  //     setPosition({ top: 0, left: 0 });
  //     setSelectedOdoVehicle(null)
  //   }
  //   else {
  //     setSelectedOdoVehicle(item)

  //     // setPosition({ top: e.clientY , left: e.clientX  });
  //     setPosition({ top: rect.top, left: rect.left });

  //   }

  // }

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };




  const data = [
    { label: 'All', color: '#94a3b8', count: countParked + countMoving + countPause },
    { label: 'Parked', color: 'red', count: countParked },
    { label: 'Moving', color: 'green', count: countMoving },
    { label: 'Pause', color: '#eec40f', count: countPause },
  ];

  const handleButtonClick = (index) => {
    setActiveIndex(index);
    const selectedData = data[index];
    setactiveLabel(selectedData.label)


  };

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
      {/* <div className="grid grid-cols-2  md:pb-8 text-center border-y-2  border-green bg-zoneTabelBg py-4 text-white vehicle_summary">
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
      </div> */}
      <div className="pb-[3px] bg-zoneTabelBg border-y-2 border-green text-white">
        {/*  <div className="text-center">
        <p className="text-xs font-popins font-semibold text-black ">Vehicle Summary:</p>
      </div> */}

        <div className="grid grid-cols-4 text-center px-2">
          {data.map(({ label, color, count }, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center cursor-pointer group`}
              onClick={() => handleButtonClick(index)} // Set active index on click
            >
              <span
                className={`text-black font-bold text-2xl transition-transform group-hover:text-black`}
              >
                {count}
              </span>
              <span
                className="font-medium text-sm"
                style={{
                  color: color, // Yellow text if label is 'Pause', otherwise dynamic color

                }}
              >
                {label}
              </span>
              {/*   <span
  className="font-medium text-sm"
  style={{
    color: label === 'Pause' ? 'yellow' : color, // Yellow text if label is 'Pause', otherwise dynamic color
    WebkitTextStroke: label === 'Pause' ? '0.7px black' : 'none', // Black outline for 'Pause' text
  }}
>
  {label}
</span> */}


              {/* Container with fixed height to prevent text movement */}
              <div className="h-[4px] w-full mt-1">
                <div
                  className={`h-[2px] w-full transition-all group-hover:bg-black`}
                  style={{
                    backgroundColor: activeIndex === index ? color : "transparent", // Active color
                    height: activeIndex === index ? "4px" : "2px", // Thicker line for active
                  }}
                />
              </div>
            </div>
          ))}
        </div>




        {/*  <div className="grid grid-cols-4  text-center">
      <div className="flex items-center justify-center space-x-2">
        <svg
          className="h-2 w-2 text-blue"
          viewBox="0 0 24 24"
          fill="#3b82f6"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
        <span className="text-black font-bold text-sm">{`${countMoving + countPause + countParked}`}</span>
      </div>
      <div className="flex items-center justify-center space-x-2">
          <svg
            className="h-2 w-2 text-red"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="text-black font-bold text-sm">{`${countParked}`}</span>
        </div>

        
        <div className="flex items-center justify-center space-x-2">
          <svg
            className="h-2 w-2 text-green"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="text-black font-bold text-sm">{`${countMoving}`}</span>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <svg
            className="h-2 w-2 text-yellow"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="text-black font-bold text-sm">{`${countPause}`}</span>
        </div>

      
      </div> */}
      </div>
      <div
        className="overflow-y-scroll bg-zoneTabelBg"
        id="scroll_side_bar"
        style={{ height: fullparams == "full" ? "81vh" : "" }}
      >
        {filteredData?.map((item: VehicleData, index: any) => {
          return (
            <div key={index} style={{ backgroundColor: activeColor == item.vehicleId ? "#e1f0e3" : "" }} className="hover:bg-[#e1f0e3] cursor-pointer pt-2">
              <div onClick={() => handleClickVehicle(item)}>
                <div key={item?.IMEI} className="grid lg:grid-cols-12 md:grid-cols-12 sm:grid-cols-12 grid-cols-12 md:space-x-4 text-center">
                  <div className="xl:col-span-6 lg:col-span-5 md:col-span-4 sm:col-span-6 col-span-4 status_car_btn">
                    <div className="font-popins font-semibold text-start lg:text-xl text-1xl">
                      {/* Vehicle Registration */}
                      <p
                        className="text-black">
                        {item?.vehicleReg}
                      </p>

                      {/* Badge Section */}
                      <div className="">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`inline-block px-1 py-1 rounded-md text-sm shadow ${item?.vehicleStatus === "Moving"
                              ? "bg-green text-white"
                              : item?.vehicleStatus === "Parked"
                                ? "bg-red text-white"
                                : "bg-[#eec40f] text-white"

                              }`}
                          >
                            <span>{item?.vehicleStatus || "Unknown"}</span>
                          </div>


                          {item?.flag ? (
                            <img
                              src={item.flag}
                              alt="Flag"
                              className="h-5 w-5 object-cover" // Adjust size as necessary
                            />
                          ) : <CountryFlag country={item.OsmElement?.address?.country} />
                          }
                          <div className="lg:col-span-3 md:col-span-3 col-span-2 text-sm w-max">
                            <p className="w-max">
                              {item.gps.speedWithUnitDesc}
                            </p>
                          </div>
                          {session?.timezone !== undefined ? (
                            <>
                              <ActiveStatus
                                currentTime={new Date().toLocaleString("en-US", { timeZone: session.timezone })}
                                targetTime={item.timestampNotParsed}
                                reg={item.vehicleReg}
                              />

                            </>
                          ) : ""}


                        </div>

                      </div>


                    </div>
                    <div
                      className=
                      "font-popins flex items-center space-x-2 text-sm w-max"

                    // "inline-block px-1 py-1 rounded-md text-sm shadow"
                    >
                      <p style={{ fontSize: "15px" }}>
                        <strong>Last Parked:</strong> {item?.lastParked}
                      </p>

                    </div>

                  </div>



                  <div className="xl:col-span-6 text-[13px] lg:col-span-4 md:col-span-4 sm:col-span-6 col-span-4 pl-8">
                    <div className=" border border-gray p-1 rounded-md">
                      {
                        timeAgo(item.timestampNotParsed?.includes("-") ? item?.timestamp : item?.timestampNotParsed)

                      }
                    </div>
                    {item.defaultView == false && ( //change to defualtview
                      <div
                        className="flex justify-end mr-[2px]"
                        data-tooltip-target="tooltip-right"
                        data-tooltip-placement="right"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {expandedIndex === index ? (
                          <ExpandLessIcon
                            onClick={() => toggleExpand(null)} // Collapse when clicked
                            className="cursor-pointer text-[#00B56C]"
                            style={{ fontSize: "32px" }} // Increase icon size
                          />
                        ) : (
                          <ExpandMoreIcon
                            onClick={() => toggleExpand(index)} // Expand when clicked
                            className="cursor-pointer text-[#00B56C]"
                            style={{ fontSize: "32px" }} // Increase icon size
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-1 text-md font-bold text-labelColor">

                </div>
                {item.DriverName && (item?.vehicleStatus === "Moving" || item?.vehicleStatus === "Pause") && (
                  <p className="text-start font-bold">Driver Name: {item.DriverName.replace("undefine", "")}</p>
                )}
              </div>

              {expandedIndex === index && item.defaultView == false
                && (
                  <div className="mt-2 rounded-md bg-gray-100">
                    {allfields.map((attribute) => {
                      const getNestedValue = (obj, path) => {
                        const keys = path.split('.');
                        for (let key of keys) {
                          if (obj && obj.hasOwnProperty(key)) {
                            obj = obj[key];
                          } else {
                            return undefined;
                          }
                        }
                        return obj;
                      };

                      const value = getNestedValue(item, attribute.key);

                      // Check if the current attribute is the one requiring calculation
                      if (attribute.key === "gpsStatus") {
                        // Only show this field if gpsStatus is true
                        if (attribute.key === "gpsStatus" && allattributes.find((i) => { return i.vehicleId == item.vehicleId })?.attributes.find((j) => { return j.key == "gpsStatus" })?.allow) {
                          // Only show this field if gpsStatus is true
                          const targetTimeDate = new Date(item.targetTime);
                          const currentTimeDate = new Date(item.currentTime);
                          const timeDiffMinutes = Math.abs(targetTimeDate.getTime() - currentTimeDate.getTime()) / (1000 * 60);
                          const newDivColor = timeDiffMinutes > 120 ? false : true;
                          return (
                            <p key={attribute.key} style={{ display: "flex", flexWrap: "wrap", fontSize: "15px", marginBottom: "5px" }}>
                              <strong style={{ width: "150px", marginRight: "10px" }}>{attribute.label}:</strong>
                              <span style={{ flex: 1, wordWrap: "break-word", textAlign: "right" }}> {newDivColor ? "On" : "Off"}</span>
                            </p>
                          );
                        }

                        // Render other attributes
                      }
                      if (value) {
                        return (
                          <p key={attribute.key} style={{ display: "flex", flexWrap: "wrap", fontSize: "15px", marginBottom: "5px" }}>
                            <strong style={{ width: "150px", marginRight: "10px" }}>{attribute.label}:</strong>
                            <span style={{ flex: 1, wordWrap: "break-word", textAlign: "right" }}>{value}</span>
                          </p>
                        );
                      }
                      // if (attribute.allow && value) {
                      // }
                      return null;
                    })}
                  </div>
                )}



              <button className="border-b-2 border-green w-full text-end"></button>

            </div>



          );
        })}
      </div>
    </div>
  );
};
export default LiveSidebar;
