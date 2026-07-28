"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import axios from "axios";
import { toast } from "react-toastify";
import { MultiSelect } from "react-multi-select-component";
import { MdArrowRightAlt } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { v4 as uuidv4 } from "uuid";
import logo from "../../assets/dusk.jpg";
import scbus from "../../assets/scbus.png";
import { useReactToPrint } from "react-to-print";
import Webcam from "react-webcam";
import ToggleButton from "../toggle/ToggleButton";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { RiFileExcel2Fill } from "react-icons/ri";

const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};
const ManageStudents = () => {
  const componentRef = useRef(null);
  const videoRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const [showWebcam1, setShowWebcam1] = useState(false);
  const [showWebcam2, setShowWebcam2] = useState(false);
  const [showWebcam3, setShowWebcam3] = useState(false);
  const webcamRef = useRef(null);
  const webcamRef2 = useRef(null);
  const webcamRef3 = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const optionsTransport = [
    { label: "Birth Certificate", value: "Birth Certificate" },
    {
      label: "Transfer Certificate of Previous School Attended",
      value: "Transfer Certificate of Previous School Attended",
    },
    { label: "Photocopy Result Card", value: "Photocopy Result Card" },
    { label: "Photocopy Aadhar Card", value: "Photocopy Aadhar Card" },
    {
      label: "Passport size Photograph of the Student",
      value: "Passport size Photograph of the Student",
    },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentAvatarUpdate, setStudentAvatarUpdate] = useState("");
  const [fatherPhotoUpdate, setFatherPhotoUpdate] = useState("");
  const [motherPhotoUpdate, setMotherPhotoUpdate] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [house, setHouse] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [userData, setUserData] = useState([]);
  const [gender, setGender] = useState("");
  const [religion, setReligion] = useState("");
  const [address, setAddress] = useState("");
  const [address2, setAddress2] = useState("");
  const [fathersName, setFathersName] = useState("");
  const [mothersName, setMothersName] = useState("");
  const [route, setRoute] = useState("Local");
  const [caste, setCaste] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [selectedDocumentation, setSelectedDocumentation] = useState([]);
  const [cityVillage, setCityVillage] = useState("Gorakhpur");
  const [fathersOccupation, setFathersOccupation] = useState("");
  const [fathersQualification, setFathersQualification] = useState("");
  const [fathersDob, setFathersDob] = useState("");
  const [mothersOccupation, setMothersOccupation] = useState("");
  const [mothersQualification, setMothersQualification] = useState("");
  const [mothersDob, setMothersDob] = useState("");
  const [fathersNo, setFathersNo] = useState("");
  const [mothersNo, setMothersNo] = useState("");
  const [previousSchoolName, setPreviousSchoolName] = useState("");
  const [previousSchoolAffiliatedWith, setPreviousSchoolAffiliatedWith] =
    useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [lastExamGiven, setLastExamGiven] = useState("");
  const [lastExamYear, setLastExamYear] = useState("");
  const [lastExamMarks, setLastExamMarks] = useState("");
  const [lastExamResult, setLastExamResult] = useState("");
  const [nameOfLocalGuardian, setNameOfLocalGuardian] = useState("");
  const [addressOfLocalGuardian, setAddressOfLocalGuardian] = useState("");
  const [dob, setDob] = useState("");
  const [numberOfLocalGuardian, setNumberOfLocalGuardian] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");
  const [phoneForSchoolSMS, setPhoneForSchoolSMS] = useState("");
  const [transportFacility, setTransportFacility] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [feeCategory, setFeeCategory] = useState("");
  const [studentSection, setStudentSection] = useState("");
  const [studentAvatar, setStudentAvatar] = useState(null);
  const [fatherPhoto, setFatherPhoto] = useState(null);
  const [motherPhoto, setMotherPhoto] = useState(null);
  const [activeClass, setActiveClass] = useState("all");
  const [activeDivision, setActiveDivision] = useState("all");
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [formToggle, setFormToggle] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [updateUserData, setUpdateUserData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [allStudentData, setAllStudentData] = useState([]);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [isExcelUploading, setIsExcelUploading] = useState(false);

  const loadXLSXLib = () => {
    return new Promise((resolve, reject) => {
      if (window.XLSX) return resolve(window.XLSX);
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";
      script.onload = () => resolve(window.XLSX);
      script.onerror = () => reject(new Error("Failed to load Excel library"));
      document.body.appendChild(script);
    });
  };

  const handleExcelFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const XLSX = await loadXLSXLib();
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!data || data.length === 0) {
          toast.error("Excel sheet is empty!");
          return;
        }
        setExcelData(data);
        setExcelModalOpen(true);
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      toast.error("Error reading Excel file!");
    }
  };

  const handleConfirmExcelUpload = async () => {
    if (excelData.length === 0) return;
    try {
      setIsExcelUploading(true);
      const res = await axios.post("/api/student/bulk-upload", { students: excelData });
      if (res.data.success) {
        toast.success(res.data.message || "Students imported successfully!");
        setExcelModalOpen(false);
        setExcelData([]);
        fetchAllUser();
      } else {
        toast.error(res.data.message || "Failed to import students!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Bulk upload failed!");
    } finally {
      setIsExcelUploading(false);
    }
  };

  const downloadSampleTemplate = async () => {
    try {
      const XLSX = await loadXLSXLib();
      const sample = [
        {
          "Student Name": "Aarav Sharma",
          "Roll No": "1",
          "Class": "1",
          "Section": "A",
          "Admission No": "1001",
          "Father Name": "Rajesh Sharma",
          "Mother Name": "Sunita Sharma",
          "Contact Number": "9876543210",
          "Gender": "Male",
          "DOB": "2015-05-15",
          "Address": "Gorakhpur",
          "City": "Gorakhpur"
        },
        {
          "Student Name": "Ananya Gupta",
          "Roll No": "2",
          "Class": "1",
          "Section": "A",
          "Admission No": "1002",
          "Father Name": "Sanjay Gupta",
          "Mother Name": "Pooja Gupta",
          "Contact Number": "9876543211",
          "Gender": "Female",
          "DOB": "2015-08-20",
          "Address": "Gorakhpur",
          "City": "Gorakhpur"
        }
      ];
      const ws = XLSX.utils.json_to_sheet(sample);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students_Template");
      XLSX.writeFile(wb, "Student_Import_Template.xlsx");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download sample template");
    }
  };

  const tableRef = useRef(null);

  // ADD

  const addUser = () => {
    setBtnDisable(true);
    const missingFields = [];

    if (!name) missingFields.push("Name");
    if (!rollNumber) missingFields.push("Roll Number");

    if (missingFields.length > 0) {
      const missingFieldsMsg = `Please input all the following fields: ${missingFields.join(
        ", "
      )}`;
      toast.error(missingFieldsMsg);
      setIsSubmitting(false);
      setBtnDisable(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("admissionNo", admissionNo);
    formData.append("rollNumber", rollNumber);
    formData.append("house", house);
    formData.append("contactNumber", contactNumber);
    formData.append("aadhaar", aadhaar);
    formData.append("gender", gender);
    formData.append("religion", religion);
    formData.append("address", address);
    formData.append("address2", address2);
    formData.append("fathersName", fathersName);
    formData.append("mothersName", mothersName);
    formData.append("fathersOccupation", fathersOccupation);
    formData.append("mothersOccupation", mothersOccupation);
    formData.append("previousSchoolName", previousSchoolName);
    formData.append("registrationNumber", registrationNumber);
    formData.append("admissionDate", admissionDate);
    formData.append("dob", dob);
    formData.append("studentClass", studentClass);
    formData.append("studentSection", studentSection);
    formData.append("route", route);
    formData.append("caste", caste);
    formData.append("feeCategory", feeCategory);
    formData.append("bloodGroup", bloodGroup);
    formData.append(
      "selectedDocumentation",
      JSON.stringify(selectedDocumentation)
    );
    formData.append("cityVillage", cityVillage);
    formData.append("fathersQualification", fathersQualification);
    formData.append("fathersDob", fathersDob);
    formData.append("fathersNo", fathersNo);
    formData.append("mothersNo", mothersNo);
    formData.append("mothersQualification", mothersQualification);
    formData.append("mothersDob", mothersDob);
    formData.append("lastExamGiven", lastExamGiven);
    formData.append("lastExamYear", lastExamYear);
    formData.append("lastExamMarks", lastExamMarks);
    formData.append("lastExamResult", lastExamResult);
    formData.append("nameOfLocalGuardian", nameOfLocalGuardian);
    formData.append("addressOfLocalGuardian", addressOfLocalGuardian);
    formData.append("numberOfLocalGuardian", numberOfLocalGuardian);
    formData.append("phoneForSchoolSMS", phoneForSchoolSMS);
    formData.append("transportFacility", transportFacility);
    formData.append(
      "previousSchoolAffiliatedWith",
      previousSchoolAffiliatedWith
    );
    if (studentAvatar) {
      formData.append("studentAvatar", studentAvatar);
    }
    {
      updateUserData && updateUserData?.fatherPhoto?.secure_url
        ? ""
        : formData.append("fatherPhoto", fatherPhoto);
    }
    {
      updateUserData && updateUserData?.motherPhoto?.secure_url
        ? ""
        : formData.append("motherPhoto", motherPhoto);
    }
    try {
      {
        updateUserData
          ? axios
              .put(
                `${`/api/student/${
                  updateUserData._id
                }`}`,
                formData
              )
              .then((res) => {
                console.log(res);
                if (res.data.success) {
                  setBtnDisable(false);
                  toast.success("Student Updated Successfully !");
      setIsSubmitting(false);
                  setUpdateUserData(null);
                  setName("");
                  setRollNumber("");
                  setContactNumber("");
                  setAadhaar("");
                  setGender("");
                  setReligion("");
                  setHouse("");
                  setAddress("");
                  setAddress2("");
                  setFathersName("");
                  setMothersName("");
                  setFathersOccupation("");
                  setMothersOccupation("");
                  setPreviousSchoolName("");
                  setRegistrationNumber("");
                  setAdmissionDate("");
                  setDob("");
                  setStudentClass("");
                  setStudentSection("");
                  setRoute("");
                  setCaste("");
                  setFeeCategory("");
                  setBloodGroup("");
                  setSelectedDocumentation([]);
                  setCityVillage("");
                  setFathersQualification("");
                  setFathersDob("");
                  setMothersQualification("");
                  setMothersDob("");
                  setLastExamGiven("");
                  setLastExamYear("");
                  setLastExamResult("");
                  setNameOfLocalGuardian("");
                  setAddressOfLocalGuardian("");
                  setNumberOfLocalGuardian("");
                  setPhoneForSchoolSMS("");
                  setTransportFacility("");
                  setPreviousSchoolAffiliatedWith("");
                  setTimeout(() => {
                    fetchAllUser();
                  }, 400);
                }
              })
              .catch((error) => {
                console.log(error);
                toast.error(error.response.data.message);
      setIsSubmitting(false);
                setBtnDisable(false);
              })
              .finally(() => {
                setBtnDisable(false);
              })
          : axios
              .post(
                `${"/api/student/register"}`,
                formData
              )
              .then((res) => {
                console.log(res);
                if (res.data.success) {
                  setBtnDisable(false);
                  toast.success("Student Added Successfully !");
      setIsSubmitting(false);
                  setName("");
                  setRollNumber("");
                  setContactNumber("");
                  setAadhaar("");
                  setGender("");
                  setReligion("");
                  setAddress2("");
                  setAddress("");
                  setHouse("");
                  setFathersName("");
                  setMothersName("");
                  setFathersOccupation("");
                  setMothersOccupation("");
                  setPreviousSchoolName("");
                  setRegistrationNumber("");
                  setAdmissionDate("");
                  setDob("");
                  setStudentClass("");
                  setStudentSection("");
                  setRoute("Local");
                  setCaste("");
                  setFeeCategory("");
                  setBloodGroup("");
                  setSelectedDocumentation([]);
                  setCityVillage("Gorakhpur");
                  setFathersQualification("");
                  setFathersDob("");
                  setMothersQualification("");
                  setMothersDob("");
                  setLastExamGiven("");
                  setLastExamYear("");
                  setLastExamResult("");
                  setNameOfLocalGuardian("");
                  setAddressOfLocalGuardian("");
                  setNumberOfLocalGuardian("");
                  setPhoneForSchoolSMS("");
                  setTransportFacility("");
                  setFathersNo("");
                  setMothersNo("");
                  setAdmissionDate("");
                  setFeeCategory("");
                  setFatherPhoto(null);
                  setMotherPhoto(null);

                  setPreviousSchoolAffiliatedWith("");
                  setTimeout(() => {
                    fetchAllUser();
                  }, 400);
                }
              })
              .catch((error) => {
                console.log(error);
                toast.error(error.response.data.message);
      setIsSubmitting(false);
                setBtnDisable(false);
              })
              .finally(() => {
                setBtnDisable(false);
              });
      }
    } catch (error) {
      console.log(error);
      setBtnDisable(false);
    }
  };

  // LIST

  const fetchAllUser = () => {
    setLoading(true);
    if (activeClass?.toLowerCase() === "all") {
      setActiveDivision("All");
    }
    try {
      axios
        .get(
          `/api/student/filter?studentClass=${encodeURIComponent(activeClass)}&studentSection=${encodeURIComponent(activeDivision)}&page=${currentPage}`
        )
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            setLoading(false);
            const filteredData = (res.data.data || []).filter(
              (student) => !student.isDeleted
            );
            const sortedData = filteredData.sort((a, b) => {
              const rollA = parseInt(String(a.rollNumber || "").replace(/\D/g, ""), 10) || 0;
              const rollB = parseInt(String(b.rollNumber || "").replace(/\D/g, ""), 10) || 0;
              if (rollA !== rollB) return rollA - rollB;

              const admA = parseInt(String(a.admissionNo || "").replace(/\D/g, ""), 10) || 0;
              const admB = parseInt(String(b.admissionNo || "").replace(/\D/g, ""), 10) || 0;
              if (admA !== admB) return admA - admB;

              return (a.name || "").localeCompare(b.name || "");
            });
            setUserData(sortedData);
            setTotalPages(res.data.count || 0);
          }
        })
        .catch((error) => {
          console.log(error);
          setIsSubmitting(false);
          setUserData([]);
          setLoading(false);
          setTotalPages(0);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
      setUserData([]);
      setLoading(false);
      setTotalPages(0);
    }
  };
  const getLastRoll = () => {
    setLoading(true);

    try {
      axios
        .get(
          `${
            ""
          }/api/student/last-roll?selectedClass=${studentClass}&section=${studentSection}`
        )
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            setLoading(false);
            setRollNumber(res.data.data ? parseFloat(res.data.data) + 1 : 1);
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
    }
  };
  const getLastAdmissionNo = () => {
    setLoading(true);

    try {
      axios
        .get(`/api/student/next-admission-number`)
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            setLoading(false);
            setAdmissionNo(res.data.data);
          }
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const assignRollNumbersAlphabetically = async () => {
    if (!activeClass || !activeDivision) {
      toast.error("Please select class and section first");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.get(
        `${
          ""
        }/api/student/arrange-alphabetically?studentClass=${activeClass}&studentSection=${activeDivision}`
      );
      if (response.data.success) {
        toast.success("Roll numbers assigned alphabetically!");
      setIsSubmitting(false);
        fetchAllUser();
      }
    } catch (error) {
      toast.error("Failed to assign roll numbers");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (formToggle && !updateUserData) {
      getLastAdmissionNo();
      getLastRoll();
    }
    fetchAllUser();
  }, [activeClass, activeDivision, studentClass, studentSection, currentPage, formToggle]);

  useEffect(() => {
    if (updateUserData) {
      setName(updateUserData.name);
      setAdmissionNo(updateUserData.admissionNo);
      setRollNumber(updateUserData.rollNumber);
      setContactNumber(updateUserData.contactNumber);
      setAadhaar(updateUserData.aadhaar);
      setGender(updateUserData.gender);
      setHouse(updateUserData.house);
      setReligion(updateUserData.religion);
      setAddress(updateUserData.address);
      setAddress2(updateUserData.address2);
      setFathersName(updateUserData.fathersName);
      setMothersName(updateUserData.mothersName);
      setFathersOccupation(updateUserData.fathersOccupation);
      setMothersOccupation(updateUserData.mothersOccupation);
      setPreviousSchoolName(updateUserData.previousSchoolName);
      setRegistrationNumber(updateUserData.registrationNumber);
      setDob(updateUserData.dob);
      setAdmissionDate(updateUserData.admissionDate);
      setStudentClass(updateUserData.studentClass);
      setStudentSection(updateUserData.studentSection);
      setRoute(updateUserData.route);
      setCaste(updateUserData.caste);
      setFeeCategory(updateUserData.feeCategory);
      setBloodGroup(updateUserData.bloodGroup);
      setSelectedDocumentation(
        updateUserData.selectedDocumentation
          ? JSON.parse(updateUserData.selectedDocumentation)
          : []
      );
      setCityVillage(updateUserData.cityVillage);
      setFathersQualification(updateUserData.fathersQualification);
      setFathersDob(updateUserData.fathersDob);
      setMothersQualification(updateUserData.mothersQualification);
      setMothersDob(updateUserData.mothersDob);
      setLastExamGiven(updateUserData.lastExamGiven);
      setLastExamMarks(updateUserData.lastExamMarks);
      setLastExamYear(updateUserData.lastExamYear);
      setLastExamResult(updateUserData.lastExamResult);
      setNameOfLocalGuardian(updateUserData.nameOfLocalGuardian);
      setAddressOfLocalGuardian(updateUserData.addressOfLocalGuardian);
      setNumberOfLocalGuardian(updateUserData.numberOfLocalGuardian);
      setPhoneForSchoolSMS(updateUserData.phoneForSchoolSMS);
      setTransportFacility(updateUserData.transportFacility);
      setPreviousSchoolAffiliatedWith(
        updateUserData.previousSchoolAffiliatedWith
      );
      setStudentAvatarUpdate(updateUserData?.studentAvatar?.secure_url);
      setFatherPhotoUpdate(updateUserData?.fatherPhoto?.secure_url);
      setMotherPhotoUpdate(updateUserData?.motherPhoto?.secure_url);
    }
  }, [updateUserData]);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Adjust this value to change the number of visible pages
    const maxPage = Math.ceil(totalPages / 15);

    for (let i = 1; i <= maxPage; i++) {
      pageNumbers.push(i);
    }

    let startPage;
    let endPage;

    if (maxPage <= maxPagesToShow) {
      startPage = 1;
      endPage = maxPage;
    } else {
      if (currentPage <= maxPagesToShow - 2) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + 1 >= maxPage) {
        startPage = maxPage - maxPagesToShow + 1;
        endPage = maxPage;
      } else {
        startPage = currentPage - 2; // Adjust the number of pages to show before and after the current page
        endPage = currentPage + 2; // Adjust the number of pages to show before and after the current page
      }
    }

    const visiblePages = pageNumbers.slice(startPage - 1, endPage);
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === maxPage;

    const fetchAllStudentData = async () => {
      try {
        const response = await axios.get(
          `${
            ""
          }/api/student/filter?studentClass=${activeClass}&studentSection=${activeDivision}&all=true`
        );
        if (response.data.success) {
          setAllStudentData(response.data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      fetchAllStudentData();
    }, [activeClass, activeDivision]);

    return (
      <nav className="mt-12 flex justify-center">
        <ul className="join ">
          <li className="page-item">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`px-4 py-2 cursor-pointer rounded-md  mx-1 ${
                isFirstPage ? "disabled" : ""
              }`}
              disabled={isFirstPage}
            >
              Previous
            </button>
          </li>
          {visiblePages?.map((number) => (
            <li key={number} className="page-item">
              <button
                onClick={() => handlePageChange(number)}
                className={`${
                  currentPage === number ? "bg-gray-400 text-white" : ""
                } px-4 py-2 mx-1 rounded-md`}
              >
                {number}
              </button>
            </li>
          ))}
          <li className="page-item">
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`px-4 py-2 cursor-pointer mx-1 bg-black rounded-md text-white ${
                isLastPage ? "disabled" : ""
              }`}
              disabled={isLastPage}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      axios
        .delete(`/api/student/${id}`)
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            fetchAllUser();
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.message);
      setIsSubmitting(false);
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleDeleteModal = (product) => {
    // Find the product to delete based on productId
    console.log(product);
    // Set the product to delete and open the modal
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // Call your delete function here with productToDelete
    // ...
    if (productToDelete == "delete-all") {
      handleDelete("delete-all");
    }
    handleDelete(productToDelete._id);
    // Close the modal
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    // Close the modal without deleting
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      // Convert blob to File
      const file = new File([blob], `avatar-${uuidv4()}.jpg`, {
        type: "image/jpeg",
      });
      // Now you can upload 'file' to Cloudinary
      setStudentAvatar(file);
    }, "image/jpeg");
  };
  function dataURLtoFile(dataUrl, filename) {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    // Use the imageSrc (base64) to create a file
    const file = dataURLtoFile(imageSrc, "avatar.png");
    // Now you can use the 'file' object for further processing or upload
    console.log(file);
    setStudentAvatar(file);
  }, [webcamRef]);
  const capture2 = useCallback(() => {
    const imageSrc = webcamRef2.current.getScreenshot();
    // Use the imageSrc (base64) to create a file
    const file = dataURLtoFile(imageSrc, "avatar.png");
    // Now you can use the 'file' object for further processing or upload
    console.log(file);
    setFatherPhoto(file);
  }, [webcamRef2]);
  const capture3 = useCallback(() => {
    const imageSrc = webcamRef3.current.getScreenshot();
    // Use the imageSrc (base64) to create a file
    const file = dataURLtoFile(imageSrc, "avatar.png");
    // Now you can use the 'file' object for further processing or upload
    console.log(file);
    setMotherPhoto(file);
  }, [webcamRef3]);
  const handleImage = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      setStudentAvatar(file);
    } else {
      toast.error("Something Went Wrong !");
      setIsSubmitting(false);
    }
  };

  const handleImageFather = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      setFatherPhoto(file);
    } else {
      toast.error("Something Went Wrong !");
      setIsSubmitting(false);
    }
  };
  const handleToggleStatus = (id, currentStatus) => {
    // Toggle the status from true to false or false to true
    const updatedStatus = !currentStatus;

    // Optimistic UI update - update the status immediately in the UI
    setUserData((prevData) =>
      prevData.map((user) =>
        user._id === id ? { ...user, isActive: updatedStatus } : user
      )
    );

    // Send API request to update status in backend
    axios
      .put(`/api/student/status/${id}`, {
        isActive: updatedStatus, // Boolean status value
      })
      .then((res) => {
        if (res.data) {
          console.log("Status updated successfully:", res.data); // Log the successful response
          toast.success("Status updated successfully");
      setIsSubmitting(false);
        }
      })
      .catch((error) => {
        console.log("Error updating status:", error); // Log the error response
        toast.error("Failed to update status");
      setIsSubmitting(false);
        // Revert the status change if the update failed
        setUserData((prevData) =>
          prevData.map((user) =>
            user._id === id ? { ...user, isActive: currentStatus } : user
          )
        );
      });
  };
  const handleImageMother = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      setMotherPhoto(file);
    } else {
      toast.error("Something Went Wrong !");
      setIsSubmitting(false);
    }
  };

  const deleteStudent = async (studentId) => {
    try {
      setBtnDisable(true);
      const response = await setIsSubmitting(true);
      await axios.put(
        `/api/student/${studentId}`,
        { isDeleted: true }
      );

      if (response.data.success) {
        toast.success("Student deleted successfully");
      setIsSubmitting(false);
        fetchAllUser();
      } else {
        toast.error("Failed to delete student");
      setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(error.response?.data?.message || "Error deleting student");
      setIsSubmitting(false);
    } finally {
      setBtnDisable(false);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteClick = (student) => {
    setProductToDelete(student);
    setDeleteModalOpen(true);
  };

  const handleSearch = (query = searchQuery) => {
    if (query != "") {
      try {
        axios
          .get(
            `/api/student/search?q=${query}`
          )
          .then((res) => {
            console.log(res);
            if (res.data.success) {
              setLoading(false);
              setUserData(res.data.data);
              setTotalPages(res.data.count);
            }
          })
          .catch((error) => {
            console.log(error);
            toast.error(error.response.data.message);
      setIsSubmitting(false);
            setUserData(null);
            setLoading(false);
            setTotalPages(1);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        console.log(error);
        setUserData(null);
        setLoading(false);
        setTotalPages(1);
      }
    } else {
      fetchAllUser();
    }
  };

  const debouncedSearch = debounce(handleSearch, 300);

  const handleChange = (e) => {
    const { value } = e.target;
    setSearchQuery(value);

    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      if (value.trim() !== "") {
        handleSearch(value);
      } else {
        fetchAllUser();
      }
    }, 1200);
  };

  function generateWhatsAppMessage() {
    const dataToUse = searchQuery
      ? allStudentData.filter(
          (student) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.rollNumber.toString().includes(searchQuery)
        )
      : allStudentData;

    const message = `Student List - Total: ${
      dataToUse?.length || 0
    } students\n`;
    const studentList = dataToUse
      ?.map(
        (student) =>
          `${student.name} - Class: ${student.studentClass}-${student.studentSection} - Roll: ${student.rollNumber}`
      )
      .join("\n");
    return `${message}${studentList}`;
  }

  // useEffect(() => {
  //   handleSearch(searchQuery);
  // }, [searchQuery]);

  return (
    <>
      {/* <Toaster draggable={true} /> */}
      <div className="px-4 py-6 flex justify-between items-center flex-wrap gap-4 bg-gray-50/50 rounded-xl mb-4 border">
        <div className="flex items-center gap-3">
          <label htmlFor="excel-upload" className="btn btn-success text-white btn-sm gap-2 cursor-pointer shadow-sm">
            <RiFileExcel2Fill className="text-lg" />
            Upload Excel Sheet
          </label>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={handleExcelFileSelect}
          />

          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="btn btn-outline btn-sm gap-2 text-xs"
            title="Download Excel Template Format"
          >
            📥 Download Excel Format
          </button>
        </div>

        <div className="flex items-center">
          <label htmlFor="checkbox" className="mr-4 font-semibold">
            Show Form
          </label>
          <input
            type="checkbox"
            className="toggle"
            checked={formToggle}
            onChange={() => setFormToggle(!formToggle)}
          />
        </div>
      </div>
      {formToggle && (
        <>
          {" "}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Admission No</span>
              </label>
              <input
                onChange={(e) => setAdmissionNo(e.target.value)}
                className="input input-bordered"
                type="text"
                placeholder="Admission No"
                value={admissionNo}
              />
            </div>
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Admission Date</span>
              </label>
              <input
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="input input-bordered"
                type="date"
                value={admissionDate}
                placeholder="Admission Date"
              />
            </div> */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Student Name</span>
              </label>
              <input
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered"
                type="text"
                placeholder="Student Name"
                value={name}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Father's Name</span>
              </label>
              <input
                onChange={(e) => setFathersName(e.target.value)}
                className="input input-bordered"
                type="text"
                value={fathersName}
                placeholder="Father's Name"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mother's Name</span>
              </label>
              <input
                onChange={(e) => setMothersName(e.target.value)}
                className="input input-bordered"
                type="text"
                value={mothersName}
                placeholder="Mother's Name"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Class</span>
              </label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="select select-bordered border-gray-300"
              >
                <option value="" selected disabled>
                  Select Class
                </option>
                <option value="L.K.G">L.K.G</option>
                <option value="U.K.G">U.K.G</option>
                <option value="Nursery">Nursery</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
              </select>
              {/* <input
            onChange={(e) => setStudentClass(e.target.value)}
            className="input input-bordered"
            type="text"
            value={studentClass}
            placeholder="Class"
          /> */}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Section</span>
              </label>
              <select
                value={studentSection}
                onChange={(e) => setStudentSection(e.target.value)}
                className="select select-bordered border-gray-300"
              >
                <option value="" selected disabled>
                  Select Section
                </option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
              {/* <input
            onChange={(e) => setStudentDivision(e.target.value)}
            className="input input-bordered"
            type="text"
            value={studentDivision}
            placeholder="Division"
          /> */}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Roll Number</span>
              </label>
              <input
                onChange={(e) => setRollNumber(e.target.value)}
                className="input input-bordered"
                type="number"
                placeholder="Role Number"
                value={rollNumber}
              />
            </div>
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">House</span>
              </label>
              <select
                onChange={(e) => setHouse(e.target.value)}
                className="select select-bordered border-gray-300"
              >
                <option value="" selected disabled>
                  Select House
                </option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
                <option value="Yellow">Yellow</option>
              </select>
            </div> */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Address</span>
              </label>
              <input
                onChange={(e) => setAddress(e.target.value)}
                className="input input-bordered"
                type="text"
                value={address}
                placeholder="Address"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Contact Number</span>
              </label>
              <input
                onChange={(e) => setContactNumber(e.target.value)}
                className="input input-bordered"
                type="text"
                value={contactNumber}
                placeholder="Contact Number"
              />
            </div>
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Address 2</span>
              </label>
              <input
                onChange={(e) => setAddress2(e.target.value)}
                className="input input-bordered"
                type="text"
                value={address2}
                placeholder="Address 2"
              />
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">City/Village</span>
              </label>
              <input
                onChange={(e) => setCityVillage(e.target.value)}
                className="input input-bordered"
                type="text"
                value={cityVillage}
                placeholder="City/Village"
              />
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Route</span>
              </label>
              <input
                onChange={(e) => setRoute(e.target.value)}
                className="input input-bordered"
                type="text"
                value={route}
                placeholder="Route"
              />
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                onChange={(e) => setContactNumber(e.target.value)}
                className="input input-bordered"
                type="text"
                placeholder="Phone Number"
                value={contactNumber}
              />
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Father's Number</span>
              </label>
              <input
                onChange={(e) => setFathersNo(e.target.value)}
                className="input input-bordered"
                type="text"
                placeholder="Father's Number"
                value={fathersNo}
              />
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Mother's Number</span>
              </label>
              <input
                onChange={(e) => setMothersNo(e.target.value)}
                className="input input-bordered"
                type="text"
                placeholder="Mother's Number"
                value={mothersNo}
              />
            </div> */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Gender</span>
              </label>
              <select
                onChange={(e) => setGender(e.target.value)}
                value={gender}
                className="select select-bordered border-gray-300"
              >
                <option value="" selected disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Aadhaar Number</span>
              </label>
              <input
                onChange={(e) => setAadhaar(e.target.value)}
                className="input input-bordered"
                type="text"
                value={aadhaar}
                placeholder="Aadhaar Number"
              />
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Date Of Birth</span>
              </label>
              <input
                onChange={(e) => setDob(e.target.value)}
                className="input input-bordered"
                type="date"
                value={dob}
                placeholder="DOB"
              />
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Blood Group</span>
              </label>
              <input
                onChange={(e) => setBloodGroup(e.target.value)}
                className="input input-bordered"
                type="text"
                value={bloodGroup}
                placeholder="Blood Group"
              />
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Religion</span>
              </label>
              <input
                onChange={(e) => setReligion(e.target.value)}
                className="input input-bordered"
                type="text"
                value={religion}
                placeholder="Religion"
              />
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Caste</span>
              </label>
              <select
                onChange={(e) => setCaste(e.target.value)}
                value={caste}
                className="select select-bordered border-gray-300"
              >
                <option value="" disabled selected>
                  Select Caste
                </option>
                <option value="OBC">OBC</option>
                <option value="ST">ST</option>
                <option value="SC">SC</option>
                <option value="General">General</option>
              </select>
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select
                onChange={(e) => setFeeCategory(e.target.value)}
                value={feeCategory}
                className="select select-bordered border-gray-300"
              >
                <option value="" disabled selected>
                  Select Fee Category
                </option>
                <option value="Fee Conn">Fee Conn</option>
                <option value="New">New</option>
                <option value="Old">Old</option>
                <option value="RTE">RTE</option>
              </select>
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Father's Occupation</span>
              </label>
              <input
                onChange={(e) => setFathersOccupation(e.target.value)}
                className="input input-bordered"
                type="text"
                value={fathersOccupation}
                placeholder="Father's Occupation"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Father's Qualification</span>
              </label>
              <input
                onChange={(e) => setFathersQualification(e.target.value)}
                className="input input-bordered"
                type="text"
                value={fathersQualification}
                placeholder="Father's Qualification"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Father's DOB</span>
              </label>
              <input
                onChange={(e) => setFathersDob(e.target.value)}
                className="input input-bordered"
                type="date"
                value={fathersDob}
                placeholder="Father's DOB"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mother's Occupation</span>
              </label>
              <input
                onChange={(e) => setMothersOccupation(e.target.value)}
                className="input input-bordered"
                type="text"
                value={mothersOccupation}
                placeholder="Mother's Name"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mother's Qualification</span>
              </label>
              <input
                onChange={(e) => setMothersQualification(e.target.value)}
                className="input input-bordered"
                type="text"
                value={mothersQualification}
                placeholder="Mother's Qualification"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mother's DOB</span>
              </label>
              <input
                onChange={(e) => setMothersDob(e.target.value)}
                className="input input-bordered"
                type="date"
                value={mothersDob}
                placeholder="Mother's DOB"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Previous School Name</span>
              </label>
              <input
                onChange={(e) => setPreviousSchoolName(e.target.value)}
                className="input input-bordered"
                type="text"
                value={previousSchoolName}
                placeholder="Previous School Name"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Previous School Affiliated With
                </span>
              </label>
              <input
                onChange={(e) =>
                  setPreviousSchoolAffiliatedWith(e.target.value)
                }
                className="input input-bordered"
                type="text"
                value={previousSchoolAffiliatedWith}
                placeholder="Previous School Affiliated With"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Exam Given</span>
              </label>
              <input
                onChange={(e) => setLastExamGiven(e.target.value)}
                className="input input-bordered"
                type="text"
                value={lastExamGiven}
                placeholder="Last Exam Given"
              />
            </div> */}
            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Last Exam Year</span>
              </label>
              <input
                onChange={(e) => setLastExamYear(e.target.value)}
                className="input input-bordered"
                type="text"
                value={lastExamYear}
                placeholder="Last Exam Year"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Exam Marks</span>
              </label>
              <input
                onChange={(e) => setLastExamMarks(e.target.value)}
                className="input input-bordered"
                type="text"
                value={lastExamMarks}
                placeholder="Last Exam Marks"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Exam Result</span>
              </label>
              <input
                onChange={(e) => setLastExamResult(e.target.value)}
                className="input input-bordered"
                type="text"
                value={lastExamResult}
                placeholder="Last Exam Result"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Registration Number</span>
              </label>
              <input
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="input input-bordered"
                type="text"
                value={registrationNumber}
                placeholder="Registration Number"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Name Of Local Guardian (if any)
                </span>
              </label>
              <input
                onChange={(e) => setNameOfLocalGuardian(e.target.value)}
                className="input input-bordered"
                type="text"
                value={nameOfLocalGuardian}
                placeholder="Name Of Local Guardian"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Address Of Local Guardian (if any)
                </span>
              </label>
              <input
                onChange={(e) => setAddressOfLocalGuardian(e.target.value)}
                className="input input-bordered"
                type="text"
                value={addressOfLocalGuardian}
                placeholder="Address Of Local Guardian"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Number Of Local Guardian (if any)
                </span>
              </label>
              <input
                onChange={(e) => setNumberOfLocalGuardian(e.target.value)}
                className="input input-bordered"
                type="text"
                value={numberOfLocalGuardian}
                placeholder="Number Of Local Guardian"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number for School SMS</span>
              </label>
              <input
                onChange={(e) => setPhoneForSchoolSMS(e.target.value)}
                className="input input-bordered"
                type="text"
                value={phoneForSchoolSMS}
                placeholder="Phone Number for School SMS"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Transport Facility ?</span>
              </label>
              <select
                onChange={(e) => setTransportFacility(e.target.value)}
                value={transportFacility}
                className="select select-bordered border-gray-300"
              >
                <option value="" selected disabled>
                  Select
                </option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  Documentation at the time of Admission
                </span>
              </label>
              <MultiSelect
                className="rounded-md p-1"
                options={optionsTransport}
                value={selectedDocumentation}
                onChange={setSelectedDocumentation}
                labelledBy="Select Documentation at the time of Admission"
              />
            </div> */}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Student Avatar</span>
              </label>
              <input
                className="input input-bordered"
                type="file"
                accept="image/*"
                onChange={handleImage}
              />
              {showWebcam1 && (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/png"
                />
              )}
              <button
                className="btn btn-warning btn-md text-white"
                onClick={() => setShowWebcam1(!showWebcam1)}
              >
                Toggle Cam
              </button>
              <button
                className="btn btn-success btn-md text-white"
                onClick={capture}
              >
                Capture
              </button>
              {studentAvatar && (
                <div className="relative">
                  <span
                    onClick={() => setStudentAvatar(null)}
                    className="badge badge-error text-white absolute"
                  >
                    x
                  </span>
                  <img src={URL.createObjectURL(studentAvatar)?.src || URL.createObjectURL(studentAvatar)} alt="Avatar" />
                </div>
              )}
            </div>

            {/* <div className="form-control">
              <label className="label">
                <span className="label-text">Father Photo</span>
              </label>
              <input
                className="input input-bordered"
                type="file"
                accept="image/*"
                onChange={handleImageFather}
              />
              {showWebcam2 && (
                <Webcam
                  audio={false}
                  ref={webcamRef2}
                  screenshotFormat="image/png"
                />
              )}
              <button
                className="btn btn-warning btn-md text-white"
                onClick={() => setShowWebcam2(!showWebcam2)}
              >
                Toggle Cam
              </button>
              <button
                className="btn btn-success btn-md text-white"
                onClick={capture2}
              >
                Capture
              </button>
              {fatherPhoto && (
                <div className="relative">
                  <span
                    onClick={() => setFatherPhoto(null)}
                    className="badge badge-error text-white absolute"
                  >
                    x
                  </span>
                  <img src={URL.createObjectURL(fatherPhoto)?.src || URL.createObjectURL(fatherPhoto)} alt="Avatar" />
                </div>
              )}
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mother Photo</span>
              </label>
              <input
                className="input input-bordered"
                type="file"
                accept="image/*"
                onChange={handleImageMother}
              />

              {showWebcam3 && (
                <Webcam
                  audio={false}
                  ref={webcamRef3}
                  screenshotFormat="image/png"
                />
              )}
              <button
                className="btn btn-warning btn-md text-white"
                onClick={() => setShowWebcam3(!showWebcam3)}
              >
                Toggle Cam
              </button>
              <button
                className="btn btn-success btn-md text-white"
                onClick={capture3}
              >
                Capture
              </button>
              {motherPhoto && (
                <div className="relative">
                  <span
                    onClick={() => setMotherPhoto(null)}
                    className="badge badge-error text-white absolute"
                  >
                    x
                  </span>
                  <img src={URL.createObjectURL(motherPhoto)?.src || URL.createObjectURL(motherPhoto)} alt="Avatar" />
                </div>
              )}
            </div> */}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              disabled={btnDisable}
              className="btn btn-neutral items-center"
              onClick={() => addUser()}
            >
              {updateUserData ? `Update ${updateUserData.name}` : "Add User"}
            </button>
          </div>
          {/* <button onClick={handlePrint} className="btn text-white btn-warning">
            Print
          </button> */}
          {/* FORM UI */}
          {/* <div
            ref={componentRef}
            className="w-full max-w-6xl flex flex-col m-auto justify-center px-4"
          >
            <section className=" z-10 mt-16 mb-16 relative  p-2">
              <svg
                className="absolute -z-10"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
              >
                <path
                  fill="#0099ff"
                  fillOpacity="1"
                  d="M0,32L80,64C160,96,320,160,480,192C640,224,800,224,960,224C1120,224,1280,224,1360,224L1440,224L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
                ></path>
              </svg>
              <div className="flex items-center p-3  z-10 w-full">
                <div>
                  <img src={logo?.src || logo} alt="logo" width="170" className="ml-6" />
                </div>
                <div>
                  <div>
                    <p
                      className="text-5xl text-center ml-4 text-white"
                      style={{ letterSpacing: "3px" }}
                    >
                      DUST TO CROWN PUBLIC SENIOR SECONDARY SCHOOL
                    </p>
                  </div>
                  <div className="flex flex-col justify-center m-auto text-center text-white">
                    <p className="underline">
                      Deoria Road Near Gurung Chowk (Kalimandir)
                    </p>
                    <p className="underline">
                      Kunraghat Gorakhpur, Uttar Pradesh, India 273008
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <p className="text-xl font-semibold  z-10 text-red-500 mt-6">
                    ADMISSION FORM
                  </p>
                  <p className="text-lg font-semibold text-amber-700">
                    Affiliated to CBSE New Delhi U-DICE Code: 09580202107
                  </p>
                  <div className="flex items-center  z-10 justify-between font-semibold mt-6">
                    <p>Phone 88876738323</p>
                    <p>S.No.</p>
                    <p>Form No.</p>
                    <p>SESSION 2023-2024</p>
                  </div>
                </div>
                <div></div>
              </div>
            </section>

            <section>
              <p className="text-center font-semibold  text-xl">
                Basic Details
              </p>
              <hr className="mt-6" />
              <div className="grid grid-cols-4 mt-6 gap-6">
                <div className="col-span-3">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="">Admission No :</p>
                      <p className="border-solid border-b-2 border-black w-full">
                        {admissionNo}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <p className="">Date Of Admission :</p>
                      <p className=" border-solid border-b-2 border-black w-full">
                        {admissionDate}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10 mt-8">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="">Student Name :</p>
                      <p className="border-solid border-b-2 border-black  w-[330%]">
                        {name}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <p className="">Father's Name :</p>
                      <p className="border-solid border-b-2 border-black  w-[330%]">
                        {fathersName}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-10 mt-8">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="">Mother's Name :</p>
                      <p className="border-solid border-b-2 border-black  w-[330%]">
                        {mothersName}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <p className="">Date Of Admission :</p>
                      <p className=" border-solid border-b-2 border-black w-full">
                        28/02/2024
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-10 mt-8">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="">Class :</p>
                      <p className="border-solid border-b-2 border-black w-full">
                        {studentClass}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="">Section :</p>
                      <p className="border-solid border-b-2 border-black w-full">
                        {studentSection}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="">Roll No :</p>
                      <p className="border-solid border-b-2 border-black w-full">
                        {rollNumber}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <img
                    src={
                      studentAvatar
                        ? URL.createObjectURL(studentAvatar)
                        : studentAvatarUpdate
                    ?.src || 
                      studentAvatar
                        ? URL.createObjectURL(studentAvatar)
                        : studentAvatarUpdate
                    }
                  />
                </div>
              </div>
            </section>

            <section className="mt-16 mb-16">
              <p className="text-center  font-semibold text-xl">
                Contact Information
              </p>
              <hr className="mt-6" />

              <div className="grid grid-cols-2 gap-10 mt-8">
                <div className="grid grid-cols-2 gap-2">
                  <p className="">Address :</p>
                  <p className="border-solid border-b-2 border-black  w-[330%]">
                    {address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-70/30 gap-10 mt-8">
                <div className="grid grid-cols-35/65 gap-2">
                  <p className="">City/Village :</p>
                  <p className="border-solid border-b-2 border-black w-full">
                    {cityVillage}
                  </p>
                </div>

                <div className="grid grid-cols-35/65 ">
                  <p className="">Route :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    {route}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-10 mt-8">
                <div className="grid grid-cols-2 gap-2">
                  <p className="">Phone No :</p>
                  <p className="border-solid border-b-2 border-black w-full">
                    {contactNumber}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <p className="">Father's No :</p>
                  <p className="border-solid border-b-2 border-black w-full">
                    {fathersNo}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <p className="">Mother's No :</p>
                  <p className="border-solid border-b-2 border-black w-full">
                    {mothersNo}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-16 mb-16">
              <p className="text-center  font-semibold text-xl">
                Personal Details
              </p>
              <hr className="mt-6" />

              <div className="flex items-center gap-16 mt-8">
                <p className="flex items-center gap-4 font-semibold">
                  <MdArrowRightAlt /> Gender
                </p>
                <div className="flex items-center gap-8">
                  <div className="form-control gap-4">
                    <label className="cursor-pointer label">
                      <span className="label-text">Male</span>
                      <input
                        type="checkbox"
                        checked={gender == "Male"}
                        disabled
                        className="checkbox checkbox-secondary ml-3"
                      />
                    </label>
                  </div>
                  <div className="form-control gap-4">
                    <label className="cursor-pointer label">
                      <span className="label-text">Female</span>
                      <input
                        type="checkbox"
                        checked={gender == "Female"}
                        className="checkbox checkbox-secondary ml-3"
                        disabled
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-35/65 gap-10 mt-8">
                <div className="grid grid-cols-2 gap-8">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Aadhar Number
                  </p>
                  <p className="border-solid border-b-2 border-black  w-[330%]">
                    {aadhaar}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-35/65 gap-10 mt-8">
                <div className="grid grid-cols-2 gap-8">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Date Of Birth
                  </p>
                  <p className="border-solid border-b-2 border-black  w-[330%]">
                    {dob}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-35/65 gap-10 mt-8">
                <div className="grid grid-cols-2 gap-8">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Blood Group
                  </p>
                  <p className="border-solid border-b-2 border-black  w-[330%]">
                    {bloodGroup}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-35/65 gap-10 mt-8">
                <div className="grid grid-cols-2 gap-8">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Caste/Religion
                  </p>
                  <p className="border-solid border-b-2 border-black  w-[330%]">
                    {religion}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-16 mt-8">
                <p className="flex items-center gap-4 font-semibold">
                  <MdArrowRightAlt /> Gender
                </p>
                <div className="flex items-center gap-16">
                  <div className="form-control gap-4">
                    <label className="cursor-pointer label">
                      <span className="label-text">OBC</span>
                      <input
                        type="checkbox"
                        checked={caste == "OBC"}
                        disabled
                        className="checkbox checkbox-secondary ml-3"
                      />
                    </label>
                  </div>
                  <div className="form-control gap-4">
                    <label className="cursor-pointer label">
                      <span className="label-text">SC</span>
                      <input
                        type="checkbox"
                        checked={caste == "SC"}
                        className="checkbox checkbox-secondary ml-3"
                        disabled
                      />
                    </label>
                  </div>
                  <div className="form-control gap-4">
                    <label className="cursor-pointer label">
                      <span className="label-text">ST</span>
                      <input
                        type="checkbox"
                        checked={caste == "ST"}
                        className="checkbox checkbox-secondary ml-3"
                        disabled
                      />
                    </label>
                  </div>
                  <div className="form-control gap-4">
                    <label className="cursor-pointer label">
                      <span className="label-text">GENERAL</span>
                      <input
                        type="checkbox"
                        checked={caste == "General"}
                        className="checkbox checkbox-secondary ml-3"
                        disabled
                      />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-16 mb-16">
              <p className="text-center font-semibold text-xl">
                Parent Details
              </p>
              <hr className="mt-6" />

              <div className="mt-16">
                <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"></th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider bg-orange-200">
                        Qualification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider bg-orange-200">
                        Occupation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider bg-orange-200">
                        Date Of Birth
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Father</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {fathersQualification}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {fathersOccupation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {fathersDob}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">Mother</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mothersQualification}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mothersOccupation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {mothersDob}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-16 flex justify-center gap-16">
                <div>
                  <img
                    width={200}
                    src={
                      fatherPhoto
                        ? URL.createObjectURL(fatherPhoto)
                        : fatherPhotoUpdate
                    ?.src || 
                      fatherPhoto
                        ? URL.createObjectURL(fatherPhoto)
                        : fatherPhotoUpdate
                    }
                  />
                  <p className="text-center">Father</p>
                </div>
                <div>
                  <img
                    width={200}
                    src={
                      motherPhoto
                        ? URL.createObjectURL(motherPhoto)
                        : motherPhotoUpdate
                    ?.src || 
                      motherPhoto
                        ? URL.createObjectURL(motherPhoto)
                        : motherPhotoUpdate
                    }
                  />
                  <p className="text-center">Mother</p>
                </div>
              </div>
            </section>

            <section className="mt-16 mb-16">
              <p className="text-center font-semibold text-xl">
                Last School Details
              </p>
              <hr className="mt-6" />

              <div className="grid grid-cols-70/30 gap-10 mt-8">
                <div className="grid grid-cols-2 ">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Name Of School (Last Attended)
                  </p>
                  <p className="border-solid border-b-2 border-black  w-[180%]">
                    {previousSchoolName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-35/65 gap-10 mt-8">
                <div className="grid grid-cols-2 gap-8">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Affiliated With :
                  </p>
                  <p className="border-solid border-b-2 border-black  w-[330%]">
                    {previousSchoolAffiliatedWith}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>

              <div className="mt-16">
                <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider bg-green-300">
                        Last Exam Given
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider bg-green-300">
                        Year
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider bg-green-300">
                        Marks Obtained
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider bg-green-300">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lastExamGiven}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lastExamYear}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lastExamMarks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lastExamResult}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-70/30 gap-10 mt-8">
                <div className="grid grid-cols-2 ">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Name Of Local Guardian (If any)
                  </p>
                  <p className="border-solid border-b-2 border-black  w-[180%]">
                    {nameOfLocalGuardian}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-70/30 gap-10 mt-8">
                <div className="grid grid-cols-2 ">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Address Of Local Guardian (If any)
                  </p>
                  <p className="border-solid border-b-2 border-black  w-[180%]">
                    {addressOfLocalGuardian}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-70/30 gap-10 mt-8">
                <div className="grid grid-cols-2 ">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Number Of Local Guardian (If any)
                  </p>
                  <p className="border-solid border-b-2 border-black  w-[180%]">
                    {numberOfLocalGuardian}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>
            </section>

            <hr className="mt-8 mb-8" />

            <section className="mt-16 mb-16">
              <p className="text-center font-semibold text-xl">Other Details</p>
              <hr className="mt-6" />

              <div className="grid grid-cols-70/30 gap-10 mt-8">
                <div className="grid grid-cols-2 ">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Phone Number for School SMS
                  </p>
                  <p className="border-solid border-b-2 border-black  w-[180%]">
                    {phoneForSchoolSMS}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-70/30 gap-10 mt-8">
                <div className="grid grid-cols-2 ">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Transport Facility if required{" "}
                    <img src={scbus?.src || scbus} width={80} alt="" />
                  </p>
                  <div className="flex items-center gap-8">
                    <div className="form-control gap-4">
                      <label className="cursor-pointer label">
                        <span className="label-text">Yes</span>
                        <input
                          type="checkbox"
                          checked={transportFacility == "Yes"}
                          disabled
                          className="checkbox checkbox-secondary ml-3"
                        />
                      </label>
                    </div>
                    <div className="form-control gap-4">
                      <label className="cursor-pointer label">
                        <span className="label-text">No</span>
                        <input
                          type="checkbox"
                          checked={transportFacility == "No"}
                          className="checkbox checkbox-secondary ml-3"
                          disabled
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-65/35 gap-10 mt-8 ">
                <div className="grid grid-cols-2 ">
                  <p className="flex items-center gap-4 font-semibold">
                    <MdArrowRightAlt /> Documentation provided at the time of
                    Admission :-
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-65/35 gap-10 mt-4 pl-16">
                <div className="grid grid-cols-2 gap-8">
                  {optionsTransport?.map((option, index) => (
                    <p
                      key={index}
                      className="flex items-center justify-between gap-4 font-semibold"
                    >
                      <span>
                        {index + 1}. {option?.label}
                      </span>{" "}
                      <div className="form-control gap-4">
                        <label className="cursor-pointer label">
                          <input
                            type="checkbox"
                            checked={selectedDocumentation.some(
                              (doc) =>
                                doc.label === option.label &&
                                doc.value === option.value
                            )}
                            disabled
                            className="checkbox checkbox-secondary ml-3"
                          />
                        </label>
                      </div>
                    </p>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <p className="">Date Of Admission :</p>
                  <p className=" border-solid border-b-2 border-black w-full">
                    28/02/2024
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-16 mb-16">
              <p className="text-center font-semibold text-xl bg-rose-300 px-4 py-6 rounded-md">
                I hereby declare that the above information furnished by me is
                correct to the best of my knowledge & belief. I shall abide by
                the rules of the school.
              </p>

              <div className="grid-cols-2 grid mt-16">
                <div className="flex flex-col gap-6">
                  <p>
                    Date{" "}
                    <span className="border-dashed border-b-2 border-black">
                      {new Date().toLocaleDateString()}
                    </span>
                  </p>
                  <p>
                    Place{" "}
                    <span className="border-dashed border-b-2 border-black">
                      Office
                    </span>
                  </p>
                </div>
                <div className=" border-green-600 border-4 pt-9 pl-6 pb-6">
                  <div>
                    <p className="font-semibold">Signature Of Parents</p>
                    <div className="flex flex-col gap-6 mt-8">
                      <p className="flex items-center gap-2">
                        <TiTick /> Father Signature{" "}
                        <span>
                          .........................................................................................
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <TiTick /> Mother Signature{" "}
                        <span>
                          .........................................................................................
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-16 mb-16">
              <p className="text-center font-semibold text-xl">
                For Office Use Only
              </p>
              <hr className="mt-6" />

              <div className="mt-16 border-4 border-orange-400 w-full h-full m-auto p-16 rounded-md">
                <div className="grid grid-cols-2 justify-center content-center items-centerw-full h-full m-auto">
                  <div className="flex flex-col justify-center m-auto gap-6">
                    <p className="font-semibold">Admission Co-Ordinator</p>
                    <p className="font-semibold">
                      Date{" "}
                      <span className="border-dashed border-b-2 border-black">
                        22/03/2024
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col justify-center m-auto gap-6">
                    <p className="font-semibold">Head Of the Institution</p>
                    <p className="font-semibold">
                      Date{" "}
                      <span className="border-dashed border-b-2 border-black">
                        22/03/2024
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <hr className="mt-8 mb-8" />

            <section className="mt-16 mb-16">
              <p className="text-center font-semibold text-xl">For Students</p>

              <div className="mt-16 border-4 border-orange-400 w-full h-full m-auto p-16 rounded-md">
                <div className="grid grid-cols-2 justify-center content-center items-centerw-full h-full m-auto">
                  <div className="flex flex-col justify-center m-auto gap-6">
                    <p className="font-semibold">
                      Form Number <span>________________________</span>
                    </p>
                    <p className="font-semibold">
                      Student Name <span>________________________</span>
                    </p>
                    <p className="font-semibold">
                      Test Date <span>________________________</span>
                    </p>
                    <p className="font-semibold">
                      Test Timing <span>________________________</span>
                    </p>
                  </div>
                  <div className="flex flex-col justify-center m-auto gap-6">
                    <p className="font-semibold">
                      Class <span>________________________</span>
                    </p>
                    <p className="font-semibold">Signature Of The Principal </p>
                    <div className="border-4 border-green-400 h-20"></div>
                  </div>
                </div>
              </div>
            </section>
          </div> */}
          {/* FORM UI */}
        </>
      )}

      <>
        {/* Delete Confirmation Modal */}
        {/* {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
              <p className="mb-4">
                Are you sure you want to delete {productToDelete?.name}? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setProductToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteStudent(productToDelete._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={btnDisable}
                >
                  {btnDisable ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )} */}
        <div className=" p-4">
          {/* Mobile Class/Section Dropdowns */}
          <div className="block md:hidden mb-4">
            <div className="form-control mb-2">
              <label className="label">
                <span className="label-text">Select Class</span>
              </label>
              <select
                className="select select-bordered border-gray-300"
                value={activeClass}
                onChange={(e) => setActiveClass(e.target.value)}
              >
                <option value="all">All</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
                <option value="Nursery">Nursery</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={`${i + 1}`}>{`Class ${
                    i + 1
                  }`}</option>
                ))}
              </select>
            </div>
            <div className="form-control mb-2">
              <label className="label">
                <span className="label-text">Select Section</span>
              </label>
              <select
                className="select select-bordered border-gray-300"
                value={activeDivision}
                onChange={(e) => setActiveDivision(e.target.value)}
              >
                <option value="all">All</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </div>
          </div>
          {/* Desktop (md+) Button Grids */}
          <div className="hidden md:block">
            <div className="font-semibold mb-2">Select Class</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* All Classes Button */}
              <button
                key="all-class"
                className={`btn w-full text-base mb-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                  activeClass === "all"
                    ? "btn-primary border-2 border-blue-700 scale-105 font-bold"
                    : "btn-outline"
                }`}
                onClick={() => setActiveClass("all")}
                title="All Classes"
                tabIndex={0}
              >
                <span className="mr-2" role="img" aria-label="all">
                  🌐
                </span>
                All
              </button>
              {[
                "LKG",
                "UKG",
                "Nursery",
                ...Array.from({ length: 12 }, (_, i) => `${i + 1}`),
              ].map((cls) => (
                <button
                  key={cls}
                  className={`btn w-full text-base mb-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                    activeClass === cls
                      ? "btn-primary border-2 border-blue-700 scale-105 font-bold"
                      : "btn-outline"
                  }`}
                  onClick={() => setActiveClass(cls)}
                  title={cls.match(/^\d+$/) ? `Class ${cls}` : cls}
                  tabIndex={0}
                >
                  <span className="mr-2">
                    {cls.match(/^\d+$/) ? (
                      <span role="img" aria-label="class"></span>
                    ) : (
                      <span role="img" aria-label="book"></span>
                    )}
                  </span>
                  {cls.match(/^\d+$/) ? `Class ${cls}` : cls}
                </button>
              ))}
            </div>
            <div className="font-semibold mb-2 mt-4">Select Section</div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* All Sections Button */}
              <button
                key="all-section"
                className={`btn w-full text-base mb-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                  activeDivision === "all"
                    ? "btn-primary border-2 border-green-700 scale-105 font-bold"
                    : "btn-outline"
                }`}
                onClick={() => setActiveDivision("all")}
                title="All Sections"
                tabIndex={0}
              >
                <span className="mr-1" role="img" aria-label="all-section">
                  🌐
                </span>
                All
              </button>
              {["A", "B"].map((sec) => (
                <button
                  key={sec}
                  className={`btn w-full text-base mb-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                    activeDivision === sec
                      ? "btn-primary border-2 border-green-700 scale-105 font-bold"
                      : "btn-outline"
                  }`}
                  onClick={() => setActiveDivision(sec)}
                  title={`Section ${sec}`}
                  tabIndex={0}
                >
                  <span className="mr-1" role="img" aria-label="section">
                    🏷️
                  </span>
                  {sec}
                </button>
              ))}
            </div>
            {activeClass && activeDivision && (
              <div className="mb-4 mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold shadow">
                  Selected:{" "}
                  {activeClass === "all" ? "All Classes" : activeClass} -
                  Section{" "}
                  {activeDivision === "all" ? "All Sections" : activeDivision}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end items-center">
          <div className="flex gap-2 mt-4">
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                generateWhatsAppMessage()
              )}`}
              className="btn btn-warning text-white"
            >
              Forward to WhatsApp
            </a>
            <DownloadTableExcel
              filename="students table"
              sheet="students"
              currentTableRef={tableRef?.current}
            >
              <button className="btn btn-success btn-md text-white">
                Export To Excel <RiFileExcel2Fill />
              </button>
            </DownloadTableExcel>
          </div>
        </div>
        <div className="form-control w-full relative my-4">
          <input
            className="input input-bordered"
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder="Search By Name, Admission No..."
          />
          <span
            onClick={() => {
              setSearchQuery("");
              fetchAllUser();
            }}
            className="badge cursor-pointer badge-error p-3 text-white absolute right-3 top-3"
          >
            x
          </span>
        </div>
        <div className="flex justify-between">
          <div className="font-semibold text-lg">
            Total Students: {totalPages}
          </div>
          <div>
            <button
              onClick={assignRollNumbersAlphabetically}
              className="btn btn-secondary"
              disabled={
                !activeClass ||
                !activeDivision ||
                activeClass === "All" ||
                activeDivision === "All"
              }
            >
              Auto-assign Roll Numbers (A-Z)
            </button>
          </div>
        </div>

        <div className="mt-6 shadow-sm border rounded-lg overflow-x-auto">
          {!loading ? (
            <>
              {userData ? (
                <>
                  {" "}
                  <table
                    ref={tableRef}
                    className="w-full table-auto text-sm text-left"
                  >
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                      <tr>
                        <th className="py-3 px-6">Name</th>
                        <th className="py-3 px-6">Roll Number</th>
                        <th className="py-3 px-2">Admission No</th>
                        <th className="py-3 px-6">Class-Section</th>

                        {/* <th className="py-3 px-6">Contact</th> */}
                        <th className="py-3 px-6">Gender</th>

                        <th className="py-3 px-6">Status</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y">
                      {userData?.map((item, idx) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="mask mask-squircle w-12 h-12">
                                  <img src={item?.studentAvatar?.secure_url?.src || item?.studentAvatar?.secure_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">{item.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.rollNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.admissionNo}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.studentClass} - {item.studentSection}
                          </td>

                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            {item.contactNumber}
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.gender}
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            {item.registrationNumber}
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <ToggleButton
                              isOn={item.isActive}
                              onToggle={() =>
                                handleToggleStatus(item._id, item.isActive)
                              }
                            />
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setUpdateUserData(item);
                                setFormToggle(true);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="btn btn-outline btn-xs"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item)}
                              className="text-red-600 border border-red-800 btn btn-outline btn-xs hover:text-red-900 ml-2"
                              disabled={btnDisable}
                            >
                              Delete
                            </button>
                            {/* <button
                              onClick={() => handleDeleteModal(item)}
                              className="btn btn-error text-white ml-2 btn-xs"
                            >
                              Delete
                            </button> */}
                            {/* <button
                              onClick={() =>
                                updateStatus(item._id, item.isActive)
                              }
                              className="btn btn-outline btn-xs ml-2"
                              disabled={btnDisable}
                            >
                              {item.isActive !== true ? "Active" : "In-Active"}
                            </button> */}

                            {/* {role == "Super_Admin" && (
                              <button
                                onClick={() => handleDeleteModal(item)}
                                className="btn btn-error  btn-xs text-white ml-2"
                              >
                                Delete
                              </button>
                            )} */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="flex justify-center py-4 font-semibold">
                  No User Data !
                </div>
              )}
            </>
          ) : (
            <>
              {" "}
              <div className="flex items-center justify-center m-auto mt-12">
                <ColorRing
                  visible={true}
                  height="80"
                  width="80"
                  ariaLabel="color-ring-loading"
                  wrapperStyle={{}}
                  wrapperClass="color-ring-wrapper"
                  colors={[
                    "#e15b64",
                    "#f47e60",
                    "#f8b26a",
                    "#abbd81",
                    "#849b87",
                  ]}
                />
              </div>
            </>
          )}
        </div>

        {renderPagination()}
      </>
      {isDeleteModalOpen && productToDelete && (
        <>
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  {productToDelete == "delete-all" ? (
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete All Ros
                    </h3>
                  ) : (
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete User
                    </h3>
                  )}

                  {productToDelete == "delete-all" ? (
                    <p>Are you sure you want to delete all ros ?</p>
                  ) : (
                    <p>Are you sure you want to delete the user?</p>
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => deleteStudent(productToDelete._id)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {btnDisable ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    onClick={() => {
                      setDeleteModalOpen(false);
                      setProductToDelete(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    No, Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Excel Preview Modal */}
      {excelModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border">
            <h3 className="font-bold text-xl text-emerald-700 flex items-center gap-2">
              <RiFileExcel2Fill className="text-2xl" />
              Excel Sheet Preview ({excelData.length} Students Found)
            </h3>
            <p className="py-2 text-xs text-gray-500">
              Please review the student details extracted from your Excel file before importing them directly into MongoDB.
            </p>

            <div className="overflow-x-auto max-h-96 my-4 border rounded-xl">
              <table className="table table-compact w-full text-xs">
                <thead>
                  <tr className="bg-emerald-100 text-emerald-900">
                    <th className="py-3 px-2">#</th>
                    <th className="py-3 px-2">Student Name</th>
                    <th className="py-3 px-2">Roll No</th>
                    <th className="py-3 px-2">Class</th>
                    <th className="py-3 px-2">Section</th>
                    <th className="py-3 px-2">Admission No</th>
                    <th className="py-3 px-2">Father Name</th>
                    <th className="py-3 px-2">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {excelData.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-2 font-mono text-gray-400">{idx + 1}</td>
                      <td className="py-2 px-2 font-semibold text-gray-800">{row["Student Name"] || row["Name"] || row.name || "-"}</td>
                      <td className="py-2 px-2">{row["Roll No"] || row["Roll Number"] || row.rollNumber || (idx + 1)}</td>
                      <td className="py-2 px-2">{row["Class"] || row["Student Class"] || row.studentClass || "1"}</td>
                      <td className="py-2 px-2">{row["Section"] || row["Student Section"] || row.studentSection || "A"}</td>
                      <td className="py-2 px-2 font-mono">{row["Admission No"] || row["Admission Number"] || row.admissionNo || "Auto"}</td>
                      <td className="py-2 px-2">{row["Father Name"] || row["Fathers Name"] || row.fathersName || "-"}</td>
                      <td className="py-2 px-2">{row["Contact Number"] || row["Contact"] || row["Phone"] || row.contactNumber || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {excelData.length > 50 && (
                <p className="text-center text-xs py-2 bg-gray-50 text-gray-500 font-medium">
                  Showing first 50 of {excelData.length} records...
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={isExcelUploading}
                onClick={() => {
                  setExcelModalOpen(false);
                  setExcelData([]);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success text-white btn-sm gap-2"
                disabled={isExcelUploading}
                onClick={handleConfirmExcelUpload}
              >
                {isExcelUploading ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Saving to MongoDB...
                  </>
                ) : (
                  `Upload ${excelData.length} Students to MongoDB`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageStudents;
