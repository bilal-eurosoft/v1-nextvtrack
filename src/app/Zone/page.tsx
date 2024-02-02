"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import Link from "next/link";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Toaster, toast } from "react-hot-toast";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from "@mui/icons-material/AddBox";
import {
  getZoneListByClientId,
  modifyCollectionStatus,
  zonevehicleByZoneId,
  zoneRuleDeleteByZoneId,
  zoneDelete,
  alertSettingCountZone,
  zonenamesearch,
} from "@/utils/API_CALLS";
import { zonelistType } from "@/types/zoneType";
import "./zone.css";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 50,
    },
  },
};

export default function Zone() {
  const [filter, setFilter] = useState<any>("");
  const [filteredItems, setFilteredItems] = useState([]);
  const { data: session } = useSession();
  const [zoneList, setZoneList] = useState<zonelistType[]>([]);
  const [initialzoneList, setInitialZoneList] = useState<zonelistType[]>([]);
  const [selectedZoneTypeCircle, setselectedZoneTypeCircle] =
    useState<any>(false);
  const [selectedZoneTypPolyGone, setselectedZoneTypePolyGone] =
    useState<any>(false);

  // pagination work
  const [input, setInput] = useState<any>("");
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [filteredZones, setFilteredZones] = useState<zonelistType[]>([]);
  const [selectedZones, setSelectedZones] = useState<zonelistType[]>([]);
  const [liveSearchZoneName, setLiveSearchZoneName] = useState<
    string[] | undefined
  >([]);
  const [searchCriteria, setSearchCriteria] = useState<any>({
    zoneName: "",
    zoneShortName: "",
    GeoFenceType: "",
    zoneType: "",
  });
  const [rowsPerPage, setRowsPerPage] = useState<any>(10);
  const totalPages = Math.ceil(zoneList.length / rowsPerPage);

  const [filterZonepage, setFilterZonePage] = useState(1);
  const [filterZonePerPage, setfilterZonePerPage] = useState(10);
  const [filteredDataIsNotAvaialable, setFilteredDataIsNotAvaialable] =
    useState<boolean>(true);
  const lastIndexFilter = filterZonePerPage * filterZonepage;
  const firstIndexFilter = lastIndexFilter - filterZonePerPage;
  let filterZoneResult;
  filterZoneResult = filteredZones.slice(firstIndexFilter, lastIndexFilter);
  const totalPagesFilter = Math.ceil(filteredZones.length / filterZonePerPage);

  const handleClickPagination = () => {
    setCurrentPage(input);
  };

  const allZone = async () => {
    if (session) {
      const allzoneList = await getZoneListByClientId({
        token: session?.accessToken,
        clientId: session?.clientId,
      });
      setZoneList(allzoneList);
      setInitialZoneList(allzoneList);
    }
  };

  useEffect(() => {
    allZone();
  }, []);

  // }, []);

  const router = useRouter();
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  let displayedData;
  displayedData = zoneList.slice(startIndex, endIndex);
  function handleSearchClick(e: any) {
    e.preventDefault();
    const { zoneName, zoneShortName, GeoFenceType, zoneType } = searchCriteria;
    if (zoneName || zoneShortName || GeoFenceType || zoneType) {
      const filteredZone = zoneList.filter((zone) => {
        return (
          (zoneName === "" ||
            zone.zoneName.toLowerCase().includes(zoneName.toLowerCase())) &&
          (zoneShortName === "" ||
            (zone.zoneShortName &&
              zone.zoneShortName
                .toLowerCase()
                .includes(zoneShortName.toLowerCase()))) &&
          (GeoFenceType === "" ||
            (zone.GeoFenceType !== undefined &&
              zone.GeoFenceType.toLowerCase() ===
                GeoFenceType.toLowerCase())) &&
          (zoneType === "" ||
            (zone.zoneType !== undefined &&
              zone.zoneType.toLowerCase() === zoneType.toLowerCase()))
        );
      });

      if (filteredZone.length > 0) {
        setFilteredDataIsNotAvaialable(true);
        setFilteredZones(filteredZone);
      } else {
        displayedData = [];
        setFilteredDataIsNotAvaialable(false);
        setFilteredZones([]);
        filterZoneResult = [];
      }
    }
  }

  const handlePageChangeFiter = (event: any, newPage: any) => {
    setFilterZonePage(newPage);
    setCurrentPage(newPage);
  };

  const handleClickPaginationFilter = (event: any) => {
    setFilterZonePage(input);
  };

  const handleChangeRowsPerPageFilter = (event: any) => {
    setfilterZonePerPage(event.target.value);
    setCurrentPage(event.target.value);
    setFilterZonePage(event.target.value);
  };
  const handlePageChange = (event: any, newPage: any) => {
    setCurrentPage(newPage);
    setFilterZonePage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(event.target.value);
    setCurrentPage(1);
  };

  const handleClick = () => {
    router.push("/AddZone");
  };

  const handleClickZoneType = (zoneTypecheck: string) => {
    if (zoneTypecheck === "Circle") {
      setselectedZoneTypeCircle(true);
      setselectedZoneTypePolyGone(false);
      setSearchCriteria({
        ...searchCriteria,
        zoneType: "Circle",
      });
    } else if (zoneTypecheck === "Polygon") {
      setselectedZoneTypeCircle(false);
      setselectedZoneTypePolyGone(true);
      setSearchCriteria({
        ...searchCriteria,
        zoneType: "Polygon",
      });
    }
  };

  const handleClear = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSearchCriteria({
      zoneName: "",
      zoneShortName: "",
      GeoFenceType: "",
      zoneType: "",
    });
    setFilteredDataIsNotAvaialable(true);
    setselectedZoneTypeCircle(false);
    setselectedZoneTypePolyGone(false);
    setSelectedZones([]);
    setInput("");
    setFilterZonePage(1);
    setRowsPerPage(10);
    setFilteredZones(initialzoneList);
    setCurrentPage(1);
  };

  function handleCheckboxChange(zone: zonelistType) {
    const isChecked = selectedZones.some(
      (selectedZone) => selectedZone.id === zone.id
    );

    if (isChecked) {
      setSelectedZones((prevSelectedZones) =>
        prevSelectedZones.filter((selectedZone) => selectedZone.id !== zone.id)
      );
    } else {
      setSelectedZones((prevSelectedZones) => [...prevSelectedZones, zone]);
    }
  }
  async function handleLiveSearchChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setSearchCriteria({
      ...searchCriteria,
      zoneName: e.target.value,
    });
    let searchTerm = e.target.value;

    let query = searchTerm.toUpperCase();
    let filter = { zoneName: { $regex: query } };

    if (session) {
      try {
        let filterByZoneName = await zonenamesearch({
          token: session.accessToken,
          clientId: session.clientId,
          filter: filter,
        });

        if (Array.isArray(filterByZoneName)) {
          const zoneNames = filterByZoneName.map(
            (zone: { zoneName: string }) => zone.zoneName
          );
          setLiveSearchZoneName(zoneNames);
        } else {
          console.error("Invalid API response:", filterByZoneName);
          setLiveSearchZoneName([]);
        }
      } catch (error) {
        console.error("Error fetching live search results:", error);
        setLiveSearchZoneName([]);
      }
    }
  }

  async function deleteSelectedZones(zoneId: any) {
    try {
      // Show a custom confirmation toast with "OK" and "Cancel" buttons
      const { id } = toast.custom((t) => (
        <div className="bg-white p-2 rounded-md">
          <p>Are you sure you want to delete this zone?</p>
          <button
            onClick={() => {
              // Perform the actual delete action
              zoneDelete({
                token: session?.accessToken,
                id: zoneId,
              });

              // Dismiss the confirmation toast
              toast.dismiss(id);

              // Show a success toast
              toast.success("Zone deleted successfully!", {
                duration: 3000,
                position: "top-center",
              });
            }}
            className="text-green pr-5 font-popins font-bold"
          >
            OK
          </button>
          <button
            onClick={() => {
              // Dismiss the confirmation toast without deleting
              toast.dismiss(id);

              // Optionally, you can show a cancellation message
              toast("Deletion canceled", {
                duration: 3000,
                position: "top-center",
              });
            }}
            className="text-red font-popins font-bold"
          >
            Cancel
          </button>
        </div>
      ));
    } catch (error) {
      // Show an error toast
      toast.error("Failed to delete zone", {
        duration: 3000,
        position: "top-center",
      });
      console.log(error);
    }
  }
  allZone();

  // async function deleteSelectedZones(zoneId: any) {
  // try {
  //   await zoneDelete({
  //     token: session?.accessToken,
  //     id: zoneId,
  //   });
  // } catch (error) {
  //   console.log(error);
  // }
  // allZone();

  // try {
  //   if (session) {
  //     const zoneIdsToDelete = selectedZones.map((zone) => zone.id);
  //     const deletePromises = [];
  //     for (const zoneId of zoneIdsToDelete) {
  //       const alertPromise = await alertSettingCountZone({
  //         token: session.accessToken,
  //         clientId: session.clientId,
  //         zoneId: zoneId,
  //       });
  //       const zoneDeletePromise = await zoneDelete({
  //         token: session.accessToken,
  //         id: zoneId,
  //       });
  //       const zoneRuleDeletePromise = await zoneRuleDeleteByZoneId({
  //         token: session.accessToken,
  //         id: zoneId,
  //       });
  //       const zoneVehicleDeletePromise = await zonevehicleByZoneId({
  //         token: session.accessToken,
  //         zoneId,
  //       });
  //       const modifyCollectionStatusPromise = await modifyCollectionStatus({
  //         token: session.accessToken,
  //         collectionName: "zones",
  //       });
  //       deletePromises.push(
  //         alertPromise,
  //         zoneDeletePromise,
  //         zoneRuleDeletePromise,
  //         zoneVehicleDeletePromise,
  //         modifyCollectionStatusPromise
  //       );
  //     }
  //     const loadingToast = await toast.loading("Deleting zones...");
  //     const responses = await Promise.all(deletePromises);
  //     toast.dismiss(loadingToast);
  //     const allSuccess = responses.every((response) => response.id !== null);
  //     if (allSuccess) {
  //       toast.success("Zones deleted successfully!");
  //     } else {
  //       toast.error("Error deleting zones. Please try again.");
  //     }
  //     const newZoneList = await getZoneListByClientId({
  //       token: session.accessToken,
  //       clientId: session.clientId,
  //     });
  //     setZoneList(newZoneList);
  //     setFilteredZones(newZoneList);
  //     setSelectedZones([]);
  //   }
  // } catch (error) {
  //   console.error("Error deleting selected zones:", error);
  //   toast.error("An error occurred while deleting zones.");
  // }
  // }
  const [checkBox, setcheckBox] = useState(false);
  const handleCheck = () => {
    setcheckBox(!checkBox);
  };

  return (
    <div className=" bg-bgLight border-t border-bgLight ">
      <p className="bg-green px-4 py-1 text-black text-center text-2xl text-white font-bold">
        Zones
      </p>
      <form className=" lg:w-full w-screen bg-bgLight lg:-ms-0 -ms-1">
        <div className="grid lg:grid-cols-2 md:grid-cols-2  gap-6 pt-5 px-5  ">
          <div className="lg:col-span-1">
            <label className="text-md font-popins text-black font-medium">
              Zone Name
            </label>
            {/* <select
              className=" px-2 py-1 mt-2 w-full text-sm text-black bg-white-10  border border-grayLight px-3 outline-green text-gray"
              id="selectBox"
              value={searchCriteria.zoneName}
              onChange={(e) =>
                setSearchCriteria({
                  ...searchCriteria,
                  zoneName: e.target.value,
                })
              }
            >
              <option value=""> select Sort Name</option>
              {[...zoneList]
                .sort((a, b) => a.zoneName.localeCompare(b.zoneName))
                .map((item, index) => (
                  <option className="hover:bg-green" key={index}>
                    {item.zoneName}
                  </option>
                ))}
            </select> */}
            <Select
              value={searchCriteria.zoneName}
              onChange={(e) =>
                setSearchCriteria({
                  ...searchCriteria,
                  zoneName: e.target.value,
                })
              }
              MenuProps={MenuProps}
              name="VehicleReg"
              id="select_box_journey"
              displayEmpty
              className="h-8 text-sm text-gray  w-full  outline-green"
            >
              <MenuItem value="" disabled selected hidden className="text-sm">
                Zone Name
              </MenuItem>
              {[...zoneList]
                .sort((a, b) => a.zoneName.localeCompare(b.zoneName))
                .map((item, index) => (
                  <MenuItem
                    key={index}
                    value={item.zoneName}
                    className="hover:bg-green hover:text-white"
                  >
                    {item.zoneName}
                  </MenuItem>
                ))}
            </Select>
          </div>
          <div className="lg:col-span-1 md:col-span-1 col-span-1">
            <label className="text-md font-popins text-black font-medium">
              Zone Short Name
            </label>
            {/* <input
              type="text"
              name="zoneShortName"
              className="block py-1 mt-2 px-0 w-full text-sm text-black bg-white-10 border border-grayLight appearance-none px-3 text-gray dark:border-gray-600 dark:focus:border-blue-500 outline-green"
              placeholder="Enter Zone Short Name"
              value={searchCriteria.zoneShortName}
              onChange={(e) =>
                setSearchCriteria({
                  ...searchCriteria,
                  zoneShortName: e.target.value,
                })
              }
            /> */}
            <Select
              value={searchCriteria.zoneShortName}
              onChange={(e) =>
                setSearchCriteria({
                  ...searchCriteria,
                  zoneShortName: e.target.value,
                })
              }
              MenuProps={MenuProps}
              name="VehicleReg"
              id="select_box_journey"
              displayEmpty
              className="h-8 text-sm text-gray  w-full  outline-green"
            >
              <MenuItem value="" disabled selected hidden className="text-sm">
                Zone Name
              </MenuItem>
              {[...zoneList]
                .sort((a, b) =>
                  a?.zoneShortName?.localeCompare(b?.zoneShortName)
                )
                .map((item, index) => (
                  <MenuItem
                    key={index}
                    value={item.zoneShortName}
                    className="hover:bg-green hover:text-white"
                  >
                    {item.zoneShortName}
                  </MenuItem>
                ))}
            </Select>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 md:grid-cols-2 mb-3   gap-6 pt-5 px-5 bg-green-50 ">
          <div className="lg:col-span-1">
            <label className="text-md font-popins text-black font-medium">
              Geofence
            </label>
            {/* <select
              className="block mt-2 py-1 px-0 w-full text-sm text-gray bg-white-10 border border-grayLight px-3 dark:border-gray-600 dark:focus:border-blue-500 outline-green mb-5"
              name="GeoFenceType"
              onChange={(e) =>
                setSearchCriteria({
                  ...searchCriteria,
                  GeoFenceType: e.target.value,
                })
              }
              value={searchCriteria.GeoFenceType}
            >
              <option value="" disabled selected hidden className="text-sm">
                Select Geofence Type
              </option>
              <option value="On-Site" className="text-sm">
                On-Site
              </option>
              <option value="Off-Site" className="text-sm">
                Off-Site
              </option>
              <option value="City-Area" className="text-sm">
                City-Area
              </option>
              <option value="Restricted-Area" className="text-sm">
                Restricted-Area
              </option>
            </select> */}
            <Select
              onChange={(e) =>
                setSearchCriteria({
                  ...searchCriteria,
                  GeoFenceType: e.target.value,
                })
              }
              value={searchCriteria.GeoFenceType}
              MenuProps={MenuProps}
              name="VehicleReg"
              id="select_box_journey"
              displayEmpty
              className="h-8 text-sm text-gray  w-full  outline-green "
            >
              <MenuItem
                className="hover:bg-green hover:text-white text-sm"
                value=""
                disabled
                selected
                hidden
              >
                Select Geofence Type
              </MenuItem>
              <MenuItem
                className="hover:bg-green hover:text-white text-sm"
                value="On-Site"
              >
                On-Site
              </MenuItem>
              <MenuItem
                className="hover:bg-green hover:text-white text-sm"
                value="Off-Site"
              >
                Off-Site
              </MenuItem>
              <MenuItem
                className="hover:bg-green hover:text-white text-sm"
                value="City-Area"
              >
                City-Area
              </MenuItem>
              <MenuItem
                value="Restricted-Area"
                className="hover:bg-green hover:text-white text-sm"
              >
                Restricted-Area
              </MenuItem>
            </Select>
          </div>

          <div
            id="zoneType"
            className="lg:col-span-1 md:col-span-1 col-span-1  text-black "
          >
            <label className="text-md font-popins text-black font-medium">
              Zone Type
            </label>
            <br></br>
            <span
              id="Circle"
              className={`inline-flex items-center mt-2 border rounded-md border-grayLight px-2 h-8 text-md font-popins text-black font-medium cursor-pointer shadow-md hover:shadow-gray transition duration-500 cursor-pointer  ${
                selectedZoneTypeCircle && "bg-green text-white "
              } transition duration-300`}
              onClick={() => handleClickZoneType("Circle")}
              // title="Click to select Circle"
            >
              <RadioButtonUncheckedIcon
                className="mr-2"
                style={{ color: "red !important" }}
              />{" "}
              Circle
            </span>

            <span
              id="Polygon"
              className={`inline-flex items-center mt-2 border rounded-md border-grayLight px-2 h-8 text-md font-popins text-black font-medium cursor-pointer shadow-md hover:shadow-gray transition duration-500 cursor-pointer mx-5  ${
                selectedZoneTypPolyGone && "bg-green text-white"
              } transition duration-300`}
              onClick={() => handleClickZoneType("Polygon")}
              // title="Click to select Polygon"
            >
              <RadioButtonUncheckedIcon className="mr-2" /> Polygon
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 md:grid-cols-2  sm:grid-cols-2 grid-cols-2 px-5 lg:mt-0 mt-5">
          <div className="lg:col-span-1 md:col-span-1 sm:col-span-1   col-span-2">
            <div className="grid xl:grid-cols-7 lg:grid-cols-4  md:grid-cols-3 grid-cols-2">
              <div className="grid  rounded-md lg:grid-cols-3 md:grid-cols-4 grid-cols-5 bg-green shadow-md  hover:shadow-gray transition duration-500 cursor-pointer">
                <div className="lg:col-span-1 md:col-span-1 sm:col-span-2  col-span-2">
                  <svg
                    className="h-11 py-3 w-full text-white"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {" "}
                    <path stroke="none" d="M0 0h24v24H0z" />{" "}
                    <circle cx="10" cy="10" r="7" />{" "}
                    <line x1="21" y1="21" x2="15" y2="15" />
                  </svg>
                </div>

                <div className="lg:col-span-1 md:col-span-2 sm:col-span-1 col-span-1 text-center">
                  <button
                    className="text-white font-popins font-bold text-start pt-1 h-10 bg-green text-md "
                    type="button"
                    onClick={handleSearchClick}
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="grid  rounded-md  xl:grid-cols-3 lg:grid-cols-5 md:ps-3 ms-4 md:grid-cols-4 grid-cols-5 bg-white shadow-md hover:shadow-gray transition duration-500 cursor-pointer">
                <div className="xl:col-span-1 lg:col-span-2 md:col-span-1 sm:col-span-2  col-span-2">
                  <svg
                    className="h-11 py-3 w-full text-labelColor"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="4"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <div className="lg:col-span-1 md:col-span-2 sm:col-span-1 col-span-1 text-center">
                  <button
                    className="text-black font-popins font-bold text-start pt-1 h-10 bg-white text-md "
                    type="button"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* <div className="grid rounded-md lg:grid-cols-2 lg:grid-cols-4 grid-cols-5 bg-zonebtnColor shadow-md ms-3 hover:shadow-gray transition duration-500 cursor-pointer">
                <div className="lg:col-span-2   md:col-span-2 col-span-3">
                  <svg
                    className="h-11 py-3 w-full text-labelColor"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="4"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="lg:col-span-1 md:col-span-1  col-span-1 pt-1">
                  <button
                    className="text-labelColor font-popins font-bold text-md  h-10 lg:-ms-2 -ms-6"
                    type="button"
                    onClick={handleClear}
                  >
                    Clear
                  </button>
                </div>
              </div> */}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div className="rounded-md  grid grid-cols-3 bg-green mb-5 mt-2 lg:w-auto shadow-md w-48  hover:shadow-gray transition duration-500">
              <div className="col-span-1">
                <svg
                  className="h-11 py-3 w-full text-white "
                  width="24"
                  viewBox="0 0 24 24"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="12" y1="9" x2="12" y2="15" />
                </svg>
              </div>
              <div className="col-span-2 pt-1">
                <button
                  className="text-white  font-popins font-bold -ms-2 h-10 bg-[#00B56C] px-2 text-md  "
                  onClick={handleClick}
                >
                  Add Zone
                </button>
              </div>
            </div>
          </div>
          {/* <div className="lg:col-span-1 md:col-span-1  col-span-2 lg:mt-0 md:mt-0 mt-3  flex justify-end mb-5">
            <div
              className="grid lg:grid-cols-3 md:grid-cols-3  grid-cols-2 cursor-pointer  "
              onClick={handleClick}
            >
              <div className="grid lg:grid-cols-2 md:grid-cols-4 grid-cols-5 bg-green shadow-md hover:shadow-gray transition duration-500">
                <div className="lg:col-span-1 md:col-span-2 col-span-3">
                  <AddBoxIcon className="mx-3" />
                </div>
                <div className="col-span-1">
                  <button className="text-white font-popins font-bold  h-10 bg-[#00B56C] -ms-6 text-md ">
                    AddZone
                  </button>
                </div>
              </div>

          
            </div>
          </div> */}
        </div>
      </form>

      <div className="shadow-md mx-2  " style={{ position: "relative" }}>
        <TableContainer component={Paper}>
          {/* <p className="bg-green px-4 py-1 text-white font-bold lg:w-full w-screen ">
            ZoneTitle
          </p> */}
          <div style={{ overflowY: "scroll" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead className="sticky top-0 bg-green text-white font-medium">
                <TableRow className="bg-green text-white font-medium   ">
                  {/* <TableCell className="w-4 h-4 border-r border-green">
                    <input
                      id="checkbox-all-search"
                      type="checkbox"
                      style={{ accentColor: "green", boxShadow: "none" }}
                      onChange={handleCheck}
                      className="w-4 h-4 text-blue-600 border-r border-green bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 border-r border-grayLight "
                    />
                  </TableCell> */}
                  <TableCell
                    align="left"
                    className="border-r border-green text-white font-popins font-medium "
                    style={{ fontSize: "20px" }}
                  >
                    Zone Name
                  </TableCell>
                  <TableCell
                    align="left"
                    className="border-r border-green text-white font-popins font-medium "
                    style={{ fontSize: "20px" }}
                  >
                    Zone Sort Name
                  </TableCell>
                  <TableCell
                    align="left"
                    className="border-r border-green text-white font-popins font-medium "
                    style={{ fontSize: "20px" }}
                  >
                    Zone Type
                  </TableCell>
                  <TableCell
                    align="left"
                    className="border-r border-green text-center text-white font-popins font-medium "
                    style={{ fontSize: "20px" }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filterZoneResult.length > 0 ? (
                  <>
                    {" "}
                    {filterZoneResult.map((item: zonelistType, index) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer hover:bg-[#e2f6f0]"
                      >
                        {/* <TableCell
                          align="left"
                          className="w-4 h-4 border-r border-green"
                        >
                          <input
                            id={`checkbox-table-search-${item.id}`}
                            style={{ accentColor: "green", boxShadow: "none" }}
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            checked={
                              selectedZones.some(
                                (selectedZone) => selectedZone.id === item.id
                              ) || checkBox
                            }
                            onChange={() => handleCheckboxChange(item)}
                          />
                          <label className="sr-only  text-labelColor text-md font-normal">
                            checkbox
                          </label>
                        </TableCell> */}
                        <TableCell
                          align="left"
                          className="border-r border-green  font-popins text-black font-normal"
                          style={{ fontSize: "16px" }}
                        >
                          {item.zoneName}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="border-r border-green  font-popins text-black font-normal"
                          style={{ fontSize: "16px" }}
                        >
                          {item.zoneShortName}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="border-r border-green  font-popins text-black font-normal"
                          style={{ fontSize: "16px" }}
                        >
                          {item.zoneType}
                        </TableCell>
                        <TableCell
                          align="center" // Set align to center
                          className="border-r border-green font-popins text-black font-normal"
                        >
                          <Link href={`/EditZone?id=${item.id}`}>
                            <BorderColorIcon
                              style={{ marginTop: "-2%" }}
                              className="text-white bg-green  p-1 h-7 w-8  rounded-md shadow-md hover:shadow-gray transition duration-500 "
                            />
                          </Link>
                          <button
                            // style={{ marginLeft: "73%" }}
                            className="icon_delete_edit"
                            onClick={() => deleteSelectedZones(item.id)}
                          >
                            <DeleteIcon
                              className="text-white bg-red p-1 h-7 w-8 rounded-md shadow-md hover:shadow-gray transition duration-500 "
                              style={{ marginTop: "-18%", marginLeft: "20%" }}
                            />
                          </button>

                          {/* <BorderColorIcon
                            onClick={deleteSelectedZones}
                        
                          /> */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : filteredDataIsNotAvaialable === false ? (
                  <>
                    <p>No data found</p>
                  </>
                ) : (
                  <>
                    {displayedData.map((item: any, index) => (
                      <TableRow
                        key={index}
                        className="cursor-pointer hover:bg-[#e2f6f0]"
                      >
                        {/* <TableCell
                          align="left"
                          className="w-4 h-4 border-r border-green"
                        >
                          <input
                            id="checkbox-all-search"
                            type="checkbox"
                            style={{ accentColor: "green", boxShadow: "none" }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 border-r border-grayLight cursor-pointer"
                            checked={
                              selectedZones.some(
                                (selectedZone) => selectedZone.id === item.id
                              ) || checkBox
                            }
                            onChange={() => handleCheckboxChange(item)}
                          />
                        </TableCell> */}
                        <TableCell
                          align="left"
                          className="border-r border-green  font-popins text-black font-normal"
                          style={{ fontSize: "16px" }}
                        >
                          {item.zoneName}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="border-r border-green  font-popins text-black font-normal"
                          style={{ fontSize: "16px" }}
                        >
                          {item.zoneShortName}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="border-r border-green  font-popins text-black font-normal"
                          style={{ fontSize: "16px" }}
                        >
                          {item.zoneType}
                        </TableCell>
                        <TableCell
                          align="center" // Set align to center
                          className="border-r border-green font-popins text-black font-normal"
                        >
                          <Link href={`/EditZone?id=${item.id}`}>
                            <BorderColorIcon
                              style={{ marginTop: "-2%" }}
                              className="text-white bg-green  p-1 h-7 w-8  rounded-md shadow-md hover:shadow-gray transition duration-500 "
                            />
                          </Link>
                          <button
                            // style={{ marginLeft: "73%" }}
                            className="icon_delete_edit"
                            onClick={() => deleteSelectedZones(item.id)}
                          >
                            <DeleteIcon
                              className="text-white bg-red p-1 h-7 w-8 rounded-md shadow-md hover:shadow-gray transition duration-500 "
                              style={{ marginTop: "-18%", marginLeft: "20%" }}
                            />
                          </button>

                          {/* <BorderColorIcon
                            onClick={deleteSelectedZones}
                        
                          /> */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
        {filterZoneResult.length > 0 ? (
          <div className="flex  justify-end lg:w-full w-screen bg-bgLight">
            <div className="grid lg:grid-cols-4 grid-cols-4  my-4 ">
              <div className="lg:col-span-1 col-span-1">
                <p className="mt-1 text-black font-medium font-popins text-end">
                  Total {filteredZones.length} items
                </p>
              </div>

              <div
                className="lg:col-span-2 col-span-2 "
                style={{
                  height: "4vh",
                  overflow: "hidden",
                  justifyContent: "end",
                }}
              >
                <Stack spacing={2}>
                  <Pagination
                    count={totalPagesFilter}
                    page={filterZonepage}
                    onChange={handlePageChangeFiter}
                    sx={{ color: "green" }}
                  />
                </Stack>
              </div>
              <div className="lg:col-lg-1 col-lg-1  mt-1 ">
                <span className="lg:inline-block hidden">Go To</span>
                <input
                  type="text"
                  className="lg:w-10 w-5  border border-grayLight outline-green mx-2 px-2"
                  value={input}
                  onChange={(e: any) => setInput(e.target.value)}
                />
                <span
                  className="text-labelColor cursor-pointer "
                  onClick={handleClickPaginationFilter}
                >
                  page &nbsp;&nbsp;
                </span>
              </div>
            </div>
            <div className="mt-2">
              <TablePagination
                component="div"
                rowsPerPageOptions={[10, 20, 30, 40, 50, 100]}
                count={filterZoneResult.length} // or zoneList.length depending on the context
                rowsPerPage={filterZonePerPage} // or rowsPerPage depending on the context
                page={filterZonepage} // or currentPage depending on the context
                onRowsPerPageChange={handleChangeRowsPerPageFilter} // or handleChangeRowsPerPage depending on the context
                onPageChange={handlePageChangeFiter} // or handlePageChange depending on the context
              />
            </div>
          </div>
        ) : (
          <div className="flex  justify-end lg:w-full w-screen bg-bgLight">
            <div className="grid lg:grid-cols-4 grid-cols-4  my-4 ">
              <div className="lg:col-span-1 col-span-1">
                <p className="mt-1 text-labelColor text-end">
                  Total {zoneList.length} items
                </p>
              </div>

              <div
                className="lg:col-span-2 col-span-2 "
                style={{
                  height: "4vh",
                  overflow: "hidden",
                  justifyContent: "end",
                }}
              >
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    sx={{ color: "green" }}
                  />
                </Stack>
              </div>
              <div className="lg:col-lg-1 col-lg-1  mt-1 ">
                <span className="lg:inline-block hidden">Go To</span>
                <input
                  type="text"
                  value={input}
                  className="lg:w-10 w-5  border border-grayLight outline-green mx-2 px-2"
                  onChange={(e: any) => setInput(e.target.value)}
                />
                <span
                  className="text-labelColor cursor-pointer "
                  onClick={handleClickPagination}
                >
                  page &nbsp;&nbsp;
                </span>
              </div>
            </div>
            <div className="mt-2">
              <TablePagination
                component="div"
                rowsPerPageOptions={[10, 20, 30, 40, 50, 100]}
                count={zoneList.length}
                rowsPerPage={rowsPerPage}
                page={currentPage} // Add this prop
                onPageChange={handlePageChange} // Add this prop
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </div>
        )}
      </div>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
