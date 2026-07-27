"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';

const WorkList = () => {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useRouter();
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    fetchAssignments();
  }, [currentPage]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      let url = "";

      if (role === "Teacher") {
        url = `${
          ""
        }/api/coordinator-assignment/teacher?teacherId=${userId}&page=${currentPage}`;
      } else if (
        role === "Senior Coordinator" ||
        role === "Junior Coordinator"
      ) {
        url = `${
          ""
        }/api/coordinator-assignment/all?coordinatorId=${userId}&page=${currentPage}`;
      } else {
        url = `${
          ""
        }/api/coordinator-assignment/all?page=${currentPage}`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setAssignments(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Work Assignments</h1>
        <div className="flex gap-2">
          {(role === "Senior Coordinator" || role === "Junior Coordinator") && (
            <button
              className="btn btn-primary"
              onClick={() => navigate.push("/assign-work")}
            >
              Assign New Work
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Subject</th>
                  <th>Work Type</th>
                  <th>Projected Date</th>
                  <th>Assigned Date</th>
                  <th>Actual Date</th>
                  {role === "Teacher" && <th>Coordinator</th>}
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={role === "Teacher" ? "9" : "8"}
                      className="text-center py-8"
                    >
                      No assignments found.
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => (
                    <tr key={assignment._id}>
                      <td>{assignment.teacherName}</td>
                      <td>{assignment.class}</td>
                      <td>{assignment.section}</td>
                      <td>{assignment.subject || "N/A"}</td>
                      <td className="capitalize">
                        {assignment.assignedWorkType}
                      </td>
                      <td>
                        {new Date(
                          assignment.projectedDate
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(assignment.assignedDate).toLocaleDateString()}
                      </td>
                      <td>
                        {assignment.actualSubmissionDate
                          ? new Date(
                              assignment.actualSubmissionDate
                            ).toLocaleDateString()
                          : "Not submitted"}
                      </td>
                      {role === "Teacher" && (
                        <td>{assignment.coordinatorName}</td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-12 flex justify-center">
              <ul className="join">
                <li className="page-item">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className={`px-4 py-2 cursor-pointer rounded-md mx-1 ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li key={index + 1} className="page-item">
                    <button
                      onClick={() => setCurrentPage(index + 1)}
                      className={`${
                        currentPage === index + 1
                          ? "bg-gray-400 text-white"
                          : ""
                      } px-4 py-2 mx-1 rounded-md`}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className="page-item">
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className={`px-4 py-2 cursor-pointer mx-1 bg-black rounded-md text-white ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default WorkList;
