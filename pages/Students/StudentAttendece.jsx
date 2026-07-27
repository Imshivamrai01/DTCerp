"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';

const StudentAttendance = () => {
  const navigate = useRouter();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [activeClass, setActiveClass] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [hasClassTeacherAccess, setHasClassTeacherAccess] = useState(false);
  const [classTeacherInfo, setClassTeacherInfo] = useState(null);
  const [getCount, setGetCount] = useState(0);
  const [sortBy, setSortBy] = useState("rollNumber"); // Default sort by roll number
  const [sortOrder, setSortOrder] = useState("asc"); // Default ascending order
  const sortedStudents = useMemo(() => {
    const studentsCopy = [...students];

    return studentsCopy.sort((a, b) => {
      if (sortBy === "rollNumber") {
        const rollA = parseInt(a.rollNumber) || 0;
        const rollB = parseInt(b.rollNumber) || 0;
        return rollA - rollB; // Always ascending for roll numbers
      } else {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return -1; // Always A-Z for names
        if (nameA > nameB) return 1;
        return 0;
      }
    });
  }, [students, sortBy]);
  useEffect(() => {
    // Check if user has classTeacher access
    const userRole = localStorage.getItem("role");
    const userData = JSON.parse(localStorage.getItem("User") || "{}");
    const secondaryRole = localStorage.getItem("secondaryRole");
    let classTeacher = JSON.parse(
      localStorage.getItem("classTeacher") || "null"
    );
    if (!classTeacher && userData.classTeacher) {
      classTeacher = userData.classTeacher;
      localStorage.setItem("classTeacher", JSON.stringify(classTeacher));
    }

    // Allow Admin or Class Teachers
    if (userRole === "Admin") {
      setHasClassTeacherAccess(true);
      setClassTeacherInfo(null); // Admin can select any class
    } else if (
      (userRole === "Teacher" || secondaryRole === "Teacher") &&
      classTeacher?.class &&
      classTeacher?.section
    ) {
      setHasClassTeacherAccess(true);
      setClassTeacherInfo(classTeacher);
      setActiveClass(classTeacher.class);
      setActiveSection(classTeacher.section);
    } else {
      setHasClassTeacherAccess(false);
      toast.error(
        "Access denied. Only admins and class teachers can take attendance."
      );
      navigate.back();
    }
  }, [navigate]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!activeClass || !activeSection) return;

      try {
        const url = `${
          ""
        }/api/student/filter-all?studentClass=${activeClass}&studentSection=${activeSection}&page=1`;
        const res = await axios.get(url);

        setGetCount(res.data.count);
        // Filter to only active students
        const filteredStudents = res.data.data.filter(
          (student) => student.isActive === true
        );
        setStudents(filteredStudents);

        // Check existing attendance for the selected date
        await checkExistingAttendance(filteredStudents);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Error fetching students. Please try again later.";
        toast.error(errorMessage);
        setStudents([]);
      }
    };

    const checkExistingAttendance = async (students) => {
      try {
        const response = await axios.get(
          `${
            ""
          }/api/student-attendance/pg?page=1&date=${selectedDate}&class=${activeClass}&section=${activeSection}`
        );

        const existingAttendance = response.data.data || [];
        const initialStatus = {};

        students.forEach((student) => {
          const existing = existingAttendance.find(
            (a) => a.student === student._id
          );
          // Default to Present instead of Absent
          initialStatus[student._id] = existing ? existing.status : "Present";
        });

        setAttendanceStatus(initialStatus);
        // Always enable the submit button so users can re-save if they want to
        setPendingChanges(true);
      } catch (error) {
        console.error("Error checking existing attendance:", error);
        // Initialize all as Present if check fails
        const initialStatus = {};
        students.forEach((student) => {
          initialStatus[student._id] = "Present";
        });
        setAttendanceStatus(initialStatus);
        setPendingChanges(true); // Enable submit button if fetch fails
      }
    };

    fetchStudents();
  }, [activeClass, activeSection, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus((prev) => {
      const newStatus = { ...prev, [studentId]: status };
      // Simply set pendingChanges to true when any radio button is clicked
      setPendingChanges(true);
      return newStatus;
    });
  };

  const handleAttendanceAction = async (studentId, status) => {
    try {
      const student = students.find((s) => s._id === studentId);
      // First try to update existing attendance
      const updateResponse = await axios.put(
        "/api/student-attendance/update",
        {
          student: studentId,
          status,
          date: selectedDate,
        }
      );

      if (updateResponse.data.success) {
        return { success: true, name: student.name };
      }
    } catch (updateError) {
      // If update fails (likely because record doesn't exist), try to create
      try {
        const student = students.find((s) => s._id === studentId);
        const createResponse = await axios.post(
          "/api/student-attendance/create",
          {
            student: studentId,
            name: student.name,
            rollNumber: student.rollNumber,
            studentClass: student.studentClass,
            studentSection: student.studentSection,
            status,
            date: selectedDate,
          }
        );

        if (createResponse.data.success) {
          return { success: true, name: student.name };
        }
      } catch (createError) {
        console.error("Error creating attendance:", createError);
        return {
          success: false,
          name: student.name,
          error:
            createError.response?.data?.error || "Error recording attendance",
        };
      }
    }
  };

  const confirmBulkSubmit = () => {
    if (!pendingChanges) {
      toast.error("No changes to save");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleBulkSubmit = async () => {
    setShowConfirmModal(false);

    if (!selectedDate) {
      toast.error("Please select a date before submitting.");
      return;
    }

    if (students.length === 0) {
      toast.error("No active students found to submit attendance for.");
      return;
    }

    setIsSubmitting(true);

    const results = await Promise.allSettled(
      students.map(async (student) => {
        try {
          // Default to Present if status is undefined
          const status = attendanceStatus[student._id] || "Present";
          const result = await handleAttendanceAction(student._id, status);
          return result;
        } catch (error) {
          return {
            success: false,
            name: student.name,
            error: error.response?.data?.error || error.message,
          };
        }
      })
    );

    const successful = results.filter((r) => r.value?.success);
    const failed = results.filter((r) => !r.value?.success);

    if (successful.length > 0) {
      toast.success(`Attendance saved for ${successful.length} students`);
    }
    if (failed.length > 0) {
      failed.forEach((f) => {
        toast.error(`Failed for ${f.value.name}: ${f.value.error}`);
      });
    }

    setIsSubmitting(false);
    setPendingChanges(false);

    // Refresh the attendance data
    const response = await axios.get(
      `${
        ""
      }/api/student-attendance/pg?page=1&date=${selectedDate}&class=${activeClass}&section=${activeSection}`
    );

    const existingAttendance = response.data.data || [];
    const updatedStatus = {};

    students.forEach((student) => {
      const existing = existingAttendance.find(
        (a) => a.student === student._id
      );
      updatedStatus[student._id] = existing ? existing.status : "Present";
    });

    setAttendanceStatus(updatedStatus);
  };

  if (!hasClassTeacherAccess) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        {/* <Toaster draggable={true} position="top-right" /> */}
        <div className="max-w-7xl mx-auto bg-base-100 shadow-xl rounded-2xl p-6 card-modern animate-fade-in-up">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">
              Only class teachers and admins can take attendance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* <Toaster
        draggable={true}
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
          },
        }}
      /> */}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              Confirm Attendance Submission
            </h3>
            <p className="mb-4">
              Are you sure you want to save the attendance for {selectedDate}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class/Section Selection for Admin */}
      {!classTeacherInfo && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Class
              </label>
              <select
                value={activeClass}
                onChange={(e) => {
                  setActiveClass(e.target.value);
                  setActiveSection(""); // Reset section when class changes
                }}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Class</option>
                <option value="Nursery">Nursery</option>
                <option value="L.K.G">L.K.G</option>
                <option value="U.K.G">U.K.G</option>
                <option value="1">Class 1</option>
                <option value="2">Class 2</option>
                <option value="3">Class 3</option>
                <option value="4">Class 4</option>
                <option value="5">Class 5</option>
                <option value="6">Class 6</option>
                <option value="7">Class 7</option>
                <option value="8">Class 8</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Section
              </label>
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!activeClass}
              >
                <option value="">Select Section</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Student Attendance
            </h1>
            <p className="text-gray-600 mt-2">
              Class: {classTeacherInfo?.class}
            </p>
          </div>
          <button
            onClick={() => navigate.back()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md w-fit">
          🎓 Total Students: <span className="font-semibold">{getCount}</span>
        </div>

        {/* Class Tabs */}
        {/* {assignedClasses.length > 0 && (
          <div className="mb-4">
            <div role="tablist" className="tabs tabs-boxed flex-wrap">
              {assignedClasses.map((cls) => (
                <button
                  key={cls._id}
                  onClick={() => {
                    setActiveClass(cls.value);
                    if (cls.sections && cls.sections.length > 0) {
                      setActiveSection(cls.sections[0].value);
                    }
                  }}
                  className={`tab ${
                    activeClass === cls.value ? "tab-active" : ""
                  }`}
                >
                  {cls.label}
                </button>
              ))}
            </div>
          </div>
        )} */}

        {/* Section Tabs */}
        {/* {assignedClasses.find((c) => c.value === activeClass)?.sections
          ?.length > 0 && (
          <div className="mb-6">
            <div role="tablist" className="tabs tabs-boxed flex-wrap">
              {assignedClasses
                .find((c) => c.value === activeClass)
                ?.sections?.map((section) => (
                  <button
                    key={section._id}
                    onClick={() => setActiveSection(section.value)}
                    className={`tab ${
                      activeSection === section.value ? "tab-active" : ""
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
            </div>
          </div>
        )} */}

        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 mb-2">Select Date:</label>
            <input
              type="date"
              className="border border-gray-300 p-2 rounded w-full"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Simplified sorting dropdown */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 mb-2">Sort By:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 p-2 rounded w-full"
            >
              <option value="rollNumber">Roll Number (Ascending)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No active students found for {activeClass} - {activeSection}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Roll No.</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Section</th>
                  <th className="px-4 py-2 text-center">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, index) => (
                  <tr key={student._id} className="border-b">
                    <td className="px-4 py-2">{student.rollNumber}</td>
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.studentClass}</td>
                    <td className="px-4 py-2">{student.studentSection}</td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center gap-4">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`attendance-${student._id}`}
                            value="Present"
                            checked={
                              attendanceStatus[student._id] === "Present"
                            }
                            onChange={() =>
                              handleStatusChange(student._id, "Present")
                            }
                            className="accent-green-500"
                          />
                          <span className="text-sm">Present</span>
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`attendance-${student._id}`}
                            value="Absent"
                            checked={attendanceStatus[student._id] === "Absent"}
                            onChange={() =>
                              handleStatusChange(student._id, "Absent")
                            }
                            className="accent-red-500"
                          />
                          <span className="text-sm">Absent</span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={confirmBulkSubmit}
          className={`mt-4 text-white px-4 py-2 rounded transition-all duration-300 transform btn-modern w-full ${
            pendingChanges
              ? "bg-primary hover:bg-primary-focus shadow-md"
              : "bg-gray-400 cursor-not-allowed opacity-70"
          }`}
          disabled={
            isSubmitting ||
            !selectedDate ||
            students.length === 0 ||
            !pendingChanges
          }
        >
          {isSubmitting ? "Processing..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
};

export default StudentAttendance;
