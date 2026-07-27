import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ParentAttendance = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

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
    if (!selectedStudentId || !month || !year) return;
    fetchAttendance();
  }, [selectedStudentId, month, year]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/parent/attendance?studentId=${selectedStudentId}&month=${month}&year=${year}`);
      if (res.data.success) {
        setAttendanceData(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = attendanceData.filter(r => r.status === "Present").length;
  const absentCount = attendanceData.filter(r => r.status === "Absent").length;
  const leaveCount = attendanceData.filter(r => r.status === "Leave").length;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        <div className="flex flex-wrap gap-2">
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
          <select 
            className="select select-bordered"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({length: 12}, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select 
            className="select select-bordered"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[year-1, year, year+1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">Loading attendance...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center">
              <span className="text-sm text-gray-500 uppercase font-semibold">Total Present</span>
              <span className="text-3xl font-bold text-green-500 mt-2">{presentCount}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center">
              <span className="text-sm text-gray-500 uppercase font-semibold">Total Absent</span>
              <span className="text-3xl font-bold text-red-500 mt-2">{absentCount}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col items-center justify-center">
              <span className="text-sm text-gray-500 uppercase font-semibold">Total Leave</span>
              <span className="text-3xl font-bold text-yellow-500 mt-2">{leaveCount}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {attendanceData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No attendance records found for this month.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map(record => (
                      <tr key={record._id}>
                        <td>{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td>
                          <span className={`badge ${record.status === 'Present' ? 'badge-success text-white' : record.status === 'Absent' ? 'badge-error text-white' : 'badge-warning text-white'}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ParentAttendance;
