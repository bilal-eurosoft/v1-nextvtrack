"use client";
import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getVehicleDataByClientIdForOdometer,
  handleServiceHistoryRequest,
  vehicleListByClientId,
} from "@/utils/API_CALLS";
import Select from "react-select";
import { DeviceAttach } from "@/types/vehiclelistreports";
import { MuiPickersUtilsProvider, DatePicker,TimePicker  } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns"; // Correcting to DateFnsUtils
import EventIcon from "@material-ui/icons/Event"; // Event icon for calendar
import "./assign.css";
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Import the time icon
// Assuming there's an API service to get the service data
import moment from 'moment';

export default function ServiceHistory() {
  const router = useRouter();
  const { data: session } = useSession();

  if (!session?.ServiceHistory) {
    router.push("/liveTracking");
  }
  const fetchServicesFromAPI = async () => {
    if (session) {
      try {
        const Data = await handleServiceHistoryRequest({
          token: session.accessToken,
          method: "GET",
        });

        return Data;
      } catch (error) {
        toast.error("Failed to load services.");
        return [];
      }
    }
  };

  // State to store the service data, modal visibility, pagination info, and form data
  const [services, setServices] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleList, setVehicleList] = useState<DeviceAttach[]>([]);
  const [SelectedServiceId, setSelectedServiceId] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editModal, seteditModal] = useState(false);
  const [serviceType, setserviceType] = useState<String>();

  const [disabledbutton, setdisabledbutton] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    serviceTitle: "",
    vehicleReg: "",
    serviceType: "",
    targetValue: null,
    pushnotification: false,
    sms: false,
    email: false,
    clientId: session?.clientId ?? "", // Default to empty string if undefined
  vehicleId:  "",  // Assumed to come from session
  });
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filteredServices, setFilteredServices] = useState([]); 
  
  const [TimeValue, setTimeValue] = useState(null);
  const [currentMileageByApi, setcurrentMileageByApi] =
    useState<Number>();
  const [error, setError] = useState<string | null>(null);
  const initialFormData = {
    id: "",
    serviceTitle: "",
    vehicleReg: "",
    serviceType: "",
    targetValue: null,
    pushnotification: false,
    sms: false,
    email: false,
    clientId: session?.clientId ?? "", // Default to empty string if undefined
    vehicleId:  "",  // Assumed to come from session

  };

  // Fetch services on page load (or reload)
  useEffect(() => {
    const loadServices = async () => {
      try {
        const fetchedServices = await fetchServicesFromAPI();
        if (fetchedServices.length > 0) {
          setServices(fetchedServices);
          setFilteredServices(fetchedServices); 
        } else {
          setServices([]); // Empty data set
          setFilteredServices([]); 
        }
        setCurrentPage(1);
      } catch (error) {
        toast.error("Failed to load services.");
        setServices([]); // In case of error, set to empty
      }
    };
    loadServices();
  }, []);

  /*  const fetchMileage = async () => {
    try {
      setLoading(true);
      // Make the API request (replace with your actual API URL)
      const response = await fetch('https://yourapi.com/mileage');
      const data = await response.json();

      // Assuming the API response has the mileage value
      if (data && data.mileage) {
        setFormData((prevState) => ({
          ...prevState,
          current: data.mileage, // Pre-filling the 'current' field with the API value
        }));
      }
    } catch (error) {
      console.error("Error fetching mileage:", error);
    } finally {
      setLoading(false);
    }
  }; */

  /*   useEffect(() => {
    // Trigger the API call only if 'Milagewise' is selected
    if (formData.serviceType === 'Milagewise') {
      fetchMileage();
    }
  }, [formData.serviceType]); */

  useEffect(() => {
    const vehicleListData = async () => {
      if (session) {
        const Data = await vehicleListByClientId({
          token: session.accessToken,
          clientId: session?.clientId,
        });
        
        setVehicleList(Data.data);
        const vehicleOptions = Data.data.map((vehicle: any) => ({
          value: vehicle.vehicleReg, // Assuming `vehicleReg` is the unique identifier
          label: vehicle.vehicleReg, // Or any field you'd like to display as label
        }));
        setVehicles(vehicleOptions);
      }
    };
    vehicleListData();
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
   
    // Handle changes for the "current" input field
    if (name === "targetValue") {
      // Clear error when valid input is provided
      if (
        value === "" ||
        (Number(value) && Number(value) > currentMileageByApi)
      ) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
        setError(null);
      } else {
       
        setError(
          `Targeted Mileage is greater than current i.e ${currentMileageByApi}`
        );
      }
    }

    // Handle changes for other fields (e.g., "difference")
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    // Update the current date when the component mounts
    setCurrentDate(new Date());
  }, []);
  const handleDateChange = (newDate) => {
    // Ensure that the selected date is either valid or null
    const formattedDate = newDate ? newDate.toISOString().split("T")[0] : null;

    setFormData((prev) => ({
      ...prev,
      targetValue: formattedDate, // Update state with formatted date or null
    }));
  };
  const currentDatea = moment().toDate(); // Get the current date and time
  const currentTime = moment(); // Get the current time (without date)

  const handleTimeChange = (time) => {
    const selectedDate = formData.targetValue ? moment(formData.targetValue) : moment();
    const selectedTime = moment(time);

    // If the selected date is today and time is before the current time, show an error
    if (selectedDate.isSame(currentTime, 'day') && selectedTime.isBefore(currentTime, 'minute')) {
      toast.error('You cannot select the current or previous time for today.');
      return;
    }

    // If the selected date is in the future, no restrictions on time
    if (selectedDate.isAfter(currentTime, 'day') || selectedDate.isSame(currentTime, 'day')) {
      setTimeValue(time)
    }
    else{
      setTimeValue(null)
    }
  };
  
  

  // Handle service type change (dynamic fields for Mileage/DateTime)
  const serviceTypeOptions = [
    { value: "Datewise", label: "Datewise" },
    { value: "Milagewise", label: "Milagewise" },
  ];

  const handleServiceTypeChange = async (option: { value: any }) => {
   

    if (formData.vehicleReg) {
      setFormData((prev) => ({
        ...prev,
        serviceType: option?.value,
      }));
    } else {
      return toast.error("first select vehicle");
    }

    if (option?.value === "Milagewise") {
      // Example API call to fetch mileage (use actual endpoint)
      const fetchedMileage = await getVehicleDataByClientIdForOdometer(
        session?.clientId
      );

      let newdata = fetchedMileage.filter(
        (item) => item.vehicleReg === formData.vehicleReg
      );
      let mileage = newdata[0].odometer;
      setcurrentMileageByApi(mileage);
      if (mileage == null) {
        setdisabledbutton(true)
        return toast.error("This vehicle has no any mileage value!");
      }
    }

  };

  // Handle form submit (for adding or updating services)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if all required fields are filled
    if (!formData.serviceTitle) {
      toast.error("Service Title is required!");
      return; // Stop the form submission if validation fails
    }
    if (!formData.vehicleReg) {
      toast.error("Vehicle Registration is required!");
      return; // Stop the form submission if validation fails
    }
    if (!formData.serviceType) {
      toast.error("Service Type is required!");
      return; // Stop the form submission if validation fails
    }
    if (formData.serviceType === "Milagewise" && !formData.targetValue ) {
      toast.error("Current Milage is required!");
      return; // Stop the form submission if validation fails
    }
    if (formData.serviceType === "Datewise" && !formData.targetValue && !TimeValue) {
      toast.error("Current Date/Time is required!");
      return; // Stop the form submission if validation fails
    }
    if(TimeValue == null){
      toast.error("Time is required!");
      return;
    }
    if(formData.serviceType === "Datewise" && TimeValue){

      // Assuming TimeValue contains the new time to append
  let timeObj = new Date(TimeValue);
  
  // Get the time part in 'HH:mm:ss' format
  let timeString = timeObj.toLocaleTimeString('en-GB', { hour12: false });
  
  // Split the targetValue at the first 'T'
  let datePart = formData.targetValue.split('T')[0];
  
  // Now append the new time to the datePart
  let completeDateTime = `${datePart}T${timeString}`;
  
  // Update the formData.targetValue
  formData.targetValue = completeDateTime;
    }
    
    // If all required fields are filled, proceed with the form submission
    try {

      if (formData._id) {
        // Update existing service (API call to update)
        const { _id, ...rest } = formData;

        // Create the new data object with id field instead of _id
        const data = {
          id: _id, // Renaming _id to id
          ...rest, // Spread the remaining fields from formData
        };
       
        let Data = await updateService(data);
        if (Data.success == true) {
          toast.success("Service updated!");
          setModalOpen(false);
          const updatedServices = await fetchServicesFromAPI();
          setServices(updatedServices);
          setFilteredServices(updatedServices); 
          setCurrentPage(1);
          
        } else {
          toast.error(Data.message);
          return;
        }
      } else {
        // Add new service (API call to add)
        let Data = await addService(formData);
        if (Data.success == true) {
          setModalOpen(false);
          toast.success("Service added!");
          const updatedServices = await fetchServicesFromAPI();
          setServices(updatedServices);
          setFilteredServices(updatedServices); 
          setFormData(initialFormData)
          
          setCurrentPage(1);
        } else {
          toast.error(Data.message);
        }
      }

      // Reset form data and close modal
      setFormData({
        id: "",
        serviceTitle: "",
        vehicleReg: "",
        serviceType: "",
        targetValue: null,
        pushnotification: false,
        sms: false,
        email: false,
        clientId: session?.clientId ?? "",
        vehicleId: "",
      });
      setTimeValue(null)
      setModalOpen(false);
    } catch (error) {
      toast.error("An error occurred while saving the service.");
    }
  };




  // Add service (example API function)
  const addService = async (serviceData: any) => {
    if (session) {
    
      const Data = await handleServiceHistoryRequest({
        token: session.accessToken,
        method: "POST",
        body: serviceData,
      });

      return Data;
  
     
    }
   
    
  };


  const updateService = async (serviceData: any) => {

    if (session) {
      const Data = await handleServiceHistoryRequest({
        token: session.accessToken,
        method: "PUT",
        body: serviceData,
      });

      return Data;
    }
  };

  
