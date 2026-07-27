"use client";
import { useEffect, useState, useRef } from "react";
import { ColorRing } from "react-loader-spinner";
import axios from "axios";
import { toast } from "react-toastify";
import { MultiSelect } from "react-multi-select-component";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { RiFileExcel2Fill } from "react-icons/ri";
import ToggleButton from "../toggle/ToggleButton";

// Dynamic academic structure will be fetched from API
const ManageAdmin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [number, setNumber] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState([]);
  const [classAssigned, setClass] = useState("");
  const [division, setDivision] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedWing, setSelectedWing] = useState("");
  const [selectedWingClasses, setSelectedWingClasses] = useState([]);
  const [updateUserData, setUpdateUserData] = useState(null);
  const [academicStructure, setAcademicStructure] = useState([]);

  useEffect(() => {
    const fetchStructures = async () => {
      try {
        const res = await axios.get("/api/academic-structure");
        if (res.data.success) {
          setAcademicStructure(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching academic structure", error);
      }
    };
    fetchStructures();
  }, []);

  const activeWing = academicStructure.find((w) => w.wingName === selectedWing);
  const activeWingClassOptions = activeWing
    ? activeWing.classes.map((c) => ({
        label: c.className,
        value: c.className,
      }))
    : [];
  const [secondaryRole, setSecondaryRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const tableRef = useRef(null);
  const [allUserData, setAllUserData] = useState([]);
  // const [rfid, setRfid] = useState("");

  const addUser = () => {
    setBtnDisable(true);
    const missingFields = [];

    if (!name) missingFields.push("Name");
    if (!email) missingFields.push("Email");
    if (!updateUserData && !password) missingFields.push("Password");
    if (!number) missingFields.push("Number");
    if (!role) missingFields.push("Role");

    if (missingFields.length > 0) {
      const missingFieldsMsg = `Please input all the following fields: ${missingFields.join(
        ", "
      )}`;
      toast.error(missingFieldsMsg);
      setBtnDisable(false);
      return;
    }
    let requestData;
    let headers = {};
    
    if (avatar) {
      // Use FormData when file is present
      requestData = new FormData();
      requestData.append("email", email);
      requestData.append("password", password);
      requestData.append("name", name);
      requestData.append("number", number);
      requestData.append("avatar", avatar);
      requestData.append("role", role);
      requestData.append("secondaryRole", secondaryRole);
      requestData.append("class", classAssigned);
      requestData.append("division", division);
      requestData.append("assignedWings", JSON.stringify(selectedWingClasses));
    } else {
      // Use JSON when no file
      headers['Content-Type'] = 'application/json';
      requestData = {
        email,
        password,
        name,
        number,
        role,
        secondaryRole,
        class: classAssigned,
        division,
        assignedWings: selectedWingClasses
      };
    }
    
    let data = {
      assignedWings: selectedWingClasses,
    };
    // formData.append("rfid", rfid);

    try {
      {
        updateUserData
          ? axios
              .put(
                `/api/user/${
                  updateUserData._id
                }`,
                requestData,
                { headers }
              )
              .then((res) => {
                axios.put(
                  `/api/user/${
                    updateUserData._id
                  }`,
                  data
                );
                console.log(res);
                if (res.data.success) {
                  document.getElementById("user_form_modal")?.close();
                  setBtnDisable(false);
                  toast.success("User Updated Successfully !");
                  setRole("");
                  setSecondaryRole("");
                  setName("");
                  setEmail("");
                  setClass("");
                  setDivision("");
                  setNumber("");
                  setPassword("");
                  setAvatar("");
                  // setRfid("");
                  setTimeout(() => {
                    fetchAllUser();
                  }, 400);
                }
              })
              .catch((error) => {
                console.log(error);
                toast.error(error.response.data.message);
                setBtnDisable(false);
              })
              .finally(() => {
                setBtnDisable(false);
              })
          : axios
              .post(
                `/api/user/register`,
                requestData,
                { headers }
              )
              .then((res) => {
                console.log(res);
                if (res.data.success) {
                  document.getElementById("user_form_modal")?.close();
                  axios.put(
                    `/api/user/${
                      res.data.data._id
                    }`,
                    data
                  );
                  setBtnDisable(false);
                  toast.success("User Added Successfully !");
                  setRole("");
                  setSecondaryRole("");
                  setName("");
                  setEmail("");
                  setClass("");
                  setDivision("");
                  setNumber("");
                  setPassword("");
                  setAvatar("");
                  // setRfid("");
                  setTimeout(() => {
                    fetchAllUser();
                  }, 400);
                }
              })
              .catch((error) => {
                console.log(error);
                toast.error(error.response.data.message);
                setBtnDisable(false);
              })
              .finally(() => {
                setBtnDisable(false);
              });
      }
    } catch (error) {
      console.log(error);
      setBtnDisable(false);
    }
  };

  // LIST
  // `/api/user/all?page=${currentPage}`
  const fetchAllUser = () => {
    setLoading(true);
    try {
      axios
        .get(`/api/user/all`)
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            setLoading(false);
            setUserData(res.data.data);
            setTotalPages(res.data.count);
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.message);
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUser();
  }, []);

  useEffect(() => {
    if (updateUserData) {
      setName(updateUserData.name);
      setEmail(updateUserData.email);
      setClass(updateUserData.class);
      setDivision(updateUserData.division);
      setNumber(updateUserData.number);
      setPassword(updateUserData.password);
      setRole(updateUserData.role);
      setSecondaryRole(updateUserData.secondaryRole || "");
      // setRfid(updateUserData.rfid || "");
    }
  }, [updateUserData]);

  const filteredUsers =
    userData?.filter((user) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (user?.name && user.name.toLowerCase().includes(searchLower)) ||
        (user?.role && user.role.toLowerCase().includes(searchLower)) ||
        (user?.secondaryRole &&
          user.secondaryRole.toLowerCase().includes(searchLower)) ||
        (user?.number && user.number.toString().includes(searchQuery))
      );
    }) || [];

  function generateWhatsAppMessage(users) {
    const message = `Admin/User List - Total: ${users?.length || 0} users\n`;
    console.log(`Message ${message}`);
    const userList = users
      ?.map(
        (user) => `${user.name} - Role: ${user.role} - Email: ${user.email}`
      )
      .join("\n");
    return `${message}${userList}`;
  }

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

  // const renderPagination = () => {
  //   const pageNumbers = [];
  //   const maxPagesToShow = 5;
  //   const maxPage = Math.ceil(totalPages / 10);
  //   console.log(maxPage);
  //   for (let i = 1; i <= maxPage; i++) {
  //     pageNumbers.push(i);
  //   }

  //   let startPage;
  //   let endPage;

  //   if (maxPage <= maxPagesToShow) {
  //     startPage = 1;
  //     endPage = maxPage;
  //   } else {
  //     if (currentPage <= maxPagesToShow - 2) {
  //       startPage = 1;
  //       endPage = maxPagesToShow;
  //     } else if (currentPage + 1 >= maxPage) {
  //       startPage = maxPage - maxPagesToShow + 1;
  //       endPage = maxPage;
  //     } else {
  //       startPage = currentPage - 1;
  //       endPage = currentPage + 2;
  //     }
  //   }

  //   const visiblePages = pageNumbers.slice(startPage - 1, endPage);
  //   const isFirstPage = currentPage === 1;
  //   const isLastPage = currentPage === maxPage;

  //   return (
  //     <nav className="mt-12 flex justify-center">
  //       <ul className="join ">
  //         <li className="page-item">
  //           <button
  //             onClick={() => handlePageChange(currentPage - 1)}
  //             className={`px-4 py-2 cursor-pointer rounded-md  mx-1 ${
  //               isFirstPage ? "disabled" : ""
  //             }`}
  //             disabled={isFirstPage}
  //           >
  //             Previous
  //           </button>
  //         </li>
  //         {visiblePages?.map((number) => (
  //           <li key={number} className="page-item">
  //             <button
  //               onClick={() => handlePageChange(number)}
  //               className={`${
  //                 currentPage === number ? "bg-gray-400 text-white" : ""
  //               } px-4 py-2 mx-1 rounded-md`}
  //             >
  //               {number}
  //             </button>
  //           </li>
  //         ))}
  //         <li className="page-item">
  //           <button
  //             onClick={() => handlePageChange(currentPage + 1)}
  //             className={`px-4 py-2 cursor-pointer mx-1 bg-black rounded-md text-white ${
  //               isLastPage ? "disabled" : ""
  //             }`}
  //             disabled={isLastPage}
  //           >
  //             Next
  //           </button>
  //         </li>
  //       </ul>
  //     </nav>
  //   );
  // };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      axios
        .delete(`/api/user/${id}`)
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            toast.success("Deleted Successfully");
            fetchAllUser();
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.message);
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  const handleDeleteModal = (product) => {
    // Find the product to delete based on productId
    console.log(product);
    // Set the product to delete and open the modal
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // Call your delete function here with productToDelete
    // ...
    if (productToDelete == "delete-all") {
      handleDelete("delete-all");
    }
    handleDelete(productToDelete._id);
    // Close the modal
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    // Close the modal without deleting
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleToggleStatus = (id, currentStatus) => {
    const updatedStatus = !currentStatus;

    // Optimistic UI update
    setUserData((prevData) =>
      prevData.map((user) =>
        user._id === id ? { ...user, isActive: updatedStatus } : user
      )
    );

    // Send API request
    axios
      .put(`/api/user/status/${id}`, {
        isActive: updatedStatus,
      })
      .then((res) => {
        if (res.data) {
          toast.success("Status updated successfully");
        }
      })
      .catch((error) => {
        toast.error("Failed to update status");
        // Revert on error
        setUserData((prevData) =>
          prevData.map((user) =>
            user._id === id ? { ...user, isActive: currentStatus } : user
          )
        );
      });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      setAvatar(file);
    } else {
      toast.error("Something Went Wrong !");
    }
  };

  // console.log(selectedWingClasses);
  return (
    <>
      <div className="flex justify-end mb-4 mt-2 pr-4">
        <button
          className="btn btn-primary text-white shadow-md hover:scale-105 transition-transform"
          onClick={() => {
            setUpdateUserData(null);
            setName("");
            setEmail("");
            setRole("");
            setSecondaryRole("");
            setPassword("");
            setNumber("");
            setAvatar("");
            document.getElementById("user_form_modal").showModal();
          }}
        >
          + Add New User
        </button>
      </div>

      <dialog id="user_form_modal" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                setUpdateUserData(null);
              }}
            >
              ✕
            </button>
          </form>
          <h3 className="font-bold text-xl mb-6 text-gray-700 border-b pb-2">
            {updateUserData ? `Update ${updateUserData.name}` : "Add New User"}
          </h3>

          <div className="grid md:grid-cols-3 gap-3">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered"
            type="text"
            placeholder="Name"
            value={name}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered"
            type="text"
            placeholder="Email"
            value={email}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="input input-bordered"
            type="text"
            placeholder="Password"
            value={password}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Mobile Number</span>
          </label>
          <input
            onChange={(e) => setNumber(e.target.value)}
            className="input input-bordered"
            type="number"
            value={number}
            placeholder="Number"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Role</span>
          </label>
          <select
            onChange={(e) => setRole(e.target.value)}
            value={role}
            className="select select-bordered border-gray-300"
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="Admin">Admin</option>
            <option value="Teacher">Teacher</option>
            <option value="Senior Coordinator">Senior Coordinator</option>
            <option value="Junior Coordinator">Junior Coordinator</option>
            <option value="Lab Instructor"> Lab Instructor</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Secondary Role</span>
          </label>
          <div className="relative">
            <select
              onChange={(e) => setSecondaryRole(e.target.value)}
              value={secondaryRole}
              className="select select-bordered border-gray-300 w-full pr-10"
            >
              <option value="" disabled>
                Choose Secondary Role
              </option>
              <option value="Teacher">Teacher</option>
              <option value="Senior Coordinator">Senior Coordinator</option>
              <option value="Junior Coordinator">Junior Coordinator</option>
              <option value="Lab Instructor"> Lab Instructor</option>
            </select>
          </div>
          {/* {secondaryRole && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md border-l-4 border-blue-400">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Selected:</span> {secondaryRole}
              </p>
            </div>
          )} */}
        </div>

        {role == "Coordinator" && (
          <>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select Wing To Assign</span>
              </label>
              <select
                onChange={(e) => {
                  setSelectedWing(e.target.value);
                  setSelectedWingClasses([]);
                }}
                className="select select-bordered border-gray-300"
                value={selectedWing}
              >
                <option value="" disabled>
                  Select Wing
                </option>
                {academicStructure.map((w) => (
                  <option key={w._id} value={w.wingName}>
                    {w.wingName}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {role == "Coordinator" && selectedWing && activeWingClassOptions.length > 0 && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Select Classes To Assign</span>
            </label>
            <MultiSelect
              className="rounded-md p-1"
              options={activeWingClassOptions}
              value={selectedWingClasses}
              onChange={setSelectedWingClasses}
              labelledBy="Select Wings Class To Assign"
            />
          </div>
        )}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Avatar</span>
          </label>
          <input
            className="input input-bordered"
            type="file"
            accept="image/*"
            onChange={handleImage}
          />
        </div>
        {/* <div className="form-control">
          <label className="label">
            <span className="label-text">RFID</span>
          </label>
          <input
            className="input input-bordered"
            type="text"
            placeholder="RFID"
            value={rfid}
            onChange={(e) => setRfid(e.target.value)}
          />
        </div> */}
      </div>

          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <form method="dialog">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setUpdateUserData(null);
                }}
              >
                Cancel
              </button>
            </form>
            <button
              disabled={btnDisable}
              className="btn btn-neutral items-center"
              onClick={() => addUser()}
            >
              {updateUserData ? `Update ${updateUserData.name}` : "Save User"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setUpdateUserData(null)}>close</button>
        </form>
      </dialog>

      <div className=" w-[100%]">
        <div className="mt-1">
          <input
            type="text"
            placeholder="Search by name, role....."
            className=" input input-bordered w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="font-semibold text-lg">Total Users: {totalPages}</div>
      </div>
      <div className="flex justify-between mt-4">
        <a
          target="_blank"
          rel="noreferrer"
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            generateWhatsAppMessage(filteredUsers)
          )}`}
          className="btn btn-warning text-white"
        >
          Forward to WhatsApp
        </a>
        <DownloadTableExcel
          filename="students table"
          sheet="students"
          currentTableRef={tableRef?.current}
        >
          <button className="btn btn-success btn-md text-white">
            Export To Excel <RiFileExcel2Fill />
          </button>
        </DownloadTableExcel>
      </div>

      <>
        <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
          {!loading ? (
            <>
              {userData ? (
                <>
                  <div className="overflow-x-auto">
                    <table
                      ref={tableRef}
                      className="w-full min-w-[800px] md:min-w-0 text-sm text-left"
                    >
                      <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                        <tr>
                          <th className="py-3 px-3 md:px-6">Name</th>
                          <th className="py-3 px-3 md:px-6">Email</th>
                          <th className="py-3 px-3 md:px-6">Role</th>
                          <th className="py-3 px-3 md:px-6">Number</th>
                          <th className="py-3 px-3 md:px-6">Password</th>
                          <th className="py-3 px-3 md:px-6">Status</th>
                          <th className="py-3 px-3 md:px-6">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 divide-y">
                        {filteredUsers?.map((item, idx) => (
                          <tr key={item._id}>
                            <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 md:gap-3">
                                <div className="avatar">
                                  <div className="mask mask-squircle w-8 h-8 md:w-12 md:h-12">
                                    <img
                                      src={item?.avatar?.secure_url?.src || item?.avatar?.secure_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                      alt={item.name}
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
                                <div className="text-sm md:text-base">
                                  <div className="font-semibold md:font-bold truncate max-w-[100px] md:max-w-none">
                                    {item.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm md:text-base truncate max-w-[120px] md:max-w-none">
                                {item.email}
                              </div>
                            </td>
                            <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                {item.role && (
                                  <span
                                    className={`badge badge-sm md:badge-md text-white ${
                                      item.role === "Admin"
                                        ? "badge-info"
                                        : item.role === "Teacher"
                                        ? "badge-secondary"
                                        : item.role.includes("Coordinator")
                                        ? "badge-warning"
                                        : "badge-neutral"
                                    }`}
                                  >
                                    {item.role.split(" ")[0]}
                                  </span>
                                )}

                                {item.secondaryRole && (
                                  <span
                                    className={`badge badge-sm md:badge-md text-white ${
                                      item.secondaryRole === "Admin"
                                        ? "badge-info"
                                        : item.secondaryRole === "Teacher"
                                        ? "badge-secondary"
                                        : item.secondaryRole.includes(
                                            "Coordinator"
                                          )
                                        ? "badge-warning"
                                        : "badge-neutral"
                                    }`}
                                  >
                                    {" "}
                                    {item.secondaryRole.split(" ")[0]}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm md:text-base">
                              {item.number}
                            </td>
                            <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm md:text-base">
                              {item?.password ? "••••••" : "N/A"}
                            </td>
                            <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                              <ToggleButton
                                isOn={item.isActive}
                                onToggle={() =>
                                  handleToggleStatus(item._id, item.isActive)
                                }
                              />
                            </td>
                            <td className="px-3 md:px-6 py-4 whitespace-nowrap space-x-1 md:space-x-2">
                              <button
                                onClick={() => {
                                  setUpdateUserData(item);
                                  document.getElementById('user_form_modal').showModal();
                                }}
                                className="btn btn-outline btn-xs"
                              >
                                <span className="md:inline hidden">Update</span>
                                <span className="md:hidden">✏️</span>
                              </button>
                              <button
                                onClick={() => handleDeleteModal(item)}
                                className="btn btn-error text-white btn-xs"
                              >
                                <span className="md:inline hidden">Delete</span>
                                <span className="md:hidden">🗑️</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex justify-center py-4 font-semibold">
                  No User Data !
                </div>
              )}
            </>
          ) : (
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
          )}
        </div>
        {/* {renderPagination()} */}
      </>
      {isDeleteModalOpen && productToDelete && (
        <>
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  {productToDelete == "delete-all" ? (
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete All Ros
                    </h3>
                  ) : (
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete User
                    </h3>
                  )}

                  {productToDelete == "delete-all" ? (
                    <p>Are you sure you want to delete all ros ?</p>
                  ) : (
                    <p>Are you sure you want to delete the user?</p>
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={confirmDelete}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Yes, Delete Now
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    No, Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ManageAdmin;
