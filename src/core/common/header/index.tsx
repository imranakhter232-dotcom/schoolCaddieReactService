import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setDataLayout,
  setDataTheme,
} from "../../data/redux/themeSettingSlice";
import ImageWithBasePath from "../imageWithBasePath";
import {
  setExpandMenu,
  setMobileSidebar,
} from "../../data/redux/sidebarSlice";
import { useState } from "react";
import { all_routes } from "../../../feature-module/router/all_routes";
import axiosInstance from "../../../core/api/axiosInstance";
import Swal from "sweetalert2";

const Header = () => {
  const routes = all_routes;
  const dispatch = useDispatch();
  const dataTheme = useSelector((state: any) => state.themeSetting.dataTheme);
  const dataLayout = useSelector((state: any) => state.themeSetting.dataLayout);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();



  const handleChangePassword = async (e: React.FormEvent) => {
  e.preventDefault();

  if (newPassword !== confirmPassword) {
    Swal.fire("Error", "Passwords do not match", "error");
    return;
  }

  try {
    await axiosInstance.post("/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });

    Swal.fire({
      icon: "success",
      title: "Password Changed",
      text: "Please login again",
      timer: 1500,
      showConfirmButton: false,
    });

    // Clear modal state
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Close modal
    const modal = document.getElementById("changePasswordModal");
    // @ts-ignore
    window.bootstrap.Modal.getInstance(modal)?.hide();

    // Logout after password change
    handleLogout();

  } catch (error: any) {
    Swal.fire(
      "Error",
      error.response?.data?.detail || "Failed to change password",
      "error"
    );
  }
};

  const handleLogout = () => {
    // Get role_id before clearing localStorage
    const roleId = localStorage.getItem("role_id");
    
    // Clear all authentication data
    localStorage.clear();
    sessionStorage.clear();

    // Redirect based on role
    switch (roleId) {
      case "1": // School Admin
        navigate(routes.login2);
        break;
      case "2": // Teacher
        navigate(routes.login);
        break;
      case "3": // Student
        navigate(routes.login3);
        break;
      case "4": // Super Admin
        navigate(routes.superAdminLogin);
        break;
      default:
        navigate(routes.login);
    }
  };

  // localStorage se data nikaalein (Login ke waqt jo save kiya tha)
  const firstName = localStorage.getItem("first_name") || "User";
  const lastName = localStorage.getItem("last_name") || "";
  const roleId = localStorage.getItem("role_id");

  const getRoleName = () => {
    if (roleId === "1") return "Admin";
    if (roleId === "2") return "Teacher";
    if (roleId === "3") return "Student";
    if (roleId === "4") return "Admin";
    return "Staff";
  };


  
  const mobileSidebar = useSelector(
    (state: any) => state.sidebarSlice.mobileSidebar
  );

  const toggleMobileSidebar = () => {
    dispatch(setMobileSidebar(!mobileSidebar));
  };

  const onMouseEnter = () => {
    dispatch(setExpandMenu(true));
  };
  const onMouseLeave = () => {
    dispatch(setExpandMenu(false));
  };
  const handleToggleMiniSidebar = () => {
    if (dataLayout === "mini_layout") {
      dispatch(setDataLayout("default_layout"));
      localStorage.setItem("dataLayout", "default_layout");
    } else {
      dispatch(setDataLayout("mini_layout"));
      localStorage.setItem("dataLayout", "mini_layout");
    }
  };

  const handleToggleClick = () => {
    if (dataTheme === "default_data_theme") {
      dispatch(setDataTheme("dark_data_theme"));
      // localStorage.setItem(dataTheme,"dark_data_theme")
    } else {
      dispatch(setDataTheme("default_data_theme"));
      // localStorage.removeItem(dataTheme)
    }
  };
  const location = useLocation();
  const toggleNotification = () => {
    setNotificationVisible(!notificationVisible);
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
        });
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {
          });
        }
        setIsFullscreen(false);
      }
    }
  };

  return (
    <>
      {/* Header */}
      <div className="header">
        {/* Logo */}
        <div
          className="header-left active"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <Link to={routes.adminDashboard} className="logo logo-normal">
            <ImageWithBasePath src="assets/img/logo1122.png" alt="Logo" />
          </Link>
          <Link to={routes.adminDashboard} className="logo-small">
            <ImageWithBasePath src="favicon.png" alt="Logo" />
          </Link>
          <Link to={routes.adminDashboard} className="dark-logo">
            <ImageWithBasePath src="assets/img/logo1122.png" alt="Logo" />
          </Link>
          <Link id="toggle_btn" to="#" onClick={handleToggleMiniSidebar}>
            <i className="ti ti-menu-deep" />
          </Link>
        </div>
        {/* /Logo */}
        <Link
          id="mobile_btn"
          className="mobile_btn"
          to="#sidebar"
          onClick={toggleMobileSidebar}
        >
          <span className="bar-icon">
            <span />
            <span />
            <span />
          </span>
        </Link>
        <div className="header-user">
          <div className="nav user-menu">
            {/* Search */}
            <div className="nav-item nav-search-inputs me-auto">
              <div className="top-nav-search">
                <Link to="#" className="responsive-search">
                  <i className="fa fa-search" />
                </Link>
                <form action="#" className="dropdown">
                  <div className="searchinputs" id="dropdownMenuClickable">
                    <input type="text" placeholder="Search" />
                    <div className="search-addon">
                      <button type="submit">
                        <i className="ti ti-command" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            {/* /Search */}
            <div className="d-flex align-items-center">
              {/* <div className="dropdown me-2">
                <Link
                  to="#"
                  className="btn btn-outline-light fw-normal bg-white d-flex align-items-center p-2"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="ti ti-calendar-due me-1" />
                  Academic Year : 2024 / 2025
                </Link>
                <div className="dropdown-menu dropdown-menu-right">
                  <Link
                    to="#"
                    className="dropdown-item d-flex align-items-center"
                  >
                    Academic Year : 2023 / 2024
                  </Link>
                  <Link
                    to="#"
                    className="dropdown-item d-flex align-items-center"
                  >
                    Academic Year : 2022 / 2023
                  </Link>
                  <Link
                    to="#"
                    className="dropdown-item d-flex align-items-center"
                  >
                    Academic Year : 2021 / 2022
                  </Link>
                </div>
              </div> */}
              <div className="pe-1 ms-1">
                <div className="dropdown">
                  <Link
                    to="#"
                    className="btn btn-outline-light bg-white btn-icon d-flex align-items-center me-1 p-2"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <ImageWithBasePath
                      src="assets/img/flags/us.png"
                      alt="Language"
                      className="img-fluid rounded-pill"
                    />
                  </Link>
                  <div className="dropdown-menu dropdown-menu-right">
                    <Link
                      to="#"
                      className="dropdown-item active d-flex align-items-center"
                    >
                      <ImageWithBasePath
                        className="me-2 rounded-pill"
                        src="assets/img/flags/us.png"
                        alt="Img"
                        height={22}
                        width={22}
                      />{" "}
                      English
                    </Link>
                    {/* <Link
                      to="#"
                      className="dropdown-item d-flex align-items-center"
                    >
                      <ImageWithBasePath
                        className="me-2 rounded-pill"
                        src="assets/img/flags/fr.png"
                        alt="Img"
                        height={22}
                        width={22}
                      />{" "}
                      French
                    </Link>
                    <Link
                      to="#"
                      className="dropdown-item d-flex align-items-center"
                    >
                      <ImageWithBasePath
                        className="me-2 rounded-pill"
                        src="assets/img/flags/es.png"
                        alt="Img"
                        height={22}
                        width={22}
                      />{" "}
                      Spanish
                    </Link>
                    <Link
                      to="#"
                      className="dropdown-item d-flex align-items-center"
                    >
                      <ImageWithBasePath
                        className="me-2 rounded-pill"
                        src="assets/img/flags/de.png"
                        alt="Img"
                        height={22}
                        width={22}
                      />{" "}
                      German
                    </Link> */}
                  </div>
                </div>
              </div>
              
              <div className="pe-1">
                {!location.pathname.includes("layout-dark") && (
                  <Link
                    onClick={handleToggleClick}
                    to="#"
                    id="dark-mode-toggle"
                    className="dark-mode-toggle activate btn btn-outline-light bg-white btn-icon me-1"
                  >
                    <i
                      className={
                        dataTheme === "default_data_theme"
                          ? "ti ti-moon"
                          : "ti ti-brightness-up"
                      }
                    />
                  </Link>
                )}
              </div>
              
              {/* <div className="pe-1">
                <Link
                  to={routes.chat}
                  className="btn btn-outline-light bg-white btn-icon position-relative me-1"
                >
                  <i className="ti ti-brand-hipchat" />
                  <span className="chat-status-dot" />
                </Link>
              </div> */}
              {/* <div className="pe-1">
                <Link
                  to="#"
                  className="btn btn-outline-light bg-white btn-icon me-1"
                >
                  <i className="ti ti-chart-bar" />
                </Link>
              </div> */}
              <div className="pe-1">
                <Link
                  onClick={toggleFullscreen}
                  to="#"
                  className="btn btn-outline-light bg-white btn-icon me-1"
                  id="btnFullscreen"
                >
                  <i className="ti ti-maximize" />
                </Link>
              </div>
              <div className="dropdown ms-1 user-profile-dropdown">
                <Link
                  to="#"
                  className="dropdown-toggle d-flex align-items-center user-profile-trigger"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="avatar avatar-md rounded-circle user-avatar">
                    {(localStorage.getItem("first_name") || localStorage.getItem("school_name") || "U")[0].toUpperCase()}
                  </span>
                </Link>
                <div className="dropdown-menu dropdown-menu-end user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <div className="d-flex align-items-center">
                      <span className="avatar avatar-md me-3 rounded-circle user-avatar-small">
                        {(localStorage.getItem("first_name") || localStorage.getItem("school_name") || "U")[0].toUpperCase()}
                      </span>
                      <div className="user-info">
                        <h6 className="user-name mb-0">
                          {localStorage.getItem("first_name")} {localStorage.getItem("last_name") || localStorage.getItem("school_name")}
                        </h6>
                        <p className="user-role mb-0">
                          {localStorage.getItem("role_id") === "1" ? "School Admin" :
                           localStorage.getItem("role_id") === "2" ? "Teacher" :
                           localStorage.getItem("role_id") === "3" ? "Student" :
                           localStorage.getItem("role_id") === "4" ? "Super Admin" : "User"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="user-dropdown-body">
                    {(localStorage.getItem("role_id") === "1" || localStorage.getItem("role_id") === "2") && (
                      <Link className="dropdown-item user-dropdown-item" to={routes.schoolProfile}>
                        <i className="ti ti-building-school dropdown-item-icon" />
                        <span>School Profile</span>
                      </Link>
                    )}

                    <Link
                      className="dropdown-item user-dropdown-item"
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#changePasswordModal"
                    >
                      <i className="ti ti-key dropdown-item-icon" />
                      <span>Change Password</span>
                    </Link>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="user-dropdown-footer">
                    <Link
                      className="dropdown-item user-dropdown-item logout-item"
                      to="#"
                      onClick={(e) => { e.preventDefault(); handleLogout(); }}
                    >
                      <i className="ti ti-logout dropdown-item-icon" />
                      <span>Logout</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        <div className="dropdown mobile-user-menu">
          <Link
            to="#"
            className="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="fa fa-ellipsis-v" />
          </Link>
          <div className="dropdown-menu dropdown-menu-end">
            <Link className="dropdown-item" to={routes.profile}>
              My Profile
            </Link>
            <Link className="dropdown-item" to={routes.profilesettings}>
              Settings
            </Link>
            <Link className="dropdown-item" to={routes.login}>
              Logout
            </Link>
          </div>
        </div>
        {/* /Mobile Menu */}
      </div>
      {/* /Header */}

      {/* CHANGE PASSWORD MODAL */}
<div
  className="modal fade"
  id="changePasswordModal"
  tabIndex={-1}
  aria-hidden="true"
>
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Change Password</h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
        ></button>
      </div>

      <div className="modal-body">
        <form onSubmit={handleChangePassword}>
          <div className="mb-3">
            <label className="form-label">Old Password</label>
            <input
              type="password"
              className="form-control"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-end">
            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>


    </>
  );
};

export default Header;
