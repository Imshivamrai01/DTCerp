"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';

const TeacherAttendance = () => {
  const navigate = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  });
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get(
          "/api/user/all"
        );
        // Filter teachers if needed, assuming the API returns all users
        const filteredTeachers = res.data.data.filter(
          (teacher) =>
            teacher.role === "Teacher" || teacher.secondaryRole === "Teacher"
        );
        setCount(filteredTeachers.length);
        if (filteredTeachers.length === 0) {
          toast.error("No teachers found. Please add teachers first.");
          return;
        }
        setTeachers(filteredTeachers);

        // Initialize all teachers as Present by default
        const defaultStatus = {};
        filteredTeachers.forEach((teacher) => {
          defaultStatus[teacher._id] = "Present";
        });
        setAttendanceStatus(defaultStatus);
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
        toast.error("Error fetching teachers. Please try again later.");
      }
    };

    fetchTeachers();
  }, []);

  const handleStatusChange = (teacherId, status) => {
    setAttendanceStatus((prev) => ({ ...prev, [teacherId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      toast.error("Please select a date before submitting.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    let updateCount = 0;
    let createCount = 0;
    let errorCount = 0;

    const submissionPromises = teachers.map(async (teacher) => {
      const status = attendanceStatus[teacher._id] || "Present"; // Default to Present if somehow undefined

      try {
        // Try updating
        await axios.put(
          "/api/teacher-attendance/update",
          {
            teacher: teacher._id,
            date: selectedDate,
            status,
          }
        );
        updateCount++;
        return `${teacher.name} updated`;
      } catch (error) {
        if (error.response?.status === 404) {
          try {
            // Create if not found
            await axios.post(
              "/api/teacher-attendance",
              {
                teacher: teacher._id,
                name: teacher.name || 'Unknown',
                email: teacher.email || 'no-email@example.com',
                status,
                date: selectedDate,
              }
            );
            createCount++;
            return `${teacher.name} created`;
          } catch (postError) {
            console.error("Failed to create attendance:", postError);
            if (postError.response && postError.response.data) {
              console.error("Backend Error Details:", postError.response.data);
            }
            errorCount++;
            return `${teacher.name} failed`;
          }
        } else {
          errorCount++;
          return `${teacher.name} failed`;
        }
      }
    });

    try {
      const results = await Promise.all(submissionPromises);

      // Show summary toasts
      if (updateCount > 0) {
        toast.success(
          `${updateCount} attendance records updated successfully!`
        );
      }
      if (createCount > 0) {
        toast.success(
          `${createCount} attendance records created successfully!`
        );
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} records failed to process`);
      }
      if (updateCount > 0 || createCount > 0) {
        // Add a small delay to let the user see the success message
        setTimeout(() => {
          navigate.push("/display-attendence");
        }, 900);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting attendance. Please try again.");
      setMessage("Error submitting attendance. Please try again.");
    }

    setIsSubmitting(false);
  };

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

      <div className="max-w-4xl mx-auto bg-white shadow p-6 rounded-lg">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate.push("/display-attendence")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Teacher Attendance
        </h2>
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-3 w-fit">
            <div className="bg-indigo-100 text-indigo-600 rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M15 11a4 4 0 10-8 0 4 4 0 008 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Teachers</p>
              <p className="text-lg font-semibold text-gray-800">{count}</p>
            </div>
          </div>
        </div>

        <label className="block text-gray-700 mb-2">Select Date:</label>
        <input
          type="date"
          className="border border-gray-300 p-2 rounded w-full mb-4"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        {teachers.length === 0 ? (
          <p className="text-gray-500">Loading teachers...</p>
        ) : (
          teachers.map((teacher, index) => (
            <div
              key={teacher._id}
              className="flex items-center justify-between mb-4 border-b pb-2"
            >
              <div className="text-gray-800 w-1/2">
                <span className="font-medium text-gray-600 mr-2">
                  {index + 1}.
                </span>{" "}
                {teacher.name}
              </div>
              <div className="flex gap-4 w-1/2 justify-end">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={`attendance-${teacher._id}`}
                    value="Present"
                    checked={attendanceStatus[teacher._id] === "Present"}
                    onChange={() => handleStatusChange(teacher._id, "Present")}
                    className="accent-green-500"
                  />
                  <span className="text-sm">P</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={`attendance-${teacher._id}`}
                    value="Absent"
                    checked={attendanceStatus[teacher._id] === "Absent"}
                    onChange={() => handleStatusChange(teacher._id, "Absent")}
                    className="accent-red-500"
                  />
                  <span className="text-sm">A</span>
                </label>
              </div>
            </div>
          ))
        )}

        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          disabled={isSubmitting || !selectedDate}
        >
          {isSubmitting ? "Submitting..." : "Submit Attendance"}
        </button>

        {message && (
          <div className="mt-4 p-2 text-center text-sm font-medium text-green-600 bg-green-100 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
