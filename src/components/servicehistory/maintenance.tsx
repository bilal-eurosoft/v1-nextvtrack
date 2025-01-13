"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Select from "react-select";
import { MuiPickersUtilsProvider, DatePicker, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns"; // Correcting to DateFnsUtils
import EventIcon from "@material-ui/icons/Event"; // Event icon for calendar
import { getDocuments, handleServiceHistoryRequest } from "@/utils/API_CALLS";
import { format } from 'date-fns'; // Import format from date-fns

export default function Maintenance({ maintenancedata, singleVehicleDetail }: any) {
  const { data: session } = useSession();

  const [modalOpen, setModalOpen] = useState(false);
  const [updateData, setupdateData] = useState(false);
  const [fetchedMaintencebyVehicle, setfetchedMaintencebyVehicle] = useState([]);
  const initialFormData = {
    id: "",
    clientId: "",
    vehicleId: "",
    serviceTitle: "",
    dataType: "",
    maintenanceType: ""
  }

  const [formData, setFormData] = useState(initialFormData);


  useEffect(() => {
    const d = maintenancedata.filter((item) => item.vehicleId === singleVehicleDetail?._id);
    setfetchedMaintencebyVehicle(d);
    setFormData((prevData) => ({
      ...prevData,
      clientId: singleVehicleDetail?.clientId,
      vehicleId: singleVehicleDetail?._id,
      dataType: "Maintenance"
    }));

  }, [maintenancedata, updateData]);

  // Effect to fetch services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const fetchedServices = await fetchServicesFromAPI();
        if (fetchedServices.length > 0) {
          const filteredServices = fetchedServices?.filter(
            (service: any) => service.dataType === 'Maintenance' && service.vehicleId === singleVehicleDetail?._id
          );
          setfetchedMaintencebyVehicle(filteredServices);

        } else {
          setfetchedMaintencebyVehicle([]);
        }
      } catch (error) {
        toast.error("Failed to load services.");
      } finally {

      }
    };
    loadServices();
  }, []);


  const fetchServicesFromAPI = async () => {
    if (session) {
      try {
        const Data = await handleServiceHistoryRequest({
          token: session.accessToken,
          method: "GET",
        });

        return Data;
        setupdateData(!updateData)
      } catch (error) {
        toast.error("Failed to load services.");
        return [];
      }
    }
  };

  const loadServices = async () => {
    try {
      const fetchedServices = await fetchServicesFromAPI();
      if (fetchedServices.length > 0) {
        const filteredServices = fetchedServices?.filter(
          (service: any) => service.dataType === 'Maintenance' && service.vehicleId === singleVehicleDetail?._id
        );
        setfetchedMaintencebyVehicle(filteredServices);
      } else {
        setfetchedMaintencebyVehicle([]);
      }
    } catch (error) {
      toast.error("Failed to load services.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));


  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id == "") {
      const Data = await handleServiceHistoryRequest({
        token: session?.accessToken,
        method: "POST",
        body: formData,
      });

      if (Data.success == true) {
        toast.success(Data.message);
        setModalOpen(false);
        setFormData((prev) => ({
          ...prev,
          id: "",
          maintenanceType: "",
          serviceTitle: ""
        }));
        await loadServices()
      }
    }
    else {
      const Data = await handleServiceHistoryRequest({
        token: session?.accessToken,
        method: "PUT",
        body: formData,
      });

      if (Data.success == true) {
        toast.success(Data.message);
        setModalOpen(false);
        setFormData((prev) => ({
          ...prev,
          id: "",
          maintenanceType: "",
          serviceTitle: ""
        }));
        await loadServices()
      }
    }


  }

  const openUpdateModal = (service: any) => {


    //  setFormData(service);
    if (service.dataType === "Maintenance") {
      let payload = {
        id: service._id,
        clientId: service.clientId,
        vehicleId: service.vehicleId,
        dataType: "Maintenance",
        serviceTitle: service.serviceTitle,
        maintenanceType: service.maintenanceType
      }

      setFormData(payload);
      setModalOpen(true);
    }
  }

  const handledelete = async (id) => {

    const Data = await handleServiceHistoryRequest({
      token: session?.accessToken,
      method: "DELETE",
      body: id,
    });

    if (Data.success == true) {
      toast.success(Data.message);
      setFormData((prev) => ({
        ...prev,
        id: "",
        maintenanceType: "",
        serviceTitle: ""
      }));
      await loadServices()
    }
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="ml-auto mb-4 px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20px"
          height="20px"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            d="M12 5v14M5 12h14"
          />
        </svg>
        Add Maintenance
      </button>

      <div className="relative">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {/*   <div className="bg-white shadow-md rounded-lg overflow-auto"> */}


            <table className="min-w-full table-auto">
              <thead className="bg-[#E2E8F0]">
                <tr>
                  <th className="px-2 py-1 text-center w-[130px]">Work Order</th>
                  <th className="px-2 py-1 text-left">Service Task</th>
                  <th className="px-2 py-1 text-left">Vehicle Reg	</th>
                  <th className="px-2 py-1 text-left">Maintenance Type</th>
                  <th className="px-2 py-1 text-left ">Created Date</th>
                  <th className="px-2 py-1 text-center w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(fetchedMaintencebyVehicle.length === 0) ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  fetchedMaintencebyVehicle.map((service, index) => (
                    <tr key={service._id}>
                      <td className="px-2 py-1 text-center">{index + 1}</td>
                      <td className="px-2 py-1">{service.serviceTitle}</td>
                      <td className="px-2 py-1">{service.vehicleReg}</td>
                      <td className="px-2 py-1">{service.file ? ("-") : (service.maintenanceType)} </td>
                      <td className="px-2 py-1">{service.file ? (new Date(service.createdAt).toISOString().split('T')[0]) : ("")}  </td> {/* craeeyed date */}


                      <td className="w-[180px]">
                        <div className="flex justify-end mr-14  gap-2 items-center">

                          {service.file && service.file != "null" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                              viewBox="0 0 32 32"
                              xmlSpace="preserve"
                              width="23"
                              height="23"
                              onClick={() => window.open(service.file, "_blank")} // Opens the file in a new tab
                              className="cursor-pointer hover:shadow-lg"
                            >
                              <style type="text/css">
                                {`
              .st0 {
                fill: none;
                stroke: #000000;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
                stroke-miterlimit: 10;
              }
            `}
                              </style>
                              <path className="st0" d="M29,16c0,0-5.8,8-13,8S3,16,3,16s5.8-8,13-8S29,16,29,16z" />
                              <circle className="st0" cx="16" cy="16" r="4" />
                            </svg>
                          )}
                          <svg
                            className="w-4 h-4 text-red-600 cursor-pointer hover:shadow-lg"
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.0"
                            width="512.000000pt"
                            height="512.000000pt"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"
                            onClick={() => handledelete(service._id)}
                          >
                            <g
                              transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                              fill="#000000"
                              stroke="none"
                            >
                              <path d="M1801 5104 c-83 -22 -165 -71 -224 -133 -99 -104 -137 -210 -137 -383 l0 -107 -509 -3 c-497 -3 -510 -4 -537 -24 -53 -39 -69 -71 -69 -134 0 -63 16 -95 69 -134 l27 -21 2139 0 2139 0 27 21 c53 39 69 71 69 134 0 63 -16 95 -69 134 -27 20 -40 21 -537 24 l-509 3 0 107 c0 173 -38 279 -137 383 -61 64 -141 111 -228 134 -85 22 -1431 21 -1514 -1z m1485 -330 c60 -44 69 -67 72 -185 l4 -109 -801 0 -801 0 0 94 c0 102 9 137 43 175 48 52 32 51 769 48 676 -2 687 -2 714 -23z" />
                              <path d="M575 3826 c-41 -18 -83 -69 -90 -109 -7 -36 129 -3120 144 -3270 7 -78 16 -113 44 -170 62 -132 171 -223 306 -259 61 -16 181 -17 1581 -17 1400 0 1520 1 1581 17 135 36 244 127 306 259 28 57 37 92 44 170 16 153 151 3243 144 3275 -9 39 -52 88 -92 104 -48 20 -3923 20 -3968 0z m3735 -353 c-1 -27 -31 -721 -69 -1544 -66 -1466 -68 -1497 -90 -1532 -12 -21 -40 -44 -65 -56 -42 -21 -46 -21 -1526 -21 -1480 0 -1484 0 -1526 21 -59 28 -84 72 -90 156 -6 77 -134 2944 -134 2992 l0 31 1750 0 1750 0 0 -47z" />
                              <path d="M1590 3033 c-37 -14 -74 -50 -91 -88 -18 -41 -18 -59 21 -953 31 -715 42 -917 54 -939 62 -121 224 -122 283 -3 l22 45 -39 913 c-42 966 -40 941 -92 989 -40 37 -111 53 -158 36z" />
                              <path d="M2495 3026 c-41 -18 -83 -69 -90 -109 -3 -18 -4 -442 -3 -944 3 -903 3 -912 24 -939 39 -53 71 -69 134 -69 63 0 95 16 134 69 21 27 21 34 21 966 0 932 0 939 -21 966 -11 15 -32 37 -46 47 -33 25 -113 32 -153 13z" />
                              <path d="M3420 3029 c-33 -13 -68 -47 -86 -81 -11 -21 -23 -237 -54 -939 -38 -895 -39 -914 -21 -954 54 -123 224 -125 287 -4 12 23 22 211 54 941 39 894 39 913 21 953 -10 23 -33 52 -51 65 -37 26 -111 36 -150 19z" />
                            </g>
                          </svg>

                        </div>
                      </td>





                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>

        </div>
      </div>

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white p-6 rounded-lg w-[30rem]`}>
              <h3 className="text-xl font-bold mb-4 text-center">
                Add Maintenance
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Maintenance Task
                  </label>
                  <input
                    type="text"
                    name="serviceTitle"
                    value={formData.serviceTitle}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-[#CBD5E0] rounded-lg"
                    placeholder="Oil Changing / Tuning, etc."

                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Maintenance Type

                  </label>

                  <div className="mb-4 ml-2 flex items-center">
                    <input
                      type="radio"
                      name="maintenance"
                      checked={formData.maintenance === "" ? false : formData.maintenanceType === "Preventative"}

                      onChange={() =>
                        setFormData({
                          ...formData,
                          maintenanceType: "Preventative"
                        })
                      }
                      className="mr-2"
                    />
                    <label>Preventive maintenance</label>
                  </div>
                  <div className="mb-4 ml-2 flex items-center">
                    <input
                      type="radio"
                      name="maintenance"
                      checked={formData.maintenance === "" ? false : formData.maintenanceType === "Corrective"}

                      onChange={() =>
                        setFormData({
                          ...formData,
                          maintenanceType: "Corrective"
                        })
                      }
                      className="mr-2"
                    />
                    <label>Corrective maintenance</label>
                  </div>

                </div>






                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false); // Close the modal
                      setFormData((prevData) => ({
                        ...prevData,
                        serviceTitle: "",

                        maintenanceType: ""
                      }));
                      /*   seteditModal(false);
                        setTimeValue(null)
                        setFile(null)
                        setFormData(initialFormData); // Reset form data to initial state
                        setselectedserviceDocuments([]) */
                      /*    setFormData(initialFormData)
                         setSelectedDocumentsForAttach([]) */
                    }}
                    className="bg-[#E53E3E] text-white px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button

                    type="submit"
                    className="bg-[#00B56C] text-white px-4 py-2 rounded-lg"
                  >
                    Save
                  </button>
                </div>

              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}


/* 





*/