"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';

const AddHomework = () => {
  const [loading, setLoading] = useState(false);
  const [activeClass, setActiveClass] = useState("");
  const [activeDivision, setActiveDivision] = useState("");
  const [subject, setSubject] = useState("");
  const [homeworkText, setHomeworkText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const navigate = useRouter();
  const name = localStorage.getItem("name");
  const uid = localStorage.getItem("id");

  // Memoize these values to prevent unnecessary recalculations
  const assignedClasses = useMemo(
    () => JSON.parse(localStorage.getItem("assignedClasses")) || [],
    []
  );
  const assignedSubjects = useMemo(
    () => JSON.parse(localStorage.getItem("assignedSubjects")) || [],
    []
  );

  // Calculate filtered subjects based on current selections
  const filteredSubjects = useMemo(() => {
    if (!activeClass || !activeDivision || !assignedSubjects.length) return [];
    return assignedSubjects.filter(
      (subjectItem) =>
        subjectItem.class.value === activeClass &&
        subjectItem.section.value === activeDivision
    );
  }, [activeClass, activeDivision, assignedSubjects]);

  // Set default values on initial render
  useEffect(() => {
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split("T")[0]);

    // Set default class if available
    if (assignedClasses.length > 0) {
      setActiveClass(assignedClasses[0].value);
    }
  }, [assignedClasses]);

  // Update subject when filteredSubjects changes
  useEffect(() => {
    if (filteredSubjects.length > 0) {
      // Only reset if current subject isn't in filtered list
      if (!filteredSubjects.some((sub) => sub.subject.value === subject)) {
        setSubject(filteredSubjects[0].subject.value);
      }
    } else {
      setSubject("");
    }
  }, [filteredSubjects]); // Removed subject from dependencies

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !activeClass ||
      !activeDivision ||
      !subject ||
      !homeworkText ||
      !dueDate
    ) {
      toast.error("Please fill all the fields!");
      return;
    }

    setLoading(true);

    const homeworkData = {
      description: homeworkText,
      className: activeClass,
      section: activeDivision,
      subject: subject,
      dueDate: dueDate,
      teacherId: uid,
      teacherName: name,
    };

    axios
      .post("/api/homework", homeworkData)
      .then((res) => {
        if (res.data.success) {
          toast.success("Homework assigned successfully!");
          setTimeout(() => navigate.push("/homework"), 1000);
        } else {
          toast.error(res.data.message || "Failed to assign homework");
        }
      })
      .catch((error) => {
        console.error("Error assigning homework:", error);
        toast.error("Error assigning homework");
      })
      .finally(() => setLoading(false));
  };

  // Get current date for minimum date input
  const currentDateForToday = new Date();
  const yearToday = currentDateForToday.getFullYear();
  const monthToday = String(currentDateForToday.getMonth() + 1).padStart(2, "0");
  const dayToday = String(currentDateForToday.getDate()).padStart(2, "0");
  const today = `${yearToday}-${monthToday}-${dayToday}`;

  return (
    <div className="container mx-auto p-4">
      {/* <Toaster draggable={true} position="top-center" /> */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Homework</h1>
        <button
          className="btn btn-outline"
          onClick={() => navigate.push("/homework")}
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Class</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={activeClass}
              onChange={(e) => {
                setActiveClass(e.target.value);
                setActiveDivision(""); // Reset section when class changes
              }}
              required
            >
              <option value="" disabled>
                Select Class
              </option>
              {assignedClasses.map((cls) => (
                <option key={cls._id} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>

          {/* Section Selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Section</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={activeDivision}
              onChange={(e) => setActiveDivision(e.target.value)}
              required
              disabled={!activeClass}
            >
              <option value="" disabled>
                Select Section
              </option>
              {assignedClasses
                .find((cls) => cls.value === activeClass)
                ?.sections?.map((section) => (
                  <option key={section._id} value={section.value}>
                    {section.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Subject</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={
                !activeClass || !activeDivision || !filteredSubjects.length
              }
            >
              <option value="" disabled>
                {filteredSubjects.length
                  ? "Select Subject"
                  : "No subjects available"}
              </option>
              {filteredSubjects.map((subjectItem) => (
                <option
                  key={subjectItem.subject.value}
                  value={subjectItem.subject.value}
                >
                  {subjectItem.subject.label}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Submission Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={today}
              required
            />
          </div>
        </div>

        {/* Homework Details */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Homework Details</span>
          </label>
          <textarea
            className="textarea textarea-bordered h-32"
            placeholder="Enter homework details here..."
            value={homeworkText}
            onChange={(e) => setHomeworkText(e.target.value)}
            required
          />
        </div>

        {/* Submit Button */}
        <div className="form-control mt-6">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Assign Homework"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHomework;
