"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
const FeeStructure = () => {
  const [selectedClass, setSelectedClass] = useState("Nursery");
  const [selectedCategory, setSelectedCategory] = useState("Old");
  const [selectedRoute, setSelectedRoute] = useState("Local");
  const [feeId, setFeeId] = useState("");
  const [feeStructure, setFeeStructure] = useState([
    {
      feesName: "",
      frequency: "",
      months: "",
      feesValue: "",
      count: "",
      totalFees: "",
    },
  ]);

  // Function to add a new row to fee structure
  const addRow = () => {
    setFeeStructure([
      ...feeStructure,
      {
        feesName: "",
        frequency: "",
        months: "",
        feesValue: "",
        count: "",
        totalFees: "",
      },
    ]);
  };

  // Function to update a row in fee structure
  const updateRow = (index, field, value) => {
    const updatedFeeStructure = [...feeStructure];
    updatedFeeStructure[index][field] = value;
    setFeeStructure(updatedFeeStructure);
  };

  // Function to delete a row from fee structure
  const deleteRow = (index) => {
    const updatedFeeStructure = [...feeStructure];
    updatedFeeStructure.splice(index, 1);
    setFeeStructure(updatedFeeStructure);
  };

  console.log(feeStructure);

  const finalSubmit = () => {
    let data = {
      class: selectedClass,
      category: selectedCategory,
      route: selectedRoute,
      feeObj: feeStructure,
    };
    try {
      axios
        .post(`/api/fee-structure`, data)
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            console.log(res);
            toast.success("Fee Structure Submit Successfully !");
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.message);
        })
        .finally(() => {});
    } catch (error) {
      console.log(error);
    }
  };
  const updateFeeStructure = () => {
    let data = {
      class: selectedClass,
      category: selectedCategory,
      route: selectedRoute,
      feeObj: feeStructure,
    };
    try {
      axios
        .put(
          `/api/fee-structure/${feeId}`,
          data
        )
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            console.log(res);
            toast.success("Fee Structure Updated Successfully !");
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.message);
        })
        .finally(() => {});
    } catch (error) {
      console.log(error);
    }
  };
  const getFeeStructure = () => {
    try {
      axios
        .get(
          `${
            ""
          }/api/fee-structure/filter?className=${selectedClass}&category=${selectedCategory}&route=${selectedRoute}`
        )
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            console.log(res);
            if (res.data.data.length == 0) {
              setFeeStructure([
                {
                  feesName: "",
                  frequency: "",
                  months: "",
                  feesValue: "",
                  count: "",
                  totalFees: "",
                },
              ]);
            } else {
              setFeeStructure(res.data.data[0].feeObj);
              setFeeId(res.data.data[0]._id);
            }
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.message);
        })
        .finally(() => {});
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getFeeStructure();
  }, [selectedCategory, selectedClass, selectedRoute]);
  return (
    <>
      {/* <Toaster draggable={true} /> */}
      <div className="mt-12 grid md:grid-cols-4 gap-3">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Class</span>
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="select select-bordered border-gray-300"
          >
            <option value="" selected disabled>
              Select Class
            </option>
            <option value="Nursery">Nursery</option>
            <option value="L.K.G">L.K.G</option>
            <option value="U.K.G">U.K.G</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Category</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select select-bordered border-gray-300"
          >
            <option value="" selected disabled>
              Select Category
            </option>
            <option value="Fee Conn">Fee Concession</option>
            <option value="New">New</option>
            <option value="Old">Old</option>
            <option value="RTE">RTE</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Select Route</span>
          </label>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="select select-bordered border-gray-300"
          >
            <option value="" selected disabled>
              Select Route
            </option>
            <option value="Local">Local</option>
            <option value="Mohaddipur">Mohaddipur</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end mt-6 gap-6">
        <button onClick={updateFeeStructure} className="btn btn-primary">
          Update
        </button>

        <button onClick={finalSubmit} className="btn btn-secondary">
          Submit
        </button>
      </div>
      <div className="mt-12 grid md:grid-cols-4 gap-3 font-semibold">
        Total Fee : INR{" "}
        {feeStructure
          .reduce((acc, item) => acc + parseFloat(item.totalFees), 0)
          .toLocaleString("en-IN")}
      </div>
      <div className="mt-12 shadow-sm border rounded-lg overflow-x-auto">
        <table className="w-full table-auto text-sm text-left">
          {/* Table headers */}
          <thead className="bg-gray-50 text-gray-600 font-medium border-b">
            <tr>
              <th className="py-3 px-6">Fees Name</th>
              <th className="py-3 px-6">Frequency</th>
              <th className="py-3 px-6">Months</th>
              <th className="py-3 px-6">Fees Value</th>
              <th className="py-3 px-6">Count</th>
              <th className="py-3 px-6">Total Fees</th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 divide-y">
            {/* Table rows for fee structure */}
            {feeStructure.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Enter Here"
                    value={item.feesName}
                    onChange={(e) =>
                      updateRow(index, "feesName", e.target.value)
                    }
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    className="input input-bordered"
                    type="text"
                    placeholder="Enter Here"
                    value={item.frequency}
                    onChange={(e) =>
                      updateRow(index, "frequency", e.target.value)
                    }
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    className="input input-bordered"
                    placeholder="Enter Here"
                    type="text"
                    value={item.months}
                    onChange={(e) => updateRow(index, "months", e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    className="input input-bordered"
                    type="text"
                    placeholder="Enter Here"
                    value={item.feesValue}
                    onChange={(e) =>
                      updateRow(index, "feesValue", e.target.value)
                    }
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    className="input input-bordered"
                    type="text"
                    placeholder="Enter Here"
                    value={item.count}
                    onChange={(e) => updateRow(index, "count", e.target.value)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    className="input input-bordered"
                    type="text"
                    placeholder="Enter Here"
                    value={item.totalFees}
                    onChange={(e) =>
                      updateRow(index, "totalFees", e.target.value)
                    }
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap gap-3 flex">
                  {/* Buttons for add, update, delete */}

                  <button
                    className="btn btn-xs btn-info text-white"
                    onClick={() => addRow(index)}
                  >
                    Add
                  </button>
                  {/* <button
                    className="btn btn-xs btn-outline text-black"
                    onClick={() => updateRow(index)}
                  >
                    Update
                  </button> */}
                  {feeStructure.length > 1 && (
                    <button
                      className="btn btn-xs btn-warning text-white"
                      onClick={() => deleteRow(index)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default FeeStructure;
