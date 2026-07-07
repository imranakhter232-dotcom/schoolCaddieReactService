import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../../core/api/axiosInstance";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import { handlePostLoginRedirect } from "../../../utils/authRedirect";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const routes = all_routes;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localStorage.setItem("menuOpened", "Dashboard");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const resp = await axiosInstance.post("teacher/login/", {
        email,
        password,
      });

      if (resp.status === 200) {
        const data = resp.data;

        // 🔥 CLEAR OLD DATA
        localStorage.clear();
        sessionStorage.clear();

        const token: string = data.token;
        const role_id: number = Number(data.role_id) || 2; // default to Teacher role

        if (!token) {
          setErrorMsg("Login failed: no token received.");
          return;
        }

        // ✅ SET AUTH HEADER
        axiosInstance.defaults.headers.common["Authorization"] = `Token ${token}`;

        // ✅ SAVE TO LOCALSTORAGE
        localStorage.setItem("token", token);
        localStorage.setItem("role_id", String(role_id));
        localStorage.setItem("teacher_id", String(data.teacher_id || ""));
        localStorage.setItem("school_id", String(data.school_id || ""));
        localStorage.setItem("email", String(data.email || ""));

        // 🚀 REDIRECT BASED ON ROLE (teachers/students never hit payment)
        navigate(handlePostLoginRedirect());
        return;
      }

      setErrorMsg("Invalid credentials");
    } catch (err: any) {
      console.error("Teacher login error:", err);
      setErrorMsg(err?.response?.data?.detail || "Login failed");

      localStorage.clear();
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="login-wrapper w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
      <div className="row ">

        <div className="col-lg-6">
              <div className="d-lg-flex align-items-center justify-content-center bg-light-300 d-lg-block d-none flex-wrap vh-100 overflowy-auto bg-01">
                <div>
                  <ImageWithBasePath
                    src="assets/img/authentication/authentication-06.svg"
                    alt="Img"
                  />
                </div>
              </div>
            </div>

        <div className="col-md-5 p-5">
          <form onSubmit={handleSubmit}>

            <div className="text-center mb-4">
              <ImageWithBasePath
                src="assets/img/authentication/authentication-logo.png"
                className="img-fluid"
                alt="Logo"
              />
            </div>

            <div className="card">
              <div className="card-body p-4">
                <h3 className="mb-2">Teacher Login</h3>
                <p>Please enter your details</p>

                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Password</label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y me-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger">{errorMsg}</div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </div>

            <p className="text-center mt-3">
              <Link to={routes.forgotPassword}>Forgot Password?</Link>
            </p>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
