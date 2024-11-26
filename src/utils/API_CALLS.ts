import { IgnitionReport, replayreport } from "@/types/IgnitionReport";
import { Events, Notifications } from "@/types/events";
import { commandrequest } from "@/types/commandrequest";
import { zonelistType } from "@/types/zoneType";
import axios from "axios";
import { immobiliserequest } from "@/types/immobiliserequest";
import uniqueDataByIMEIAndLatestTimestamp from "./uniqueDataByIMEIAndLatestTimestamp";
//  var URL = "http://172.16.10.47:80"
var URL ="https://backend.vtracksolutions.com";

export async function getVehicleDataByClientId(clientId: string) {
  try {
    const response = await fetch(
      `https://socketio.vtracksolutions.com:1102/${clientId}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();

    return data;
  } catch (error) {
    
    return [];
  }
}

export async function getVehicleDataByClientIdForOdometer(clientId: string) {
  try {
    const response = await fetch(
      `https://socketio.vtracksolutions.com:1102/${clientId}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
   //  data?.data?.Value
      let parsedData = JSON.parse(
        data?.data?.Value
      )?.cacheList;
      // call a filter function here to filter by IMEI and latest time stamp
      let uniqueData = uniqueDataByIMEIAndLatestTimestamp(parsedData);
console.log("redis", uniqueData);
    return uniqueData;
  } catch (error) {
    
    return [];
  }
}

export async function getClientSettingByClinetIdAndToken({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/SettingByClientId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"ClientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}
export async function getNotificationsData({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/notifications`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function getNotificationsDataByUserId({
  token,
  userId,
}: {
  token: string;
  clientId: string;
}) {
  try {
   // console.log("object", clientId,token);
    const response = await fetch(`${URL}/notifications`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"userId\":\"${userId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestParams {
  token: string;
  method: ApiMethod;
  body?: Record<string, any>; // Optional for methods like GET
}

export async function handleServiceHistoryRequest({
  token,
  method,
  body,
}: ApiRequestParams) {
  try {
    // Set up the request headers
    const headers = {
      accept: "application/json, text/plain, */*",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    };

    // Prepare the fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Add body only for methods that need it (POST, PUT, DELETE)
    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(body);
    }
    if ( method === 'DELETE') {
  
      fetchOptions.body = JSON.stringify(body);
    }
    
    // Handle GET method separately, no body is required
    if (method === 'GET') {
      // For GET requests, we just send the token as part of the headers.
      delete fetchOptions.body;
    }

    // Perform the request
    const response = await fetch('http://172.16.10.47/serviceHistory', fetchOptions);

    // Handle non-2xx status codes
    if (!response.ok) {
      throw new Error(`Failed to fetch data from the API. Status: ${response.status}`);
    }

    // Parse JSON response body
    const data = await response.json();

    // For GET requests, we return the data (example: 'data' field is the key you want to extract)
    if (method === 'GET') {
      return data.data;
    }

    // For POST, PUT, DELETE, return the response data
    return data;

  } catch (error) {
    console.error('Error occurred while fetching service history:', error);
    return null; // Or you can return an empty array if preferred
  }
}



export async function vehicleListByClientId({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/vehicleListByClientId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}
// export async function expireForgotLink({
//   token,
//   clientId,
//   payload
// }: {
//   token: any;
//   clientId: any;
//   payload: any;
// }) {
//   try {
//     const response = await fetch(
//       `http://hammadserver:3010/forgotpassword/UpdateLink`,
//       {
//         headers: {
//           accept: "application/json, text/plain, */*",
//           authorization: `Bearer ${token}`,
//           "content-type": "application/json",
//         },
//         body: `{\"clientId\":\"${clientId}\"}`,
//         method: "POST",
//       }
//     );
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     
//     return [];
//   }
// }
export function expireForgotLink(payload: any) {
  const ressult = axios
    .post(`${URL}/forgotpassword/UpdateLink`, payload)
    .then((response: any) => response?.data)
    .catch((error) => {
      
    });
  return ressult;
}

// here
export async function portalGprsCommand({
  token,
  payload,
}: {
  token: string;
  payload: commandrequest;
}) {
  try {
    const response = await fetch(`${URL}/portal/GprsCommand`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function ImmobiliseRequest({
  token,
  payload,
}: {
  token: string;
  payload: immobiliserequest;
}) {
  try {
    const response = await fetch(`${URL}/immobiliserequest`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}


export async function Verifyimmobiliserequest({
  token,
  payload,
}: {
  token: string;
  payload: immobiliserequest;
}) {
  try {
    const response = await fetch(`${URL}/verifyimmobiliserequest`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}
// export async function getGprsCommandLatest({
//   token,
// }: // payload,
// {
//   token: string;
//   // payload: commandrequest;
// }) {
//   try {
//     const response = await fetch(
//       `http://172.16.10.99:3001/GetLatestGprsCommand`,
//       {
//         headers: {
//           accept: "application/json, text/plain, */*",
//           authorization: `Bearer ${token}`,
//           "content-type": "application/json",
//         },
//         // body: JSON.stringify(payload),
//         method: "POST",
//       }
//     );
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     
//     return [];
//   }
// }

// export async function responsegprs({ token }: { token: string }) {
//   try {
//     const response = await fetch(
//       `http://172.16.10.46:80/gprscommands/most-recent`,
//       {
//         headers: {
//           accept: "application/json, text/plain, */*",
//           authorization: `Bearer ${token}`,
//           "content-type": "application/json",
//         },
//         method: "POST", // Adjust the method according to your API's requirement
//       }
//     );
//     if (!response.ok) {
//       throw new Error("Failed to fetch data from the API");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     
//     return null;
//   }
// }

export async function getAllVehicleByUserId({
  token,
  userId,
}: {
  token: string;
  userId: string;
}) {
  try {
    const response = await fetch(`${URL}/getAllVehicleByUserId`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"userId\":\"${userId}\"}`,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

// here events permission
export async function updateEventPermissionByClientId({
  token,
  clientId,
  payload,
}: {
  token: string;
  clientId: string;
  payload: Events;
}) {
  try {
    const payloadWithClientId = { clientId, ...payload }; // Construct payload object
    const response = await fetch(`${URL}/updateEventPermissionByClientId`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payloadWithClientId), // Stringify payload with clientId
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

// here get client
export async function clientbyClientid({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/GetClientById`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"id\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    
    return data;
  } catch (error) {
    
    return [];
  }
}

// here save client
export async function clientsave({
  token,
  clientId,
  payload,
}: {
  token: string;
  clientId: string;
  payload: Notifications;
}) {
  try {
    const payloadWithClientId = { id: clientId, ...payload }; // Construct payload object
    const response = await fetch(`${URL}/clients`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      // add here client id in this form]
      body: JSON.stringify(payloadWithClientId), // Stringify payload with clientId
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function getEventPermissionByClientId({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(
      `${URL}/getEventPermissionByClientId?clientId=${clientId}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        method: "GET", // Use lowercase 'get' for method
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function vehiclebyClientid({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/getDualCamVehicleByclientId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    
    return data;
  } catch (error) {
    
    return [];
  }
}
export async function vehiclebyClientidbyimmobilising({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/getimmobilisingVehicleByclientId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function IgnitionReportByTrip({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(
      `${URL}/Report/IgnitionReport`,
      {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function IgnitionReportByDailyactivity({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/IgnitionReportAddressWise`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}
export async function IgnitionReportByIgnition({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/IgnitionNewReport`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}
export async function IgnitionReportByEvents({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/ReportByEvents`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}
export async function IgnitionReportByDetailReport({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/ReportByStreet`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}
export async function IgnitionReportByIdlingActivity({
  token,
  payload,
}: {
  token: string;
  payload: IgnitionReport;
}) {
  try {
    const response = await fetch(`${URL}/Report/MTSDailyIdling`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}
export async function GprsCommandbyCliendId({
  token,clientId
}:{
  token: string;
  clientId: string;
}){
  try {
    const response = await fetch(`${URL}/GprsCommandbyCliendId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
  
}
export async function videoList({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/videolistbyId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function getZoneListByClientId({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/zonelist`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function forgetEmailByClientId({
  token,
  newformdata,
}: {
  token: any;
  newformdata: any;
}) {
  try {
    const response = await fetch(`${URL}/forgotpassword/forgotpassword`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function forgetPasswordClientId({
  token,
  newformdata,
}: {
  token: any;
  newformdata: any;
}) {
  try {
    const response = await fetch(`${URL}/forgotpassword/Passwordreset`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function forgetPasswordByClientId({
  token,
  newformdata,
}: {
  token: any;
  newformdata: zonelistType;
  link: any;
}) {
  try {
    const response = await fetch(`${URL}/forgotpassword/GetByLink`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function forgetPasswordUpdateLinkClientId({
  token,
  newformdata,
}: {
  token: any;
  newformdata: any;
  link: any;
}) {
  try {
    const response = await fetch(`${URL}/forgotpassword/UpdateLink`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}
export async function postDriverDataByClientId({
  token,
  newformdata,
}: {
  token: string;
  newformdata: any;
}) {
  try {
    const { driverRFIDCardNumber } = newformdata;
    delete newformdata.driverRFIDCardNumbers;
    const response = await fetch(`${URL}/v2/Driver`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });
    if (!response.ok) {
      throw new Error("Failed to add data from the API");
    }
    const data = await response.json();
    // await AssignRfidtodriver(token, {
    //   DriverId: data.data._id,
    //   RFIDid: driverRFIDCardNumber,
    // });

    return data;
  } catch (error) {
    
    return [];
  }
}
export async function AssignRfidtodriver(token: any, payload: any) {
  try {
    const response = await fetch(`${URL}/AssignRfidToDriver`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to Assign rfid to driver");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}
export async function postDriverDataAssignByClientId({
  token,
  newformdata,
}: {
  token: string;
  newformdata: any;
}) {
  try {
    const response = await fetch(`${URL}/v2/DriverAssign`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
   
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function postDriverDeDataAssignByClientId({
  token,
  newformdata,
}: {
  token: string;
  newformdata: any;
}) {
  
  try {
    const response = await fetch(`${URL}/v2/DriverDeAssign`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function GetDriverDataByClientId({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/v2/AllDrivers`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function GetRfIdByClientId({
  token,
  ClientId,
}: {
  token: string;
  ClientId: string;
}) {
  try {
    const response = await fetch(`${URL}/getrfidbyclientid`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ ClientId }),
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function onAssignRfid({
  token,
  ClientId,
}: {
  token: string;
  ClientId: string;
}) {
  try {
    const response = await fetch(`${URL}/AssignRfidToDriver`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ ClientId }),
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function GetDriverDataAssignByClientId({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/v2/driverAssignList`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function GetDriverforvehicel({
  token,
  clientId,
}: {
  token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/v2/GetAvailableVehiclesForDriver`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function ZoneFindById({
  token,
  id,
}: {
  token: string;
  id: string;
}) {
  try {
    const response = await fetch(`${URL}/findById`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"id\":\"${id}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function alertSettingCountZone({
  token,
  clientId,
  zoneId,
}: {
  token: string;
  clientId: string;
  zoneId: string;
}) {
  try {
    const response = await fetch(`${URL}/alertSettingCountZone`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\", \"zoneId\":\"${zoneId}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function zoneRuleDeleteByZoneId({
  token,
  id,
}: {
  token: string;
  id: string;
}) {
  try {
    const response = await fetch(`${URL}/zoneRuleDeleteByZoneId`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"id\":\"${id}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function zonevehicleByZoneId({
  token,
  zoneId,
}: {
  token: string;
  zoneId: string;
}) {
  try {
    const response = await fetch(
      `${URL}/NotificationCenter/zonevehicleByZoneId`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: `{\"zoneId\":\"${zoneId}\"}`,
        method: "POST",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function modifyCollectionStatus({
  token,
  collectionName,
}: {
  token: string;
  collectionName: string;
}) {
  try {
    const response = await fetch(`${URL}/modifyCollectionStatus`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"collectionName\":\"${collectionName}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}
export async function getSearchAddress({
  query,
  country,
}: {
  query: string;
  country: string;
}) {
  try {
   
    const response = await fetch(
      `${URL}/zoneaddresssearch?q=${query},${country}`,
      {
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json",
          "Content-Security-Policy": "default-src 'self' https: http:",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
   
  } catch (error) {
    
    return [];
  }
}
export async function postZoneDataByClientId({
  token,
  newformdata,
}: {
  token: string;
  newformdata: zonelistType;
}) {
  try {
    const response = await fetch(`${URL}/zone`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(newformdata),
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function zoneDelete({ token, id }: { token: any; id: string }) {
  try {
    
    const response = await fetch(`${URL}/zoneDelete`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"id\":\"${id}\"}`,
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function zonenamesearch({
  token,
  filter,
  clientId,
}: {
  token: string;
  filter: object;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/zonenamesearch`, {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ clientId: clientId, Filters: [filter] }),
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    
    return [];
  }
}

export async function TripsByBucketAndVehicle({
  token,
  payload,
}: {
  token: string;
  payload: replayreport;
}) {
  try {
    const response = await fetch(`${URL}/v2/TripsByBucketAndVehicleV2`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function TravelHistoryByBucketV2({
  token,
  payload,
}: {
  token: string;
  payload: replayreport;
}) {
  try {
    const response = await fetch(`${URL}/v2/TravelHistoryByBucketV2`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function TripAddress({
  lat,
  lng,
  token,
}: {
  lat: number;
  lng: number;
  token: string;
}) {
  try {
    const response = await fetch(`${URL}/NotificationCenter/tripAddress`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function getCurrentAddress({
  lat,
  lon,
  token,
}: {
  lat: number;
  lon: number;
  token: string;
}) {
  try {
    const response = await fetch(
      `http://osm.vtracksolutions.com/nominatim/reverse.php?lat=${lat}&lon=${lon}&zoom=19&format=jsonv2`,
      {
        method: "GET",
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function GetLicenseById({
  // token,
  id,
}: {
  // token: string
  id: string;
}) {
  try {
    const response = await fetch(`${URL}/GetLicenseById`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        // authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"id\":\"${id}\"}`,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function GetUsersByClientId({
  // token,
  clientId,
}: {
  // token: string;
  clientId: string;
}) {
  try {
    const response = await fetch(`${URL}/GetUsersByClientId`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
        // authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: `{\"clientId\":\"${clientId}\"}`,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}

export async function sentSmsForCamera({
  token,
  vehicleId,
  clientId,
}: {
   token: string;
  vehicleId: string;
  clientId: string;
}) {
  try {
    let payload  =  {
      vehicleId,
  clientId,

    }
    
    const response = await fetch(`${URL}/commandSenddAdd`, {
      method: "POST",
      headers: {
        accept: "application/json, text/plain, */*",
         authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from the API");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching data", error);
    return [];
  }
}