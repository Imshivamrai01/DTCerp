"use client";
import { useEffect, useRef, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from 'next/navigation';
const ListFee = () => {
  const navigate = useRouter();
  const [activeClass, setActiveClass] = useState("all");
  const [activeDivision, setActiveDivision] = useState("all");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userData, setUserData] = useState([]);

  const fetchAllUser = () => {
    setLoading(true);
    if (activeClass == "All") {
      setActiveDivision("All");
    }
    try {
      axios
        .get(
          `${
            ""
          }/api/student/filter?studentClass=${activeClass}&studentSection=${activeDivision}&page=${currentPage}`
        )
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
          setUserData(null);
          setLoading(false);
          setTotalPages(1);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
      setUserData(null);
      setLoading(false);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchAllUser();
  }, [activeClass, activeDivision]);

  useEffect(() => {
    fetchAllUser();
  }, [currentPage]); // Separate effect for page changes

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const maxPage = Math.ceil(totalPages / 15);
    console.log(maxPage);
    for (let i = 1; i <= maxPage; i++) {
      pageNumbers.push(i);
    }

    let startPage;
    let endPage;

    if (maxPage <= maxPagesToShow) {
      startPage = 1;
      endPage = maxPage;
    } else {
      if (currentPage <= maxPagesToShow - 2) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + 1 >= maxPage) {
        startPage = maxPage - maxPagesToShow + 1;
        endPage = maxPage;
      } else {
        startPage = currentPage - 1;
        endPage = currentPage + 2;
      }
    }

    const visiblePages = pageNumbers.slice(startPage - 1, endPage);
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === maxPage;

    return (
      <nav className="mt-12 flex justify-center">
        <ul className="join ">
          <li className="page-item">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`px-4 py-2 cursor-pointer rounded-md  mx-1 ${
                isFirstPage ? "disabled" : ""
              }`}
              disabled={isFirstPage}
            >
              Previous
            </button>
          </li>
          {visiblePages?.map((number) => (
            <li key={number} className="page-item">
              <button
                onClick={() => handlePageChange(number)}
                className={`${
                  currentPage === number ? "bg-gray-400 text-white" : ""
                } px-4 py-2 mx-1 rounded-md`}
              >
                {number}
              </button>
            </li>
          ))}
          <li className="page-item">
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`px-4 py-2 cursor-pointer mx-1 bg-black rounded-md text-white ${
                isLastPage ? "disabled" : ""
              }`}
              disabled={isLastPage}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  return (
    <>
      <div className="mt-6">
        <div>
          <button
            className="btn btn-outline"
            onClick={() => navigate.push("/fee-structure")}
          >
            Change Fee Structure
          </button>
        </div>
      </div>{" "}
      {/* Class/Section Selection UI (copied from ManageStudents.jsx) */}
      <div className="mb-4 p-4">
        {/* Mobile Class/Section Dropdowns */}
        <div className="block md:hidden mb-4">
          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">Select Class</span>
            </label>
            <select
              className="select select-bordered border-gray-300"
              value={activeClass}
              onChange={(e) => setActiveClass(e.target.value)}
            >
              <option value="all">All</option>
              <option value="L.K.G">L.K.G</option>
              <option value="U.K.G">U.K.G</option>
              <option value="Nursery">Nursery</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={`${i + 1}`}>{`Class ${
                  i + 1
                }`}</option>
              ))}
            </select>
          </div>
          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">Select Section</span>
            </label>
            <select
              className="select select-bordered border-gray-300"
              value={activeDivision}
              onChange={(e) => setActiveDivision(e.target.value)}
            >
              <option value="all">All</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
        </div>
        {/* Desktop (md+) Button Grids */}
        <div className="hidden md:block">
          <div className="font-semibold mb-2">Select Class</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* All Classes Button */}
            <button
              key="all-class"
              className={`btn w-full text-base mb-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                activeClass === "all"
                  ? "btn-primary border-2 border-blue-700 scale-105 font-bold"
                  : "btn-outline"
              }`}
              onClick={() => setActiveClass("all")}
              title="All Classes"
              tabIndex={0}
            >
              <span className="mr-2" role="img" aria-label="all">
                🌐
              </span>
              All
            </button>
            {[
              "L.K.G",
              "U.K.G",
              "Nursery",
              ...Array.from({ length: 12 }, (_, i) => `${i + 1}`),
            ].map((cls) => (
              <button
                key={cls}
                className={`btn w-full text-base mb-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                  activeClass === cls
                    ? "btn-primary border-2 border-blue-700 scale-105 font-bold"
                    : "btn-outline"
                }`}
                onClick={() => setActiveClass(cls)}
                title={cls.match(/^\d+$/) ? `Class ${cls}` : cls}
                tabIndex={0}
              >
                <span className="mr-2">
                  {cls.match(/^\d+$/) ? (
                    <span role="img" aria-label="class"></span>
                  ) : (
                    <span role="img" aria-label="book"></span>
                  )}
                </span>
                {cls.match(/^\d+$/) ? `Class ${cls}` : cls}
              </button>
            ))}
          </div>
          <div className="font-semibold mb-2 mt-4">Select Section</div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* All Sections Button */}
            <button
              key="all-section"
              className={`btn w-full text-base mb-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                activeDivision === "all"
                  ? "btn-primary border-2 border-green-700 scale-105 font-bold"
                  : "btn-outline"
              }`}
              onClick={() => setActiveDivision("all")}
              title="All Sections"
              tabIndex={0}
            >
              <span className="mr-1" role="img" aria-label="all-section">
                🌐
              </span>
              All
            </button>
            {["A", "B"].map((sec) => (
              <button
                key={sec}
                className={`btn w-full text-base mb-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:scale-105 ${
                  activeDivision === sec
                    ? "btn-primary border-2 border-green-700 scale-105 font-bold"
                    : "btn-outline"
                }`}
                onClick={() => setActiveDivision(sec)}
                title={`Section ${sec}`}
                tabIndex={0}
              >
                <span className="mr-1" role="img" aria-label="section">
                  🏷️
                </span>
                {sec}
              </button>
            ))}
          </div>
          {activeClass && activeDivision && (
            <div className="mb-4 mt-2">
              <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold shadow">
                Selected: {activeClass === "all" ? "All Classes" : activeClass}{" "}
                - Section{" "}
                {activeDivision === "all" ? "All Sections" : activeDivision}
              </span>
            </div>
          )}
        </div>
      </div>
      {/* End Class/Section Selection UI */}
      <>
        <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
          {!loading ? (
            <>
              {userData ? (
                <>
                  {" "}
                  <table className="w-full table-auto text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                      <tr>
                        <th className="py-3 px-6">Name</th>
                        <th className="py-3 px-6">Roll Number</th>
                        <th className="py-3 px-6">Class-Section</th>

                        <th className="py-3 px-6">Contact</th>
                        <th className="py-3 px-6">Gender</th>
                        <th className="py-3 px-6">Registration No</th>

                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y">
                      {userData?.map((item, idx) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="avatar">
                                <div className="mask mask-squircle w-12 h-12">
                                  <img src={item.studentAvatar?.secure_url?.src || item.studentAvatar?.secure_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">{item.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.rollNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.studentClass} - {item.studentSection}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.contactNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.registrationNumber}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.isActive ? (
                              <span className="badge badge-success badge-md text-white">
                                Active
                              </span>
                            ) : (
                              <span className="badge badge-error text-white">
                                In-Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => navigate.push(`/take-fees/${item._id}`)}
                              className="btn btn-outline btn-xs"
                            >
                              Take Fee
                            </button>
                            <button
                              onClick={() => navigate.push(`/view-fees/${item._id}`)}
                              className="btn btn-info ml-2 btn-xs text-white"
                            >
                              View Fee
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <div className="flex justify-center py-4 font-semibold">
                  No User Data !
                </div>
              )}
            </>
          ) : (
            <>
              {" "}
              <div className="flex items-center justify-center m-auto mt-12">
                <ColorRing
                  visible={true}
                  height="80"
                  width="80"
                  ariaLabel="color-ring-loading"
                  wrapperStyle={{}}
                  wrapperClass="color-ring-wrapper"
                  colors={[
                    "#e15b64",
                    "#f47e60",
                    "#f8b26a",
                    "#abbd81",
                    "#849b87",
                  ]}
                />
              </div>
            </>
          )}
        </div>
        {renderPagination()}
      </>
    </>
  );
};

export default ListFee;
