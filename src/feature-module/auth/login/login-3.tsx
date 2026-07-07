import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import axiosInstance from "../../../core/api/axiosInstance";
import { all_routes } from "../../router/all_routes";
import { handlePostLoginRedirect } from "../../../utils/authRedirect";

type PasswordField = "password";

const Login3: React.FC = () => {
  const navigate = useNavigate();
  const routes = all_routes;

  // ------------------ STATE ------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔴 IMPORTANT: default TRUE
  const [rememberMe, setRememberMe] = useState(true);

  const [passwordVisibility, setPasswordVisibility] = useState<Record<PasswordField, boolean>>({
    password: false,
  });

  // ------------------ EFFECT ------------------
  useEffect(() => {
    localStorage.setItem("menuOpened", "Dashboard");
  }, []);

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // ------------------ LOGIN ------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const resp = await axiosInstance.post("student/login/", {
        email,
        password,
      });

      if (resp.status === 200) {
        const data = resp.data;

        /*
          API RESPONSE:
          {
            token,
            student_id,
            role_id: 3,
            school_id
          }
        */

        // ✅ SET DJANGO TOKEN HEADER
        axiosInstance.defaults.headers.common["Authorization"] = `Token ${data.token}`;

        // ✅ ALWAYS SAVE IN LOCALSTORAGE
        localStorage.setItem("token", data.token);
        localStorage.setItem("role_id", "3");
        localStorage.setItem("student_id", String(data.student_id));
        localStorage.setItem("school_id", String(data.school_id || ""));
        localStorage.setItem("rememberMe", "1");

        // cleanup session storage (safety)
        sessionStorage.clear();

        // ✅ REDIRECT
        navigate(handlePostLoginRedirect());
        return;
      }

      setErrorMsg("Invalid credentials");
    } catch (err: any) {
      console.error("Student login error:", err);
      setErrorMsg(err?.response?.data?.detail || "Login failed");

      localStorage.clear();
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  // ------------------ UI ------------------
  return (
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

        <div className="col-md-5 mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="d-flex flex-column justify-content-between vh-100">

              {/* LOGO */}
              <div className="mx-auto p-4 text-center">
                <ImageWithBasePath
                  src="assets/img/authentication/authentication-logo.png"
                  className="img-fluid"
                  alt="Logo"
                />
              </div>

              {/* CARD */}
              <div className="card">
                <div className="card-body p-4">
                  <h2 className="mb-2">Parent/Student Login</h2>
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
                    <div className="pass-group">
                      <input
                        type={passwordVisibility.password ? "text" : "password"}
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        className={`ti ${
                          passwordVisibility.password ? "ti-eye" : "ti-eye-off"
                        }`}
                        onClick={() => togglePasswordVisibility("password")}
                      />
                    </div>
                  </div>

                  {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="form-check-label">Remember Me</label>
                    </div>
                    <div className="text-end">
                      <Link to={routes.forgotPassword} className="link-danger">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </div>

              {/* FOOTER */}
              <div className="p-4 text-center">
                <p>© {new Date().getFullYear()} </p>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login3;
