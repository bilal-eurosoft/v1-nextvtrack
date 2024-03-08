import { VehicleData } from "@/types/vehicle";
import { useEffect, useState } from "react";
import { ActiveStatus } from "../General/ActiveStatus";
import { useSession } from "next-auth/react";
import { zonelistType } from "../../types/zoneType";
import { getZoneListByClientId } from "../../utils/API_CALLS";
import { useSearchParams } from "next/navigation";
import "./index.css";
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
}) => {
  const { data: session } = useSession();
  const [searchData, setSearchData] = useState({
    search: "",
  });
  const [filteredData, setFilteredData] = useState<any>([]);
  const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchData({ ...searchData, [name]: value });
  };
  const searchParams = useSearchParams();
  const fullparams = searchParams.get("screen");

  useEffect(() => {
    (async function () {
      if (session) {
        const allzoneList = await getZoneListByClientId({
          token: session?.accessToken,
          clientId: session?.clientId,
        });
        setZoneList(allzoneList);
      }
    })();
  }, [session]);
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
  useEffect(() => {
    const zoneLatlog = zoneList.map((item: any) => {
      if (item.zoneType == "Polygon") {
        return [...JSON.parse(item.latlngCordinates)]?.map((item2: any) => {
          return [item2.lat, item2.lng];
        });
      } else {
        return undefined;
      }
    });
    const filtered = carData
      .filter((data) =>
        data.vehicleReg.toLowerCase().includes(searchData.search.toLowerCase())
      )
      .sort((a: any, b: any) => {
        const regA = parseInt(a.vehicleReg);
        const regB = parseInt(b.vehicleReg);

        // If both values are numeric, sort numerically
        if (!isNaN(regA) && !isNaN(regB)) {
          return regA - regB;
        }

        // If one or both values are non-numeric, sort alphabetically
        if (isNaN(regA) || isNaN(regB)) {
          // Convert to uppercase for case-insensitive sorting
          const regAUpperCase = a.vehicleReg.toUpperCase();
          const regBUpperCase = b.vehicleReg.toUpperCase();

          return regAUpperCase.localeCompare(regBUpperCase);
        }
      })
      .map((item: any) => {
        const i = zoneLatlog.findIndex((zone: any) => {
          if (zone != undefined) {
            return isPointInPolygon(
              [item.gps.latitude, item.gps.longitude],
              zone
            );
          }
        });
        if (i != -1) {
          item.zone = zoneList[i].zoneName;
        }
        return item;
      });
    setFilteredData(filtered);
  }, [searchData.search, carData]);
  const toggleLiveCars = () => {
    setSelectedVehicle(null);
    setshowAllVehicles(true);
    setunselectVehicles(false);
    setIsActiveColor(0);
  };
  const handleClickVehicle = (item: any) => {
    setSelectedVehicle(item);
    setshowAllVehicles(false);
    setIsActiveColor(item.vehicleId);
  };

  return (
    <div className="xl:col-span-1  lg:col-span-2  md:col-span-2 sm:col-span-4  col-span-4 main_sider_bar">
      <div className="grid grid-cols-12 bg-white py-3  lg:gap-0 gap-3 search_live_tracking">
        <div className="lg:col-span-7 w-full  md:col-span-5 sm:col-span-5 col-span-6 sticky top-0">
          <div className="grid grid-cols-12">
            <div className="lg:col-span-1 md:col-span-1 sm:col-span-1">
              <svg
                className="h-5 w-5 ms-1 mt-1 text-green "
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
        <div className="flex text-center lg:col-span-5  md:col-span-7  sm:col-span-5 col-span-5  w-full">
          <button
            className="text-center mx-auto text-md   w-full font-medium text-green mt-1"
            onClick={toggleLiveCars}
          >
            Show({carData?.length}) Vehicles
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2    md:pb-8 text-center border-y-2  border-green bg-zoneTabelBg py-4 text-white vehicle_summary">
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
        style={{ height: fullparams == "full" ? "83vh" : "" }}
      >
        {filteredData?.map((item: VehicleData, index: any) => {
          return (
            <div
              className="hover:bg-[#e1f0e3] cursor-pointer pt-2"
              onClick={() => handleClickVehicle(item)}
              key={index}
              style={{
                backgroundColor: activeColor == item.vehicleId ? "#e1f0e3" : "",
              }}
            >
              <div
                key={item?.IMEI}
                className="grid lg:grid-cols-12 grid-cols-3 text-center py-2"
              >
                <div className="lg:col-span-6  ">
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
                  className="lg:col-span-3 col-span-1"
                  style={{
                    display: "flex",
                    justifyContent: "start",
                    marginLeft: "-5%",
                  }}
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
                <div className="lg:col-span-3 col-span-1">
                  <div className="grid grid-cols-4">
                    <div className="lg:col-span-3 col-span-2 font-bold">
                      {item.gps.speedWithUnitDesc}
                    </div>
                    <div className="text-labelColor">
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
              <div className="lg:text-start md:text-start sm:text-start text-center   mt-1  text-md border-b-2 font-bold border-green text-labelColor">
                <h1 className="font-popins text-start"> {item.timestamp}</h1>
                {/* <p className="text-labelColor">{item.zone}</p> */}
                {/* <p> */}
                {item.DriverName &&
                  (item?.vehicleStatus === "Moving" ||
                    item?.vehicleStatus === "Pause") && (
                    <p>
                      Driver Name: {item.DriverName.replace("undefine", "")}
                    </p>
                  )}
                {/* {item.DriverName.replace("undefine", "")} */}
                {/* </p> */}
                <span className="text-labelColor">
                  {item?.OSM?.address?.road}
                  {/* {item?.OSM?.address?.neighbourhood}
                  {item?.OSM?.address?.road}
                  {item?.OSM?.address?.city} */}
                  <br></br>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default LiveSidebar;
