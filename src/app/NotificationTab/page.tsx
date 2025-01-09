"use client";
import { getallNotifications, getAllVehicleByUserId, vehicleListByClientId } from "@/utils/API_CALLS";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Table } from "antd";
const moment = require("moment-timezone");
import {
  MuiPickersUtilsProvider, DatePicker
} from "@material-ui/pickers";
import DateFnsMomemtUtils from "@date-io/moment";
import { DeviceAttach } from "@/types/vehiclelistreports";
import EventIcon from "@material-ui/icons/Event";
import { Toaster } from "react-hot-toast";
import "./index.css"
import { ColumnType } from "antd/es/table";
import { useRouter } from "next/navigation";
export default function NotificationTab() {
  const { data: session } = useSession();
  const  router = useRouter()
  const [notifications, setnotifications] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [vehicleReg, setVehicleReg] = useState(null)
  const [period, setPeriod] = useState(null)
  const [fromDate, setfromDate] = useState(null)
  const [toDate, settoDate] = useState(null)
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const [getShowRadioButton, setShowRadioButton] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  const allData = useSelector((state) => state?.zone);

  const fetchNotifications = async (payload) => {
    setLoading(true); // Set loading to true before the fetch starts
    try {
      if (session && session.userRole === "Admin") {
        const NotificationsData = await getallNotifications({
          token: session.accessToken,
          body: JSON.stringify({ ...payload, "timezone": session?.timezone, "clientId": `${session?.clientId}` })
        });
        setFilteredNotifications(NotificationsData.data)
        setnotifications(NotificationsData.data); // Assuming the response is an array of notifications
      }
      else {
        const NotificationsData = await getallNotifications({
          token: session?.accessToken,
          body:
            JSON.stringify({ ...payload, "timezone": session?.timezone, "userId": `${session?.userId}` })
        });
        setnotifications(NotificationsData.data); // Assuming the response is an array of notifications
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false); // Set loading to false after the fetch is complete
    }
  };
  useEffect(() => {

    fetchNotifications({});
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "SuperAdmin") {
          if (session) {
            if (allData?.vehicle.length <= 0) {
              const Data = await vehicleListByClientId({
                token: session.accessToken,
                clientId: session?.clientId,
              });
              setVehicleList(Data);
            }
            setVehicleList(allData?.vehicle);
          }
        } else {
          if (session) {
            const data = await getAllVehicleByUserId({
              token: session.accessToken,
              userId: session.userId,
            });
            setVehicleList(data);
          }
        }
      } catch (error) { }
    };
    vehicleListData();
  }, [])
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(
        notifications.filter((notification: any) =>
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.event.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, notifications]);
  const handleCloseDateTime = () => {
    setShowRadioButton(false);
    setfromDate(null)
    settoDate(null)
  };
  const handleSubmit = async (e: React.FormEvent) => {
    fetchNotifications({ vehicleReg });

  }
  const options =
    vehicleList?.data?.map((item: any) => ({
      value: item.vehicleReg,
      label: item.vehicleReg,
    })) || [];
  const handleInputChangeSelect = (e: any) => {
    if (!e) { setVehicleReg(null) } else { setVehicleReg(e.value) }

  }
  const handleInputChange = (e: any) => {
    let startDateTime, endDateTime;
    if (e.target.value == "today") {
      const today = moment().tz(session?.timezone);
      // const time = today.format("HH:mm:ss");
      startDateTime =
        today.clone().startOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
      endDateTime =
        today.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
    } else
      if (e.target.value == "yesterday") {
        const yesterday = moment().subtract(1, "day").tz(session?.timezone);
        startDateTime =
          yesterday.clone().startOf("day").format("YYYY-MM-DDTHH:mm:ss") +
          "Z";
        endDateTime =
          yesterday.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
      } else
        if (e.target.value == "week") {
          const startOfWeek = moment()
            .subtract(7, "days")
            .startOf("day")
            .tz(session?.timezone);
          const oneday = moment().subtract(1, "day").endOf("day")
            .tz(session?.timezone);
          startDateTime = startOfWeek.format("YYYY-MM-DDTHH:mm:ss") + "Z";
          endDateTime =
            oneday.clone().endOf("day").format("YYYY-MM-DDTHH:mm:ss") + "Z";
        } else {
          setPeriod(e.target.value)
          setFilteredNotifications(notifications)
          return
        }
    const start = moment(startDateTime);
    const end = moment(endDateTime);
    setFilteredNotifications(
      notifications.filter((e: any) => e.createdAt != null)
        .filter((i: any) => {
          let createdAt = moment(i.date);
          return createdAt.isBetween(start, end, null, "[]");
        })
    )
    setPeriod(e.target.value)
  }


  useEffect(() => {
    if (fromDate != null && toDate != null) {
      const start = moment(fromDate);
      const end = moment(toDate);
      setFilteredNotifications(
        notifications.filter((i: any) => {
          let createdAt = moment(i.date);
          return createdAt.isBetween(start, end, null, "[]");
        })
      )
    }
  }, [fromDate, toDate])
  const handleClick = () => {
    setShowRadioButton(!getShowRadioButton);
  };
  const getBorderColor = () => {
    if (searchQuery === '') {
      return '#3B82F6'; // Blue (Default color)
    }
    return filteredNotifications.length > 0 ? '#34D399' : '#FF0000';
  };
  const handleDateChange = (fieldName: string, newDate: any) => {

    // setCurrentDateDefaul(true);
    if (fieldName == "fromDateTime") {
      setfromDate(newDate?.toISOString())
    }
    if (fieldName == "toDateTime") {
      settoDate(newDate?.toISOString())
    }

  };
  const togglePicker = () => {
    setIsPickerOpen(!isPickerOpen);
  };
  const [columns]: ColumnType = useState([
    {
      title: "Event Type",
      dataIndex: "title",
      key: "title",
      // render: (text, r) => <a style={{ fontWeight: "bold" }}>{text.replace(" Alert","")}</a>      
    },
    {
      title: "Date",
      dataIndex: "dateTime",
      key: "dateTime"
    },
    {
      title: "Vehicle Reg",
      dataIndex: "description",
      key: "description",
      render: (text, r) => <p>{text?.split("has")[0].replace("Your Vehicle ", "")}</p>
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (text, r) => (
        <div className="relative group inline-block">  {/* Make the parent relative to the icon */}
          {/* SVG icon with hover effect */}
          <div
            onClick={() => handleNavigateToReports(r)}
            className="cursor-pointer p-2 rounded-full bg-gray-200 hover:bg-gray-300 "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 9l4-4 4 4M14 5v14" />
            </svg>
          </div>
          
          {/* Popup that appears on hover over the SVG */}
          {/* <div
            className="absolute left-[110px]  transform -translate-x-1/2  px-2 py-1 bg-white text-black rounded-md opacity-0 group-hover:opacity-100 group-hover:visible visibility-hidden transition-all duration-300 z-10"
          >
            Navigate to Reports
          </div>
        </div> */}
           <div
        className="absolute w-[150px]  left-[110px] top-0  transform -translate-x-1/2  px-2 py-1 bg-white text-black rounded-md opacity-0 group-hover:opacity-100  visibility-hidden transition-all duration-300 z-10"
      >
        Navigate to Reports
      </div>
    </div>
      ),
    }
 
  
    ////////////

    // {
    //   title: "Title",
    //   dataIndex: "title",
    //   key: "title",
    //   render: (text, r) => <a style={{ fontWeight: "bold" }}>{text.replace(" Alert", "")}</a>
    // },    
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   key: "description",    
    // },



  ]);

  const handleNavigateToReports = (record: any) => {
console.log("record", record);
 /*    const dateObj = new Date(record.dateTime);

// Format the date as YYYY-MM-DD
const formattedDate = dateObj.toISOString().slice(0, 10);; */

let dateTime = record.dateTime;
let dateParts = dateTime.split(' ');

// Create a mapping for month names to month numbers
let monthMapping = {
    "Jan": "01", "January": "01",
    "Feb": "02", "February": "02",
    "Mar": "03", "March": "03",
    "Apr": "04", "April": "04",
    "May": "05",
    "Jun": "06", "June": "06",
    "Jul": "07", "July": "07",
    "Aug": "08", "August": "08",
    "Sep": "09", "September": "09",
    "Oct": "10", "October": "10",
    "Nov": "11", "November": "11",
    "Dec": "12", "December": "12"
};

// Extract day, month, and year
let day = dateParts[0];
let month = monthMapping[dateParts[1]];
let year = dateParts[2];

// Format date as YYYY-MM-DD
let formattedDate = `${year}-${month}-${day}`;

    router.push(`/Reports?vehicleReg=${record.vehicleReg}&event=${record.event}&dateTime=${formattedDate}`); // Navigate to Notifications page
  
  };


  return (
    <>
      <div className="main_journey">
        <p className="bg-green px-4 py-1 border-t  text-center text-2xl text-white font-bold journey_heading">
          Notifications
        </p>
        <div
          className="grid xl:grid-cols-10 lg:grid-cols-10 md:grid-cols-12  gap-2
         lg:px-4 text-start  bg-bgLight select_box_journey"
        >
          <div
            className="xl:col-span-1 lg:col-span-2 md:col-span-3 col-span-12 select_box_column">
            <input
              type="text"
              placeholder="Search Notifications..."
              className="text-sm p-[0.4rem] rounded-md w-full notification-search"
              style={{
                borderColor: getBorderColor(),
              }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="xl:col-span-3 lg:col-span-4 md:col-span-6 col-span-12 days_select">
            {getShowRadioButton ? (
              <div className="grid lg:grid-cols-12 md:grid-cols-12  sm:grid-cols-12  -mt-2  grid-cols-12  xl:px-10 lg:px-10 xl:gap-5 lg:gap-5 gap-2 flex justify-center ">
                <div
                  className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-5 lg:mt-0 md:mt-0 sm:mt-0  "
                // onClick={togglePickerFromDate}
                >
                  <label className="text-green">From</label>
                  <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                    <DatePicker
                      // open={isPickerOpenFromDate}
                      format="MM/DD/yyyy"
                      value={fromDate || null}
                      onChange={(newDate: any) =>
                        handleDateChange("fromDateTime", newDate)
                      }
                      style={{ marginTop: "-3%" }}
                      variant="inline"
                      placeholder="Start Date"
                      maxDate={new Date()}
                      autoOk
                      inputProps={{ readOnly: true }}
                      InputProps={{
                        endAdornment: (
                          <EventIcon
                            style={{ width: "20", height: "20" }}
                            className="text-gray"
                          />
                        ),
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </div>
                <div
                  className="lg:col-span-5 md:col-span-5 sm:col-span-5 col-span-5 "
                  onClick={togglePicker}
                >
                  <label className="text-green">To</label>
                  <div>
                    {/* <h1>test</h1> */}
                    <MuiPickersUtilsProvider utils={DateFnsMomemtUtils}>
                      <DatePicker
                        style={{ marginTop: "-3%" }}
                        className="text-red"
                        format="MM/DD/yyyy"
                        value={toDate || null}
                        onChange={(newDate: any) =>
                          handleDateChange("toDateTime", newDate)
                        }
                        variant="inline"
                        minDate={fromDate || new Date()}
                        placeholder="End Date"
                        inputProps={{ readOnly: true }}
                        maxDate={new Date()}
                        // shouldDisableDate={(date) => !isCurrentDate(date)}
                        InputProps={{
                          endAdornment: (
                            <EventIcon
                              style={{ width: "20", height: "20" }}
                              className="text-gray"
                            />
                          ),
                        }}
                        autoOk
                      />
                    </MuiPickersUtilsProvider>
                  </div>
                </div>
                <div className="lg:col-span-1 col-span-1   ">
                  <button
                    className="text-green ms-5  text-2xl font-bold"
                    onClick={handleCloseDateTime}
                  >
                    x
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="grid xl:grid-cols-11 lg:grid-cols-12  md:grid-cols-12 grid-cols-12 -mt-2 "
              // style={{ display: "flex", justifyContent: "start" }}
              >
                <div
                  className="xl:col-span-2 lg:col-span-3  md:col-span-3 sm:col-span-2 col-span-4 period_select"
                  id="today_journey"
                >
                  <label className="text-sm text-black font-bold font-popins ">
                    <input
                      type="radio"
                      className="w-5 h-4 form-radio"
                      style={{ accentColor: "green" }}
                      name="period"
                      disabled={loading}
                      value="today"
                      checked={period === "today"}
                      onChange={handleInputChange}
                    />
                    &nbsp;Today
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3  md:col-span-3 sm:col-span-2  lg:-ms-4 col-span-4 period_select">
                  <label className="text-sm  text-black font-bold font-popins  w-full pt-3 ">
                    <input
                      type="radio"
                      className="lg:w-5 w-4  md:w-4 h-4 md:-ms-3 -ms-0 lg:-ms-0 xl:-ms-0   form-radio text-green"
                      name="period"
                      id="yesterday_radio_button"
                      disabled={loading}
                      value="yesterday"
                      style={{ accentColor: "green" }}
                      checked={period === "yesterday"}
                      onChange={handleInputChange}
                    />
                    <span className="lg:ms-1 md:ms-1 sm:ms-1 ms-2">
                      Yesterday
                    </span>
                  </label>
                </div>

                <div className="xl:col-span-2 lg:col-span-3 md:col-span-3  lg:-ms-1 col-span-4 period_select">
                  <label className="text-sm text-black font-bold font-popins  ">
                    <input
                      type="radio"
                      className="w-5 h-4 lg:w-4  "
                      name="period"
                      disabled={loading}
                      value="week"
                      style={{ accentColor: "green" }}
                      checked={period === "week"}
                      onChange={handleInputChange}
                    />
                    &nbsp;&nbsp;Week
                  </label>
                </div>

                <div
                  className="xl:col-span-2 lg:col-span-3 md:col-span-3 lg:-ms-4
                md:-ms-4 sm:-ms-4 -ms-0 col-span-3 period_select_custom"
                  id="custom_journey"
                >
                  <label className="text-sm text-black font-bold font-popins ">
                    <input
                      type="radio"
                      className="w-5 h-4  lg:w-4 "
                      disabled={loading}
                      name="period"
                      value="custom"
                      style={{ accentColor: "green" }}
                      checked={period === "custom"}
                      onChange={handleInputChange}
                      onClick={handleClick}
                    />
                    &nbsp;&nbsp;Custom
                  </label>
                </div>
              </div>

            )}
          </div>



        </div>

        {
          loading ? (
            <div
              className="py-2 mt-2 text-center text-gray-500 animate-pulse"
              style={{
                backgroundColor: '#F0F0F0',
                borderColor: '#D1D5DB',
              }}
            >
              <p className="text-xl">Loading...</p>
            </div>
          ) :
            (

              <Table
                className="font-popins"
                columns={columns}
                dataSource={filteredNotifications}
                rowKey="DeviceId"
                scroll={{ y: 490 }}
              />
            )
        }


        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  )
}