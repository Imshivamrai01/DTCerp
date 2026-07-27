"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import axios from "axios";
import { FaWhatsapp } from "react-icons/fa";

const ShareHomework = () => {
  const { classSection } = useParams();
  const navigate = useRouter();
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const uid = localStorage.getItem("id");

  useEffect(() => {
    fetchClassHomeworks();
  }, [classSection]);

  const fetchClassHomeworks = () => {
    const [className, section] = classSection.split("-");
    axios
      .get(`/api/homework/teacher/${uid}`)
      .then((res) => {
        if (res.data.success) {
          const filteredHomeworks = res.data.data.filter(
            (hw) => hw.className === className && hw.section === section
          );
          setHomeworks(filteredHomeworks);
        }
      })
      .catch((error) => {
        console.error("Error fetching homeworks:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const shareAllOnWhatsApp = () => {
    if (homeworks.length === 0) return;

    const [className, section] = classSection.split("-");
    let message = `*Homework for Class ${className.toUpperCase()}-${section.toUpperCase()}*\n\n`;

    homeworks.forEach((homework, index) => {
      message += `*${index + 1}. ${homework.subject}*\n`;
      message += `${homework.description}\n\n`;
    });

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Homework for Class {classSection.toUpperCase()}
        </h1>
        <button
          className="btn btn-outline"
          onClick={() => navigate.push("/homework")}
        >
          Back to Homework
        </button>
      </div>

      {homeworks.length > 0 ? (
        <div>
          <div className="mb-6">
            <button
              className="btn btn-success gap-2"
              onClick={shareAllOnWhatsApp}
            >
              <FaWhatsapp />
              Share All Homework
            </button>
          </div>

          <div className="space-y-4">
            {homeworks.map((homework, index) => (
              <div key={homework._id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title">
                    {index + 1}. {homework.subject}
                  </h3>
                  <p>{homework.description}</p>
                  <div className="text-sm text-gray-600">
                    <p>
                      Due Date:{" "}
                      {new Date(homework.dueDate).toLocaleDateString()}
                    </p>
                    <p>
                      Created:{" "}
                      {new Date(homework.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p>No homework found for this class.</p>
      )}
    </div>
  );
};

export default ShareHomework;
