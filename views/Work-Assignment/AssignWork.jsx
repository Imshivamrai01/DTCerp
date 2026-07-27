"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
import { MultiSelect } from "react-multi-select-component";

const AssignWork = () => {
  const [loading, setLoading] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [projectedDate, setProjectedDate] = useState("");

  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [workType, setWorkType] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const navigate = useRouter();
  const coordinatorName = localStorage?.getItem("name") || "";
  const coordinatorId = localStorage?.getItem("id") || "";
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const today = `${year}-${month}-${day}`;

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (className && section && subjects?.length > 0) {
      const filtered =
        subjects?.filter(
          (sub) =>
            sub?.class?.value === className && sub?.section?.value === section
        ) || [];

      // Filter out subjects already added for this class-section combination
      const availableSubjects = filtered.filter(
        (sub) =>
          !tasks.some(
            (task) =>
              task.class === className &&
              task.section === section &&
              task.subject === sub?.subject?.value
          )
      );

      setFilteredSubjects(availableSubjects);
      setSubject("");
    } else {
      setFilteredSubjects([]);
      setSubject("");
    }
  }, [className, section, subjects, tasks]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await axios?.get(
        "/api/user/teacher"
      );
      if (response?.data?.success) {
        const teachersOnly =
          response?.data?.data?.filter(
            (user) =>
              user?.role === "Teacher" || user?.secondaryRole === "Teacher"
          ) || [];
        setTeachers(teachersOnly);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = (e) => {
    const selectedTeacher = teachers?.find(
      (teacher) => teacher?._id === e?.target?.value
    );
    if (selectedTeacher) {
      setTeacherId(selectedTeacher?._id);
      setTeacherName(selectedTeacher?.name);
      setClasses(selectedTeacher?.assignedClasses || []);
      setSubjects(selectedTeacher?.assignedSubjects || []);
      setClassName("");
      setSection("");
      setSubject("");
      setSections([]);
      setFilteredSubjects([]);
    }
  };

  const handleClassChange = (e) => {
    const selectedClass = classes?.find(
      (cls) => cls?.value === e?.target?.value
    );
    setClassName(e?.target?.value);
    if (selectedClass && selectedClass?.sections) {
      setSections(selectedClass?.sections);
      setSection("");
    }
  };

  const addMoreTask = () => {
    if (
      !teacherId ||
      !className ||
      !section ||
      !subject ||
      workType.length === 0 ||
      !projectedDate
    ) {
      toast.error("Please fill all the fields first!");
      return;
    }

    const newTask = {
      id: Date.now(),
      class: className,
      section,
      subject,
      assignedWorkType: workType.map((item) => item.value),
      projectedDate,
    };

    setTasks([...tasks, newTask]);

    // Reset form fields except teacher
    setClassName("");
    setSection("");
    setSubject("");
    setWorkType([]);
    setProjectedDate("");
    setSections([]);
    setFilteredSubjects([]);

    toast.success("Task added! Add more or submit all tasks.");
  };

  const addForm = () => {
    const newForm = {
      id: Date.now(),
      teacherId: "",
      teacherName: "",
      className: "",
      section: "",
      subject: "",
      workType: [],
      projectedDate: "",
      classes: [],
      sections: [],
      subjects: [],
      filteredSubjects: [],
    };
    setForms([...forms, newForm]);
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast.success("Task deleted!");
  };

  const updateTask = (taskId, field, value) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    );
  };

  const getFilteredSubjectsForTask = (taskClass, taskSection) => {
    return (
      subjects?.filter(
        (sub) =>
          sub?.class?.value === taskClass && sub?.section?.value === taskSection
      ) || []
    );
  };

  const getSectionsForTask = (taskClass) => {
    const selectedClass = classes?.find((cls) => cls?.value === taskClass);
    return selectedClass?.sections || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (tasks.length === 0) {
      toast.error("Please add at least one task!");
      return;
    }

    setLoading(true);

    const currentCoordinatorName = typeof window !== "undefined" ? localStorage.getItem("name") || "" : "";
    const currentCoordinatorId = typeof window !== "undefined" ? localStorage.getItem("id") || "" : "";

    const assignments = tasks.map((task) => ({
      teacherId,
      teacherName,
      class: task.class,
      section: task.section,
      subject: task.subject,
      assignedWorkType: task.assignedWorkType,
      projectedDate: task.projectedDate,
      coordinatorName: currentCoordinatorName,
      coordinatorId: currentCoordinatorId,
      assignedDate: today,
      status: "assigned",
    }));

    try {
      const response = await axios.post(
        "/api/coordinator-assignment/",
        assignments
      );
      if (response.data.success) {
        toast.success(`${assignments.length} task(s) assigned successfully!`);
        setTimeout(() => navigate.push("/work-list"), 700);
      }
    } catch (error) {
      console.error("Assignment error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error assigning work");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assign Work to Teacher</h1>
        <button
          className="btn btn-outline"
          onClick={() => navigate.push("/work-list")}
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Teacher Select */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Teacher Name</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={teacherId}
              onChange={handleTeacherChange}
              required
              disabled={loading || teachers?.length === 0}
            >
              <option value="" disabled>
                {loading
                  ? "Loading teachers..."
                  : teachers?.length === 0
                  ? "No teachers found"
                  : "Select Teacher"}
              </option>
              {teachers?.map((teacher) => (
                <option key={teacher?._id} value={teacher?._id}>
                  {teacher?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Select */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Class</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={className}
              onChange={handleClassChange}
              disabled={!teacherId || classes?.length === 0}
            >
              <option value="" disabled>
                {teacherId
                  ? `Select Class (${classes?.length} available)`
                  : "Select Teacher First"}
              </option>
              {teacherId &&
                classes?.length > 0 &&
                classes?.map((cls) => (
                  <option key={cls?.value} value={cls?.value}>
                    {cls?.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Section Select */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Section</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={section}
              onChange={(e) => setSection(e?.target?.value)}
              disabled={!className || sections?.length === 0}
            >
              <option value="" disabled>
                {className
                  ? `Select Section (${sections?.length} available)`
                  : "Select Class First"}
              </option>
              {className &&
                sections?.length > 0 &&
                sections?.map((sec) => (
                  <option key={sec?.value} value={sec?.value}>
                    {sec?.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Subject Select */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Subject</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={subject}
              onChange={(e) => setSubject(e?.target?.value)}
              disabled={
                !className || !section || filteredSubjects?.length === 0
              }
            >
              <option value="" disabled>
                {className && section
                  ? filteredSubjects?.length === 0
                    ? "No subjects for this class/section"
                    : "Select Subject"
                  : "Select Class and Section First"}
              </option>
              {filteredSubjects?.map((sub) => (
                <option key={sub?.subject?.value} value={sub?.subject?.value}>
                  {sub?.subject?.label}
                </option>
              ))}
            </select>
          </div>

          {/* Work Type MultiSelect */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Type of Assigned Work</span>
            </label>
            <MultiSelect
              options={[
                { label: "Work Book", value: "Work Book" },
                { label: "Book", value: "Book" },
                { label: "Copy", value: "Copy" },
                { label: "Picture Book", value: "Picture Book" },
                { label: "Drawing With Craft", value: "Drawing With Craft" },
                { label: "Rhymes", value: "Rhymes" },
                { label: "File", value: "File" },
              ]}
              value={workType}
              onChange={setWorkType}
              labelledBy="Select work types"
              className="w-full"
            />
          </div>

          {/* Projected Date */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Projected Date of Submission</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={projectedDate}
              onChange={(e) => setProjectedDate(e?.target?.value)}
              min={today}
            />
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addMoreTask}
            className="btn btn-secondary"
            disabled={!teacherId}
          >
            Add Task to List for {teacherName}
          </button>
        </div>

        {/* Display Added Tasks as Editable Forms */}
        {tasks.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">
              Added Tasks ({tasks.length}):
            </h3>
            {tasks.map((task, index) => (
              <div key={task.id} className="bg-white p-4 mb-4 rounded border">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Task {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="btn btn-sm btn-error"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Class Select for Task */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Class</span>
                    </label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={task.class}
                      required
                      onChange={(e) =>
                        updateTask(task.id, "class", e.target.value)
                      }
                    >
                      {classes?.map((cls) => (
                        <option key={cls?.value} value={cls?.value}>
                          {cls?.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Section Select for Task */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Section</span>
                    </label>
                    <select
                      required
                      className="select select-bordered select-sm w-full"
                      value={task.section}
                      onChange={(e) =>
                        updateTask(task.id, "section", e.target.value)
                      }
                    >
                      {getSectionsForTask(task.class)?.map((sec) => (
                        <option key={sec?.value} value={sec?.value}>
                          {sec?.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Select for Task */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Subject</span>
                    </label>
                    <select
                      required
                      className="select select-bordered select-sm w-full"
                      value={task.subject}
                      onChange={(e) =>
                        updateTask(task.id, "subject", e.target.value)
                      }
                    >
                      {getFilteredSubjectsForTask(
                        task.class,
                        task.section
                      )?.map((sub) => (
                        <option
                          key={sub?.subject?.value}
                          value={sub?.subject?.value}
                        >
                          {sub?.subject?.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Work Type for Task */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Work Type</span>
                    </label>
                    <MultiSelect
                      options={[
                        { label: "Work Book", value: "Work Book" },
                        { label: "Book", value: "Book" },
                        { label: "Copy", value: "Copy" },
                        { label: "Picture Book", value: "Picture Book" },
                        { label: "Drawing With Craft", value: "Drawing With Craft" },
                        { label: "Rhymes", value: "Rhymes" },
                        { label: "File", value: "File" },
                      ]}
                      value={
                        task.assignedWorkType?.map((type) => ({
                          label: type,
                          value: type,
                        })) || []
                      }
                      onChange={(selected) =>
                        updateTask(
                          task.id,
                          "assignedWorkType",
                          selected.map((item) => item.value)
                        )
                      }
                      labelledBy="Select work types"
                      className="w-full"
                    />
                  </div>

                  {/* Projected Date for Task */}
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">Projected Date</span>
                    </label>
                    <input
                      required
                      type="date"
                      className="input input-bordered input-sm w-full"
                      value={task.projectedDate}
                      onChange={(e) =>
                        updateTask(task.id, "projectedDate", e.target.value)
                      }
                      min={today}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="form-control mt-6">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignWork;
