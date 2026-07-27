import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ParentDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentStats, setStudentStats] = useState({});
  const [studentHomework, setStudentHomework] = useState({});

  useEffect(() => {
    const parentId = localStorage.getItem("id");
    if (!parentId) return;

    const fetchStudents = async () => {
      try {
        const res = await axios.get(`/api/parent/my-students?parentId=${parentId}`);
        if (res.data.success) {
          const fetchedStudents = res.data.data;
          setStudents(fetchedStudents);
          
          // Fetch stats and homework for each student
          fetchedStudents.forEach(async (student) => {
            // Fetch Attendance
            const today = new Date();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();
            try {
              const attRes = await axios.get(`/api/parent/attendance?studentId=${student._id}&month=${month}&year=${year}`);
              if (attRes.data.success) {
                const records = attRes.data.data;
                const total = records.length;
                const present = records.filter(r => r.status === 'Present').length;
                const absent = records.filter(r => r.status === 'Absent').length;
                setStudentStats(prev => ({ ...prev, [student._id]: { total, present, absent } }));
              }
            } catch (err) { console.error(err); }

            // Fetch Homework for today
            try {
              // format date as YYYY-MM-DD
              const dateStr = today.toISOString().split('T')[0];
              const hwRes = await axios.get(`/api/homework/class?className=${student.studentClass}&section=${student.studentSection}&date=${dateStr}`);
              if (hwRes.data.success) {
                setStudentHomework(prev => ({ ...prev, [student._id]: hwRes.data.data }));
              }
            } catch (err) { console.error(err); }
          });
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to load student profiles");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">DASHBOARD</h1>
      
      {/* Global Marquee for Homework if any */}
      {Object.values(studentHomework).flat().length > 0 && (
        <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 rounded shadow-sm flex overflow-hidden items-center">
          <span className="font-bold mr-4 whitespace-nowrap">📢 New Homework:</span>
          <marquee className="font-medium">
            {Object.values(studentHomework).flat().map((hw, idx) => (
              <span key={hw._id} className="mr-8">
                {hw.subject}: {hw.description} (Due: {new Date(hw.dueDate).toLocaleDateString()})
              </span>
            ))}
          </marquee>
        </div>
      )}

      {students.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <p className="text-gray-500">No students are currently linked to your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {students.map((student) => (
            <div key={student._id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
              <div className="bg-sky-500 h-24 relative flex items-center px-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white rounded-full p-1 border shadow-sm z-10 mt-12">
                    <img
                      src={student.studentAvatar?.secure_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt={student.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="text-white mt-12 pl-2">
                    <h2 className="text-xl font-bold">{student.name}</h2>
                    <p className="text-sm font-medium opacity-90">Class {student.studentClass} - Sec {student.studentSection}</p>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 pt-10 relative flex-grow">
                <div className="grid grid-cols-1 gap-6">
                  {/* Stats */}
                  <div className="text-sm">
                    <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">Current Month Attendance</h3>
                    {studentStats[student._id] ? (
                      <div className="grid grid-cols-3 gap-2 text-center mt-2">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
                          <div className="text-xl font-bold text-blue-700">{studentStats[student._id].total}</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Present</div>
                          <div className="text-xl font-bold text-green-700">{studentStats[student._id].present}</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Absent</div>
                          <div className="text-xl font-bold text-red-700">{studentStats[student._id].absent}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs text-center py-4 bg-gray-50 rounded-lg">Loading stats...</div>
                    )}
                  </div>

                  {/* Today's Homework */}
                  <div className="text-sm">
                    <h3 className="font-semibold text-gray-700 border-b pb-1 mb-2">Today's Homework</h3>
                    {studentHomework[student._id] ? (
                      studentHomework[student._id].length > 0 ? (
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                          {studentHomework[student._id].map(hw => (
                            <div key={hw._id} className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded shadow-sm text-sm">
                              <div className="font-bold text-orange-800 mb-1">{hw.subject}</div>
                              <div className="text-gray-700">{hw.description}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm italic bg-gray-50 p-4 rounded-lg text-center border border-gray-100">
                          🎉 No homework assigned for today.
                        </div>
                      )
                    ) : (
                       <div className="text-gray-400 text-xs text-center py-4 bg-gray-50 rounded-lg">Loading homework...</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
