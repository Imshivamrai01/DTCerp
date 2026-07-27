"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./notification.css";

const UpdateWork = () => {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [actualDate, setActualDate] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const teacherId = localStorage.getItem("id");

  const hasRole = (requireRole) => {
    if (typeof window === "undefined") return false;
    const primaryRole = localStorage.getItem("role");
    const secondaryRole = localStorage.getItem("secondaryRole");
    return primaryRole === requireRole || secondaryRole === requireRole;
  };

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const getDate = `${year}-${month}-${day}`;

  useEffect(() => {
    fetchAssignments();
  }, [currentPage]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${
          ""
        }/api/coordinator-assignment/teacher?teacherId=${teacherId}&page=${currentPage}`
      );
      if (response.data.success) {
        setAssignments(response.data.data);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.total);

      }
    } catch (error) {
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (assignmentId) => {
    if (!actualDate) {
      toast.error("Please select actual submission date!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${
          ""
        }/api/coordinator-assignment/submission/${assignmentId}`,
        {
          actualSubmissionDate: actualDate,
        }
      );
      if (response.data.success) {
        toast.success("Work updated successfully!");
        fetchAssignments();
        setActualDate("");
        setSelectedId("");
      } else {
        toast.error(response.data.message || "Failed to update work");
      }
    } catch (error) {
      console.error("Error updating work:", error);
      toast.error("Error updating work");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Work Assignments</h1>
      </div>
      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.filter(a => !a.actualSubmissionDate).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending work assignments found.</p>
            </div>
          ) : (
            assignments.filter(a => !a.actualSubmissionDate).map((assignment) => (
              <div
                key={assignment._id}
                className="card bg-base-100 shadow-xl mb-4"
              >
                <div className="card-body">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {/* <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-xs">
                          Teacher
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={assignment.teacherName}
                        disabled
                      />
                    </div> */}

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-xs">
                          Class
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={assignment.class}
                        readOnly
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-xs">
                          Section
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={assignment.section}
                        readOnly
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-xs">
                          Subject
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={assignment.subject || ""}
                        readOnly
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-xs">
                          Work Type
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={
                          Array.isArray(assignment.assignedWorkType)
                            ? assignment.assignedWorkType.join(", ")
                            : assignment.assignedWorkType || ""
                        }
                        readOnly
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-xs">
                          Projected Date
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered input-sm"
                        value={
                          assignment.projectedDate
                            ? assignment.projectedDate.split("T")[0]
                            : ""
                        }
                        readOnly
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-xs">
                          Coordinator
                        </span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={assignment.coordinatorName}
                        readOnly
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-xs">
                          Assigned Date
                        </span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered input-sm"
                        value={
                          assignment.assignedDate
                            ? assignment.assignedDate.split("T")[0]
                            : ""
                        }
                        readOnly
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold text-xs">
                          Actual Date
                        </span>
                      </label>
                      {assignment.actualSubmissionDate ? (
                        <input
                          type="date"
                          className="input input-bordered input-sm"
                          value={assignment.actualSubmissionDate.split("T")[0]}
                          disabled
                        />
                      ) : (
                        <input
                          type="date"
                          className="input input-bordered input-sm"
                          value={
                            selectedId === assignment._id ? actualDate : ""
                          }
                          min={
                            hasRole("Teacher") &&
                            !hasRole("Admin") &&
                            !hasRole("Senior Coordinator") &&
                            !hasRole("Junior Coordinator")
                              ? getDate
                              : undefined
                          }
                          onChange={(e) => {
                            setSelectedId(assignment._id);
                            setActualDate(e.target.value);
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    {assignment.actualSubmissionDate ? (
                      <span className="badge badge-success">Updated</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdate(assignment._id)}
                        disabled={
                          loading ||
                          selectedId !== assignment._id ||
                          !actualDate
                        }
                      >
                        {loading ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          "Update"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UpdateWork;
