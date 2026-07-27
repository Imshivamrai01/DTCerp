"use client";
import { useParams } from 'next/navigation';
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import logo from "../../assets/dusk.jpg";
import { useReactToPrint } from "react-to-print";
import { toWords } from "number-to-words";
import moment from "moment";
import "moment-timezone";
import { useRouter } from 'next/navigation';
const TakeFee = () => {
  // Get the current date and time in Asia/Kolkata timezone
  const indiaDateTime = moment()?.tz("Asia/Kolkata");

  // Format the date according to your requirements
  const formattedDate = indiaDateTime?.format("DD-MM-YYYY");

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const navigate = useRouter();
  const params = useParams();
  console.log(params);
  const sid = params.id;
  const [studentDetail, setStudentDetail] = useState(null);
  const [feeDetails, setFeeDetails] = useState([]);
  const [feeDue, setFeeDue] = useState(0); // State to hold the due fee
  const [lateFee, setLateFee] = useState(0); // State to hold the due fee
  const [feeId, setFeeId] = useState("");
  const [dueData, setDueData] = useState(null);
  const [feeMonth, setFeeMonth] = useState("Jan");
  const [session, setSession] = useState("2024-2025");
  const [paidFeeData, setPaidFeeData] = useState(null);

  const [isFeeDue, setIsFeeDue] = useState(false);
  const [isBalance, setIsBalance] = useState(false);
  const [balance, setBalance] = useState(0);
  const [balanceMonth, setBalanceMonth] = useState(false);
  const [balanceFeeId, setBalanceFeeId] = useState(null);
  const [isLateFee, setIsLateFee] = useState(false);
  const [isFeeConcc, setIsFeeConcc] = useState(false);
  const [feeConcc, setFeeConcc] = useState(0);
  const fetchSingleStudent = () => {
    try {
      axios
        .get(`/api/student/${sid}`)
        .then((res) => {
          console.log(res);
          setStudentDetail(res.data.data);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSingleStudent();
  }, []);
  // const handleFeeChange = (field, value) => {
  //   if (field === "Due Fee" || field == "Discount Fee") {
  //     // Parse the value as a float and make it negative
  //     value = -parseFloat(value) || 0;
  //   } else if (field == "Fee Month") {
  //     setFeeDetails((prevFeeDetails) => ({
  //       ...prevFeeDetails,
  //       [field]: value,
  //     }));
  //   } else {
  //     // For other fields, parse the value as a float
  //     value = parseFloat(value) || 0;
  //   }

  //   setFeeDetails((prevFeeDetails) => ({
  //     ...prevFeeDetails,
  //     [field]: value,
  //   }));
  // };
  // Function to handle changes in the due fee
  const handleDueFeeChange = (value) => {
    setFeeDue(value);
  };

  const handleLateFeeChange = (value) => {
    setLateFee(value);
  };

  const handleConcession = (value) => {
    setFeeConcc(value);
  };

  console.log(feeDetails);
  // Calculate the total sum of fees
  const totalFees = feeDetails
    .filter((fee) => fee.months.includes(feeMonth)) // Filter fees by month
    .reduce((total, fee) => total + parseFloat(fee.feesValue), 0); // Sum up the fees values

  // Calculate the total amount considering late fees and due fees
  const totalAmount =
    totalFees +
    (lateFee ? parseFloat(lateFee) : 0) -
    (feeDue ? parseFloat(feeDue) : 0) -
    (isFeeConcc ? parseFloat(feeConcc) : 0) +
    (isBalance ? parseFloat(balance) : 0);
  const totalAmountInWords = toWords(totalAmount);
  const handleSubmitFee = () => {
    console.log("fee");

    //check if feeDetails is empty object also has empty values then return else process also show toast

    // Check if feeDetails is an empty object or if any of its properties are empty, then return
    let data = {
      studentId: sid,
      isFeeDue: isFeeDue,
      dueFee: feeDue.toString(),
      isLateFee: isLateFee,
      isFeeConcc: isFeeConcc,
      feeConcc: feeConcc.toString(),
      lateFee: lateFee.toString(),
      isBalance: totalFees - totalAmount > 0 ? true : false,
      balanceDue:
        totalFees - totalAmount > 0
          ? (totalFees - totalAmount).toString()
          : "0",
      feeMonth: feeMonth,
      session: session,
      isPaid: true,
      balanceMonth: balanceMonth,
      balancePaid: balance,
    };

    console.log(data);

    try {
      axios
        .post("/api/fee", {
          studentId: sid,
          isFeeDue: isFeeDue,
          dueFee: feeDue.toString(),
          isLateFee: isLateFee,
          isFeeConcc: isFeeConcc,
          feeConcc: feeConcc.toString(),
          lateFee: lateFee.toString(),
          isBalance: totalFees - totalAmount > 0 ? true : false,
          balanceDue:
            totalFees - totalAmount > 0
              ? (totalFees - totalAmount - feeConcc).toString()
              : "0",
          feeMonth: feeMonth,
          session: session,
          isPaid: true,
          balanceMonth: balanceMonth,
          balancePaid: balance,
        })
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            axios.put(
              `/api/fee/${balanceFeeId}`,
              {
                isFeeDue: false,
              }
            );
            setBalance(0);
            setFeeDue(0);
            setLateFee(0);
            setFeeId("");
            setDueData(null);
            setIsFeeDue(false);
            setIsBalance(false);
            setBalanceMonth(false);
            setBalanceFeeId(null);
            setIsLateFee(false);
            setIsFeeConcc(false);
            setFeeConcc(0);
            getFeeStructure();
            getFeeDue();
            getFeeDetail();
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.message);
        });
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
          }/api/fee-structure/filter?className=${
            studentDetail?.studentClass
          }&category=${studentDetail?.feeCategory}&route=${
            studentDetail?.route
          }`
        )
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            console.log(res);
            if (res.data.data.length == 0) {
              setFeeDetails([
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
              setFeeDetails(res.data.data[0].feeObj);
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

  const getFeeDue = () => {
    try {
      axios
        .get(
          `/api/fee/fee-due?studentId=${
            studentDetail._id
          }&session=${session}`
        )
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            console.log(res);
            setDueData(res.data.data);
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

  const getFeeDetail = () => {
    try {
      axios
        .get(
          `${
            ""
          }/api/fee/view?session=${session}&studentId=${
            studentDetail._id
          }&feeMonth=${feeMonth}`
        )
        .then(
          (res) => {
            console.log(res.data);
            setPaidFeeData(res.data.data);
          },
          (error) => {
            console.log(error);
            setPaidFeeData(null);
          }
        )
        .catch((error) => {
          console.log(error);
          setPaidFeeData(null);
        })
        .finally((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);

      setPaidFeeData(null);
    }
  };

  useEffect(() => {
    getFeeStructure();
    getFeeDue();
    getFeeDetail();
  }, [studentDetail, session, feeMonth]);

  return (
    <>
      {/* <Toaster draggable={true} /> */}
      <div className="py-4 mx-auto bg-base-100  container px-10">
        <div className="items-center justify-start pb-4 flex w-full">
          <p className=" font-bold text-2xl">Fees Payment</p>
        </div>

        <div className="items-center shadow mt-4  mb-4  justify-center flex-wrap divide-x-2 pb-4 gap-8 flex w-full">
          <div className="avatar">
            <div className="w-24 rounded-full">
              <img src={studentDetail?.studentAvatar?.secure_url?.src || studentDetail?.studentAvatar?.secure_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} />
            </div>
          </div>

          <div className=" pl-4">
            <p className="font-semibold">{studentDetail?.name}</p>
            <small>{studentDetail?.dob}</small>
          </div>

          <div className=" pl-4">
            <p className="font-semibold">Class</p>
            <small>
              {studentDetail?.studentClass} - {studentDetail?.studentSection}
            </small>
          </div>

          <div className=" pl-4">
            <p className="font-semibold">Roll No</p>
            <small>{studentDetail?.rollNumber}</small>
          </div>
          <div className=" pl-4">
            <p className="font-semibold">Father&apos; name</p>
            <small>{studentDetail?.fathersName}</small>
          </div>
          <div className=" pl-4">
            <p className="font-semibold">Mother&apos; name</p>
            <small>{studentDetail?.mothersName}</small>
          </div>
          <div className=" pl-4">
            <p className="font-semibold">Address</p>
            <small>{studentDetail?.address}</small>
          </div>
          <div className=" pl-4">
            <p className="font-semibold">Phone Number</p>
            <small>{studentDetail?.contactNumber}</small>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Session</span>
          </label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="select select-bordered border-gray-300"
          >
            <option value="2020-2021">2020-2021</option>
            <option value="2021-2022">2021-2022</option>
            <option value="2022-2023">2022-2023</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Month</span>
          </label>
          <select
            value={feeMonth}
            onChange={(e) => setFeeMonth(e.target.value)}
            className="select select-bordered border-gray-300"
          >
            <option value="Jan">January - March</option>
            <option value="Apr">April - June</option>
            <option value="Jul">July - September</option>
            <option value="Oct">October - December</option>
          </select>
        </div>

        <div className="w-full flex items-center gap-6">
          <label className="label">
            <span className="label-text">Is Fee Due</span>
          </label>
          <input
            type="checkbox"
            className="toggle toggle-info"
            checked={isFeeDue}
            onChange={() => setIsFeeDue(!isFeeDue)}
          />
          {isFeeDue && (
            <div className="form-control">
              <label className="label">
                <p className="label-text">Due Fee</p>
              </label>
              <input
                value={feeDue}
                onChange={(e) => handleDueFeeChange(e.target.value)}
                type="text"
                className="input input-bordered"
                placeholder="Due Fee"
              />
            </div>
          )}
        </div>
        <div className="w-full flex items-center gap-6">
          <label className="label">
            <span className="label-text">Is Late Fee</span>
          </label>
          <input
            type="checkbox"
            className="toggle toggle-info"
            checked={isLateFee}
            onChange={() => setIsLateFee(!isLateFee)}
          />
          {isLateFee && (
            <div className="form-control">
              <label className="label">
                <p className="label-text">Late Fee</p>
              </label>
              <input
                value={lateFee}
                onChange={(e) => handleLateFeeChange(e.target.value)}
                type="text"
                className="input input-bordered"
                placeholder="Late Fee"
              />
            </div>
          )}
        </div>
        <div className="w-full flex items-center gap-6">
          <label className="label">
            <span className="label-text">Concession ?</span>
          </label>
          <input
            type="checkbox"
            className="toggle toggle-info"
            checked={isFeeConcc}
            onChange={() => setIsFeeConcc(!isFeeConcc)}
          />
          {isFeeConcc && (
            <div className="form-control">
              <label className="label">
                <p className="label-text">Concession</p>
              </label>
              <input
                value={feeConcc}
                onChange={(e) => handleConcession(e.target.value)}
                type="text"
                className="input input-bordered"
                placeholder="Concession "
              />
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto mt-10 rounded-md">
        <div className="bg-success text-white px-2 font-semibold text-2xl p-2">
          Paid Fees
        </div>
        <table className="table-auto table">
          <thead className="bg-success text-white">
            <tr>
              <th>S.N</th>
              <th>Month</th>
              <th>Is Paid ?</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr key={paidFeeData?.feeMonth}>
              <td className="font-semibold">1</td>
              <td className="font-semibold">
                {paidFeeData?.feeMonth == "Jan"
                  ? "January-March"
                  : paidFeeData?.feeMonth == "Apr"
                  ? "April-June"
                  : paidFeeData?.feeMonth == "Jul"
                  ? "July-September"
                  : paidFeeData?.feeMonth == "Oct"
                  ? "October-December"
                  : "N/A"}
              </td>
              <td className="font-semibold">
                {" "}
                <span
                  className={`badge badge-md text-white ${
                    paidFeeData && paidFeeData?.isPaid
                      ? "badge-success"
                      : "badge-error"
                  }`}
                >
                  {paidFeeData && paidFeeData?.isPaid ? "Paid" : "Not-Paid"}
                </span>
              </td>
              <td className="font-semibold">
                <span
                  onClick={() => navigate.push(`/view-fees/${studentDetail._id}`)}
                  className="badge badge-xs badge-info p-2 cursor-pointer text-white"
                >
                  View
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto mt-10 rounded-md">
        <div className="bg-red-400 text-white p-2 font-semibold text-2xl">
          Pending Due
        </div>
        <table className="table-auto table">
          <thead className="bg-red-400 text-white">
            <tr>
              <th>S.N</th>
              <th>Month</th>
              <th>Due</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dueData?.map((res, index) => {
              // Check if feeMonth matches dueFeeMonth
              if (res?.feeMonth !== feeMonth) {
                return (
                  <tr key={res.feeMonth}>
                    <td className="font-semibold">{index + 1}</td>
                    <td className="font-semibold">
                      {res?.feeMonth == "Jan"
                        ? "January-March"
                        : res?.feeMonth == "Apr"
                        ? "April-June"
                        : res?.feeMonth == "Jul"
                        ? "July-September"
                        : res?.feeMonth == "Oct"
                        ? "October-December"
                        : "N/A"}
                    </td>
                    <td className="font-semibold">{res.dueFee}</td>
                    <td className="font-semibold">
                      <div className="flex items-center gap-3">
                        <span
                          onClick={() => {
                            setIsBalance(true);
                            setBalance(res.dueFee);
                            setBalanceMonth(res.feeMonth);
                            setBalanceFeeId(res.feeId);
                          }}
                          className="badge badge-xs cursor-pointer badge-info p-2 text-white"
                        >
                          Add
                        </span>
                        <span
                          onClick={() => {
                            setIsBalance(false);
                            setBalance(0);
                            setBalanceMonth(null);
                            setBalanceFeeId(null);
                          }}
                          className="badge badge-xs cursor-pointer badge-error p-2 text-white"
                        >
                          Remove
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>

      <div
        ref={componentRef}
        className="  justify-center m-auto flex-col pb-4 mt-6 px-12  card flex max-w-3xl"
      >
        <div className=" items-center flex pb-4 w-full ga-6">
          <img src={logo?.src || logo} width={120} alt="logo" />
          <div className="text-center flex justify-center flex-col m-auto">
            {/* <p className="text-center font-semibold text-xl">Fee Receipt</p> */}
            <p className="text-center font-semibold text-xl">
              Dust To Crown Public School
            </p>
            <p className="text-center font-semibold">
              Deoria Road Kunraghat Gorakhpur 9452441740
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col  mb-4">
          <div className=" border-b-2 flex justify-between">
            <p>
              Receipt No : <span className="font-semibold">201</span>
            </p>
            <p>Date : {formattedDate}</p>
          </div>

          <div className="flex-col gap-3 flex  mt-4">
            <p>
              Regn. No :{" "}
              <span className="font-semibold">
                {studentDetail?.registrationNumber}
              </span>
            </p>

            <p>
              Student :{" "}
              <span className="font-semibold"> {studentDetail?.name}</span>
            </p>

            <p>
              Class :{" "}
              <span className="font-semibold">
                {" "}
                {studentDetail?.studentClass} - {studentDetail?.studentSection}
              </span>
            </p>

            <p>
              Fee For Month(s) :{" "}
              <span className="font-semibold">
                {" "}
                {feeMonth == "Jan"
                  ? "January-March"
                  : feeMonth == "Apr"
                  ? "April-June"
                  : feeMonth == "Jul"
                  ? "July-September"
                  : feeMonth == "Oct"
                  ? "October-December"
                  : "N/A"}
              </span>
            </p>
          </div>
          <div className="border-t-2 pb-4 pt-4 ">
            <div className="overflow-x-auto mt-10">
              <table className="table">
                <thead>
                  <tr>
                    <th>S.N</th>
                    <th>Particulars</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {feeDetails
                    .filter((fee) => fee.months.includes(feeMonth)) // Filter fees by month
                    .map((filteredFee, index) => {
                      const serialNumber = index + 1; // Calculate the serial number
                      return (
                        <tr key={index}>
                          <td>{serialNumber}</td>
                          <td>{filteredFee.feesName}</td>
                          <td>{filteredFee.feesValue}</td>

                          {/* Add your code for the 'Amount' column here */}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <hr className="mt-3 mb-3 " />
            <div className="flex justify-between mb-3 w-full max-w-xl ">
              <p className="text-lg font-semibold">Total Amount</p>
              <p className="text-lg font-semibold">
                {/* Calculate and display the total sum of filteredFee.feesValue */}
                INR {totalFees} {/* Fixed to two decimal places */}
              </p>
            </div>
            {feeDue != 0 && (
              <>
                <hr className="py-2 " />
                <div className="flex justify-between mt-3 w-full max-w-xl pl-8 pr-4 ">
                  <p className="text-xl ">(-) Due Fee</p>
                  <p className="text-xl ">
                    <td>-INR {feeDue}</td>
                  </p>
                </div>
              </>
            )}
            {lateFee != 0 && (
              <>
                <hr className="py-2 " />
                <div className="flex justify-between mt-3 w-full max-w-xl pl-8 pr-4 ">
                  <p className="text-lg ">(+) Late Fee</p>
                  <p className="text-lg ">
                    <td>INR {lateFee}</td>
                  </p>
                </div>
              </>
            )}
            {balance != 0 && (
              <>
                <hr className="py-2 " />
                <div className="flex justify-between mt-3 w-full max-w-xl pl-8 pr-4 ">
                  <p className="text-lg ">(+) Balance Fee for {balanceMonth}</p>
                  <p className="text-lg ">
                    <td>INR {balance}</td>
                  </p>
                </div>
              </>
            )}
            {feeConcc != 0 && (
              <>
                <hr className="py-2 mb-2" />
                <div className="flex justify-between mt-3 w-full max-w-xl pl-8 pr-4 ">
                  <p className="text-lg ">(-) Concession</p>
                  <p className="text-lg ">
                    <td>INR {feeConcc}</td>
                  </p>
                </div>
              </>
            )}
          </div>
          <hr className="mt-3 mb-3 " />
          <div className="flex justify-between mb-3 w-full max-w-xl ">
            <p className="text-lg font-semibold">Grand Total Amount</p>
            <p className="text-lg font-semibold">
              {/* Calculate and display the total sum of filteredFee.feesValue */}
              INR {totalAmount}
              {/* Fixed to two decimal places */}
            </p>
          </div>
          {totalFees - totalAmount > 0 && (
            <>
              <hr className="mt-3 mb-3 " />
              <div className="flex justify-between mb-3  w-full max-w-xl ">
                <p className="text-lg font-semibold">Balance Due</p>
                <p className="text-lg font-semibold">
                  {/* Calculate and display the total sum of filteredFee.feesValue */}
                  INR {totalFees - totalAmount - feeConcc}
                  {/* Fixed to two decimal places */}
                </p>
              </div>
            </>
          )}
          <hr className="mt-3 mb-3 " />
          <div className="flex flex-col  w-full max-w-xl ">
            <p className="text-md font-semibold">Amount In Words :</p>
            <p>RUPEES {totalAmountInWords?.toLocaleUpperCase()} ONLY</p>
          </div>
          <div className="w-full flex mt-14 justify-between items-center">
            <div className="flex-col flex justify-start  w-full  ">
              <p className="font-semibold">Checked By</p>
              <p className=" mt-3">
                ................................................................
              </p>
            </div>

            <div className="flex-col flex justify-start  w-full  ">
              <p className="text-end font-semibold">Signature Cashier</p>
              <p className="text-end mt-3">
                ................................................................
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-center">
        {paidFeeData && paidFeeData?.isPaid ? (
          ""
        ) : (
          <button
            className="btn btn-warning text-white"
            onClick={() => handleSubmitFee()}
          >
            Submit Fees
          </button>
        )}

        {paidFeeData && paidFeeData?.isPaid ? (
          <button
            className="btn btn-secondary ml-2"
            onClick={() => navigate.push(`/view-fees/${studentDetail?._id}`)}
          >
            View Fees
          </button>
        ) : (
          <button className="btn btn-secondary ml-2" onClick={handlePrint}>
            Print Receipt
          </button>
        )}
      </div>
    </>
  );
};

export default TakeFee;
