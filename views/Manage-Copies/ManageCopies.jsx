"use client";
import { useEffect, useRef, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import axios from "axios";
import { toast } from "react-toastify";
const annyang = null;
import { DownloadTableExcel } from "react-export-table-to-excel";
import { RiFileExcel2Fill } from "react-icons/ri";
import Fuse from "fuse.js";

const ManageCopies = () => {
  const numberWords = {
    // 0-9
    zero: "0",
    oh: "0",
    owe: "0",
    one: "1",
    on: "1",
    van: "1",
    won: "1",
    wan: "1",
    wun: "1",
    to: "2",
    too: "2",
    two: "2",
    tu: "2",
    tew: "2",
    three: "3",
    tree: "3",
    thre: "3",
    thri: "3",
    for: "4",
    four: "4",
    fore: "4",
    faur: "4",
    foor: "4",
    five: "5",
    by: "5",
    bye: "5",
    fife: "5",
    fiv: "5",
    six: "6",
    sicks: "6",
    sik: "6",
    seven: "7",
    sevin: "7",
    siven: "7",
    eight: "8",
    ate: "8",
    ait: "8",
    it: "8",
    nine: "9",
    nain: "9",
    niner: "9",

    // 10-19
    ten: "10",
    tin: "10",
    eleven: "11",
    twelve: "12",
    thirteen: "13",
    fourteen: "14",
    fifteen: "15",
    sixteen: "16",
    seventeen: "17",
    eighteen: "18",
    nineteen: "19",

    // 20-29
    twenty: "20",
    twunty: "20",
    "twenty one": "21",
    "twenty two": "22",
    "twenty three": "23",
    "twenty four": "24",
    "twenty five": "25",
    "twenty six": "26",
    "twenty seven": "27",
    "twenty eight": "28",
    "twenty nine": "29",

    // 30-39
    thirty: "30",
    "thirty one": "31",
    "thirty two": "32",
    "thirty three": "33",
    "thirty four": "34",
    "thirty five": "35",
    "thirty six": "36",
    "thirty seven": "37",
    "thirty eight": "38",
    "thirty nine": "39",

    // 40-49
    forty: "40",
    fourty: "40",
    "forty one": "41",
    "forty two": "42",
    "forty three": "43",
    "forty four": "44",
    "forty five": "45",
    "forty six": "46",
    "forty seven": "47",
    "forty eight": "48",
    "forty nine": "49",

    // 50-59
    fifty: "50",
    fivety: "50",
    "fifty one": "51",
    "fifty two": "52",
    "fifty three": "53",
    "fifty four": "54",
    "fifty five": "55",
    "fifty six": "56",
    "fifty seven": "57",
    "fifty eight": "58",
    "fifty nine": "59",

    // 60
    sixty: "60",
    sixtee: "60",
    sixti: "60",

    // Common combined forms
    "to one": "21", // "twenty one" might sound like "to one"
    "for too": "42", // "forty two" might sound like "for too"
    "fifty for": "54", // "fifty four" might sound like "fifty for"
    "six zero": "60",
    "six oh": "60",

    // Common mispronunciations for compound numbers
    toothree: "23", // "twenty three" might blend
    fortifive: "45", // "forty five" might blend
    fivisix: "56", // "fifty six" might blend
  };
  const tableRef = useRef(null);
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 because getMonth() returns zero-based month
  const day = String(currentDate.getDate()).padStart(2, "0");
  const getDate = `${year}-${month}-${day}`;

  // console.log(getDate);
  const [loading, setLoading] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userData, setUserData] = useState([]);
  const [subject, setSubject] = useState("");
  const [copyCheckData, setCopyCheckData] = useState([]);

  const [remarkComment, setRemarkComment] = useState("");
  const [typeOf, setTypeOf] = useState("");
  const [activeClass, setActiveClass] = useState("");
  const [activeDivision, setActiveDivision] = useState("");
  const [teacherForClassSubjectDiv, setTeacherForClassSubjectDiv] =
    useState(null);

  const [teacherNameForRemark, setTeacherNameForRemark] = useState("");
  const [teacherIdForRemark, setTeacherIdForRemark] = useState("");
  const [date, setDate] = useState(getDate);
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const uid = localStorage.getItem("id");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allCopyData, setAllCopyData] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [assignedWorkTypes, setAssignedWorkTypes] = useState([]);
  const [classOfTeacher, setClassOfTeacher] = useState(
    localStorage.getItem("class")
  );
  const [divisionOfTeacher, setDivisionOfTeacher] = useState(
    localStorage.getItem("section")
  );
  const [localChecks, setLocalChecks] = useState({});
  const assignedClasses = JSON.parse(localStorage.getItem("assignedClasses"));
  const assignedWings = JSON.parse(localStorage.getItem("assignedWings"));
  const assignedSubjects = JSON.parse(localStorage.getItem("assignedSubjects"));
  const assignedDivisions = JSON.parse(
    localStorage.getItem("assignedSections")
  );
  const assignUser = JSON.parse(localStorage.getItem("User"));
  const [adminClasses, setAdminClasses] = useState([]);
  const [adminSections, setAdminSections] = useState([]);

  useEffect(() => {
    if (hasRole("Admin")) {
      axios.get("/api/academic-structure").then((res) => {
        if (res.data.success) {
          const clsList = [];
          const secList = new Set();
          res.data.data.forEach((w) => {
             w.classes.forEach((c) => {
                clsList.push(c.className); // "Nursery", "Class 1", etc.
                c.sections.forEach((s) => secList.add(s));
             });
          });
          setAdminClasses(clsList);
          setAdminSections(Array.from(secList));
        }
      }).catch(err => console.error("Error fetching academic structure", err));
    }
  }, []);

  const hasRole = (requireRole) => {
    const primaryRole = localStorage.getItem("role");
    const secondaryRole = localStorage.getItem("secondaryRole");
    return primaryRole === requireRole || secondaryRole === requireRole;
  };

  const isDualRole =
    hasRole("Teacher") &&
    (hasRole("Senior Coordinator") || hasRole("Junior Coordinator"));
  // console.log("Current user:", assignUser); // Verify user data structure
  // LIST
  // Define a function to merge copyRes with today's date for each student
  const mergeCopyResWithToday = (students) => {
    return students?.map((student) => ({
      ...student,
      date: date, // Merging getDate with each student's data
    }));
  };

  // Define a function to filter copyRes based on the selected subject and date
  const filterCopyResBySubjectAndDate = (students, subject, resCopy) => {
    // console.log("Filtering copyRes:", resCopy, subject, date, typeOf);
    return students?.map((student) => ({
      ...student,
      copyRes: resCopy?.filter(
        (copy) =>
          copy?.subject === subject &&
          copy?.date === date &&
          copy?.studentId === student._id &&
          copy?.submitType == typeOf
      ),
    }));
  };

  const fetchAllCopies = () => {
    setLoading(true);
    try {
      axios
        .get(
          `/api/copy-check/all?date=${date}`
        )
        .then((resCopy) => {
          // console.log(resCopy.data.data);
          setCopyCheckData(resCopy.data.data);
          try {
            const backendClass = activeClass.startsWith("Class ")
              ? activeClass.replace("Class ", "")
              : activeClass;
            axios
              .get(
                `${
                  ""
                }/api/student/filter-by-class?studentClass=${backendClass}&studentSection=${activeDivision}&page=${currentPage}`
              )
              .then((res) => {
                if (res.data.success) {
                  let students = res.data.data;
                  // Filter students for coordinator/teacher roles
                  if (
                    (hasRole("Senior Coordinator") ||
                      hasRole("Junior Coordinator") ||
                      hasRole("Teacher")) &&
                    !hasRole("Admin")
                  ) {
                    const assignedClassValues = assignedClasses.map(
                      (cls) => cls.value
                    );
                    const assignedSectionValues = assignedClasses.flatMap(
                      (cls) => cls.sections?.map((sec) => sec.value) || []
                    );
                    students = students.filter(
                      (student) =>
                        assignedClassValues.includes(student.studentClass) &&
                        assignedSectionValues.includes(student.studentSection)
                    );
                  }
                  const studentsWithCopyRes = mergeCopyResWithToday(students);
                  const studentsFilteredBySubjectAndDate =
                    filterCopyResBySubjectAndDate(
                      studentsWithCopyRes,
                      subject,
                      resCopy.data.data
                    );
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
                  setUserData([]);
                  setLoading(false);
                }
              })
              .catch((error) => {
                console.error("Error fetching student data:", error);
                toast.error("Error fetching student data");
                setUserData([]);
                setLoading(false);
              });
          } catch (error) {
            console.error("Error fetching student data:", error);
            toast.error("Error fetching student data");
            setUserData([]);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching copy check data:", error);
          toast.error("Error fetching copy check data");
          setUserData([]);
          setLoading(false);
        });
    } catch (error) {
      console.error("Error fetching copy check data:", error);
      toast.error("Error fetching copy check data");
      setUserData([]);
      setLoading(false);
    }
  };

  const fetchTeacherByClassSubjectSection = () => {
    if (activeClass && subject && activeDivision) {
      try {
        axios
          .get(
            `${
              ""
            }/api/user/list-teacher?className=${activeClass}&subject=${subject}&section=${activeDivision}`
          )
          .then((res) => {
            console.log(res.data.data);

            setTeacherForClassSubjectDiv(res.data.data);
          })
          .finally(() => {})
          .catch((error) => {
            console.log(error);
            setTeacherForClassSubjectDiv(null);
          });
      } catch (error) {
        console.log(error);
        setTeacherForClassSubjectDiv(null);
      }
    }
  };

  const fetchAllCopyData = async () => {
    try {
      const backendClass = activeClass.startsWith("Class ")
        ? activeClass.replace("Class ", "")
        : activeClass;
      const response = await axios.get(
        `${
          ""
        }/api/student/filter-by-class?studentClass=${backendClass}&studentSection=${activeDivision}&all=true`
      );
      if (response.data.success) {
        setAllCopyData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!hasRole("Admin") && activeClass && activeDivision) {
      const filtered =
        assignedSubjects?.filter(
          (item) =>
            item?.class?.value === activeClass &&
            item?.section?.value === activeDivision
        ) || [];
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects([]);
    }
  }, [activeClass, activeDivision]);

  useEffect(() => {
    fetchAllCopies();
    fetchTeacherByClassSubjectSection();
    fetchAllCopyData();
  }, [subject, typeOf, activeClass, activeDivision, date, currentPage]);

  useEffect(() => {
    // Automatically select subject if only one is available for the teacher
    if (filteredSubjects && filteredSubjects.length === 1) {
      setSubject(filteredSubjects[0].subject.value);
    } else if (filteredSubjects && filteredSubjects.length > 1) {
      setSubject(""); // Reset or let user select
    }
  }, [filteredSubjects]);

  useEffect(() => {
    const fetchAssignedTypes = async () => {
      if (activeClass && activeDivision && subject) {
        try {
          // If Admin is checking, we check the teacher for that class. Otherwise, use logged in uid.
          let targetTeacherId = uid;
          if (hasRole("Admin") && teacherForClassSubjectDiv && teacherForClassSubjectDiv.length > 0) {
            targetTeacherId = teacherForClassSubjectDiv[0]._id;
          }

          if (!targetTeacherId) {
            setAssignedWorkTypes([]);
            return;
          }

          const res = await axios.get(`/api/coordinator-assignment/teacher?teacherId=${targetTeacherId}`);
          if (res.data.success) {
            const assignments = res.data.data;
            const relevantAssignments = assignments.filter(
              (a) =>
                a.class === activeClass &&
                a.section === activeDivision &&
                a.subject === subject
            );

            if (relevantAssignments.length > 0) {
              const allTypes = relevantAssignments.reduce((acc, curr) => {
                const types = Array.isArray(curr.assignedWorkType)
                  ? curr.assignedWorkType
                  : [curr.assignedWorkType];
                return acc.concat(types);
              }, []);
              const uniqueTypes = [...new Set(allTypes)].filter(Boolean);
              setAssignedWorkTypes(uniqueTypes);
            } else {
              setAssignedWorkTypes([]);
            }
          }
        } catch (error) {
          console.error("Error fetching assigned types:", error);
          setAssignedWorkTypes([]);
        }
      } else {
        setAssignedWorkTypes([]);
      }
    };

    fetchAssignedTypes();
  }, [activeClass, activeDivision, subject, uid, teacherForClassSubjectDiv]);

  useEffect(() => {
    // Automatically select type if only one is available
    if (assignedWorkTypes && assignedWorkTypes.length === 1) {
      setTypeOf(assignedWorkTypes[0]);
    } else if (assignedWorkTypes && assignedWorkTypes.length > 1) {
      setTypeOf(""); // Reset or let user select
    }
  }, [assignedWorkTypes]);

  useEffect(() => {
    if (Object.keys(localChecks).length === 0) return;

    const timeoutId = setTimeout(() => {
      fetchAllCopies();
    }, 30000); // 30 seconds

    return () => clearTimeout(timeoutId);
  }, [localChecks]);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const maxPage = Math.ceil(totalPages / 15);
    // console.log(maxPage);
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

  const handleCopySubmit = async (data) => {
    if (!assignUser) {
      toast.error("User not found. Please log in again.");
      return;
    }

    if (subject === "" || typeOf === "") {
      toast.error("Please select Subject and Type first!");
      return;
    }

    if (isDualRole) {
      const isTeacherChecked =
        localChecks[data._id]?.teacher || data?.copyRes[0]?.checkedByTeacher;

      if (!isTeacherChecked) {
        // First click: Check as Teacher
        setLocalChecks((prev) => ({
          ...prev,
          [data._id]: { ...prev[data._id], teacher: true },
        }));

        const dataObj = {
          studentId: data._id,
          date: date,
          subject: subject,
          submitType: typeOf,
          user: {
            ...assignUser,
            role: "Teacher",
            secondaryRole: null,
          },
        };

        try {
          await axios.post(
            `/api/copy-check`,
            dataObj
          );
          toast.success(
            `${typeOf} checked as Teacher for Roll Number ${data.rollNumber}`
          );
        } catch (error) {
          toast.error(error?.message || "Something went wrong");
          setLocalChecks((prev) => ({
            ...prev,
            [data._id]: { ...prev[data._id], teacher: false },
          }));
        }
      } else {
        // Second click: Recheck as Coordinator
        setLocalChecks((prev) => ({
          ...prev,
          [data._id]: { ...prev[data._id], coordinator: true },
        }));

        const coordinatorRole = hasRole("Senior Coordinator") ? "Senior Coordinator" : "Junior Coordinator";

        const dataObj = {
          studentId: data._id,
          date: date,
          subject: subject,
          submitType: typeOf,
          user: {
            ...assignUser,
            role: coordinatorRole,
            secondaryRole: null,
          },
        };

        try {
          await axios.post(
            `/api/copy-check`,
            dataObj
          );
          toast.success(
            `${typeOf} rechecked as Coordinator for Roll Number ${data.rollNumber}`
          );
        } catch (error) {
          toast.error(error?.message || "Something went wrong");
          setLocalChecks((prev) => ({
            ...prev,
            [data._id]: { ...prev[data._id], coordinator: false },
          }));
        }
      }
    } else {
      // Single role logic
      setLocalChecks((prev) => ({
        ...prev,
        [data._id]: {
          ...prev[data._id],
          [role === "Teacher" ? "teacher" : "coordinator"]: true,
        },
      }));

      const dataObj = {
        studentId: data._id,
        date: date,
        subject: subject,
        submitType: typeOf,
        user: {
          ...assignUser,
          secondaryRole: localStorage.getItem("secondaryRole"),
        },
      };

      try {
        const res = await axios.post(
          `/api/copy-check`,
          dataObj
        );
        const { success, message } = res.data;
        if (success) {
          toast.success(
            `${typeOf} processed successfully for Roll Number ${data.rollNumber}`
          );
        } else if (message.includes("already checked")) {
          toast.success(message);
        }
      } catch (error) {
        toast.error(error?.message || "Something went wrong");
        setLocalChecks((prev) => ({
          ...prev,
          [data._id]: {
            ...prev[data._id],
            [role === "Teacher" ? "teacher" : "coordinator"]: false,
          },
        }));
      }
    }
  };

  // console.log("Role check:", {
  //   role,
  //   secondaryRole: localStorage.getItem("secondaryRole"),
  //   isDualRole,
  //   hasTeacherRole: hasRole("Teacher"),
  //   hasCoordinatorRole:
  //     hasRole("Senior Coordinator") || hasRole("Junior Coordinator"),
  // });

  const [recentlyChecked, setRecentlyChecked] = useState({}); // To prevent rapid duplicate submissions
  const [highlightedRoll, setHighlightedRoll] = useState(null); // For row highlight after speech check

  const parseRollNumberFromPhrase = (phrase) => {
    // Try to extract a number directly
    const numberMatch = phrase.match(/\d+/);
    if (numberMatch) return numberMatch[0];
    // Try to match number words (including compound)
    const lower = phrase.toLowerCase().trim();
    if (numberWords[lower]) return numberWords[lower];
    // Try to match any two-word combinations (e.g., "thirty three")
    const words = lower.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      const twoWord = words[i] + " " + words[i + 1];
      if (numberWords[twoWord]) return numberWords[twoWord];
    }
    // Try to match single words
    for (let word of words) {
      if (numberWords[word]) return numberWords[word];
    }
    return null;
  };

  const handleVoiceCommand = async (phrase) => {
    if (!subject || !typeOf) {
      toast.error("Please select Subject and Type first!");
      return;
    }
    const rollNumber = parseRollNumberFromPhrase(phrase);
    if (!rollNumber) {
      toast.error(`Could not recognize a roll number in: "${phrase}"`);
      return;
    }
    if (recentlyChecked[rollNumber]) return; // No toast, just skip
    setRecentlyChecked((prev) => ({ ...prev, [rollNumber]: true }));

    const student = userData.find(
      (s) => String(s.rollNumber) === String(rollNumber)
    );
    if (student) {
      // Optimistic UI update
      const currentRole = isDualRole
        ? localChecks[student._id]?.teacher
          ? "coordinator"
          : "teacher"
        : hasRole("Teacher")
        ? "teacher"
        : "coordinator";

      setLocalChecks((prev) => ({
        ...prev,
        [student._id]: {
          ...prev[student._id],
          [currentRole]: true,
        },
      }));
      setHighlightedRoll(String(rollNumber));
      setTimeout(() => setHighlightedRoll(null), 50); // Minimal highlight
      // Fire API call, but don't wait for it to finish to update UI
      handleCopySubmit(student).finally(() => {
        setRecentlyChecked((prev) => {
          const copy = { ...prev };
          delete copy[rollNumber];
          return copy;
        });
      });
    } else {
      // Fuzzy search for closest roll number
      const fuse = new Fuse(userData, { keys: ["rollNumber"], threshold: 0.4 });
      const result = fuse.search(rollNumber);
      if (result.length > 0) {
        const suggestion = result[0].item;
        toast.error(
          `Not found. Did you mean roll number ${suggestion.rollNumber}?`
        );
      } else {
        toast.error(`Student with roll number ${rollNumber} not found`);
      }
      setRecentlyChecked((prev) => {
        const copy = { ...prev };
        delete copy[rollNumber];
        return copy;
      });
    }
  };

  useEffect(() => {
    if (!annyang) return;
    const commands = {
      "check *phrase": async (phrase) => handleVoiceCommand(phrase),
      "mark *phrase": async (phrase) => handleVoiceCommand(phrase),
      "roll *phrase": async (phrase) => handleVoiceCommand(phrase),
      "check roll *phrase": async (phrase) => handleVoiceCommand(phrase),
      "*phrase": async (phrase) => {
        // fallback: try to extract a number from any phrase
        if (/\d+/.test(phrase)) await handleVoiceCommand(phrase);
      },
    };
    annyang.removeCommands(); // Remove previous to avoid stacking
    annyang.addCommands(commands);
    annyang.start({ autoRestart: true, continuous: true });
    annyang.addCallback("result", (userSaid) => {
      // Optionally log for debugging
      console.log("Raw voice input:", userSaid);
    });
    return () => {
      annyang.removeCommands();
      annyang.abort();
    };
  }, [userData, subject, typeOf]);

  function generateWhatsAppMessage() {
    const dataToUse = searchQuery ? searchResults : userData;
    console.log("WhatsApp Data (ManageCopies):", dataToUse);

    const notSubmittedStudents = dataToUse?.filter(
      (item) => !item?.copyRes[item?.copyRes?.length - 1]?.isCopyChecked
    );

    console.log("Not Submitted Students (ManageCopies):", notSubmittedStudents);

    if (notSubmittedStudents?.length === 0) {
      return "All students have submitted their copy today.";
    }

    const message = `Please find the list of students who haven't submitted their ${subject} ${typeOf} today - ${date}:\n`;
    const studentList = notSubmittedStudents
      ?.map(
        (student) =>
          `(${student.name} Class: ${student.studentClass} Roll Number: ${student.rollNumber})`
      )
      .join("\n");

    const finalMessage = `${message}${studentList}`;
    console.log("WhatsApp Message (ManageCopies):", finalMessage);
    return finalMessage;
  }

  // console.log(activeClass);

  const handleTeacherByClass = (e) => {
    setTeacherNameForRemark(e.target.selectedOptions[0].text);
    setTeacherIdForRemark(e.target.value);
  };
  const handleRemarkSend = () => {
    let data = {
      remarkBy: name,
      remarkById: uid,
      remarkByRole: role,
      remarkTo: teacherNameForRemark,
      remarkToRole:
        hasRole("Senior Coordinator") || hasRole("Junior Coordinator")
          ? "Teacher"
          : hasRole("Teacher")
          ? "Junior Coordinator"
          : hasRole("Admin")
          ? "Senior Coordinator"
          : "",
      remarkToId: teacherIdForRemark,
      isChecked: false,
      remarkComment: remarkComment,
      remarkDate: getDate,
    };
    try {
      axios
        .post(`/api/remark`, data)
        .then((res) => {
          console.log(res.data.data);
          if (res.data.success) {
            toast.success("Remark sent successfully !", { id: "Errorr" });
            setRemarkComment("");
          }
        })
        .finally(() => {})
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.message, { id: "Errorr" });
        });
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message, { id: "Errorr" });
    }
  };
  const visibleUserData =
    role === "Admin"
      ? userData
      : userData?.filter((student) => student.isActive);

  // --- UI TAB OPTIMIZATION START ---
  // Reusable TabList component for classes/sections
  const TabList = ({
    items,
    activeValue,
    onClick,
    labelKey = "label",
    valueKey = "value",
    allLabel,
    allValue,
  }) => (
    <div
      role="tablist"
      className="tabs tabs-boxed flex-nowrap overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {allLabel && (
        <a
          onClick={() => onClick(allValue)}
          role="tab"
          className={`tab min-w-[7rem] ${
            activeValue === allValue
              ? "tab-active !bg-blue-600 !text-white font-bold"
              : ""
          }`}
          style={{ cursor: "pointer" }}
        >
          {allLabel}
        </a>
      )}
      {items?.map((item) => (
        <a
          key={item[valueKey] || item}
          onClick={() => onClick(item[valueKey] || item)}
          role="tab"
          className={`tab min-w-[7rem] ${
            activeValue === (item[valueKey] || item)
              ? "tab-active !bg-blue-600 !text-white font-bold"
              : ""
          }`}
          style={{ cursor: "pointer" }}
        >
          {item[labelKey] || item}
        </a>
      ))}
    </div>
  );
  // --- UI TAB OPTIMIZATION END ---

  useEffect(() => {
    setLocalChecks({});
  }, [date, subject, typeOf, activeClass, activeDivision]);

  const searchStudents = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Build search URL with class and section filters
      let searchUrl = `${
        ""
      }/api/student/search?q=${encodeURIComponent(query)}`;

      if (activeClass && activeClass !== "all") {
        const backendClass = activeClass.startsWith("Class ")
          ? activeClass.replace("Class ", "")
          : activeClass;
        searchUrl += `&studentClass=${encodeURIComponent(backendClass)}`;
      }

      if (activeDivision && activeDivision !== "all") {
        searchUrl += `&studentSection=${encodeURIComponent(activeDivision)}`;
      }

      const response = await axios.get(searchUrl);
      if (response.data.success) {
        let students = response.data.data;

        // Filter students for coordinator/teacher roles (same as fetchAllCopies)
        if (
          (hasRole("Senior Coordinator") ||
            hasRole("Junior Coordinator") ||
            hasRole("Teacher")) &&
          !hasRole("Admin")
        ) {
          const assignedClassValues = assignedClasses.map((cls) => cls.value);
          const assignedSectionValues = assignedClasses.flatMap(
            (cls) => cls.sections?.map((sec) => sec.value) || []
          );
          students = students.filter(
            (student) =>
              assignedClassValues.includes(student.studentClass) &&
              assignedSectionValues.includes(student.studentSection)
          );
        }

        const studentsWithCopyRes = mergeCopyResWithToday(students);
        const studentsFilteredBySubjectAndDate = filterCopyResBySubjectAndDate(
          studentsWithCopyRes,
          subject,
          copyCheckData
        );
        setSearchResults(studentsFilteredBySubjectAndDate);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStudents(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, subject, typeOf, date, activeClass, activeDivision]);

  const displayData = searchQuery.trim() ? searchResults : visibleUserData;

  return (
    <>
      {/* <Toaster draggable={true} /> */}
      
      {/* 1. CLASS & SECTION SELECTORS */}
      {/* --- Mobile View --- */}
      <div className="block md:hidden mb-6 mt-4 shadow-sm border rounded-lg p-4 bg-gray-50">
        <h2 className="font-bold text-lg mb-4 text-gray-700 border-b pb-2">Filter Options</h2>
        <div className="form-control mb-3">
          <label className="label"><span className="label-text font-semibold">Select Class</span></label>
          <select
            className="select select-bordered border-gray-300 w-full"
            value={activeClass}
            onChange={(e) => {
              setActiveClass(e.target.value);
              setActiveDivision("");
              if (!hasRole("Admin")) setClassOfTeacher(e.target.value);
            }}
          >
            <option value="" disabled>Select Class</option>
            {hasRole("Admin") ? (
              <>
                <option value="all">All</option>
                {adminClasses.map(cls => (
                  <option key={cls} value={cls}>{cls.replace("Class ", "")}</option>
                ))}
              </>
            ) : (
              assignedClasses?.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label.replace("Class ", "")}
                </option>
              ))
            )}
          </select>
        </div>
        
        <div className="form-control mb-3">
          <label className="label"><span className="label-text font-semibold">Select Section</span></label>
          <select
            className="select select-bordered border-gray-300 w-full"
            value={activeDivision}
            onChange={(e) => {
              setActiveDivision(e.target.value);
              if (!hasRole("Admin")) setDivisionOfTeacher(e.target.value);
            }}
            disabled={!activeClass}
          >
            <option value="" disabled>Select Section</option>
            {hasRole("Admin") ? (
              <>
                <option value="all">All</option>
                {adminSections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </>
            ) : (
              assignedClasses?.find((cls) => cls.value === activeClass)?.sections?.map((section) => (
                <option key={section.value} value={section.value}>{section.label}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* --- Desktop View --- */}
      <div className="hidden md:block mb-8 mt-2 shadow-sm border rounded-lg p-6 bg-gray-50">
        <h2 className="font-bold text-xl mb-4 text-gray-700 border-b pb-2">Filter Options</h2>
        <div className="font-semibold mb-3">1. Select Class</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {hasRole("Admin") && (
            <button
              key="all-class"
              className={`btn w-full text-base transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                activeClass === "all" ? "btn-primary !text-white font-bold border-2 border-blue-700 scale-105" : "btn-outline bg-white"
              }`}
              onClick={() => { setActiveClass("all"); setActiveDivision(""); }}
              title="All Classes"
            >
              <span className="mr-2">🌐</span>All
            </button>
          )}
          
          {(hasRole("Admin") 
            ? adminClasses
            : assignedClasses?.map(c => c.value) || []
          ).map((clsVal) => {
            const isAssigned = !hasRole("Admin");
            const clsObj = isAssigned ? assignedClasses.find(c => c.value === clsVal) : null;
            const displayLabel = isAssigned ? clsObj.label : clsVal;
            const shortLabel = displayLabel.replace("Class ", "");
            const isLowerClass = ["L.K.G", "U.K.G", "Nursery", "Class L.K.G", "Class U.K.G", "Class Nursery"].includes(displayLabel);
            
            return (
              <button
                key={clsVal}
                className={`btn w-full text-base transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                  activeClass === clsVal ? "btn-primary !text-white font-bold border-2 border-blue-700 scale-105" : "btn-outline bg-white"
                }`}
                onClick={() => {
                  setActiveClass(clsVal);
                  setActiveDivision("");
                  if (isAssigned) setClassOfTeacher(clsVal);
                }}
                title={displayLabel}
              >
                <span className="mr-2">{isLowerClass ? "📖" : "🏫"}</span>
                {isLowerClass ? shortLabel : `Class ${shortLabel}`}
              </button>
            );
          })}
        </div>

        {activeClass && (
          <>
            <div className="font-semibold mb-3">2. Select Section</div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
              {hasRole("Admin") && (
                <button
                  key="all-section"
                  className={`btn w-full text-base transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                    activeDivision === "all" ? "btn-primary !text-white font-bold border-2 border-green-700 scale-105" : "btn-outline bg-white"
                  }`}
                  onClick={() => setActiveDivision("all")}
                  title="All Sections"
                >
                  <span className="mr-1">🌐</span>All
                </button>
              )}
              
              {(hasRole("Admin") 
                ? adminSections
                : assignedClasses?.find(c => c.value === activeClass)?.sections?.map(s => s.value) || []
              ).map((secVal) => {
                const isAssigned = !hasRole("Admin");
                const secObj = isAssigned ? assignedClasses?.find(c => c.value === activeClass)?.sections?.find(s => s.value === secVal) : null;
                const displayLabel = isAssigned ? secObj.label : secVal;
                
                return (
                  <button
                    key={secVal}
                    className={`btn w-full text-base transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                      activeDivision === secVal ? "btn-primary !text-white font-bold border-2 border-green-700 scale-105" : "btn-outline bg-white"
                    }`}
                    onClick={() => {
                      setActiveDivision(secVal);
                      if (isAssigned) setDivisionOfTeacher(secVal);
                    }}
                    title={`Section ${displayLabel}`}
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>
          </>
        )}
        
        {/* Show selected info */}
        {activeClass && activeDivision && (
          <div className="mt-4 pt-4 border-t">
            <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold shadow">
              Selected: {activeClass === "all" ? "All Classes" : activeClass.replace("Class ", "Class ")} - 
              Section {activeDivision === "all" ? "All Sections" : activeDivision}
            </span>
          </div>
        )}
      </div>

      {/* 2. SUBJECT, TYPE, DATE SELECTORS */}
      {activeClass && activeDivision && (
        <div className="grid md:grid-cols-3 gap-4 mb-8 bg-white p-6 shadow-sm border rounded-lg">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">3. Select Subject</span>
            </label>
            <select
              onChange={(e) => setSubject(e.target.value)}
              className="select select-bordered border-gray-300 bg-gray-50 focus:bg-white"
              disabled={!activeClass || !activeDivision}
              value={subject}
            >
              <option value="" disabled>Select Subject</option>
              {hasRole("Admin") ? (
                <>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="General">General</option>
                  <option value="Hindi-1">Hindi-1</option>
                  <option value="Hindi-2">Hindi-2</option>
                  <option value="English-1">English-1</option>
                  <option value="English-2">English-2</option>
                  <option value="Maths">Maths</option>
                  <option value="G.K">G.K</option>
                  <option value="Science">Science</option>
                  <option value="E.V.S">E.V.S</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Geography">Geography</option>
                  <option value="History">History</option>
                  <option value="S.S.T">S.S.T</option>
                  <option value="Msc">Msc</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="Art">Art</option>
                  <option value="Computer">Computer</option>
                  <option value="IT">IT</option>
                </>
              ) : (
                filteredSubjects?.map((res, index) => (
                  <option key={index} value={res.subject.value}>
                    {res.subject.label}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">4. Select Type</span>
            </label>
            <select
              onChange={(e) => setTypeOf(e.target.value)}
              className="select select-bordered border-gray-300 bg-gray-50 focus:bg-white"
              value={typeOf}
              disabled={!subject}
            >
              <option value="" disabled>Select Type</option>
              {hasRole("Admin") && assignedWorkTypes.length === 0 ? (
                <>
                  <option value="Work Book">Work Book</option>
                  <option value="Book">Book</option>
                  <option value="Copy">Copy</option>
                  <option value="Picture Book">Picture Book</option>
                  <option value="Drawing With Craft">Drawing With Craft</option>
                  <option value="Rhymes">Rhymes</option>
                  <option value="File">File</option>
                </>
              ) : assignedWorkTypes.length > 0 ? (
                assignedWorkTypes.map((type, i) => (
                  <option key={i} value={type}>{type}</option>
                ))
              ) : (
                <option value="" disabled>No work assigned</option>
              )}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">5. Select Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered bg-gray-50 focus:bg-white"
              onChange={(e) => setDate(e.target.value)}
              value={date}
              max={getDate}
              min={
                hasRole("Teacher") &&
                !hasRole("Admin") &&
                !hasRole("Senior Coordinator") &&
                !hasRole("Junior Coordinator")
                  ? getDate
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {/* ONLY RENDER THE REST IF FILTERS ARE SET */}
      {activeClass && activeDivision && subject && typeOf && date && (
        <div className="animate-fadeIn">
          {/* Action Buttons & Search */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-lg shadow-sm border">
            <div className="w-full md:w-1/2 flex items-center relative">
              <input
                type="text"
                placeholder="Search students by name, roll number, or father's name..."
                className="input input-bordered w-full max-w-md bg-gray-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <span className="loading loading-spinner loading-sm absolute right-4"></span>
              )}
            </div>
            
            <div className="flex gap-2">
              {typeOf && subject && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(generateWhatsAppMessage())}`}
                  className="btn btn-warning text-white"
                >
                  Forward to Whatsapp
                </a>
              )}
              <DownloadTableExcel
                filename="users table"
                sheet="users"
                currentTableRef={tableRef?.current}
              >
                <button className="btn btn-success text-white">
                  Export To Excel <RiFileExcel2Fill size={20} className="inline ml-1" />
                </button>
              </DownloadTableExcel>
            </div>
          </div>
          
          <div className="shadow-sm border rounded-lg overflow-x-auto">
        {!loading ? (
          <>
            {userData ? (
              <>
                {/* <div className="mb-2 text-sm text-gray-500 italic">
                  Voice command: Say "check 12", "mark 15", or "roll 7" to check a student by roll number.
                </div> */}
                {/* Mobile Card List */}
                <div className="block md:hidden">
                  {visibleUserData?.length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No Student Data!
                    </div>
                  )}
                  {visibleUserData?.map((item) => (
                    <div
                      key={item._id} // Change from item.rollNumber to item._id
                      className={`bg-white rounded-lg shadow p-4 mb-3 ${
                        highlightedRoll === String(item.rollNumber)
                          ? "bg-green-100 animate-pulse"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img
                              src={item?.studentAvatar?.secure_url?.src || item?.studentAvatar?.secure_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                              alt={item?.name}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-base">
                            {item?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item?.fathersName}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm mb-2">
                        <span className="bg-gray-100 rounded px-2 py-1">
                          Roll: {item?.rollNumber}
                        </span>
                        <span className="bg-gray-100 rounded px-2 py-1">
                          Class: {item?.studentClass}-{item?.studentSection}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-sm mb-2">
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span className="font-semibold text-gray-700">
                            Subject:
                          </span>
                          <span>{subject || "-"}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span className="font-semibold text-gray-700">
                            Type:
                          </span>
                          <span>{typeOf || "-"}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs mb-2">
                        <span
                          className={`rounded px-2 py-1 ${
                            localChecks[item._id]?.teacher
                              ? "bg-green-500 text-white"
                              : "bg-red-400 text-white"
                          }`}
                        >
                          Checked By:{" "}
                          {localChecks[item._id]?.teacher
                            ? `${assignUser.name}${
                                role === "Teacher" ? " (Teacher)" : ""
                              }`
                            : item.copyRes[0]?.checkedByTeacher
                            ? `${item.copyRes[0]?.checkedByTeacher}${
                                item.copyRes[0]?.checkedByTeacher ===
                                  assignUser.name && role === "Teacher"
                                  ? " (Teacher)"
                                  : ""
                              }`
                            : "Not-Checked"}
                        </span>
                        <span
                          className={`rounded px-2 py-1 ${
                            localChecks[item._id]?.coordinator ||
                            item?.copyRes[0]?.checkedByCoordinator
                              ? "bg-green-500 text-white"
                              : "bg-red-400 text-white"
                          }`}
                        >
                          Rechecked By:{" "}
                          {localChecks[item._id]?.coordinator
                            ? assignUser.name
                            : item.copyRes[0]?.checkedByCoordinator ||
                              "Not-ReChecked"}
                        </span>
                      </div>
                      {role !== "Admin" && (
                        <button
                          onClick={() => handleCopySubmit(item)}
                          className={`btn btn-xs w-full mt-2 ${
                            (isDualRole &&
                              (localChecks[item._id]?.teacher ||
                                item?.copyRes[0]?.checkedByTeacher) &&
                              (localChecks[item._id]?.coordinator ||
                                item?.copyRes[0]?.checkedByCoordinator)) ||
                            (!isDualRole &&
                              ((role === "Teacher" &&
                                (localChecks[item._id]?.teacher ||
                                  item?.copyRes[0]?.checkedByTeacher)) ||
                                (role !== "Teacher" &&
                                  (localChecks[item._id]?.coordinator ||
                                    item?.copyRes[0]?.checkedByCoordinator))))
                              ? "btn-success text-white"
                              : "btn-error text-white"
                          }`}
                        >
                          {isDualRole
                            ? localChecks[item._id]?.teacher ||
                              item?.copyRes[0]?.checkedByTeacher
                              ? localChecks[item._id]?.coordinator ||
                                item?.copyRes[0]?.checkedByCoordinator
                                ? "✓ Completed"
                                : "Recheck"
                              : "Check"
                            : (role === "Teacher" &&
                                (localChecks[item._id]?.teacher ||
                                  item?.copyRes[0]?.checkedByTeacher)) ||
                              (role !== "Teacher" &&
                                (localChecks[item._id]?.coordinator ||
                                  item?.copyRes[0]?.checkedByCoordinator))
                            ? "✓ Checked"
                            : "Check"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
                    <div className="w-full min-w-[700px]">
                      <table
                        ref={tableRef}
                        className="w-full table-auto text-sm text-left"
                      >
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                          <tr>
                            <th className="py-3 px-6">Name</th>
                            <th className="py-3 px-6">Father's Name</th>
                            <th className="py-3 px-6">Roll Number</th>
                            <th className="py-3 px-6">Class-Section</th>
                            <th className="py-3 px-6">Subject</th>
                            <th className="py-3 px-6">Type</th>
                            <th className="py-3 px-6">Checked By</th>
                            <th className="py-3 px-6">Rechecked By</th>
                            {role !== "Admin" && (
                              <th className="py-3 px-6">Action</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="text-gray-600 divide-y">
                          {displayData?.map((item) => (
                            <tr
                              key={item._id} // Change from item.rollNumber to item._id
                              className={
                                highlightedRoll === String(item.rollNumber)
                                  ? "bg-green-100 animate-pulse"
                                  : ""
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="avatar">
                                    <div className="mask mask-squircle w-12 h-12">
                                      <img
                                        src={item?.studentAvatar?.secure_url?.src || item?.studentAvatar?.secure_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                        alt={item?.name}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-bold">
                                      {item?.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item?.fathersName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item?.rollNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {item?.studentClass}-{item?.studentSection}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {subject || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {typeOf || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {localChecks[item._id]?.teacher ? (
                                  <span className="badge badge-success badge-md text-white">
                                    {assignUser.name}
                                    {role === "Teacher" ? " (Teacher)" : ""}
                                  </span>
                                ) : item.copyRes[0]?.checkedByTeacher ? (
                                  <span className="badge badge-success badge-md text-white">
                                    {item.copyRes[0]?.checkedByTeacher}
                                    {item.copyRes[0]?.checkedByTeacher ===
                                      assignUser.name && role === "Teacher"
                                      ? " (Teacher)"
                                      : ""}
                                  </span>
                                ) : (
                                  <span className="badge badge-error text-white">
                                    Not-Checked
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {localChecks[item._id]?.coordinator ||
                                item?.copyRes[0]?.checkedByCoordinator ? (
                                  <span className="badge badge-success badge-md text-white">
                                    {localChecks[item._id]?.coordinator
                                      ? assignUser.name
                                      : item.copyRes[0]?.checkedByCoordinator}
                                  </span>
                                ) : (
                                  <span className="badge badge-error text-white">
                                    Not-ReChecked
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {role !== "Admin" && (
                                  <button
                                    onClick={() => handleCopySubmit(item)}
                                    className={`btn btn-outline btn-xs ${
                                      (isDualRole &&
                                        (localChecks[item._id]?.teacher ||
                                          item?.copyRes[0]?.checkedByTeacher) &&
                                        (localChecks[item._id]?.coordinator ||
                                          item?.copyRes[0]
                                            ?.checkedByCoordinator)) ||
                                      (!isDualRole &&
                                        ((role === "Teacher" &&
                                          (localChecks[item._id]?.teacher ||
                                            item?.copyRes[0]
                                              ?.checkedByTeacher)) ||
                                          (role !== "Teacher" &&
                                            (localChecks[item._id]
                                              ?.coordinator ||
                                              item?.copyRes[0]
                                                ?.checkedByCoordinator))))
                                        ? "btn-success text-white"
                                        : "btn-error text-white"
                                    }`}
                                  >
                                    {isDualRole
                                      ? localChecks[item._id]?.teacher ||
                                        item?.copyRes[0]?.checkedByTeacher
                                        ? localChecks[item._id]?.coordinator ||
                                          item?.copyRes[0]?.checkedByCoordinator
                                          ? "✓ Completed"
                                          : "Recheck"
                                        : "Check"
                                      : (role === "Teacher" &&
                                          (localChecks[item._id]?.teacher ||
                                            item?.copyRes[0]
                                              ?.checkedByTeacher)) ||
                                        (role !== "Teacher" &&
                                          (localChecks[item._id]?.coordinator ||
                                            item?.copyRes[0]
                                              ?.checkedByCoordinator))
                                      ? "✓ Checked"
                                      : "Check"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
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
      
      {/* End of animate-fadeIn container */}
      </div>
      )}

      {activeClass && activeDivision && subject && typeOf && date && renderPagination()}
    </>
  );
};

export default ManageCopies;
