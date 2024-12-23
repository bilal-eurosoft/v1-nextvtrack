"use client";

import React, { useEffect, useRef, useState } from "react";
import { Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { VehicleData } from "@/types/vehicle";
import L, { LatLng } from "leaflet";
import { ClientSettings } from "@/types/clientSettings";
const LiveCars = ({
  carData,
  clientSettings,
  selectedVehicle,
  mapCoordinates,
  setSelectedVehicle,
  showAllVehicles,
  setunselectVehicles,
  unselectVehicles,
}: {
  carData: VehicleData[];
  clientSettings: ClientSettings[];
  selectedVehicle: VehicleData | null;
  mapCoordinates: any;
  setSelectedVehicle: any;
  showAllVehicles: any;
  setunselectVehicles: any;
  unselectVehicles: any;
}) => {
  const map = useMap();
  const selectedVehicleCurrentData = useRef<VehicleData | null>(null); // Initialize with null
  const clientMapSettings = clientSettings.find(
    (el) => el?.PropertDesc === "Map"
  )?.PropertyValue;

  const clientZoomSettings = clientSettings.find(
    (el) => el?.PropertDesc === "Zoom"
  )?.PropertyValue;

  useEffect(() => {
    let newmapCoordinates: [number, number] = [0, 0];

    if (map) {
      if (selectedVehicle) {
        selectedVehicleCurrentData.current =
          carData.find((el) => el.IMEI === selectedVehicle?.IMEI) || null; // Assign null if selectedVehicle is not found
        if (selectedVehicleCurrentData.current) {
          map.flyTo(
            [
              selectedVehicleCurrentData.current.gps.latitude,
              selectedVehicleCurrentData.current.gps.longitude,
            ],
            18
          );
        }
      } else if (selectedVehicle == null && showAllVehicles === true) {
        if (!carData || carData.length === 0) return;
        else if (carData.length === 1) {
          const regex = /lat:([^,]+),lng:([^}]+)/;
          if (clientMapSettings) {
            const match = clientMapSettings.match(regex);

            if (match) {
              const lat = parseFloat(match[1]);
              const lng = parseFloat(match[2]);
              map.flyTo([lat, lng], Number(clientZoomSettings));
            }
          }
        } else {
          const positions: LatLng[] = carData.map((data) =>
            L.latLng(data.gps.latitude, data.gps.longitude)
          );

          const bounds = L.latLngBounds(positions);
          var zoom;
          var center: LatLng | undefined;
          if (bounds.isValid()) {
            center = bounds.getCenter();
            /*  setMapCoordinates(center); */

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

            zoom = Math.min(latZoom, lngZoom);
            //setZoom(zoom)
          } else {
            center = L.latLng(0, 0); // You may adjust the default center as per your needs
            zoom = 11; //
          }

          setSelectedVehicle(false);
          map.flyTo(center, zoom);
        }
      }
    }
  }, [carData, selectedVehicle, map, clientMapSettings, clientZoomSettings]);

  const calculateIconSize = (latitude: number, longitude: number) => {
    let distance = 0;
    const iconSize = Math.min(Math.max(20, distance * 0.1), 50);
    return [iconSize, iconSize];
  };

  const icon = (
    speed: number,
    ignition: number,
    angle: number,
    latitude: number,
    longitude: number
  ) => {
    let imageSrc = "";

    if (speed === 0 && ignition === 0) {
      imageSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAnCAYAAAAPZ2gOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Q0Q2RUUyNjg4OEJFMTFFQzhBN0FGRTBGRTk5QUVBOTEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Q0Q2RUUyNjk4OEJFMTFFQzhBN0FGRTBGRTk5QUVBOTEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDRDZFRTI2Njg4QkUxMUVDOEE3QUZFMEZFOTlBRUE5MSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDRDZFRTI2Nzg4QkUxMUVDOEE3QUZFMEZFOTlBRUE5MSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PheOhwkAAAZ8SURBVHjalFZJjB1HGf6qen3LvMXjmQweLwnYgMRiE0WQKNEkxCBwEgirOHEBhIQCBw6ICwIJCfCNYwQCblywlAsHuCDEYhwUIhJsRSayQzQ23mZ5Wy+vl6riq+4eL8iEcT393f26q7766l++KoG7tU4ba5k6+L3S+fwK3E9lwCMCwuGXwgf+fBn5CydddeoPoXddR/EdQ53/xnri2U8+8O1nP/OdT7989luLeflZDecQIFx+EjSpgdUOzNpD/T3HH/zmN+7fcMTFq/96c3JXwM99+UvHf/TxZ0698ye/eLp15fqqhhs0fUTTRdT/ZbgwTw+8a2tz7cRzX3/mxrD/t/N/f+XyHYAP71l66Ptrx1/IT57cry+9AY3WTZS7NQOJ4sYlzP/y18W1xx4/ce71f/72chxvVIAe7Wup+fHymRc/2IpzuAQrxC1qt9sOzVzYcT7KOEF8+sxCmKT69yh/I22HfZBvOyzkMWgHAWFKzl80A0s7+DYzDaj9rmghp1ccc9g4T65AhNbZ5IMVF85KSAg7QynqgRZwLmrbYdfXNXP7XfGly4dQCBKR+10j7qsA3w7ZXQC6TAn6jh3ZyW8GhfbZ3AKUzfugYRlWfQT7i3YbGFSAGqJDAGlns0uUHB2Y2redOwJRW9H8sQztsh1j0OHijkC23cbJQcCrWwVIoGc0JhxxiVMlfBdxSWW1LIEOgfp8t0xWe00Nbs2FYA/huc1kIuAsdrZX6Po/ugIXWgEm7RDbAb0rJKRpGDoSvSzHffMCR3ONx2jvKDRXpKvvFSCjmlif/CoQ+PnKErzhAIHnVf5qawOtVGWu60Jz4AbL7SLZ/87k+Cln+i4n/GgGbXHcvZDeYeEcPLOnh/lCG0sH9nIGDVUWMIre1QwTwRwpIbiKPE6h0hRyPgeYg6M8x+n+IhY7bdnaTg64X+jteW6/dI683g2VMHBaWYGZFDejWaWP/U/AOUGyzFqOLM1QEMyurBOEeM3z9P5W50POSyp/MU6TrRNKfnHD971p4GFM10oyM8Y6zlRgZVFgTmYWtLpnafW9x0A93hvi3ZNo9nwy/oqLssQmRJoZk2mtWv1SQbkOg2BQWqN/CvaJySzNMwJlyPkMpatUWpEO64Pxn0SxZ33YpFjKscmmwKAdJUh0ju5kxkiW6Nroa4U5AfwqgAJbfhtXPY2rqsCqkYgD37KN6KZoJ20SRyOeMiGPrV/DVwnwfg5cpidtOdbCUF9NJQwSI0b8ZS+A4Wou0iJdzsb8tMMwCXWZXGcmvo+dH2S1Rk3C6rtIl0fW+wqFI8y/V5kZrzoOkrLYJKCqAKeuk88dmRl2stKbWlF4Cy1UjVnOMwbQ8Bd4fuqIwlTyVQz6gRoOQ78oq4730kgEhjkb7l1eag8GQS0OeVEKPS98Old7igld3Can/7vZHprLF1ZUprMsKxNVMexNp/nieJS3whDKkffEMLNqw7rW03GaJQ0gZUoy46WhXuS74naLYcGklyxNWW+zVYUxklLaekjJLhVi1+xE48N5hWIqwEYPjaAMiA+PEhykMBS7BCw48lCSoZ2XVqStwglZ0zRy5jnyTy0HoyJnFu6OJcfB1v7ZfYvMaKdacwWYtjuDrNsdXiDf805DexfNZuB6N8QbLR/t/mCpu9Dr1T50pEdB8N1Klc1tm+Vbt0qheXFY5650A8dz3QqwFSfjMIpHYAm1XHeXcHWzCu4wMJPZ6Fo0mYwrQEerUpZlwRnget49wAkU3CKISZEvC6WUrgNuN3i7bbp+lVe7XbJoBCSPY7hK2Kqta5lpo7i3Kqt9q6WxKbC75dJW0xzenOchpXKzA0jZKa4IUxzMFI6lecP5/6UMqoPL0WmC5bxAJkR6M7FHBLzBDe1j2zMMuAVsMzB9yr5bnyoa8Poum3vKyyVOPGRSf2Sc4N8CU+upnZODWijLySPbU5ylYD5/eB8emMW4P5pjaAvfgrNeE95HRuEaFf0cN4OLfP6BaeHJuMDPoK+pHYbWF4nRF3Kq4flBB68NOzw5eNCdFNksQhRFSOI5I0nZ1epWErL9g8CPsrbOQa/fcYKdolx/L+QTLSWWDdlEBNrY3sJoawvJZALNbdRuqTttifYo+ZygVm0if+mXKH5I103E6urqzQMkT0/9p4z/iaPCf5gS8Z5toZfP+Y4YG+VLbbdVbbpaFx8wojgku1dY9etndX76FKJfv8lQ2Az+jwADAPkpHcVK9q76AAAAAElFTkSuQmCC";
    } else if (speed > 0 && ignition === 1) {
      imageSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAnCAYAAAAPZ2gOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODI5QjMwQjE4OEJDMTFFQ0ExN0FGNjIyNUJDRTkyOTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODI5QjMwQjI4OEJDMTFFQ0ExN0FGNjIyNUJDRTkyOTMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4MjlCMzBBRjg4QkMxMUVDQTE3QUY2MjI1QkNFOTI5MyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4MjlCMzBCMDg4QkMxMUVDQTE3QUY2MjI1QkNFOTI5MyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhMMRDwAAAaQSURBVHjalFbbi11X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";
    } else if (speed > 0 && ignition === 0) {
      imageSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAnCAYAAAAPZ2gOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QzUwREYwRTU4OEJFMTFFQzk0NkFEQ0Y1Qjg2RkVBRkIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QzUwREYwRTY4OEJFMTFFQzk0NkFEQ0Y1Qjg2RkVBRkIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpDNTBERjBFMzg4QkUxMUVDOTQ2QURDRjVCODZGRUFGQiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpDNTBERjBFNDg4QkUxMUVDOTQ2QURDRjVCODZGRUFGQiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pj80e0MAAAZnSURBVHjalFZZbBNn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";
    } else {
      imageSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAnCAYAAAAPZ2gOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkVBOTQ4QTM4OEJFMTFFQzgyRUZGNzQzODhBMzI1QkEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkVBOTQ4QTQ4OEJFMTFFQzgyRUZGNzQzODhBMzI1QkEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCRUE5NDhBMTg4QkUxMUVDODJFRkY3NDM4OEEzMjVCQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCRUE5NDhBMjg4QkUxMUVDODJFRkY3NDM4OEEzMjVCQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqKs8n4AAAbvSURBVHjalFZbbB1H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";
    }

    const rotation = angle || 0;
    const [iconWidth, iconHeight] = calculateIconSize(latitude, longitude);

    const iconHtml = `
      <div class="custom-icon" style="transform: rotate(${rotation}deg);">
        <img src="${imageSrc}" alt="Car Marker">
      </div>
    `;

    return new L.DivIcon({
      className: "custom-icon",

      iconSize: [iconWidth + 10, iconHeight],

      html: iconHtml,
    });
  };

  const pos: string[] = carData?.map((datas) => datas?.vehicleReg);

  if (!clientMapSettings) {
    return <>Map Loading...</>;
  }

  const positions: [number, number][] = carData?.map((data) => [
    data.gps.latitude,
    data.gps.longitude,
  ]);

  const handleMoveEnd = (event: any) => {
    if (unselectVehicles === true) {
      setSelectedVehicle(null);
    }
  };

  const handleClick = (event: any) => {
    if (selectedVehicle) {
      setunselectVehicles(true);
    }
    if (unselectVehicles === true) {
      setSelectedVehicle(null);
    }
  };
  const handleZoomEnd = (event: any) => {
    if (unselectVehicles === true) {
      setSelectedVehicle(null);
    }
  };

  function MapEventsHandler() {
    useMapEvents({
      moveend: handleMoveEnd,
      zoomend: handleZoomEnd,
      click: handleClick,
    });
    return null;
  }
  return (
    <>
      <MapEventsHandler />
      {positions.map((position, index) => (
        <Marker
          key={carData[index]?.IMEI}
          position={position}
          icon={icon(
            carData[index]?.gps.speed || 0,
            carData[index]?.ignition || 0,
            carData[index]?.gps.Angle || 0,
            position[0],
            position[1]
          )}
        >
          <Tooltip direction="bottom" offset={[0, 10]} opacity={1} permanent>
            <div className="font-bold px-2 ">{pos[index]}</div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
};

export default LiveCars;
