"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ZoneFindById, postZoneDataByClientId } from "@/utils/API_CALLS";
import L, { LatLngTuple } from "leaflet";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import { Button, MenuItem, Select } from "@mui/material";
import EditRoadIcon from "@mui/icons-material/EditRoad";
import { fetchZone } from "@/lib/slices/zoneSlice";
import {
  GoogleMap, LoadScript,useLoadScript,
  DrawingManager,Libraries 
} from '@react-google-maps/api';
import { useDispatch } from "react-redux";
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
const Polygon = dynamic(
  () => import("react-leaflet/Polygon").then((module) => module.Polygon),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet/Circle").then((module) => module.Circle),
  { ssr: false }
);
const EditControl = dynamic(
  () => import("react-leaflet-draw").then((module) => module.EditControl),
  { ssr: false }
);
const libraries:Libraries  = ["drawing", "geometry", "places"];

export default function EditZoneComp() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const GOOGLE_MAPS_API_KEY = 'AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo';
  const containerStyle = {
    width: '100%',
    height: '650px',
  };
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const polygonRef = useRef(null);
  const onLoad = (map) => {
    
    mapRef.current = map
  };
  const [Form, setForm] = useState({
    GeoFenceType: "",
    centerPoints: "",
    id: "",
    zoneName: "",
    zoneShortName: "",
    zoneType: "",
    latlngCordinates: "",
  });

  const [polygondataById, setPolygondataById] = useState<[number, number][]>(
    []
  );// data from API
  const [circleDataById, setCircleDataById] = useState<{
    radius: string;
  } | null>(null); // data from API

  const [mapcenter, setMapcenter] = useState<LatLngTuple | null>(null);

  const [drawShape, setDrawShape] = useState<boolean>(false);
  const [polygondata, setPolygondata] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [circleData, setCircleData] = useState({
    latlng: "",
    radius: "",
  });
  const router = useRouter();
  const dispatch = useDispatch();
  if (session?.userRole === "Controller") {
    router.push("/signin");
    return null;
  }
  const [zoom, setZoom] = useState(10);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchZoneDataById = async () => {
        try {
          if (id && session) {
            const data = await ZoneFindById({
              token: session.accessToken,
              id: id,
            });
            setForm(data)
            if (data) {
              if (data?.zoneType === "Polygon") {
                const latdata = data?.latlngCordinates;
                if (latdata) {
                  const latlngdata = JSON.parse(latdata);
                  const formattedCoordinates = latlngdata?.map(
                    (coord: { lat: number; lng: number }) => [coord.lat, coord.lng]
                  );
                  setPolygondataById(formattedCoordinates);
                  if (formattedCoordinates) {
                    const lats = formattedCoordinates.map((coord: any[]) => coord[0]);
                    const lngs = formattedCoordinates.map((coord: any[]) => coord[1]);
                    const minLat = Math.min(...lats);
                    const maxLat = Math.max(...lats);
                    const minLng = Math.min(...lngs);
                    const maxLng = Math.max(...lngs);
                    const latDistance = maxLat - minLat;
                    const lngDistance = maxLng - minLng;
                    const latZoom = Math.floor(Math.log2(360 / (0.5 * latDistance)));
                    const lngZoom = Math.floor(Math.log2(360 / (0.5 * lngDistance)));
                    setZoom(Math.min(latZoom, lngZoom));
                    setMapcenter([
                      ((minLat + maxLat) / 2) as number,
                      ((minLng + maxLng) / 2) as number,
                    ]);
                  }
                }
              } else if (data?.zoneType === "Circle") {
                let circledata = Number(data?.latlngCordinates);
                const newcenterPoints = data?.centerPoints;
                const latlng = newcenterPoints?.split(",").map(Number);
                const zoomLevel = calculateZoomLevel(Math.floor(Number(data?.latlngCordinates)));
                setZoom(Math.min(Math.max(Math.floor(zoomLevel), 2), 16));
                if (latlng && latlng.length === 2) {
                  setMapcenter([latlng[0], latlng[1]]);
                  setCircleDataById({ radius: circledata.toString() });
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching zone data:", error);
        }
      };

      fetchZoneDataById();
    }
    return () => {
      // Cleanup map instance
      if (mapRef.current) {
        circleRef.current?.setMap(null)
        polygonRef.current?.setMap(null)
        mapRef.current = null
        delete window.google;
      }
    };
  }, []);

    useEffect(() => {
      if (!Form || !mapRef.current || !window.google) return;

    


        const isRestrictedArea =
          Form?.GeoFenceType === "Restricted-Area"; // && session?.clickToCall === true;
        const isCityArea = Form?.GeoFenceType === "City-Area"; // && session?.clickToCall === true;     
        if (Form?.zoneType === "Polygon") {
  

          if (window.google) {
  
            polygonRef.current = new google.maps.Polygon({
              paths: JSON.parse(Form.latlngCordinates),
              strokeColor: isCityArea ? "green" : isRestrictedArea ? "red" : "blue", // Red border color
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: isCityArea ? "green" : isRestrictedArea ? "red" : "blue", // Red fill color
              fillOpacity: 0.35,
              map: mapRef.current, // Attach to the map instance 
              editable: true
            });
            const updatePolygonData = () => {
              const path = polygonRef.current.getPath();
              const updatedCoordinates = [];
              for (let i = 0; i < path.getLength(); i++) {
                const latLng = path.getAt(i);
                updatedCoordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
              }
              handlePolygonSave(updatedCoordinates.map((coord: any) => [coord.lat, coord.lng]))
              // setPolygonData({ coordinates: updatedCoordinates });
            };
            google.maps.event.addListener(polygonRef.current.getPath(), "set_at", () => {
              updatePolygonData();
            });

            google.maps.event.addListener(polygonRef.current.getPath(), "insert_at", () => {
              updatePolygonData();
            });

            google.maps.event.addListener(polygonRef.current.getPath(), "remove_at", () => {
              updatePolygonData();
            });
          }
        } else {
          if (window.google) {
            

            circleRef.current = new google.maps.Circle({
              center: { lat: Number(Form.centerPoints.split(",")[0]), lng: Number(Form.centerPoints.split(",")[1]) }, // Circle center
              radius: Number(Form.latlngCordinates), // Radius in meters
              strokeColor: isCityArea ? "green" : isRestrictedArea ? "red" : "blue", // Red border color
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: isCityArea ? "green" : isRestrictedArea ? "red" : "blue", // Red fill color
              fillOpacity: 0.35,
              map: mapRef.current, // Attach to the map instance          
              editable: true
            });
            google.maps.event.addListener(circleRef.current, "center_changed", (e) => {
              const center = circleRef.current.getCenter();
              const radius = circleRef.current.getRadius();
              handleCircleSave({ lat: center.lat(), lng: center.lng() }, radius)
            });

            google.maps.event.addListener(circleRef.current, "radius_changed", () => {
              const center = circleRef.current.getCenter();
              const radius = circleRef.current.getRadius();
              handleCircleSave({ lat: center.lat(), lng: center.lng() }, radius)
            });

          }
        }
      
    }, [Form,mapRef.current,window.google])

  function calculateZoomLevel(circleRadius: number) {
    let zoomLevel = 20;
    const radiusStep = 230;

    while (circleRadius > 0 && zoomLevel > 8) {
      circleRadius -= radiusStep;
      zoomLevel--;
    }

    return Math.max(zoomLevel, 8);
  }


  useEffect(() => {
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
  }, [polygondata, circleData]);

  const handlePolygonSave = (coordinates: [number, number][]) => {

    if (session?.MapType == "Google1") {
      const zoneCoords = coordinates.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      }));

      setPolygondata(zoneCoords);
    } else {

      if (drawShape == true) {
        const zoneCoords = coordinates.slice(0, -1).map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));

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
    }
    // if (drawShape == true || session?.MapType == "Google") {    
    //   const zoneCoords = coordinates.slice(0, -1).map(([lat, lng]) => ({
    //     latitude: lat,
    //     longitude: lng,
    //   }));
    //   setPolygondata(zoneCoords);
    //   setDrawShape(!drawShape);
    // }
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
    setCircleDataById({ radius: radius });
    const updateCircleData = (newLatlng: string, newRadius: string): void => {
      setCircleData({
        latlng: newLatlng,
        radius: newRadius,
      });
    };
    updateCircleData(circlePoint, radius);
    setMapcenter([newlatlng[0], newlatlng[1]]);
  };
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...Form, [name]: value });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
          setTimeout(() => {
            router.push("/Zone");
          }, 2000);
        }
        dispatch(
          fetchZone({
            clientId: session?.clientId,
            token: session?.accessToken,
          })
        );
      }
    } catch (error) {
      console.error("Error fetching zone data:", error);
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
        setDrawShape(true);
      }
    });
  };

  const handleredraw = (e: any) => {
    setDrawShape(true);
    setForm({ ...Form, zoneType: "" });
    // if (session?.MapType == "Google") {
    //   polygonRef.current?.setMap(null)
    //   circleRef.current?.setMap(null)
    // }
    if (polygondataById.length > 0) {
      setPolygondataById([]);
      setPolygondata([]);
    } else if (circleDataById !== null) {
      setCircleDataById(null);
      setCircleData({ radius: "", latlng: "" });
    }
  };

  const handleCreated = (e: any) => {
    const createdLayer = e.layer;
    const type = e.layerType;

    if (type === "polygon") {
      setForm({ ...Form, zoneType: "Polygon" });

      const coordinates = e.layer
        .toGeoJSON()
        .geometry.coordinates[0].map((coord: any[]) => [coord[1], coord[0]]);
      handlePolygonSave(coordinates);

      e.target.removeLayer(e.layer);
    } else if (type === "circle") {
      setForm({ ...Form, zoneType: "Circle" });

      const latlng = e.layer.getLatLng();
      const radius = e.layer.getRadius();
      handleCircleSave(latlng, radius);
      e.target.removeLayer(createdLayer);
    }
  };

  const handleCircleComplete = (circle: any) => {
    setForm({ ...Form, zoneType: "Circle" });
    setDrawShape(true)
    const latlng = circle.getCenter().toJSON();
    const radius = circle.getRadius();
    setPolygondata([])
    // setPolygondataById([])
    handleCircleSave(latlng, radius)
    // setCircleData({latlng:latlng.lat+","+latlng.lng,radius})
    // handleCircleSave([latlng.lat,latlng.lng], radius);     
    circle.setMap(null); // Remove the temporary circle
    circleRef.current?.setMap(null)
    polygonRef.current?.setMap(null)

    circleRef.current = new google.maps.Circle({
      center: { lat: Number(latlng.lat), lng: Number(latlng.lng) }, // Circle center
      radius: Number(radius), // Radius in meters
      strokeColor: Form.GeoFenceType == "City-Area"
        ? "green"
        : Form.GeoFenceType == "Restricted-Area"
          ? "red"
          : "blue", // Red border color
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: Form.GeoFenceType == "City-Area"
        ? "green"
        : Form.GeoFenceType == "Restricted-Area"
          ? "red"
          : "blue", // Red fill color
      fillOpacity: 0.35,
      map: mapRef.current, // Attach to the map instance        
      editable: true
    })
    google.maps.event.addListener(circleRef.current, "center_changed", (e) => {
      const center = circleRef.current.getCenter();
      const radius = circleRef.current.getRadius();
      handleCircleSave({ lat: center.lat(), lng: center.lng() }, radius)
    });

    google.maps.event.addListener(circleRef.current, "radius_changed", () => {
      const center = circleRef.current.getCenter();
      const radius = circleRef.current.getRadius();
      handleCircleSave({ lat: center.lat(), lng: center.lng() }, radius)
    });


  };


  const handlePolygonComplete = (polygon: any) => {
    setForm({ ...Form, zoneType: "Polygon" });
    setDrawShape(true)
    let latlngs = polygon.getPath().getArray().map((path) => path.toJSON())
    setCircleData({
      latlng: "",
      radius: ""
    });
    // setCircleDataById({ radius: "" })

    handlePolygonSave(latlngs.map((coord: any) => [coord.lat, coord.lng]))

    // setPolygondata(latlngs.map((coord: any) => [coord.lat, coord.lng]))
    polygon.setMap(null);
    polygonRef.current?.setMap(null)
    circleRef.current?.setMap(null)

    polygonRef.current = new google.maps.Polygon({
      paths: latlngs,
      strokeColor: Form.GeoFenceType == "City-Area"
        ? "green"
        : Form.GeoFenceType == "Restricted-Area"
          ? "red"
          : "blue", // Red border color
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: Form.GeoFenceType == "City-Area"
        ? "green"
        : Form.GeoFenceType == "Restricted-Area"
          ? "red"
          : "blue", // Red fill color
      fillOpacity: 0.35,
      map: mapRef.current, // Attach to the map instance      
      editable: true

    });
    const updatePolygonData = () => {
      const path = polygonRef.current.getPath();
      const updatedCoordinates = [];
      for (let i = 0; i < path.getLength(); i++) {
        const latLng = path.getAt(i);
        updatedCoordinates.push({ lat: latLng.lat(), lng: latLng.lng() });
      }
      handlePolygonSave(updatedCoordinates.map((coord: any) => [coord.lat, coord.lng]))
      // setPolygonData({ coordinates: updatedCoordinates });
    };
    google.maps.event.addListener(polygonRef.current.getPath(), "set_at", () => {
      updatePolygonData();
    });

    google.maps.event.addListener(polygonRef.current.getPath(), "insert_at", () => {
      updatePolygonData();
    });

    google.maps.event.addListener(polygonRef.current.getPath(), "remove_at", () => {
      updatePolygonData();
    });
  };

  return (
    <>
      <div className="  shadow-lg bg-bgLight  border-t text-white edit_zone_main  ">
        <p className="bg-green px-4 py-1 text-black text-center text-2xl text-white font-bold edit_zone_text ">
          Edit Zone
        </p>
        <div className="grid lg:grid-cols-6 sm:grid-cols-5 md:grid-cols-6 grid-cols-1  pt-8">
          <div className=" xl:col-span-1 lg:col-span-2 md:col-span-2 sm:col-span-6 col-span-4 bg-gray-200 mx-5 edit_zone_side_bar">
            <form onSubmit={handleSave}>
              <label className="text-md font-popins text-black font-semibold">
                <span className="text-red  font-extraboldbold">*</span> Please
                Enter Zone Name:{" "}
              </label>
              <input
                onChange={handleChange}
                type="text"
                name="zoneName"
                value={Form.zoneName}
                className="text-black  block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
                placeholder="Enter Zone Name"
                required
              />
              <label className="text-md font-popins text-black font-semibold">
                <span className="text-red font-extraboldbold">*</span> Geofence:{" "}
              </label>

              {session?.clickToCall === true ? (
                <Select
                  onChange={handleChange}
                  value={Form?.GeoFenceType}
                  id="select_box_journey"
                  className="h-8 text-sm text-gray  w-full  outline-green hover:border-green"
                  required
                  name="GeoFenceType"
                >
                  <MenuItem className="hover_select" value="On-Site">
                    On-Site
                  </MenuItem>
                  <MenuItem className="hover_select" value="Off-Site">
                    Off-Site
                  </MenuItem>
                  <MenuItem className="hover_select" value="City-Area">
                    City-Area
                  </MenuItem>
                  <MenuItem className="hover_select" value="Restricted-Area">
                    Restricted-Area
                  </MenuItem>
                </Select>
              ) : (
                <Select
                  onChange={handleChange}
                  value={Form?.GeoFenceType}
                  id="select_box_journey"
                  className="h-8 text-sm text-gray  w-full  outline-green hover:border-green"
                  required
                  name="GeoFenceType"
                >
                  <MenuItem className="hover_select" value="On-Site">
                    On-Site
                  </MenuItem>
                  <MenuItem className="hover_select" value="Off-Site">
                    Off-Site
                  </MenuItem>
                </Select>
              )}
              <br></br>
              <br></br>
              <label className="text-md font-popins text-black font-semibold">
                <span className="text-red font-extraboldbold">*</span> Zone
                Short Name:{" "}
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
              <div className="flex justify-center">
                <div
                  className="grid grid-cols-12  
                "
                >
                  <div className="lg:col-span-5 md:col-span-5 sm:col-span-2 col-span-4 ">
                    {/* <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-1"></div>
                      <div className="col-span-3 ">
                        <svg
                          className="h-10 py-2  w-full text-white"
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
                      <div className="col-span-8">
                        <button
                          className="text-white font-popins font-bold h-10 bg-[#00B56C] "
                          type="submit"
                        >
                          Update
                        </button>
                      </div>
                    </div> */}
                    <Button
                      className=" bg-green shadow-md text-white hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none hover:border-none h-10 "
                      variant="outlined"
                      type="submit"
                      // onClick={handleClear}
                      style={{
                        fontSize: "16px",
                        backgroundColor: "#00b56c",
                        color: "white",
                        border: "none",
                      }}
                      startIcon={
                        <span style={{ fontWeight: "600" }}>
                          <SaveIcon className="-mt-1" />
                        </span>
                      }
                    >
                      <b>U</b>{" "}
                      <span style={{ textTransform: "lowercase" }}>
                        <b>pdate</b>
                      </span>
                    </Button>
                  </div>
                  <div className="col-span-1"></div>
                  <div className="lg:col-span-5 md:col-span-5 sm:col-span-2 col-span-4 ">
                    {/* <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-1"></div>
                      <div className="col-span-2 ">
                        <ClearIcon className="mt-2 font-bold" />
                      </div>
                      <div className="col-span-8 bg-red  rounded-md">
                        <Button
                          className="text-white font-popins font-bold h-10"
                          onClick={() => router.push("/Zone")}
                          style={{
                            color: "white",
                            textTransform: "capitalize",
                          }}
                        >
                          <b> Cancel</b>
                        </Button>
                      </div>
                    </div> */}
                    <Button
                      className=" bg-red shadow-md text-white hover:shadow-gray transition duration-500 cursor-pointer hover:bg-red border-none hover:border-none h-10 "
                      variant="outlined"
                      onClick={() => router.push("/Zone")}
                      style={{
                        fontSize: "16px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                      }}
                      startIcon={
                        <span style={{ fontWeight: "600" }}>
                          <ClearIcon className="-mt-1" />
                        </span>
                      }
                    >
                      <b>C</b>{" "}
                      <span style={{ textTransform: "lowercase" }}>
                        <b>ancel</b>
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
              <br></br>
            </form>
          </div>

          <div className="xl:col-span-5 lg:col-span-4 md:col-span-4 sm:col-span-5 col-span-4 mx-3 edit-zone_map_child">
            <div className="edit_zone_map_text">
              <label className="text-md font-popins text-black font-semibold">
                please enter text to search{" "}
              </label>
              <input
                type="text"
                className="   block py-2 px-0 w-full text-sm text-labelColor bg-white-10 border border-grayLight appearance-none px-3 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-green mb-5"
                placeholder="Search"
                required
              />
            </div>
            <Button
              className=" bg-green shadow-md text-white hover:shadow-gray transition duration-500 cursor-pointer hover:bg-green border-none hover:border-none h-10 "
              variant="outlined"
              onClick={handleredraw}
              style={{
                fontSize: "16px",
                backgroundColor: "#00b56c",
                color: "white",
                border: "none",
              }}
              startIcon={
                <span style={{ fontWeight: "600" }}>
                  <EditRoadIcon className="-mt-1" />
                </span>
              }
            >
              <b>R</b>{" "}
              <span style={{ textTransform: "lowercase" }}>
                <b>edraw</b>
              </span>
            </Button>

            <div className="flex justify-start"></div>
            <div className="lg:col-span-5  md:col-span-4  sm:col-span-5 col-span-4 mx-3">
              <div className="flex justify-start"></div>
              <div className="w-full  mt-4 overflow-hidden">
                {mapcenter !== null && zoom >= 0 && (
                   session?.MapType == "Google1" ?
                    (
                      <div className="edit_zone_map_main">

                        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries} >
                          <GoogleMap
                            clickableIcons={false}
                            mapContainerStyle={containerStyle}
                            // center={{ lat, lng }}
                            center={{ lat: mapcenter[0], lng: mapcenter[1] }}

                            zoom={zoom}
                            onLoad={onLoad}
                            options={{
                              draggable: true, // Make map draggable                            
                              disableDoubleClickZoom: true, //disable zoom in double click
                              disableDefaultUI: true,  //disable all options
                            }}
                          >
                            {
                              drawShape && (
                                <DrawingManager
                                  onCircleComplete={handleCircleComplete}
                                  onPolygonComplete={handlePolygonComplete}
                                  options={{
                                    drawingControl: true,
                                    drawingControlOptions: {
                                      position: window.google?.maps?.ControlPosition?.TOP_CENTER,
                                      drawingModes: ["circle", "polygon"],
                                    },
                                  }}
                                />)}

                          </GoogleMap>
                        </LoadScript>
                      </div>
                    ) : (
                      <MapContainer
                        zoom={zoom}
                        center={mapcenter}
                        className="z-10 edit_zone_map_main"
                      >
                        {/* <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
                        />
                         */}
                         {session?.MapType == "Google"?(
                <TileLayer
                url={`https://{s}.googleapis.com/maps/vt?lyrs=m&x={x}&y={y}&z={z}&key=AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo`}

              subdomains={['mt0', 'mt1', 'mt2', 'mt3']} // Google tile servers
              attribution="Google Maps"
            />
              ):(
                <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
                          />

              )}
                        {drawShape == false && (
                          <FeatureGroup>
                            <EditControl
                              position="topright"
                              onEdited={handleEdited}
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
                            {Form.zoneType === "Polygon" &&
                              polygondataById.length > 0 ? (
                              <>
                                {Form?.GeoFenceType ===
                                  "Restricted-Area" && (
                                    <Polygon
                                      positions={polygondataById}
                                      color="red"
                                    />
                                  )}
                                {Form?.GeoFenceType !==
                                  "Restricted-Area" && (
                                    <Polygon
                                      positions={polygondataById}
                                      color="#97009c"
                                    />
                                  )}
                                {Form?.GeoFenceType === "City-Area" && (
                                  <Polygon
                                    positions={polygondataById}
                                    color="green"
                                  />
                                )}
                              </>
                            ) : null}

                            {Form.zoneType === "Circle" &&
                              !isNaN(mapcenter[0]) &&
                              !isNaN(mapcenter[1]) &&
                              !isNaN(Number(circleDataById?.radius)) ? (
                              <>
                                {Form?.GeoFenceType ===
                                  "Restricted-Area" && (
                                    <Circle
                                      radius={Number(circleDataById?.radius)}
                                      center={mapcenter}
                                      color="red"
                                    />
                                  )}
                                {Form?.GeoFenceType !==
                                  "Restricted-Area" && (
                                    <Circle
                                      radius={Number(circleDataById?.radius)}
                                      center={mapcenter}
                                      color="#97009c"
                                    />
                                  )}
                                {Form?.GeoFenceType === "City-Area" && (
                                  <Circle
                                    radius={Number(circleDataById?.radius)}
                                    center={mapcenter}
                                    color="green"
                                  />
                                )}
                              </>
                            ) : null}
                          </FeatureGroup>
                        )}
                        {drawShape == true && (
                          <FeatureGroup>
                            <EditControl
                              position="topright"
                              onEdited={handleEdited}
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
                            {Form.zoneType === "Polygon" &&
                              polygondataById.length > 0 ? (
                              <Polygon
                                positions={polygondataById}
                                color="#97009c"
                              />
                            ) : null}

                            {Form.zoneType === "Circle" &&
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
                      </MapContainer>)
                )}
              </div>
            </div>
          </div>
        </div>
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  );
}
