"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import { AiFillCloseCircle, AiOutlineMenu } from "react-icons/ai";
import axios from "axios";


const annyang = null;
import logo from "@/assets/dusk.jpg";























import usePendingAssignments from "@/hooks/usePendingAssignments";






import { Slide, ToastContainer, toast } from "react-toastify";
import TeacherLayout from "@/components/TeacherLayout";
const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState("dashboard");
  const [recognizedSpeech, setRecognizedSpeech] = useState("");
  const currentUser = localStorage.getItem("currentUser");
  const role = localStorage.getItem("role");
  const secondaryRole = localStorage.getItem("secondaryRole");
  const name = localStorage.getItem("name");
  const moduleAssigned = JSON.parse(localStorage.getItem("module"));
  const { pendingCount, refreshCount } = usePendingAssignments();
  const uid = localStorage.getItem("id");
  const [ml, setML] = useState(false);
  const [isUserActive, setIsUserActive] = useState(true);
  const classTeacher = JSON.parse(localStorage.getItem("classTeacher") || "{}");
  const [showTooltip, setShowTooltip] = useState(false);

  const hasAssignedClass = classTeacher.class && classTeacher.section;
  const hasRole = (requiredRole) => {
    return role === requiredRole || secondaryRole === requiredRole;
  };

  // console.log(name);
  const handleLogout = async () => {
    try {
      localStorage.clear();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };
  // console.log(currentUser);
  useEffect(() => {
    if (!currentUser) {
      router.push("/");
    }
  }, [currentUser]);
  useEffect(() => {
    const refreshUserFromServer = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("User"));
        if (!storedUser || !storedUser._id) return;

        const response = await axios.get(
          `/api/user/me/${storedUser._id}`
        );
        const updatedUser = response.data.user;

        // ✅ Save entire user object
        localStorage.setItem("User", JSON.stringify(updatedUser));

        // ✅ Set each individual field as needed
        localStorage.setItem("currentUser", "true");
        localStorage.setItem("role", updatedUser.role || "");
        localStorage.setItem("secondaryRole", updatedUser.secondaryRole || "");
        localStorage.setItem("email", updatedUser.email || "");
        localStorage.setItem("class", updatedUser.class || "");
        localStorage.setItem("division", updatedUser.division || "");
        localStorage.setItem("id", updatedUser._id || "");
        localStorage.setItem("name", updatedUser.name || "");

        // ✅ You can also add these if needed
        localStorage.setItem(
          "assignedSubjects",
          JSON.stringify(updatedUser.assignedSubjects || [])
        );
        localStorage.setItem(
          "assignedClasses",
          JSON.stringify(updatedUser.assignedClasses || [])
        );
        localStorage.setItem(
          "assignedSections",
          JSON.stringify(updatedUser.assignedSections || [])
        );
        localStorage.setItem(
          "assignedWings",
          JSON.stringify(updatedUser.assignedWings || [])
        );
        localStorage.setItem(
          "classTeacher",
          JSON.stringify(updatedUser.classTeacher || {})
        );

        console.log("✅ User data updated in localStorage on reload");
      } catch (err) {
        console.error("❌ Failed to refresh user data", err);
      }
    };

    // ✅ Call once on reload
    refreshUserFromServer();
  }, []);

  useEffect(() => {
    const path = pathname;
    if (path === "/" || path === "") {
      setActiveLink("dashboard");
    } else if (path === "/manage-fees") {
      setActiveLink("manage fees");
    } else if (path === "/fee-structure") {
      setActiveLink("fee structure");
    } else if (path === "/assign-work") {
      setActiveLink("assign work");
    } else if (path === "/work-list") {
      setActiveLink("work list");
    } else if (path === "/update-work") {
      setActiveLink("update work");
    } else if (path === "/homework") {
      setActiveLink("homework");
    } else if (path === "/manage-copies") {
      setActiveLink("copies");
    } else if (path === "/manage-students") {
      setActiveLink("student");
    } else if (path === "/assign-classes") {
      setActiveLink("assign classes");
    } else if (path === "/manage-admin") {
      setActiveLink("admin");
    } else if (path === "/display-attendence-stu") {
      setActiveLink("student attendence");
    } else if (path === "/manage-structure") {
      setActiveLink("manage structure");
    }
  }, [pathname]);

  const setMl = () => {
    if (window.innerWidth < 1023) {
      if (ml == false) {
        setML(true);
      } else {
        setML(false);
      }
    }
  };

  const [lastStatusCheck, setLastStatusCheck] = useState(0);
  const STATUS_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const checkUserActiveStatus = async () => {
      const now = Date.now();
      if (!uid || now - lastStatusCheck < STATUS_CHECK_INTERVAL) return;
      
      try {
        const response = await axios.get(
          `/api/user/me/${uid}`
        );
        if (response.data.success) {
          console.log("Active Status" + response.data.user.isActive);
          setIsUserActive(response.data.user.isActive);
          setLastStatusCheck(now);
          if (response.data.success && !response.data.user.isActive) {
            toast.error(
              "Your account has been deactivated. Please contact administrator"
            );
            localStorage.clear();
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };

    checkUserActiveStatus();
  }, [pathname, lastStatusCheck]);

  // VOICE COMMAND

  useEffect(() => {
    if (!annyang) return;

    const commands = {
      home: () => router.push("/"),
      "user panel": () => router.push("/manage-admins"),
      "student panel": () => router.push("/manage-students"),
      "copy panel": () => router.push("/manage-copies"),
      hello: () => alert("Hello, welcome back!"),
      "stop listening": () => {
        annyang.abort();
        setIsListening(false);
      },
      "clear speech": () => setRecognizedSpeech("Listening..."),
    };

    annyang.addCommands(commands);

    const onResult = (phrases) => {
      const phrase = phrases[0] || "";
      console.log("Recognized (raw):", phrase);

      // Display only the first two words
      const cleanedPhrase = phrase.trim().replace(/\s+/g, " ");
      const firstTwoWords = cleanedPhrase.split(" ").slice(0, 2).join(" ");
      setRecognizedSpeech(firstTwoWords || "Listening...");

      // Process the FULL phrase (not just the first two words)
      if (phrase.includes("clear")) {
        setRecognizedSpeech("Listening...");
      } else if (phrase.includes("stop")) {
        annyang.abort();
        setIsListening(false);
      }
    };

    annyang.addCallback("result", onResult);
    annyang.addCallback("start", () => setIsListening(true));
    annyang.addCallback("end", () => setIsListening(false));

    return () => {
      annyang.removeCommands();
      annyang.abort();
    };
  }, [router]);

  const toggleListening = () => {
    setRecognizedSpeech("Say something 😃!...");

    if (isListening) {
      annyang.abort();
      setIsListening(false);
      setRecognizedSpeech("");
    } else {
      annyang.start({
        autoRestart: true,
        continuous: true,
        interimResults: false, // Set this to `true` if you want real-time feedback
      });
    }
  };
  return (
    <>
      <ToastContainer
        draggable
        transition={Slide}
        closeOnClick
        hideProgressBar
        position="top-center"
      />
      {/* Notification for Teachers */}
      {currentUser && role === "Teacher" && pendingCount > 0 && (
        <div className="fixed top-4 right-4 z-[9999]">
          <div className="relative">
            <div
              className="bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h6m2 13V7a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2h-3"
                />
              </svg>
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            </div>

            {/* Debug info */}
            {/* <div className="absolute top-16 right-0 bg-black text-white text-xs p-2 rounded">
              Role: {role}
              <br />
              PendingCount: {pendingCount}
              <br />
              CurrentUser: {currentUser ? "Yes" : "No"}
            </div> */}

            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded whitespace-nowrap">
                You have {pendingCount} assignments left
                <button
                  className="ml-2 text-blue-300 underline"
                  onClick={() => router.push("/update-work")}
                >
                  View
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {currentUser ? (
        <>
          {!hasRole("Parent") && (
            <button
              className={`voice-button ${isListening ? "pulsate" : ""}`}
              onClick={toggleListening}
            >
              <span className="icon" role="img" aria-label="Voice Recognition">
                🎙️
              </span>
              {isListening ? recognizedSpeech || "Listening..." : ""}
            </button>
          )}
          <section className="bg-gray-100 dark:bg-gray-900">
            <aside
              className={
                ml
                  ? "fixed top-0 z-10 ml-[0] flex h-screen w-full flex-col justify-between border-r bg-white px-6 pb-3 transition duration-300 md:w-4/12 lg:ml-0 lg:w-[30%] xl:w-[23%] 2xl:w-[20%] dark:bg-gray-800 dark:border-gray-700"
                  : "fixed top-0 z-10 ml-[-100%] flex h-screen w-full flex-col justify-between border-r bg-white px-6 pb-3 transition duration-300 md:w-4/12 lg:ml-0 lg:w-[30%] xl:w-[23%] 2xl:w-[20%] dark:bg-gray-800 dark:border-gray-700"
              }
            >
              <div className=" overflow-y-auto z-60 h-[90vh] overflow-x-hidden">
                <div className="-mx-6 z-60 px-6 py-4">
                  {window.innerWidth < 1023 && (
                    <div className="flex items-center justify-between">
                      <h5
                        onClick={() => setMl()}
                        className="z-60 flex justify-end text-2xl font-medium text-gray-600 lg:block dark:text-white"
                      >
                        <AiFillCloseCircle />
                      </h5>
                      <button
                        onClick={handleLogout}
                        className="group flex items-center space-x-4 rounded-md px-4 py-5    text-black  "
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="group-hover:text-gray-700 dark:group-hover:text-white">
                          Logout
                        </span>
                      </button>
                    </div>
                  )}
                  <h2 className="font-semibold text-xl mt-3">
                    D2C Portal <span>©</span>
                  </h2>
                </div>

                <div className="mt-8 text-center">
                  <img
                    src={logo?.src || logo}
                    alt="admin"
                    className="m-auto h-10 w-10 rounded-md object-cover lg:h-28 lg:w-28"
                  />
                  <h5 className="mt-4 hidden text-xl font-semibold text-gray-600 lg:block dark:text-gray-300">
                    {name}
                  </h5>
                  <span className="hidden text-gray-400 lg:block">
                    {" "}
                    {role}
                    {secondaryRole && ` / ${secondaryRole}`}
                  </span>
                </div>

                <ul className="mt-8 space-y-2 tracking-wide">
                  {/* Dashboard - Available to all roles except Parent */}
                  {!hasRole("Parent") && (
                    <li
                      onClick={() => {
                        setActiveLink("dashboard");
                        router.push("/dashboard");
                        setMl();
                      }}
                    >
                      <a
                        href="#"
                        aria-label="dashboard"
                        className={
                          activeLink == "dashboard"
                            ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                            : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                        }
                      >
                        <svg
                          className="-ml-1 h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                            className="dark:fill-slate-600 fill-current text-cyan-400"
                          ></path>
                          <path
                            d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                            className="fill-current text-cyan-200 group-hover:text-cyan-300"
                          ></path>
                          <path
                            d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                            className="fill-current group-hover:text-sky-300"
                          ></path>
                        </svg>
                        <span className="-mr-1 font-medium">Dashboard</span>
                      </a>
                    </li>
                  )}

                  {/* Admin-only items */}
                  {hasRole("Admin") && (
                    <>
                      <li
                        onClick={() => {
                          setActiveLink("manage Student attendance");
                          router.push("/manage-all-attendance");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="manage Student attendance"
                          className={
                            activeLink == "manage Student attendance"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                              className="dark:fill-slate-600 fill-current text-cyan-400"
                            ></path>
                            <path
                              d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                              className="fill-current text-cyan-200 group-hover:text-cyan-300"
                            ></path>
                            <path
                              d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                              className="fill-current group-hover:text-sky-300"
                            ></path>
                          </svg>
                          <span className="-mr-1 font-medium">
                            Student Attendance Admin
                          </span>
                        </a>
                      </li>
                      <li
                        onClick={() => {
                          setActiveLink("manage teacher attendence");
                          router.push("/display-attendence");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="manage teacher attendence "
                          className={
                            activeLink == "manage teacher attendence"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                              className="dark:fill-slate-600 fill-current text-cyan-400"
                            ></path>
                            <path
                              d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                              className="fill-current text-cyan-200 group-hover:text-cyan-300"
                            ></path>
                            <path
                              d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                              className="fill-current group-hover:text-sky-300"
                            ></path>
                          </svg>
                          <span className="-mr-1 font-medium">
                            Teacher Attendance Admin
                          </span>
                        </a>
                      </li>
                      <li
                        onClick={() => {
                          setActiveLink("admin");
                          router.push("/manage-admin");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="admin"
                          className={
                            activeLink == "admin"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                              className="dark:fill-slate-600 fill-current text-cyan-400"
                            ></path>
                            <path
                              d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                              className="fill-current text-cyan-200 group-hover:text-cyan-300"
                            ></path>
                            <path
                              d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                              className="fill-current group-hover:text-sky-300"
                            ></path>
                          </svg>
                          <span className="-mr-1 font-medium">
                            Manage Users
                          </span>
                        </a>
                      </li>

                      <li
                        onClick={() => {
                          setActiveLink("student");
                          router.push("/manage-students");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="student"
                          className={
                            activeLink == "student"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                              className="dark:fill-slate-600 fill-current text-cyan-400"
                            ></path>
                            <path
                              d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                              className="fill-current text-cyan-200 group-hover:text-cyan-300"
                            ></path>
                            <path
                              d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                              className="fill-current group-hover:text-sky-300"
                            ></path>
                          </svg>
                          <span className="-mr-1 font-medium">
                            Manage Students
                          </span>
                        </a>
                      </li>
                      <li
                        onClick={() => {
                          setActiveLink("parents");
                          router.push("/manage-parents");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="parents"
                          className={
                            activeLink == "parents"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" className="fill-current text-cyan-400"/>
                          </svg>
                          <span className="-mr-1 font-medium">
                            Manage Parents
                          </span>
                        </a>
                      </li>
                      {/* <li
                        onClick={() => {
                          setActiveLink("fees");
                          router.push("/manage-fees");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="fees"
                          className={
                            activeLink == "fees"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                              className="dark:fill-slate-600 fill-current text-cyan-400"
                            ></path>
                            <path
                              d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                              className="fill-current text-cyan-200 group-hover:text-cyan-300"
                            ></path>
                            <path
                              d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                              className="fill-current group-hover:text-sky-300"
                            ></path>
                          </svg>
                          <span className="-mr-1 font-medium">Manage Fees</span>
                        </a>
                      </li> */}
                      {/* <li
                        onClick={() => {
                          setActiveLink("fees Structure");
                          router.push("/fee-structure");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="fees Structure"
                          className={
                            activeLink == "fees Structure"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                              className="dark:fill-slate-600 fill-current text-cyan-400"
                            ></path>
                            <path
                              d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                              className="fill-current text-cyan-200 group-hover:text-cyan-300"
                            ></path>
                            <path
                              d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                              className="fill-current group-hover:text-sky-300"
                            ></path>
                          </svg>
                          <span className="-mr-1 font-medium">
                            Fees Structure
                          </span>
                        </a>
                      </li> */}
                    </>
                  )}
                  
                  {/* Assign Classes and Manage Structure - Available to Admin and Coordinators */}
                  {(hasRole("Admin") || hasRole("Senior Coordinator") || hasRole("Junior Coordinator")) && (
                    <>
                      <li
                        onClick={() => {
                          setActiveLink("assign classes");
                          router.push("/assign-classes");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="assign classes"
                          className={
                            activeLink == "assign classes"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                              className="dark:fill-slate-600 fill-current text-cyan-400"
                            ></path>
                            <path
                              d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                              className="fill-current text-cyan-200 group-hover:text-cyan-300"
                            ></path>
                            <path
                              d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                              className="fill-current group-hover:text-sky-300"
                            ></path>
                          </svg>
                          <span className="-mr-1 font-medium">
                            Assign Classes
                          </span>
                        </a>
                      </li>
                      <li
                        onClick={() => {
                          setActiveLink("manage structure");
                          router.push("/manage-structure");
                          setMl();
                        }}
                      >
                      <a
                        href="#"
                        aria-label="manage structure"
                        className={
                          activeLink == "manage structure"
                            ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                            : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                        }
                      >
                        <svg
                          className="-ml-1 h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                            className="dark:fill-slate-600 fill-current text-cyan-400"
                          ></path>
                          <path
                            d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                            className="fill-current text-cyan-200 group-hover:text-cyan-300"
                          ></path>
                          <path
                            d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                            className="fill-current group-hover:text-sky-300"
                          ></path>
                        </svg>
                        <span className="-mr-1 font-medium">Manage Structure</span>
                      </a>
                    </li>
                    </>
                  )}

                  {/* Teacher items */}
                  {hasRole("Teacher") && classTeacher !== null && (
                    <>
                      {!hasRole("Admin") && hasAssignedClass && (
                        <li
                          onClick={() => {
                            setActiveLink("student attendence");
                            router.push("/display-attendence-stu");
                            setMl();
                          }}
                        >
                          <a
                            href="#"
                            aria-label="student attendence"
                            className={
                              activeLink === "student attendence"
                                ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                                : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                            }
                          >
                            <svg
                              className="-ml-1 h-6 w-6"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                                className="dark:fill-slate-600 fill-current text-cyan-400"
                              ></path>
                              <path
                                d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                                className="fill-current text-cyan-200 group-hover:text-cyan-300"
                              ></path>
                              <path
                                d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                                className="fill-current group-hover:text-sky-300"
                              ></path>
                            </svg>
                            <span className="-mr-1 font-medium">
                              Manage Student Attendence
                            </span>
                          </a>
                        </li>
                      )}

                      <li
                        onClick={() => {
                          setActiveLink("update work");
                          router.push("/update-work");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="update work"
                          className={
                            activeLink == "update work"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                              className="dark:fill-slate-600 fill-current text-cyan-400"
                            ></path>
                            <path
                              d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                              className="fill-current text-cyan-200 group-hover:text-cyan-300"
                            ></path>
                            <path
                              d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                              className="fill-current group-hover:text-sky-300"
                            ></path>
                          </svg>
                          <span className=" font-medium">Update Work</span>
                          {pendingCount > 0 && (
                            <span
                              className="badge badge-error badge-xs text-white mb-2"
                              style={{ marginLeft: "3px" }}
                            >
                              {pendingCount}
                            </span>
                          )}
                        </a>
                      </li>
                      <li
                        onClick={() => {
                          setActiveLink("homework");
                          router.push("/homework");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="homework"
                          className={
                            activeLink == "homework"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                              className="dark:fill-slate-600 fill-current text-cyan-400"
                            ></path>
                            <path
                              d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                              className="fill-current text-cyan-200 group-hover:text-cyan-300"
                            ></path>
                            <path
                              d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                              className="fill-current group-hover:text-sky-300"
                            ></path>
                          </svg>
                          <span className="-mr-1 font-medium">Homework</span>
                        </a>
                      </li>
                    </>
                  )}

                  {/* Senior Coordinator items */}
                  {(hasRole("Senior Coordinator") ||
                    hasRole("Junior Coordinator")) && (
                    <li
                      onClick={() => {
                        setActiveLink("work list");
                        router.push("/work-list");
                        setMl();
                      }}
                    >
                      <a
                        href="#"
                        aria-label="work list"
                        className={
                          activeLink == "work list"
                            ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                            : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                        }
                      >
                        <svg
                          className="-ml-1 h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                            className="dark:fill-slate-600 fill-current text-cyan-400"
                          ></path>
                          <path
                            d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                            className="fill-current text-cyan-200 group-hover:text-cyan-300"
                          ></path>
                          <path
                            d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                            className="fill-current group-hover:text-sky-300"
                          ></path>
                        </svg>
                        <span className="-mr-1 font-medium">Work List</span>
                      </a>
                    </li>
                  )}

                  {/* Items available to multiple roles */}
                  {(hasRole("Admin") ||
                    hasRole("Teacher") ||
                    hasRole("Senior Coordinator") ||
                    hasRole("Junior Coordinator")) && (
                    <li
                      onClick={() => {
                        setActiveLink("copies");
                        router.push("/manage-copies");
                        setMl();
                      }}
                    >
                      <a
                        href="#"
                        aria-label="copies"
                        className={
                          activeLink == "copies"
                            ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                            : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                        }
                      >
                        <svg
                          className="-ml-1 h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                            className="dark:fill-slate-600 fill-current text-cyan-400"
                          ></path>
                          <path
                            d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                            className="fill-current text-cyan-200 group-hover:text-cyan-300"
                          ></path>
                          <path
                            d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                            className="fill-current group-hover:text-sky-300"
                          ></path>
                        </svg>
                        <span className="-mr-1 font-medium">Manage Copies</span>
                      </a>
                    </li>
                  )}

                  {(hasRole("Senior Coordinator") ||
                    hasRole("Junior Coordinator")) && (
                    <li
                      onClick={() => {
                        setActiveLink("assign work");
                        router.push("/assign-work");
                        setMl();
                      }}
                    >
                      <a
                        href="#"
                        aria-label="assign work"
                        className={
                          activeLink == "assign work"
                            ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                            : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                        }
                      >
                        <svg
                          className="-ml-1 h-6 w-6"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                            className="dark:fill-slate-600 fill-current text-cyan-400"
                          ></path>
                          <path
                            d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                            className="fill-current text-cyan-200 group-hover:text-cyan-300"
                          ></path>
                          <path
                            d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                            className="fill-current group-hover:text-sky-300"
                          ></path>
                        </svg>{" "}
                        <span className="-mr-1 font-medium">Assign Work</span>
                      </a>
                    </li>
                  )}
                  {(() => {
                    const user = JSON.parse(
                      localStorage.getItem("User") || "{}"
                    );

                    // 1. Check if user has IT subjects
                    const hasITSubject = user?.assignedSubjects?.some(
                      (sub) => sub.subject?.value === "IT"
                    );

                    // 2. Check for Admin (case-insensitive)
                    const isAdmin =
                      String(user?.role).toLowerCase() === "admin" ||
                      String(user?.secondaryRole).toLowerCase() === "admin";

                    // 3. Check for Lab Instructor (exact match as stored in DB)
                    const isLabInstructor =
                      user?.role === "Lab Instructor" ||
                      user?.secondaryRole === "Lab Instructor";

                    // Show menu item if any condition is true
                    return hasITSubject || isAdmin || isLabInstructor ? (
                      <li
                        onClick={() => {
                          setActiveLink("list-lab");
                          router.push("/list-lab");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="list-lab"
                          className={
                            activeLink === "list-lab"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white"
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2 text-gray-600"
                          }
                        >
                          <svg
                            className="-ml-1 h-6 w-6"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8ZM6 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1Z"
                              className="dark:fill-slate-600 fill-current text-cyan-400"
                            />
                            <path
                              d="M13 8a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V8Z"
                              className="fill-current text-cyan-200 group-hover:text-cyan-300"
                            />
                            <path
                              d="M13 15a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1Z"
                              className="fill-current group-hover:text-sky-300"
                            />
                          </svg>
                          <span className="-mr-1 font-medium">
                            Computer Lab Assign
                          </span>
                        </a>
                      </li>
                    ) : null;
                  })()}

                  {/* Parent-only items */}
                  {hasRole("Parent") && (
                    <>
                      <li
                        onClick={() => {
                          setActiveLink("parent dashboard");
                          router.push("/parent/dashboard");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="parent dashboard"
                          className={
                            activeLink == "parent dashboard"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg className="-ml-1 h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" className="fill-current text-cyan-400"/>
                          </svg>
                          <span className="-mr-1 font-medium">Dashboard</span>
                        </a>
                      </li>
                      <li
                        onClick={() => {
                          setActiveLink("parent profile");
                          router.push("/parent/profile");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="parent profile"
                          className={
                            activeLink == "parent profile"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg className="-ml-1 h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" className="fill-current text-cyan-400"/>
                          </svg>
                          <span className="-mr-1 font-medium">Profile</span>
                        </a>
                      </li>
                      <li
                        onClick={() => {
                          setActiveLink("parent homework");
                          router.push("/parent/homework");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="parent homework"
                          className={
                            activeLink == "parent homework"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg className="-ml-1 h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" className="fill-current text-cyan-400"/>
                          </svg>
                          <span className="-mr-1 font-medium">Homework</span>
                        </a>
                      </li>
                      <li
                        onClick={() => {
                          setActiveLink("parent attendance");
                          router.push("/parent/attendance");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="parent attendance"
                          className={
                            activeLink == "parent attendance"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg className="-ml-1 h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" className="fill-current text-cyan-400"/>
                          </svg>
                          <span className="-mr-1 font-medium">Attendance</span>
                        </a>
                      </li>
                      <li
                        onClick={() => {
                          setActiveLink("parent copy checks");
                          router.push("/parent/copy-checks");
                          setMl();
                        }}
                      >
                        <a
                          href="#"
                          aria-label="parent copy checks"
                          className={
                            activeLink == "parent copy checks"
                              ? "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-1 py-2 text-white "
                              : "relative flex items-center space-x-4 rounded-xl px-1 py-2  text-gray-600"
                          }
                        >
                          <svg className="-ml-1 h-6 w-6" viewBox="0 0 24 24" fill="none">
                            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" className="fill-current text-cyan-400"/>
                          </svg>
                          <span className="-mr-1 font-medium">Copy Checking</span>
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <ul className="mt-8 p-0 m-0 tracking-wide">
                <a
                  href="https://shineinfosolutions.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold pb-2 text-sm w-full"
                >
                  Developed By Shine Infosolutions
                </a>
              </ul>
              <div className="-mx-6 md:flex hidden items-center justify-between border-t px-6 pt-4 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="group flex items-center space-x-4 rounded-md px-4 py-3 text-gray-600 dark:text-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="group-hover:text-gray-700 dark:group-hover:text-white">
                    Logout
                  </span>
                </button>
              </div>
            </aside>
            <div className="ml-auto mb-6 lg:w-[70%] xl:w-[75%] 2xl:w-[80%]">
              <div
                className={
                  window.innerWidth < 768
                    ? " sticky md:z-50 top-0 h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700 lg:py-2.5"
                    : "sticky  md:z-50 top-0 h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700 lg:py-2.5"
                }
              >
                <div className="flex items-center justify-between space-x-4 px-4 2xl:container h-full">
                  <h5
                    hidden
                    className="text-2xl font-medium text-gray-600 lg:block dark:text-white"
                  >
                    {activeLink.toLocaleUpperCase()}
                  </h5>
                  <h5
                    onClick={() => setMl()}
                    className="text-2xl lg:hidden font-medium text-gray-600  dark:text-white"
                  >
                    <AiOutlineMenu />
                  </h5>
                  <div className="flex space-x-4"></div>
                </div>
              </div>

              <div className="px-6 pt-6 bg-white pb-20 md:pb-6">
                <TeacherLayout>
                  {children}
                </TeacherLayout>
              </div>
            </div>
          </section>

          {/* Parent Mobile Bottom Navbar */}
          {hasRole("Parent") && (
            <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center py-2 px-1">
              <button 
                onClick={() => { setActiveLink("parent dashboard"); router.push("/parent/dashboard"); }}
                className={`flex flex-col items-center justify-center w-1/5 py-1 ${activeLink === "parent dashboard" ? "text-sky-600" : "text-gray-500"}`}
              >
                <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" className="fill-current"/>
                </svg>
                <span className="text-[10px] font-medium leading-none">Dash</span>
              </button>
              
              <button 
                onClick={() => { setActiveLink("parent profile"); router.push("/parent/profile"); }}
                className={`flex flex-col items-center justify-center w-1/5 py-1 ${activeLink === "parent profile" ? "text-sky-600" : "text-gray-500"}`}
              >
                <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" className="fill-current"/>
                </svg>
                <span className="text-[10px] font-medium leading-none">Profile</span>
              </button>
              
              <button 
                onClick={() => { setActiveLink("parent homework"); router.push("/parent/homework"); }}
                className={`flex flex-col items-center justify-center w-1/5 py-1 ${activeLink === "parent homework" ? "text-sky-600" : "text-gray-500"}`}
              >
                <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" className="fill-current"/>
                </svg>
                <span className="text-[10px] font-medium leading-none">HW</span>
              </button>
              
              <button 
                onClick={() => { setActiveLink("parent attendance"); router.push("/parent/attendance"); }}
                className={`flex flex-col items-center justify-center w-1/5 py-1 ${activeLink === "parent attendance" ? "text-sky-600" : "text-gray-500"}`}
              >
                <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" className="fill-current"/>
                </svg>
                <span className="text-[10px] font-medium leading-none">Attnd</span>
              </button>
              
              <button 
                onClick={() => { setActiveLink("parent copy checks"); router.push("/parent/copy-checks"); }}
                className={`flex flex-col items-center justify-center w-1/5 py-1 ${activeLink === "parent copy checks" ? "text-sky-600" : "text-gray-500"}`}
              >
                <svg className="h-6 w-6 mb-1" viewBox="0 0 24 24" fill="none">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" className="fill-current"/>
                </svg>
                <span className="text-[10px] font-medium leading-none">Copies</span>
              </button>
            </div>
          )}

        </>
      ) : (
        children
      )}
    </>
  );
};

export default DashboardLayout;
