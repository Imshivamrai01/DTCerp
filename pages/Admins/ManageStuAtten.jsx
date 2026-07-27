"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useRouter } from 'next/navigation';

const ManageStuAtten = () => {
  const [attendances, setAttendances] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
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
  const navigate = useRouter();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page };

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
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async (shareOnWhatsApp = false) => {
    if (!monthFilter || !yearFilter) {
      toast.error("Please select both month and year");
      return;
    }

    try {
      const response = await axios.get(
        "/api/student-attendance/csv",
        {
          params: { month: monthFilter, year: yearFilter },
          responseType: "blob",
        }
      );

      if (shareOnWhatsApp) {
        const reader = new FileReader();
        reader.onload = () => {
          const csvText = reader.result;

          // Convert CSV lines
          const lines = csvText.trim().split("\n");
          const rows = lines.map((line) =>
            line
              .replace(/"/g, "") // remove quotes
              .split(",")
          );

          // Calculate column widths
          const colWidths = rows[0].map((_, i) =>
            Math.max(...rows.map((row) => (row[i] || "").length))
          );

          // Format rows with padding
          const formatRow = (row) =>
            row.map((cell, i) => (cell || "").padEnd(colWidths[i])).join("  ");

          const formattedTable = rows.map(formatRow).join("\n");

          const message =
            `Student Attendance Report for ${monthFilter}/${yearFilter}\n\n` +
            "```" + // WhatsApp code block
            `\n${formattedTable}\n` +
            "```";

          const encodedMessage = encodeURIComponent(message);
          const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
          window.open(whatsappUrl, "_blank");
        };

        reader.readAsText(response.data);
      } else {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `student_attendance_${monthFilter}_${yearFilter}.csv`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [page, dateFilter, monthFilter, yearFilter, viewMode]);

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* <Toaster draggable={true} position="top-right" /> */}
      <div className="max-w-6xl mx-auto bg-white shadow p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Student Attendance Records</h2>
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Toggle Button */}
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
          </div>
        </div>

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
                  <th className="p-2 text-left border">Class</th>
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
                </tr>
              </thead>
              <tbody>
                {attendances.map((record, index) => (
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
                    <td className="p-2 border">
                      {record.studentClass + "-" + record.studentSection}
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
                            ? new Date(record.date).toLocaleDateString()
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
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 flex justify-between items-center">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStuAtten;
