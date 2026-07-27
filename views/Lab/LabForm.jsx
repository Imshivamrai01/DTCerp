"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from 'next/navigation';

const LabForm = ({ onLabCreated }) => {
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("User"));

  const [formData, setFormData] = useState({
    assignedBy: user?.name || "",
    assignedDate: "",
    assignedClass: user?.assignedSubjects?.[0]?.class.value || "",
    assignedSection: user?.assignedSubjects?.[0]?.section.value || "",
    inchargeName: "",
    practicalDescription: "",
  });

  const [classOptions, setClassOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [inchargeOptions, setInchargeOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingIncharge, setIsLoadingIncharge] = useState(false);
  const navigate = useRouter();

  // Fetch incharge options from API
  useEffect(() => {
    const fetchInchargeOptions = async () => {
      setIsLoadingIncharge(true);
      try {
        const response = await axios.get(
          "/api/user/filter-lab"
        );
        if (response.data && Array.isArray(response.data)) {
          setInchargeOptions(response.data);
        }
      } catch (error) {
        console.error("Error fetching incharge options:", error);
        toast.error("Failed to load lab incharge options");
      } finally {
        setIsLoadingIncharge(false);
      }
    };

    fetchInchargeOptions();
  }, []);

  // When user or assignedSubjects change — setup classOptions and initial sections
  useEffect(() => {
    if (!user?.assignedSubjects) return;

    // Filter IT subjects
    const itSubjects = user.assignedSubjects.filter(
      (sub) => sub.subject?.value === "IT"
    );

    // Get unique classes (deduplicate by value)
    const classMap = new Map();
    itSubjects.forEach((sub) => {
      if (sub.class?.value) {
        classMap.set(sub.class.value, sub.class);
      }
    });
    const classes = Array.from(classMap.values());

    if (JSON.stringify(classes) !== JSON.stringify(classOptions)) {
      setClassOptions(classes);
    }

    // Set initial sections for first class (if formData.assignedClass not set)
    if (classes.length > 0 && !formData.assignedClass) {
      const firstClassValue = classes[0].value;

      const sectionMap = new Map();
      itSubjects
        .filter((sub) => sub.class.value === firstClassValue)
        .forEach((sub) => {
          if (sub.section?.value) {
            sectionMap.set(sub.section.value, sub.section);
          }
        });

      const initialSections = Array.from(sectionMap.values());

      if (JSON.stringify(initialSections) !== JSON.stringify(sectionOptions)) {
        setSectionOptions(initialSections);
      }

      setFormData((prev) => ({
        ...prev,
        assignedClass: firstClassValue,
        assignedSection: initialSections[0]?.value || null,
      }));
    }
  }, [user]);

  // Update sections when class changes
  useEffect(() => {
    if (!user?.assignedSubjects || !formData.assignedClass) return;

    const itSubjects = user.assignedSubjects.filter(
      (sub) => sub.subject?.value === "IT"
    );

    const sectionMap = new Map();
    itSubjects
      .filter((sub) => sub.class.value === formData.assignedClass)
      .forEach((sub) => {
        if (sub.section?.value) {
          sectionMap.set(sub.section.value, sub.section);
        }
      });

    const sections = Array.from(sectionMap.values());

    if (JSON.stringify(sections) !== JSON.stringify(sectionOptions)) {
      setSectionOptions(sections);
    }

    // Reset assignedSection if it does not exist in the new sections list
    if (
      sections.length > 0 &&
      !sections.some((s) => s.value === formData.assignedSection)
    ) {
      setFormData((prev) => ({
        ...prev,
        assignedSection: sections[0].value,
      }));
    }
  }, [formData.assignedClass, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "/api/lab",
        formData
      );

      if (response.data && response.data.success !== false) {
        toast.success("Lab assignment created successfully!");
        navigate.push("/list-lab");
      } else {
        console.error("Server reported error:", response.data);
        toast.warning(
          "Lab assignment was created but there was a server response issue"
        );
      }
    } catch (error) {
      console.error("Error creating lab:", error);
      if (error.response) {
        if (error.response.status === 409) {
          toast.error("This lab assignment already exists");
        } else {
          toast.error(
            `Failed to create lab assignment: ${
              error.response.data.message || "Server error"
            }`
          );
        }
      } else if (error.request) {
        toast.error("Network error - please check your connection");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto"
    >
      <div className="p-4 flex justify-end">
        <button
          type="button"
          onClick={() => navigate.push("/list-lab")}
          className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-medium px-4 py-2 rounded-md transition"
        >
          &larr; Back
        </button>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Add New Lab Work
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="assignedBy"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Assigned By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="assignedBy"
            name="assignedBy"
            value={formData.assignedBy}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            readOnly
          />
        </div>

        <div>
          <label
            htmlFor="assignedDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="assignedDate"
            name="assignedDate"
            value={formData.assignedDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="assignedClass"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Class <span className="text-red-500">*</span>
          </label>
          <select
            id="assignedClass"
            name="assignedClass"
            value={formData.assignedClass}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {classOptions.map((classOption) => (
              <option key={classOption.value} value={classOption.value}>
                {classOption.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="assignedSection"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Section <span className="text-red-500">*</span>
          </label>
          <select
            id="assignedSection"
            name="assignedSection"
            value={formData.assignedSection}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={sectionOptions.length === 0}
          >
            {sectionOptions.length > 0 ? (
              sectionOptions.map((section) => (
                <option key={section.value} value={section.value}>
                  {section.label}
                </option>
              ))
            ) : (
              <option value="">No sections available</option>
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="inchargeName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Assigned To <span className="text-red-500">*</span>
          </label>
          <select
            id="inchargeName"
            name="inchargeName"
            value={formData.inchargeName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={isLoadingIncharge}
          >
            <option value="">Select Lab Incharge</option>
            {inchargeOptions.map((incharge) => (
              <option key={incharge._id} value={incharge.name}>
                {incharge.name}
              </option>
            ))}
          </select>
          {isLoadingIncharge && (
            <p className="text-sm text-gray-500 mt-1">
              Loading incharge options...
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="practicalDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="practicalDescription"
            name="practicalDescription"
            placeholder="Enter practical description (optional)"
            value={formData.practicalDescription}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`mt-6 w-full px-4 py-2 text-white font-medium rounded-md transition-colors ${
          isSubmitting
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Add Lab Work"}
      </button>
    </form>
  );
};

export default LabForm;
