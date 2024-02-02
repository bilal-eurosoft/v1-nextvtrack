"use client";
import "./index.css";
import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { VehicleData } from "@/types/vehicle";
import LiveCars from "./LiveCars";
import { zonelistType } from "@/types/zoneType";
import dynamic from "next/dynamic";
import { ClientSettings } from "@/types/clientSettings";
import { useSession } from "next-auth/react";
import { getZoneListByClientId } from "@/utils/API_CALLS";
import { Marker, Popup } from "react-leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false }
);

const Polygon = dynamic(
  () => import("react-leaflet/Polygon").then((module) => module.Polygon),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet/Circle").then((module) => module.Circle),
  { ssr: false }
);

const DynamicCarMap = ({
  carData,
  clientSettings,
  selectedVehicle,
  setIsActiveColor,
  setSelectedVehicle,
}: {
  carData: VehicleData[];
  clientSettings: ClientSettings[];
  selectedVehicle: VehicleData | null; // Make sure it can handle null values
  setIsActiveColor: any;
  setSelectedVehicle: any;
}) => {
  const clientMapSettings = clientSettings?.filter(
    (el) => el?.PropertDesc === "Map"
  )[0]?.PropertyValue;

  const clientZoomSettings = clientSettings?.filter(
    (el) => el?.PropertDesc === "Zoom"
  )[0]?.PropertyValue;
  let mapCoordinates: [number, number] = [0, 0];
  const { data: session } = useSession();
  const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const [showZones, setShowZones] = useState(false);
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
  }, []);

  if (!clientMapSettings) {
    return <>{/* Map Loadidsng... */}</>;
  }

  const regex = /lat:([^,]+),lng:([^}]+)/;
  const match = clientMapSettings.match(regex);

  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    mapCoordinates = [lat, lng];
  }
  let zoom = clientZoomSettings ? parseInt(clientZoomSettings) : 11;
  const handleClear = () => {
    setIsActiveColor("");
    // setSelectedVehicle(null);
  };
  return (
    <>
      <div className="xl:col-span-4 lg:col-span-3  md:col-span-3  sm:col-span-5 col-span-4 ">
        <div className="relative" onClick={handleClear}>
          {mapCoordinates !== null && zoom !== null && (
            <MapContainer
              id="maps"
              center={mapCoordinates}
              className=" z-0"
              zoom={zoom}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
              />

              {showZones &&
                zoneList.map((singleRecord: any) => {
                  const radius = Number(singleRecord.latlngCordinates);

                  return singleRecord.zoneType === "Circle" &&
                    !isNaN(radius) ? (
                    <Circle
                      key={singleRecord.zoneName}
                      center={[
                        Number(singleRecord.centerPoints.split(",")[0]),
                        Number(singleRecord.centerPoints.split(",")[1]),
                      ]}
                      radius={radius}
                    >
                      <Marker
                        position={[
                          Number(singleRecord.centerPoints.split(",")[0]),
                          Number(singleRecord.centerPoints.split(",")[1]),
                        ]}
                      >
                        <Popup>{singleRecord.zoneName}</Popup>
                      </Marker>
                      <Popup>{singleRecord.zoneName}</Popup>
                    </Circle>
                  ) : (
                    <Polygon
                      key={singleRecord.zoneName}
                      positions={JSON.parse(singleRecord.latlngCordinates)}
                    >
                      <Popup>{singleRecord.zoneName}</Popup>
                    </Polygon>
                  );
                })}

              <button
                className="bg-[#00B56C] text-white"
                onClick={() => {
                  setShowZones(!showZones);
                }}
              ></button>
              <LiveCars
                carData={carData}
                clientSettings={clientSettings}
                selectedVehicle={selectedVehicle}
              />
            </MapContainer>
          )}
          <div className="grid grid-cols-1 absolute lg:top-10 xl:top-10 md:top-10 top-5 right-10 bg-bgLight py-2 px-2">
            <div className="col-span-1" style={{ color: "green" }}>
              <input
                type="checkbox"
                onClick={() => {
                  setShowZones(!showZones);
                }}
                className="mx-2  mt-1"
                style={{ accentColor: "green" }}
              />
              <button className="text-labelColor font-popins text-md font-bold">
                Show Zones
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicCarMap;
