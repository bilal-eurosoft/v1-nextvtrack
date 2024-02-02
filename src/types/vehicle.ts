export type GPSData = {
  longitude: number;
  latitude: number;
  Altitude: number;
  Angle: number;
  satellites: number;
  speed: number;
  speedUnit: string;
  speedWithUnit: null;
  speedWithUnitDesc: string;
};

export type OSMData = {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: number;
  lon: number;
  place_rank: number;
  category: string;
  type: string;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: {
    office: null;
    postcode: null;
    building: null;
    road: string;
    neighbourhood: string;
    suburb: string;
    town: null;
    city: string;
    county: string;
    state: string;
    country: string;
    country_code: string;
  };
  boundingbox: [number, number, number, number];
};

export type VehicleData = {
  IMEI: string;
  gps: GPSData;
  OSM: OSMData;
  timestamp: string;
  ignition: number;
  vehicleStatusCode: string;
  dualCam: boolean;
  rearCameraDualCamVerify: boolean;
  frontCameraDualCamVerify: boolean;
  rearCameraString: string;
  frontCameraString: string;
  verifyDateTime: string;
  clientId: string;
  vehicleId: string;
  vehicleNo: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleReg: string;
  driverName: string;
  vehicleEventList: any[]; // You can replace this with a more specific type if needed
  zoneName: String;
  zone: String;
  vehicleStatus: string;
  DriverName: string;
};

export type CarMapList = {
  carData: VehicleData[];
};
