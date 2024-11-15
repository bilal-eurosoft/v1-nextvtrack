"use client";
// import { Inter } from "next/font/google";
import logo from "@/../public/Images/logo.png";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loading from "@/app/loading";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import TimeCounter from "@/app/context/timer";
import { usePathname, useSearchParams } from "next/navigation";
import { getNotificationsData, getNotificationsDataByUserId, getZoneListByClientId } from "@/utils/API_CALLS";
import { fetchZone } from "@/lib/slices/zoneSlice";
import { useSelector } from "react-redux";

import { FaBell } from 'react-icons/fa'; // Using React Icons for the bell icon

import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Typography,
  Tooltip
} from "@material-tailwind/react";
import "./layout.css";
import BlinkingTime from "../General/BlinkingTime";
import { stringify } from "querystring";
import NotificationDropdown from "./notifications";
// const inter = Inter({ subsets: ["latin"] });
// Example import statement
const drawerWidth = 58;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: 0
  })
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end"
}));

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [zoneList, setZoneList] = useState([]);
  const [filterId, setFilterId] = useState("");
  const searchParams = useSearchParams();

  const pathName = searchParams.get("id");

  /*   const obj = [
    { herf: " /liveTracking", label: "Live-Tracing" },
    { herf: "/journeyReplay", label: "journer-Replay" },
    { herf: " /Zone", label: "Zone" },
  ]; */

  const handleOpenPopUp = () => {
    setOpenPopover(!openPopover);
  };

  const triggers = {
    onClick: handleOpenPopUp
  };
  type MySessionData = {
    // Define the properties you expect in your session object
  };

  const { data: session } = useSession();
  const [loginTime, setLoginTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const fullparams = searchParams?.get("screen");
  // const dispatch = useDispatch();
  const allZones = useSelector((state) => state.zone);
  useEffect(() => {
    setZoneList(allZones?.zone);
  }, [allZones]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - loginTime.getTime();
      setElapsedTime(timeDifference);
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Run effect when loginTime changes

  // useEffect(() => {
  //   const fetchZoneList = async () => {
  //     if (session) {
  //       try {
  //         await dispatch(
  //           fetchZone({
  //             token: session?.accessToken,
  //             clientId: session?.clientId,
  //           })
  //         );
  //       } catch (error) {

  //       }
  //     }
  //   };

  // const allzoneList = zoneList?.map((item) => {
  //   return item?.id;
  // });

  const formatTime = (milliseconds: any) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  useEffect(() => {
    if (!session && fullparams != "full") {
      router.push("/signin");
    }
  }, [session, router]);

  const handleClick = (item: any) => {
    setSelectedColor(item);
  };
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const pathname = usePathname();
  useEffect(() => {
    const filterZoneIds = async () => {
      if (zoneList) {
        try {
          const filteredIds = zoneList?.find(
            (item: any) => item?.id == pathName
          );

          setFilterId(filteredIds?.id);
          // Use filteredIds as needed
        } catch (error) {}
      }
    };

    filterZoneIds();
  }, [zoneList]);
  
  const [loading, setLoading] = useState(false); // Loading state

  const BellButton = ({ toggleNotifications }) => {
    const [hovered, setHovered] = useState(false); // Track hover state

    return (
      <div className="relative">
        <button
          onClick={toggleNotifications}
          style={{
            padding: '0.5rem',
            backgroundColor: 'transparent',
            color: 'white',
            borderRadius: '9999px',
            outline: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'transform 0.3s ease-in-out', // Smooth transition for animation
            animation: hovered ? 'ringing 0.6s ease-in-out' : 'none', // Apply animation on hover only
          }}
          onMouseEnter={() => setHovered(true)} // Trigger hover state
          onMouseLeave={() => setHovered(false)} // Reset hover state
        >
          <FaBell size={24} />
        </button>
  
        <style>
          {`
            @keyframes ringing {
              0%, 100% {
                transform: translateX(0);
              }
              25% {
                transform: translateX(-5px);
              }
              50% {
                transform: translateX(5px);
              }
              75% {
                transform: translateX(-5px);
              }
            }
          `}
        </style>
      </div>
    );
  };

  

  const [showNotifications, setShowNotifications] = useState(false);
  
  const [notifications, setnotifications] = useState([]);
 

  // Toggle the visibility of the notifications dropdown
  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  useEffect(() => {
    if (showNotifications) {
      const fetchNotifications = async () => {
        setLoading(true); // Set loading to true before the fetch starts
        try {
          if (session && session.userRole === "Admin") {
            
            const NotificationsData = await getNotificationsData({
              token: session.accessToken,
              clientId: session?.clientId,
            });
          
            
            setnotifications(NotificationsData.data); // Assuming the response is an array of notifications
         
        
          }
          else {
             
            const NotificationsData = await getNotificationsDataByUserId({
              token: session?.accessToken,
              userId: session?.userId,
            });
           

            
            setnotifications(NotificationsData.data); // Assuming the response is an array of notifications
        
        
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false); // Set loading to false after the fetch is complete
        }
      };

      fetchNotifications();
    }
  }, [showNotifications]); 
  return (
    // <div className={inter.className}>
    <div>
      <div>
        {/* {obj.map(({ herf, label }) => {
          return (
            <div>
              <Link
                onClick={() => handleClick(herf)}
                style={{ color: selectedColor === herf ? "red" : "green" }}
                href={herf}
              >
                {label}
              </Link>{" "}
            </div>
          );
        })} */}

        <div className="flex flex-row">
          <div
            className={
              fullparams == "full"
                ? "hidden"
                : "basis-20 py-6 bg-[#29303b] h-screen lg:block md:hidden sm:hidden hidden sticky top-0"
            }
          >
            <Link href="/liveTracking">
              <Tooltip
                className="bg-[#00B56C] text-white shadow-lg rounded"
                placement="right"
                content="Live Map"
              >
                <svg
                  className={`w-20 h-14 py-3 mt-12   text-white text-white-10 dark:text-white ${
                    pathname === "/liveTracking"
                      ? "border-r-2 border-#29303b"
                      : "border-y-2"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    color: pathname == "/liveTracking" ? "green" : "white",
                    backgroundColor: pathname == "/liveTracking" ? "white" : ""
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Tooltip>
            </Link>
            <Link href="/journeyReplay" style={{ zIndex: "999" }}>
              <Tooltip
                className="bg-[#00B56C] text-white shadow-lg rounded"
                placement="right"
                content="Journey Replay"
              >
                <svg
                  className={`w-20 h-14 py-3  -my-1   text-white-10  dark:text-white ${
                    session?.userRole === "Controller"
                      ? "border-b-2 border-white"
                      : ""
                  } ${
                    pathname === "/journeyReplay"
                      ? "border-r-2 border-#29303b"
                      : "border-b-2"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: pathname == "/journeyReplay" ? "green" : "white",
                    backgroundColor: pathname == "/journeyReplay" ? "white" : ""
                  }}
                >
                  {" "}
                  <circle cx="12" cy="12" r="10" />{" "}
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
              </Tooltip>
            </Link>

            {session?.userRole === "Controller" ? null : (
              <Link href="/Zone">
                <Tooltip
                  className="bg-[#00B56C] text-white rounded shadow-lg"
                  placement="right"
                  content="Zones"
                >
                  <svg
                    className={`w-20 h-14 py-3    text-[white]  text-white-10  dark:text-white  ${
                      pathname == "/Zone" ||
                      pathname == "/AddZone" ||
                      `EditZone?id=${filterId}` == `EditZone?id=${pathName}`
                        ? "border-r-2 #29303b"
                        : "border-b-2"
                    }`}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      color:
                        pathname == "/Zone" ||
                        pathname == "/AddZone" ||
                        `EditZone?id=${filterId}` == `EditZone?id=${pathName}`
                          ? "green"
                          : "white",
                      backgroundColor:
                        pathname == "/Zone" ||
                        pathname == "/AddZone" ||
                        `EditZone?id=${filterId}` == `EditZone?id=${pathName}`
                          ? "white"
                          : ""
                    }}
                  >
                    {" "}
                    <path stroke="none" d="M0 0h24v24H0z" />{" "}
                    <circle cx="12" cy="12" r=".5" fill="currentColor" />{" "}
                    <circle cx="12" cy="12" r="7" />{" "}
                    <line x1="12" y1="3" x2="12" y2="5" />{" "}
                    <line x1="3" y1="12" x2="5" y2="12" />{" "}
                    <line x1="12" y1="19" x2="12" y2="21" />{" "}
                    <line x1="19" y1="12" x2="21" y2="12" />
                  </svg>
                </Tooltip>
              </Link>
            )}

            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.cameraProfile && (
                  <Link href="/DualCam">
                    <Tooltip
                      className="bg-[#00B56C] text-white shadow-lg rounded"
                      placement="right"
                      content="Camera"
                    >
                      <svg
                        className={`w-20 h-14 py-3  text-white-10  dark:text-white 
                
                          ${
                            pathname === "/DualCam"
                              ? "border-r-2 border-#29303b -my-1"
                              : "border-y-1 border-b-2"
                          }`}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          color: pathname == "/DualCam" ? "green" : "white",
                          backgroundColor: pathname == "/DualCam" ? "white" : ""
                        }}
                      >
                        {" "}
                        <path stroke="none" d="M0 0h24v24H0z" />{" "}
                        <circle cx="6" cy="6" r="2" />{" "}
                        <circle cx="18" cy="18" r="2" />{" "}
                        <path d="M11 6h5a2 2 0 0 1 2 2v8" />{" "}
                        <polyline points="14 9 11 6 14 3" />{" "}
                        <path d="M13 18h-5a2 2 0 0 1 -2 -2v-8" />{" "}
                        <polyline points="10 15 13 18 10 21" />
                      </svg>
                    </Tooltip>
                  </Link>
                )}
              </div>
            )}

            <Link href="/Reports">
              <Tooltip
                className="bg-[#00B56C] text-white shadow-lg rounded"
                placement="right"
                content="Reports"
              >
                <svg
                  className={`w-20 h-14 py-3 
                  text-white-10  dark:text-white 
        
                  ${
                    pathname === "/Reports"
                      ? "border-r-2 border-#29303b -my-1"
                      : "border-y-1 border-b-2"
                  }`}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: pathname == "/Reports" ? "green" : "white",
                    backgroundColor: pathname == "/Reports" ? "white" : ""
                  }}
                >
                  <path d="M9 7V2.13a2.98 2.98 0 0 0-1.293.749L4.879 5.707A2.98 2.98 0 0 0 4.13 7H9Z" />
                  <path d="M18.066 2H11v5a2 2 0 0 1-2 2H4v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 20 20V4a1.97 1.97 0 0 0-1.934-2ZM10 18a1 1 0 1 1-2 0v-2a1 1 0 1 1 2 0v2Zm3 0a1 1 0 0 1-2 0v-6a1 1 0 1 1 2 0v6Zm3 0a1 1 0 0 1-2 0v-4a1 1 0 1 1 2 0v4Z" />
                </svg>
              </Tooltip>
            </Link>
            <Link href="/Notifications">
  <Tooltip
    className="bg-[#00B56C] text-white shadow-lg rounded"
    placement="right"
    content="Events and Notifications"

  >
    <svg
      className={`w-20 h-14 py-3 text-white-10 dark:text-white ${
        pathname === "/Notifications"
          ? "border-r-2 border-#29303b -my-1"
          : "border-y-1 border-b-2"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        color: pathname === "/Notifications" ? "green" : "white",
        backgroundColor:
          pathname === "/Notifications" ? "white" : "",
      }}
    >
      {/* Bell Icon */}
      <path
        d="M12 22C13.1046 22 14 21.1046 14 20C14 19.4477 13.5523 19 13 19H11C10.4477 19 10 19.4477 10 20C10 21.1046 10.8954 22 12 22ZM18 16V11C18 7.13401 15.866 4 12 4C8.13401 4 6 7.13401 6 11V16L4 18V19H20V18L18 16Z"
      />
      {/* Gear Icon next to Bell */}
      <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M17 4V3M17 10V11M14.5 7.5L13.7 6.7M19.5 7.5L20.3 6.7M14.5 9.5L13.7 10.3M19.5 9.5L20.3 10.3M15 3H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </Tooltip>
</Link>
            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.driverProfile && (
                  <Popover placement="right-start">
                    {/* <Link href="/DriverProfile"> */}
                    {/* <Link href={pathname ? "/DriverProfile" : "/DriverAssign"}> */}
                    <Tooltip
                      className={`bg-[#00B56C]  z-50 text-white shadow-lg rounded border-none`}
                      placement="right"
                      content="Driver"
                    >
                      <PopoverHandler>
                        <svg
                          className={`w-20 h-14 py-3  text-[white] text-white-10  dark:text-white
                          ${
                            pathname == "/DriverAssign" ||
                            pathname == "/DriverProfile" ||
                            pathname == "/ActiveDriver"
                              ? "border-r-2 border-#29303b -mt-1"
                              : "border-b-2"
                          }`}
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            color:
                              pathname == "/DriverAssign" ||
                              pathname == "/DriverProfile" ||
                              pathname == "/ActiveDriver"
                                ? "green"
                                : "white",
                            backgroundColor:
                              pathname == "/DriverAssign" ||
                              pathname == "/DriverProfile" ||
                              pathname == "/ActiveDriver"
                                ? "white"
                                : ""
                          }}
                        >
                          {" "}
                          <path stroke="none" d="M0 0h24v24H0z" />{" "}
                          <circle cx="7" cy="17" r="2" />{" "}
                          <circle cx="17" cy="17" r="2" />{" "}
                          <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                        </svg>
                      </PopoverHandler>
                    </Tooltip>
                    <PopoverContent className="border-none cursor-pointer bg-green z-50">
                      {/* <Link className="w-full text-white" href="/DriverProfile">
                  Driver Profile
                </Link> */}
                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/DriverProfile"
                        style={{
                          color:
                            pathname == "/DriverProfile" ? "black" : "white",
                          backgroundColor:
                            pathname == "/DriverProfile" ? "white" : ""
                        }}
                      >
                        Driver Profile
                      </Link>
                      <br></br>
                      <br></br>
                      {/* <Link href="/Notifications">
                        <Tooltip
                          className="bg-white  text-[#00B56C] shadow-lg rounded"
                          placement="right"
                          content="Notifications"
                        >
                          <svg
                            className={`w-20 h-14 py-3  -my-1      text-white-10  dark:text-white ${
                              session?.userRole === "Controller"
                                ? "border-b-2 border-white"
                                : ""
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              color:
                                pathname == "/Notifications"
                                  ? "green"
                                  : "white",
                              backgroundColor:
                                pathname == "/Notifications" ? "white" : "",
                            }}
                          >
                            {" "}
                            <circle cx="12" cy="12" r="10" />{" "}
                            <polygon points="10 8 16 12 10 16 10 8" />
                          </svg>
                        </Tooltip>
                      </Link> */}
                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/DriverAssign"
                        style={{
                          color:
                            pathname == "/DriverAssign" ? "black" : "white",
                          backgroundColor:
                            pathname == "/DriverAssign" ? "white" : ""
                        }}
                      >
                        Assign Driver
                      </Link>

                      <br></br>
                    </PopoverContent>

                    {/* </Link> */}
                  </Popover>
                )}
              </div>
            )}

            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.immobilising && (
                  <Link href="/Immobilize">
                    <Tooltip
                      className="bg-[#00B56C] text-white rounded shadow-lg"
                      placement="right"
                      content="Immobilize"
                    >
                     <svg
 id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" 

                        className={`w-20 h-14 py-3   text-[white]  text-white-10  dark:text-white  ${
                          pathname == "/Immobilize"
                            ? "border-r-2 #29303b"
                            : "border-b-2"
                        }`}
                        // width="140px"
                        // height="140px"
                        // viewBox="0 0 121.92 73.9"
                        viewBox="0 0 115 80"

                        
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          color: pathname == "/Immobilize" ? "green" : "white",
                          backgroundColor: pathname == "/Immobilize" ? "white" : ""
                        }}
                      >
                        {/*                  
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <g>
                            <path
                              d="M64,48L64,48h-8V32h8c8.836,0,16-7.164,16-16S72.836,0,64,0c-8.837,0-16,7.164-16,16v8H32v-8c0-8.836-7.164-16
 -16-16 S0,7.164,0,16s7.164,16,16,16h8v16h-8l0,0l0,0C7.164,48,0,55.164,0,64s7.164,16,16,16c8.837,0,16-7.164,16-16l0,0v-8h16v7
 .98 c0,0.008-0.001,0.014-0.001,0.02c0,8.836,7.164,16,16,16s16-7.164,16-16S72.836,48.002,64,48z M64,8c4.418,0,8,3.582,8,8 s-3
 .582,8-8,8h-8v-8C56,11.582,59.582,8,64,8z M8,16c0-4.418,3.582-8,8-8s8,3.582,8,8v8h-8C11.582,24,8,20.417,8,16z M16,72 c-4.418,
 0-8-3.582-8-8s3.582-8,8-8l0,0h8v8C24,68.418,20.418,72,16,72z M32,48V32h16v16H32z M64,72c-4.418,0-8-3.582-8-8l0,0v-8 h7.999c4.418,
 0,8,3.582,8,8S68.418,72,64,72z"
                            ></path>
                          </g>
                        </g> */}
                        {/* <defs>
<style>.cls-1{fill:#fff;}</style>
</defs> */}
 <g>
	<path class="st0" d="M67.9,0H28.3L14,15.7l-0.4,0.5h-7c0,0-2.1,0-2.5,2.7c-0.3,1.5,0.3,3,1.5,3.8c1.1,0,2.1,0.1,3.1,0.3
		c1.6,0.3,1.2,1.6,1.2,1.6c-6.2,3.9-9.7,11.3-9.7,11.3L0,65l2.1,2.5h13.4l2.6-6.2h56.5V37c-0.2-1.8,1.2-3.4,3-3.6c0.1,0,0.3,0,0.4,0
		V17l1.3-2.8L67.9,0z M11.3,40C7.2,40,4,38.2,4,36.1s3.3-3.8,7.3-3.8s7.3,1.7,7.3,3.8S15.3,40,11.3,40z M74.3,54.7
		c0,1.7-1.4,3.2-3.1,3.2c0,0,0,0-0.1,0H23.5c-1.7,0-3.1-1.4-3.1-3.2l0,0v-0.6c0-1.7,1.4-3.2,3.1-3.2c0,0,0,0,0,0h47.6
		c1.7,0,3.2,1.4,3.2,3.1c0,0,0,0,0,0L74.3,54.7z M77,19.2H18.6v-2.8l9.6-12.6h39.5L77,16V19.2z"/>
	<path class="st0" d="M118.4,34.7V19.2c0,0-3-13.8-19.6-14c0,0-14.2-0.4-18.7,14l0.2,15.3c0,0-3,1-3.3,3.5v32.7
		c0.1,1.8,1.5,3.1,3.3,3.2c3.1,0.2,38.2,0,38.2,0s3.6-0.8,3.5-4.3V37.3C121.9,37.3,121,34.5,118.4,34.7z M102,61h-5.4l0.8-7.5
		c-1.2-0.6-2-1.8-2.1-3.2c0.3-2.2,2.4-3.7,4.6-3.3c1.7,0.3,3.1,1.6,3.3,3.3c0,1.4-0.8,2.6-2.1,3.2L102,61z M113.1,34.5H84.6V19.2
		c0,0,2.4-9.8,14.8-10.2c0,0,11.6,0.8,13.8,9.3L113.1,34.5z"/>
