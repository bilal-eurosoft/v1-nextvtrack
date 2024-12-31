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

export default function Document({documentationdata, singleVehicleDetail}:any) { 
    const { data: session } = useSession();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [selectedDocumentsForAttach, setSelectedDocumentsForAttach] = useState(
        []
      );
      const [confirmModalOpen, setconfirmModalOpen] = useState(false);

      const [fetchedDocumentsbyVehicle, setfetchedDocumentsbyVehicle] = useState([]);
      const initialFormData = {
        sms: false,
        email: false,
        pushNotification: false,
      }
      const [documentDataforupdate, setdocumentDataforupdate] = useState();
      const [formData, setFormData] = useState(initialFormData);
       const [dateforalert, setdateforalert] = useState({ id: null, date: null });
      const [loading, setLoading] = useState(true); // Initial loading state
   
      useEffect(() => {
        const d = documentationdata.filter((item) => item.vehicleId === singleVehicleDetail[0]._id);
        setfetchedDocumentsbyVehicle(d);
        setLoading(false); // Data is loaded, set loading to false
      }, [documentationdata]);
      
      // Effect to fetch services from API
      useEffect(() => {
        const loadServices = async () => {
          try {
            const fetchedServices = await fetchServicesFromAPI();
            if (fetchedServices.length > 0) {
              const filteredServices = fetchedServices.filter(
                (service: any) => service.dataType === 'Documentation' && service.vehicleId === singleVehicleDetail[0]._id
              );
              setfetchedDocumentsbyVehicle(filteredServices);
            } else {
              setfetchedDocumentsbyVehicle([]);
            }
          } catch (error) {
            toast.error("Failed to load services.");
          } finally {
            setLoading(false); // Data is loaded, set loading to false
          }
        };
        loadServices();
      }, []);

      const loadServices = async () => {
        try {
          const fetchedServices = await fetchServicesFromAPI();
       //   console.log("fetchedServices", fetchedServices);
          if (fetchedServices.length > 0) {
            //  documentationdata.filter((item)=> item.vehicleId === singleVehicleDetail[0]._id )
          
            
                  const filteredServices = fetchedServices.filter(
                      (service: any) => service.dataType === 'Documentation' && service.vehicleId === singleVehicleDetail[0]._id
                    );
                    
                 //   console.log("Filtered Services:", filteredServices);
                  setfetchedDocumentsbyVehicle( filteredServices)
              
              
       
  
          } else {
          }
        } catch (error) {
          toast.error("Failed to load services.");
      
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
          } catch (error) {
            toast.error("Failed to load services.");
            return [];
          }
        }
      };
      
    const fetchDocumentsFromAPI = async () => {
        if (session) {
          try {
            const Data = await getDocuments(session.accessToken);
            return Data.data;
          } catch (error) {
            toast.error("Failed to load services.");
            return [];
          }
        }
      };

      useEffect(() => {
        const loadDocuments = async () => {
          try {
            const fetchedDocuments = await fetchDocumentsFromAPI();
  //  console.log("fetchedDocuments", fetchedDocuments);
            if (fetchedDocuments.length > 0) {
              setSelectedDocuments(fetchedDocuments);
            
            } else {
              setSelectedDocuments([]); // Empty data set
            
            }
          } catch (error) {
            toast.error("Failed to load documents.");
            setSelectedDocuments([]); // In case of error, set to empty
          }
        };
        loadDocuments();
      }, []);    


      const handleDocumentsChangeForDocumenttab = (selectedOption) => {
        if (selectedOption) {
          // Add selected document if not already selected
          if (!selectedDocumentsForAttach.some((doc) => doc._id === selectedOption._id)) {
            setSelectedDocumentsForAttach([...selectedDocumentsForAttach, selectedOption]);
          }
        }
      };
    
      // Handle document removal
      const handleRemoveDocumentForDocumenttab = (documentId) => {
        setSelectedDocumentsForAttach((prev) =>
          prev.filter((doc) => doc._id !== documentId)
        );
      };

      const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prevData) => ({
          ...prevData,
          [name]: checked,
        }));
      };


      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const documentData = selectedDocumentsForAttach.map(item => ({
            serviceTitle: item.title,
            file: item.file,
            filename: item.fileName,
            documentType: item.fileType,
            issueDate: item.issueDate,
            expiryDate: item.expiryDate
          }));
    
          const payload = {
    
            clientId: singleVehicleDetail[0].clientId,
            vehicleId: singleVehicleDetail[0]._id,
            pushnotification: formData.pushNotification,
            sms: formData.sms,
            email: formData.email,
            documents: documentData, dataType: "Documentation"
          }
          console.log("payload",payload);

    
          const Data = await handleServiceHistoryRequest({
            token: session?.accessToken,
            method: "POST",
            body: payload,
          });
    
          if (Data.success == true) {
            toast.success(Data.message);
            setModalOpen(false);
               setFormData(initialFormData)
               await loadServices()
          }
        }
    
    
          const handledelete = async (id) =>{
      console.log("id",id);
            const Data = await handleServiceHistoryRequest({
                token: session?.accessToken,
                method: "DELETE",
                body: id,  
              });
        
              if (Data.success == true) {
                toast.success(Data.message);
                setFormData(initialFormData)
                await loadServices()
              }
          }


          const handleDateChange = async (newDate, id) => {
            // Ensure that the selected date is either valid or null
            const formattedDate = format(newDate, 'dd-MM-yyyy'); // use date-fns to format it

     // console.log("object", newDate, "formattedDate", formattedDate);
           setdateforalert((prevData) => ({
            ...prevData,
            id: id,
            date: formattedDate
          })
        )
        //api call
        const payload= {
            id: id,
            reminderDate: formattedDate
        }
        const Data = await handleServiceHistoryRequest({
            token: session?.accessToken,
            method: "PUT",
            body: payload,  
          });
    
          if (Data.success == true) {
            toast.success(Data.message);
            setFormData(initialFormData)
            await loadServices()
          }

          };

          const closeConfirmationModal = () => {
            setconfirmModalOpen(false);
            // setSelectedServiceId(null);
          };
        
          const handleConfirmUpdate = async () => {
         
          const payload = {
            id: documentDataforupdate?._id,
            status: "renew"
          }
        
              if (session) {
                const Data = await handleServiceHistoryRequest({
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
                  Attach Document
                </button>

                <div className="relative">
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <div className="table-container" style={{ maxHeight: '500px', minHeight: '200px', overflowY: 'auto' }}>
  {/*   <div className="bg-white shadow-md rounded-lg overflow-auto"> */}
      {loading ? (
        // Show a loading spinner or placeholder if data is not loaded
        <div className="text-center py-4">Loading...</div>
      ) : (

      <table className="min-w-full table-auto">
        <thead className="bg-[#E2E8F0]">
          <tr>
            <th className="px-2 py-1 text-center">S.No</th>
            <th className="px-2 py-1 text-left">Document Title</th>
            <th className="px-2 py-1 text-left">Issue Date</th>
            <th className="px-2 py-1 text-left">Expiry Date</th>
            <th className="px-2 py-1 text-left">Documentation Type</th>
            <th className="px-2 py-1 text-left">When to Trigger Alert</th>
            <th className="px-2 py-1 text-left">Status</th>
            <th className="px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(fetchedDocumentsbyVehicle.length === 0) ? (
            <tr>
              <td colSpan="7" className="px-4 py-2 text-center text-gray-500">
                No Data Found
              </td>
            </tr>
          ) : (
            fetchedDocumentsbyVehicle.map((service, index) => (
              <tr key={service._id}>
                <td className="px-2 py-1 text-center">{index + 1}</td>
                <td className="px-2 py-1">{service.serviceTitle}</td>
                <td className="px-2 py-1">{service.issueDate}</td>
                <td className="px-2 py-1">{service.expiryDate}</td>
                <td className="px-2 py-1">{service.documentType?.replace(/\/[^/]+$/, '')}</td>
                <td className="px-2 py-1">
                  {/* Date picker component for alertTime */}
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker
                 
                 
                      value= { service.reminderDate ? service.reminderDate : dateforalert.id === service._id ? dateforalert.date : null} // Correct value for DatePicker
                      onChange={(date) => handleDateChange(date, service._id)} // Ensure service._id is passed correctly
                      format="MM/dd/yyyy"
                      variant="dialog"
                      placeholder="Trigger Date"
                      minDate={service.issueDate}
                      maxDate={service.expiryDate}
                      autoOk
                      inputProps={{ readOnly: true }}
                      style={{
                        width: "150px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        padding: "5px",
                        fontSize: "14px",
                      }}
                      InputProps={{
                        endAdornment: (
                          <EventIcon
                            style={{ width: "20px", height: "20px" }}
                            className="text-gray"
                          />
                        ),
                      }}
                    />
                  </MuiPickersUtilsProvider>
                </td>
                <td
  className={`px-2 py-1 ${service.status === "pending" ? "text-[#808080]" :
    service.status === "due soon" ? "text-[#FFA500]" :
    service.status === "due" ? "text-[#FF0000]" :
    service.status === "renew" ? "text-[#008000]" : ""}`}
  style={{ cursor: service.status === "renew" ? 'not-allowed' : 'pointer' }}
  onClick={() => {
    if (service.status !== "complete") {
        setdocumentDataforupdate(service);
      setconfirmModalOpen(true);
    }
  }}
>
  {service.status}
</td>

                <td className="px-2 py-1 text-left">
                  <div className="flex gap-4 justify-start">
                    {/* Edit Icon */}
                    <svg
                      className="w-6 h-6 text-green-600 cursor-pointer hover:shadow-lg"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512.000000 512.000000"
                      preserveAspectRatio="xMidYMid meet"
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
       )}
    </div>
       
  </div>
</div>

        {modalOpen && (
                <> 
             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className={`bg-white p-6 rounded-lg w-[45rem]`}>
             <h3 className="text-xl font-bold mb-4 text-center">
             Attach Document
                </h3>
                <form onSubmit={handleSubmit}>
                <div className="selected-documents flex flex-wrap mb-4 gap-4">
                        {selectedDocumentsForAttach.map((document) => (
                          <div
                            key={document._id}
                            className="selected-item flex items-center justify-between w-[30%] mb-2 px-3 py-2 bg-[#dcfce7] text-green-700 rounded-lg text-sm"
                          >
                            <span className="truncate w-[180px]">{document?.title}</span>

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
                        options={selectedDocuments.filter(
                          (option) => !selectedDocumentsForAttach.some((doc) => doc._id === option._id)
                        ).map((doc) => ({
                          label: doc.title, // Use the title for display
                          value: doc._id,  // Use _id as the value
                          ...doc, // Keep other properties for later use
                        }))}
                        placeholder="Select Document"
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

              
              

  
<div>
      <label className="block text-sm font-medium mb-2 ml-2">
        Alert types
      </label>
      <div className="mb-2 ml-2 flex items-center">
        <input
          type="checkbox"
          name="sms" // Use name attribute to reference the state
          checked={formData.sms} // Bind to formData.sms
          onChange={handleCheckboxChange} // Update the state when checkbox is clicked
          className="mr-2"
        />
        <label>SMS</label>
      </div>
      <div className="mb-2 ml-2 flex items-center">
        <input
          type="checkbox"
          name="email" // Use name attribute to reference the state
          checked={formData.email} // Bind to formData.email
          onChange={handleCheckboxChange} // Update the state when checkbox is clicked
          className="mr-2"
        />
        <label>Email</label>
      </div>
      <div className="mb-4 ml-2 flex items-center">
        <input
          type="checkbox"
          name="pushNotification" // Use name attribute to reference the state
          checked={formData.pushNotification} // Bind to formData.pushNotification
          onChange={handleCheckboxChange} // Update the state when checkbox is clicked
          className="mr-2"
        />
        <label>Push Notifications</label>
      </div>
    </div>

                
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setModalOpen(false); // Close the modal
                      /*   seteditModal(false);
                        setTimeValue(null)
                        setFile(null)
                        setFormData(initialFormData); // Reset form data to initial state
                        setselectedserviceDocuments([]) */
                        setFormData(initialFormData)
                        setSelectedDocumentsForAttach([])
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
                
                    Are you sure you want to Update this document status to Renew
                
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
                    Yes, renew
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