"use client";
import React, { useEffect, useState } from 'react'
import { MuiPickersUtilsProvider, DatePicker, TimePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns"; // Correcting to DateFnsUtils
import EventIcon from "@material-ui/icons/Event"; // Event icon for calendar
import { addDocument, deleteDocuments, editDocuments, getDocuments } from '@/utils/API_CALLS';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function Documents() {
  const { data: session } = useSession();
  const router = useRouter()
  if (!session?.ServiceHistory) {
    router.push("/liveTracking");
  }

  const [documents, setdocuments] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setdocumentType] = useState<String>()
  const initialFormData: any = {
    id: "",
    title: "",
    issueDate: "",
    expiryDate: "",
    file: "",
    fileType: "",
    fileName: "",
    clientId: "",
  };
  const [formData, setFormData] = useState<any[]>(initialFormData);
  const [deleteModal, setDeleteModal] = useState(false)
  const [id, setId] = useState("")
  async function loadDocuments() {
    setdocuments((await getDocuments(session?.accessToken)).data)
  }
  useEffect(() => {
    loadDocuments()
  }, []);
  const handleDelete = async () => {
    let response = await deleteDocuments(id, session?.accessToken)
    if (response.success) {

      toast.success(response.message, { position: "top-center" })
    } else {
      toast.error(response.message, { position: "top-center" })

    }

    setDeleteModal(false)
    setId("")
    loadDocuments()

  }
  const handleSubmit = async (e: any) => {
    if (!formData.title) {
      toast.error("Document title is missing", { position: "top-center" })
      return
    }
    if (error != "") {
      toast.error(error, { position: "top-center" })
      return
    }
    if (documentType == "Update") {

      let response = await editDocuments(formData, session?.accessToken)
      if (response?.success) {

        toast.success(response?.message, { position: "top-center" })
        loadDocuments()
        setFormData(initialFormData)
        setModalOpen(false)
      } else {
        toast.error(response?.message, { position: "top-center" })

      }
    } else {
      if (!file) {
        toast.error("Please upload an document", { position: "top-center" })

      }
      let data = new FormData()

      data.append("file", file)
      data.append("clientId", session?.clientId)
      data.append("title", formData.title)
      data.append("issueDate", formData.issueDate)
      data.append("expiryDate", formData.expiryDate)


      let response = await addDocument(data, session?.accessToken)
      if (response?.success) {

        toast.success(response?.message, { position: "top-center" })
        loadDocuments()
        setFormData(initialFormData)
        setModalOpen(false)
      } else {
        toast.error(response?.message, { position: "top-center" })

      }
    }

  }

  const handleCreatedDateChange = (newDate) => {

    const formattedDate = newDate ? newDate.toISOString().split("T")[0] : null;

    setFormData((prev) => ({
      ...prev,
      issueDate: formattedDate, // Update state with formatted date or null
    }));
  };
  const handleExpiryDateChange = (newDate) => {

    const formattedDate = newDate ? newDate.toISOString().split("T")[0] : null;

    setFormData((prev) => ({
      ...prev,
      expiryDate: formattedDate, // Update state with formatted date or null
    }));
  };


  const handleFileChange = async (e) => {


    const selectedFile = e.target.files[0];
    setFile(e.target.files[0]);

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setError('');
    } else {
      setError('Please upload a valid PDF, JPEG, or PNG file.');
      setFile(null);
    }
  };
  const handleInputChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      title: e.target.value, // Update state with formatted date or null
    }));
  }




  const openUpdateModal = (document: any) => {

    setdocumentType("Update");
    setFormData({ ...document, id: document._id });
    setModalOpen(true);
  }


  const opendelteModal = (document: any) => {

    setId(document._id)
    setDeleteModal(true);
  }
  const data = Array.from({ length: 50 }, (_, i) => ({
    header1: `Data ${i + 1} - Col 1`,
    header2: `Data ${i + 1} - Col 2`,
    header3: `Data ${i + 1} - Col 3`,
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Calculate total pages
  const totalPages = Math.ceil(documents.length / rowsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = documents.slice(startIndex, startIndex + rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  return (
    <div>
      <p className="bg-green px-4 py-1 border-t  text-center text-2xl text-white font-bold journey_heading">
        Manage Documents
      </p>
      <div className="grid xl:grid-cols-10 lg:grid-cols-10 md:grid-cols-12  gap-2
         lg:px-4 text-start  bg-bgLight ">
        <div
          className="xl:col-span-8 lg:col-span-8 md:col-span-7 col-span-8"

        >

        </div>


        <div
          className="xl:col-span-2 lg:col-span-2 md:col-span-3 col-span-2"

        ><button
          onClick={() => {
            setdocumentType("Add")
            setModalOpen(true)
          }}
          className="
        mt-[10px] ml-[10px] mb-[10px]  
        px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 bg-[#00B56C] text-white hover:bg-[#028B4A] transition-all"
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
            Upload Document
          </button>

        </div>
      </div>


      <div className="relative px-4">
        <div className="bg-white shadow-md overflow-y-auto"
          style={{ maxHeight: "40rem" }}>
          <table className="table-auto border-collapse border border-gray-300 w-full ">
            {/* Table header and body */}
            <thead className="bg-[#E2E8F0]">
              <tr>
                <th className="px-2 py-1 text-center">S.No</th>
                <th className="px-2 py-1 text-left">Document Title</th>

                <th className="px-2 py-1 text-left">Issue Date</th>
                <th className="px-2 py-1 text-left">Expiry Date</th>
                <th className="px-2 py-1 text-left">Document Type</th>
                <th className="px-2 py-1 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {(documents?.length === 0) ? (
                <tr>
                  <td colSpan="8" className="px-4 py-2 text-center text-gray-500">
                    No Data Found
                  </td>
                </tr>
              ) : (
                documents
                  .map((document, index) => (
                    <tr key={index} className="border-b hover:bg-[#D1FAE5]" >
                      <td className="px-2 py-1 text-center">
                        {index + 1}
                      </td>
                      <td className="px-2 py-1 text-left">{document?.title}</td>





                      <td className="px-2 py-1 text-left">{document?.issueDate}</td>
                      <td className="px-2 py-1 text-left">{document?.expiryDate}</td>
                      <td className="px-2 py-1 text-left">{document?.fileType?.replace("/", "-")}</td>



                      <td className="px-2 py-1 text-left">
                        <div className="flex gap-2 justify-start">
                          <svg
                            onClick={() => openUpdateModal(document)}
                            className="w-6 h-6 text-blue-600 cursor-pointer hover:shadow-lg"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                          >
                            <path
                              fill="none"
                              d="M0 0h24v24H0z"
                            />
                            <path
                              d="M12 4.5C7.15 4.5 3.12 6.68 1.26 9.47c-.22.35-.22.76 0 1.1C3.12 17.32 7.15 19.5 12 19.5c4.85 0 8.88-2.18 10.74-4.97.22-.35.22-.76 0-1.1C20.88 6.68 16.85 4.5 12 4.5zm0 10.5c-2.49 0-4.5-1.5-4.5-3s2.01-3 4.5-3 4.5 1.5 4.5 3-2.01 3-4.5 3zm0-5c-.83 0-1.5.67-1.5 1.5S11.17 12 12 12s1.5-.67 1.5-1.5S12.83 9 12 9z"
                            />
                          </svg>

                          {/* Edit Icon */}
                          <svg
                            onClick={() => openUpdateModal(document)}
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
                            onClick={() => opendelteModal(document)}
                            className="w-6 h-6 text-red-600 cursor-pointer hover:shadow-lg"
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.0"
                            width="512.000000pt"
                            height="512.000000pt"
                            viewBox="0 0 512.000000 512.000000"
                            preserveAspectRatio="xMidYMid meet"
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
                    // ) 
                  ))
              )}
            </tbody>
          </table>
        </div>





      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-center">
              {documentType} Document
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium">
                Document Title
              </label>
              <input
                type="text"
                name="documentTitle"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-[#CBD5E0] rounded-lg"
                placeholder="Insurance Doc / Mot Doc"

              />
            </div>




            <label className="block text-sm font-medium">
              Issue Date
            </label>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker
                value={formData.issueDate || null}
                onChange={handleCreatedDateChange}
                format="MM/dd/yyyy" // Display format for the date
                variant="dialog"
                placeholder="Issue Date "
                maxDate={new Date()} // Prevent selecting past dates


                autoOk
                inputProps={{ readOnly: true }} // Make input read-only
                style={{
                  marginTop: '0%', // Adjust top margin
                  marginBottom: "2%",
                  width: '333px', // Adjust width of the input
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
              <label className="block text-sm font-medium">
                Expiry Date
              </label>
              <DatePicker
                value={formData.expiryDate || null}
                onChange={handleExpiryDateChange}
                format="MM/dd/yyyy" // Display format for the date
                variant="dialog"
                placeholder="Expiry Date "
                minDate={formData.issueDate} // Prevent selecting past dates
                autoOk
                inputProps={{ readOnly: true }} // Make input read-only
                style={{
                  marginTop: '0%', // Adjust top margin
                  width: '333px', // Adjust width of the input
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
            {documentType == "Add" &&
              <div className=" mt-4">
                <h2 className="block text-sm font-medium">Upload PDF, JPEG, or PNG</h2>

                <input
                  type="file"
                  accept=".pdf, .jpeg, .jpg, .png"
                  onChange={handleFileChange}
                  className="w-full pr-3 py-2  rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {error && <p className="text-sm "
                  style={{
                    color: "red"
                  }}
                >{error}</p>}


              </div>
            }





            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setFormData(initialFormData)

                }}
                className="bg-[#E53E3E] text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                // type="submit"
                onClick={handleSubmit}
                className="bg-[#00B56C] text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-100">
            <h3 className="text-xl font-bold mb-4 text-center">
              Delete Document
            </h3>
            <p>
              Are You sure, You wants to delete a document
            </p>

            <div className="flex justify-center space-x-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setDeleteModal(false)
                  setId("")

                }}
                className="bg-[#E53E3E] text-white px-4 py-2 rounded-lg"
              >
                No
              </button>
              <button
                onClick={handleDelete}
                className="bg-[#00B56C] text-white px-4 py-2 rounded-lg"
              >
                Yes
              </button>
            </div>

          </div>
        </div>
      )

      }
    </div>
  )
}

export default Documents