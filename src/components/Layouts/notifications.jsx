import React, { useEffect } from 'react';

const NotificationDropdown = ({ notifications }) => {
  // Helper function to get colors based on event type
  const getEventStyle = (event) => {
    switch (event) {
      case 'ignitionOn':
        return {
          background: '#D1FAE5', // light green
          border: '#34D399', // dark green
          color: '#00B56C', // text color
        };
      case 'ignitionOff':
        return {
          background: '#FEE2E2', // light red
          border: '#FCA5A5', // dark red
          color: '#FF0000', // text color
        };
      case 'geofenceEntered':
        return {
          background: '#E0F2FF', // light blue
          border: '#93C5FD', // blue
          color: '#1E40AF', // text color
        };
      case 'geofenceLeft':
        return {
          background: '#FEF3C7', // light yellow
          border: '#FBBF24', // yellow
          color: '#B45309', // text color
        };
      case 'harshacceleration':
        return {
          background: '#F9FAFB', // light gray
          border: '#E5E7EB', // gray
          color: '#6B7280', // text color
        };
      case 'harshcorning':
        return {
          background: '#FEE2E2', // light red
          border: '#FCA5A5', // dark red
          color: '#FF0000', // text color
        };
      default:
        return {
          background: '#F9FAFB', // light gray (default)
          border: '#E5E7EB', // gray (default)
          color: '#6B7280', // text color
        };
    }
  };

  useEffect(() => {
    // Ensure smooth scroll behavior with JavaScript as a fallback
    const scrollContainer = document.querySelector('.notification-scroll-container');
    if (scrollContainer) {
      scrollContainer.style.scrollBehavior = 'smooth'; // Fallback for browsers that support this
    }
  }, []);

  return (
    <div className="mt-4 absolute right-0 w-72 bg-white shadow-lg rounded-md p-2 z-10">
      <div className="flex justify-between items-center p-1 border-b">
        <span className="font-semibold text-[#1F2937] text-center">Notifications</span>
        {/* Display notification count in the top-right corner */}
        <span className="text-xs text-[#1F2937] font-semibold bg-[#ffffff] px-2 py-2 rounded-full absolute top-2 right-2">
          Total ({notifications.length})
        </span>
      </div>

      {/* Scrollable Container with Tailwind Classes */}
      <div className="notification-scroll-container overflow-y-auto max-h-72 scroll-smooth">
        <div className="space-y-2">
          {
            notifications.length === 0 ? (
                <div
                className="py-2 mt-2 text-center text-gray-500 animate-pulse"
                style={{
                  backgroundColor: "#f0f0f0",
                  borderColor: "#d1d5db",
                }}
              >
                <div className="flex items-center justify-center">
                 {/*  <div className="rounded-full bg-slate-200 h-10 w-10 mr-4"></div> */}
                  <p className="text-xl">No Data Found</p>
                </div>
              </div>
              ) : (
                notifications.map((notification) => 
                    
                 { 
            const { background, border, color } = getEventStyle(notification.event);

return                      (
                  <div
                    className="py-2 border-l-4 rounded-lg mt-2 w-[255px]"
                    style={{
                      backgroundColor: background,
                      borderColor: border,
                      color: color,
                    }}
                    key={notification.clientId || notification.event}
                  >
                    <div className="flex items-center">
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-semibold">{notification.title}</h3>
                        <p className="mt-2 text-xs">{notification.description}</p>
                      </div>
                    </div>
                  </div>
                )}
            )
              )}
          
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
