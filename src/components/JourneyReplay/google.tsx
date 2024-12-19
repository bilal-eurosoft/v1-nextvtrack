// src/MapComponent.js

import React, { useState, useEffect, useRef } from 'react';
import {
    GoogleMap, LoadScript,
    InfoWindow,
    Polyline, MarkerF
} from '@react-google-maps/api';
import HarshCornerningIcon from "../../../public/harshcornering.png";
// import HarshAccelerationIcon from "../../../public/Images/HarshAccelerationIcon.png";
// import HarshBreakIcon from "../../../public/Images/brake-discs.png";
import Amarker from "../../../public/Images/marker-a.png";
import Bmarker from "../../../public/Images/marker-b.png";
import movebike from "../../../public/bike_icon_green.svg"
import movecar from "../../../public/Move_Car.svg"
// import BorderColor from '@mui/icons-material/BorderColor';
import "./index.css";


// Your Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo';
/* AIzaSyBy7miP3sEBauim4z2eh5ufzcC8YItPyBo */
const containerStyle = {
    // width: '113.5%',
    // height: '858px',
    height: '83vh',
    // marginLeft: "-13.5%",
    BorderColor: "none",
    border: "none"
};
const MapComponent = ({
    polylinedata,
    TravelHistoryresponse,
    loadingMap,
    mapcenter,
    minZoom,
    maxZoom,
    zoom,
    carPosition, getCurrentAngle,
    zoomToFly, mapcenterToFly, isPlaying, isPaused,
    vehicleType,
    lat,
    lng, userclick
}: {
    polylinedata: any,
    TravelHistoryresponse: any,
    loadingMap: any,
    mapcenter: any,
    minZoom: any,
    maxZoom: any,
    zoom: any,
    carPosition: any, getCurrentAngle: any,
    zoomToFly: any, mapcenterToFly: any, isPlaying: any, isPaused: any,
    vehicleType: any,
    lat: any,
    lng: any, userclick: any
}) => {
    const [carmove, setcarmove] = useState("")
    const [bikemove, setbikemove] = useState("")

    // const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [popup, setpopup] = useState("")
    const [mapCenter, setMapCenter] = useState({ lat: mapcenter[0], lng: mapcenter[1] });
    // const handleDragStart = () => {
    //     setIsUserInteracting(true); // User is interacting with the map
    // };
    async function loadSVG(filepath: string) {
        const response = await fetch(filepath);
        return await response.text();
    }
    useEffect(() => {

        async function setdata() {
            setcarmove(await loadSVG(movecar.src))
            setbikemove(await loadSVG(movebike.src))
        }
        setdata()
        return () => {


            if (mapRef.current) {

                mapRef.current = null;
                delete window.google;
            }
        };
    }, [])
    const mapRef = useRef(null);
    const onLoad = (map) => {
        mapRef.current = map
    };

    const icon = (
        angle: number
    ) => {
        if (vehicleType == "Car") {

            return {
                url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(carmove?.replaceAll("(angle", "(" + angle.toString()))}`,
                scaledSize: new google.maps.Size(40, 40), // Scale image to 40x40 px
                anchor: new google.maps.Point(20, 20)
            }
        } else {

            return {
                url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(bikemove?.replaceAll("(angle", "(" + angle.toString()))}`,
                scaledSize: new google.maps.Size(40, 40), // Scale image to 40x40 px
                anchor: new google.maps.Point(20, 20)
            }
        }
    }
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setZoom(zoomToFly)
            if (carPosition) {
                mapRef.current.panTo(carPosition);
            }
        }
    }, [zoomToFly])

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setZoom(zoom)
        }
    }, [zoom])
    useEffect(() => {
        if (mapRef.current && mapcenterToFly) {
            mapRef.current.panTo({ lat: mapcenterToFly[0], lng: mapcenterToFly[1] });
        }
    }, [mapcenterToFly])
    const SetViewOnClick = ({ coords, zoom }: { coords: any, zoom: any }) => {
        /* if (isPaused) {
          setMapcenterToFly(null);
          setzoomToFly(0);
    
        } */



        if (userclick && isPlaying) {
            return null
        }

        if (coords) {
            mapRef.current.panTo({ lat: coords[0], lng: coords[1] });
        }
        return null;
    };

    const SetViewfly = ({ coords, zoom }: { coords: any; zoom: number }) => {


        // if (selectedItemId) {
        //   return null
        // }
        if (coords && !Number.isNaN(coords[0]) && coords[0] != null) {

            mapRef.current.panTo({ lat: coords[0], lng: coords[1] });
            mapRef.current.setZoom(zoom)

        }
        return null;
    };
    

    return (
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                clickableIcons={false}
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={zoom}
                // center={((isPaused ||isPlaying)&& !userclick)?  carPosition: mapCenter}
                // zoom={(isPaused ||isPlaying)?18: zoom}
                onLoad={onLoad}
                // onClick={handleClick}
                // onDragStart={handleDragStart} // Track drag interaction        
                // onIdle={handleIdle} 
                options={{
                    draggable: true, // Make map draggable         
                    disableDoubleClickZoom: true, //disable zoom in double click
                    disableDefaultUI: true,  //disable all options
                    scrollwheel: true,
                    maxZoom,
                    minZoom
                }}
            >
                {loadingMap ? (
                    <Polyline
                        options={{ strokeColor: "red", strokeWeight: 6 }}
                        path={polylinedata}
                    />
                ) : null}
                {isPlaying ? (
                    <SetViewOnClick coords={mapcenter} zoom={zoom} />
                ) : isPaused ? (
                    <SetViewOnClick coords={mapcenter} zoom={zoom} />
                )
                    :

                    (
                        <SetViewfly coords={mapcenterToFly} zoom={zoomToFly} />
                    )
                }
                {loadingMap
                    ? carPosition && (
                        <MarkerF
                            position={
                                {
                                    lat: carPosition.lat,
                                    lng: carPosition.lng
                                }

                            }
                            icon={icon(getCurrentAngle())}

                        ></MarkerF>
                    )
                    : ""}
                {TravelHistoryresponse?.length > 0 && loadingMap ? (
                    <>
                        <MarkerF
                            position={{ lat: TravelHistoryresponse[0]?.lat, lng: TravelHistoryresponse[0]?.lng }}
                            icon={{

                                url: Amarker.src
                            }}
                        // title={vehicle?.vehicleReg}
                        >
                        </MarkerF>
                        <MarkerF
                            position={{ lat: TravelHistoryresponse[TravelHistoryresponse.length - 1]?.lat, lng: TravelHistoryresponse[TravelHistoryresponse.length - 1]?.lng }}

                            icon={{ url: Bmarker.src }}
                        // title={vehicle?.vehicleReg}
                        >
                        </MarkerF>
                    </>
                ) : null}
                {lat && lng && (
                    <MarkerF
                        position={{ lat, lng }}
                        icon={
                            {
                                url:
                                    "https://img.icons8.com/fluency/48/000000/stop-sign.png",
                                //   anchor: [22, 47],
                                //   popupAnchor: [1, -34],
                            }
                        }
                    ></MarkerF>
                )}
                {TravelHistoryresponse?.map((item) => {
                    if (item.vehicleEvents.length > 0) {
                        return item.vehicleEvents.map((items: any) => {
                            if (items.Event === "HarshBreak") {
                                return loadingMap ? (
                                    <MarkerF
                                        position={{ lat: item.lat, lng: item.lng }}


                                        icon={{
                                            // url: HarshBreakIcon.src
                                            scaledSize: new google.maps.Size(30, 30),
                                            anchor: new google.maps.Point(16, 37),
                                            url: "https://img.icons8.com/color/48/000000/brake-discs.png"
                                        }
                                        }
                                        onClick={() => {
                                            if (popup == `${item.lat}${item.lng}`) {
                                                setpopup("")
                                            } else {

                                                setpopup(`${item.lat}${item.lng}`)
                                            }
                                        }}
                                    >

                                        {popup == `${item.lat}${item.lng}` &&
                                            <InfoWindow
                                                position={{ lat: item.lat, lng: item.lng }}
                                                options={{
                                                    disableAutoPan: true,
                                                    position: { lat: item.lat, lng: item.lng - 10 }

                                                }}

                                            >
                                                <div style={{ fontSize: "12px", paddingTop: "9px", maxWidth: "100px" }}>
                                                    Harsh Break
                                                </div>
                                            </InfoWindow>
                                        }
                                    </MarkerF>
                                ) : (
                                    ""
                                );
                            }
                            if (items.Event === "HarshAcceleration") {
                                return loadingMap ? (
                                    <MarkerF
                                        position={{ lat: item.lat, lng: item.lng }}
                                        icon={{
                                            url: "https://img.icons8.com/nolan/64/speed-up.png",
                                            scaledSize: new google.maps.Size(30, 30),
                                            anchor: new google.maps.Point(16, 37),
                                            // url: HarshAccelerationIcon.src
                                        }}
                                        onClick={() => {
                                            if (popup == `${item.lat}${item.lng}`) {
                                                setpopup("")
                                            } else {

                                                setpopup(`${item.lat}${item.lng}`)
                                            }
                                        }}
                                    >

                                        {popup == `${item.lat}${item.lng}` &&
                                            (<InfoWindow
                                                position={{ lat: item.lat, lng: item.lng }}
                                                options={{
                                                    disableAutoPan: true,
                                                    position: { lat: item.lat, lng: item.lng - 10 }

                                                }}

                                            >
                                                <div style={{ fontSize: "12px", paddingTop: "9px", maxWidth: "100px" }}>
                                                    Harsh Acceleration
                                                </div>
                                            </InfoWindow>
                                            )}
                                    </MarkerF>
                                ) : (
                                    ""
                                );
                            }
                            if (items.Event === "HarshCornering") {
                                return loadingMap ? (
                                    <MarkerF
                                        position={{ lat: item.lat, lng: item.lng }}
                                        icon={{
                                            scaledSize: new google.maps.Size(30, 30),
                                            anchor: new google.maps.Point(16, 37),
                                            url: HarshCornerningIcon.src
                                        }}
                                        onClick={() => {
                                            if (popup == `${item.lat}${item.lng}`) {
                                                setpopup("")
                                            } else {

                                                setpopup(`${item.lat}${item.lng}`)
                                            }
                                        }}
                                    >

                                        {popup == `${item.lat}${item.lng}` && (
                                            <InfoWindow
                                                position={{ lat: item.lat, lng: item.lng }}
                                                options={{
                                                    disableAutoPan: true,
                                                    position: { lat: item.lat, lng: item.lng - 10 }
                                                }}
                                            >

                                                <div style={{ fontSize: "12px", paddingTop: "9px", maxWidth: "100px" }}>
                                                    Harsh Cornering
                                                </div>
                                            </InfoWindow>
                                        )}
                                    </MarkerF>
                                ) : (
                                    ""
                                );
                            }
                        });
                    }
                })}

            </GoogleMap>
        </LoadScript>
    );
};
export default MapComponent;