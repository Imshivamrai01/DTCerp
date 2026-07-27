"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { IoIosEye, IoIosEyeOff } from "react-icons/io";

const Login = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [btnDisable, setBtnDisable] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const user = localStorage.getItem("currentUser");
    if (user === "true") {
      setCurrentUser(true);
    }
  }, []);

  const handleTogglePassword = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const login = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please Input Valid Details !", { id: "Login" });
      return;
    }
    
    try {
      setBtnDisable(true);
      let data = {
        email: email,
        password: password,
      };
      
      // Call Next.js API route
      const res = await axios.post("/api/auth/login", data);

      if (res.data.success) {
        if (!res.data.isActive) {
          toast.error("This user is currently In-Active", { id: "wede" });
          setBtnDisable(false);
          return;
        }

        // Save data to localStorage exactly like before
        localStorage.setItem("User", JSON.stringify(res.data));
        localStorage.setItem("currentUser", "true");
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("secondaryRole", res.data.secondaryRole || "");
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("class", res.data.class || "");
        localStorage.setItem("division", res.data.division || "");
        localStorage.setItem("id", res.data._id);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("avatar", res.data.avatar || "");
        
        if (res.data.assignedClasses) {
          localStorage.setItem("assignedClasses", JSON.stringify(res.data.assignedClasses));
        }
        if (res.data.assignedSections) {
          localStorage.setItem("assignedSections", JSON.stringify(res.data.assignedSections));
        }
        if (res.data.classTeacher) {
          localStorage.setItem("classTeacher", JSON.stringify(res.data.classTeacher));
        }
        if (res.data.assignedWings) {
          localStorage.setItem("assignedWings", JSON.stringify(res.data.assignedWings));
        }
        if (res.data.assignedSubjects) {
          localStorage.setItem("assignedSubjects", JSON.stringify(res.data.assignedSubjects));
        }

        toast.success("Logged In Successfully!");
        setCurrentUser(true);
        if (res.data.role === "Parent") {
          window.location.href = "/parent/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Login failed");
      setBtnDisable(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const role = localStorage.getItem("role");
      if (role === "Parent") {
        router.push("/parent/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [currentUser, router]);

  return (
    <>
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
            <form className="card-body" onSubmit={login}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="email"
                  className="input input-bordered"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    className="input input-bordered w-full pr-10"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={handleTogglePassword}
                  >
                    {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
                  </button>
                </div>
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  disabled={btnDisable}
                  className="btn btn-primary"
                >
                  {btnDisable ? "Verifying..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
