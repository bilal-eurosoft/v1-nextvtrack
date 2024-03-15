export function dateTimeToTimestamp(dateString: string, timeString: string) {
   
    const combinedDateTimeString = dateString + 'T' + timeString;
  
   
    const timestamp = new Date(combinedDateTimeString).getTime() / 1000;
  
    return timestamp;
  }