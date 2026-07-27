"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from 'next/navigation';

const StudentList = () => {
  const formatDateForInput = (date) => {
    return date.toISOString().split("T")[0];
  };
  const [students, setStudents] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [dateFilter, setDateFilter] = useState(formatDateForInput(new Date()));
  const [selectedClass, setSelectedClass] = useState("");
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [teacherSection, setTeacherSection] = useState("");
  const [sortBy, setSortBy] = useState("rollNumber"); // Default sort by roll number
  const [sortOrder, setSortOrder] = useState("asc"); // Default ascending order
  const [monthFilter, setMonthFilter] = useState(() => {
    const currentMonth = new Date().getMonth() + 1; // 0-based, so add 1
    return currentMonth.toString(); // Make sure it's a string if used in select inputs
  });
  const [yearFilter, setYearFilter] = useState(
    new Date().getFullYear().toString()
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("daily"); // 'daily' or 'monthly'
  const [classFilter, setClassFilter] = useState("");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [hasClassTeacherAccess, setHasClassTeacherAccess] = useState(false);
  const [classTeacherInfo, setClassTeacherInfo] = useState(null);
  const navigate = useRouter();
  const sortedStudents = useMemo(() => {
    const studentsCopy = [...attendances];

    return studentsCopy.sort((a, b) => {
      if (sortBy === "rollNumber") {
        const rollA = parseInt(a.rollNumber || a.student?.rollNumber) || 0;
        const rollB = parseInt(b.rollNumber || b.student?.rollNumber) || 0;
        return rollA - rollB;
      } else {
        const nameA = (a.name || a.student?.name || "").toLowerCase();
        const nameB = (b.name || b.student?.name || "").toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      }
    });
  }, [attendances, sortBy]);
  useEffect(() => {
    // Check if user has classTeacher access
    const userRole = localStorage.getItem("role");
    const secondaryRole = localStorage.getItem("secondaryRole");
    const userData = JSON.parse(localStorage.getItem("User") || "{}");
    const classTEacher = JSON.parse(
      localStorage.getItem("classTeacher") || "null"
    );
    setTeacherClasses(classTEacher?.class || []);
    setTeacherSection(classTEacher?.section || "");
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
      setClassTeacherInfo(null); // Admin can see all classes
    } else if (
      (userRole === "Teacher" || secondaryRole === "Teacher") &&
      classTeacher?.class &&
      classTeacher?.section
    ) {
      setHasClassTeacherAccess(true);
      setClassTeacherInfo(classTeacher);
    } else {
      setHasClassTeacherAccess(false);
      toast.error(
        "Access denied. Only admins and class teachers can manage student attendance."
      );
    }
  }, []);

  // Load classes when component mounts
  useEffect(() => {
    const userRole = localStorage.getItem("role");

    if (userRole === "Admin") {
      // For Admin, create a list of all classes
      const allClasses = [
        {
          value: "Nursery",
          label: "Class Nursery",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "L.K.G",
          label: "LKG",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "U.K.G",
          label: "UKG",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "1",
          label: "Class 1",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "2",
          label: "Class 2",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "3",
          label: "Class 3",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "4",
          label: "Class 4",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "5",
          label: "Class 5",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "6",
          label: "Class 6",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "7",
          label: "Class 7",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "8",
          label: "Class 8",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "9",
          label: "Class 9",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
        {
          value: "10",
          label: "Class 10",
          sections: [
            { value: "A", label: "Section A" },
            { value: "B", label: "Section B" },
          ],
        },
      ];
      setAssignedClasses(allClasses);
    } else {
      // For Teachers, use assigned classes from localStorage
      const teacherClasses =
        JSON.parse(localStorage.getItem("assignedClasses")) || [];
      setAssignedClasses(teacherClasses);

      // Set default selected class if available
      if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0].value);
        const sections = teacherClasses[0].sections || [];
        setAvailableSections(sections);
        if (sections.length > 0) {
          setSelectedSection(sections[0].value);
        }
      }
    }
  }, []);

  // Load assigned classes when component mounts
  // useEffect(() => {
  //   const teacherClasses =
  //     JSON.parse(localStorage.getItem("assignedClasses")) || [];
  //   setAssignedClasses(teacherClasses);

  //   // Set default selected class if available
  //   if (teacherClasses.length > 0) {
  //     setSelectedClass(teacherClasses[0].value);

  //     // Set available sections for the selected class
  //     const sections = teacherClasses[0].sections || [];
  //     setAvailableSections(sections);
  //     if (sections.length > 0) {
  //       setSelectedSection(sections[0].value);
  //     }
  //   }
  // }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
      };
      // if (selectedSection) {
      //   params.section = selectedSection;
      // }

      // Add class/section filters
      if (classTeacherInfo) {
        // For class teachers - use their assigned class/section
        params.class = classTeacherInfo.class;
        params.section = classTeacherInfo.section;
      } else if (selectedClass && selectedSection) {
        // For admins - use selected class/section
        params.class = selectedClass;
        params.section = selectedSection;
      }

      if (viewMode === "daily" && dateFilter) {
        params.date = dateFilter;
      } else if (viewMode === "monthly" && monthFilter && yearFilter) {
        params.month = monthFilter;
        params.year = yearFilter;
      }

      const endpoint =
        viewMode === "daily"
          ? "/api/student-attendance/pg"
          : "/api/student-attendance/summary";

      const res = await axios.get(endpoint, { params });
      setAttendances(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError("No records found");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    // Determine class and section to use
    let targetClass, targetSection;

    if (classTeacherInfo) {
      // For class teachers - use their assigned class/section
      targetClass = classTeacherInfo.class;
      targetSection = classTeacherInfo.section;
    } else if (selectedClass && selectedSection) {
      // For admins - use selected class/section
      targetClass = selectedClass;
      targetSection = selectedSection;
    } else {
      return; // No class/section selected
    }

    try {
      setLoading(true);
      setError(null);

      // First fetch students for the class/section using the filter API
      const studentsResponse = await axios.get(
        `${
          ""
        }/api/student/filter-by-class?studentClass=${targetClass}&studentSection=${targetSection}&page=1`
      );

      if (studentsResponse.data.success) {
        const students = studentsResponse.data.data;

        // Then fetch attendance for these students
        const params = { page };
        params.class = targetClass;
        params.section = targetSection;

        if (viewMode === "daily" && dateFilter) {
          params.date = dateFilter;
        } else if (viewMode === "monthly" && monthFilter && yearFilter) {
          params.month = monthFilter;
          params.year = yearFilter;
        }

        const endpoint =
          viewMode === "daily"
            ? "/api/student-attendance/pg"
            : "/api/student-attendance/summary";

        const attendanceResponse = await axios.get(endpoint, { params });
        setAttendances(attendanceResponse.data.data || []);
        setTotalPages(attendanceResponse.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("No records found");
    } finally {
      setLoading(false);
    }
  };

  const shareOnWhatsApp = () => {
    if (viewMode !== "monthly") {
      toast.error("Sharing is only available in monthly view");
      return;
    }

    if (attendances.length === 0) {
      toast.error("No data available to share");
      return;
    }
    const userRole = localStorage.getItem("role");
    const secondaryRole = localStorage.getItem("secondaryRole");
    const isAdmin =
      userRole === "Admin" ||
      (secondaryRole && secondaryRole.includes("Admin"));
    const classNameForFilename = isAdmin ? selectedClass : teacherClasses;
    const sectionNameForFilename = isAdmin ? selectedSection : teacherSection;
    try {
      // Create title based on filters
      let title = "Student Attendance Report";
      if (selectedClass) {
        title += ` for Class ${classNameForFilename}`;
        if (selectedSection) {
          title += `-${sectionNameForFilename}`;
        }
      }

      const monthName = new Date(0, monthFilter - 1).toLocaleString("default", {
        month: "long",
      });
      title += ` for ${monthName} ${yearFilter}`;

      // Format the current attendances data for WhatsApp with better UI
      const rows = attendances.map((record) => {
        const name = record.name || record.student?.name || "";
        const rollNumber =
          record.rollNumber || record.student?.rollNumber || "";
        const present = record.presentCount || 0;
        const absent = record.absentCount || 0;
        const total = present + absent;

        return {
          name,
          rollNumber,
          present,
          absent,
          total,
        };
      });

      // Convert to CSV-like format
      const lines = ["Name,Roll Number,Present,Absent,Total Days"];

      rows.forEach((row) => {
        lines.push(
          `${row.name},${row.rollNumber},${row.present},${row.absent},${row.total}`
        );
      });

      // Calculate column widths for better formatting
      const csvLines = lines.map((line) => line.split(","));
      const colWidths = [];

      // Find the maximum width for each column
      csvLines[0].forEach((_, colIndex) => {
        colWidths.push(
          Math.max(
            ...csvLines.map((row) => (row[colIndex] || "").toString().length)
          )
        );
      });

      // Format rows with padding
      const formatRow = (row) =>
        row
          .map((cell, i) => (cell || "").toString().padEnd(colWidths[i]))
          .join("  ");

      const formattedTable = csvLines.map(formatRow).join("\n");

      const message =
        `${title}\n\n` +
        "```" + // WhatsApp code block
        `\n${formattedTable}\n` +
        "```";

      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
    } catch (error) {
      console.error("Error sharing data:", error);
      toast.error("Failed to share data");
    }
  };

  const exportToCSV = () => {
    if (attendances.length === 0) {
      toast.error("No data available to export");
      return;
    }

    try {
      let csvRows = [];

      if (viewMode === "monthly") {
        const headers = [
          "Name",
          "Roll Number",
          "Class",
          "Section",
          "Present",
          "Absent",
          "Total Days",
        ];
        csvRows.push(headers);

        attendances.forEach((record) => {
          const name = record.name || record.student?.name || "";
          const rollNumber =
            record.rollNumber || record.student?.rollNumber || "";
          const className =
            record.studentClass || record.class || selectedClass || "";
          const section =
            record.studentSection || record.section || selectedSection || "";
          const present = record.presentCount || 0;
          const absent = record.absentCount || 0;
          const total = present + absent;

          csvRows.push([
            name,
            rollNumber,
            className,
            section,
            present,
            absent,
            total,
          ]);
        });
      } else if (viewMode === "daily") {
        const headers = ["Name", "Roll Number", "Class", "Section", "Status"];
        csvRows.push(headers);

        attendances.forEach((record) => {
          const name = record.name || record.student?.name || "";
          const rollNumber =
            record.rollNumber || record.student?.rollNumber || "";
          const className =
            record.studentClass || record.class || selectedClass || "";
          const section =
            record.studentSection || record.section || selectedSection || "";
          const status = record.status || "-";

          csvRows.push([name, rollNumber, className, section, status]);
        });
      } else {
        toast.error("Export is only available in monthly or daily view");
        return;
      }

      // Convert to CSV string
      const csvContent = csvRows
        .map((row) =>
          row
            .map((cell) =>
              typeof cell === "string" ? `"${cell.replace(/"/g, '""')}"` : cell
            )
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // Filename based on viewMode
      let filename = "student_attendance";
      const userRole = localStorage.getItem("role");
      const secondaryRole = localStorage.getItem("secondaryRole");
      const isAdmin =
        userRole === "Admin" ||
        (secondaryRole && secondaryRole.includes("Admin"));

      // Use selectedClass/selectedSection if admin, else use teacherClasses
      const classNameForFilename = isAdmin ? selectedClass : teacherClasses;
      const sectionNameForFilename = isAdmin ? selectedSection : teacherSection;

      if (classNameForFilename) {
        filename += `_class${classNameForFilename}`;
        if (sectionNameForFilename) {
          filename += `_section${sectionNameForFilename}`;
        }
      }
      if (viewMode === "monthly") {
        const monthName = new Date(0, monthFilter - 1).toLocaleString(
          "default",
          {
            month: "short",
          }
        );
        filename += `_${monthName}${yearFilter}`;
      } else if (viewMode === "daily") {
        const today = new Date();
        const formattedDate = today.toLocaleDateString("en-CA"); // YYYY-MM-DD
        filename += `_daily_${formattedDate}`;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [
    page,
    dateFilter,
    monthFilter,
    yearFilter,
    viewMode,
    selectedClass,
    selectedSection,
    classTeacherInfo,
  ]);

  const generateWeeklyReport = async (studentId) => {
    try {
      const today = new Date();

      // Generate list of past 7 calendar days including today
      const pastWeekDates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        pastWeekDates.push(date);
      }

      // Reverse to make it oldest → newest
      pastWeekDates.reverse();

      // Filter out Sundays
      const validDates = pastWeekDates.filter((date) => date.getDay() !== 0);

      // Start date is the first valid date (earliest day, not Sunday)
      const formattedStartDate = validDates[0].toISOString().split("T")[0];

      toast.loading("Generating report...");

      const response = await axios.get(
        `${
          ""
        }/api/student-attendance/student/weekly-report`,
        {
          params: {
            studentId,
            startDate: formattedStartDate,
          },
          responseType: "json",
        }
      );

      toast.dismiss();

      if (response.data && response.data.success) {
        const { student, reportPeriod, dailyReport, summary } =
          response.data.data;

        let message = `*Weekly Attendance Report*\n\n`;
        message += `*Student:* ${student.name} (${student.rollNumber})\n`;
        message += `*Class:* ${student.class}-${student.section}\n`;
        message += `*Period:* ${reportPeriod.from} to ${reportPeriod.to}\n\n`;

        message += `*Daily Attendance:*\n`;

        // Exclude Sundays from report display
        const filteredReport = dailyReport.filter((day) => {
          const dayDate = new Date(day.date);
          return dayDate.getDay() !== 0;
        });

        filteredReport.forEach((day) => {
          message += `${day.day} (${day.date}): ${day.status}\n`;
        });

        // Count Present/Absent only for non-Sunday days
        const presentCount = filteredReport.filter(
          (d) => d.status === "Present"
        ).length;
        const absentCount = filteredReport.filter(
          (d) => d.status === "Absent"
        ).length;

        message += `\n*Summary:*\n`;
        message += `Present: ${presentCount} days\n`;
        message += `Absent: ${absentCount} days\n`;

        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");

        toast.success("Report shared to WhatsApp");
      } else {
        toast.error("Failed to generate report");
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error generating weekly report:", error);
      toast.error("Failed to generate weekly report");
    }
  };

  const handleClassChange = (e) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);

    // Update available sections for the selected class
    const selectedClassObj = assignedClasses.find(
      (cls) => cls.value === newClass
    );
    const sections = selectedClassObj?.sections || [];
    setAvailableSections(sections);

    // Reset or set default section
    setSelectedSection(sections.length > 0 ? sections[0].value : "");
    setPage(1);
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
    setPage(1);
  };

  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
    setPage(1);
  };

  const handleMonthChange = (e) => {
    setMonthFilter(e.target.value);
    setPage(1);
  };

  const handleYearChange = (e) => {
    setYearFilter(e.target.value);
    setPage(1);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "daily" ? "monthly" : "daily");
    setPage(1);
  };

  const shareDailyAttendanceReportA = () => {
    if (attendances.length === 0) {
      toast.error("No attendance data to share");
      return;
    }

    if (viewMode !== "daily") {
      toast.error("Daily report sharing is only available in daily view");
      return;
    }

    const midIndex = Math.ceil(attendances.length / 2);
    const attendancesA = attendances.slice(0, midIndex);

    const presentStudents = attendancesA.filter(
      (record) => record.status === "Present"
    );
    const absentStudents = attendancesA.filter(
      (record) => record.status === "Absent"
    );

    const firstRecord = attendancesA[0];
    const className =
      firstRecord.studentClass || firstRecord.class || teacherClasses || "";
    const section =
      firstRecord.studentSection || firstRecord.section || teacherSection || "";

    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin =
      user?.role === "Admin" || user?.secondaryRole?.includes("Admin");

    let message = `*Daily Attendance Report*\n`;
    if (!isAdmin) {
      message += `*Class:* ${className}-A\n`;
    }

    message += `*Date:* ${new Date(dateFilter).toLocaleDateString(
      "en-IN"
    )}\n\n`;
    message += `*Total Students:* ${attendancesA.length}\n`;
    message += `*Present:* ${presentStudents.length}\n`;
    message += `*Absent:* ${absentStudents.length}\n\n`;

    if (presentStudents.length > 0) {
      message += `*Present Students:*\n`;
      presentStudents.forEach((student, index) => {
        message += `${index + 1}. ${
          student.name || student.student?.name
        } (Roll: ${student.rollNumber || student.student?.rollNumber})\n`;
      });
      message += `\n`;
    }

    if (absentStudents.length > 0) {
      message += `*Absent Students:*\n`;
      absentStudents.forEach((student, index) => {
        message += `${index + 1}. ${
          student.name || student.student?.name
        } (Roll: ${student.rollNumber || student.student?.rollNumber})\n`;
      });
    } else {
      message += `*All students are present today!*\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const shareDailyAttendanceReportB = () => {
    if (attendances.length === 0) {
      toast.error("No attendance data to share");
      return;
    }

    if (viewMode !== "daily") {
      toast.error("Daily report sharing is only available in daily view");
      return;
    }

    const midIndex = Math.ceil(attendances.length / 2);
    const attendancesB = attendances.slice(midIndex);

    const presentStudents = attendancesB.filter(
      (record) => record.status === "Present"
    );
    const absentStudents = attendancesB.filter(
      (record) => record.status === "Absent"
    );

    const firstRecord = attendancesB[0];
    const className =
      firstRecord.studentClass || firstRecord.class || teacherClasses || "";
    const section =
      firstRecord.studentSection || firstRecord.section || teacherSection || "";

    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin =
      user?.role === "Admin" || user?.secondaryRole?.includes("Admin");

    let message = `*Daily Attendance Report*\n`;
    if (!isAdmin) {
      message += `*Class:* ${className}-B\n`;
    }

    message += `*Date:* ${new Date(dateFilter).toLocaleDateString(
      "en-IN"
    )}\n\n`;
    message += `*Total Students:* ${attendancesB.length}\n`;
    message += `*Present:* ${presentStudents.length}\n`;
    message += `*Absent:* ${absentStudents.length}\n\n`;

    if (presentStudents.length > 0) {
      message += `*Present Students:*\n`;
      presentStudents.forEach((student, index) => {
        message += `${index + 1}. ${
          student.name || student.student?.name
        } (Roll: ${student.rollNumber || student.student?.rollNumber})\n`;
      });
      message += `\n`;
    }

    if (absentStudents.length > 0) {
      message += `*Absent Students:*\n`;
      absentStudents.forEach((student, index) => {
        message += `${index + 1}. ${
          student.name || student.student?.name
        } (Roll: ${student.rollNumber || student.student?.rollNumber})\n`;
      });
    } else {
      message += `*All students are present today!*\n`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  if (!hasClassTeacherAccess) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        {/* <Toaster draggable={true} position="top-right" /> */}
        <div className="max-w-6xl mx-auto bg-white shadow p-6 rounded-lg">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">
              Only teachers assigned as class teachers can access student
              attendance management.
            </p>
            <button
              onClick={() => navigate.back()}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* <Toaster draggable={true} position="top-right" /> */}
      <div className="max-w-6xl mx-auto bg-white shadow p-6 rounded-lg">
        {/* Show class selection for Admin only */}
        {!classTeacherInfo && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={handleClassChange}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  {assignedClasses.map((cls) => (
                    <option key={cls._id || cls.value} value={cls.value}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Section
                </label>
                <select
                  value={selectedSection}
                  onChange={handleSectionChange}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sections</option>
                  {availableSections.map((section) => (
                    <option
                      key={section._id || section.value}
                      value={section.value}
                    >
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold">Student Attendance</h2>
          <p className="text-gray-600">Class: {classTeacherInfo?.class}</p>
        </div>
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
        {/* Date/Month Filters */}
        <div className="flex-1 flex flex-wrap gap-4">
          {viewMode === "daily" ? (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={handleDateChange}
                  className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={monthFilter}
                  onChange={handleMonthChange}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={yearFilter}
                  onChange={handleYearChange}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() =>
                navigate.push(
                  `/manage-attendence-student?class=${classTeacherInfo?.class}&section=${classTeacherInfo?.section}`
                )
              }
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Take Attendance
            </button>
            {viewMode === "monthly" && (
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Export CSV
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                  </svg>
                  Share on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Class Selection Dropdown */}
            {/* <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Class</option>
                {assignedClasses.map((cls) => (
                  <option key={cls._id || cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Section Selection Dropdown */}
            {/* <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Section
              </label>
              <select
                value={selectedSection}
                onChange={handleSectionChange}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedClass || availableSections.length === 0}
              >
                <option value="">All Sections</option>
                {availableSections.map((section) => (
                  <option
                    key={section._id || section.value}
                    value={section.value}
                  >
                    {section.label}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Date/Month Filters */}
            {/* <div className="flex-1 flex flex-wrap gap-4">
              {viewMode === "daily" ? (
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={handleDateChange}
                      className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Month
                    </label>
                    <select
                      value={monthFilter}
                      onChange={handleMonthChange}
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Month</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString("default", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year
                    </label>
                    <select
                      value={yearFilter}
                      onChange={handleYearChange}
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - 5 + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </>
              )}
              </div> */}
          </div>
          {/* Toggle Button */}
          <div>
            <label className="block text-sm font-medium mt-4 text-gray-700 mb-1">
              View
            </label>
            <button
              onClick={toggleViewMode}
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                viewMode === "daily"
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              } font-medium flex items-center gap-2`}
            >
              {viewMode === "daily" ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Monthly View
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  Daily View
                </>
              )}
            </button>
          </div>
        </div>

        {viewMode === "daily" && (
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
            {/* Left Stat Boxes */}
            <div className="flex gap-4">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow text-center min-w-[100px]">
                <p className="text-sm font-medium">Present</p>
                <p className="text-xl font-bold">
                  {attendances.filter((s) => s.status === "Present").length}
                </p>
              </div>

              <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow text-center min-w-[100px]">
                <p className="text-sm font-medium">Absent</p>
                <p className="text-xl font-bold">
                  {attendances.filter((s) => s.status === "Absent").length}
                </p>
              </div>
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow text-center min-w-[100px]">
                <p className="text-sm font-medium">Total</p>
                <p className="text-xl font-bold">
                  {attendances.filter((s) => s.status === "Present").length +
                    attendances.filter((s) => s.status === "Absent").length}
                </p>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={shareDailyAttendanceReportA}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                </svg>
                <span>Share Daily Report Section A</span>
              </button>
              <button
                onClick={shareDailyAttendanceReportB}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                </svg>
                <span>Share Daily Report Section B</span>
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934..." />
                </svg>
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading attendance...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : attendances.length === 0 ? (
          <p className="text-center text-gray-500">
            No attendance records available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left border">#</th>
                  <th className="p-2 text-left border">Name</th>
                  <th className="p-2 text-left border">Roll Number</th>
                  {viewMode === "daily" ? (
                    <>
                      <th className="p-2 text-left border">Status</th>
                      <th className="p-2 text-left border">Date</th>
                    </>
                  ) : (
                    <>
                      <th className="p-2 text-left border">Present</th>
                      <th className="p-2 text-left border">Absent</th>
                      <th className="p-2 text-left border">Total Days</th>
                    </>
                  )}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((record, index) => (
                  <tr key={record._id || index} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td className="p-2 border">
                      {record.name || record.student?.name}
                    </td>
                    <td className="p-2 border">
                      {record.rollNumber || record.student?.rollNumber}
                    </td>

                    {viewMode === "daily" ? (
                      <>
                        <td
                          className={`p-2 border ${
                            record.status === "Present"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {record.status}
                        </td>
                        <td className="p-2 border">
                          {record.date
                            ? new Date(record.date).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2 border text-green-600">
                          {record.presentCount || 0}
                        </td>
                        <td className="p-2 border text-red-600">
                          {record.absentCount || 0}
                        </td>
                        <td className="p-2 border font-medium">
                          {(record.presentCount || 0) +
                            (record.absentCount || 0)}
                        </td>
                      </>
                    )}
                    {/* <td className="p-2 border">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Use the student field from the record
                          const studentId = record.student;
                          generateWeeklyReport(studentId);
                        }}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Weekly Report
                      </button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                disabled={page === 1}
              >
                Prev
              </button>

              <span className="text-gray-700">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                disabled={page === totalPages}
              >
                Next
              </button>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
