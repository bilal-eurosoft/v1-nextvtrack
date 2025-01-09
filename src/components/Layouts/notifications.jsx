import { useRouter } from "next/navigation";
import React, { useState, useEffect } from 'react';


const NotificationDropdown = ({ notifications,loading,toggleNotifications }) => {
  const  router = useRouter()
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotifications, setFilteredNotifications] = useState(notifications);
  // Helper function to get colors based on event type
  const getEventStyle = (event) => {
    switch (event) {
      case 'ignitionOn':
        return {
          background: '#D1FAE5', // light green
          border: '#34D399', // dark green
          color: '#4CAF50', // green (text color for ignition on)
        };
      case 'ignitionOff':
        return {
          background: '#E0E7FF', // light blue-gray
          border: '#A5B4FC', // blue-gray border
          color: '#3B82F6', // blue (text color for ignition off)
        };
      case 'targetEnteredZone':
        return {
          background: '#E0F2FF', // light blue
          border: '#93C5FD', // blue
          color: '#2196F3', // blue (text color for entered zone)
        };
      case 'targetLeftZone':
        return {
          background: '#FFFBEB', // very light yellow
          border: '#FDE68A', // soft yellow
          color: '#D97706', // dark yellow-orange (text color for left zone)
        };
      case 'harshBreak':
        return {
          background: '#FFEBEE', // light pink
          border: '#FFCDD2', // pink
          color: '#FF5722', // orange-red (text color for harsh break)
        };
      case 'harshAcceleration':
        return {
          background: '#FFF7ED', // light orange
          border: '#FFCC80', // orange
          color: '#FF9800', // orange (text color for harsh acceleration)
        };
      case 'harshCornering':
        return {
          background: '#EDE7F6', // light purple
          border: '#D1C4E9', // purple
          color: '#673AB7', // deep purple (text color for harsh cornering)
        };
      case 'overSpeeding':
        return {
          background: '#FFEBEE', // light pink
          border: '#EF9A9A', // red
          color: '#F44336', // red (text color for overspeeding)
        };
      default:
        return {
          background: '#F9FAFB', // light gray (default)
          border: '#E5E7EB', // gray (default)
          color: '#6B7280', // gray (text color for default)
        };
    }
  };
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(
        notifications.filter((notification) =>
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.event.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, notifications]);
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const getBorderColor = () => {
    if (searchQuery === '') {
      return '#3B82F6'; // Blue (Default color)
    }
    return filteredNotifications.length > 0 ? '#34D399' : '#FF0000';
  };
  useEffect(() => {
    const scrollContainer = document.querySelector('.notification-scroll-container');
    if (scrollContainer) {
      scrollContainer.style.scrollBehavior = 'smooth';
    }
  }, []);

  const handleTripHistoryClick = (notification) => {

    const dateObj = new Date(notification.dateTime);

    // Format the date as YYYY-MM-DD
    const formattedDate = dateObj.toISOString().slice(0, 10);
    console.log("formattedDate",formattedDate, notification);
    router.push(`/Reports?vehicleReg=${notification.vehicleReg}&event=${notification.event}&dateTime=${formattedDate}`); // Navigate to Notifications page
    /*  router.push({
      pathname: '/Reports',
      query: { vehicleReg: notification.vehicleReg, event: notification.event,  dateTime: notification.dateTime },
    }); */

  };
  const handleNotificationClick = () => {
    router.push('/NotificationTab');  // Navigate to Notifications page
  };


  return (
    <div className="mt-4 absolute right-0 w-72 bg-white shadow-lg rounded-md px-2 py-2 z-10">
      <div className="flex justify-between items-center p-1 border-b">
        <span className="font-semibold text-[#1F2937] text-center">Notifications</span>
        <span className="text-xs text-[#1F2937] font-semibold bg-[#FFFFFF] px-2 py-2 rounded-full absolute top-2 right-2">
          Total ({filteredNotifications.length})
        </span>
      </div>
      <div className="py-2">
        <input
          type="text"
          placeholder="Search Notifications..."
          className="text-sm p-[0.3rem] border-[2.8px] rounded-md w-full focus:outline-none"
          style={{
            borderColor: getBorderColor(),
          }}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <div className="notification-scroll-container overflow-y-auto max-h-72 scroll-smooth">
  <div className="space-y-2">
    {loading ? (
      <div
        className="py-2 mt-2 text-center text-gray-500 animate-pulse"
        style={{
          backgroundColor: '#F0F0F0',
          borderColor: '#D1D5DB',
        }}
      >
        <p className="text-xl">Loading...</p>
      </div>
    ) : filteredNotifications.length === 0 ? (
      <div
        className="py-2 mt-2 text-center text-gray-500 animate-pulse"
        style={{
          backgroundColor: '#F0F0F0',
          borderColor: '#D1D5DB',
        }}
      >
        <p className="text-xl">No Data Found</p>
      </div>
    ) : (
      filteredNotifications.map((notification) => {
        const { background, border, color } = getEventStyle(notification.event);
        return (
          <div
            className="p-2 border-l-4 rounded-lg w-[255px] cursor-pointer"
            style={{
              backgroundColor: background,
              borderColor: border,
              color: color,
            }}
            key={notification.clientId || notification.event}
            onClick={() => {
              toggleNotifications();
              /* router.push("NotificationTab") */
            }}
          >
            <div className="flex flex-col">
              {/* First Row: Title and Icons */}
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold flex-1">{notification.title}</h3>

                {/* First Icon - Trip History */}
                <div className="relative group">
                  <button
                    className=" p-1 rounded-full"
                    onClick={() => handleTripHistoryClick(notification)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 10l4-4m0 0l-4-4m4 4H7a4 4 0 00-4 4v6m16-6a4 4 0 00-4-4m4 4v6"
                      />
                    </svg>
               
                  </button>
                  <span className="absolute w-[120px] right-[-60px] transform -translate-x-1/2 mb-1 hidden group-hover:block bg-white text-black text-xs rounded px-2 py-1 border-b-2">
                    View Trip History
                  </span>
                </div>

                {/* Second Icon - Notifications */}
                <div className="relative group">
                  <button
                    className="bg-white text-black p-1 rounded-full"
                    onClick={handleNotificationClick}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.002 2.002 0 0018 13V9a6 6 0 00-12 0v4a2 2 0 00-.595 3.595L4 17h5m6 0v2a3 3 0 11-6 0v-2"
                      />
                    </svg>
                  </button>
                  <span className="absolute w-[90px] right-[-40px] transform -translate-x-1/2 mb-1 hidden group-hover:block bg-white text-black text-xs rounded px-2 py-1 border-b-2">
                    Notifications
                  </span>
                </div>
              </div>

              {/* Second Row: Description */}
              <div className="mt-2">
                <p className="text-xs">{notification.description}</p>
              </div>
            </div>
          </div>
        );
      })
    )}
  </div>
</div>

    
    </div>
  );
};
export default NotificationDropdown;