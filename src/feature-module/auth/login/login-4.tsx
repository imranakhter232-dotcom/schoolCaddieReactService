import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../../core/api/axiosInstance";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import { handlePostLoginRedirect } from "../../../utils/authRedirect";

const SuperAdminLogin: React.FC = () => {
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
      // 1. API Endpoint change kiya: superadmin/login/
      const resp = await axiosInstance.post("superadmin/login/", {
        email,
        password,
      });

      if (resp.status === 200) {
        const data = resp.data;

        /*
          API RESPONSE EXPECTED:
          {
            "token": "...",
            "email": "...",
            "role_id": 4
          }
        */

        // 2. Clear previous session
        localStorage.clear();
        sessionStorage.clear();

        // 3. Set Auth Header
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Token ${data.token}`;

        // 4. Save Super Admin Data
        localStorage.setItem("token", data.token);
        localStorage.setItem("role_id", "4"); // Role ID for Super Admin
        localStorage.setItem("email", data.email);
        localStorage.setItem("rememberMe", "1");

        // 5. Redirect to Super Admin Dashboard
        navigate(handlePostLoginRedirect());
        return;
      }
    } catch (err: any) {
      console.error("Super Admin login error:", err);
      setErrorMsg(err?.response?.data?.detail || "Invalid Super Admin credentials");

      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center vh-100">
        <div className="col-md-5">
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-4">
              <ImageWithBasePath
                src="assets/img/authentication/authentication-logo.png"
                className="img-fluid"
                alt="Logo"
              />
            </div>

            <div className="card shadow-lg">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                   <span className="badge bg-danger-light text-danger mb-2">System Control</span>
                   <h3 className="mb-1">Super Admin Login</h3>
                   <p className="text-muted">Enter credentials to access master panel</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Admin Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="admin@system.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="••••••••"
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
                  <div className="alert alert-danger p-2 small">{errorMsg}</div>
                )}

                <div className="mb-3 text-end">
                  <Link to={routes.forgotPassword} className="text-danger small">
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="btn btn-danger w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span><i className="fas fa-spinner fa-spin me-2"></i>Verifying...</span>
                  ) : (
                    "Authorize Login"
                  )}
                </button>
              </div>
            </div>

            <p className="text-center mt-3 small text-muted">
              Secure Encrypted Master Access
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;