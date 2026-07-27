import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ParentCopyChecks = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [copyCheckData, setCopyCheckData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const parentId = localStorage.getItem("id");
    if (!parentId) return;

    const fetchStudents = async () => {
      try {
        const res = await axios.get(`/api/parent/my-students?parentId=${parentId}`);
        if (res.data.success && res.data.data.length > 0) {
          setStudents(res.data.data);
          setSelectedStudentId(res.data.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) return;
    fetchCopyChecks();
  }, [selectedStudentId]);

  const fetchCopyChecks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/parent/copy-checks?studentId=${selectedStudentId}`);
      if (res.data.success) {
        setCopyCheckData(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      setCopyCheckData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Copy Checking Status</h1>
        {students.length > 1 && (
          <select 
            className="select select-bordered"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading copy check records...</div>
        ) : copyCheckData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No copy checking records found for this student.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Submit Type</th>
                  <th>Teacher Check</th>
                  <th>Coordinator Check</th>
                </tr>
              </thead>
              <tbody>
                {copyCheckData.map(record => (
                  <tr key={record._id}>
                    <td>{new Date(record.date || record.createdAt).toLocaleDateString()}</td>
                    <td className="font-semibold">{record.subject || "N/A"}</td>
                    <td className="capitalize">{record.submitType || "N/A"}</td>
                    <td>
                      {record.isCopyChecked ? (
                        <div className="flex flex-col">
                          <span className="badge badge-success text-white badge-sm mb-1">Checked</span>
                          <span className="text-xs text-gray-500">{record.checkedByTeacher}</span>
                        </div>
                      ) : (
                        <span className="badge badge-warning text-white badge-sm">Pending</span>
                      )}
                    </td>
                    <td>
                      {record.isCoordinatorCopyChecked ? (
                        <div className="flex flex-col">
                          <span className="badge badge-success text-white badge-sm mb-1">Checked</span>
                          <span className="text-xs text-gray-500">{record.checkedByCoordinator}</span>
                        </div>
                      ) : (
                        <span className="badge badge-warning text-white badge-sm">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentCopyChecks;
