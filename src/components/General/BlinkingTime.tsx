import React, { useState, useEffect } from "react";

const BlinkingTime = ({ timezone }: { timezone: string | undefined }) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      let currentTime;

      if (timezone) {
        currentTime = new Date().toLocaleString("en-US", {
          timeZone: timezone,
        });
      } else {
        currentTime = new Date().toLocaleString();
      }

      setTime(currentTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [timezone]);

  return <p>{time}</p>;
};

export default BlinkingTime;
