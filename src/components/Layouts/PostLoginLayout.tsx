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
import { getZoneListByClientId } from "@/utils/API_CALLS";

import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Typography,
  Tooltip,
} from "@material-tailwind/react";
import "./layout.css";
import BlinkingTime from "../General/BlinkingTime";
import { stringify } from "querystring";
// const inter = Inter({ subsets: ["latin"] });
// Example import statement
const drawerWidth = 58;

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export default function RootLayout({
  children,
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
    onClick: handleOpenPopUp,
  };
  type MySessionData = {
    // Define the properties you expect in your session object
  };

  const { data: session }: { data: Session & MySessionData } = useSession();
  const [loginTime, setLoginTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  const fullparams = searchParams.get("screen");
  console.log("fullparams", fullparams);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const timeDifference = currentTime.getTime() - loginTime.getTime();
      setElapsedTime(timeDifference);
    }, 1000);
    return () => clearInterval(interval);
  }, []); // Run effect when loginTime changes

  useEffect(() => {
    const fetchZoneList = async () => {
      if (session) {
        try {
          const allzoneList = await getZoneListByClientId({
            token: session.accessToken,
            clientId: session.clientId,
          });
          setZoneList(allzoneList);
        } catch (error) {
          console.log("Error fetching zone list:", error);
        }
      }
    };

    fetchZoneList();
  }, [session]);

  // const allzoneList = zoneList?.map((item) => {
  //   return item?.id;
  // });
  // console.log("zoneId", allzoneList);
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
        } catch (error) {
          console.log("Error filtering zone ids:", error);
        }
      }
    };

    filterZoneIds();
  }, [zoneList]);

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
                ? "sidebar-hide"
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
                  className="w-20 h-14 py-3 border-y-2 mt-12  text-white text-white-10 dark:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{
                    color: pathname == "/liveTracking" ? "green" : "white",
                    backgroundColor: pathname == "/liveTracking" ? "white" : "",
                    border: pathname == "/liveTracking" ? "none" : "",
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
                    color: pathname == "/journeyReplay" ? "green" : "white",
                    backgroundColor:
                      pathname == "/journeyReplay" ? "white" : "",
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
                    className="w-20 h-14 py-3  border-y-2  text-[white]  text-white-10  dark:text-white"
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
                          : "",
                      border:
                        pathname == "/Zone" ||
                        pathname == "/AddZone" ||
                        `EditZone?id=${filterId}` == `EditZone?id=${pathName}`
                          ? "none"
                          : "",
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
            {/* <Popover placement="right-start">
              <Link href="/DualCam">
                <Tooltip
                  className="bg-white text-green shadow-lg rounded border-none"
                  placement="right"
                  content="Dual Camera"
                >
                  <PopoverHandler>
                    <svg
                      className="w-20 h-12 py-2  text-white-10  dark:text-white cursor-pointer"
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
                        backgroundColor: pathname == "/DualCam" ? "white" : "",
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
                  </PopoverHandler>
                </Tooltip>
                <PopoverContent className="border-none  cursor-pointer bg-green">
                  <span className=" w-full text-white">
                    Get Image And Video
                  </span>
                  <br></br>
                  <br></br>
                  <span
                    className=" w-full text-white"
                    onClick={() => router.push("/DualCam")}
                  >
                    View Image And Video
                  </span>
                  <br></br>
                </PopoverContent>
              </Link>
            </Popover> */}
            {(session?.userRole == "SuperAdmin" ||
              session?.userRole == "Admin") && (
              <div>
                {session?.cameraProfile && (
                  <Popover placement="right-start">
                    {/* <Link href="/DriverProfile"> */}
                    {/* <Link href={pathname ? "/DriverProfile" : "/DriverAssign"}> */}
                    <Tooltip
                      className="bg-[#00B56C] text-white shadow-lg rounded border-none"
                      placement="right"
                      content="Camera"
                    >
                      <PopoverHandler>
                        <svg
                          className="w-20 h-12 py-2  text-white-10  dark:text-white cursor-pointer"
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
                              pathname == "/DualCam" || pathname == "/DualCam"
                                ? "green"
                                : "white",
                            backgroundColor:
                              pathname == "/DualCam" || pathname == "/DualCam"
                                ? "white"
                                : "",

                            border:
                              pathname == "/DualCam" || pathname == "/DualCam"
                                ? "none"
                                : "",
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
                      </PopoverHandler>
                    </Tooltip>
                    <PopoverContent className="border-none cursor-pointer bg-green">
                      {/* <Link className="w-full text-white" href="/DriverProfile">
                  Driver Profile
                </Link> */}
                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/DualCam"
                        style={{
                          color: pathname == "/DualCam" ? "black" : "white",
                          backgroundColor:
                            pathname == "/DualCam" ? "white" : "",
                        }}
                      >
                        Get Image And Video
                      </Link>
                      <br></br>
                      <br></br>

                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/DualCam"
                        // style={{
                        //   color: pathname == "/DualCam" ? "black" : "white",
                        //   backgroundColor: pathname == "/DualCam" ? "white" : "",
                        // }}
                      >
                        View Image And Video
                      </Link>
                      <br></br>
                    </PopoverContent>

                    {/* </Link> */}
                  </Popover>
                )}
              </div>
            )}
            {/* <Link href="/DualCam">
              <Tooltip
                className="bg-white text-[#00B56C] shadow-lg rounded"
                placement="right"
                content="Dual Cam"
              >
                <svg
                  className="w-20 h-12 py-2  text-[white]  text-white-10  dark:text-white"
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
            </Link> */}

            <Link href="/Reports">
              <Tooltip
                className="bg-[#00B56C] text-white shadow-lg rounded"
                placement="right"
                content="Reports"
              >
                <svg
                  className={`w-20 h-14 py-3 border-b-2 
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
                    backgroundColor: pathname == "/Reports" ? "white" : "",
                    border: pathname == "/Reports" ? "none" : "",
                  }}
                >
                  <path d="M9 7V2.13a2.98 2.98 0 0 0-1.293.749L4.879 5.707A2.98 2.98 0 0 0 4.13 7H9Z" />
                  <path d="M18.066 2H11v5a2 2 0 0 1-2 2H4v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 20 20V4a1.97 1.97 0 0 0-1.934-2ZM10 18a1 1 0 1 1-2 0v-2a1 1 0 1 1 2 0v2Zm3 0a1 1 0 0 1-2 0v-6a1 1 0 1 1 2 0v6Zm3 0a1 1 0 0 1-2 0v-4a1 1 0 1 1 2 0v4Z" />
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
                      className="bg-[#00B56C] text-white shadow-lg rounded border-none"
                      placement="right"
                      content="Driver"
                    >
                      <PopoverHandler>
                        <svg
                          className="w-20 h-14 py-3 border-b-2 text-[white] text-white-10  dark:text-white"
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
                                : "",

                            border:
                              pathname == "/DriverAssign" ||
                              pathname == "/DriverProfile" ||
                              pathname == "/ActiveDriver"
                                ? "none"
                                : "",
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
                    <PopoverContent className="border-none cursor-pointer bg-green">
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
                            pathname == "/DriverProfile" ? "white" : "",
                        }}
                      >
                        Driver Profile
                      </Link>
                      <br></br>
                      <br></br>

                      <Link
                        className="w-full text-white m-0 px-4 py-2 font-popins font-bold rounded-sm p-1 shadow-md"
                        href="/DriverAssign"
                        style={{
                          color:
                            pathname == "/DriverAssign" ? "black" : "white",
                          backgroundColor:
                            pathname == "/DriverAssign" ? "white" : "",
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
          </div>

          <hr></hr>
          <div className="basis-1/1 w-screen">
            <nav
              className={
                fullparams == "full"
                  ? "sidebar-hide"
                  : "flex items-center justify-between  lg:mt-0 md:mt-14 sm:mt-14   flex-wrap bg-green px-5 py-2 sticky top-0 z-10 w-full"
              }
              // style={{ height: "7vh" }}
              id="nav_height"
            >
              <div className="flex items-center flex-shrink-0 text-white">
                <Image
                  src={logo}
                  className="xl:h-12 lg:h-14 lg:w-44 w-20 h-6   lg:block md:block sm:block hidden  "
                  alt=""
                />
              </div>

              <div className="basis-20 py-6  lg:hidden  sticky top-0">
                <Box>
                  <CssBaseline />
                  <AppBar position="fixed" open={open}>
                    <Toolbar>
                      <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                      >
                        <MenuIcon />
                      </IconButton>
                    </Toolbar>
                  </AppBar>
                  <Drawer
                    sx={{
                      flexShrink: 0,
                      "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                      },
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
                          className="bg-white text-[#00B56C]  shadow-lg rounded"
                          placement="right"
                          content="Live Map"
                        >
                          <svg
                            className="w-14 h-14 py-3   border-y-2 mt-12  text-[white]  text-white-10 dark:text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
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
                      <Link href="/journeyReplay">
                        <Tooltip
                          className="bg-white text-[#00B56C] shadow-lg rounded"
                          placement="right"
                          content="Journey Replay"
                        >
                          <svg
                            className="w-14 h-14 py-3  -my-1  text-[white]  text-white-10  dark:text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {" "}
                            <circle cx="12" cy="12" r="10" />{" "}
                            <polygon points="10 8 16 12 10 16 10 8" />
                          </svg>
                        </Tooltip>
                      </Link>
                      <Link href="/Zone">
                        <Tooltip
                          className="bg-white text-[#00B56C] rounded shadow-lg"
                          placement="right"
                          content="Zone"
                        >
                          <svg
                            className="w-14 h-14 py-3  border-y-2   text-[white]  text-white-10  dark:text-white"
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

                      <Popover placement="right-start">
                        <Tooltip
                          className="bg-white text-green shadow-lg rounded border-none"
                          placement="right"
                          content="Dual Camera"
                        >
                          <PopoverHandler>
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
                          </PopoverHandler>
                        </Tooltip>
                        <PopoverContent className="border-none  cursor-pointer bg-green">
                          <span className=" w-full text-white">
                            Get Image And Video
                          </span>
                          <br></br>
                          <br></br>
                          <span
                            className=" w-full text-white"
                            onClick={() => router.push("/DualCam")}
                          >
                            View Image And Video
                          </span>
                          <br></br>
                        </PopoverContent>
                      </Popover>

                      <Link href="/Reports">
                        <Tooltip
                          className="bg-white text-[#00B56C] shadow-lg rounded"
                          placement="right"
                          content="Reports"
                        >
                          <svg
                            className="w-14 h-14 py-3 border-y-2 text-[white] text-white-10  dark:text-white"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 7V2.13a2.98 2.98 0 0 0-1.293.749L4.879 5.707A2.98 2.98 0 0 0 4.13 7H9Z" />
                            <path d="M18.066 2H11v5a2 2 0 0 1-2 2H4v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 20 20V4a1.97 1.97 0 0 0-1.934-2ZM10 18a1 1 0 1 1-2 0v-2a1 1 0 1 1 2 0v2Zm3 0a1 1 0 0 1-2 0v-6a1 1 0 1 1 2 0v6Zm3 0a1 1 0 0 1-2 0v-4a1 1 0 1 1 2 0v4Z" />
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
                    </List>
                    <Divider />
                  </Drawer>
                </Box>
              </div>

              <div
                className="grid lg:grid-cols-12 grid-cols-12  lg:gap-5 "
                style={{
                  display: "flex",
                  justifyContent: "end",
                  alignItems: "center",
                }}
              >
                <div className="lg:col-span-2  col-span-4  lg:mt-1 md:mt-3  sm:mt-3 mt-5 ">
                  <span className="text-black">
                    {" "}
                    &nbsp;
                    <span className="lg:text-1xl text-sm">
                      {" "}
                      <p className="text-white font-popins  text-2xl -mt-5 ">
                        {session?.clientName}
                      </p>
                    </span>
                  </span>
                </div>
                <div className="lg:col-span-4 md:col-span-4 sm:col-span-4 col-span-7 lg:mx-0 md:mx-4 sm:mx-4 mx-4  lg:mt-2 md:mt-4  sm:mt-4 mt-6">
                  <a className=" lg:-mt-0 text-white font-popins text-xl ">
                    <BlinkingTime timezone={session?.timezone} />
                  </a>
                </div>
                <div className="lg:col-span-2 col-span-1">
                  <Popover>
                    <PopoverHandler {...triggers}>
                      <img
                        className=" cursor-pointer lg:mt-0 md:mt-3 sm:mt-3 mt-6 w-14 lg:ms-0  lg:w-10 md:w-10 sm:w-10  h-12 rounded-full"
                        src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                        alt="Rounded avatar"
                      />
                    </PopoverHandler>
                    <PopoverContent
                      {...triggers}
                      className="z-50  lg:w-auto md:w-auto w-full"
                    >
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
                      <div className="grid grid-cols-12 w-full">
                        <div className="col-span-2">
                          <img
                            className="mb-5 w-10 lg:h-10 h-10 rounded-full"
                            src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                            alt="Rounded avatar"
                          />
                        </div>
                        <div className="col-span-9 ms-2 text-lg font-popins text-start text-black">
                          <p className="text-2xl text-start">
                            {session?.FullName}
                          </p>
                          {session?.Email}
                        </div>
                      </div>
                      <hr></hr>
                      <div
                        style={{ display: "flex", justifyContent: "center" }}
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
                            className="bg-green shadow-md  hover:shadow-gray transition duration-500 cursor px-5 py-2 rounded-lg text-white "
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
