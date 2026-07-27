"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from 'next/navigation';
import { format, parseISO } from "date-fns";

const EditHomework = () => {
  const { id } = useParams();
  const navigate = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [homework, setHomework] = useState({
    className: "",
    section: "",
    subject: "",
    description: "",
    dueDate: format(new Date(), "yyyy-MM-dd"),
  });

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("User"));
  const assignedSubjects = userData?.assignedSubjects || [];

  // Get available classes (unique)
  const classes = [...new Set(assignedSubjects.map((sub) => sub.class.value))];

  // Get sections based on selected class
  const getSectionsForClass = (className) => {
    return [
      ...new Set(
        assignedSubjects
          .filter((sub) => sub.class.value === className)
          .map((sub) => sub.section.value)
      ),
    ];
  };

  // Get subjects based on selected class and section
  const getSubjectsForClassAndSection = (className, section) => {
    return assignedSubjects
      .filter(
        (sub) => sub.class.value === className && sub.section.value === section
      )
      .map((sub) => sub.subject.value);
  };

  // State for available sections and subjects based on selection
  const [availableSections, setAvailableSections] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/homework/specific/${id}`
        );
        const hw = response.data.data;

        setHomework({
          className: hw.className,
          section: hw.section,
          subject: hw.subject,
          description: hw.description,
          dueDate: format(parseISO(hw.dueDate), "yyyy-MM-dd"),
        });

        // Set available sections and subjects based on the fetched homework
        const sections = getSectionsForClass(hw.className);
        setAvailableSections(sections);

        const subjects = getSubjectsForClassAndSection(
          hw.className,
          hw.section
        );
        setAvailableSubjects(subjects);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch homework");
      } finally {
        setLoading(false);
      }
    };

    fetchHomework();
  }, [id]);

  const handleClassChange = (e) => {
    const className = e.target.value;
    const sections = getSectionsForClass(className);

    setHomework((prev) => ({
      ...prev,
      className,
      section: "", // Reset section when class changes
      subject: "", // Reset subject when class changes
    }));

    setAvailableSections(sections);
    setAvailableSubjects([]);
  };

  const handleSectionChange = (e) => {
    const section = e.target.value;
    const subjects = getSubjectsForClassAndSection(homework.className, section);

    setHomework((prev) => ({
      ...prev,
      section,
      subject: "", // Reset subject when section changes
    }));

    setAvailableSubjects(subjects);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHomework((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.put(
        `/api/homework/${id}`,
        homework
      );

      setSuccess("Homework updated successfully!");
      setTimeout(() => {
        navigate.push("/homework");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update homework");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this homework?")) {
      try {
        setLoading(true);
        await axios.delete(
          `/api/homework/${id}`
        );
        navigate.push("/homework");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete homework");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Homework</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate.push("/homework")}
        >
          Back to Homework
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class
            </label>
            <select
              name="className"
              value={homework.className}
              onChange={handleClassChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Class</option>
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
              name="section"
              value={homework.section}
              onChange={handleSectionChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
              disabled={!homework.className}
            >
              <option value="">Select Section</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              name="subject"
              value={homework.subject}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
              disabled={!homework.section}
            >
              <option value="">Select Subject</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={homework.dueDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={homework.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows="4"
            required
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-300"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>

          <div className="space-x-2">
            <button
              type="button"
              onClick={() => navigate.push("/homework")}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Homework"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditHomework;
