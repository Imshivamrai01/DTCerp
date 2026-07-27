"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter as useNavigate } from 'next/navigation';

const TeacherNotificationBanner = () => {
  const [assignments, setAssignments] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const teacherId = localStorage.getItem("id");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "Teacher") {
      checkForNewAssignments();
      const interval = setInterval(() => {
        checkForNewAssignments();
      }, 30000); // Changed from 3000ms (3 seconds) to 30000ms (30 seconds)
      
      return () => clearInterval(interval);
    }
  }, [role]);

  const checkForNewAssignments = async () => {
    try {
      const response = await axios.get(
        `/api/coordinator-assignment/teacher?teacherId=${teacherId}&page=1`
      );
      if (response.data.success) {
        const newCount = response.data.total;
        
        if (newCount > 0) {
          setShowNotification(true);
          setAssignments(response.data.data || []);
        } else {
          setShowNotification(false);
        }
        
        localStorage.setItem(`assignmentCount_${teacherId}`, newCount.toString());
      }
    } catch (error) {
      console.error("Error checking for new assignments:", error);
    }
  };

  if (role !== "Teacher" || !showNotification) {
    return null;
  }

  return (
    <div className="fixed top-16 left-0 lg:left-[30%] xl:left-[23%] 2xl:left-[20%] right-0 z-[60]">
      <div className="bg-red-500 text-white py-2 cursor-pointer" onClick={() => navigate('/update-work')}>
        <marquee className="font-bold text-lg">
          🎯 LATEST WORK ASSIGNMENT: {assignments.length > 0 && assignments[0] ? 
            `Class: ${assignments[0].class} | Section: ${assignments[0].section} | Subject: ${assignments[0].subject} | Work Type: ${Array.isArray(assignments[0].assignedWorkType) ? assignments[0].assignedWorkType.join(', ') : assignments[0].assignedWorkType} | Projected Date: ${assignments[0].projectedDate ? assignments[0].projectedDate.split('T')[0] : 'N/A'} | Coordinator: ${assignments[0].coordinatorName}` 
            : 'Loading latest task details...'} 🎯
        </marquee>
      </div>
    </div>
  );
};

export default TeacherNotificationBanner;