import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import defaultAvatar from "@/assets/dusk.jpg";

const ParentProfile = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parentId = localStorage.getItem("id");
    if (!parentId) return;

    const fetchStudents = async () => {
      try {
        const res = await axios.get(`/api/parent/my-students?parentId=${parentId}`);
        if (res.data.success) {
          setStudents(res.data.data);
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

  if (loading) return <div className="p-8 text-center">Loading Profiles...</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">STUDENT PROFILES</h1>
      
      {students.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <p className="text-gray-500">No students are currently linked to your account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {students.map((student) => (
            <div key={student._id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-24 relative flex items-center px-4">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white rounded-full p-1 border-2 border-white shadow-md z-10 mt-12">
                    <img
                      src={student.studentAvatar?.secure_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt={student.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="text-white mt-12 pl-2">
                    <h2 className="text-xl font-bold">{student.name}</h2>
                    <p className="text-sm font-medium opacity-90">Admission No: {student.admissionNo}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-6 pt-12 relative flex-grow">
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Class & Section</span>
                    <span className="font-semibold text-gray-800">Class {student.studentClass} - {student.studentSection}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Roll Number</span>
                    <span className="font-semibold text-gray-800">{student.rollNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Father's Name</span>
                    <span className="font-semibold text-gray-800">{student.fathersName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Mother's Name</span>
                    <span className="font-semibold text-gray-800">{student.mothersName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Contact Number</span>
                    <span className="font-semibold text-gray-800">{student.contactNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Date of Birth</span>
                    <span className="font-semibold text-gray-800">
                      {student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Address</span>
                    <span className="font-semibold text-gray-800">{student.address || "N/A"}</span>
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

export default ParentProfile;
