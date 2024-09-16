"use client";
import React, { useRef } from "react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  getVehicleDataByClientId,
  ImmobiliseRequest,
  portalGprsCommand,
  vehiclebyClientidbyimmobilising,
  Verifyimmobiliserequest
} from "@/utils/API_CALLS";
// import { pictureVideoDataOfVehicleT } from "@/types/videoType";
import Select from "react-select";
import moment from "moment-timezone";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { Toaster, toast } from "react-hot-toast";
// import "./newstyle.css";
import { Modal, Fade, Box } from "@mui/material";
const modalStyles = {
  bgcolor: "white",
  width: "30%",
  height: "25%",
  zIndex: 1300,
  position: "absolute",
  top: "50%",
  left: "50%",
  textAlign: "center",
  p: 9,
  transform: "translate(-50%, -50%)"
};

export default function Request({setgprsdataget}:any) {
  const { data: session } = useSession();
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<DeviceAttach | null>(
    ""
  );
  const [open, setopen] = useState(false);
  const [activate, setactivate] = useState(false);
  const [deactivate, setdeactivate] = useState(false);

  const [status, setStatus] = useState("");
  const [otp, setOtp] = useState("");
  const [command, setCommand] = useState("");
  const selectedVehicleRef = useRef(selectedVehicle);
  useEffect(() => {
    selectedVehicleRef.current = selectedVehicle;
  }, [selectedVehicle]);

  useEffect(() => {
    const vehicleListData = async () => {
      try {
        if (session?.userRole == "Admin" || session?.userRole == "Controller") {
          const Data = await vehiclebyClientidbyimmobilising({
            token: session.accessToken,
            clientId: session?.clientId
          });
          // setVehicleList(Data.data);

                    const data = await getVehicleDataByClientId(session?.clientId)
                    let parsedData = JSON.parse(
                      data?.data?.Value
                    )?.cacheList;
                    let d = Data.data.map((i)=>{
                      return( parsedData.map((j)=>{
                        if(i.vehicleReg==j.vehicleReg){
          return {

            vehicleReg:i?.vehicleReg,
            dualCam:i?.dualCam,
            immobilising:i?.immobilising,
            camStatus:j.camStatus?.value,
            immStatus:j.immStatus?.value,
            deviceIMEI:i.deviceIMEI
          }
                        }

                      }))[0]
                    })
                    

                    setVehicleList(d);
        }
      } catch (error) {
        console.error("Error fetching zone data:", error);
      }
    };
    vehicleListData();
  }, []);

  const handleClose = () => {
    setopen(false);
    setOtp("");
    setSelectedVehicle("");
  };
  const handleSelectChange = async (e: any) => {
    const selectedVehicleId = e;

    const data = await getVehicleDataByClientId(session?.clientId);
    let parsedData = JSON.parse(data?.data?.Value)?.cacheList;
    let d = parsedData.filter((i) => {
      return i.vehicleReg == selectedVehicleId?.value
      // if (i.vehicleReg == selectedVehicleId?.value) {
      //   return {
      //     vehicleReg: i?.vehicleReg,         
      //     camStatus: i.camStatus?.value,
      //     immStatus: i.immStatus?.value
      //   };
      // }
    })[0];
    
    const selectedVehicle = {
      camStatus:d.camStatus?.value,
      immStatus:d.immStatus?.value,
// deviceIMEI:d.deviceIMEI,
      ...vehicleList.find(
        (vehicle) => vehicle.vehicleReg === selectedVehicleId?.value
      )
    };
    
    
    if (selectedVehicle.dual && selectedVehicle.immobilising) {
      if (selectedVehicle.immStatus == 0) {
        setdeactivate(true);
        setactivate(false);
      } else {
        setdeactivate(false);
        setactivate(true);
      }
    } else if (selectedVehicle.immobilising) {
      if (selectedVehicle.camStatus == 0) {
        setdeactivate(true);
        setactivate(false);
      } else {
        setdeactivate(false);
        setactivate(true);
      }
    }
    // localStorage.setItem("selectedVehicle", selectedVehicle?.vehicleReg);
    setSelectedVehicle(selectedVehicle || null);
  };
  const options =
    vehicleList?.length > 0
      ? vehicleList?.map((item: any) => ({
          value: item?.vehicleReg,
          label: item?.vehicleReg
        }))
      : [];

  const handleStatus = async (statu: any) => {
    if (selectedVehicle == "" || selectedVehicle == null) {
      toast.error("Select vehicle first");
      return;
    }
    const response = await ImmobiliseRequest({
      token: session?.accessToken,
      payload: {
        clientId: session?.clientId,
        deviceIMEI: selectedVehicle?.deviceIMEI,
        vehicleReg: selectedVehicle?.vehicleReg
      }
    });

    if (response.success) {
      setStatus(statu);
      setopen(true);
    } else {
      toast.error(response.message);
    }
  };
  const handleSubmit = async () => {
    const response = await Verifyimmobiliserequest({
      token: session?.accessToken,
      payload: {
        clientId: session?.clientId,
        deviceIMEI: selectedVehicle?.deviceIMEI,
        vehicleReg: selectedVehicle?.vehicleReg,
        otp
      }
    });

    if (response.success) {
      let formvalues;
      if (selectedVehicle?.dualCam) {
        formvalues = {
          commandtext: status == "activate" ? "setdigout 2" : "setdigout 0",
          requestStatus:status,
          modifyDate: "",
          parameter: "",
          deviceIMEI: selectedVehicle?.deviceIMEI,
          status: "Pending",
          clientId: session?.clientId,
          createdDate: moment(new Date())
            .tz(session?.timezone)
            .format("MM/DD/YYYY hh:mm:ss"),
          vehicleReg: selectedVehicle?.vehicleReg
        };
      } else {
        formvalues = {
          commandtext: status == "activate" ? "setdigout 1" : "setdigout 0",
          modifyDate: "",
          parameter: "",
          requestStatus:status,
          deviceIMEI: selectedVehicle?.deviceIMEI,
          status: "Pending",
          clientId: session?.clientId,
          createdDate: moment(new Date())
            .tz(session?.timezone)
            .format("MM/DD/YYYY hh:mm:ss"),
          vehicleReg: selectedVehicle?.vehicleReg
        };
      }

      if (session) {
        const response = await toast.promise(
          portalGprsCommand({
            token: session?.accessToken,
            payload: formvalues
          }),
          {
            loading: "Sending command...",
            success: "Command Send successfully!",
            error: "Error Sending Command. Please try again."
          },
          {
            style: {
              border: "1px solid #00B56C",
              padding: "16px",
              color: "#1A202C"
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE"
              }
            },
            error: {
              duration: 2000,
              iconTheme: {
                primary: "#00B56C",
                secondary: "#FFFAEE"
              }
            }
          }
        );
        setgprsdataget(true)
      }
      setOtp("");
      setopen(false);
      setSelectedVehicle("");
    } else {
      toast.error(response.message);
    }
  };

  const selectedOption =
    options.find((option) => option.value === selectedVehicle?.vehicleReg) ||
    null;

  return (
    <div className="p-4 bg-bgLight">
      {/* Container for responsive layout */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-1 md:grid-cols-7">
        {/* Vehicle Select */}
        <div className="">
          <Select
            value={selectedOption}
            onChange={handleSelectChange}
            options={options}
            placeholder="Pick Vehicle"
            isClearable
            isSearchable
            noOptionsMessage={() => "No options available"}
            className="rounded-md outline-green border border-grayLight hover:border-green"
            styles={{
              control: (provided, state) => ({
                ...provided,
                border: "none",
                boxShadow: state.isFocused ? null : null
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? "#00B56C"
                  : state.isFocused
                  ? "#E1F0E3"
                  : "transparent",
                color: state.isSelected
                  ? "white"
                  : state.isFocused
                  ? "black"
                  : "black",
                "&:hover": {
                  backgroundColor: "#E1F0E3",
                  color: "black"
                }
              })
            }}
          />
        </div>
        {/* <div className="col-span-1">
          <Select
            value={selectedcommand}
            onChange={handlesetCommand}
            options={options2}
            placeholder="Pick Command"
            isClearable
            isSearchable
            noOptionsMessage={() => "No Command available"}
            className="rounded-md w-full outline-green border border-grayLight hover:border-green"
            styles={{
              control: (provided, state) => ({
                ...provided,
                border: "none",
                boxShadow: state.isFocused ? null : null
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isSelected
                  ? "#00B56C"
                  : state.isFocused
                  ? "#E1F0E3"
                  : "transparent",
                color: state.isSelected
                  ? "white"
                  : state.isFocused
                  ? "black"
                  : "black",
                "&:hover": {
                  backgroundColor: "#E1F0E3",
                  color: "black"
                }
              })
            }}
          />
        </div> */}
        <div className="col-span-2 ml-4">
          <button
            className={`bg-green px-4 py-2 text-white ${
              activate ? "opacity-50 cursor-not-allowed" : ""
            } `}
            onClick={() => {
              handleStatus("activate");
            }}
            disabled={activate}
          >
            Activate
          </button>
          <button
            className={`bg-green px-4 py-2 ml-2 text-white ${
              deactivate ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              handleStatus("deactivate");
            }}
            disabled={deactivate}
          >
            Deactivate
          </button>
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        // BackdropComponent={Backdrop}
        // BackdropProps={{
        //   timeout: 500,
        //   style: {
        //     backgroundColor:
        //       "transparent",
        //     filter: "blur(19px)",
        //   },
        // }}
      >
        <Fade in={open}>
          <Box sx={modalStyles}>
            <a
              onClick={handleClose}
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                fontWeight: "bold",
                fontSize: "16px",
                width: "30px",
                height: "30px",
                backgroundColor: "red",
                color: "white",
                cursor: "pointer",
                padding: "2px",
                borderRadius: "50%",
                textAlign: "center"
              }}
            >
              X
            </a>

            <p className="text-green mb-5 font-bold text-center">
              Enter Otp which you have received in your Email address
            </p>
            <input
              type="text"
              value={otp}
              className="border border-grayLight w-full outline-green hover:border-green transition duration-700 ease-in-out "
              onChange={(e: any) => setOtp(e.target.value)}
            />
            <div className="mt-6">
              <button
                className={`bg-green px-4 py-2 pr-8 pl-8 text-white`}
                onClick={handleSubmit}
              >
                {"  "}
                OK
                {"  "}
              </button>
              <button
                className={`bg-red px-4 py-2 ml-4 text-white`}
                onClick={handleClose}
              >
                Cancle
              </button>
            </div>
          </Box>
        </Fade>
      </Modal>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}
