"use client";
import React, { useEffect, useRef, useState } from "react";
/* import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css"; */
import dynamic from "next/dynamic"; // Import dynamic from Next.js
import { useSession } from "next-auth/react";
import { ClientSettings } from "@/types/clientSettings";
import {
  getClientSettingByClinetIdAndToken,
  postZoneDataByClientId,
} from "@/utils/API_CALLS";
import L, { LatLngTuple } from "leaflet";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Polygon } from "react-leaflet/Polygon";
import { Circle } from "react-leaflet/Circle";
import { LayerGroup } from "leaflet";
import { MenuItem, Select } from "@mui/material";
import "./editZone.css";
const MapContainer = dynamic(
  () => import("react-leaflet").then((module) => module.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((module) => module.TileLayer),
  { ssr: false }
);
const FeatureGroup = dynamic(
  () => import("react-leaflet").then((module) => module.FeatureGroup),
  { ssr: false }
);
const EditControl = dynamic(
  () => import("react-leaflet-draw").then((module) => module.EditControl),
  { ssr: false }
);

export default function AddZoneComp() {
  const { data: session } = useSession();
  const [polygondataById, setPolygondataById] = useState<[number, number][]>(
    []
  );
  const [circleDataById, setCircleDataById] = useState<{
    radius: string;
  } | null>(null);

  const [drawShape, setDrawShape] = useState<boolean>(true);
  const [shapeType, setShapeType] = useState<"Polygon" | "Circle">();
  const [mapcenter, setMapcenter] = useState<LatLngTuple | null>(null);
  const [polygondata, setPolygondata] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [circleData, setCircleData] = useState({
    latlng: "",
    radius: "",
  });

  const [clientsetting, setClientsetting] = useState<ClientSettings[] | null>(
    null
  );
  const [Form, setForm] = useState({
    GeoFenceType: "",
    centerPoints: "",
    id: "",
    zoneName: "",
    zoneShortName: "",
    zoneType: "",
    latlngCordinates: "",
  });

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      (async function () {
        if (session) {
          const clientSettingData = await getClientSettingByClinetIdAndToken({
            token: session?.accessToken,
            clientId: session?.clientId,
          });

          if (clientSettingData) {
            const centervalue = await clientSettingData?.[0].PropertyValue;

            if (centervalue) {
              const match = centervalue.match(/\{lat:([^,]+),lng:([^}]+)\}/);
              if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);

                if (!isNaN(lat) && !isNaN(lng)) {
                  setMapcenter([lat, lng]);
                }
              }
            }
            setClientsetting(clientSettingData);
          }
        }
      })();
    }
  }, []);

  const clientZoomSettings = clientsetting?.filter(
    (el) => el?.PropertDesc === "Zoom"
  )[0]?.PropertyValue;
  const zoom = clientZoomSettings ? parseInt(clientZoomSettings) : 11;

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (polygondata.length > 0) {
        setForm({
          ...Form,
          latlngCordinates: JSON.stringify(
            polygondata.map(({ latitude, longitude }) => ({
              lat: latitude,
              lng: longitude,
            }))
          ),
          centerPoints: "",
          zoneType: "Polygon",
        });
      } else if (circleData.radius) {
        setForm({
          ...Form,
          latlngCordinates: circleData.radius.toString(),
          centerPoints: circleData.latlng,
          zoneType: "Circle",
        });
      } else {
        setForm((prevForm) => ({
          ...prevForm,
          latlngCordinates: "",
          centerPoints: "",
        }));
      }
    }
  }, [polygondata, circleData]);

  const handlePolygonSave = (coordinates: [number, number][]) => {
    const zoneCoords = coordinates.slice(0, -1).map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));

    if (drawShape == true) {
      const formattedCoordinate: [number, number][] = zoneCoords.map(
        (coord: { latitude: number; longitude: number }) => [
          coord.latitude,
          coord.longitude,
        ]
      );

      setPolygondataById(formattedCoordinate);
      setPolygondata(zoneCoords);
      setDrawShape(!drawShape);
    }
  };

  const handleCircleSave = (latlng: any, radius: string) => {
    const formatCenterPoints = (
      latitude: number,
      longitude: number
    ): string => {
      return `${latitude},${longitude}`;
    };

    let circlePoint = formatCenterPoints(latlng.lat, latlng.lng);
    const newlatlng = circlePoint?.split(",").map(Number);
    if (drawShape == true) {
      setCircleDataById({ radius: radius });
      const updateCircleData = (newLatlng: string, newRadius: string): void => {
        setCircleData({
          latlng: newLatlng,
          radius: newRadius,
        });
      };
      updateCircleData(circlePoint, radius);

      setMapcenter([newlatlng[0], newlatlng[1]]);

      setDrawShape(!drawShape);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...Form, [name]: value });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check if any of the required fields are empty
    if (!Form.latlngCordinates) {
      toast.error("Please Draw a Zone");
      return;
    } else if (polygondataById.length == 0 && circleDataById?.radius == null) {
      toast.error("Please Draw a Zone");
      return;
    }
    try {
      if (session) {
        const newformdata = {
          ...Form,
          clientId: session?.clientId,
        };

        const response = await toast.promise(
          postZoneDataByClientId({
            token: session?.accessToken,
            newformdata: newformdata,
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

        if (response.id !== null) {
          // Delay the redirection by 4 seconds
          setTimeout(() => {
            router.push("http://localhost:3010/Zone");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error fetching zone data:", error);
    }
  };
  const handleCreated = (e: any) => {
    const createdLayer = e.layer;
    const type = e.layerType;

    if (type === "polygon") {
      setShapeType("Polygon");

      const coordinates = e.layer
        .toGeoJSON()
        .geometry.coordinates[0].map((coord: any[]) => [coord[1], coord[0]]);
      handlePolygonSave(coordinates);

      e.target.removeLayer(e.layer);
    } else if (type === "circle") {
      setShapeType("Circle");
      const latlng = e.layer.getLatLng();
      const radius = e.layer.getRadius();
      handleCircleSave(latlng, radius);
      e.target.removeLayer(createdLayer);
    }
  };

  const handleEdited = (e: any) => {
    const layer = e.layers;
    layer.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon) {
        const coordinates: [number, number][] = (
          layer.getLatLngs()[0] as L.LatLng[]
        ).map((latLng: L.LatLng) => [latLng.lat, latLng.lng]);
        const zoneCoords = coordinates.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setPolygondata(zoneCoords);
      } else if (layer instanceof L.Circle) {
        const latlng: L.LatLng = layer.getLatLng();
        const radius: number = layer.getRadius();
        handleCircleSave(latlng, radius.toString());
      }
    });
  };
  const handleredraw = (e: any) => {
    if (polygondataById.length > 0) {
      setDrawShape(true);
      setPolygondataById([]);
      setPolygondata([]);
      setForm({ ...Form, zoneType: "" });
    } else if (circleDataById !== null) {
      setCircleDataById(null);
      setCircleData({ radius: "", latlng: "" });

      setForm({ ...Form, zoneType: "" });
      setDrawShape(true);
    } else {
      setDrawShape(drawShape);
    }
  };

  return (
    <div className="shadow-lg bg-bgLight h-5/6  border-t text-white ">
      <p className="bg-green px-4 py-1 text-black text-center text-2xl text-white font-bold ">
        Add Zone
      </p>

      <div className="grid lg:grid-cols-6 sm:grid-cols-5 md:grid-cols-5 grid-cols-1 pt-8 ">
        <div className="xl:col-span-1 lg:col-span-2 md:col-span-2 sm:col-span-4 col-span-4 bg-gray-200 mx-5">
          <form onSubmit={handleSave}>
            <label className="text-black text-md w-full font-popins font-medium">
              <span className="text-red">*</span> Please Enter Zone Name:{" "}
            </label>
            <input
              onChange={handleChange}
              type="text"
              name="zoneName"
              value={Form.zoneName}
              className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
              placeholder="Enter Zone Name "
              required
            />
            <label className="text-black text-md w-full font-popins font-medium">
              <span className="text-red">*</span> Geofence:{" "}
            </label>
            <Select
              onChange={handleChange}
              value={Form?.GeoFenceType}
              className="h-8 text-sm text-gray  w-full  outline-green hover:border-green"
              placeholder="geofence"
              // required
              name="GeoFenceType"
              displayEmpty
            >
              <MenuItem value="" selected disabled hidden>
                Select Geofence Type
              </MenuItem>
              <MenuItem value="On-Site">On-Site</MenuItem>
              <MenuItem value="Off-Site">Off-Site</MenuItem>
              <MenuItem value="City-Area">City-Area</MenuItem>
              <MenuItem value="Restricted-Area">Restricted-Area</MenuItem>
            </Select>
            <br></br>
            <br></br>
            <label className="text-black text-md w-full font-popins font-medium">
              <span className="text-red">*</span> Zone Short Name:{" "}
            </label>
            <input
              aria-required
              onChange={handleChange}
              type="text"
              name="zoneShortName"
              value={Form?.zoneShortName}
              className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
              placeholder="Enter Zone Name "
              required
            />
            <div className="flex justify-start">
              <div className="grid lg:grid-cols-6 grid-cols-6 bg-green shadow-md  w-24 ">
                <div className="col-span-2">
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
                </div>
                <div className="col-span-1">
                  <button
                    className="text-white  font-popins font-bold  h-10 bg-green "
                    type="submit"
                  >
                    Save
                  </button>
                </div>

                <div className="col-span-2 ">
                  <button
                    className="ms-14  font-popins font-bold  h-10 bg-white text-labelColor shadow-md px-6"
                    onClick={() => router.push("http://localhost:3010/Zone")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            <br></br>
          </form>
        </div>

        <div className="xl:col-span-5 lg:col-span-4 md:col-span-3 sm:col-span-5 col-span-4 mx-3">
          <label className="text-black text-md w-full font-popins font-medium">
            Please Enter Text To Search{" "}
          </label>
          <input
            type="text"
            className="  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
            placeholder="Search"
            required
          />
          {/* <button
            className="text-white px-30px h-10 bg-[#00B56C] "
            type="submit"
            onClick={handleredraw}
          >
            Redraw
          </button> */}

          <div className="grid lg:grid-cols-3 grid-cols-3 bg-green w-24">
            <div className="col-span-1">
              <svg
                className="h-10 py-3 w-full text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="col-span-2">
              <button
                className="text-white  font-popins font-bold h-10 bg-[#00B56C]    "
                type="submit"
                onClick={handleredraw}
              >
                Redraw
              </button>
            </div>
          </div>
          <div className="flex justify-start"></div>
          <div className="lg:col-span-5  md:col-span-4  sm:col-span-5 col-span-4 mx-3">
            <div className="flex justify-start"></div>
            <div className="w-full  mt-4 overflow-hidden">
              {mapcenter !== null && (
                <MapContainer
                  zoom={15}
                  center={mapcenter}
                  className="z-10 "
                  style={{ height: "35em" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
                  />
                  {drawShape == false && (
                    <FeatureGroup>
                      <EditControl
                        position="topright"
                        onEdited={handleEdited}
                        // edit={true}
                        onCreated={handleCreated}
                        draw={{
                          polyline: false,
                          polygon: drawShape,
                          circle: drawShape,
                          marker: false,
                          circlemarker: false,
                          rectangle: false,
                        }}
                      />
                      {shapeType === "Polygon" && polygondataById.length > 0 ? (
                        <Polygon positions={polygondataById} color="#97009c" />
                      ) : null}

                      {shapeType === "Circle" &&
                      !isNaN(mapcenter[0]) &&
                      !isNaN(mapcenter[1]) &&
                      !isNaN(Number(circleDataById?.radius)) ? (
                        <Circle
                          radius={Number(circleDataById?.radius)}
                          center={mapcenter}
                          color="#97009c"
                        />
                      ) : null}
                    </FeatureGroup>
                  )}
                  {drawShape == true && (
                    <FeatureGroup>
                      <EditControl
                        position="topright"
                        onEdited={handleEdited}
                        // edit={true}
                        onCreated={handleCreated}
                        draw={{
                          polyline: false,
                          polygon: true,
                          circle: true,
                          marker: false,
                          circlemarker: false,
                          rectangle: false,
                        }}
                      />
                      {shapeType === "Polygon" && polygondataById.length > 0 ? (
                        <Polygon positions={polygondataById} color="#97009c" />
                      ) : null}

                      {shapeType === "Circle" &&
                      !isNaN(mapcenter[0]) &&
                      !isNaN(mapcenter[1]) &&
                      !isNaN(Number(circleDataById?.radius)) ? (
                        <Circle
                          radius={Number(circleDataById?.radius)}
                          center={mapcenter}
                          color="#97009c"
                        />
                      ) : null}
                    </FeatureGroup>
                  )}
                </MapContainer>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