/*   const handleDelete = async (id: string) => {
    if (session) {
      let data = {
        id: id,
      };

      const Data = await handleServiceHistoryRequest({
        token: session.accessToken,
        method: "DELETE",
        body: data,
      });

      if (Data) {
        const updatedServices = await fetchServicesFromAPI();
        setServices(updatedServices);
        toast.success("Service deleted!");
      } else {
        toast.error("Failed to delete service.");
      }
    }
  }; */

  const opendeleteModal = (serviceId: string) => {
   
    setIsModalOpen(true);
    setserviceType("Delete");
    setSelectedServiceId(serviceId);
   
  };


  const handleInputChangeSelect = (selectedOption: any) => {
    let singleVehicle: any;
    if (selectedOption?.value) {
      singleVehicle = vehicleList.find(
        (item) => item.vehicleReg == selectedOption.value
      );
    }
   /*  if (singleVehicle == null || undefined) {
      setNomileage(false);
    } else {
      if (singleVehicle?.odometer == false) {
        setNomileage(true);
      }
    } */
  
    setFormData((prev) => ({
      ...prev,
      serviceType: "",

      vehicleReg: selectedOption ? selectedOption.value : null, // Update vehicleReg in formData
      clientId: singleVehicle?.clientId,
      vehicleId: singleVehicle?._id,
    }));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = Number(e.target.value);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to page 1 when rows per page is changed
  };

  const handlePageChange = (direction: string) => {
    const totalPages = Math.ceil(services.length / rowsPerPage);

    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  

  // Open the update modal with the selected service's data
  const openUpdateModal = (service: any) => {
    // seteditModal(true);
    setserviceType("Update");
    setFormData(service);
    if( service.serviceType=="Datewise"){

      let TimePart = service.targetValue.split('T')[1];
       const timeParts = TimePart.split(":"); 
       const dateWithTime = new Date();
       dateWithTime.setHours(timeParts[0], timeParts[1], timeParts[2]);
       setTimeValue(dateWithTime)
    }
    setModalOpen(true);
  }

  const openConfirmationModal = (
    serviceId: React.SetStateAction<undefined>
  ) => {
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
    setserviceType("Update");
  };

  const closeConfirmationModal = () => {
    setIsModalOpen(false);
    // setSelectedServiceId(null);
  };

  const handleConfirmUpdate = async () => {
    if (serviceType == "Delete") {
      if (session) {
        let data = {
          id: SelectedServiceId,
        };

        const Data = await handleServiceHistoryRequest({
          token: session.accessToken,
          method: "DELETE",
          body: data,
        });

        if (Data.success == true) {
          const updatedServices = await fetchServicesFromAPI();
          setServices(updatedServices);
          setFilteredServices(updatedServices); 
          toast.success("Service deleted!");
          closeConfirmationModal();
         
        } else {
          toast.error("Failed to delete service.");
        }
      }
    } else {
     // let getData = services.filter((item) => item._id == SelectedServiceId);
      let bodyData = {
        id: SelectedServiceId,
        status: "complete",
        // isNotified: true
      };
     
      if (session) {
        const Data = await handleServiceHistoryRequest({
          token: session.accessToken,
          method: "PUT",
          body: bodyData,
        });
        if (Data?.success == true) {
          closeConfirmationModal();
          toast.success("Service updated!");
          const updatedServices = await fetchServicesFromAPI();
          setServices(updatedServices);
          setFilteredServices(updatedServices); 
          setCurrentPage(1);
        } else {
          toast.error(Data?.message);
        }

        return Data;
      }
    }
  };

  //  }


  // Handle search change
  const handleSearchChange = (e) => {
    e.preventDefault();
    const query = e.target.value.toLowerCase();
  

    if (query === "") {
      setFilteredServices(services); // Show all services again
    } else {
      const filtered = services.filter((item) =>
        Object.values(item) 
          .some((value) =>
            value && value.toString().toLowerCase().includes(query) 
          )
      );
      setFilteredServices(filtered); 
    }

    setCurrentPage(1); // Reset pagination to page 1 after search
  };

  // Paginate the filtered services
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / rowsPerPage);
  if (currentPage > totalPages) {
    setCurrentPage(totalPages); // If the current page exceeds the total pages, reset to the last page
  }
  
  return (
    <div className="bg-[#F7FAFC] pt-[1.5px]">
      <p className="bg-[#00B56C] px-4 py-1 text-center text-2xl sm:text-xl text-white font-bold">
    Service History
  </p>
  
  {/* Toast Notifications */}
  <Toaster position="top-center" reverseOrder={false} />
  
  <div className="px-6">
    {/* Main Action Section */}
    <div className="my-4 flex flex-wrap justify-between items-center gap-4">
      {/* Add Service Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="bg-[#00B56C] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg w-full sm:w-auto"
      >
        <svg
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          className="mr-2 w-6 h-6"
        >
          <line
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            x1="12"
            x2="12"
            y1="19"
            y2="5"
          />
          <line
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            x1="5"
            x2="19"
            y1="12"
            y2="12"
          />
        </svg>
        Add Service
      </button>

      {/* Search Box */}
      <div className="relative w-full max-w-xs">
        <input
          type="text"
          className="w-full px-4 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B56C] transition duration-300 ease-in-out"
          placeholder="Search services..."
          onChange={handleSearchChange}
        />
        <svg
          width="20px"
          height="20px"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="#00B56C"
          strokeWidth="2"
          className="absolute top-1/2 right-3 transform -translate-y-1/2 w-5 h-5"
        >
          <circle cx="10.5" cy="10.5" r="7.5" />
          <line x1="16" y1="16" x2="22" y2="22" />
        </svg>
      </div>
    </div>
  
         
        

       {/* Table */}
{/* Table */}
<div className={`relative ${isModalOpen ? "backdrop-blur-sm" : ""}`}>
  <div
    className={`bg-white shadow-md rounded-lg ${
      rowsPerPage > 10 ? "overflow-y-auto max-h-[680px] relative" : ""
    }`}
  >
    <div className="overflow-x-auto"> {/* Enable horizontal scrolling */}
      <table className="min-w-full table-auto">
        <thead
          className={`bg-[#E2E8F0] ${
            rowsPerPage > 10 ? "sticky top-0 z-10" : ""
          }`}
        >
          <tr>
            <th className="px-2 py-1 text-center">S.No</th>
            <th className="px-2 py-1 text-left">Service Title</th>
            <th className="px-2 py-1 text-left">Vehicle Reg</th>
            <th className="px-2 py-1 text-left">Service Type</th>
            <th className="px-2 py-1 text-left">Targeted Date</th>
            <th className="px-2 py-1 text-left">Targeted Mileage</th>
            <th className="px-2 py-1 text-left">Status</th>
            <th className="px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {services.length === 0 ? (
            <tr>
              <td
                colSpan="8"
                className="px-4 py-2 text-center text-gray-500"
              >
                No Data Found
              </td>
            </tr>
          ) : (
            paginatedServices.map((service, index) => (
              <tr key={index} className="border-b hover:bg-[#D1FAE5]">
                <td className="px-2 py-1 text-center">
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </td>
                <td className="px-2 py-1 text-left">{service.serviceTitle}</td>
                <td className="px-2 py-1 text-left">{service.vehicleReg}</td>
                <td className="px-2 py-1 text-left">{service.serviceType}</td>

                {service.serviceType === "Datewise" ? (
                  <td className="px-2 py-1 text-left">
                    {service.targetValue
                      ? service.targetValue.split("T").map((part, index) => {
                          if (index === 1) {
                            // Convert to 12-hour time format
                            let timeObj = new Date("1970-01-01T" + part);
                            let time12Hour = timeObj.toLocaleTimeString("en-US", {
                              hour12: true,
                            });
                            return time12Hour;
                          }
                          return part; // Date part remains unchanged
                        }).join(" ")
                      : "-"}
                  </td>
                ) : (
                  <td className="px-2 py-1 text-left">-</td>
                )}

                {service.serviceType === "Milagewise" ? (
                  <td className="px-2 py-1 text-left">
                    {service.targetValue ? service.targetValue : "-"}
                  </td>
                ) : (
                  <td className="px-2 py-1 text-left">-</td>
                )}

                {service.status === "complete" ? (
                  <td className="px-2 py-1 text-left">
                    {service.status.charAt(0).toUpperCase() +
                      service.status.slice(1)}
                  </td>
                ) : (
                  <td className="px-2 py-1 relative text-left">
                    <span
                      className="text-[#E53E3E]  underline group cursor-pointer"
                      onClick={() => openConfirmationModal(service._id)}
                    >
                      {service.status.charAt(0).toUpperCase() +
                        service.status.slice(1)}

                      <div className="absolute left-0 top-full  hidden group-hover:block z-20">
                        <div className="text-xs font-semibold bg-[#D1FAE5] text-[#E53E3E] p-2 rounded-md mb-1 text-left">
                          Click to update the status
                        </div>
                      </div>
                    </span>
                  </td>
                )}
{/* 
 <td className="px-2 py-1 relative text-left">
                    <span
                      className="text-[#E53E3E] underline group cursor-pointer"
                      onClick={() => openConfirmationModal(service._id)}
                    >
                      {service.status.charAt(0).toUpperCase() +
                        service.status.slice(1)}

                      <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-20">
                        <div className="text-xs font-semibold bg-[#D1FAE5] text-[#E53E3E] p-2 rounded-md mb-1 text-left">
                          Click to update the status
                        </div>
                      </div>
                    </span>
                  </td>
                )}

                <td className="px-2 py-1 text-left">
                  <div className="flex gap-2 justify-start">
                    <button
                      onClick={() => openUpdateModal(service)}
                      className="bg-green text-white px-3 py-1 rounded-lg hover:shadow-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => opendeleteModal(service._id)}
                      className="bg-[#E53E3E] text-white px-3 py-1 rounded-lg hover:shadow-lg"
                    >
                      Delete
                    </button>
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




        {/* Modal for adding/updating service */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-bold mb-4 text-center">
                {formData._id ? "Update Service" : "Add Service"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Service Title
                  </label>
                  <input
                    type="text"
                    name="serviceTitle"
                    value={formData.serviceTitle}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-[#CBD5E0] rounded-lg"
                    placeholder="Oil Changing / Tuning, etc."
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Vehicle Registration
                  </label>
                  <Select
                    value={
                      formData.vehicleReg
                        ? {
                            value: formData.vehicleReg,
                            label: formData.vehicleReg,
                          }
                        : null
                    }
                    onChange={handleInputChangeSelect}
                    options={vehicles}
                    placeholder="Pick Vehicle"
                    isClearable
                    isSearchable
                    className="rounded-md w-full outline-green border border-grayLight hover:border-green"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        border: "none",
                        boxShadow: state.isFocused ? null : null,
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected
                          ? "#00B56C"
                          : state.isFocused
                          ? "#e1f0e3"
                          : "transparent",
                        color: state.isSelected
                          ? "white"
                          : state.isFocused
                          ? "black"
                          : "black",
                        "&:hover": {
                          backgroundColor: "#e1f0e3",
                          color: "black",
                        },
                      }),
                    }}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Service Type
                  </label>
                  <Select
                    value={serviceTypeOptions.find(
                      (option) => option.value === formData.serviceType
                    )} // Find the selected option from options
                    onChange={handleServiceTypeChange}
                    options={serviceTypeOptions}
                    placeholder="Select Service Type"
                    isClearable
                    isSearchable
                    noOptionsMessage={() => "No options available"}
                    className="rounded-md w-full outline-green border border-grayLight hover:border-green"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        border: "none",
                        boxShadow: state.isFocused ? null : null,
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected
                          ? "#00B56C"
                          : state.isFocused
                          ? "#e1f0e3"
                          : "transparent",
                        color: state.isSelected
                          ? "white"
                          : state.isFocused
                          ? "black"
                          : "black",
                        "&:hover": {
                          backgroundColor: "#e1f0e3",
                          color: "black",
                        },
                      }),
                    }}
                  />
                </div>

                {formData.serviceType === "Datewise" && (
                  <div className="mb-4 ml-1">
                    <label className="block text-sm font-medium">
                      Alert Date & Time
                    </label>
                   

                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DatePicker
        value={formData.targetValue || null}
        onChange={handleDateChange}
        format="MM/dd/yyyy"
        variant="dialog"
        placeholder="Start Date"
        minDate={currentDate} // Prevent selecting past dates
        autoOk
        inputProps={{ readOnly: true }}
        style={{
          marginTop: '2%',
          width: '160px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '14px',
        }}
        InputProps={{
          endAdornment: (
            <EventIcon
              style={{ width: '20px', height: '20px' }}
              className="text-gray"
            />
          ),
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
      <TimePicker
        value={TimeValue || null}
        onChange={handleTimeChange}
        format="HH:mm:ss"
        variant="dialog"
        autoOk
        placeholder="Alert time"
        inputProps={{ readOnly: true }}
        style={{
          marginTop: '2%',
          width: '160px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          padding: '10px',
          fontSize: '14px',
        }}
        disabled={!formData.targetValue} 
        InputProps={{
          endAdornment: (
            <AccessTimeIcon
              style={{ width: '20px', height: '20px' }}
              className="text-gray"
            />
          ),
          style: {
            backgroundColor: 'white',
          },
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
                  </div>
                )}

                {formData.serviceType === "Milagewise" && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium ml-1">
                      {/*   Enter Mileage at which you want to get notified */}
                      Alert Milage
                      </label>
                      <input
                        type="number"
                        name="targetValue"
                        value={formData.targetValue} // Ensure the value is controlled by state
                        onChange={handleInputChange} // Handle user changes to the input field
                        className="w-full p-2 border border-[#CBD5E0] rounded-lg"
                        required
                        placeholder="Mileage"
                        disabled={disabledbutton}
                      />
                      {/* Display error message if there's an error */}
                      {error && (
                        <p className="text-red text-xs mt-1">{error}</p>
                      )}
                    </div>
                  </>
                )}
                <label className="block text-sm font-medium mb-2 ml-2">
                    Alert types
                  </label>
                <div className="mb-2 ml-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.sms}
                    onChange={(e) =>
                      setFormData({ ...formData, sms: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label>SMS</label>
                </div>
                <div className="mb-2 ml-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label>Email</label>
                </div>
                <div className="mb-4 ml-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.pushnotification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pushnotification: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label>Push Notifications</label>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false); // Close the modal
                      // seteditModal(false);
                      setTimeValue(null)
                      setFormData(initialFormData); // Reset form data to initial state
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
        )}
        {services.length > 5 && ( // Show pagination controls only if there are more than 10 services
  <div className="flex justify-center mt-4">
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <span>Rows per page: </span>
        <select
          className="p-2 border border-[#CBD5E0] rounded-lg"
          value={rowsPerPage}
          onChange={handleRowsPerPageChange}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}
          className="bg-[#00B56C] text-white px-3 py-1 rounded-lg hover:shadow-[0px_4px_6px_rgba(0,0,0,0.2)]"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {Math.ceil(services.length / rowsPerPage)}
        </span>
        <button
          onClick={() => handlePageChange("next")}
          disabled={currentPage === Math.ceil(services.length / rowsPerPage)}
          className="bg-[#00B56C] text-white px-3 py-1 rounded-lg hover:shadow-[0px_4px_6px_rgba(0,0,0,0.2)]"
        >
          Next
        </button>
      </div>
    </div>
  </div>
)}

{isModalOpen && (
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
            Confirm {serviceType === "Delete" ? "Delete" : "Update"}
          </h2>
        </div>
        <p>
          {serviceType === "Delete" ? (
            "Are you sure you want to Delete this service?"
          ) : (
            "Are you sure you want to Update this service status to \"Complete\"?"
          )}
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
            Yes, {serviceType === "Delete" ? "Delete" : "Update"}
          </button>
        </div>
      </div>
    </div>
  )}
      </div>
    </div>
  );
}
