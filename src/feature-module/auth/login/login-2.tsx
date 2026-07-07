import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import axiosInstance from "../../../core/api/axiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { handlePostLoginRedirect } from "../../../utils/authRedirect";
type PasswordField = "password";

const Login2 = () => {
  const routes = all_routes;
  const navigation = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  // ✅ Login API Call
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrorMsg("");

  try {
    const response = await axiosInstance.post("login/", {
      email: email,
      password: password,
    });

    if (response.status === 200) {
      const data = response.data;
      const token: string = data.token;
      const school_id: string = data.school_id;
      const school_name: string = data.school_name;
      const userEmail: string = data.email || "";
      const is_active: boolean = !!data.is_active;
      const role_id: number = Number(data.role_id) || 1;

      if (!token) {
        setErrorMsg("Login failed: no token received. Please try again.");
        return;
      }

      // Save via AuthContext (also persists to localStorage)
      login({ token, school_id, school_name, email: userEmail, is_active });
      localStorage.setItem("role_id", String(role_id));

      // Redirect — only role 1 (School Admin) is gated by is_active
      navigation(handlePostLoginRedirect());
    }
  } catch (error: any) {
    console.error("Login failed:", error);
    if (error.response && error.response.data) {
      setErrorMsg(error.response.data.message || "Invalid credentials");
    } else {
      setErrorMsg("Server error. Please try again later.");
    }

    // Remove old tokens on failure
    localStorage.removeItem("token");
    localStorage.removeItem("school_id");
    localStorage.removeItem("school_name");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <div className="container-fuild">
        <div className="login-wrapper w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
          <div className="row">
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

            <div className="col-lg-6 col-md-12 col-sm-12">
              <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap">
                <div className="col-md-8 mx-auto p-4">
                  <form onSubmit={handleLogin}>
                    <div>
                      <div className="mx-auto mb-5 text-center">
                        <ImageWithBasePath
                          src="assets/img/authentication/authentication-logo.png"
                          className="img-fluid"
                          alt="Logo"
                        />
                      </div>

                      <div className="card">
                        <div className="card-body p-4">
                          <div className="mb-4">
                            <h2 className="mb-2">
                             Admin Login
                            </h2>
                          </div>

                          <div className="login-or">
                            <span className="span-or">Or</span>
                          </div>

                          {/* Email */}
                          <div className="mb-3">
                            <label className="form-label">Email Address</label>
                            <div className="input-icon mb-3 position-relative">
                              <span className="input-icon-addon">
                                <i className="ti ti-mail" />
                              </span>
                              <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                              />
                            </div>

                            {/* Password */}
                            <label className="form-label">Password</label>
                            <div className="pass-group">
                              <input
                                type={
                                  passwordVisibility.password
                                    ? "text"
                                    : "password"
                                }
                                className="pass-input form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                              />
                              <span
                                className={`ti toggle-passwords ${
                                  passwordVisibility.password
                                    ? "ti-eye"
                                    : "ti-eye-off"
                                }`}
                                onClick={() =>
                                  togglePasswordVisibility("password")
                                }
                              ></span>
                            </div>
                          </div>

                          {errorMsg && (
                            <div className="alert alert-danger mt-2">
                              {errorMsg}
                            </div>
                          )}

                          {/* Remember + Forgot */}
                          <div className="form-wrap form-wrap-checkbox mb-3 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                              <div className="form-check form-check-md mb-0">
                                <input
                                  className="form-check-input mt-0"
                                  type="checkbox"
                                />
                              </div>
                              <p className="ms-1 mb-0">Remember Me</p>
                            </div>
                            <div className="text-end">
                              <Link
                                to={routes.forgotPassword}
                                className="link-danger"
                              >
                                Forgot Password?
                              </Link>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <div className="mb-3">
                            <button
                              type="submit"
                              className="btn btn-primary w-100"
                              disabled={loading}
                            >
                              {loading ? "Signing In..." : "Sign In"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 text-center">
                        <p className="mb-0">
                          Copyright © 2026 - School Caddie
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login2;
