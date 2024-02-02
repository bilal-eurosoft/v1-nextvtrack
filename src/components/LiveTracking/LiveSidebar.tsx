import { VehicleData } from "@/types/vehicle";
import { useEffect, useState } from "react";
import { ActiveStatus } from "../General/ActiveStatus";
import { useSession } from "next-auth/react";
import { zonelistType } from "../../types/zoneType";
import { getZoneListByClientId } from "../../utils/API_CALLS";
import "./index.css";
const LiveSidebar = ({
  carData,
  countMoving,
  countPause,
  countParked,
  setSelectedVehicle,
  activeColor,
  setIsActiveColor,
}: {
  carData: VehicleData[];
  countPause: Number;
  countParked: Number;
  countMoving: Number;
  setSelectedVehicle: any;
  activeColor: any;
  setIsActiveColor: any;
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
        data.vehicleReg
          .toLowerCase()
          .startsWith(searchData.search.toLowerCase())
      )
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
    setIsActiveColor(0);
  };

  const handleClickVehicle = (item: any) => {
    setSelectedVehicle(item);
    setIsActiveColor(item.vehicleId);
  };
  console.log("filteredData", filteredData);
  return (
    <div
      className="xl:col-span-1  lg:col-span-2  md:col-span-2 sm:col-span-4  col-span-4"
      // style={{ height: "50em" }}
    >
      <div className="grid grid-cols-12 bg-white py-3 pe-1 lg:gap-1 gap-3 ">
        <div className="lg:col-span-7 lg:col-span-7 md:col-span-5 sm:col-span-5 col-span-5 sticky top-0">
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
                className="text-lg bg-transparent text-green w-full px-1  placeholder-green border-b  border-black outline-none w-full"
                placeholder="Search"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 md:col-span-7  sm:col-span-5 col-span-58  w-full">
          <button
            className="text-center mx-auto text-md font-bold text-green mt-1"
            onClick={toggleLiveCars}
          >
            Show({carData?.length}) Vehicles
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 text-center border-y-2  border-green bg-zoneTabelBg py-4 text-white">
        <div className="lg:col-span-1">
          <p className="text-md mt-1 text-black font-popins ">
            <b>Vehicle Summary:</b>
          </p>
        </div>

        <div className="lg:col-span-1">
          <div className="grid grid-cols-10">
            <div className="lg:col-span-1">
              <svg
                className="h-6 w-3 text-green mr-2"
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
                className="h-6 w-3 text-yellow mr-2"
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
                className="h-6 w-3 text-red mr-2"
                viewBox="0 0 24 24"
                fill="red"
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

      <div className="overflow-y-scroll bg-zoneTabelBg" id="scroll_side_bar">
        {filteredData?.map((item: VehicleData, index: any) => {
          return (
            <div
              className="hover:bg-bgLight cursor-pointer pt-2"
              onClick={() => handleClickVehicle(item)}
              key={index}
              style={{
                backgroundColor:
                  activeColor == item.vehicleId ? "rgb(239, 239, 239)" : "",
              }}
            >
              <div
                key={item?.IMEI}
                className="grid lg:grid-cols-3 grid-cols-3 text-center py-2"
              >
                <div className="lg:col-span-1 col-span-1">
                  <div
                    className=" font-popins font-bold"
                    style={{ fontSize: "20px" }}
                  >
                    {item.gps.speed === 0 && item.ignition === 0 ? (
                      <p className="text-red ">{item?.vehicleReg}</p>
                    ) : item.gps.speed > 0 && item.ignition === 1 ? (
                      <p className="text-green">{item?.vehicleReg}</p>
                    ) : (
                      <p
                        className={`
                      ${
                        item?.vehicleStatus == "Hybrid"
                          ? "text-black"
                          : "text-yellow "
                      }
                      `}
                      >
                        {item?.vehicleReg}
                      </p>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-1 col-span-1">
                  {item.gps.speed === 0 && item.ignition === 0 ? (
                    <>
                      <button className="text-white bg-red p-1 -mt-1 shadow-lg">
                        Parked
                      </button>
                    </>
                  ) : item.gps.speed > 0 && item.ignition === 1 ? (
                    <button className="text-white bg-green p-1 -mt-1 shadow-lg">
                      Moving
                    </button>
                  ) : (
                    <button
                      className={` ${
                        item?.vehicleStatus == "Hybrid"
                          ? "bg-white text-black "
                          : "bg-yellow text-white"
                      }  p-1 -mt-1 shadow-md`}
                    >
                      {item?.vehicleStatus}
                      {/* Pause */}
                    </button>
                  )}
                </div>
                <div className="lg:col-span-1 col-span-1">
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
                        />
                      ) : (
                        <p>Timezone is undefined</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:text-start md:text-start sm:text-start text-center px-4  mt-1  text-md border-b-2 font-bold border-green text-labelColor">
                <h1 className="font-popins "> {item.timestamp}</h1>
                <p className="text-labelColor">{item.zone}</p>
                <p>{item.DriverName}</p>

                <span className="text-labelColor">
                  {item?.OSM?.address?.neighbourhood}
                  {item?.OSM?.address?.road}
                  {item?.OSM?.address?.city}
                  <br></br>
                </span>
              </div>
            </div>
          );
        })}
        {/* {zoneList.map((item) => {
          return <h2>{item.zoneName}</h2>;
        })} */}
      </div>
    </div>
  );
};

export default LiveSidebar;
