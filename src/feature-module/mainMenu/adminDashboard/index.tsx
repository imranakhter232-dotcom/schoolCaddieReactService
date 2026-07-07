import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { Calendar } from "primereact/calendar";
import type { Nullable } from "primereact/ts-helpers";
import "bootstrap-daterangepicker/daterangepicker.css";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import axiosInstance from "../../../core/api/axiosInstance";

const AdminDashboard = () => {
  const routes = all_routes;
  const [date, setDate] = useState<Nullable<Date>>(new Date());
  const [loading, setLoading] = useState(true);

  // --- Backend States ---
  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_classes: 0,
    total_subjects: 0,
    performance: { top: 0, average: 0, below_avg: 0 } // Naya field
  });

  const [adminInfo, setAdminInfo] = useState({
    name: localStorage.getItem("school_name") || "Admin",
    email: localStorage.getItem("email") || ""
  });

  // --- API Call logic ---
  

  useEffect(() => {
    const fetchSchoolStats = async () => {
      try {
        // Sirf logged-in school ka data lane ke liye naya endpoint call
        const response = await axiosInstance.get("school/dashboard-stats/");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching school stats:", error);
      }
    };

    fetchSchoolStats();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get("school/dashboard-stats/");
        setStats(response.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchStats();
  }, []);

  // Performance Chart Configuration
  const performanceSeries = [
    stats.performance.top, 
    stats.performance.average, 
    stats.performance.below_avg
  ];

  const chartOptions: any = {
    chart: { type: 'donut', height: 220 },
    labels: ["Top", "Average", "Below Avg"],
    colors: ["#3D5EE1", "#EAB300", "#E82646"],
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: { size: '75%' }
      }
    }
  };

  // --- Chart Config (Using Backend Stats) ---
  const [classDonutChart] = useState<any>({
    chart: { height: 218, width: 218, type: "donut" },
    labels: ["Good", "Average", "Below Average"],
    colors: ["#3D5EE1", "#EAB300", "#E82646"],
    series: [45, 11, 2], // Ye data aap future mein analytics API se la sakte hain
    legend: { show: false },
    dataLabels: { enabled: false },
  });

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Admin Dashboard</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to={routes.adminDashboard}>Dashboard</Link></li>
                <li className="breadcrumb-item active">Admin Dashboard</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <Link to={routes.addStudent} className="btn btn-primary me-2"><i className="ti ti-square-rounded-plus me-2" />Add Student</Link>
            <Link to={routes.addTeacher} className="btn btn-dark"><i className="ti ti-square-rounded-plus me-2" />Add Teacher</Link>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="row">
          <div className="col-md-12">
            <div className="card bg-dark text-white overflow-hidden">
              <div className="card-body position-relative">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h1 className="text-white mb-2">Welcome Back, {adminInfo.name}</h1>
                    <p>You have {stats.total_teachers} Teachers and {stats.total_students} students under your management.</p>
                  </div>
                  <div className="text-end">
                    <p className="mb-0"><i className="ti ti-refresh me-1" />Updated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row">
          <StatCard icon="student.svg" color="danger" count={stats.total_students} label="Total Students" />
          <StatCard icon="teacher.svg" color="secondary" count={stats.total_teachers} label="Total Teachers" />
          <StatCard icon="staff.svg" color="warning" count={stats.total_classes} label="Total Classes" />
          <StatCard icon="subject.svg" color="success" count={stats.total_subjects || 0} label="Total Subjects" />
        </div>

        <div className="row">
          {/* Calendar & Events */}
          <div className="col-xxl-6 col-xl-6 d-flex">
            <div className="card flex-fill">
              {/* <div className="card-header d-flex justify-content-between">
                <h4 className="card-title">Schedules</h4>
                <Link to="#" className="link-primary fw-medium"><i className="ti ti-square-plus me-1" />Add Event</Link>
              </div> */}
              <div className="card-body">
                <Calendar className="datepickers mb-4 w-100" value={date} onChange={(e) => setDate(e.value)} inline />
                {/* <h5 className="mb-3">Today's Reminders</h5> */}
                {/* <div className="event-wrapper event-scroll" style={{maxHeight: '300px', overflowY: 'auto'}}>
                  <div className="border-start border-primary border-3 shadow-sm p-3 mb-3 bg-light">
                    <h6>Check Subscription Status</h6>
                    <p className="mb-0 text-muted"><i className="ti ti-clock me-1" /> 10:00 AM</p>
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Quick Links & Performance */}
         <div className="col-xxl-6 col-md-12 d-flex">
  <div className="card flex-fill">
    <div className="card-header d-flex align-items-center justify-content-between">
      <h4 className="card-title">Performance</h4>
      {/* <div className="dropdown">
        <Link
          to="#"
          className="bg-white dropdown-toggle"
          data-bs-toggle="dropdown"
        >
          <i className="ti ti-school-bell me-2" />
          Academic Year
        </Link>
        <ul className="dropdown-menu mt-2 p-3">
          <li><Link to="#" className="dropdown-item rounded-1">2023-24</Link></li>
          <li><Link to="#" className="dropdown-item rounded-1">2024-25</Link></li>
        </ul>
      </div> */}
    </div>
    <div className="card-body">
      <div className="d-md-flex align-items-center justify-content-between">
        <div className="me-md-3 mb-3 mb-md-0 w-100">
          {/* Top Category */}
          <div className="border border-dashed p-3 rounded d-flex align-items-center justify-content-between mb-1">
            <p className="mb-0 me-2">
              <i className="ti ti-arrow-badge-down-filled me-2 text-primary" />
              Top (&ge;80%)
            </p>
            <h5>{stats.performance.top}</h5>
          </div>
          
          {/* Average Category */}
          <div className="border border-dashed p-3 rounded d-flex align-items-center justify-content-between mb-1">
            <p className="mb-0 me-2">
              <i className="ti ti-arrow-badge-down-filled me-2 text-warning" />
              Average (50-80%)
            </p>
            <h5>{stats.performance.average}</h5>
          </div>

          {/* Below Avg Category */}
          <div className="border border-dashed p-3 rounded d-flex align-items-center justify-content-between mb-0">
            <p className="mb-0 me-2">
              <i className="ti ti-arrow-badge-down-filled me-2 text-danger" />
              Below Avg (&lt;50%)
            </p>
            <h5>{stats.performance.below_avg}</h5>
          </div>
        </div>

        {/* Chart Section */}
        <div className="text-center text-md-left">
          <ReactApexChart
            id="class-chart"
            options={chartOptions}
            series={performanceSeries}
            type="donut"
            width={220}
          />
        </div>
      </div>
    </div>
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

// --- Reusable Components for Clean Logic ---

const StatCard = ({ icon, color, count, label }: any) => (
  <div className="col-xxl-3 col-sm-6 d-flex">
    <div className="card flex-fill border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className={`avatar avatar-xl bg-${color}-transparent me-3 p-1`}>
            <ImageWithBasePath src={`assets/img/icons/${icon}`} alt="img" />
          </div>
          <div className="flex-fill">
            <h2 className="counter mb-0"><CountUp end={count} /></h2>
            <p className="text-muted mb-0">{label}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const QuickLink = ({ routes, icon, label, bg }: any) => (
  <div className="col-6 col-md-3 text-center">
    <Link to={routes} className={`d-block bg-${bg}-transparent rounded p-3 h-100`}>
      <div className={`avatar avatar-md bg-${bg} text-white rounded-circle mx-auto mb-2`}>
        <i className={`ti ${icon}`} />
      </div>
      <p className="text-dark small mb-0">{label}</p>
    </Link>
  </div>
);

export default AdminDashboard;