"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getVehicleDataByClientIdForOdometer,
  handleServiceHistoryRequest,
  vehicleListByClientId,
} from "@/utils/API_CALLS";
import Select from "react-select";
import { DeviceAttach, VehicleData } from "@/types/vehiclelistreports";
import { MuiPickersUtilsProvider, DatePicker,TimePicker  } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns"; // Correcting to DateFnsUtils
import EventIcon from "@material-ui/icons/Event"; // Event icon for calendar
import "./assign.css";
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Import the time icon
// Assuming there's an API service to get the service data
import { FaCogs } from 'react-icons/fa';

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
  const [editModal, seteditModal] = useState(false);
  const [serviceType, setserviceType] = useState<String>();

  const [disabledbutton, setdisabledbutton] = useState(false)
 /*  const [formData, setFormData] = useState({
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
  Preventive: false,
  Corrective: false,
  }); */
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filteredServices, setFilteredServices] = useState([]); 
  
  const [TimeValue, setTimeValue] = useState(null);
  const [currentMileageByApi, setcurrentMileageByApi] =
    useState<Number>();
  const [error, setError] = useState<string | null>(null);
  const initialFormData: VehicleData = {
    clientId: "",
    vehicleId: "",
    dataType: "Service",
    serviceTitle: "",
    serviceType: "",
    maintenanceType: "",
    file: "",
    filename: "",
    documentType: "",
    createdDate: "",
    expiryDate: "",
    targetValue: "",
    sms: false,
    email: false,
    pushnotification: false,
    status: "due"
  };
  const [formData, setFormData] = useState<VehicleData>(initialFormData);
  // const initialFormData = {
  //   id: "",
  //   serviceTitle: "",
  //   vehicleReg: "",
  //   serviceType: "",
  //   targetValue: null,
  //   pushnotification: false,
  //   sms: false,
  //   email: false,
  //   clientId: session?.clientId ?? "", // Default to empty string if undefined
  //   vehicleId:  "",  // Assumed to come from session

  // };

  // Fetch services on page load (or reload)
  useEffect(() => {
    const loadServices = async () => {
      try {
        const fetchedServices = await fetchServicesFromAPI();
        if (fetchedServices.length > 0) {
          console.log("fetchedServices", fetchedServices);
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
        //   console.log("scs", Data);
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

  const handleTimeChange = (time) => {
    setTimeValue(time)
  };

  // Handle service type change (dynamic fields for Mileage/DateTime)
  const serviceTypeOptions = [
    { value: "Datewise", label: "Datewise" },
    { value: "Milagewise", label: "Milagewise" },
  ];

  const handleServiceTypeChange = async (option: { value: any }) => {
   

    /* if (formData.vehicleReg) {
      setFormData((prev) => ({
        ...prev,
        serviceType: option?.value,
      }));
    } else {
      return toast.error("first select vehicle");
    } */


    if (option?.value === "Milagewise") {
      // Example API call to fetch mileage (use actual endpoint)
      const fetchedMileage = await getVehicleDataByClientIdForOdometer(
        session?.clientId
      );
console.log("dfgdfdf", formData.vehicleReg);
      let newdata = fetchedMileage.filter(
        (item) => item.vehicleReg === formData.vehicleReg
      );
      let mileage = newdata[0]?.odometer||newdata[0]?.odometer1;
      setcurrentMileageByApi(mileage);
      if (mileage == null) {
        setdisabledbutton(true)
        return toast.error("This vehicle has no any mileage value!");
      }
    }else {
      setFormData((prev) => ({
        ...prev,
        serviceType: option?.value,
      }));
    }

  };

  // Handle form submit (for adding or updating services)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if all required fields are filled
    if (!formData.serviceTitle) {
      toast.error("Service Task is required!");
      return; // Stop the form submission if validation fails
    }
    /* if (!formData.vehicleReg) {
      toast.error("Vehicle Registration is required!");
      return; // Stop the form submission if validation fails
    } */
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
    // If all required fields are filled, proceed with the form submission
    try {
      //  console.log("formData",formData);
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
    //  console.log("selectedOption",selectedOption);
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
    // console.log("check",singleVehicle, singleVehicle.clientId,  singleVehicle._id);
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
    seteditModal(true);
    setserviceType("Update");
    setFormData(service);
   let TimePart = service.targetValue.split('T')[1];
    const timeParts = TimePart.split(":"); 
    const dateWithTime = new Date();
    dateWithTime.setHours(timeParts[0], timeParts[1], timeParts[2]);
    setTimeValue(dateWithTime)
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


  const generateColors = (length) => {
    const baseColors = [
      "#10B981", // green
      "#3B82F6", // blue
      "#EF4444", // red
      "#F59E0B", // yellow
      "#8B5CF6", // purple
      "#EC4899", // pink
      "#14B8A6", // teal
      "#F97316", // orange
      "#6366F1", // indigo
      "#06B6D4", // cyan
    ];
    return Array.from({ length }, (_, i) => baseColors[i % baseColors.length]);
  };
  const colors = generateColors(vehicles.length);

const [selectedvehicle, setselectedvehicle] = useState()
const [singleVehicleDetail, setsingleVehicleDetail] = useState([])
  const handleCardClick = (e) => {
   
    setselectedvehicle(e)
    const vehicle = vehicleList.filter((item)=> item.vehicleReg == e)
    setFormData((prev) => ({
      ...prev,
      vehicleReg:  e,
    }));
    
    setsingleVehicleDetail(vehicle)
    const query = e.toLowerCase();
    const filtered = filteredServices.filter((item) =>
      Object.values(item) 
        .some((value) =>
          value && value.toString().toLowerCase().includes(query) 
        )
    );
    console.log("Scacasca", filtered);
    setFilteredServices(filtered); 
    setActiveTab("services")
    setCurrentPage(1); 
  
  }
 
  const clearSelectedVehicle = () => {
    console.log("ft", filteredServices);
    setFilteredServices(services);
    setselectedvehicle(null);
  };

  const [viewMode, setViewMode] = useState("card"); // "card" or "table"
  const [activeTab, setActiveTab ] = useState("services"); // "card" or "table"
  
  const [searchTerm, setSearchTerm] = useState("");


  const handleTableRowClick = (service) => {
    console.log("Selected service:", service);
    // You can handle the row selection logic here
  };



  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };


  const handleRowClick = () => {
    router.push("/liveTracking");
  };

  const hanldecancelVehicle = () =>{
    setFilteredServices(services);
    setActiveTab(null)
    setselectedvehicle(null)
  }
  console.log("filteredServices",filteredServices);
 console.log("paginatedServices",paginatedServices);
 console.log("servifce",services);



 const [file, setFile] = useState(null);


 const handleFileChange = (e) => {
   const selectedFile = e.target.files[0];

   // Validate file type
   const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
   if (selectedFile && allowedTypes.includes(selectedFile.type)) {
     setFile(selectedFile);
     setError('');
   } else {
     setError('Please upload a valid PDF, JPEG, or PNG file.');
     setFile(null);
   }
 };

/*  const handleSubmit2 = () => {
   if (file) {
     // Handle file submission logic (e.g., upload to server)
     console.log('File ready for upload:', file);
   } else {
     console.log('No file selected');
   }
 }; */




  return (
    <div className="bg-white pt-[1.5px]">
      <p className="bg-[#00B56C] px-4 py-1 text-center text-2xl sm:text-xl text-white font-bold">
    Service History
  </p>
  {selectedvehicle && singleVehicleDetail && (
    
        <div className="pl-1">
          {/* Back Button and Title */}
          <div className="flex items-center mt-6 pl-8">
            <button
              onClick={() => hanldecancelVehicle()}
              className="flex items-center text-[#00B56C] hover:text-[#008C47]"
            >
              {/* Back Arrow Icon */}
              <svg
    xmlns="http://www.w3.org/2000/svg"
    version="1.0"
    width="14" height="14"
    viewBox="0 0 512 512"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    transform="rotate(180)"
  >
    <g transform="translate(0,512) scale(0.1,-0.1)" fill="green" stroke="none">
      <path d="M2716 5110 c-83 -26 -131 -135 -95 -214 7 -14 451 -506 988 -1093
        l977 -1068 -2231 -5 c-2092 -5 -2232 -6 -2262 -22 -100 -55 -109 -194 -17
        -264 l37 -29 2238 -5 2238 -5 -976 -1075 c-536 -591 -981 -1087 -989 -1102
        -34 -65 -8 -152 59 -202 38 -28 126 -28 164 0 38 28 2230 2442 2249 2476 18
        34 18 90 0 131 -15 33 -2201 2426 -2246 2459 -31 21 -95 30 -134 18z"/>
    </g>
  </svg>
              <span className="text-lg pl-4 ">Vehicle</span>
            </button>
          </div>
          {singleVehicleDetail.map((item, index) => (
            <> 
          {/* Vehicle Details Section */}
          <div className="pl-8 pt-4">
            {/* Vehicle Reg - Big Text */}
            <p className="text-5xl font-bold text-black">{item.vehicleReg}</p>

            {/* Make, Model, Year - Small Text */}
            <div className="mb-8 flex space-x-4">
  <span className="text-sm font-medium text-gray">{item.vehicleMake}</span>
  <span className="text-sm font-medium text-gray">{item.vehicleModel}</span>
  <span className="text-sm font-medium text-gray">{item.vehicleType}</span>
</div>

          </div>
          </>
        ))}
        </div>
     
      )}
  {!selectedvehicle && (
    <> 
   <div className="flex gap-2 bg-white justify-between pr-[50px] mt-[20px] items-center mr-[140px]">
  <h2 className="text-3xl font-bold ml-8">Vehicles</h2>
  
  <div className="flex gap-2">
    <button
      onClick={() => setViewMode("card")}
      className="px-2 py-2 bg-[#f3f4f6] rounded-md"
    >
      {/* Icon for card view */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="w-5 h-5 mr-2"
      >
        <path fillRule="evenodd" clipRule="evenodd" d="M8 1C9.65685 1 11 2.34315 11 4V8C11 9.65685 9.65685 11 8 11H4C2.34315 11 1 9.65685 1 8V4C1 2.34315 2.34315 1 4 1H8ZM8 3C8.55228 3 9 3.44772 9 4V8C9 8.55228 8.55228 9 8 9H4C3.44772 9 3 8.55228 3 8V4C3 3.44772 3.44772 3 4 3H8Z" fill="#0F0F0F"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M8 13C9.65685 13 11 14.3431 11 16V20C11 21.6569 9.65685 23 8 23H4C2.34315 23 1 21.6569 1 20V16C1 14.3431 2.34315 13 4 13H8ZM8 15C8.55228 15 9 15.4477 9 16V20C9 20.5523 8.55228 21 8 21H4C3.44772 21 3 20.5523 3 20V16C3 15.4477 3.44772 15 4 15H8Z" fill="#0F0F0F"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M23 4C23 2.34315 21.6569 1 20 1H16C14.3431 1 13 2.34315 13 4V8C13 9.65685 14.3431 11 16 11H20C21.6569 11 23 9.65685 23 8V4ZM21 4C21 3.44772 20.5523 3 20 3H16C15.4477 3 15 3.44772 15 4V8C15 8.55228 15.4477 9 16 9H20C20.5523 9 21 8.55228 21 8V4Z" fill="#0F0F0F"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M20 13C21.6569 13 23 14.3431 23 16V20C23 21.6569 21.6569 23 20 23H16C14.3431 23 13 21.6569 13 20V16C13 14.3431 14.3431 13 16 13H20ZM20 15C20.5523 15 21 15.4477 21 16V20C21 20.5523 20.5523 21 20 21H16C15.4477 21 15 20.5523 15 20V16C15 15.4477 15.4477 15 16 15H20Z" fill="#0F0F0F"/>
      </svg>
    </button>
    
    <button
      onClick={() => setViewMode("table")}
      className="px-2 py-2 bg-[#f3f4f6] rounded-md"
    >
      {/* Icon for table view */}
      <svg
        fill="#000000"
        width="800px"
        height="800px"
        viewBox="0 0 1000 1000"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 mr-2"
      >
        <path d="M582 707H166v83h416v-83zm250-333H166v83h666v-83zM166 624h666v-83H166v83zm0-416v83h666v-83H166z"/>
      </svg>
    </button>
  </div>
</div>

      </>
  )}
       
  {/* Toast Notifications */}
  <Toaster position="top-center" reverseOrder={false} />
 
  <div className={`${!selectedvehicle ? 'grid grid-cols-12 gap-4 bg-white' : ''}`}> 
  <div className={`px-8  ${!selectedvehicle ? 'col-span-8' : ''}`}>
    {/* Main Action Section */}
    {!selectedvehicle && (
    <div className="flex justify-between flex-wrap mt-8">
    {/*     <h2 className="text-3xl font-bold mr-2">Vehicles</h2> */}

        {/* Vehicle Selection Button */}
        {selectedvehicle && (
          <button
            onClick={() => setselectedvehicle(null)}
            className="bg-[#00B56C] text-white px-4 rounded-lg flex items-center hover:shadow-lg w-full sm:w-auto"
          >
            {selectedvehicle}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-5 h-5 ml-2 cursor-pointer"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
         {selectedvehicle && activeTab && (
          <button
            onClick={() => setActiveTab(null)}
            className="bg-[#00B56C] text-white ml-4 px-4 rounded-lg flex items-center hover:shadow-lg w-full sm:w-auto"
          >
            {activeTab}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-5 h-5 ml-2 cursor-pointer"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Vehicle View Mode Selection (Card or Table) */}
       {/*  {!selectedvehicle && (
        <div className="flex gap-2">
        <button
          onClick={() => setViewMode("card")}
             className="px-2 py-2 bg-[#f3f4f6] rounded-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-5 h-5 mr-2"
          >
            <path fillRule="evenodd" clipRule="evenodd" d="M8 1C9.65685 1 11 2.34315 11 4V8C11 9.65685 9.65685 11 8 11H4C2.34315 11 1 9.65685 1 8V4C1 2.34315 2.34315 1 4 1H8ZM8 3C8.55228 3 9 3.44772 9 4V8C9 8.55228 8.55228 9 8 9H4C3.44772 9 3 8.55228 3 8V4C3 3.44772 3.44772 3 4 3H8Z" fill="#0F0F0F"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M8 13C9.65685 13 11 14.3431 11 16V20C11 21.6569 9.65685 23 8 23H4C2.34315 23 1 21.6569 1 20V16C1 14.3431 2.34315 13 4 13H8ZM8 15C8.55228 15 9 15.4477 9 16V20C9 20.5523 8.55228 21 8 21H4C3.44772 21 3 20.5523 3 20V16C3 15.4477 3.44772 15 4 15H8Z" fill="#0F0F0F"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M23 4C23 2.34315 21.6569 1 20 1H16C14.3431 1 13 2.34315 13 4V8C13 9.65685 14.3431 11 16 11H20C21.6569 11 23 9.65685 23 8V4ZM21 4C21 3.44772 20.5523 3 20 3H16C15.4477 3 15 3.44772 15 4V8C15 8.55228 15.4477 9 16 9H20C20.5523 9 21 8.55228 21 8V4Z" fill="#0F0F0F"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M20 13C21.6569 13 23 14.3431 23 16V20C23 21.6569 21.6569 23 20 23H16C14.3431 23 13 21.6569 13 20V16C13 14.3431 14.3431 13 16 13H20ZM20 15C20.5523 15 21 15.4477 21 16V20C21 20.5523 20.5523 21 20 21H16C15.4477 21 15 20.5523 15 20V16C15 15.4477 15.4477 15 16 15H20Z" fill="#0F0F0F"/>
          </svg>
        </button>
        
        <button
          onClick={() => setViewMode("table")}
          className="px-2 py-2 bg-[#f3f4f6] rounded-md"
        >
         
          <svg
            fill="#000000"
            width="800px"
            height="800px"
            viewBox="0 0 1000 1000"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
          >
            <path d="M582 707H166v83h416v-83zm250-333H166v83h666v-83zM166 624h666v-83H166v83zm0-416v83h666v-83H166z"/>
          </svg>
        </button>
      </div>
      
        )} */}
      </div>
   )}
      {/* Display Vehicles Based on Selected View Mode */}

      {!selectedvehicle && (
         <div className=" bg-[#f3f4f6] rounded-md shadow px-4 py-4 mt-4">
        <div className=" ">
          {/* Display Vehicles in Card View */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {vehicles.map((vehicle, index) => (
                <div
                  key={vehicle.value}
                  onClick={() => handleCardClick(vehicle.value)}
                  className="relative border-l-8 bg-white p-6 rounded-lg shadow-lg flex flex-col items-start hover:bg-[#D1FAE5] cursor-pointer"
                  style={{ borderLeftColor: colors[index] }}
                >
                  <h2 className="text-2xl mb-4">{vehicle.label}</h2>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 15 15"
                    className="w-16 h-16"
                    style={{ color: colors[index] }}
                  >
                    <path d="M12.6,8.7,11.5,6.5a1.05,1.05,0,0,0-.9-.5H4.4a1.05,1.05,0,0,0-.9.5L2.4,8.7,1.16,9.852a.5.5,0,0,0-.16.367V14.5a.5.5,0,0,0,.5.5h2c.2,0,.5-.2.5-.4V14h7v.5c0,.2.2.5.4.5h2.1a.5.5,0,0,0,.5-.5V10.219a.5.5,0,0,0-.16-.367ZM4.5,7h6l1,2h-8ZM5,11.6c0,.2-.3.4-.5.4H2.4c-.2,0-.4-.3-.4-.5V10.4c.1-.3.3-.5.6-.4l2,.4c.2,0,.4.3.4.5Zm8-.1c0,.2-.2.5-.4.5H10.5c-.2,0-.5-.2-.5-.4v-.7c0-.2.2-.5.4-.5l2-.4c.3-.1.5.1.6.4ZM14,2V3a1.009,1.009,0,0,1-1.017,1H5.348A2.549,2.549,0,0,1,1,3.5H3.5v-2H1A2.549,2.549,0,0,1,5.348,1h7.635A1.009,1.009,0,0,1,14,2Z" />
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* Display Vehicles in Table View */}
          {viewMode === "table" && (
            <div className="relative w-full bg-white">
              <table className="min-w-full table-auto">
                <thead className="bg-[#E2E8F0]">
                  <tr>
                    <th className="px-2 py-1 text-center">S.No</th>
                    <th className="px-2 py-1 text-left">Vehicle Reg</th>
                    <th className="px-2 py-1 text-left">Vehicle Model</th>
                    <th className="px-2 py-1 text-left">Vehicle Make</th>
                  </tr>
                </thead>
                <tbody>
                
                {vehicleList?.filter((item) =>
      vehicles?.some((vehicle) => item.vehicleReg === vehicle.label)
    ).map((item, index) => (
      <tr
        key={item.id} // Ensure you have a unique key, here using item.id
        className="border-b hover:bg-[#D1FAE5]"
        onClick={() => handleCardClick(item.vehicleReg)}
      >
        <td className="px-2 py-1 text-center">{index + 1}</td> {/* Row number */}
        <td className="px-2 py-1 text-left" onClick={() => handleRowClick()} >{item.vehicleReg}</td> {/* Vehicle registration */}
        <td className="px-2 py-1 text-left">
          {item.vehicleModel}
        </td> {/* Vehicle make */}
        <td className="px-2 py-1 text-left">
        {item.vehicleMake}
        </td> {/* Vehicle model */}
      </tr>
    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      )}
   

  {/* Additional sections after vehicle selection */}
  {selectedvehicle && (
  <>
    {/* Show icons for Maintenance Log, Services, and Documentation */}
    <div className="flex justify-start items-center border-b border-gray-200 mb-4 ">
      {/* Services Tab */}
      <button
        onClick={() => setActiveTab("services")}
        className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2  ${
          activeTab === "services"
            ? "bg-[#00B56C] text-white"
            : "bg-transparent hover:bg-[#D1FAE5] "
        }`}
      >
        <span className="service-icon">
          <FaCogs className="w-5 h-5" /> {/* Gears icon */}
        </span>
        Services
      </button>


     <button
        onClick={() => setActiveTab("maintenance")}
        className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2  ${
          activeTab === "maintenance"
            ? "bg-[#00B56C] text-white"
            : "bg-transparent hover:bg-[#D1FAE5]"
        }`}
      >
  {/* Icon for maintenance with rotated arrow */}
  <svg
    width="20px"
    height="20px"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="white"
    strokeWidth="2"
    className="mr-2 w-5 h-5"
  >
    <g transform="translate(0,512) scale(0.1,-0.1)" fill={`${activeTab === "maintenance" ? "white" : "black"}`} stroke="none">
      <path d="M3595 5109 c-93 -13 -239 -52 -333 -90 -339 -135 -621 -424 -751
        -769 -112 -298 -117 -585 -16 -926 5 -17 -170 -180 -1128 -1046 -624 -565
        -1159 -1054 -1190 -1088 -64 -72 -116 -164 -149 -270 -19 -63 -23 -95 -22
        -205 0 -148 21 -228 89 -352 50 -90 178 -218 268 -268 123 -68 203 -88 352
        -89 110 -1 142 3 205 22 106 33 198 84 270 149 34 31 523 566 1088 1190 866
        958 1029 1133 1046 1128 213 -63 389 -84 564 -67 341 34 626 171 858 415 182
        191 292 403 351 677 37 177 17 524 -37 630 -32 62 -92 89 -167 75 -33 -6 -77
        -45 -323 -290 l-285 -283 -259 52 c-175 35 -262 56 -267 66 -5 8 -31 128 -58
        265 l-50 250 284 285 c245 246 284 290 290 323 14 74 -13 135 -75 167 -87 44
        -393 71 -555 49z m-42 -492 c-174 -175 -202 -209 -209 -243 -6 -30 9 -123 66
        -409 40 -203 79 -385 88 -403 28 -62 46 -68 444 -147 205 -41 385 -75 401 -75
        51 0 90 30 286 223 l193 192 -6 -70 c-16 -167 -70 -331 -157 -471 -63 -101
        -196 -242 -286 -303 -304 -203 -665 -243 -996 -112 -90 36 -139 39 -184 12
        -17 -11 -520 -559 -1116 -1218 -867 -958 -1095 -1204 -1138 -1230 -226 -135
        -513 -38 -611 207 -17 43 -22 75 -22 150 0 111 23 182 82 256 20 25 568 525
        1217 1112 649 587 1190 1083 1202 1101 31 46 29 94 -7 184 -87 219 -101 448
        -39 676 88 328 333 592 654 707 97 34 223 61 299 63 l40 1 -201 -203z"/>
      <path d="M671 873 c-60 -30 -93 -111 -71 -177 14 -45 69 -93 115 -102 49 -9
      119 19 146 58 46 64 30 165 -33 211 -37 27 -114 32 -157 10z"/>
    </g>
  </svg>
  Maintenance Log
</button>

<button
        onClick={() => setActiveTab("documentation")}
        className={`px-4 py-2 text-sm font-medium rounded-t-md flex items-center gap-2  ${
          activeTab === "documentation"
            ? "bg-[#00B56C] text-white"
            : "bg-transparent hover:bg-[#D1FAE5]"
        }`}
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
          {/* Documentation Icon */}
          <rect x="4" y="4" width="16" height="16" stroke={activeTab === "documentation" ? "white" : "black"} strokeWidth="2" fill="none" />
          <line x1="4" y1="10" x2="20" y2="10" stroke={activeTab === "documentation" ? "white" : "black"} strokeWidth="2" />
        </svg>
        Documentation
      </button>

 {activeTab && ( 
      <button
    onClick={() => setModalOpen(true)}
    className="ml-auto px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all"
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
    Add {activeTab}
  </button>
   )}

    </div>

    {/* Conditional Rendering of Tables */}
    {activeTab === "services" && (
      <>
        {/* Service Table Code */}
       {/*  <div className="relative w-full max-w-xs">
          <input
            type="text"
            className="w-full px-4 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B56C] transition duration-300 ease-in-out"
            placeholder="Search services..."
            onChange={handleSearchChange}
          />
        </div>
 */}
        <div className="relative">
          <div className="bg-white shadow-md rounded-lg overflow-auto">
            <table className="min-w-full table-auto">
              {/* Table header and body */}
              <thead className="bg-[#E2E8F0]">
                <tr>
                  <th className="px-2 py-1 text-center">Work order</th>
                  <th className="px-2 py-1 text-left">Service Task</th>
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
              <tr key={index} className="border-b hover:bg-[#D1FAE5]" >
                <td className="px-2 py-1 text-center">
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </td>
                <td className="px-2 py-1 text-left">{service.serviceTitle}</td>
             
                <td
                    className="px-2 py-1 text-left cursor-pointer text-blue-500 hover:underline"
                    onClick={() => handleRowClick()} // Trigger navigation
                  >
                    {service.vehicleReg}
                  </td>
      

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
                <div className="flex gap-4 justify-start">
  {/* Edit Icon */}
  <svg
    onClick={() => openUpdateModal(service)}
    className="w-6 h-6 text-green-600 cursor-pointer hover:shadow-lg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512.000000 512.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
      <path d="M4253 5080 c-78 -20 -114 -37 -183 -83 -44 -29 -2323 -2296 -2361 -2349 -21 -29 -329 -1122 -329 -1168 0 -56 65 -120 122 -120 44 0 1138 309 1166 329 15 11 543 536 1174 1168 837 838 1157 1165 1187 1212 74 116 105 270 82 407 -7 39 -30 105 -53 154 -36 76 -55 99 -182 226 -127 127 -150 145 -226 182 -135 65 -260 78 -397 42z m290 -272 c55 -27 258 -231 288 -288 20 -38 24 -60 24 -140 0 -121 -18 -160 -132 -279 l-82 -86 -303 303 -303 303 88 84 c49 46 108 93 132 105 87 42 203 41 288 -2z m-383 -673 l295 -295 -933 -932 -932 -933 -295 295 c-162 162 -295 299 -295 305 0 13 1842 1855 1855 1855 6 0 143 -133 305 -295z m-1822 -2284 c-37 -12 -643 -179 -645 -178 -1 1 30 115 68 252 38 138 79 285 91 329 l21 78 238 -238 c132 -132 233 -241 227 -243z"/>
    </g>
  </svg>

  {/* Delete Icon */}
  <svg
    onClick={() => opendeleteModal(service._id)}
    className="w-6 h-6 text-red-600 cursor-pointer hover:shadow-lg"
    xmlns="http://www.w3.org/2000/svg"
    version="1.0"
    width="512.000000pt"
    height="512.000000pt"
    viewBox="0 0 512.000000 512.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
      <path d="M1801 5104 c-83 -22 -165 -71 -224 -133 -99 -104 -137 -210 -137 -383 l0 -107 -509 -3 c-497 -3 -510 -4 -537 -24 -53 -39 -69 -71 -69 -134 0 -63 16 -95 69 -134 l27 -21 2139 0 2139 0 27 21 c53 39 69 71 69 134 0 63 -16 95 -69 134 -27 20 -40 21 -537 24 l-509 3 0 107 c0 173 -38 279 -137 383 -61 64 -141 111 -228 134 -85 22 -1431 21 -1514 -1z m1485 -330 c60 -44 69 -67 72 -185 l4 -109 -801 0 -801 0 0 94 c0 102 9 137 43 175 48 52 32 51 769 48 676 -2 687 -2 714 -23z"/>
      <path d="M575 3826 c-41 -18 -83 -69 -90 -109 -7 -36 129 -3120 144 -3270 7 -78 16 -113 44 -170 62 -132 171 -223 306 -259 61 -16 181 -17 1581 -17 1400 0 1520 1 1581 17 135 36 244 127 306 259 28 57 37 92 44 170 16 153 151 3243 144 3275 -9 39 -52 88 -92 104 -48 20 -3923 20 -3968 0z m3735 -353 c-1 -27 -31 -721 -69 -1544 -66 -1466 -68 -1497 -90 -1532 -12 -21 -40 -44 -65 -56 -42 -21 -46 -21 -1526 -21 -1480 0 -1484 0 -1526 21 -59 28 -84 72 -90 156 -6 77 -134 2944 -134 2992 l0 31 1750 0 1750 0 0 -47z"/>
      <path d="M1590 3033 c-37 -14 -74 -50 -91 -88 -18 -41 -18 -59 21 -953 31 -715 42 -917 54 -939 62 -121 224 -122 283 -3 l22 45 -39 913 c-42 966 -40 941 -92 989 -40 37 -111 53 -158 36z"/>
      <path d="M2495 3026 c-41 -18 -83 -69 -90 -109 -3 -18 -4 -442 -3 -944 3 -903 3 -912 24 -939 39 -53 71 -69 134 -69 63 0 95 16 134 69 21 27 21 34 21 966 0 932 0 939 -21 966 -11 15 -32 37 -46 47 -33 25 -113 32 -153 13z"/>
      <path d="M3420 3029 c-33 -13 -68 -47 -86 -81 -11 -21 -23 -237 -54 -939 -38 -895 -39 -914 -21 -954 54 -123 224 -125 287 -4 12 23 22 211 54 941 39 894 39 913 21 953 -10 23 -33 52 -51 65 -37 26 -111 36 -150 19z"/>
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
      </>
    )}

    {activeTab === "maintenance" && (
       <>
       {/* Service Table Code */}
      {/*  <div className="relative w-full max-w-xs">
         <input
           type="text"
           className="w-full px-4 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B56C] transition duration-300 ease-in-out"
           placeholder="Search services..."
           onChange={handleSearchChange}
         />
       </div>
*/}
       <div className="relative">
         <div className="bg-white shadow-md rounded-lg overflow-auto">
           <table className="min-w-full table-auto">
             {/* Table header and body */}
             <thead className="bg-[#E2E8F0]">
               <tr>
               <th className="px-2 py-1 text-center">Work order</th>
               <th className="px-2 py-1 text-left">Service Task</th>
                 <th className="px-2 py-1 text-left">Vehicle Reg</th>
                 <th className="px-2 py-1 text-left">Maintenance Type</th>
               
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
             <tr key={index} className="border-b hover:bg-[#D1FAE5]" >
               <td className="px-2 py-1 text-center">
                 {(currentPage - 1) * rowsPerPage + index + 1}
               </td>
               <td className="px-2 py-1 text-left">{service.serviceTitle}</td>
            
               <td
                   className="px-2 py-1 text-left cursor-pointer text-blue-500 hover:underline"
                   onClick={() => handleRowClick()} // Trigger navigation
                 >
                   {service.vehicleReg}
                 </td>
     

               <td className="px-2 py-1 text-left">{service.serviceType}</td>

            

               {service.status === "complete" ? (
                 <td className="px-2 py-1 text-left">
                   {service.status.charAt(0).toUpperCase() +
                     service.status.slice(1)}
                 </td>
               ) : (
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
                <div className="flex gap-4 justify-start">
  {/* Edit Icon */}
  <svg
    onClick={() => openUpdateModal(service)}
    className="w-6 h-6 text-green-600 cursor-pointer hover:shadow-lg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512.000000 512.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
      <path d="M4253 5080 c-78 -20 -114 -37 -183 -83 -44 -29 -2323 -2296 -2361 -2349 -21 -29 -329 -1122 -329 -1168 0 -56 65 -120 122 -120 44 0 1138 309 1166 329 15 11 543 536 1174 1168 837 838 1157 1165 1187 1212 74 116 105 270 82 407 -7 39 -30 105 -53 154 -36 76 -55 99 -182 226 -127 127 -150 145 -226 182 -135 65 -260 78 -397 42z m290 -272 c55 -27 258 -231 288 -288 20 -38 24 -60 24 -140 0 -121 -18 -160 -132 -279 l-82 -86 -303 303 -303 303 88 84 c49 46 108 93 132 105 87 42 203 41 288 -2z m-383 -673 l295 -295 -933 -932 -932 -933 -295 295 c-162 162 -295 299 -295 305 0 13 1842 1855 1855 1855 6 0 143 -133 305 -295z m-1822 -2284 c-37 -12 -643 -179 -645 -178 -1 1 30 115 68 252 38 138 79 285 91 329 l21 78 238 -238 c132 -132 233 -241 227 -243z"/>
    </g>
  </svg>

  {/* Delete Icon */}
  <svg
    onClick={() => opendeleteModal(service._id)}
    className="w-6 h-6 text-red-600 cursor-pointer hover:shadow-lg"
    xmlns="http://www.w3.org/2000/svg"
    version="1.0"
    width="512.000000pt"
    height="512.000000pt"
    viewBox="0 0 512.000000 512.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
      <path d="M1801 5104 c-83 -22 -165 -71 -224 -133 -99 -104 -137 -210 -137 -383 l0 -107 -509 -3 c-497 -3 -510 -4 -537 -24 -53 -39 -69 -71 -69 -134 0 -63 16 -95 69 -134 l27 -21 2139 0 2139 0 27 21 c53 39 69 71 69 134 0 63 -16 95 -69 134 -27 20 -40 21 -537 24 l-509 3 0 107 c0 173 -38 279 -137 383 -61 64 -141 111 -228 134 -85 22 -1431 21 -1514 -1z m1485 -330 c60 -44 69 -67 72 -185 l4 -109 -801 0 -801 0 0 94 c0 102 9 137 43 175 48 52 32 51 769 48 676 -2 687 -2 714 -23z"/>
      <path d="M575 3826 c-41 -18 -83 -69 -90 -109 -7 -36 129 -3120 144 -3270 7 -78 16 -113 44 -170 62 -132 171 -223 306 -259 61 -16 181 -17 1581 -17 1400 0 1520 1 1581 17 135 36 244 127 306 259 28 57 37 92 44 170 16 153 151 3243 144 3275 -9 39 -52 88 -92 104 -48 20 -3923 20 -3968 0z m3735 -353 c-1 -27 -31 -721 -69 -1544 -66 -1466 -68 -1497 -90 -1532 -12 -21 -40 -44 -65 -56 -42 -21 -46 -21 -1526 -21 -1480 0 -1484 0 -1526 21 -59 28 -84 72 -90 156 -6 77 -134 2944 -134 2992 l0 31 1750 0 1750 0 0 -47z"/>
      <path d="M1590 3033 c-37 -14 -74 -50 -91 -88 -18 -41 -18 -59 21 -953 31 -715 42 -917 54 -939 62 -121 224 -122 283 -3 l22 45 -39 913 c-42 966 -40 941 -92 989 -40 37 -111 53 -158 36z"/>
      <path d="M2495 3026 c-41 -18 -83 -69 -90 -109 -3 -18 -4 -442 -3 -944 3 -903 3 -912 24 -939 39 -53 71 -69 134 -69 63 0 95 16 134 69 21 27 21 34 21 966 0 932 0 939 -21 966 -11 15 -32 37 -46 47 -33 25 -113 32 -153 13z"/>
      <path d="M3420 3029 c-33 -13 -68 -47 -86 -81 -11 -21 -23 -237 -54 -939 -38 -895 -39 -914 -21 -954 54 -123 224 -125 287 -4 12 23 22 211 54 941 39 894 39 913 21 953 -10 23 -33 52 -51 65 -37 26 -111 36 -150 19z"/>
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
     </>
    )}

    {activeTab === "documentation" && (
       <>
       {/* Service Table Code */}
      {/*  <div className="relative w-full max-w-xs">
         <input
           type="text"
           className="w-full px-4 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00B56C] transition duration-300 ease-in-out"
           placeholder="Search services..."
           onChange={handleSearchChange}
         />
       </div>
*/}
       <div className="relative">
         <div className="bg-white shadow-md rounded-lg overflow-auto">
           <table className="min-w-full table-auto">
             {/* Table header and body */}
             <thead className="bg-[#E2E8F0]">
               <tr>
               <th className="px-2 py-1 text-center">Work order</th>
               <th className="px-2 py-1 text-left">Service Task</th>
                 <th className="px-2 py-1 text-left">Vehicle Reg</th>
                 <th className="px-2 py-1 text-left">Documentation Type</th>
                 <th className="px-2 py-1 text-left">{activeTab === "documentation" ? "Created Date" : "Targeted Date" }</th>
                 <th className="px-2 py-1 text-left">{activeTab === "documentation" ? "Expiry Date" : "Targeted Mileage" }</th>
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
             <tr key={index} className="border-b hover:bg-[#D1FAE5]" >
               <td className="px-2 py-1 text-center">
                 {(currentPage - 1) * rowsPerPage + index + 1}
               </td>
               <td className="px-2 py-1 text-left">{service.serviceTitle}</td>
            
               <td
                   className="px-2 py-1 text-left cursor-pointer text-blue-500 hover:underline"
                   onClick={() => handleRowClick()} // Trigger navigation
                 >
                   {service.vehicleReg}
                 </td>
     

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
                <div className="flex gap-4 justify-start">
  {/* Edit Icon */}
  <svg
    onClick={() => openUpdateModal(service)}
    className="w-6 h-6 text-green-600 cursor-pointer hover:shadow-lg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512.000000 512.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
      <path d="M4253 5080 c-78 -20 -114 -37 -183 -83 -44 -29 -2323 -2296 -2361 -2349 -21 -29 -329 -1122 -329 -1168 0 -56 65 -120 122 -120 44 0 1138 309 1166 329 15 11 543 536 1174 1168 837 838 1157 1165 1187 1212 74 116 105 270 82 407 -7 39 -30 105 -53 154 -36 76 -55 99 -182 226 -127 127 -150 145 -226 182 -135 65 -260 78 -397 42z m290 -272 c55 -27 258 -231 288 -288 20 -38 24 -60 24 -140 0 -121 -18 -160 -132 -279 l-82 -86 -303 303 -303 303 88 84 c49 46 108 93 132 105 87 42 203 41 288 -2z m-383 -673 l295 -295 -933 -932 -932 -933 -295 295 c-162 162 -295 299 -295 305 0 13 1842 1855 1855 1855 6 0 143 -133 305 -295z m-1822 -2284 c-37 -12 -643 -179 -645 -178 -1 1 30 115 68 252 38 138 79 285 91 329 l21 78 238 -238 c132 -132 233 -241 227 -243z"/>
    </g>
  </svg>

  {/* Delete Icon */}
  <svg
    onClick={() => opendeleteModal(service._id)}
    className="w-6 h-6 text-red-600 cursor-pointer hover:shadow-lg"
    xmlns="http://www.w3.org/2000/svg"
    version="1.0"
    width="512.000000pt"
    height="512.000000pt"
    viewBox="0 0 512.000000 512.000000"
    preserveAspectRatio="xMidYMid meet"
  >
    <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none">
      <path d="M1801 5104 c-83 -22 -165 -71 -224 -133 -99 -104 -137 -210 -137 -383 l0 -107 -509 -3 c-497 -3 -510 -4 -537 -24 -53 -39 -69 -71 -69 -134 0 -63 16 -95 69 -134 l27 -21 2139 0 2139 0 27 21 c53 39 69 71 69 134 0 63 -16 95 -69 134 -27 20 -40 21 -537 24 l-509 3 0 107 c0 173 -38 279 -137 383 -61 64 -141 111 -228 134 -85 22 -1431 21 -1514 -1z m1485 -330 c60 -44 69 -67 72 -185 l4 -109 -801 0 -801 0 0 94 c0 102 9 137 43 175 48 52 32 51 769 48 676 -2 687 -2 714 -23z"/>
      <path d="M575 3826 c-41 -18 -83 -69 -90 -109 -7 -36 129 -3120 144 -3270 7 -78 16 -113 44 -170 62 -132 171 -223 306 -259 61 -16 181 -17 1581 -17 1400 0 1520 1 1581 17 135 36 244 127 306 259 28 57 37 92 44 170 16 153 151 3243 144 3275 -9 39 -52 88 -92 104 -48 20 -3923 20 -3968 0z m3735 -353 c-1 -27 -31 -721 -69 -1544 -66 -1466 -68 -1497 -90 -1532 -12 -21 -40 -44 -65 -56 -42 -21 -46 -21 -1526 -21 -1480 0 -1484 0 -1526 21 -59 28 -84 72 -90 156 -6 77 -134 2944 -134 2992 l0 31 1750 0 1750 0 0 -47z"/>
      <path d="M1590 3033 c-37 -14 -74 -50 -91 -88 -18 -41 -18 -59 21 -953 31 -715 42 -917 54 -939 62 -121 224 -122 283 -3 l22 45 -39 913 c-42 966 -40 941 -92 989 -40 37 -111 53 -158 36z"/>
      <path d="M2495 3026 c-41 -18 -83 -69 -90 -109 -3 -18 -4 -442 -3 -944 3 -903 3 -912 24 -939 39 -53 71 -69 134 -69 63 0 95 16 134 69 21 27 21 34 21 966 0 932 0 939 -21 966 -11 15 -32 37 -46 47 -33 25 -113 32 -153 13z"/>
      <path d="M3420 3029 c-33 -13 -68 -47 -86 -81 -11 -21 -23 -237 -54 -939 -38 -895 -39 -914 -21 -954 54 -123 224 -125 287 -4 12 23 22 211 54 941 39 894 39 913 21 953 -10 23 -33 52 -51 65 -37 26 -111 36 -150 19z"/>
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
     </>
    )}
  </>
)}



        {/* Modal for adding/updating service */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-xl font-bold mb-4 text-center">
                {formData._id ? `Update ${activeTab} `: `Add ${activeTab}`}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Service Task
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
             {/*    <div className="mb-4">
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
                </div> */}
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                  {activeTab} Type
                  </label>
                 {/*  <Select
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
                  /> */}
                  {activeTab === "maintenance" ? (
  <>
   <div className="mb-4 ml-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.Preventive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Preventive: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label>Preventive maintenance</label>
                </div>
                <div className="mb-4 ml-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.Corrective}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Corrective: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label>Corrective maintenance</label>
                </div>
  </>
) : activeTab === "services" ? (
  // Your JSX for when activeTab is "services"
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
) : (
  <>
 
                <MuiPickersUtilsProvider   utils={DateFnsUtils}>
                      <DatePicker
                        value={formData.targetValue || null}
                        onChange={handleDateChange}
                        format="MM/dd/yyyy" // Display format for the date
                        variant="dialog"
                        placeholder="Created Date "
                        minDate={currentDate} // Prevent selecting past dates
                        autoOk
                        inputProps={{ readOnly: true }} // Make input read-only
                        style={{
                          marginTop: '2%', // Adjust top margin
                          width: '160px', // Adjust width of the input
                          border: '1px solid #ccc', // Border style
                          borderRadius: '5px', // Rounded corners
                        padding: '10px',
                          fontSize: '14px', // Font size
                    
                        }}
                        InputProps={{
                          endAdornment: (
                            <EventIcon
                              style={{ width: "20px", height: "20px" }}
                              className="text-gray"
                            />
                          ),
                        }}
                        DialogProps={{
                          PaperProps: {
                            style: {
                              backgroundColor: '#f4f6f8', // Change background color of the calendar dialog
                              borderRadius: '10px', // Round corners of the calendar dialog
                              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)', // Shadow for the dialog
                            
height: "458px",

                            },
                          },
                        }}
                      
                     
                      />
                    <DatePicker
                        value={formData.targetValue || null}
                        onChange={handleDateChange}
                        format="MM/dd/yyyy" // Display format for the date
                        variant="dialog"
                        placeholder="Created Date "
                        minDate={currentDate} // Prevent selecting past dates
                        autoOk
                        inputProps={{ readOnly: true }} // Make input read-only
                        style={{
                          marginTop: '2%', // Adjust top margin
                          width: '160px', // Adjust width of the input
                          border: '1px solid #ccc', // Border style
                          borderRadius: '5px', // Rounded corners
                        padding: '10px',
                          fontSize: '14px', // Font size
                    
                        }}
                        InputProps={{
                          endAdornment: (
                            <EventIcon
                              style={{ width: "20px", height: "20px" }}
                              className="text-gray"
                            />
                          ),
                        }}
                        DialogProps={{
                          PaperProps: {
                            style: {
                              backgroundColor: '#f4f6f8', // Change background color of the calendar dialog
                              borderRadius: '10px', // Round corners of the calendar dialog
                              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)', // Shadow for the dialog
                            
height: "458px",

                            },
                          },
                        }}
                      
                     
                      />  
                    </MuiPickersUtilsProvider>
                    <div className="flex flex-col items-center p-6 border rounded-md shadow-lg space-y-4 w-80 mx-auto">
      <h2 className="text-lg font-semibold text-gray-700">Upload PDF, JPEG, or PNG</h2>
      
      <input 
        type="file" 
        accept=".pdf, .jpeg, .jpg, .png"
        onChange={handleFileChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      {file && (
        <div className="w-full flex justify-between items-center">
          <p className="text-gray-700">Selected file: {file.name}</p>
          <button 
            onClick={handleSubmit} 
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Upload File
          </button>
        </div>
      )}
    </div>
  </>
)}
                    
                </div>

                {formData.serviceType === "Datewise" && (
                  <div className="mb-4 ml-1">
                    <label className="block text-sm font-medium">
                      Alert Date & Time
                    </label>
                   

                    <MuiPickersUtilsProvider   utils={DateFnsUtils}>
                      <DatePicker
                        value={formData.targetValue || null}
                        onChange={handleDateChange}
                        format="MM/dd/yyyy" // Display format for the date
                        variant="dialog"
                        placeholder="Start Date"
                        minDate={currentDate} // Prevent selecting past dates
                        autoOk
                        inputProps={{ readOnly: true }} // Make input read-only
                        style={{
                          marginTop: '2%', // Adjust top margin
                          width: '160px', // Adjust width of the input
                          border: '1px solid #ccc', // Border style
                          borderRadius: '5px', // Rounded corners
                        padding: '10px',
                          fontSize: '14px', // Font size
                    
                        }}
                        InputProps={{
                          endAdornment: (
                            <EventIcon
                              style={{ width: "20px", height: "20px" }}
                              className="text-gray"
                            />
                          ),
                        }}
                        DialogProps={{
                          PaperProps: {
                            style: {
                              backgroundColor: '#f4f6f8', // Change background color of the calendar dialog
                              borderRadius: '10px', // Round corners of the calendar dialog
                              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)', // Shadow for the dialog
                            
height: "458px",

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
        InputProps={{
          endAdornment: (
            <AccessTimeIcon
              style={{ width: '20px', height: '20px' }} // Size the icon
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
                {activeTab !== "maintenance" && (
                  <>
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
                </>
 )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false); // Close the modal
                      seteditModal(false);
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
      {!selectedvehicle && 
      <div className="px-4 col-span-4 mt-[42px] pl-[150px]">
    {/*   <div className="grid grid-cols-12 gap-4">
 
      <div className="col-span-12 bg-[#f3f4f6] rounded-md shadow p-4">
  <div className="grid gap-y-[130px]">
 
    <div>
      <h2 className="text-lg font-bold text-gray-700  pb-2">Vehicle 1 Header</h2>
      <div className="bg-green-500 p-4 rounded-md shadow">
      <div className="text-center">
  <h2 className="text-lg font-bold text-gray-700 pb-4">Vehicle 1 Header</h2>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <p className="text-4xl font-bold text-green-600">9</p>
      <p className="text-sm font-medium">Assigned</p>
    </div>
    <div>
      <p className="text-4xl font-bold text-yellow-500">0</p>
      <p className="text-sm font-medium">Unassigned</p>
    </div>
  </div>
</div>

      </div>
    </div>

  
    <div>
      <h2 className="text-lg font-bold text-gray-700 border-b pb-2">Vehicle 2 Header</h2>
      <div className="bg-green-500 p-4 rounded-md shadow">
        <div className="grid grid-cols-2 text-center">
     
          <div>
            <p className="text-4xl font-bold text-green-600">9</p>
            <p className="text-sm font-medium">Assigned</p>
          </div>
       
          <div>
            <p className="text-4xl font-bold text-yellow-500">0</p>
            <p className="text-sm font-medium">Unassigned</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>bg-[#f3f4f6]
</div> */}
<div className="grid row-span-2 gap-[42px]">
<div className="p-2 rounded-md bg-white border border-gray p-2 w-[345px] h-[170px]">

    <h2 className="text-lg font-bold text-gray-700 pb-8">Vehicle Service Reminder</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-4xl font-bold text-red">{vehicleList.filter((item) => item.DeviceAttach === true).length}
        </p>
        <p className="text-sm font-medium">Over Due</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-yellow">{vehicleList.filter((item) => item.DeviceAttach === false).length}</p>
        <p className="text-sm font-medium">Due Soon</p>
      </div>
    </div>
  </div>

  <div className="p-2 rounded-md bg-white border border-gray p-2 w-[345px] h-[170px]">

    <h2 className="text-lg font-bold text-gray-700 pb-8">Vehicle Renewal Reminders</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <p className="text-4xl font-bold text-red">9</p>
        <p className="text-sm font-medium">Over Due</p>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-yellow">0</p>
        <p className="text-sm font-medium">Due Soon</p>
      </div>
    </div>
  </div>
</div>

        
         </div>
        }
      </div>

    </div>
  );
}


/* 


<div className="flex flex-wrap mt-8">
        <h2 className="text-3xl font-bold mr-2">Select Vehicle</h2>

     
        {selectedvehicle && (
          <button
            onClick={() => setselectedvehicle(null)}
            className="bg-[#00B56C] text-white px-4 rounded-lg flex items-center hover:shadow-lg w-full sm:w-auto"
          >
            {selectedvehicle}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-5 h-5 ml-2 cursor-pointer"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
         {selectedvehicle && activeTab && (
          <button
            onClick={() => setActiveTab(null)}
            className="bg-[#00B56C] text-white ml-4 px-4 rounded-lg flex items-center hover:shadow-lg w-full sm:w-auto"
          >
            {activeTab}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-5 h-5 ml-2 cursor-pointer"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {!selectedvehicle && (
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode("card")}
              className={`px-4 py-2 rounded-lg ${viewMode === "card" ? "bg-[#00B56C] text-white" : "bg-white text-[#00B56C]"} border`}
            >
             <svg
  xmlns="http://www.w3.org/2000/svg"
  fill="currentColor"
  viewBox="0 0 24 24"
  className="w-5 h-5 mr-2"
>
          
  <path d="M20 3H4c-1.1 0-1.99.9-1.99 2L2 19c0 1.1.89 1.99 1.99 1.99H20c1.1 0 1.99-.89 1.99-1.99V5c0-1.1-.89-2-1.99-2zm-1 16H5V6h14v13z" />
</svg>

             
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg ${viewMode === "table" ? "bg-[#00B56C] text-white" : "bg-white text-[#00B56C]"} border`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5 mr-2"
              >
        
                <path d="M3 4v16h18V4H3zm0 2h18v12H3V6zm0 14v2h18v-2H3z" />
              </svg>
             
            </button>
          </div>
        )}
      </div>

*/