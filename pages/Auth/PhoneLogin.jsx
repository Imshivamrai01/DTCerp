"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import axios from "axios";
import { auth } from "../../config/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const PhoneLogin = () => {
  const navigate = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {
          console.log("Error clearing reCAPTCHA on unmount:", e);
        }
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.log("Error clearing existing reCAPTCHA:", e);
      }
      window.recaptchaVerifier = null;
    }

    const container = document.getElementById("recaptcha-container");
    if (container) {
      container.innerHTML = "";
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          toast.error("reCAPTCHA expired. Please try again.");
          setLoading(false);
        },
      }
    );
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (phone.length === 10 && /^[0-9]+$/.test(phone)) {
      try {
        setupRecaptcha();

        const confirmation = await signInWithPhoneNumber(
          auth,
          "+91" + phone,
          window.recaptchaVerifier
        );

        if (confirmation) {
          window.confirmationResult = confirmation;
          toast.success("OTP sent successfully!");
          setIsOtpSent(true);
        }
      } catch (error) {
        console.error("Error:", error);
        if (error.code === "auth/too-many-requests") {
          toast.error("Too many requests. Please try again after some time.");
        } else if (error.message && error.message.includes("reCAPTCHA")) {
          toast.error(
            "reCAPTCHA error. Please refresh the page and try again."
          );
        } else {
          toast.error("Failed to send OTP. Try again.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please enter a valid 10-digit phone number.");
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Enter a 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      if (!window.confirmationResult) {
        toast.error("OTP session expired. Please resend OTP.");
        setLoading(false);
        return;
      }

      const result = await window.confirmationResult.confirm(otp);
      if (result.user) {
        const firebaseUid = result.user.uid;

        const response = await axios.post(
          "/api/firebase-auth/login",
          {
            phone: phone,
            firebaseUid: firebaseUid,
          }
        );

        if (response.data.success) {
          toast.success("Login successful!");
          const userData = response.data.user;

          localStorage.setItem("User", JSON.stringify(userData));
          localStorage.setItem("currentUser", "true");
          localStorage.setItem("role", userData.role);
          localStorage.setItem("email", userData.email);
          localStorage.setItem("class", userData.class);
          localStorage.setItem("division", userData.division);
          localStorage.setItem("id", userData._id);
          localStorage.setItem("name", userData.name);

          if (userData.assignedClasses) {
            localStorage.setItem(
              "assignedClasses",
              JSON.stringify(userData.assignedClasses)
            );
          }
          if (userData.assignedSections) {
            localStorage.setItem(
              "assignedSections",
              JSON.stringify(userData.assignedSections)
            );
          }
          if (userData.assignedWings) {
            localStorage.setItem(
              "assignedWings",
              JSON.stringify(userData.assignedWings)
            );
          }
          if (userData.assignedSubjects) {
            localStorage.setItem(
              "assignedSubjects",
              JSON.stringify(userData.assignedSubjects)
            );
          }

          setTimeout(() => {
            navigate.push("/dashboard", { replace: true });
          }, 200);
        } else {
          toast.error(response.data.message || "Login failed");
        }
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <Toaster draggable={true} /> */}
      <div
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        }}
        className="hero min-h-screen bg-base-200"
      >
        <div className="hero-overlay bg-opacity-70"></div>
        <div className="hero-content max-w-5xl flex-col md:gap-16 lg:flex-row-reverse">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl w-full font-bold text-white">
              D2C School Portal
            </h1>
          </div>
          <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <form className="card-body">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone Number</span>
                </label>
                <div className="flex">
                  <div className="border border-r-0 border-gray-400 py-2.5 px-3 rounded-l-md bg-gray-100">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="7080259585"
                    className="input input-bordered border-l-0 rounded-l-none flex-1"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isOtpSent || loading}
                  />
                </div>
              </div>

              {!isOtpSent ? (
                <div className="form-control mt-6">
                  <button
                    disabled={loading}
                    onClick={sendOtp}
                    className="btn btn-primary"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Enter OTP</span>
                    </label>
                    <input
                      type="text"
                      placeholder="123456"
                      className="input input-bordered"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="form-control mt-6">
                    <button
                      disabled={loading}
                      onClick={verifyOtp}
                      className="btn btn-primary"
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                  </div>
                </>
              )}
              <div
                id="recaptcha-container"
                className="flex justify-center mt-3"
              ></div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhoneLogin;
