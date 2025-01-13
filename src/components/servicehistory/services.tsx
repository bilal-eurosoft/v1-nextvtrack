"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Select from "react-select";
import { MuiPickersUtilsProvider, DatePicker, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns"; // Correcting to DateFnsUtils
import EventIcon from "@material-ui/icons/Event"; // Event icon for calendar
import { handleServiceHistoryRequest, handleServicesRequest, handleServiceStatus } from "@/utils/API_CALLS";
import { format } from 'date-fns'; // Import format from date-fns

export default function Service({ servicedata, singleVehicleDetail }: any) {
  const { data: session } = useSession();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setconfirmModalOpen] = useState(false);
  const [serviceDataforupdate, setserviceDataforupdate] = useState();
  const [EditmodalOpen, setEditmodalOpen] = useState(false);
  // const [updateData, setupdateData] = useState(false);

  const [fetchedservicebyVehicle, setfetchedservicebyVehicle] = useState([]);
  const initialServiceFormData = {
    id: "",
    clientId: '',
    vehicleId: '',
    serviceTitle: [],
    reminderDate: 0,
    reminderMilage: 0,
    expiryDate: 0,
    expiryMilage: 0,
    lastMilage: 0,
    lastDate: 0,
    dataType: '',
    sms: false,
    email: false,
    pushnotification: false,
    isExpiryDateSelected: false,
    isExpiryMileageSelected: false,
    isReminderDateSelected: false,
    isReminderMileageSelected: false,
    isLastDateSelected: false,
    isLastMileageSelected: false,

  };
  const [serviceFormData, setServiceFormData] = useState(initialServiceFormData);

  const [selectedDocumentsForService, setselectedDocumentsForService] = useState([]);
  const [selectedDocumentsForserviceAttach, setselectedDocumentsForserviceAttach] = useState(
    []
  );


  useEffect(() => {
    const d = servicedata.filter((item) => item.vehicleId === singleVehicleDetail?._id);
    setfetchedservicebyVehicle(d);
    setServiceFormData((prevData) => ({
      ...prevData,
      clientId: singleVehicleDetail?.clientId,
      vehicleId: singleVehicleDetail?._id,
      dataType: "Service"
    }));

  }, [servicedata]);

  // Effect to fetch services from API
  useEffect(() => {
    const loadServices = async () => {
      try {
        const fetchedServices = await fetchServicesFromAPI();
        if (fetchedServices.length > 0) {
          const filteredServices = fetchedServices?.filter(
            (service: any) => service.dataType === 'Service' && service.vehicleId === singleVehicleDetail?._id
          );
          setfetchedservicebyVehicle(filteredServices);

        } else {
          setfetchedservicebyVehicle([]);
        }
      } catch (error) {
        toast.error("Failed to load services.");
      }
    };
    loadServices();
  }, []);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const fetchedDocuments = await fetchserviceDocumentsFromAPI();

        if (fetchedDocuments.length > 0) {
          setselectedDocumentsForService(fetchedDocuments);

        } else {
          setselectedDocumentsForService([]); // Empty data set

        }
      } catch (error) {
        toast.error("Failed to load documents.");
        setselectedDocumentsForService([]); // In case of error, set to empty
      }
    };
    loadDocuments();
  }, []);



  const fetchserviceDocumentsFromAPI = async () => {
    if (session) {
      try {
        const Data = await handleServicesRequest({
          token: session.accessToken,
          method: "GET",
        });

        return Data.data;
        //   setupdateData(!updateData)
      } catch (error) {
        toast.error("Failed to load services.");
        return [];
      }
    }
  };




  const handleDocumentsChangeForDocumenttab = (selectedOption) => {
    if (selectedOption) {
      // Add selected document if not already selected
      if (!selectedDocumentsForserviceAttach.some((doc) => doc._id === selectedOption._id)) {
        setselectedDocumentsForserviceAttach([...selectedDocumentsForserviceAttach, selectedOption]);
      }
    }
  };


  const fetchServicesFromAPI = async () => {
    if (session) {
      try {
        const Data = await handleServiceHistoryRequest({
          token: session.accessToken,
          method: "GET",
        });

        return Data;
        // setupdateData(!updateData)
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
          (service: any) => service.dataType === 'Service' && service.vehicleId === singleVehicleDetail?._id
        );
        setfetchedservicebyVehicle(filteredServices);
      } else {
        setfetchedservicebyVehicle([]);
      }
    } catch (error) {
      toast.error("Failed to load services.");
    }
  };

  const handleRemoveDocumentForDocumenttab = (documentId) => {
    setselectedDocumentsForserviceAttach((prev) =>
      prev.filter((doc) => doc._id !== documentId)
    );
  };

  const validateForm = () => {
    // Check if any checkbox is selected and the corresponding field is empty
    if (
      (serviceFormData.isReminderDateSelected && !serviceFormData.reminderDate) ||
      (serviceFormData.isReminderMileageSelected && !serviceFormData.reminderMilage) ||
      (serviceFormData.isExpiryDateSelected && !serviceFormData.expiryDate) ||
      (serviceFormData.isExpiryMileageSelected && !serviceFormData.expiryMilage) ||
      (serviceFormData.isLastDateSelected && !serviceFormData.lastDate) ||
      (serviceFormData.isLastMileageSelected && !serviceFormData.lastMilage)
    ) {
      toast.error("Please fill all the required fields based on your selections.");
      return false;
    }
    if (serviceFormData.isExpiryMileageSelected && Number(singleVehicleDetail.odometer1?.split(" ")[0]) >= serviceFormData.expiryMilage) {
      toast.error(`Expiry Milage must be greater than ${Number(singleVehicleDetail.odometer1?.split(" ")[0])}`);
      return false;
    }

    if (serviceFormData.isReminderMileageSelected && Number(singleVehicleDetail.odometer1?.split(" ")[0]) >= serviceFormData.reminderMilage) {
      toast.error(`Reminder Milage must be greater than ${Number(singleVehicleDetail.odometer1?.split(" ")[0])}`);
      return false;
    }

    // If all required fields are filled
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Proceed with form submission or any other logic



      if (serviceFormData.id == "") {
        const documentData = selectedDocumentsForserviceAttach.map(item => String(item.service));
        const payload = {

          clientId: serviceFormData.clientId,
          vehicleId: serviceFormData.vehicleId,
          pushnotification: serviceFormData.pushnotification,
          sms: serviceFormData.sms,
          email: serviceFormData.email,
          serviceTitle: documentData,
          reminderDate: serviceFormData.isReminderDateSelected ? serviceFormData.reminderDate : "",
          reminderMilage: serviceFormData.isReminderMileageSelected ? serviceFormData.reminderMilage : "",
          expiryDate: serviceFormData.isExpiryDateSelected ? serviceFormData.expiryDate : "",
          expiryMilage: serviceFormData.isExpiryMileageSelected ? serviceFormData.expiryMilage : "",
          lastDate: serviceFormData.isLastDateSelected ? serviceFormData.lastDate : "",
          lastMilage: serviceFormData.isLastMileageSelected ? serviceFormData.lastMilage : "",
          dataType: "Service",

        }

        const Data = await handleServiceHistoryRequest({
          token: session?.accessToken,
          method: "POST",
          body: payload,
        });

        if (Data.success == true) {
          toast.success(Data.message);
          setModalOpen(false);
          setEditmodalOpen(false)
          setselectedDocumentsForserviceAttach([])
          setServiceFormData((prev) => ({
            ...prev, // Correctly spreading the previous state
            id: "",
            serviceTitle: [], // Setting `serviceTitle` to an empty array
            reminderDate: 0,
            reminderMilage: 0,
            expiryDate: 0,
            expiryMilage: 0,
            lastMilage: 0,
            lastDate: 0,
            dataType: '',
            sms: false,
            email: false,
            pushnotification: false,
            isExpiryDateSelected: false,
            isExpiryMileageSelected: false,
            isReminderDateSelected: false,
            isReminderMileageSelected: false,
            isLastDateSelected: false,
            isLastMileageSelected: false,
          }));
          await loadServices()
        }
        else {
          toast.error(Data.message);
        }
      }
      else {

        const payload = {
          id: serviceFormData.id,
          clientId: serviceFormData.clientId,
          vehicleId: serviceFormData.vehicleId,
          pushnotification: serviceFormData.pushnotification,
          sms: serviceFormData.sms,
          email: serviceFormData.email,
          serviceTitle: serviceFormData.serviceTitle,
          reminderDate: serviceFormData.isReminderDateSelected ? serviceFormData.reminderDate : "",
          reminderMilage: serviceFormData.isReminderMileageSelected ? serviceFormData.reminderMilage : "",
          expiryDate: serviceFormData.isExpiryDateSelected ? serviceFormData.expiryDate : "",
          expiryMilage: serviceFormData.isExpiryMileageSelected ? serviceFormData.expiryMilage : "",
          lastDate: serviceFormData.isLastDateSelected ? serviceFormData.lastDate : "",
          lastMilage: serviceFormData.isLastMileageSelected ? serviceFormData.lastMilage : "",
          dataType: "Service",

        }


        const Data = await handleServiceHistoryRequest({
          token: session?.accessToken,
          method: "PUT",
          body: payload,
        });

        if (Data.success == true) {
          toast.success(Data.message);
          setModalOpen(false);
          setEditmodalOpen(false)
          setServiceFormData((prev) => ({
            ...prev, // Correctly spreading the previous state
            id: "",
            serviceTitle: [], // Setting `serviceTitle` to an empty array
            reminderDate: 0,
            reminderMilage: 0,
            expiryDate: 0,
            expiryMilage: 0,
            lastMilage: 0,
            lastDate: 0,
            dataType: '',
            sms: false,
            email: false,
            pushnotification: false,
            isExpiryDateSelected: false,
            isExpiryMileageSelected: false,
            isReminderDateSelected: false,
            isReminderMileageSelected: false,
            isLastDateSelected: false,
            isLastMileageSelected: false,
          }));
          await loadServices()
        }
        else {
          toast.error(Data.message);
        }
      }
    }

  }

  const openUpdateModal = (service: any) => {
    setEditmodalOpen(true)
    //  setFormData(service);
    if (service.dataType === "Service") {
      let payload = {
        id: service._id,
        clientId: service.clientId,
        vehicleId: service.vehicleId,
        serviceTitle: service.serviceTitle,
        reminderDate: service.reminderDate,
        reminderMilage: service.reminderMilage,
        expiryDate: service.expiryDate,
        expiryMilage: service.expiryMilage,
        lastMilage: service.lastMilage,
        lastDate: service.lastDate,
        dataType: service.dataType,
        sms: service.sms,
        email: service.email,
        pushnotification: service.pushnotification,
        isExpiryDateSelected: service.expiryDate ? true : false,
        isExpiryMileageSelected: service.expiryMilage > 0 ? true : false,
        isReminderDateSelected: service.reminderDate ? true : false,
        isReminderMileageSelected: service.reminderMilage > 0 ? true : false,
        isLastDateSelected: service.lastDate ? true : false,
        isLastMileageSelected: service.lastMilage > 0 ? true : false,
      }

      setServiceFormData(payload);
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
      setServiceFormData((prev) => ({
        ...prev, // Correctly spreading the previous state
        id: "",
        serviceTitle: [], // Setting `serviceTitle` to an empty array
        reminderDate: 0,
        reminderMilage: 0,
        expiryDate: 0,
        expiryMilage: 0,
        lastMilage: 0,
        lastDate: 0,
        dataType: '',
        sms: false,
        email: false,
        pushnotification: false,
        isExpiryDateSelected: false,
        isExpiryMileageSelected: false,
        isReminderDateSelected: false,
        isReminderMileageSelected: false,
        isLastDateSelected: false,
        isLastMileageSelected: false,
      }));
      await loadServices()
    }
  }


  const handleserviceChange = (field: 'expiryMilage' | 'reminderMilage' | 'lastMilage', mileage: number) => {
    setServiceFormData((prevState) => ({
      ...prevState,
      [field]: mileage,
    }));
  };

  const handleserviceDateChange = (field: 'expiryDate' | 'reminderDate' | 'lastDate', date: Date | null) => {

    // const formattedDate = date ? date.toISOString().split("T")[0] : null;
    // const formattedDate = format(date, 'dd-MM-yyyy');
    const formattedDate = date ? date.toISOString().split("T")[0] : null;

    // const formattedDate = format(new Date(date), 'MM-dd-yyyy');
    setServiceFormData((prevState) => ({
      ...prevState,
      [field]: formattedDate,
    }));
  };

  const handleserviceCheckboxChange = (
    field: 'isExpiryDateSelected' | 'isExpiryMileageSelected' | 'isReminderDateSelected' | 'isReminderMileageSelected' | 'isLastDateSelected' | 'isLastMileageSelected',
    checked: boolean
  ) => {
    setServiceFormData((prevState) => ({
      ...prevState,
      [field]: checked,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setServiceFormData((prev) => ({
      ...prev,
      [name]: value,
    }));


  };

  const closeConfirmationModal = () => {
    setconfirmModalOpen(false);
    // setSelectedServiceId(null);
  };

  const handleConfirmUpdate = async () => {

    const payload = {
      id: serviceDataforupdate?._id,
      status: "complete"
    }

    if (session) {
      const Data = await handleServiceStatus({
        token: session.accessToken,
        method: "PUT",
        body: payload,
      });
      if (Data?.success == true) {
        closeConfirmationModal();
        toast.success(Data?.message);
        await loadServices()

      } else {
        toast.error(Data?.message);
      }

      return Data;
    }

  };

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
        Attach Service
      </button>

      <div className="relative">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="table-container" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {/*   <div className="bg-white shadow-md rounded-lg overflow-auto"> */}


            <table className="min-w-full table-auto">
              <thead className="bg-[#E2E8F0]">
                <tr>
                  <th className="px-2 py-1 text-center">Work Order</th>
                  <th className="px-2 py-1 text-left">Service Task</th>
                  <th className="px-2 py-1 text-left">Vehicle Reg	</th>

                  <th className="px-2 py-1 text-left">Alert Date</th>
                  <th className="px-2 py-1 text-left">Mileage Alert</th>

                  <th className="px-2 py-1 text-left">Due Date</th>
                  <th className="px-2 py-1 text-left">Mileage Limit</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(fetchedservicebyVehicle.length === 0) ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  fetchedservicebyVehicle.map((service, index) => (
                    <tr key={service._id}>
                      <td className="px-2 py-1 text-center">{index + 1}</td>
                      <td className="px-2 py-1">{service.serviceTitle}</td>
                      <td className="px-2 py-1">{service.vehicleReg}</td>

                      <td className="px-2 py-1">{service.reminderDate}</td>
                      <td className="px-2 py-1">{service.reminderMilage}</td>

                      <td className="px-2 py-1">{service.expiryDate}</td>
                      <td className="px-2 py-1">{service.expiryMilage}</td>

                      <td
                        className={`px-2 py-1 ${service.status === "pending" ? "text-green" :
                          service.status === "due soon" ? "text-[#FFA500]" :
                            service.status === "due" ? "text-red" :
                              service.status === "complete" ? "text-[#007BFF]" : ""}`}
                        style={{ cursor: service.status === "complete" ? 'not-allowed' : 'pointer' }}
                        onClick={() => {
                          if (service.status !== "complete") {
                            setserviceDataforupdate(service);
                            setconfirmModalOpen(true);
                          }
                        }}
                      >
                        {service.status === "pending" ? "Valid" :
                          service.status === "due soon" ? "Due Soon" :
                            service.status === "due" ? "Due" :
                              service.status === "complete" ? "Complete" : ""}
                      </td>

                      <td className="px-2 py-1 text-left">
                        <div className="flex gap-4 justify-start">
                          {/* Edit Icon */}
                          <svg
                            className="w-6 h-6 text-green-600 cursor-pointer hover:shadow-lg"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"
                            onClick={() => openUpdateModal(service)}
                          >
                            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
                              <path d="M4253 5080 c-78 -20 -114 -37 -183 -83 -44 -29 -2323 -2296 -2361 -2349 -21 -29 -329 -1122 -329 -1168 0 -56 65 -120 122 -120 44 0 1138 309 1166 329 15 11 543 536 1174 1168 837 838 1157 1165 1187 1212 74 116 105 270 82 407 -7 39 -30 105 -53 154 -36 76 -55 99 -182 226 -127 127 -150 145 -226 182 -135 65 -260 78 -397 42z m290 -272 c55 -27 258 -231 288 -288 20 -38 24 -60 24 -140 0 -121 -18 -160 -132 -279 l-82 -86 -303 303 -303 303 88 84 c49 46 108 93 132 105 87 42 203 41 288 -2z m-383 -673 l295 -295 -933 -932 -932 -933 -295 295 c-162 162 -295 299 -295 305 0 13 1842 1855 1855 1855 6 0 143 -133 305 -295z m-1822 -2284 c-37 -12 -643 -179 -645 -178 -1 1 30 115 68 252 38 138 79 285 91 329 l21 78 238 -238 c132 -132 233 -241 227 -243z" />
                            </g>
                          </svg>

                          {/* Delete Icon */}
                          <svg
                            className="w-6 h-6 text-red-600 cursor-pointer hover:shadow-lg"
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.0"
                            width="512.000000pt"
                            height="512.000000pt"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"

                            onClick={() => handledelete(service._id)}
                          >
                            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
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
                Attach Service
              </h3>
              <form onSubmit={handleSubmit}>
                {!EditmodalOpen && (
                  <>
                    <div className="selected-documents flex flex-wrap mb-4 gap-4">
                      {selectedDocumentsForserviceAttach.map((document) => (
                        <div
                          key={document._id}
                          className="selected-item flex items-center justify-between w-[30%] mb-2 px-3 py-2 bg-[#dcfce7] text-green-700 rounded-lg text-sm"
                        >
                          <span className="truncate w-[180px]">{document?.service}</span>

                          <button
                            className="text-red text-lg"
                            onClick={() => handleRemoveDocumentForDocumenttab(document._id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>


                    <Select
                      value={null}
                      onChange={handleDocumentsChangeForDocumenttab}
                      options={selectedDocumentsForService.filter(
                        (option) => !selectedDocumentsForserviceAttach.some((doc) => doc._id === option._id)
                      ).map((doc) => ({
                        label: doc.service, // Use the title for display
                        value: doc._id,  // Use _id as the value
                        ...doc, // Keep other properties for later use
                      }))}
                      placeholder="Select Service"
                      isClearable
                      isSearchable
                      noOptionsMessage={() => 'No options available'}
                      className="rounded-md w-full outline-green border border-grayLight hover:border-green"
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          border: 'none',
                          boxShadow: state.isFocused ? null : null,
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected
                            ? '#00B56C'
                            : state.isFocused
                              ? '#e1f0e3'
                              : 'transparent',
                          color: state.isSelected
                            ? 'white'
                            : state.isFocused
                              ? 'black'
                              : 'black',
                          '&:hover': {
                            backgroundColor: '#e1f0e3',
                            color: 'black',
                          },
                        }),
                      }}
                    />
                  </>
                )}
                {EditmodalOpen && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Service Task
                    </label>
                    <input
                      type="text"
                      name="serviceTitle"
                      value={serviceFormData.serviceTitle}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-[#CBD5E0] rounded-lg"
                      placeholder="Oil Changing / Tuning, etc."

                    />
                  </div>
                )}

                <div>
                  {/* Expiry Settings */}
                  <div className="flex checkboxes mt-4">
                    <label className="block text-sm font-medium mb-2 ml-2 mr-[90px]">Expiry </label>

                    {/* Date checkbox */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={serviceFormData.isExpiryDateSelected}
                          onChange={(e) => handleserviceCheckboxChange('isExpiryDateSelected', e.target.checked)}
                          id="expiry-date-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="expiry-date-checkbox" className="text-sm">
                          Date
                        </label>
                      </div>
                    </div>
                    {/* Mileage checkbox */}
                    <div className="flex items-center mb-4 ">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          disabled={
                            Number(singleVehicleDetail?.odometer1?.split(" ")[0]) == 0 ||
                            !singleVehicleDetail?.odometer1
                          }
                          checked={serviceFormData.isExpiryMileageSelected}
                          onChange={(e) => handleserviceCheckboxChange('isExpiryMileageSelected', e.target.checked)}
                          id="expiry-mileage-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="expiry-mileage-checkbox" className="text-sm">
                          Mileage
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Date Picker */}
                  <div className="flex items-center mb-4">
                    {serviceFormData.isExpiryDateSelected && (
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DatePicker
                          value={serviceFormData.expiryDate ? new Date(serviceFormData.expiryDate) : null}
                          onChange={(date) => handleserviceDateChange('expiryDate', date)}
                          format="dd-MM-yyyy"
                          variant="dialog"
                          minDate={new Date()}
                          disabled={!serviceFormData.isExpiryDateSelected}
                          placeholder="Expiry Date"
                          autoOk
                          inputProps={{ readOnly: true }}
                          style={{
                            width: '435px',
                            padding: '10px',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                          }}
                          InputProps={{
                            endAdornment: <EventIcon style={{ width: '20px', height: '20px' }} className="text-gray" />,
                          }}
                          DialogProps={{
                            PaperProps: {
                              style: {
                                backgroundColor: '#f4f6f8',
                                borderRadius: '10px',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                              },
                            },
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    )}
                  </div>

                  {/* Expiry Mileage Input */}
                  <div className="flex items-center mb-4 ">
                    {serviceFormData.isExpiryMileageSelected && (
                      <input
                        type="number"
                        value={serviceFormData.expiryMilage || null}
                        onChange={(e) => handleserviceChange('expiryMilage', Number(e.target.value))}
                        placeholder="Expiry mileage"
                        className="p-2 border border-[#e4e4e7] rounded-lg w-[435px]"
                      />
                    )}
                  </div>

                  {/* Reminder Settings */}
                  <div className="flex checkboxes mt-4">
                    <label className="block text-sm font-medium mb-2 ml-2 mr-[70px]">Reminder </label>

                    {/* Date checkbox */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          checked={serviceFormData.isReminderDateSelected}
                          onChange={(e) => handleserviceCheckboxChange('isReminderDateSelected', e.target.checked)}
                          id="reminder-date-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="reminder-date-checkbox" className="text-sm">
                          Date
                        </label>
                      </div>
                    </div>

                    {/* Mileage checkbox */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          disabled={
                            Number(singleVehicleDetail?.odometer1?.split(" ")[0]) == 0 ||
                            !singleVehicleDetail.odometer1
                          }
                          checked={serviceFormData.isReminderMileageSelected}
                          onChange={(e) => handleserviceCheckboxChange('isReminderMileageSelected', e.target.checked)}
                          id="reminder-mileage-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="reminder-mileage-checkbox" className="text-sm">
                          Mileage
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Reminder Date Picker */}
                  <div className="flex items-center mb-4">
                    {serviceFormData.isReminderDateSelected && (
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DatePicker
                          value={serviceFormData.reminderDate ? new Date(serviceFormData.reminderDate) : null}
                          onChange={(date) => handleserviceDateChange('reminderDate', date)}
                          format="dd-MM-yyyy"
                          variant="dialog"
                          minDate={new Date()}
                          disabled={!serviceFormData.isReminderDateSelected}
                          placeholder="Reminder Date"
                          autoOk
                          inputProps={{ readOnly: true }}
                          style={{
                            width: '435px',
                            padding: '10px',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                          }}
                          InputProps={{
                            endAdornment: <EventIcon style={{ width: '20px', height: '20px' }} className="text-gray" />,
                          }}
                          DialogProps={{
                            PaperProps: {
                              style: {
                                backgroundColor: '#f4f6f8',
                                borderRadius: '10px',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                              },
                            },
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    )}
                  </div>

                  {/* Reminder Mileage Input */}
                  <div className="flex items-center mb-4">
                    {serviceFormData.isReminderMileageSelected && (
                      <input
                        type="number"
                        value={serviceFormData.reminderMilage || null}
                        onChange={(e) => handleserviceChange('reminderMilage', Number(e.target.value))}
                        placeholder="Reminder mileage"
                        className="p-2 border border-[#e4e4e7] rounded-lg w-[435px]"
                      />
                    )}
                  </div>

                  {/* Last Settings */}
                  <div className="flex checkboxes mt-4">
                    <label className="block text-sm font-medium mb-2 ml-2 mr-[30px]">Last Carried Out</label>

                    {/* Date checkbox */}

                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"

                          checked={serviceFormData.isLastDateSelected}
                          onChange={(e) => handleserviceCheckboxChange('isLastDateSelected', e.target.checked)}
                          id="last-date-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="last-date-checkbox" className="text-sm">
                          Date
                        </label>
                      </div>
                    </div>

                    {/* Mileage checkbox */}
                    <div className="flex items-center mb-4">
                      <div className="flex items-center mr-4">
                        <input
                          type="checkbox"
                          disabled={
                            Number(singleVehicleDetail?.odometer1?.split(" ")[0]) == 0 ||
                            !singleVehicleDetail.odometer1
                          }
                          checked={serviceFormData.isLastMileageSelected}
                          onChange={(e) => handleserviceCheckboxChange('isLastMileageSelected', e.target.checked)}
                          id="last-mileage-checkbox"
                          className="mr-2"
                        />
                        <label htmlFor="last-mileage-checkbox" className="text-sm">
                          Mileage
                        </label>
                      </div>
                    </div>


                  </div>

                  {/* Last Date Picker */}
                  <div className="flex items-center mb-4">
                    {serviceFormData.isLastDateSelected && (
                      <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DatePicker
                          value={serviceFormData.lastDate ? new Date(serviceFormData.lastDate) : null}
                          onChange={(date) => handleserviceDateChange('lastDate', date)}
                          format="dd-MM-yyyy"
                          variant="dialog"
                          maxDate={new Date()}
                          disabled={!serviceFormData.isLastDateSelected}
                          placeholder="Last Date"
                          autoOk
                          inputProps={{ readOnly: true }}
                          style={{
                            width: '435px',
                            padding: '10px',
                            fontSize: '14px',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                          }}
                          InputProps={{
                            endAdornment: <EventIcon style={{ width: '20px', height: '20px' }} className="text-gray" />,
                          }}
                          DialogProps={{
                            PaperProps: {
                              style: {
                                backgroundColor: '#f4f6f8',
                                borderRadius: '10px',
                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
                              },
                            },
                          }}
                        />
                      </MuiPickersUtilsProvider>
                    )}
                  </div>

                  {/* Last Mileage Input */}
                  <div className="flex items-center mb-4">
                    {serviceFormData.isLastMileageSelected && (
                      <input
                        type="number"
                        value={serviceFormData.lastMilage || null}
                        onChange={(e) => handleserviceChange('lastMilage', Number(e.target.value))}
                        placeholder="Last mileage"
                        className="p-2 border border-[#e4e4e7] rounded-lg w-[435px]"
                      />
                    )}
                  </div>
                </div>
                <>
                  <label className="block text-sm font-medium mb-2 ml-2">
                    Alert types
                  </label>
                  <div className="mb-2 ml-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={serviceFormData.sms}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, sms: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <label>SMS</label>
                  </div>
                  <div className="mb-2 ml-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={serviceFormData.email}
                      onChange={(e) =>
                        setServiceFormData({ ...serviceFormData, email: e.target.checked })
                      }
                      className="mr-2"
                    />
                    <label>Email</label>
                  </div>
                  <div className="mb-4 ml-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={serviceFormData.pushnotification}
                      onChange={(e) =>
                        setServiceFormData({
                          ...serviceFormData,
                          pushnotification: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    <label>Push Notifications</label>
                  </div>
                </>






                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false); // Close the modal
                      setselectedDocumentsForserviceAttach([])
                      setEditmodalOpen(false)
                      setServiceFormData((prev) => ({
                        ...prev, // Correctly spreading the previous state
                        id: "",
                        serviceTitle: [], // Setting `serviceTitle` to an empty array
                        reminderDate: 0,
                        reminderMilage: 0,
                        expiryDate: 0,
                        expiryMilage: 0,
                        lastMilage: 0,
                        lastDate: 0,
                        dataType: '',
                        sms: false,
                        email: false,
                        pushnotification: false,
                        isExpiryDateSelected: false,
                        isExpiryMileageSelected: false,
                        isReminderDateSelected: false,
                        isReminderMileageSelected: false,
                        isLastDateSelected: false,
                        isLastMileageSelected: false,
                      }));

                      /*  setFormData((prevData) => ({
                           ...prevData,
                           serviceTitle: "",
                      
                           maintenanceType: ""
                         })); */

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
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg w-full sm:w-1/3 z-10 max-w-lg">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 text-white rounded-full mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#ffffff"
                  width="40px"
                  height="40px"
                  viewBox="0 0 1920.00 1920.00"
                  stroke="#ffffff"
                  strokeWidth="5.76"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0">
                    <rect
                      x="0"
                      y="0"
                      width="1920.00"
                      height="1920.00"
                      rx="960"
                      fill="#00B56C"
                    />
                  </g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M960 0c530.193 0 960 429.807 960 960s-429.807 960-960 960S0 1490.193 0 960 429.807 0 960 0Zm0 101.053c-474.384 0-858.947 384.563-858.947 858.947S485.616 1818.947 960 1818.947 1818.947 1434.384 1818.947 960 1434.384 101.053 960 101.053Zm-42.074 626.795c-85.075 39.632-157.432 107.975-229.844 207.898-10.327 14.249-10.744 22.907-.135 30.565 7.458 5.384 11.792 3.662 22.656-7.928 1.453-1.562 1.453-1.562 2.94-3.174 9.391-10.17 16.956-18.8 33.115-37.565 53.392-62.005 79.472-87.526 120.003-110.867 35.075-20.198 65.9 9.485 60.03 47.471-1.647 10.664-4.483 18.534-11.791 35.432-2.907 6.722-4.133 9.646-5.496 13.23-13.173 34.63-24.269 63.518-47.519 123.85l-1.112 2.886c-7.03 18.242-7.03 18.242-14.053 36.48-30.45 79.138-48.927 127.666-67.991 178.988l-1.118 3.008a10180.575 10180.575 0 0 0-10.189 27.469c-21.844 59.238-34.337 97.729-43.838 138.668-1.484 6.37-1.484 6.37-2.988 12.845-5.353 23.158-8.218 38.081-9.82 53.42-2.77 26.522-.543 48.24 7.792 66.493 9.432 20.655 29.697 35.43 52.819 38.786 38.518 5.592 75.683 5.194 107.515-2.048 17.914-4.073 35.638-9.405 53.03-15.942 50.352-18.932 98.861-48.472 145.846-87.52 41.11-34.26 80.008-76 120.788-127.872 3.555-4.492 3.555-4.492 7.098-8.976 12.318-15.707 18.352-25.908 20.605-36.683 2.45-11.698-7.439-23.554-15.343-19.587-3.907 1.96-7.993 6.018-14.22 13.872-4.454 5.715-6.875 8.77-9.298 11.514-9.671 10.95-19.883 22.157-30.947 33.998-18.241 19.513-36.775 38.608-63.656 65.789-13.69 13.844-30.908 25.947-49.42 35.046-29.63 14.559-56.358-3.792-53.148-36.635 2.118-21.681 7.37-44.096 15.224-65.767 17.156-47.367 31.183-85.659 62.216-170.048 13.459-36.6 19.27-52.41 26.528-72.201 21.518-58.652 38.696-105.868 55.04-151.425 20.19-56.275 31.596-98.224 36.877-141.543 3.987-32.673-5.103-63.922-25.834-85.405-22.986-23.816-55.68-34.787-96.399-34.305-45.053.535-97.607 15.256-145.963 37.783Zm308.381-388.422c-80.963-31.5-178.114 22.616-194.382 108.33-11.795 62.124 11.412 115.76 58.78 138.225 93.898 44.531 206.587-26.823 206.592-130.826.005-57.855-24.705-97.718-70.99-115.729Z"
                      fillRule="evenodd"
                    />
                  </g>
                </svg>
              </div>
              <h2 className="text-xl sm:text-lg font-semibold">
                Confirm Update
              </h2>
            </div>
            <p>

              Are you sure you want to Update this service status to Complete

            </p>

            {/* Modal Buttons */}
            <div className="mt-4 text-right">
              <button
                onClick={closeConfirmationModal}
                className="bg-[#d1d5db] px-4 py-2 rounded mr-2 hover:bg-[#e5e7eb]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpdate}
                className="bg-[#00B56C] text-white px-4 py-2 rounded hover:bg-[#4ade80]"
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}


/* 





*/