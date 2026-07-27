"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ColorRing } from "react-loader-spinner";

const ManageStructure = () => {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWingName, setNewWingName] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [selectedWingId, setSelectedWingId] = useState("");
  const [editingSections, setEditingSections] = useState(null); // { wingId, classId, sectionsString }

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/academic-structure`
      );
      if (res.data.success) {
        const order = ["Pre-Primary", "Primary", "Junior", "Secondary", "Senior Secondary"];
        const sortedStructures = res.data.data.sort((a, b) => {
          const indexA = order.indexOf(a.wingName);
          const indexB = order.indexOf(b.wingName);
          // If both exist in order array, sort by index
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          // If only A exists, it comes first
          if (indexA !== -1) return -1;
          // If only B exists, it comes first
          if (indexB !== -1) return 1;
          // If neither exists, sort alphabetically
          return a.wingName.localeCompare(b.wingName);
        });
        setStructures(sortedStructures);
      }
    } catch (error) {
      toast.error("Failed to load academic structures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleAddWing = async (e) => {
    e.preventDefault();
    if (!newWingName.trim()) return;
    try {
      const res = await axios.post(
        `/api/academic-structure`,
        { wingName: newWingName }
      );
      if (res.data.success) {
        toast.success("Wing added successfully");
        setNewWingName("");
        fetchStructures();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding wing");
    }
  };

  const handleDeleteWing = async (wingId) => {
    if (!confirm("Are you sure you want to delete this entire Wing?")) return;
    try {
      const res = await axios.delete(
        `/api/academic-structure/wing/${wingId}`
      );
      if (res.data.success) {
        toast.success("Wing deleted successfully");
        fetchStructures();
      }
    } catch (error) {
      toast.error("Error deleting wing");
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!selectedWingId || !newClassName.trim()) return;
    try {
      const res = await axios.post(
        `/api/academic-structure/wing/${selectedWingId}/class`,
        { className: newClassName, sections: [] }
      );
      if (res.data.success) {
        toast.success("Class added successfully");
        setNewClassName("");
        setSelectedWingId("");
        fetchStructures();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding class");
    }
  };

  const handleDeleteClass = async (wingId, classId) => {
    if (!confirm("Are you sure you want to delete this Class?")) return;
    try {
      const res = await axios.delete(
        `/api/academic-structure/wing/${wingId}/class/${classId}`
      );
      if (res.data.success) {
        toast.success("Class deleted successfully");
        fetchStructures();
      }
    } catch (error) {
      toast.error("Error deleting class");
    }
  };

  const saveSections = async () => {
    if (!editingSections) return;
    try {
      const sectionArray = editingSections.sectionsString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      const res = await axios.put(
        `/api/academic-structure/wing/${editingSections.wingId}/class/${editingSections.classId}/sections`,
        { sections: sectionArray }
      );

      if (res.data.success) {
        toast.success("Sections updated successfully");
        setEditingSections(null);
        fetchStructures();
      }
    } catch (error) {
      toast.error("Error updating sections");
    }
  };

  return (
    <>
      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Manage Academic Structure
        </h1>

        {/* Add Wing and Add Class Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <form
            onSubmit={handleAddWing}
            className="bg-gray-50 p-4 rounded shadow-sm border border-gray-200"
          >
            <h2 className="text-lg font-semibold mb-3">Add New Wing</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="e.g. Pre-Primary"
                value={newWingName}
                onChange={(e) => setNewWingName(e.target.value)}
                className="flex-1 input input-bordered"
                required
              />
              <button type="submit" className="btn btn-primary">
                Add Wing
              </button>
            </div>
          </form>

          <form
            onSubmit={handleAddClass}
            className="bg-gray-50 p-4 rounded shadow-sm border border-gray-200"
          >
            <h2 className="text-lg font-semibold mb-3">Add New Class</h2>
            <div className="flex flex-col space-y-2">
              <select
                value={selectedWingId}
                onChange={(e) => setSelectedWingId(e.target.value)}
                className="select select-bordered"
                required
              >
                <option value="" disabled>
                  Select Wing...
                </option>
                {structures.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.wingName}
                  </option>
                ))}
              </select>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. Nursery"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="flex-1 input input-bordered"
                  required
                />
                <button type="submit" className="btn btn-primary">
                  Add Class
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Display Current Structure */}
        {loading ? (
          <div className="flex justify-center mt-12">
            <ColorRing visible={true} height="80" width="80" />
          </div>
        ) : (
          <div className="space-y-6">
            {structures.map((wing) => (
              <div
                key={wing._id}
                className="border border-gray-300 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-700">
                    {wing.wingName}
                  </h3>
                  <button
                    onClick={() => handleDeleteWing(wing._id)}
                    className="btn btn-sm btn-error"
                  >
                    Delete Wing
                  </button>
                </div>
                <div className="p-4">
                  {wing.classes.length === 0 ? (
                    <p className="text-gray-500 italic">No classes added yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {wing.classes.map((cls) => (
                        <div
                          key={cls._id}
                          className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded shadow-sm"
                        >
                          <div className="flex-1">
                            <span className="font-semibold text-lg inline-block w-32">
                              {cls.className}
                            </span>
                            <span className="text-gray-600 ml-4">
                              Sections:{" "}
                              {editingSections?.classId === cls._id ? (
                                <input
                                  type="text"
                                  value={editingSections.sectionsString}
                                  onChange={(e) =>
                                    setEditingSections({
                                      ...editingSections,
                                      sectionsString: e.target.value,
                                    })
                                  }
                                  className="input input-bordered input-sm w-48"
                                  placeholder="A, B, C"
                                />
                              ) : (
                                <span className="font-medium">
                                  {cls.sections.length > 0
                                    ? cls.sections.join(", ")
                                    : "None"}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="space-x-2">
                            {editingSections?.classId === cls._id ? (
                              <>
                                <button
                                  onClick={saveSections}
                                  className="btn btn-sm btn-success"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingSections(null)}
                                  className="btn btn-sm btn-ghost"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditingSections({
                                    wingId: wing._id,
                                    classId: cls._id,
                                    sectionsString: cls.sections.join(", "),
                                  })
                                }
                                className="btn btn-sm btn-outline btn-info"
                              >
                                Edit Sections
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleDeleteClass(wing._id, cls._id)
                              }
                              className="btn btn-sm btn-outline btn-error"
                            >
                              Delete Class
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ManageStructure;
