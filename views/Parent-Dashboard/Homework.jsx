import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ParentHomework = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [homeworkData, setHomeworkData] = useState([]);
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
    fetchHomework();
  }, [selectedStudentId]);

  const fetchHomework = async () => {
    setLoading(true);
    try {
      const student = students.find(s => s._id === selectedStudentId);
      if (!student) return;

      const res = await axios.get(`/api/homework/class?className=${student.studentClass}&section=${student.studentSection}`);
      if (res.data.success) {
        setHomeworkData(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
      setHomeworkData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Homework</h1>
        {students.length > 1 && (
          <select 
            className="select select-bordered"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.name} (Class {s.studentClass} - {s.studentSection})</option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading homework...</div>
        ) : homeworkData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No homework found for this class and section.</div>
        ) : (
          <div className="space-y-4">
            {homeworkData.map(hw => (
              <div key={hw._id} className="border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-sky-700">{hw.subject}</h3>
                  <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-md font-medium">
                    Due: {new Date(hw.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 whitespace-pre-wrap text-sm">{hw.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                  <span>Assigned by: <span className="font-semibold">{hw.teacherName}</span></span>
                  <span>Date: {new Date(hw.createdAt).toLocaleDateString()}</span>
                </div>
                {hw.attachments && hw.attachments.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {hw.attachments.map((att, idx) => (
                      <a 
                        key={idx} 
                        href={att.secure_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs bg-gray-100 px-3 py-1.5 rounded-full text-blue-600 hover:bg-gray-200"
                      >
                        Attachment {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentHomework;
