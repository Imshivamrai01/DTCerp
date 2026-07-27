"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useRouter } from 'next/navigation';

const Homework = () => {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = useRouter();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("User")) || {};
  const teacherName = userData?.name;
  const userRole = userData?.role || "";
  const assignedSubjects = userData?.assignedSubjects || [];
  const assignedClasses = JSON.parse(localStorage.getItem("assignedClasses")) || [];
  const isClassTeacher = !!userData?.classTeacher;
  const classTeacherDetails = userData?.classTeacher || {};
  
  const isPrivilegedRole = ["Admin", "Senior Coordinator", "Junior Coordinator", "Principal"].includes(userRole);

  // Extract unique classes from assignedClasses
  const classes = assignedClasses.map(c => c.value);
  
  // Get sections for the selected class
  const getSectionsForClass = (className) => {
    const classObj = assignedClasses.find(c => c.value === className);
    return classObj && classObj.sections ? classObj.sections.map(s => s.value) : [];
  };

  // Set initial class and section
  useEffect(() => {
    if (assignedClasses.length > 0) {
      const initialClass = assignedClasses[0].value;
      setSelectedClass(initialClass);
      
      const initialSections = getSectionsForClass(initialClass);
      if (initialSections.length > 0) {
        setSelectedSection(initialSections[0]);
      }
    }
  }, []);

  const sections = selectedClass ? getSectionsForClass(selectedClass) : [];

  // Check if selected class/section matches class teacher's assignment
  const isClassTeacherViewingAssignedClass =
    isClassTeacher &&
    selectedClass === classTeacherDetails.class &&
    selectedSection === classTeacherDetails.section;

  const fetchHomework = async () => {
    if (!selectedClass || !selectedSection) return;

    try {
      setLoading(true);
      setError("");

      const dateString = format(currentDate, "yyyy-MM-dd");
      const response = await axios.get(
        "/api/homework/class",
        {
          params: {
            className: selectedClass,
            section: selectedSection,
            date: dateString,
          },
        }
      );

      // If user is class teacher, privileged role, show all homework
      // Otherwise, only show homework created by them
      const filteredHomework = (isClassTeacherViewingAssignedClass || isPrivilegedRole)
        ? response.data.data
        : response.data.data.filter((hw) => hw.teacherName === teacherName);

      setHomework(filteredHomework);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch homework");
      setHomework([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, [selectedClass, selectedSection, currentDate]);

  const handleClassChange = (e) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    
    // Automatically select first section of new class
    const newSections = getSectionsForClass(newClass);
    if (newSections.length > 0) {
      setSelectedSection(newSections[0]);
    } else {
      setSelectedSection("");
    }
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const handleDateChange = (date) => {
    setCurrentDate(date);
  };

  const handleShareOnWhatsApp = () => {
    // Format homework for sharing
    const formattedDate = format(currentDate, "MMMM dd, yyyy");
    let message = `*Homework for ${selectedClass}-${selectedSection} (${formattedDate})*\n\n`;

    homework.forEach((hw, index) => {
      message += `*${hw.subject}*\n`;
      message += `${hw.description}\n`;
      message += `Due: ${format(new Date(hw.dueDate), "MMM dd, yyyy")}\n`;
      message += `Assigned by: ${hw.teacherName}\n\n`;
    });

    // Encode message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Homework Assignments</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate.push("/add-homework")}
        >
          Add New Homework
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <select
              value={selectedSection}
              onChange={handleSectionChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={format(currentDate, "yyyy-MM-dd")}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={fetchHomework}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          {isClassTeacherViewingAssignedClass && homework.length > 0 && (
            <button
              onClick={handleShareOnWhatsApp}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Share on WhatsApp
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {homework.length === 0 && !loading && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No homework assignments found for the selected criteria.
        </div>
      )}

      <div className="w-full">
        {/* Header Row */}
        <div className="hidden sm:grid grid-cols-6 font-semibold text-gray-700 border-b border-gray-300 text-sm py-2 px-2 bg-gray-100">
          <div>Subject</div>
          <div>Description</div>
          <div>Due Date</div>
          <div>Class-Section</div>
          <div>Assigned By</div>
          <div>Actions</div>
        </div>

        {/* Data Rows */}
        {homework.map((hw) => (
          <div
            key={hw._id}
            className="grid grid-cols-1 sm:grid-cols-6 border-b border-gray-200 text-sm py-2 px-2 hover:bg-gray-50"
          >
            <div className="font-medium">{hw.subject}</div>
            <div className="whitespace-pre-line">{hw.description}</div>
            <div>{format(new Date(hw.dueDate), "MMM dd, yyyy")}</div>
            <div>
              {hw.className} - {hw.section}
            </div>
            <div>{hw.teacherName}</div>
            <div className="flex space-x-2">
              {hw.teacherName === teacherName && (
                <button
                  onClick={() => navigate.push(`/homework/${hw._id}`)}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homework;
