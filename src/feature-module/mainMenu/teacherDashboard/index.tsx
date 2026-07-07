import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { Calendar } from "primereact/calendar";
// Fix for verbatimModuleSyntax seen in your screenshot
import type { Nullable } from "primereact/ts-helpers"; 
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import axiosInstance from "../../../core/api/axiosInstance";
import SchoolProfileCard from "../../../components/SchoolProfileCard";

const TeacherDashboard = () => {
  const routes = all_routes;
  const [date, setDate] = useState<Nullable<Date>>(new Date());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
  const fetchTeacherDashboard = async () => {
    try {
      const response = await axiosInstance.get("teacher/dashboard-stats/");

      const data = response.data;

      setStats({
        name: data.teacher_info.name,
        grade: data.teacher_info.grade,
        // normalize: API may return a string or null instead of an array
        subjects: Array.isArray(data.teacher_info.subjects)
          ? data.teacher_info.subjects
          : data.teacher_info.subjects
          ? String(data.teacher_info.subjects).split(",").map((s: string) => s.trim())
          : [],
        total_students: data.stats.total_students,
        tasks: {
          completed: data.stats.completed_tasks,
          pending: data.stats.pending_tasks,
        }
      });


    } catch (error) {
      console.error("Teacher Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchTeacherDashboard();
}, []);

  // Show a better loading state or skeletons
  if (loading) return (
    <div className="page-wrapper">
      <div className="content text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading Teacher Dashboard...</p>
      </div>
    </div>
  );

  const taskSeries = [
  stats?.tasks?.completed || 0,
  stats?.tasks?.pending || 0,
];
  
  const chartOptions: any = {
    chart: { type: 'donut', height: 220 },
    labels: ["Completed", "Pending"],
    colors: ["#1ABE17", "#E82646"],
    legend: { position: 'bottom' },
    plotOptions: { pie: { donut: { size: '70%' } } }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header Section */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Teacher Dashboard</h3>
            <p className="text-muted">Welcome back, {stats?.name || "Teacher"}</p>
          </div>
          <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
            <Link to={routes.studentList} className="btn btn-primary me-2">My Students</Link>
            <Link to={routes.attendanceReport} className="btn btn-light">Attendance</Link>
          </div>
        </div>

        {/* School Profile Banner */}
        <SchoolProfileCard />

        {/* Profile Card */}
        <div className="row">
          <div className="col-md-12">
            <div className="card bg-dark text-white overflow-hidden">
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <div className="d-flex align-items-center mb-3 mb-md-0">
                    <div className="avatar avatar-xxl rounded border border-2 border-white me-3">
                      <ImageWithBasePath src="assets/img/teachers/teacher-05.jpg" alt="Teacher" />
                    </div>
                    <div>
                      <h2 className="text-white mb-1">{stats?.name}</h2>
                      <p className="text-light mb-0">
                        Subject: {stats?.subjects?.join(", ") || "N/A"} | 
                        Grade: {stats?.grade || "None Assigned"}
                      </p>
                    </div>
                  </div>
                  <Link to={routes.editTeacher} className="btn btn-primary">Edit Profile</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="row mt-4">
          <StatCard icon="student.svg" color="danger" count={stats?.total_students || 0} label="My Students" />
          <StatCard icon="staff.svg" color="success" count={stats?.tasks?.completed || 0} label="Tasks Completed" />
          <StatCard icon="subject.svg" color="warning" count={stats?.tasks?.pending || 0} label="Pending Tasks" />
        </div>

        {/* Performance & Schedules */}
        <div className="row mt-4">
          <div className="col-xxl-6 col-xl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header"><h4 className="card-title">Task Completion Performance</h4></div>
              <div className="card-body">
                <div className="d-md-flex align-items-center justify-content-between">
                  <div className="w-100 me-3">
                    <div className="border border-dashed p-3 rounded mb-2 d-flex justify-content-between align-items-center">
                      <span><i className="ti ti-circle-filled text-success me-2"/>Completed</span>
                      <h5>{stats?.tasks?.completed || 0}</h5>
                    </div>
                    <div className="border border-dashed p-3 rounded d-flex justify-content-between align-items-center">
                      <span><i className="ti ti-circle-filled text-danger me-2"/>Pending</span>
                      <h5>{stats?.tasks?.pending || 0}</h5>
                    </div>
                  </div>
                  <ReactApexChart options={chartOptions} series={taskSeries} type="donut" width={240} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-xxl-6 col-xl-12 d-flex">
            <div className="card flex-fill shadow-sm">
              <div className="card-body">
                <Calendar value={date} onChange={(e) => setDate(e.value)} inline className="w-100 custom-calendar" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, color, count, label }: any) => (
  <div className="col-xxl-4 col-sm-6 d-flex">
    <div className="card flex-fill border-0 shadow-sm animate-card">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className={`avatar avatar-lg bg-${color}-transparent me-3 p-1`}>
            <ImageWithBasePath src={`assets/img/icons/${icon}`} alt="img" />
          </div>
          <div className="flex-fill">
            <h3 className="mb-0"><CountUp end={count} /></h3>
            <p className="text-muted small mb-0">{label}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TeacherDashboard;