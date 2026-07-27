"use client";
import { useEffect, useState, useRef } from "react";
import { ColorRing } from "react-loader-spinner";
import axios from "axios";
import { toast } from "react-toastify";
const annyang = null;
import { DownloadTableExcel } from "react-export-table-to-excel";
import { RiFileExcel2Fill } from "react-icons/ri";
const ManageExamCopies = () => {
  const tableRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userData, setUserData] = useState([]);
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [exam, setExam] = useState("");
  const [examDate, setExamDate] = useState("");
  const [marks, setMarks] = useState([]);
  const role = localStorage.getItem("role");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeClass, setActiveClass] = useState(
    role == "Teacher" ? localStorage.getItem("class") : "all"
  );
  const [activeDivision, setActiveDivision] = useState(
    role == "Teacher" ? localStorage.getItem("division") : "all"
  );

  const [classOfTeacher, setClassOfTeacher] = useState(
    localStorage.getItem("class")
  );
  const [divisionOfTeacher, setDivisionOfTeacher] = useState(
    localStorage.getItem("division")
  );
  const assignedSubjects = JSON.parse(localStorage.getItem("assignedSubjects"));
  const assignedWings = JSON.parse(localStorage.getItem("assignedWings"));
  const assignedClasses = JSON.parse(localStorage.getItem("assignedClasses"));
  const assignedDivisions = JSON.parse(
    localStorage.getItem("assignedSections")
  );

  console.log(assignedWings);
  // LIST
  // Define a function to merge copyRes with today's date for each student
  const mergeCopyResWithToday = (students) => {
    return students?.map((student) => ({
      ...student,
      date: examDate, // Merging getDate with each student's data
    }));
  };

  // Define a function to filter copyRes based on the selected subject and date
  const filterCopyResBySubjectAndDate = (students, subject, resCopy) => {
    return students?.map((student) => ({
      ...student,
      copyRes: resCopy?.filter(
        (copy) =>
          copy?.subject === subject &&
          copy?.examDate === examDate &&
          copy?.studentId._id === student._id &&
          copy?.examType == examType &&
          copy.exam == exam
      ),
    }));
  };

  const fetchAllCopies = () => {
    setLoading(true);
    try {
      axios
        .get(
          `${
            ""
          }/api/exam-record/all?date=${examDate}`
        )
        .then((resCopy) => {
          console.log(resCopy.data.data);
          try {
            axios
              .get(
                `${
                  ""
                }/api/student/filter?studentClass=${
                  role == "Teacher"
                    ? classOfTeacher
                    : role == "Coordinator"
                    ? assignedWings[0].value
                    : activeClass
                }&studentSection=${
                  role == "Teacher" ? divisionOfTeacher : activeDivision
                }&page=${currentPage}`
              )
              .then((res) => {
                if (res.data.success) {
                  const studentsWithCopyRes = mergeCopyResWithToday(
                    res.data.data
                  );
                  const studentsFilteredBySubjectAndDate =
                    filterCopyResBySubjectAndDate(
                      studentsWithCopyRes,
                      subject,
                      resCopy.data.data
                    );
                  console.log(studentsFilteredBySubjectAndDate);
                  setUserData(studentsFilteredBySubjectAndDate);
                  setTotalPages(res.data.count);
                  setLoading(false);
                } else {
                  // Handle unsuccessful response from student filter API
                  console.error(
                    "Failed to fetch student data:",
                    res.data.message
                  );
                  toast.error(res.data.message);
                  setUserData(null);
                  setLoading(false);
                }
              })
              .catch((error) => {
                console.error("Error fetching student data:", error);
                toast.error("Error fetching student data");
                setUserData(null);
                setLoading(false);
              });
          } catch (error) {
            console.error("Error fetching student data:", error);
            toast.error("Error fetching student data");
            setUserData(null);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching copy check data:", error);
          toast.error("Error fetching copy check data");
          setUserData(null);
          setLoading(false);
        });
    } catch (error) {
      console.error("Error fetching copy check data:", error);
      toast.error("Error fetching copy check data");
      setUserData(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCopies();
  }, [subject, examType, activeClass, activeDivision, examDate, exam]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const maxPage = Math.ceil(totalPages / 15);
    console.log(maxPage);
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
        startPage = currentPage - 1;
        endPage = currentPage + 2;
      }
    }

    const visiblePages = pageNumbers.slice(startPage - 1, endPage);
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === maxPage;

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
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because getMonth() returns zero-based month
  const day = String(currentDate.getDate()).padStart(2, "0");
  const getDate = `${year}-${month}-${day}`;

  console.log(getDate);

  const handleCopySubmit = (data) => {
    console.log(data);
    let dataObj = {
      studentId: data._id,
      examDate: examDate,
      subject: subject,
      isCopyChecked: !data.isCopyChecked ? true : false,
      examType: examType,
      exam: exam,
      marks: marks[data._id],
    };
    console.log(dataObj);

    if (subject == "" || examType == "") {
      toast.error("Please Select Subject and Type First !");
      return;
    }
    try {
      axios
        .post(`/api/exam-record`, dataObj)
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            setLoading(false);
            toast.success(
              `${examType} submitted successfully for ${dataObj.name}`,
              { id: "Errorr" }
            );
            setMarks([]);
            fetchAllCopies();
          }
        })
        .catch((error) => {
          toast.error(error.response.data.message, { id: "Errorr" });

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
  console.log(marks);
  useEffect(() => {
    annyang.start();

    annyang.addCallback("result", (userSaidArray) => {
      const userSaid = userSaidArray[0];
      if (userSaid.toLowerCase().includes("d2c")) {
        const studentName = userSaid.split("d2c")[1]?.trim(); // Use optional chaining to prevent error if split returns undefined
        console.log(studentName);
        const student = userData?.find(
          (s) =>
            s?.name?.toLowerCase()?.trim() == studentName?.toLowerCase()?.trim()
        );
        if (student) {
          console.log("Student found:", student);
          if (subject && examType && marks[student._id]) {
            handleCopySubmit(student);
          }
          // Logic to handle student details
        } else {
          console.log("Student not found. Please try again.");
          // Voice response: "Student not found. Please try again."
        }
      }
      // if (userSaid.toLowerCase().includes("change book type")) {
      //   const changeTypeOf = userSaid.split("change book type")[1]?.trim(); // Use optional chaining here as well if needed
      //   console.log(changeTypeOf);
      //   setTypeOf(changeTypeOf);
      // }
    });
  }, [subject, examType, marks]);

  const filteredStudents =
    visibleUserData?.filter((student) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (student.name && student.name.toLowerCase().includes(searchLower)) ||
        (student.fathersName &&
          student.fathersName.toLowerCase().includes(searchLower)) ||
        (student.rollNumber &&
          student.rollNumber.toString().includes(searchQuery))
      );
    }) || [];

  return (
    <>
      {/* <Toaster draggable={true} /> */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Subject</span>
          </label>
          <select
            onChange={(e) => setSubject(e.target.value)}
            className="select select-bordered border-gray-300"
          >
            <option value="" selected disabled>
              Select Subject
            </option>
            {activeClass == "L.K.G" ? (
              <>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Maths">Maths</option>
                <option value="General">General</option>
              </>
            ) : activeClass == "Nursery" ? (
              <>
                {" "}
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Maths">Maths</option>
                <option value="General">General</option>
              </>
            ) : role == "Teacher" ? (
              <>
                {role == "Teacher" && assignedSubjects
                  ? assignedSubjects.map((res) => {
                      return (
                        <option key={res.value} value={res.value}>
                          {res.value}
                        </option>
                      );
                    })
                  : ""}
                {/* {" "}
                 */}
              </>
            ) : (
              <>
                {" "}
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="General">General</option>
                <option value="Hindi-1">Hindi-1</option>
                <option value="Hindi-2">Hindi-2</option>
                <option value="English-1">English-1</option>
                <option value="English-2">English-2</option>
                <option value="Maths">Maths</option>{" "}
                <option value="G.K">G.K</option>
                <option value="Science">Science</option>
                <option value="E.V.S">E.V.S</option>
                <option value="S.S.T">S.S.T</option>
                <option value="Sanskrit">Sanskrit</option>
                <option value="Art">Art</option>
                <option value="Computer">Computer</option>
              </>
            )}
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Exam </span>
          </label>
          <select
            onChange={(e) => setExam(e.target.value)}
            className="select select-bordered border-gray-300"
          >
            <option value="" selected disabled>
              Select Exam
            </option>
            <option value="FA1">FA1</option>
            <option value="FA2">FA2</option>
            <option value="FA3">FA3</option>
            <option value="FA4">FA4</option>
            <option value="SA1">SA1</option>
            <option value="SA2">SA2</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Exam Type </span>
          </label>
          <select
            onChange={(e) => setExamType(e.target.value)}
            className="select select-bordered border-gray-300"
          >
            <option value="" selected disabled>
              Select Exam Type
            </option>
            <option value="Oral">Oral</option>
            <option value="Written">Written</option>
            <option value="Practical">Practical</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Exam Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered"
            onChange={(e) => setExamDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end font-semibold mt-4">
        Date : {getDate}
      </div>

      <div className="flex justify-end mt-4">
        <DownloadTableExcel
          filename="users table"
          sheet="users"
          currentTableRef={tableRef?.current}
        >
          <button className="btn btn-success btn-md text-white">
            Export To Excel <RiFileExcel2Fill />
          </button>
        </DownloadTableExcel>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by student name, roll number, or father's name..."
          className="input input-bordered w-full max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
        {role == "Admin" && (
          <>
            {" "}
            <div role="tablist" className="tabs tabs-boxed flex-wrap flex">
              <a
                onClick={() => setActiveClass("all")}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "all" ? " tab-active" : ""
                }`}
              >
                All
              </a>
              <a
                onClick={() => setActiveClass("L.K.G")}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "L.K.G" ? " tab-active" : ""
                }`}
              >
                L.K.G
              </a>
              <a
                onClick={() => setActiveClass("U.K.G")}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "U.K.G" ? " tab-active" : ""
                }`}
              >
                U.K.G
              </a>
              <a
                onClick={() => setActiveClass("Nursery")}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "Nursery" ? " tab-active" : ""
                }`}
              >
                Nursery
              </a>
              <a
                onClick={() => setActiveClass(1)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "1" ? " tab-active" : ""
                }`}
              >
                Class 1
              </a>
              <a
                onClick={() => setActiveClass(2)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "2" ? " tab-active" : ""
                }`}
              >
                Class 2
              </a>
              <a
                onClick={() => setActiveClass(3)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "3" ? " tab-active" : ""
                }`}
              >
                Class 3
              </a>
              <a
                onClick={() => setActiveClass(4)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "4" ? " tab-active" : ""
                }`}
              >
                Class 4
              </a>
              <a
                onClick={() => setActiveClass(5)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "5" ? " tab-active" : ""
                }`}
              >
                Class 5
              </a>
              <a
                onClick={() => setActiveClass(6)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "6" ? " tab-active" : ""
                }`}
              >
                Class 6
              </a>
              <a
                onClick={() => setActiveClass(7)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "7" ? " tab-active" : ""
                }`}
              >
                Class 7
              </a>
              <a
                onClick={() => setActiveClass(8)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "8" ? " tab-active" : ""
                }`}
              >
                Class 8
              </a>
              <a
                onClick={() => setActiveClass(9)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "9" ? " tab-active" : ""
                }`}
              >
                Class 9
              </a>
              <a
                onClick={() => setActiveClass(10)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "10" ? " tab-active" : ""
                }`}
              >
                Class 10
              </a>
              <a
                onClick={() => setActiveClass(11)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "11" ? " tab-active" : ""
                }`}
              >
                Class 11
              </a>
              <a
                onClick={() => setActiveClass(12)}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == "12" ? " tab-active" : ""
                }`}
              >
                Class 12
              </a>
            </div>
            <div role="tablist" className="tabs tabs-boxed">
              <a
                onClick={() => setActiveDivision("all")}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeDivision == "all" ? " tab-active" : ""
                }`}
              >
                All
              </a>
              <a
                onClick={() => setActiveDivision("A")}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeDivision == "A" ? " tab-active" : ""
                }`}
              >
                A
              </a>
              <a
                onClick={() => setActiveDivision("B")}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeDivision == "B" ? " tab-active" : ""
                }`}
              >
                B
              </a>
              {/* <a
              onClick={() => setActiveDivision("C")}
              role="tab"
              className={`tab min-w-[7rem] ${
                activeDivision == "C" ? " tab-active" : ""
              }`}
            >
              C
            </a>
            <a
              onClick={() => setActiveDivision("D")}
              role="tab"
              className={`tab min-w-[7rem] ${
                activeDivision == "D" ? " tab-active" : ""
              }`}
            >
              D
            </a> */}
            </div>
          </>
        )}
        {role === "Teacher" && (
          <>
            <div role="tablist" className="tabs tabs-boxed flex-wrap flex">
              {/* <a
                onClick={() => {
                  setActiveClass(localStorage.getItem("class"));
                  setClassOfTeacher(localStorage.getItem("class"));
                }}
                role="tab"
                className={`tab min-w-[7rem] ${
                  activeClass == localStorage.getItem("class")
                    ? " tab-active"
                    : ""
                }`}
              >
                All
              </a> */}
              {assignedClasses?.map((cls) => (
                <a
                  key={cls._id}
                  onClick={() => {
                    setClassOfTeacher(cls.value);
                    setActiveClass(cls.value);
                  }}
                  role="tab"
                  className={`tab min-w-[7rem] ${
                    activeClass === cls.value ? "tab-active" : ""
                  }`}
                >
                  {cls.label}
                </a>
              ))}
            </div>

            <div role="tablist" className="tabs tabs-boxed">
              {/* <a
                  onClick={() => {
                    setActiveDivision(localStorage.getItem("division"));
                    setDivisionOfTeacher(localStorage.getItem("division"));
                  }}
                  role="tab"
                  className={`tab min-w-[7rem] ${
                    activeClass == localStorage.getItem("division")
                      ? " tab-active"
                      : ""
                  }`}
                >
                  All
                </a> */}
              {assignedDivisions.map((division) => (
                <a
                  key={division._id}
                  onClick={() => {
                    setDivisionOfTeacher(division.value);
                    setActiveDivision(division.value);
                  }}
                  role="tab"
                  className={`tab min-w-[7rem] ${
                    activeDivision === division.value ? "tab-active" : ""
                  }`}
                >
                  {division.label}
                </a>
              ))}
            </div>
          </>
        )}
        {role == "Coordinator" && (
          <>
            <div role="tablist" className="tabs tabs-boxed flex-wrap flex">
              {assignedWings?.map((cls) =>
                cls.value.split(",").map((classValue, index) => (
                  <a
                    key={`${cls._id}-${index}`} // Unique key for each class tab
                    onClick={() => {
                      setClassOfTeacher(classValue);
                      setActiveClass(classValue);
                    }}
                    role="tab"
                    className={`tab min-w-[7rem] ${
                      activeClass === classValue ? "tab-active" : ""
                    }`}
                  >
                    {classValue}
                  </a>
                ))
              )}
            </div>
            <div role="tablist" className="tabs tabs-boxed">
              {assignedDivisions.map((division) => (
                <a
                  key={division._id}
                  onClick={() => {
                    setDivisionOfTeacher(division.value);
                    setActiveDivision(division.value);
                  }}
                  role="tab"
                  className={`tab min-w-[7rem] ${
                    activeDivision === division.value ? "tab-active" : ""
                  }`}
                >
                  {division.label}
                </a>
              ))}
            </div>
          </>
        )}
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
                      <th className="py-3 px-6">Class-Section</th>
                      <th className="py-3 px-6">Subject</th>
                      <th className="py-3 px-6">Exam Type</th>
                      <th className="py-3 px-6">Marks</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 divide-y">
                    {filteredStudents?.map((item, idx) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12">
                                <img src={item?.studentAvatar?.secure_url?.src || item?.studentAvatar?.secure_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{item?.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item?.rollNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item?.studentClass}-{item?.studentSection}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {subject || "Select a Subject"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {examType || "Select an Exam Type"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            className="input input-bordered"
                            placeholder="Enter Marks"
                            value={
                              marks[item._id] !== undefined // Check if marks[item._id] is defined
                                ? marks[item._id]
                                : item?.copyRes?.find(
                                    (copy) =>
                                      copy.examType === examType &&
                                      copy.subject === subject
                                  )?.marks // Use item.copyRes instead of item
                            }
                            onChange={(e) =>
                              setMarks({ ...marks, [item._id]: e.target.value })
                            }
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item?.copyRes[0]?.isCopyChecked ? (
                            <span className="badge badge-success badge-md text-white">
                              Submitted
                            </span>
                          ) : (
                            <span className="badge badge-error text-white">
                              Not-Submitted
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleCopySubmit(item)}
                            className="btn btn-outline btn-xs"
                          >
                            {!item.isCopyChecked ? " Submit" : " Un-Submit"}
                          </button>

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
                No Student Data !
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
                colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
              />
            </div>
          </>
        )}
      </div>
      {renderPagination()}
    </>
  );
};

export default ManageExamCopies;
