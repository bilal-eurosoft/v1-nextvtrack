"use client";
// import { Inter } from "next/font/google";
import logo from "@/../public/Images/logo.png";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
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
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";

import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Typography,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import "./layout.css";
import BlinkingTime from "../General/BlinkingTime";
// const inter = Inter({ subsets: ["latin"] });
import dynamic from "next/dynamic";
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
  /*   const obj = [
    { herf: " /liveTracking", label: "Live-Tracing" },
    { herf: "/journeyReplay", label: "journer-Replay" },
    { herf: " /Zone", label: "Zone" },
  ]; */

  const triggers = {
    onMouseEnter: () => setOpenPopover(true),
    // onMouseLeave: () => setOpenPopover(false),
  };

  const { data: session } = useSession();

  if (!session) {
    router.push("http://localhost:3010/login");
  }

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
  console.log("selectedColor", session);
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
          <div className="basis-20 py-6 bg-[#29303b] h-screen lg:block md:hidden sm:hidden hidden sticky top-0">
            <Link href="/liveTracking">
              <Tooltip
                className="bg-white text-[#00B56C] shadow-lg rounded"
                placement="right"
                content="Live Map"
              >
                <svg
                  className="w-20 h-14 py-3  border-y-2 mt-12  text-[white]  text-white-10 dark:text-white"
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
                  className="w-20 h-14 py-3  -my-1  text-[white]  text-white-10  dark:text-white"
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
                  className="w-20 h-14 py-3  border-y-2   text-[white]  text-white-10  dark:text-white"
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
                  <circle cx="12" cy="12" r=".5" fill="currentColor" />{" "}
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
                    className="w-20 h-12 py-2  text-[white]  text-white-10  dark:text-white cursor-pointer"
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
                <span className=" w-full text-white">Get Image And Video</span>
                <br></br>
                <br></br>
                <span
                  className=" w-full text-white"
                  onClick={() => router.push("http://localhost:3010/DualCam")}
                >
                  View Image And Video
                </span>
                <br></br>
              </PopoverContent>
            </Popover>
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
                className="bg-white text-[#00B56C] shadow-lg rounded"
                placement="right"
                content="Reports"
              >
                <svg
                  className="w-20 h-14 py-3 border-y-2 text-[white] text-white-10  dark:text-white"
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
                    className="w-20 h-14 py-3 border-b-2 text-[white] text-white-10  dark:text-white"
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
                  onClick={() =>
                    router.push("http://localhost:3010/DriverProfile")
                  }
                >
                  Driver Profile
                </span>
                <br></br>
                <br></br>
                <span
                  className=" w-full text-white"
                  onClick={() =>
                    router.push("http://localhost:3010/DriverAssign")
                  }
                >
                  Assign Driver
                </span>
                <br></br>
              </PopoverContent>
            </Popover>
          </div>

          <hr></hr>
          <div className="basis-1/1 w-screen  ">
            <nav className="flex items-center justify-between  lg:mt-0 md:mt-14 sm:mt-14   flex-wrap bg-green px-5 py-2 sticky top-0 z-10 w-full">
              <div className="flex items-center flex-shrink-0 text-white">
                <Image
                  src={logo}
                  className="lg:h-14 lg:w-52 w-20 h-6 lg:block md:block sm:block hidden  "
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
                            onClick={() =>
                              router.push("http://localhost:3010/DualCam")
                            }
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
                            onClick={() =>
                              router.push("http://localhost:3010/DriverProfile")
                            }
                          >
                            Driver Profile
                          </span>
                          <br></br>
                          <br></br>
                          <span
                            className=" w-full text-white"
                            onClick={() =>
                              router.push("http://localhost:3010/DriverAssign")
                            }
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
                style={{ display: "flex", justifyContent: "end" }}
              >
                <div className="lg:col-span-2  col-span-4  lg:mt-1 md:mt-3  sm:mt-3 mt-5 ">
                  <span className="text-black">
                    {" "}
                    &nbsp;
                    <span className="lg:text-1xl text-sm">
                      {" "}
                      <span className="text-white font-popins text-xl pt-6 ">
                        {session?.clientName}
                      </span>
                    </span>
                  </span>
                </div>
                <div className="lg:col-span-4 md:col-span-4 sm:col-span-4 col-span-7 lg:mx-0 md:mx-4 sm:mx-4 mx-4  lg:mt-2 md:mt-4  sm:mt-4 mt-6">
                  <a className=" lg:-mt-0 text-white font-popins text-lg ">
                    <BlinkingTime timezone={session?.timezone} />
                  </a>
                </div>
                <div className="lg:col-span-2 col-span-1">
                  <Popover open={openPopover} handler={setOpenPopover}>
                    <PopoverHandler {...triggers}>
                      <img
                        className=" cursor-pointer lg:mt-0 mt-3 lg:ms-0  lg:w-10  h-10 rounded-full"
                        src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                        alt="Rounded avatar"
                      />
                    </PopoverHandler>
                    <PopoverContent {...triggers} className="z-50 w-80">
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
                        <div className="col-span-3">
                          <img
                            className="ms-auto mr-auto mb-5 w-10 h-10 rounded-full"
                            src="https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                            alt="Rounded avatar"
                          />
                        </div>
                        <div className="col-span-9  text-lg font-popins text-center text-black">
                          <p className="text-2xl">{session?.FullName}</p>
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
                        <div className="flex justify-center">
                          <button
                            className="bg-[#00B56C] px-5 py-2 rounded-lg text-white mt-5"
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
