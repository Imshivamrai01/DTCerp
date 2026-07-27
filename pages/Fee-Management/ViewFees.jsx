"use client";
import { useParams } from 'next/navigation';
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import logo from "../../assets/dusk.jpg";
import { toWords } from "number-to-words";
const ViewFees = () => {
  const params = useParams();
  console.log(params);
  const [studentDetail, setStudentDetail] = useState(null);
  const [feeDetails, setFeeDetails] = useState([]);
  const sid = params.id;
  const [feeMonth, setFeeMonth] = useState("Jan");
  const [monthFeeData, setMonthFeeData] = useState(null);
  const [feeId, setFeeId] = useState("");
  const [session, setSession] = useState("2024-2025");
  const componentRef = useRef(null);
  const [feeDue, setFeeDue] = useState(0); // State to hold the due fee
  const [lateFee, setLateFee] = useState(0); // State to hold the due fee
  const [isFeeDue, setIsFeeDue] = useState(false);
  const [isLateFee, setIsLateFee] = useState(false);
  const [isBalance, setIsBalance] = useState(false);
  const [balanceDue, setBalanceDue] = useState(false);
  const [balancePaid, setBalancePaid] = useState(0);
  const [balanceMonth, setBalanceMonth] = useState("");

  const [isFeeConcc, setIsFeeConcc] = useState(false);
  const [feeConcc, setFeeConcc] = useState(0);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
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
  const getFeeDetail = () => {
    try {
      axios
        .get(
          `${
            ""
          }/api/fee/view?session=${session}&studentId=${sid}&feeMonth=${feeMonth}`
        )
        .then(
          (res) => {
            console.log(res.data);
            setMonthFeeData(res.data.data);
            setFeeDue(res.data.data.dueFee);
            setIsFeeDue(res.data.data.isFeeDue);
            setLateFee(res.data.data.lateFee);
            setIsLateFee(res.data.data.isLateFee);
            setIsBalance(res.data.data.isBalance);
            setBalanceDue(res.data.data.balanceDue);
            setBalancePaid(res.data.data.balancePaid);
            setBalanceMonth(res.data.data.balanceMonth);
            setIsFeeConcc(res.data.data.isFeeConcc);
            setFeeConcc(res.data.data.feeConcc);
          },
          (error) => {
            console.log(error);
            setMonthFeeData(null);
            setFeeDue(0);
            setIsFeeDue(false);
            setLateFee(0);
            setIsLateFee(false);
            setIsBalance(false);
            setBalanceDue(false);
            setBalancePaid(0);
            setBalanceMonth("");
            setIsFeeConcc(false);
            setFeeConcc(0);
          }
        )
        .catch((error) => {
          console.log(error);
          setMonthFeeData(null);
          setFeeDue(0);
          setIsFeeDue(false);
          setLateFee(0);
          setIsLateFee(false);
          setIsBalance(false);
          setBalanceDue(false);
          setBalancePaid(0);
          setBalanceMonth("");
          setIsFeeConcc(false);
          setFeeConcc(0);
        })
        .finally((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
      setMonthFeeData(null);
      setFeeDue(0);
      setIsFeeDue(false);
      setLateFee(0);
      setIsLateFee(false);
      setIsBalance(false);
      setBalanceDue(false);
      setBalancePaid(0);
      setBalanceMonth("");
      setIsFeeConcc(false);
      setFeeConcc(0);
    }
  };
  const getFeeStructure = () => {
    console.log(studentDetail);
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
        })
        .finally(() => {});
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFeeDetail();
    getFeeStructure();
  }, [session, feeMonth, studentDetail]);

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
    (balancePaid ? parseFloat(balancePaid) : 0);
  const totalAmountInWords = toWords(totalAmount);

  return (
    <>
      <div className="grid md:grid-cols-4 gap-3">
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
            <span className="label-text">Fee Month</span>
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
      </div>

      <hr className="mt-6 mb-6" />
      <div className="flex justify-end">
        <button className="btn btn-secondary ml-2 " onClick={handlePrint}>
          Print Receipt
        </button>
      </div>
      <span
        className={`badge badge-md text-white ${
          monthFeeData && monthFeeData?.isPaid ? "badge-success" : "badge-error"
        }`}
      >
        {monthFeeData && monthFeeData?.isPaid ? "Paid" : "Not-Paid"}
      </span>

      {monthFeeData && monthFeeData?.isPaid ? (
        <>
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
                <p>Date : {new Date().toDateString()}</p>
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
                    {studentDetail?.studentClass} -{" "}
                    {studentDetail?.studentSection}
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
                <hr className="py-2 mb-2 " />
                <div className="flex justify-between  w-full max-w-xl pl-8 pr-4 ">
                  <p className="text-lg font-semibold">Total Amount</p>
                  <p className="text-lg font-semibold">
                    {/* Calculate and display the total sum of filteredFee.feesValue */}
                    INR {totalFees} {/* Fixed to two decimal places */}
                  </p>
                </div>
                {feeDue != 0 && (
                  <>
                    <hr className="py-2 mb-2  mt-3 " />
                    <div className="flex justify-between mt-3 w-full max-w-xl pl-8 pr-4 ">
                      <p className="text-xl ">(-) Due Fee</p>
                      <p className="text-xl ">
                        <td>-{feeDue}</td>
                      </p>
                    </div>
                  </>
                )}
                {lateFee != 0 && (
                  <>
                    <hr className="py-2 mb-2" />
                    <div className="flex justify-between mt-3 w-full max-w-xl pl-8 pr-4 ">
                      <p className="text-lg ">(+) Late Fee</p>
                      <p className="text-lg ">
                        <td>{lateFee}</td>
                      </p>
                    </div>
                  </>
                )}
                {balancePaid != 0 && (
                  <>
                    <hr className="py-2 mb-2" />
                    <div className="flex justify-between mt-3 w-full max-w-xl pl-8 pr-4 ">
                      <p className="text-lg ">
                        (+) Balance Fee for {balanceMonth}
                      </p>
                      <p className="text-lg ">
                        <td>INR {balancePaid}</td>
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
                      INR {totalFees - totalAmount}
                      {/* Fixed to two decimal places */}
                    </p>
                  </div>
                </>
              )}
              <hr className="mt-3 mb-3 " />
              <div className="flex justify-between items-center">
                <div className="flex flex-col  w-full max-w-xl ">
                  <p className="text-md font-semibold">Amount In Words :</p>
                  <p>RUPEES {totalAmountInWords?.toLocaleUpperCase()} ONLY</p>
                </div>
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
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default ViewFees;
