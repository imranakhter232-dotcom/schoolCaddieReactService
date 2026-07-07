import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import axiosInstance from "../../../core/api/axiosInstance";
import Swal from "sweetalert2";

type PasswordField = "newPassword" | "confirmPassword";

const ResetPasswordWithToken = () => {
  const routes = all_routes;
  const navigation = useNavigate();
  const { uidb64, token } = useParams<{ uidb64: string; token: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword.trim() || !confirmPassword.trim()) {
      Swal.fire("Error", "Please fill in all fields", "error");
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters long", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }

    if (!uidb64 || !token) {
      Swal.fire("Error", "Invalid reset link", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("auth/reset-password/", {
        uidb64,
        token,
        new_password: newPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: response.data.message || "Password reset successful",
        confirmButtonText: "Go to Login",
      }).then(() => {
        navigation(routes.login);
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Failed to reset password. The link may be invalid or expired.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center" style={{ background: "#f8f9fa" }}>
      <div className="row w-100 g-0">
        {/* Left Side - Illustration */}
        <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center position-relative" style={{ background: "#fff" }}>
          <div className="text-center">
            <ImageWithBasePath
              src="assets/img/authentication/authentication-04.jpg"
              alt="Reset Password Illustration"
              className="img-fluid"
              style={{ maxWidth: "500px" }}
            />
          </div>
          {/* Wave Background */}
          <div className="position-absolute bottom-0 start-0 w-100" style={{ height: "200px", overflow: "hidden" }}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ height: "100%", width: "100%" }}>
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#5568FE"></path>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#5568FE"></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#5568FE"></path>
            </svg>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center" style={{ background: "#fff" }}>
          <div className="w-100" style={{ maxWidth: "450px", padding: "40px" }}>
            {/* Logo */}
            <div className="text-center mb-4">
              <ImageWithBasePath
                src="assets/img/authentication/logo.png"
                alt="SchoolCaddie Logo"
                className="img-fluid mb-3"
                style={{ maxWidth: "200px" }}
              />
            </div>

            {/* Form Card */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: "12px" }}>
              <div className="card-body p-4">
                <h4 className="fw-bold mb-2">Reset Password</h4>
                <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
                  Please enter your new password
                </p>

                <form onSubmit={handleSubmit}>
                  {/* New Password Input */}
                  <div className="mb-3">
                    <label className="form-label text-dark fw-medium" style={{ fontSize: "14px" }}>
                      New Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={passwordVisibility.newPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{
                          padding: "12px 45px 12px 16px",
                          fontSize: "14px",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                          background: "#f8f9fa"
                        }}
                      />
                      <span
                        className="position-absolute top-50 end-0 translate-middle-y me-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => togglePasswordVisibility("newPassword")}
                      >
                        <i className={`ti ${passwordVisibility.newPassword ? "ti-eye" : "ti-eye-off"} text-muted`} />
                      </span>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="mb-3">
                    <label className="form-label text-dark fw-medium" style={{ fontSize: "14px" }}>
                      Confirm Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={passwordVisibility.confirmPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{
                          padding: "12px 45px 12px 16px",
                          fontSize: "14px",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                          background: "#f8f9fa"
                        }}
                      />
                      <span
                        className="position-absolute top-50 end-0 translate-middle-y me-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                      >
                        <i className={`ti ${passwordVisibility.confirmPassword ? "ti-eye" : "ti-eye-off"} text-muted`} />
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mb-3">
                    <button
                      type="submit"
                      className="btn w-100"
                      disabled={loading}
                      style={{
                        background: "#5568FE",
                        color: "#fff",
                        padding: "12px",
                        fontSize: "15px",
                        fontWeight: "600",
                        borderRadius: "8px",
                        border: "none"
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Resetting...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </button>
                  </div>

                  {/* Return to Login */}
                  <div className="text-center">
                    <Link 
                      to={routes.login} 
                      className="text-decoration-none"
                      style={{ color: "#5568FE", fontSize: "14px", fontWeight: "500" }}
                    >
                      Return to Login
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordWithToken;
