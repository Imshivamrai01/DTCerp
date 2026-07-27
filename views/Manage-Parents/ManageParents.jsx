import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const ManageParents = () => {
  const [classes, setClasses] = useState([]);
  const [activeClass, setActiveClass] = useState("");
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [parentEmail, setParentEmail] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");

  const role = typeof window !== 'undefined' ? localStorage.getItem("role") : null;

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get("/api/academic-structure");
      if (res.data.success) {
        const clsList = [];
        const secSet = new Set();
        res.data.data.forEach((w) => {
          w.classes.forEach((c) => {
            clsList.push(c.className);
            c.sections.forEach((s) => secSet.add(s));
          });
        });
        setClasses(clsList);
        setSections(Array.from(secSet));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load classes");
    }
  };

  const fetchStudents = async () => {
    if (!activeClass || !activeSection) return;
    setLoading(true);
    try {
      // In some parts of the DB it's stored as "3", in others maybe "Class 3". Let's match how ManageStudents does it if it's "3".
      // Wait, let's just pass activeClass directly but ALSO check both in backend if needed. For now let's use backendClass.
      const backendClass = activeClass.replace("Class ", "");
      const res = await axios.get(`/api/parent/students?studentClass=${backendClass}&studentSection=${activeSection}`);
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeClass && activeSection) {
      fetchStudents();
    }
  }, [activeClass, activeSection]);

  const handleRegisterClick = (student) => {
    setSelectedStudent(student);
    setParentEmail("");
    setParentPassword("");
    setParentName(student.fathersName || student.mothersName || "Parent");
    setParentPhone(student.contactNumber || "");
    setShowModal(true);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!parentEmail || !parentPassword) {
      toast.error("Login ID and Password are required");
      return;
    }

    try {
      const res = await axios.post("/api/parent/register", {
        email: parentEmail,
        password: parentPassword,
        name: parentName,
        number: parentPhone,
        studentId: selectedStudent._id
      });

      if (res.data.success) {
        toast.success("Parent account created!");
        setShowModal(false);
        fetchStudents(); // Refresh the list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create account");
    }
  };

  if (role !== "Admin" && role !== "Senior Coordinator" && role !== "Junior Coordinator") {
    return <div className="p-8 text-center text-red-500 text-xl font-bold">Unauthorized Access</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 bg-white p-6 rounded-xl shadow-sm border">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Parent Accounts</h1>
        <p className="text-gray-500 mb-6">Select a class and section to assign parent login credentials.</p>
        
        <div className="flex gap-4">
          <select 
            className="select select-bordered w-full max-w-xs"
            value={activeClass}
            onChange={(e) => setActiveClass(e.target.value)}
          >
            <option value="" disabled>Select Class</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="select select-bordered w-full max-w-xs"
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
          >
            <option value="" disabled>Select Section</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading students...</div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Father's Name</th>
                  <th>Parent Account</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id}>
                    <td>{student.rollNumber}</td>
                    <td className="font-semibold">{student.name}</td>
                    <td>{student.fathersName || "-"}</td>
                    <td>
                      {student.hasParent ? (
                        <span className="badge badge-success text-white">Registered</span>
                      ) : (
                        <span className="badge badge-ghost">Not Registered</span>
                      )}
                    </td>
                    <td>
                      {!student.hasParent && (
                        <button 
                          className="btn btn-sm btn-primary text-white"
                          onClick={() => handleRegisterClick(student)}
                        >
                          Register Parent
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            {activeClass && activeSection ? "No students found in this class." : "Select class and section to view students."}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Register Parent for {selectedStudent?.name}</h2>
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Parent Name</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered" 
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Phone Number</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered" 
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                />
              </div>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Login ID (Email/Phone)</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered" 
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  required 
                  placeholder="e.g. parent@email.com or 9876543210"
                />
              </div>
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered" 
                  value={parentPassword}
                  onChange={(e) => setParentPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary text-white">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageParents;