</g>

                      </svg>
 
                    </Tooltip>
                  </Link>
                )}
              </div>
            )}
          </div>

          <hr></hr>
          <div className="basis-1/1 w-screen  ">
            <nav
              className={`${
                fullparams == "full"
                  ? "hidden"
                  : "flex items-center justify-between  lg:mt-0 md:mt-14 sm:mt-14   flex-wrap bg-green px-5 py-2 sticky top-0 z-10 w-full"
              }`}
              // style={{ height: "7vh" }}
              id="nav_height"
            >
              <div className="flex items-center flex-shrink-0 text-white logo_none">
                <Image
                  src={logo}
                  className="xl:h-12 lg:h-14 lg:w-44 sm:w-24    w-20 h-6   lg:block md:block  "
                  alt=""
                />
              </div>
              <div className="basis-20 py-6  lg:hidden  sticky top-0 sider_bar_hidden">
                <Box>
                  <CssBaseline />
                  <AppBar position="fixed" open={open}>
                    <Toolbar>
                      <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        className="-ms-4"
                      >
                        <MenuIcon />
                      </IconButton>

                      <div className="grid grid-cols-12 h-10 w-full hidden_top_popup">
                        <div className="lg:col-span-10 md:col-span-5 sm:col-span-8 col-span-2 mt-1 logo_top_header">
                          <Image
                            src={logo}
                            className="xl:h-12 lg:h-10 w-32 md:h-12 sm:h-10 h-10 lg:float-left
                    md:float-left sm:float-left
                    lg:mt-0 md:-mt-2 sm:-mt-1 lg:mx-0 md:mx-0 sm:mx-0 mx-auto block  sm:text-center"
                            alt=""
                          />
                        </div>
                        <div className="md:col-span-3 sm:col-span-12 col-span-6 flex items-center md:justify-end sm:justify-end client_name_popup">
                          {session?.clientName}
                        </div>
                        <div className="md:col-span-3 sm:col-span-4 col-span-3 flex items-center text-end md:justify-end sm:justify-center client_name_popup">
                          <BlinkingTime timezone={session?.timezone} />
                        </div>

                        <div className="lg:col-span-2 md:col-span-1 sm:col-span-1 flex justify-end user_icon_top_header">
                          <Popover>
                            <PopoverHandler {...triggers}>
                              {session?.image !== "" &&
                              session?.image !== "null" ? (
                                <img
                                  className="cursor-pointer user_avator_image"
                                  src={session?.image}
                                  alt="Rounded avatar"
                                />
                              ) : (
                                <img
                                  className="cursor-pointer user_avator_image"
                                  src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                                  alt="Rounded avatar"
                                />
                              )}
                            </PopoverHandler>

                            <PopoverContent
                              {...triggers}
                              className="z-50 lg:w-auto md:w-auto w-full"
                            >
                              <div
                                className="grid grid-cols-12 w-full"
                                style={{
                                  display: "flex",
                                  justifyContent: "center"
                                }}
                              >
                                <div className="col-span-9 ms-2 text-lg font-popins text-center text-black">
                                  <p className="text-2xl ">
                                    {session?.FullName}
                                  </p>
                                  {session?.Email}
                                </div>
                              </div>
                              <hr></hr>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center"
                                }}
                                className="py-2 font-popins font-semibold"
                              >
                                {/* <TimeCounter /> */}
                              </div>
                              <Typography
                                variant="small"
                                color="gray"
                                className="font-normal "
                              >
                                <div className="flex justify-center">
                                  <button
                                    className="bg-green shadow-md hover:shadow-gray transition duration-500 cursor px-5 py-2 rounded-lg text-white "
                                    onClick={() => {
                                      signOut();
                                    }}
                                  >
                                    <PowerSettingsNewIcon /> Log Out
                                  </button>
                                </div>
                              </Typography>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </Toolbar>
                  </AppBar>
                  <Drawer
                    sx={{
                      flexShrink: 0,
                      "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box"
                      }
                    }}
                    anchor="left"
                    open={open}
                  >
                    <DrawerHeader>
                      <IconButton onClick={handleDrawerClose}>
                        {theme.direction === "ltr" ? (
                          <ChevronLeftIcon />
                        ) : (
                          <ChevronRightIcon />
                        )}
                      </IconButton>
                    </DrawerHeader>
                    <Divider />
                    <List className="bg-[#29303b] h-screen">
                      <Link href="/liveTracking">
                        <Tooltip
                          className="bg-[#00B56C] text-white shadow-lg rounded"
                          placement="right"
                          content="Live Map"
                        >
                          <svg
                            className="w-20 h-14 py-3 border-y-2 -ms-3 mt-12  text-white text-white-10 dark:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            style={{
                              color:
                                pathname == "/liveTracking" ? "green" : "white",
                              backgroundColor:
                                pathname == "/liveTracking" ? "white" : "",
                              border: pathname == "/liveTracking" ? "none" : ""
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </Tooltip>
                      </Link>
                      <Link href="/journeyReplay" style={{ zIndex: "999" }}>
                        <Tooltip
                          className="bg-[#00B56C] text-white shadow-lg rounded"
                          placement="right"
                          content="Journey Replay"
                        >
                          <svg
                            className={`w-20 h-14 py-3  -my-1  -ms-3  text-white-10  dark:text-white ${
                              session?.userRole === "Controller"
                                ? "border-b-2 border-white"
                                : ""
                            }`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              color:
                                pathname == "/journeyReplay"
                                  ? "green"
                                  : "white",
                              backgroundColor:
                                pathname == "/journeyReplay" ? "white" : ""
                            }}
                          >
                            {" "}
                            <circle cx="12" cy="12" r="10" />{" "}
                            <polygon points="10 8 16 12 10 16 10 8" />
                          </svg>
                        </Tooltip>
                      </Link>
                      {session?.userRole === "Controller" ? null : (
                        <Link href="/Zone">
                          <Tooltip
                            className="bg-[#00B56C] text-white rounded shadow-lg"
                            placement="right"
                            content="Zones"
                          >
                            <svg
                              className="w-20 h-14 py-3  border-y-2  -ms-3 text-[white]  text-white-10  dark:text-white"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                color:
                                  pathname == "/Zone" ||
                                  pathname == "/AddZone" ||
                                  `EditZone?id=${filterId}` ==
                                    `EditZone?id=${pathName}`
                                    ? "green"
                                    : "white",
                                backgroundColor:
                                  pathname == "/Zone" ||
                                  pathname == "/AddZone" ||
                                  `EditZone?id=${filterId}` ==
                                    `EditZone?id=${pathName}`
                                    ? "white"
                                    : "",
                                border:
                                  pathname == "/Zone" ||
                                  pathname == "/AddZone" ||
                                  `EditZone?id=${filterId}` ==
                                    `EditZone?id=${pathName}`
                                    ? "none"
                                    : ""
                              }}
                            >
                              {" "}
                              <path stroke="none" d="M0 0h24v24H0z" />{" "}
                              <circle
                                cx="12"
                                cy="12"
                                r=".5"
                                fill="currentColor"
                              />{" "}
                              <circle cx="12" cy="12" r="7" />{" "}
                              <line x1="12" y1="3" x2="12" y2="5" />{" "}
                              <line x1="3" y1="12" x2="5" y2="12" />{" "}
                              <line x1="12" y1="19" x2="12" y2="21" />{" "}
                              <line x1="19" y1="12" x2="21" y2="12" />
                            </svg>
                          </Tooltip>
                        </Link>
                      )}

                      {(session?.userRole == "SuperAdmin" ||
                        session?.userRole == "Admin") && (
                        <div>
                          {session?.cameraProfile && (
                            <Link href="/DualCam">
                              <Tooltip
                                className="bg-[#00B56C] text-white shadow-lg rounded"
                                placement="right"
                                content="Camera"
                              >
                                <svg
                                  className="w-14 h-12 py-2  text-[white]  text-white-10  dark:text-white cursor-pointer"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                  stroke="currentColor"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  {" "}
                                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                                  <circle cx="6" cy="6" r="2" />{" "}
                                  <circle cx="18" cy="18" r="2" />{" "}
                                  <path d="M11 6h5a2 2 0 0 1 2 2v8" />{" "}
                                  <polyline points="14 9 11 6 14 3" />{" "}
                                  <path d="M13 18h-5a2 2 0 0 1 -2 -2v-8" />{" "}
                                  <polyline points="10 15 13 18 10 21" />
                                </svg>
                              </Tooltip>
                            </Link>
                          )}
                        </div>
                      )}

                      <Link href="/Reports">
                        <Tooltip
                          className="bg-[#00B56C] text-white shadow-lg rounded"
                          placement="right"
                          content="Reports"
                        >
                          <svg
                            className={`w-20 h-14 py-3 border-b-2 -ms-3
                  text-white-10  dark:text-white ${
                    session?.cameraProfile ? "border-y-2" : "border-b-2"
                  }`}
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              color: pathname == "/Reports" ? "green" : "white",
                              backgroundColor:
                                pathname == "/Reports" ? "white" : "",
                              border: pathname == "/Reports" ? "none" : ""
                            }}
                          >
                            <path d="M9 7V2.13a2.98 2.98 0 0 0-1.293.749L4.879 5.707A2.98 2.98 0 0 0 4.13 7H9Z" />
                            <path d="M18.066 2H11v5a2 2 0 0 1-2 2H4v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 20 20V4a1.97 1.97 0 0 0-1.934-2ZM10 18a1 1 0 1 1-2 0v-2a1 1 0 1 1 2 0v2Zm3 0a1 1 0 0 1-2 0v-6a1 1 0 1 1 2 0v6Zm3 0a1 1 0 0 1-2 0v-4a1 1 0 1 1 2 0v4Z" />
                          </svg>
                        </Tooltip>
                      </Link>
                      <Link href="/Notifications">
                        <Tooltip
                          className="bg-white text-[#00B56C] shadow-lg rounded"
                          placement="right"
                          content="Events and Notifications"
                        >
                           <svg
      className={`w-14 h-14 py-3 text-white-10 dark:text-white ${
        pathname === "/Notifications"
          ? "border-r-2 border-#29303b -my-1"
          : "border-y-1 border-b-2"
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        color: pathname === "/Notifications" ? "green" : "white",
        backgroundColor:
          pathname === "/Notifications" ? "white" : "",
      }}
    >
      {/* Bell Icon */}
      <path
        d="M12 22C13.1046 22 14 21.1046 14 20C14 19.4477 13.5523 19 13 19H11C10.4477 19 10 19.4477 10 20C10 21.1046 10.8954 22 12 22ZM18 16V11C18 7.13401 15.866 4 12 4C8.13401 4 6 7.13401 6 11V16L4 18V19H20V18L18 16Z"
      />
      {/* Gear Icon next to Bell */}
      <circle cx="17" cy="7" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M17 4V3M17 10V11M14.5 7.5L13.7 6.7M19.5 7.5L20.3 6.7M14.5 9.5L13.7 10.3M19.5 9.5L20.3 10.3M15 3H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
                        </Tooltip>
                      </Link>
                      
                      <Popover placement="right-start">
                        <Tooltip
                          className="bg-white text-green shadow-lg rounded border-none"
                          placement="right"
                          content="Driver"
                        >
                          <PopoverHandler>
                            <svg
                              className="w-14 h-14 py-3 border-b-2 text-[white] text-white-10  dark:text-white"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              {" "}
                              <path stroke="none" d="M0 0h24v24H0z" />{" "}
                              <circle cx="7" cy="17" r="2" />{" "}
                              <circle cx="17" cy="17" r="2" />{" "}
                              <path d="M5 17h-2v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
                            </svg>
                          </PopoverHandler>
                        </Tooltip>
                        <PopoverContent className="border-none  cursor-pointer bg-green">
                          <span
                            className=" w-full text-white"
                            onClick={() => router.push("/DriverProfile")}
                          >
                            Driver Profile
                          </span>
                          <br></br>
                          <br></br>
                          <span
                            className=" w-full text-white"
                            onClick={() => router.push("/DriverAssign")}
                          >
                            Assign Driver
                          </span>
                          <br></br>
                        </PopoverContent>
                      </Popover>
                      {(session?.userRole == "SuperAdmin" ||
                        session?.userRole == "Admin") && (
                        <div>
                          {session?.immobilising && (
                            <Link href="/Immobilize">
                              <Tooltip
                                className="bg-[#00B56C] text-white shadow-lg rounded"
                                placement="right"
                                content="Immobilize"
                              >
                              <svg
 id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" 

                        className={`w-14 h-14 py-3   text-[white]  text-white-10  dark:text-white  ${
                          pathname == "/Immobilize"
                            ? "border-r-2 #29303b"
                            : "border-b-2"
                        }`}
                        // width="140px"
                        // height="140px"
                        // viewBox="0 0 121.92 73.9"
                        viewBox="0 0 115 80"

                        
                        strokeWidth="5"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          color: pathname == "/Immobilize" ? "green" : "white",
                          backgroundColor: pathname == "/Immobilize" ? "white" : ""
                        }}
                      >
                        {/*                  
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <g>
                            <path
                              d="M64,48L64,48h-8V32h8c8.836,0,16-7.164,16-16S72.836,0,64,0c-8.837,0-16,7.164-16,16v8H32v-8c0-8.836-7.164-16
 -16-16 S0,7.164,0,16s7.164,16,16,16h8v16h-8l0,0l0,0C7.164,48,0,55.164,0,64s7.164,16,16,16c8.837,0,16-7.164,16-16l0,0v-8h16v7
 .98 c0,0.008-0.001,0.014-0.001,0.02c0,8.836,7.164,16,16,16s16-7.164,16-16S72.836,48.002,64,48z M64,8c4.418,0,8,3.582,8,8 s-3
 .582,8-8,8h-8v-8C56,11.582,59.582,8,64,8z M8,16c0-4.418,3.582-8,8-8s8,3.582,8,8v8h-8C11.582,24,8,20.417,8,16z M16,72 c-4.418,
 0-8-3.582-8-8s3.582-8,8-8l0,0h8v8C24,68.418,20.418,72,16,72z M32,48V32h16v16H32z M64,72c-4.418,0-8-3.582-8-8l0,0v-8 h7.999c4.418,
 0,8,3.582,8,8S68.418,72,64,72z"
                            ></path>
                          </g>
                        </g> */}
                        {/* <defs>
<style>.cls-1{fill:#fff;}</style>
</defs> */}
 <g>
	<path class="st0" d="M67.9,0H28.3L14,15.7l-0.4,0.5h-7c0,0-2.1,0-2.5,2.7c-0.3,1.5,0.3,3,1.5,3.8c1.1,0,2.1,0.1,3.1,0.3
		c1.6,0.3,1.2,1.6,1.2,1.6c-6.2,3.9-9.7,11.3-9.7,11.3L0,65l2.1,2.5h13.4l2.6-6.2h56.5V37c-0.2-1.8,1.2-3.4,3-3.6c0.1,0,0.3,0,0.4,0
		V17l1.3-2.8L67.9,0z M11.3,40C7.2,40,4,38.2,4,36.1s3.3-3.8,7.3-3.8s7.3,1.7,7.3,3.8S15.3,40,11.3,40z M74.3,54.7
		c0,1.7-1.4,3.2-3.1,3.2c0,0,0,0-0.1,0H23.5c-1.7,0-3.1-1.4-3.1-3.2l0,0v-0.6c0-1.7,1.4-3.2,3.1-3.2c0,0,0,0,0,0h47.6
		c1.7,0,3.2,1.4,3.2,3.1c0,0,0,0,0,0L74.3,54.7z M77,19.2H18.6v-2.8l9.6-12.6h39.5L77,16V19.2z"/>
	<path class="st0" d="M118.4,34.7V19.2c0,0-3-13.8-19.6-14c0,0-14.2-0.4-18.7,14l0.2,15.3c0,0-3,1-3.3,3.5v32.7
		c0.1,1.8,1.5,3.1,3.3,3.2c3.1,0.2,38.2,0,38.2,0s3.6-0.8,3.5-4.3V37.3C121.9,37.3,121,34.5,118.4,34.7z M102,61h-5.4l0.8-7.5
		c-1.2-0.6-2-1.8-2.1-3.2c0.3-2.2,2.4-3.7,4.6-3.3c1.7,0.3,3.1,1.6,3.3,3.3c0,1.4-0.8,2.6-2.1,3.2L102,61z M113.1,34.5H84.6V19.2
		c0,0,2.4-9.8,14.8-10.2c0,0,11.6,0.8,13.8,9.3L113.1,34.5z"/>
</g>

                      </svg>
                              </Tooltip>
                            </Link>
                          )}
                        </div>
                      )}
                    </List>
                    <Divider />
                  </Drawer>
                </Box>
              </div>
              <div className="grid lg:grid-cols-12 grid-cols-12 lg:gap-5 px-4 header_client_name">
      {/* Client Name */}
      <div className="lg:col-span-2 col-span-12">
        <p className="text-white lg:text-start md:text-start text-center font-popins lg:text-2xl md:text-xl sm:text-md">
          {session?.clientName}
        </p>
      </div>

      {/* Time */}
      <div className="lg:col-span-4 md:col-span-4 sm:col-span-10 col-span-12 lg:mx-0 md:mx-4 sm:mx-4 mx-4 lg:mt-2 flex items-center">
        <a className="text-white text-center font-popins text-xl sm:text-md">
          <BlinkingTime timezone={session?.timezone} />
        </a>
      </div>
      {session?.PortalNotification && ( 
      <div className="relative">
     <BellButton toggleNotifications={toggleNotifications} />
    
      {showNotifications && (
        <NotificationDropdown notifications={notifications} loading={loading} />
      )}
    </div>
 
  )}
                <div className="lg:col-span-2  md:col-span-1 sm:col-span-1 col-span-1  popup_mob_screen">
                  <Popover>
                    {/* <PopoverHandler {...triggers}>
                      <img
                        className=" cursor-pointer lg:mt-0 md:mt-3 sm:mt-3 mt-6 w-14 lg:ms-0  lg:w-10 md:w-10 sm:w-10  h-12 rounded-full"
                        src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                        alt="Rounded avatar"
                      />
                    </PopoverHandler> */}
                    <PopoverHandler {...triggers}>
                      {session?.image !== "" && session?.image !== "null" ? (
                        <img
                          className="cursor-pointer lg:mt-0 md:mt-3 sm:mt-3 mt-6 w-14 lg:ms-0 lg:w-10 md:w-10 sm:w-10 h-12 rounded-full"
                          src={session?.image}
                          alt="Rounded avatar"
                        />
                      ) : (
                        <img
                          className="cursor-pointer lg:mt-0 md:mt-3 sm:mt-3 mt-6 w-14 lg:ms-0 lg:w-10 md:w-10 sm:w-10 h-12 rounded-full"
                          src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                          alt="Rounded avatar"
                        />
                      )}
                    </PopoverHandler>

                    <PopoverContent {...triggers} className="z-50  w-auto">
                      {/* <div className="mb-2 flex items-center gap-3 px-20">
                        <Typography
                          as="a"
                          href="#"
                          variant="h6"
                          color="blue-gray"
                          className="font-medium transition-colors hover:text-gray-900 w-full"
                        >
                          <img
                            className="ms-auto mr-auto mt-5 mb-5 w-10 h-10 rounded-full"
                            src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                            alt="Rounded avatar"
                          />
                        </Typography>
                      </div> */}
                      <div className="grid grid-cols-12">
                        {/* <div className="col-span-2">
                          <img
                            className="mb-5 w-10 lg:h-10 h-10 rounded-full"
                            src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                            alt="Rounded avatar"
                          />
                        </div> */}
                        <div className="col-span-12 ms-2 text-lg font-popins text-start text-black">
                          <p className="text-2xl text-center">
                            {session?.FullName}
                          </p>
                          {session?.Email}
                        </div>
                      </div>
                      <Typography
                        variant="small"
                        color="gray"
                        className="font-normal "
                      >
                        {/* <p className=" mb-3 text-center">{session?.FullName}</p> */}
                        <hr className="text-green w-full"></hr>
                        <p className="text-center pt-2 text-md font-popins font-bold ms-5">
                          {/* login Time: {formatTime(elapsedTime)} */}
                        </p>
                        <div className="flex justify-center">
                          <button
                            className="bg-green shadow-md  hover:shadow-gray transition duration-500 cursor px-5 py-2 rounded-lg text-white mt-5"
                            onClick={() => {
                              signOut();
                            }}
                          >
                            <PowerSettingsNewIcon /> Log Out
                          </button>
                        </div>
                      </Typography>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </nav>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
