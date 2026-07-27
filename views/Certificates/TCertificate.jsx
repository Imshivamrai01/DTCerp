"use client";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import logo from "../../assets/dusk.jpg";
import numberToWords from "number-to-words";
import axios from "axios";
const TCertificate = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [leftOn, setLeftOn] = useState("");
  const [character, setCharacter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [userData, setUserData] = useState(null);
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const handleSelectedStudent = (e) => {
    const selectedValue = JSON.parse(e.target.value); // Parse the selected value
    setSelectedStudent(selectedValue);
  };

  const getAllStudents = () => {
    try {
      axios
        .get(
          `${
            ""
          }/api/student/fetch?studentClass=${selectedClass}&studentSection=${selectedSection}`
        )
        .then((res) => {
          console.log(res);
          if (res.data.success) {
            console.log(res);
            setUserData(res.data.data);
          }
        })
        .catch((error) => {
          console.log(error);
          setUserData(null);
        })
        .finally(() => {});
    } catch (error) {
      console.log(error);
      setUserData(null);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSection) {
      getAllStudents();
    }
  }, [selectedClass, selectedSection]);

  function formatDate(dateString) {
    // Split the date string by "-"
    const parts = dateString.split("-");

    // Reorder the parts and join them with "-"
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    return formattedDate;
  }
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const formatDateD = (dateString) => {
    // Split the date string by "-"
    const [year, month, day] = dateString.split("-").map(Number);

    // Convert month number to month name
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = capitalizeFirstLetter(months[month - 1]);

    // Convert day and year numbers to words
    const dayWord = capitalizeFirstLetter(numberToWords.toWords(day));
    const yearWord = capitalizeFirstLetter(numberToWords.toWords(year));

    // Format the date string
    const formattedDate = `${dayWord} ${monthName} ${yearWord}`;

    return formattedDate;
  };
  return (
    <>
      <div className="grid md:grid-cols-3 gap-4">
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
            <span className="label-text">Select Section</span>
          </label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="select select-bordered border-gray-300"
          >
            <option value="" selected disabled>
              Select Section
            </option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
        </div>

        {userData && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Select Student</span>
            </label>
            <select
              value={selectedStudent ? JSON.stringify(selectedStudent) : ""} // Set the selected value
              onChange={handleSelectedStudent}
              className="select select-bordered border-gray-300"
            >
              <option value="" disabled>
                Select Student
              </option>
              {userData.map((student) => (
                <option key={student._id} value={JSON.stringify(student)}>
                  {student.name} {student.admissionNo}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text">Left On</span>
          </label>
          <input
            type="date"
            className="input input-bordered border-gray-300"
            onChange={(e) => setLeftOn(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Character</span>
          </label>
          <input
            type="text"
            placeholder="Character Good or Bad etc"
            className="input input-bordered"
            onChange={(e) => setCharacter(e.target.value)}
          />
        </div>
      </div>

      {selectedStudent && (
        <div
          ref={componentRef}
          className="md:py-6 md:px-8 max-w-5xl mt-8 flex flex-col justify-center m-auto border-black"
        >
          <p
            style={{ letterSpacing: "4px" }}
            className="text-center font-semibold text-4xl  "
          >
            Transfer Certificate
          </p>
          <div className="flex  justify-center items-center gap-16 mt-8 ">
            <img src={logo?.src || logo} width={150} alt="logo" />

            <div className="flex flex-col">
              <p className="font-semibold text-2xl">
                {" "}
                Dust To Crown Public School
              </p>

              <p className="text-center font-semibold text-lg">
                Deoria Road Kunraghat Gorakhpur 9452441740
              </p>
            </div>
          </div>

          <div className="mt-8 max-w-2xl flex justify-center m-auto">
            <div className="flex flex-col items-start justify-center">
              <p style={{ letterSpacing: "1px", lineHeight: "35px" }}>
                <span className="">This is to certify that </span>{" "}
                <span>(Name of Student)</span>{" "}
                <span className="font-semibold underline">
                  {selectedStudent.name}
                </span>{" "}
                <br />
                S/o{" "}
                <span className="font-semibold underline">
                  {selectedStudent.fatherName}
                </span>{" "}
                Admission No.{" "}
                <span className="font-semibold underline">
                  {selectedStudent.admissionNo}
                </span>{" "}
                <br /> was admitted into{" "}
                <span className="font-semibold">
                  Dust To Crown Public Senior Secondary School
                </span>{" "}
                on the <br />{" "}
                <span className="font-semibold underline">
                  {formatDate(selectedStudent.admissionDate)}
                </span>{" "}
                on Transfer Certificate from this school and left on the <br />{" "}
                <span className="font-semibold underline">
                  {formatDate(leftOn)}
                </span>{" "}
                with a{" "}
                <span className="font-semibold underline">{character}</span>{" "}
                character.
              </p>

              <p
                className="mt-8"
                style={{ letterSpacing: "1px", lineHeight: "35px" }}
              >
                <span className="font-semibold underline">
                  {selectedStudent?.gender?.toLowerCase() == "male"
                    ? "He"
                    : "She"}
                </span>{" "}
                was then reading in the Class{" "}
                <span className="font-semibold underline">{selectedClass}</span>{" "}
                <br /> All sums due to this School on{" "}
                <span className="font-semibold underline">
                  {selectedStudent?.gender?.toLowerCase() == "male"
                    ? "His"
                    : "Her"}
                </span>{" "}
                account have been paid, remitted, <br /> or satisfactorily
                arranged for.
              </p>

              <p
                className="mt-8"
                style={{ letterSpacing: "1px", lineHeight: "35px" }}
              >
                <span className="font-semibold underline">
                  {selectedStudent?.gender?.toLowerCase() == "male"
                    ? "His"
                    : "Her"}
                </span>{" "}
                date of birth, according to the admission register is <br />
                <span className="font-semibold underline">
                  {formatDate(selectedStudent.dob)} (
                  {formatDateD(selectedStudent.dob)})
                </span>
                .
              </p>
              <p
                className="mt-8"
                style={{ letterSpacing: "1px", lineHeight: "35px" }}
              >
                Whether qualified for promotion to the Higher Class{" "}
                <span className="font-semibold underline">Yes</span>.
              </p>

              <p
                className="mt-8"
                style={{ letterSpacing: "1px", lineHeight: "35px" }}
              >
                ( The following additional information must be supplied if the
                student left at the end of school year. )
              </p>
            </div>
          </div>

          {/* <div className="mt-8 max-w-2xl flex justify-center m-auto">
          <div className="flex items-center justify-center">
            
          </div>
        </div> */}

          <div className="mt-24 w-full flex items-center justify-between">
            <div className="flex justify-end flex-col items-start">
              <p className="mt-3 font-semibold">Date _______________</p>
              <p className="mt-3 font-semibold">School Seal</p>
            </div>
            <div className="flex justify-end flex-col items-end">
              <p className="mt-3 font-semibold">Principal Signature</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 py-4 ">
        <div className="flex justify-center">
          <button onClick={handlePrint} className="btn btn-secondary">
            Print
          </button>
        </div>
      </div>
    </>
  );
};

export default TCertificate;
