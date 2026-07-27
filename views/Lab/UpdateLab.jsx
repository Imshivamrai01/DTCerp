"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';

const UpdateLab = () => {
  const { id } = useParams();
  const navigate = useRouter();
  const [formData, setFormData] = useState({
    assignedBy: "",
    assignedDate: "",
    assignedClass: "",
    assignedSection: "",
    inchargeName: "",
    practicalDescription: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLab = async () => {
      try {
        const { data } = await axios.get(
          `/api/lab/${id}`
        );
        setFormData({
          assignedBy: data.assignedBy,
          assignedDate: formatDateForInput(data.assignedDate),
          assignedClass: data.assignedClass,
          assignedSection: data.assignedSection,
          inchargeName: data.inchargeName,
          practicalDescription: data.practicalDescription,
        });
      } catch (err) {
        setError("Failed to fetch lab assignment");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLab();
  }, [id]);

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.put(
        `/api/lab/${id}`,
        formData
      );
      navigate.push("/list-lab"); // Redirect to lab list after successful update
    } catch (err) {
      setError("Failed to update lab assignment");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Update Lab Assignment
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
      >
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
              onChange={handleChange}
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
            <input
              type="text"
              id="assignedClass"
              name="assignedClass"
              value={formData.assignedClass}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly
            />
          </div>

          <div>
            <label
              htmlFor="assignedClass"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Class Section<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="assignedClass"
              name="assignedClass"
              value={formData.assignedSection}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly
            />
          </div>
          <div>
            <label
              htmlFor="inchargeName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Incharge Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="inchargeName"
              name="inchargeName"
              value={formData.inchargeName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              readOnly
            />
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
              value={formData.practicalDescription}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={() => navigate.push("/list-lab")}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-white font-medium rounded-md ${
              isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Updating..." : "Update Lab"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateLab;
