"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useRouter } from 'next/navigation';

const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

const LabList = () => {
  const [labs, setLabs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimeoutRef = useRef(null);
  const navigate = useRouter();
  const user = JSON.parse(localStorage.getItem("User"));

  // Check if user is admin or lab instructor
  const isAdmin = user?.role === "Admin" || user?.secondaryRole === "Admin";
  const isLabInstructor =
    user?.role === "Lab Instructor" || user?.secondaryRole === "Lab Instructor";
  const shouldHideButton = isAdmin || isLabInstructor;

  // Fetch labs from API with pagination
  const fetchLabs = async (page = 1, query = "") => {
    setIsLoading(true);
    try {
      let url = `/api/lab/pg?page=${page}`;
      if (query) {
        url = `/api/lab/search?q=${query}`;
      }

      const { data } = await axios.get(url);

      if (query) {
        setLabs(data.data);
        setTotalPages(1); // No pagination on search
      } else {
        setLabs(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching labs:", error);
      alert("Failed to fetch lab assignments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;

      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
      <nav className="mt-4 flex justify-center">
        <ul className="join">
          <li>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`px-4 py-2 rounded-md mx-1 ${
                isFirstPage
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              disabled={isFirstPage}
            >
              Previous
            </button>
          </li>

          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((number) => (
            <li key={number}>
              <button
                onClick={() => handlePageChange(number)}
                className={`px-4 py-2 mx-1 rounded-md ${
                  currentPage === number
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {number}
              </button>
            </li>
          ))}

          <li>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`px-4 py-2 mx-1 rounded-md ${
                isLastPage
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
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

  // Lab item actions
  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this lab assignment?")
    ) {
      try {
        await axios.delete(`/api/lab/${id}`);
        fetchLabs(currentPage);
        alert("Lab assignment deleted successfully!");
      } catch (error) {
        console.error("Error deleting lab:", error);
        alert("Failed to delete lab assignment");
      }
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await axios.patch(
        `/api/lab/${id}/acknowledge`
      );
      fetchLabs(currentPage);
      alert("Lab assignment acknowledged!");
    } catch (error) {
      console.error("Error acknowledging lab:", error);
      alert("Failed to acknowledge lab assignment");
    }
  };

  const handleSearch = (query = searchQuery) => {
    if (query.trim() !== "") {
      fetchLabs(1, query);
    } else {
      fetchLabs(currentPage);
    }
  };

  const debouncedSearch = debounce(handleSearch, 300);

  const handleChange = (e) => {
    const { value } = e.target;
    setSearchQuery(value);

    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      if (value.trim() !== "") {
        handleSearch(value);
      } else {
        fetchLabs(currentPage);
      }
    }, 300);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Lab Work Assignments
        </h2>
        {user?.role !== "Admin" && user?.secondaryRole !== "Admin" && (
          <button
            onClick={() => navigate.push("/assign-lab")}
            disabled={shouldHideButton}
            className={`px-4 py-2 rounded ${
              shouldHideButton
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Add New
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="form-control w-full relative my-4">
        <input
          className="input input-bordered"
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Search by assigned by or incharge name..."
        />
        {searchQuery && (
          <span
            onClick={() => {
              setSearchQuery("");
              fetchLabs(currentPage);
            }}
            className="badge cursor-pointer badge-error p-3 text-white absolute right-3 top-3"
          >
            x
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : labs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No lab assignments found</p>
          {user?.role !== "Admin" && user?.secondaryRole !== "Admin" && (
            <button
              onClick={() => navigate.push("/assign-lab")}
              disabled={shouldHideButton}
              className={`px-4 py-2 rounded ${
                shouldHideButton
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Add Your First Lab Work
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-3 px-4 border-b">Assigned By</th>
                  <th className="py-3 px-4 border-b">Date</th>
                  <th className="py-3 px-4 border-b">Class</th>
                  <th className="py-3 px-4 border-b">Assigned To</th>
                  <th className="py-3 px-4 border-b">Status</th>
                  {/* Hide "Actions" for Admin */}
                  {(user?.role === "Teacher" ||
                    user?.role === "Senior Coordinator" ||
                    user?.role === "Junior Coordinator" ||
                    isLabInstructor) && (
                    <th className="py-3 px-4 border-b">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {labs
                  .filter((lab) => {
                    if (isAdmin || isLabInstructor) return true;
                    return lab.assignedBy === user?.name;
                  })
                  .map((lab) => (
                    <tr key={lab._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{lab.assignedBy}</td>
                      <td className="py-3 px-4 border-b">
                        {format(new Date(lab.assignedDate), "MMM d, yyyy")}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {lab.assignedClass}
                      </td>
                      <td className="py-3 px-4 border-b">{lab.inchargeName}</td>
                      <td className="py-3 px-4 border-b">
                        {lab.isAcknowledged ? (
                          <span className="text-green-600">Acknowledged</span>
                        ) : (
                          <span className="text-yellow-600">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b space-x-2">
                        {/* Ack button - only for Lab Instructors */}
                        {isLabInstructor && (
                          <button
                            onClick={() => handleAcknowledge(lab._id)}
                            disabled={lab.isAcknowledged}
                            className={`px-3 py-1 rounded text-sm ${
                              lab.isAcknowledged
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            Ack
                          </button>
                        )}

                        {/* Edit/Delete buttons - for Teachers and Coordinators ONLY (NOT Admin) */}
                        {user?.role === "Teacher" ||
                        user?.role === "Senior Coordinator" ||
                        user?.role === "Junior Coordinator" ? (
                          <>
                            <button
                              onClick={() => navigate.push(`/update-lab/${lab._id}`)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(lab._id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default LabList;
