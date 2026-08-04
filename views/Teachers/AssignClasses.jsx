"use client";
import { useEffect, useState, useRef } from "react";
import { MultiSelect } from "react-multi-select-component";
import axios from "axios";
import { toast } from "react-toastify";
import { ColorRing } from "react-loader-spinner";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { RiFileExcel2Fill } from "react-icons/ri";

// Classes and sections are fetched dynamically

const optionsSubjects = [
  { label: "Hindi", value: "Hindi" },
  { label: "English", value: "English" },
  { label: "General", value: "General" },
  { label: "Hindi-1", value: "Hindi-1" },
  { label: "Hindi-2", value: "Hindi-2" },
  { label: "English-1", value: "English-1" },
  { label: "English-2", value: "English-2" },
  { label: "Maths", value: "Maths" },
  { label: "G.K", value: "G.K" },
  { label: "Science", value: "Science" },
  { label: "E.V.S", value: "E.V.S" },
  { label: "Physics", value: "Physics" },
  { label: "Chemistry", value: "Chemistry" },
  { label: "Biology", value: "Biology" },
  { label: "Geography", value: "Geography" },
  { label: "History", value: "History" },
  { label: "Sanskrit", value: "Sanskrit" },
  { label: "Art", value: "Art" },
  { label: "Computer", value: "Computer" },
  { label: "SST", value: "SST" },
  { label: "Msc.", value: "Msc." },
  { label: "IT", value: "IT" },
];

// Wings are fetched dynamically

