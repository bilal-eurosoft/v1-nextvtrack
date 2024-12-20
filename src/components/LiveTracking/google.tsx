// src/MapComponent.js

import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap, LoadScript, useLoadScript,
  InfoWindow,
} from '@react-google-maps/api';
import { VehicleData } from '@/types/vehicle';
import { MarkerF } from '@react-google-maps/api';
import L, { LatLng } from "leaflet";
import stopcar from "../../../public/Stop_Car.svg"
import movecar from "../../../public/Move_Car.svg"
import pausecar from "../../../public/Pause_Car.svg"
import idlecar from "../../../public/Idle_Car.svg"
import stopbike from "../../../public/bike_icon_red.svg"
import movebike from "../../../public/bike_icon_green.svg"
import pausebike from "../../../public/bike_icon_yellow.svg"
import idlebike from "../../../public/bike_icon_grey.svg"

// Your Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo';
/* AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo */
const containerStyle = {
  width: '100%',
  height: '858px',
};
const MapComponent = ({
  carData,
  selectedVehicle,
  setSelectedVehicle,
  showAllVehicles,
  setunselectVehicles,
  unselectVehicles,
  mapCoordinates,
  zoom, showZones, zoneList
}: {
  carData: VehicleData[];
  selectedVehicle: any;
  setSelectedVehicle: any;
  showAllVehicles: any;
  setunselectVehicles: any;
  unselectVehicles: any;
  mapCoordinates: any;
  zoom: any, showZones: any, zoneList: any
}) => {
  // const [isLoaded, setIsLoaded] = useState(false);  
  const [carstop, setcarstop] = useState("")
  const [carmove, setcarmove] = useState("")
  const [carpause, setcarpause] = useState("")
  const [caridle, setcaridle] = useState("")
  const [bikestop, setbikestop] = useState("")
  const [bikemove, setbikemove] = useState("")
  const [bikepause, setbikepause] = useState("")
  const [bikeidle, setbikeidle] = useState("")
  const [selectedZone, setSelectedZone] = useState(null); // State to hold the selected zone
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [circleRefs, setCircleRefs] = useState([]);
  const [polygonRefs, setPolygonRefs] = useState([]);
  const [isMapMoved, setIsMapMoved] = useState(false);
  const handleCircleClick = (name: any, center: any) => {
    if (selectedZone == name) {
      setSelectedZone(null);
      setInfoWindowPosition(null);
    } else {
      setSelectedZone(name);
      setInfoWindowPosition(center); // Set the InfoWindow position to the circle's center
    }
  };
  // Function to handle polygon click
  const handlePolygonClick = (name, latlng) => {
    if (selectedZone == name) {
      setSelectedZone(null);
      setInfoWindowPosition(null);
    } else {
      setSelectedZone(name);
      setInfoWindowPosition(latlng[parseInt(latlng.length - 1 / 2)]); // Set the InfoWindow position to the click location
    }
  };
  // const [isUserInteracting, setIsUserInteracting] = useState(false);
  // const [mapCenter, setMapCenter] = useState({ lat: mapCoordinates[0], lng: mapCoordinates[1] });
  // const handleMoveEnd = (event: any) => {
  //   // setIsMapDragged(true);
  //   setIsUserInteracting(true); // User is interacting with the map

  //   // if (unselectVehicles === true) {
  //   //   setSelectedVehicle(null);
  //   // }
  // };
  // const handleDragStart = () => {
  //   setIsUserInteracting(true); // User is interacting with the map
  // };

  // const handleIdle = () => {
  //   setIsUserInteracting(false); // User interaction has stopped
  // };

  const handleClick = (event: any) => {
    if (selectedVehicle) {

      setunselectVehicles(true);
      setSelectedVehicle(null);
    }
  };
  async function loadSVG(filepath: string) {
    const response = await fetch(filepath);
    return await response.text();
  }

  useEffect(() => {
    async function setdata() {
      setcarstop(await loadSVG(stopcar.src))
      setcarmove(await loadSVG(movecar.src))
      setcarpause(await loadSVG(pausecar.src))
      setcaridle(await loadSVG(idlecar.src))
      setbikestop(await loadSVG(stopbike.src))
      setbikemove(await loadSVG(movebike.src))
      setbikepause(await loadSVG(pausebike.src))
      setbikeidle(await loadSVG(idlebike.src))
    }
    setdata()

    // if (mapCoordinates?.length > 0) {

    //   setMapCenter({ lat: mapCoordinates[0], lng: mapCoordinates[1] })
    // }
    return () => {
      if (mapRef.current) {
        mapRef.current = null;
        delete window.google;
      }
    };
  }, [])
  // const [mapRef, setMapRef] = useState(null);  
  const mapRef = useRef(null);
  const onLoad = (map) => {
    mapRef.current = map
  };
  const selectedVehicleCurrentData = useRef<VehicleData | null>(null);
  useEffect(() => {
    if (mapRef.current) {
      if (selectedVehicle) {
        selectedVehicleCurrentData.current =
          carData.find((el) => el.IMEI === selectedVehicle?.IMEI) || null; // Assign null if selectedVehicle is not found
        if (selectedVehicleCurrentData.current) {
    //       let count = 0;
    //       let currentCenter = mapRef.current.getCenter();
    //       let targetPosition ={
    //         lat:selectedVehicleCurrentData.current.gps.latitude,
    //         lng:selectedVehicleCurrentData.current.gps.longitude
    //       }
    //       let steps = 50;  // Number of steps in the fly animation
    // let stepLat = (targetPosition.lat - currentCenter.lat) / steps;
    // let stepLng = (targetPosition.lng - currentCenter.lng) / steps;
    //       function animateFly() {
    //         count++;
    //         let newLat = currentCenter.lat() + stepLat * count;
    //         let newLng = currentCenter.lng() + stepLng * count;
    //         mapRef.current.panTo({ lat: newLat, lng: newLng });
    //         if (count < steps) {
    //           animateFly()
    //           // requestAnimationFrame(animateFly);
    //         }
    //       }
    //       animateFly()

          // setMapCenter({
          //   lat: selectedVehicleCurrentData.current.gps.latitude,
          //   lng: selectedVehicleCurrentData.current.gps.longitude
          // })
          mapRef.current.panTo(
            {
              lat: selectedVehicleCurrentData.current.gps.latitude,
              lng: selectedVehicleCurrentData.current.gps.longitude
            }
          );
          mapRef.current.setZoom(15);
        }
      } else if (selectedVehicle == null && showAllVehicles === true) {
        if (!carData || carData.length === 0) return;
        else if (carData.length === 1) {
          if (mapCoordinates && !isMapMoved) {

            mapRef.current.panTo({ lat: mapCoordinates[0], lng: mapCoordinates[0] });
            mapRef.current.setZoom(zoom);

          }
        } else {

          const positions: LatLng[] = carData.map((data) =>
            L.latLng(data.gps.latitude, data.gps.longitude)
          );

          const bounds = L.latLngBounds(positions);

          let zoom1;
          var center: LatLng | undefined;
          if (bounds.isValid()) {
            center = bounds.getCenter();

            const lats = carData.map((data) => data.gps.latitude);
            const lngs = carData.map((data) => data.gps.longitude);

            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            const latDistance = maxLat - minLat;
            const lngDistance = maxLng - minLng;

            const latZoom = Math.floor(Math.log2(360 / (0.5 * latDistance)));
            const lngZoom = Math.floor(Math.log2(360 / (0.5 * lngDistance)));

            zoom1 = Math.min(latZoom, lngZoom);
            //setZoom(zoom)
          } else {

            center = L.latLng(0, 0); // You may adjust the default center as per your needs
            zoom1 = 11; //
          }
          if (!isMapMoved) {
            setSelectedVehicle(false);
            mapRef.current.panTo(center);
            mapRef.current.setZoom(zoom1)
          }
        }

      }
      // else if (mapCoordinates.length > 0) {
      //   setMapCenter({ lat: mapCoordinates[0], lng: mapCoordinates[1] })
      // }
    }
  }, [carData, selectedVehicle, mapRef.current, mapCoordinates, zoom]);

  useEffect(() => {
    if (showZones == false) {
      circleRefs.forEach((circle) => circle.setMap(null));
      setCircleRefs([]);
      polygonRefs.forEach((polygon) => polygon.setMap(null));
      setPolygonRefs([])
    } else {
      zoneList.
        // filter((i) => { return i.zoneType == "Circle" }).
        map((i) => {
          const isRestrictedArea =
            i.GeoFenceType === "Restricted-Area"; // && session?.clickToCall === true;
          const isCityArea = i.GeoFenceType === "City-Area"; // && session?.clickToCall === true;        
          if (i.zoneType == "Circle") {

            const circle = new google.maps.Circle({
              center: { lat: Number(i.centerPoints.split(",")[0]), lng: Number(i.centerPoints.split(",")[1]) }, // Circle center
              radius: Number(i.latlngCordinates), // Radius in meters
              strokeColor: isCityArea ? "green" : isRestrictedArea ? "red" : "blue", // Red border color
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: isCityArea ? "green" : isRestrictedArea ? "red" : "blue", // Red fill color
              fillOpacity: 0.35,
              map: mapRef.current, // Attach to the map instance          
            });
            circle.addListener("click", () => {
              handleCircleClick(i.zoneName, {
                lat: Number(i.centerPoints.split(",")[0]),
                lng: Number(i.centerPoints.split(",")[1])
              })
            });
            setCircleRefs((prevRefs) => [...prevRefs, circle]);
          } else {
            const polygon = new google.maps.Polygon({
              paths: JSON.parse(i.latlngCordinates),
              strokeColor: isCityArea ? "green" : isRestrictedArea ? "red" : "blue", // Red border color
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: isCityArea ? "green" : isRestrictedArea ? "red" : "blue", // Red fill color
              fillOpacity: 0.35,
              map: mapRef.current, // Attach to the map instance          
            });
            polygon.addListener("click", () => {
              handlePolygonClick(i.zoneName, JSON.parse(i.latlngCordinates))
            });
            setPolygonRefs((prevRefs) => [...prevRefs, polygon]);
          }


        })
    }
  }, [showZones])

  const icon = (
    speed: number,
    ignition: number,
    angle: number,
    vehicleType: String
  ) => {
    let imageSrc = "";
    if (vehicleType === 'Bike1') {
      if (speed === 0 && ignition === 0) {
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(bikestop?.replaceAll("(angle", "(" + angle.toString()))}`
      }
      //stop
      else if (speed > 0 && ignition === 1) {
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(bikemove?.replaceAll("(angle", "(" + angle.toString()))}`

      }
      //hybrid
      else if (speed > 0 && ignition === 0) {
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(bikeidle?.replaceAll("(angle", "(" + angle.toString()))}`

      }
      //pause
      else {
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(bikepause?.replaceAll("(angle", "(" + angle.toString()))}`
      }
    }
    else {


      if (speed === 0 && ignition === 0) {
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(carstop?.replaceAll("(angle", "(" + angle.toString()))}`

      }
      //stop
      else if (speed > 0 && ignition === 1) {
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(carmove?.replaceAll("(angle", "(" + angle.toString()))}`

      }
      //hybrid
      else if (speed > 0 && ignition === 0) {
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(caridle?.replaceAll("(angle", "(" + angle.toString()))}`

      }
      //pause
      else {
        imageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(carpause?.replaceAll("(angle", "(" + angle.toString()))}`
      }

    }
    return {
      url: imageSrc,
      // scaledSize: {
      //   height:65,
      //   width:65
      // }

      // anchor: [20, 20]
    }
  };
  // const [googleLoaded, setGoogleLoaded] = useState(false);
  // const { isLoaded } = useLoadScript({
  //   googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  // });
  // const { isLoaded }  =useGoogleMaps();
  // if (!isLoaded) return null; // Wait until the API is loaded
  // useEffect(() => {
  //   if (isLoaded && window.google) {
  //     setGoogleLoaded(true);
  //   }
  // }, [isLoaded]);
  // if (!googleLoaded) return <div>Loading...</div>;
  return (
    <>
      {
        (mapCoordinates !== null && zoom !== null) && (
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              clickableIcons={false}
              mapContainerStyle={containerStyle}
              // center={{ lat, lng }}
              center={{
                lat: mapCoordinates[0], lng: mapCoordinates[1]
              }}

              zoom={zoom}
              onLoad={onLoad}
              onClick={handleClick}
              onDragStart={() => setIsMapMoved(true)} // Mark that the map has been moved
              onDragEnd={() => setIsMapMoved(true)} //
              options={{
                draggable: true, // Make map draggable
                disableDoubleClickZoom: true, //disable zoom in double click
                disableDefaultUI: true,  //disable all options

              }}
            // onDragEnd={handleMoveEnd}
            // onZoomChanged={handleZoomEnd}        
            >
              {carData.map((vehicle, index) => {
                const { gps: { latitude, longitude } } = vehicle;
                const markerIcon = icon(
                  vehicle?.gps.speed || 0,
                  vehicle?.ignition || 0,
                  vehicle?.gps.Angle || 0,
                  vehicle?.vehicleType || ""
                );

                return (
                  <>
                    <MarkerF
                      position={{ lat: latitude, lng: longitude }}
                      icon={markerIcon}
                      title={vehicle?.vehicleReg}
                    >
                      <InfoWindow
                        position={{ lat: latitude, lng: longitude - 10 }}
                        options={{
                          disableAutoPan: true,
                          position: { lat: latitude, lng: longitude - 10 }
                        }}

                      >
                        <div style={{ fontSize: "12px", paddingTop: "9px", maxWidth: "100px" }}>
                          <strong>{vehicle?.vehicleReg}</strong>
                        </div>
                      </InfoWindow>
                    </MarkerF>


                  </>
                )




              })}

              {showZones && selectedZone && infoWindowPosition && (
                <InfoWindow position={infoWindowPosition} >
                  <div>
                    <p>{selectedZone}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        )
      }
    </>
  );
};
export default MapComponent;