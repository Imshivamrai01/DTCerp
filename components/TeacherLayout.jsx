"use client";
import TeacherNotificationBanner from "./TeacherNotificationBanner";

const TeacherLayout = ({ children }) => {
  const role = localStorage.getItem("role");
  
  return (
    <>
      {role === "Teacher" && <TeacherNotificationBanner />}
      <div style={{ marginTop: role === "Teacher" ? "50px" : "0" }}>
        {children}
      </div>
    </>
  );
};

export default TeacherLayout;