const AssignClasses = () => {
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSectionsByClass, setSelectedSectionsByClass] = useState({});
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedWing, setSelectedWing] = useState([]);
  
  // Dynamic structure state
  const [academicStructure, setAcademicStructure] = useState([]);
  const [optionsWing, setOptionsWing] = useState([]);
  const [optionsClasses, setOptionsClasses] = useState([]);
  const [optionsSection, setOptionsSection] = useState([]);

  useEffect(() => {
    const fetchStructures = async () => {
      try {
        const res = await axios.get("/api/academic-structure");
        if (res.data.success) {
          const data = res.data.data;
          setAcademicStructure(data);

          const wings = data.map((w) => ({
            label: w.wingName,
            value: w.classes.map((c) => c.className).join(","),
          }));
          setOptionsWing(wings);

          const allClasses = [];
          const allSections = new Set();
          data.forEach((w) => {
            w.classes.forEach((c) => {
              allClasses.push({ label: `Class ${c.className}`, value: c.className });
              c.sections.forEach((s) => allSections.add(s));
            });
          });
          setOptionsClasses(allClasses);

          const sections = Array.from(allSections).map((s) => ({
            label: `Section ${s}`,
            value: s,
          }));
          setOptionsSection(sections);
        }
      } catch (error) {
        console.error("Error fetching academic structure", error);
      }
    };
    fetchStructures();
  }, []);
  const [loading, setLoading] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [teachers, setTeachers] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [roleForRemark, setRoleForRemark] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allTeacherData, setAllTeacherData] = useState([]);
  const [classTeacherClass, setClassTeacherClass] = useState("");
  const [classTeacherSection, setClassTeacherSection] = useState("");
  const [selectedSubjectsByClassSection, setSelectedSubjectsByClassSection] =
    useState({});

  const tableRef = useRef(allTeacherData);

  // Handle class selection change
  const handleClassChange = (selected) => {
    const newSectionsByClass = { ...selectedSectionsByClass };
    const newSubjectsByClassSection = { ...selectedSubjectsByClassSection };
    const currentClassValues = selected.map((c) => c.value);

    // Remove sections for deselected classes
    Object.keys(newSectionsByClass).forEach((classValue) => {
      if (!currentClassValues.includes(classValue)) {
        delete newSectionsByClass[classValue];
      }
    });

    // Remove subjects for deselected classes
    Object.keys(newSubjectsByClassSection).forEach((key) => {
      const [classValue] = key.split("-");
      if (!currentClassValues.includes(classValue)) {
        delete newSubjectsByClassSection[key];
      }
    });

    setSelectedSectionsByClass(newSectionsByClass);
    setSelectedSubjectsByClassSection(newSubjectsByClassSection);
    setSelectedClasses(selected);

    // Reset class teacher if the selected class is removed
    if (!currentClassValues.includes(classTeacherClass)) {
      setClassTeacherClass("");
      setClassTeacherSection("");
    }
  };

  const handleSubjectChange = (classValue, sectionValue, selectedSubjects) => {
    setSelectedSubjectsByClassSection((prev) => ({
      ...prev,
      [`${classValue}-${sectionValue}`]: selectedSubjects,
    }));
  };
  // Handle section selection change for a specific class
  const handleSectionChange = (classValue, selected) => {
    setSelectedSectionsByClass((prev) => ({
      ...prev,
      [classValue]: selected,
    }));
  };

  // Fetch all users
  const fetchAllUser = () => {
    setLoading(true);
    try {
      axios
        .get(`/api/user/teacher`)
        .then((res) => {
          if (res.data.success) {
            setTeachers(res.data.data);
          }
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Filter users by role
  useEffect(() => {
    if (roleForRemark) {
      axios
        .get(
          `${
            ""
          }/api/user/list-role?role=${roleForRemark}`
        )
        .then((res) => {
          if (res.data.success) {
            setFilteredUsers(res.data.data);
          }
        })
        .catch((err) => {
          toast.error("Failed to fetch users for selected role.");
        });
    }
  }, [roleForRemark]);

  const fetchAllTeacherData = async () => {
    try {
      const response = await axios.get(
        `/api/user/teacher?all=true`
      );
      if (response.data.success) {
        setAllTeacherData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllTeacherData();
    fetchAllUser();
  }, []);

  const assignClassAndDivision = () => {
    if (!selectedTeacherId) {
      toast.error("Please Select Teacher !");
      return;
    }

    if (selectedClasses.length === 0) {
      toast.error("Please Select At Least One Class!");
      return;
    }

    // Check if all selected classes have at least one section
    const allClassesHaveSections = selectedClasses.every(
      (cls) =>
        selectedSectionsByClass[cls.value] &&
        selectedSectionsByClass[cls.value].length > 0
    );

    if (!allClassesHaveSections) {
      toast.error("Please Select At Least One Section For Each Class!");
      return;
    }

    // Prepare the data for submission
    const assignedClassesWithSections = selectedClasses.map((cls) => ({
      label: cls.label,
      value: cls.value,
      sections: selectedSectionsByClass[cls.value] || [],
    }));

    // Also maintain the flat list of sections for backward compatibility
    const assignedSections = selectedClasses.flatMap((cls) => {
      const sections = selectedSectionsByClass[cls.value] || [];
      return sections.map((sec) => ({
        label: sec.label,
        value: sec.value,
      }));
    });

    // Transform subjects to match schema
    const formattedAssignedSubjects = Object.entries(
      selectedSubjectsByClassSection
    )
      .map(([key, subjects]) => {
        const [classValue, sectionValue] = key.split("-");
        const classObj = selectedClasses.find((c) => c.value === classValue);
        const sectionObj = selectedSectionsByClass[classValue]?.find(
          (s) => s.value === sectionValue
        );

        return subjects.map((subject) => ({
          subject: {
            label: subject.label,
            value: subject.value,
          },
          class: {
            label: classObj?.label || "",
            value: classValue,
          },
          section: {
            label: sectionObj?.label || "",
            value: sectionValue,
          },
        }));
      })
      .flat();

    const data = {
      assignedClasses: assignedClassesWithSections,
      assignedSections: assignedSections,
      assignedWings: selectedWing,
      assignedSubjects: formattedAssignedSubjects,
      classTeacher:
        classTeacherClass && classTeacherSection
          ? {
              class: classTeacherClass,
              section: classTeacherSection,
            }
          : null,
    };

    setBtnDisable(true);
    axios
      .put(
        `${
          ""
        }/api/user/${selectedTeacherId}`,
        data
      )
      .then((res) => {
        if (res.data.success) {
          toast.success("Teacher Updated Successfully !");
          fetchAllUser();
          // Reset form
          setSelectedClasses([]);
          setSelectedSectionsByClass({});
          setSelectedWing([]);
          setSelectedSubjects([]);
          setSelectedTeacherId(null);
          setClassTeacherClass("");
          setClassTeacherSection("");
        }
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      })
      .finally(() => {
        setBtnDisable(false);
      });
  };

  const setUpdateUserData = (data) => {
    // Set the role first
    setRoleForRemark(data.role);

    // Set classes
    setSelectedClasses(data.assignedClasses);

    // Convert assignedSections array to the sectionsByClass format
    const sectionsByClass = {};

    // First try to get sections from the nested structure if available
    if (data.assignedClasses && data.assignedClasses[0]?.sections) {
      data.assignedClasses.forEach((cls) => {
        if (cls.sections && cls.sections.length > 0) {
          sectionsByClass[cls.value] = cls.sections;
        }
      });
    }
    // Fallback to the flat assignedSections if no nested sections
    else if (data.assignedSections) {
      data.assignedSections.forEach((item) => {
        if (!sectionsByClass[item.class]) {
          sectionsByClass[item.class] = [];
        }
        sectionsByClass[item.class].push({
          label: `Section ${item.value || item.section}`,
          value: item.value || item.section,
        });
      });
    }

    setSelectedSectionsByClass(sectionsByClass);
    setSelectedWing(data.assignedWings);
    setSelectedTeacherId(data._id);
    setSelectedSubjects(data.assignedSubjects);

    // ADD THIS: Populate selectedSubjectsByClassSection from existing data
    const subjectsByClassSection = {};
    if (data.assignedSubjects) {
      data.assignedSubjects.forEach((subjectData) => {
        const key = `${subjectData.class.value}-${subjectData.section.value}`;
        if (!subjectsByClassSection[key]) {
          subjectsByClassSection[key] = [];
        }
        subjectsByClassSection[key].push(subjectData.subject);
      });
    }
    setSelectedSubjectsByClassSection(subjectsByClassSection);

    setClassTeacherClass(data.classTeacher?.class || "");
    setClassTeacherSection(data.classTeacher?.section || "");
  };

  const filteredTeachers =
    teachers?.filter((teacher) => {
      const searchLower = searchQuery.toLowerCase();
      const assignedClassesText =
        teacher.assignedClasses
          ?.map((cls) => cls.value)
          .join(" ")
          .toLowerCase() || "";

      return (
        (teacher.name && teacher.name.toLowerCase().includes(searchLower)) ||
        (teacher.email && teacher.email.toLowerCase().includes(searchLower)) ||
        (teacher.role && teacher.role.toLowerCase().includes(searchLower)) ||
        assignedClassesText.includes(searchLower)
      );
    }) || [];

  function generateWhatsAppMessage() {
    const dataToUse = searchQuery ? filteredTeachers : teachers;
    const message = `Teacher Assignments - Total: ${
      dataToUse?.length || 0
    } teachers\n`;
    const teacherList = dataToUse
      ?.map(
        (teacher) =>
          `${teacher.name} - Role: ${teacher.role} - Classes: ${
            teacher.assignedClasses?.map((c) => c.value).join(", ") || "None"
          }`
      )
      .join("\n");
    return `${message}${teacherList}`;
  }

  return (
    <>
      {/* <Toaster draggable={true} /> */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Role</span>
          </label>
          <select
            value={roleForRemark}
            onChange={(e) => setRoleForRemark(e.target.value)}
            className="select select-bordered border-gray-300"
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="Teacher">Teacher</option>
            <option value="Senior Coordinator">Senior Coordinator</option>
            <option value="Junior Coordinator">Junior Coordinator</option>
          </select>
        </div>

        {roleForRemark && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Select{" "}
                {roleForRemark === "Teacher"
                  ? "Teacher"
                  : roleForRemark === "Senior Coordinator"
                  ? "Senior Coordinator"
                  : "Junior Coordinator"}
              </span>
            </label>
            <select
              value={selectedTeacherId || ""}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="select select-bordered border-gray-300"
            >
              <option value="" disabled>
                Select {roleForRemark}
              </option>
              {filteredUsers.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Classes To Assign</span>
          </label>
          <MultiSelect
            className="rounded-md p-1"
            options={optionsClasses}
            value={selectedClasses}
            onChange={handleClassChange}
            labelledBy="Select Classes To Assign"
          />
        </div>

        {/* Render section selectors for each selected class */}

        {/* <div className="form-control">
          <label className="label">
            <span className="label-text">Select Subjects To Assign</span>
          </label>
          <MultiSelect
            className="rounded-md p-1"
            options={optionsSubjects}
            value={selectedSubjects}
            onChange={setSelectedSubjects}
            labelledBy="Select Subjects To Assign"
          />
        </div> */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Class Teacher - Select Class</span>
          </label>
          <select
            value={classTeacherClass}
            onChange={(e) => {
              setClassTeacherClass(e.target.value);
              setClassTeacherSection(""); // Reset section when class changes
            }}
            className="select select-bordered border-gray-300"
          >
            <option value="" disabled>
              Select Class for Class Teacher
            </option>
            {selectedClasses.map((cls) => (
              <option key={cls.value} value={cls.value}>
                {cls.label}
              </option>
            ))}
          </select>
        </div>

        {classTeacherClass && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Class Teacher - Select Section</span>
            </label>
            <select
              value={classTeacherSection}
              onChange={(e) => setClassTeacherSection(e.target.value)}
              className="select select-bordered border-gray-300"
            >
              <option value="" disabled>
                Select Section
              </option>
              {selectedSectionsByClass[classTeacherClass]?.map((section) => (
                <option key={section.value} value={section.value}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Wing To Assign</span>
          </label>
          <MultiSelect
            className="rounded-md p-1"
            options={optionsWing}
            value={selectedWing}
            onChange={setSelectedWing}
            labelledBy="Select Wings To Assign"
          />
        </div>
        {selectedClasses.map((cls) => {
          const sections = selectedSectionsByClass[cls.value] || [];
          return (
            <div
              key={cls.value}
              className="space-y-2 border p-4 rounded-lg bg-gray-50"
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    {cls.label} - Sections
                  </span>
                </label>
                <MultiSelect
                  className="rounded-md p-1"
                  options={optionsSection}
                  value={sections}
                  onChange={(selected) =>
                    handleSectionChange(cls.value, selected)
                  }
                  labelledBy={`Select sections for ${cls.label}`}
                />
              </div>

              {/* Subject selection for each section */}
              {sections.map((sec) => (
                <div
                  key={`${cls.value}-${sec.value}`}
                  className="form-control ml-4 mt-4"
                >
                  <label className="label">
                    <span className="label-text font-medium">
                      Subjects for {cls.label} - {sec.label}
                    </span>
                  </label>
                  <MultiSelect
                    className="rounded-md p-1"
                    options={optionsSubjects}
                    value={
                      selectedSubjectsByClassSection[
                        `${cls.value}-${sec.value}`
                      ] || []
                    }
                    onChange={(selected) =>
                      handleSubjectChange(cls.value, sec.value, selected)
                    }
                    labelledBy={`Select subjects for ${cls.label}-${sec.label}`}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="form-control mt-6 w-fit">
        <button
          onClick={assignClassAndDivision}
          disabled={btnDisable}
          className="btn btn-neutral"
        >
          {btnDisable ? "Processing..." : "Assign"}
        </button>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            generateWhatsAppMessage()
          )}`}
          className="btn btn-warning text-white"
        >
          Forward to WhatsApp
        </a>
        <DownloadTableExcel
          filename="Teacher table"
          sheet="Teacher Data"
          currentTableRef={tableRef?.current}
        >
          <button className="btn btn-success btn-md text-white">
            Export To Excel <RiFileExcel2Fill />
          </button>
        </DownloadTableExcel>
      </div>

      <div className="w-full mb-0 mt-4">
        <input
          type="text"
          placeholder="Search by name, email, role or assigned classes..."
          className="input input-bordered w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Teacher list table */}
      <div className="mt-6 shadow-sm border rounded-lg overflow-x-auto relative">
        {loading ? (
          <div className="flex items-center justify-center m-auto mt-12">
            <ColorRing
              visible={true}
              height="80"
              width="80"
              ariaLabel="color-ring-loading"
              wrapperStyle={{}}
              wrapperClass="color-ring-wrapper"
              colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
            />
          </div>
        ) : teachers ? (
          <table ref={tableRef} className="w-full table-auto text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b">
              <tr>
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Classes</th>
                <th className="py-3 px-3">Subjects</th>
                <th className="py-3 px-3">Class Teacher</th>
                <th className="py-3 px-3">Wings</th>
                {/* <th className="py-3 px-3">Status</th> */}
                <th className="py-3 px-3 sticky right-0 bg-gray-50 border-l">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              {filteredTeachers.map((item) => (
                <tr key={item._id}>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-10 h-10">
                          <img src={item?.avatar?.secure_url?.src || item?.avatar?.secure_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="avatar" />
                        </div>
                      </div>
                      <div className="font-bold truncate max-w-[120px]">
                        {item.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 truncate max-w-[150px]">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {item.role === "Admin" && (
                        <span className="badge badge-info badge-md text-white">
                          Admin
                        </span>
                      )}
                      {item.role === "Teacher" && (
                        <span className="badge badge-secondary badge-md text-white">
                          Teacher
                        </span>
                      )}
                      {item.role === "Senior Coordinator" && (
                        <span className="badge bg-red-900 badge-warning badge-md text-white">
                          Senior Coordinator
                        </span>
                      )}
                      {item.role === "Junior Coordinator" && (
                        <span className="badge bg-red-500 text-white badge-md">
                          Junior Coordinator
                        </span>
                      )}

                      {/* Secondary Role Badge below primary role */}
                      {item.secondaryRole && (
                        <span className="badge bg-green-600 text-white badge-md">
                          {item.secondaryRole}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1 min-w-[200px] max-w-[280px] max-h-[120px] overflow-y-auto pr-2">
                      {item?.assignedClasses?.length
                        ? item.assignedClasses.map((res) => (
                            <div
                              key={res.value}
                              className="flex flex-wrap gap-1"
                            >
                              {res.sections?.length > 0 ? (
                                res.sections.map((sec) => (
                                  <span
                                    key={`${res.value}-${sec.value}`}
                                    className="badge badge-sm badge-secondary whitespace-nowrap"
                                  >
                                    {res.value}-{sec.value}
                                  </span>
                                ))
                              ) : (
                                <span className="badge badge-sm badge-secondary whitespace-nowrap">
                                  {res.value}
                                </span>
                              )}
                            </div>
                          ))
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1 min-w-[200px] max-w-[280px] max-h-[120px] overflow-y-auto pr-2">
                      {item?.assignedSubjects?.length
                        ? item.assignedSubjects.map((res, i) => (
                            <span
                              key={i}
                              className="badge badge-sm badge-secondary whitespace-nowrap"
                            >
                              {res.class?.value} - {res.section?.value} :{" "}
                              {res.subject?.value}
                            </span>
                          ))
                        : "N/A"}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {item?.classTeacher?.class &&
                      item?.classTeacher?.section ? (
                        <span className="badge badge-sm badge-secondary whitespace-nowrap">
                          {item.classTeacher.class}-{item.classTeacher.section}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {item?.assignedWings?.length
                        ? item.assignedWings.map((res) => (
                            <span
                              key={res.value}
                              className="badge badge-sm badge-secondary whitespace-nowrap"
                            >
                              {res.label}
                            </span>
                          ))
                        : "N/A"}
                    </div>
                  </td>
                  {/* <td className="px-3 py-4">
                    {item.isActive ? (
                      <span className="badge badge-success badge-sm text-white">
                        Active
                      </span>
                    ) : (
                      <span className="badge badge-error badge-sm text-white">
                        Inactive
                      </span>
                    )}
                  </td> */}
                  <td className="px-3 py-4 sticky right-0 bg-white border-l">
                    <button
                      onClick={() => setUpdateUserData(item)}
                      className="btn btn-outline btn-sm"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center py-4 font-semibold">
            No User Data !
          </div>
        )}
      </div>
    </>
  );
};

export default AssignClasses;
