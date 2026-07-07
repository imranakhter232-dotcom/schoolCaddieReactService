import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { Calendar } from "primereact/calendar";
import type { Nullable } from "primereact/ts-helpers";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import axiosInstance from "../../../core/api/axiosInstance";

const StudentDashboard = () => {
  const routes = all_routes;
  const [date, setDate] = useState<Nullable<Date>>(new Date());
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentStats = async () => {
      try {
        // Student token hamesha axios interceptor se automatically jayega
        const response = await axiosInstance.get("school/dashboard-stats/");
        setStats(response.data);
      } catch (error) {
        console.error("Student Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentStats();
  }, []);

  if (loading) return <div className="p-5 text-center">Loading Student Progress...</div>;

  // Progress Chart Data (Recitation)
  const progressSeries = [stats?.stats?.progress_percentage || 0];
  const chartOptions: any = {
    chart: { type: 'radialBar', height: 250 },
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        dataLabels: { name: { show: false }, value: { fontSize: '22px', show: true } }
      }
    },
    labels: ['Memorization Progress'],
    colors: ["#3D5EE1"]
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <h3 className="page-title mb-1">My Dashboard</h3>
          <p className="text-muted">Welcome, {stats?.student_info?.name}</p>
        </div>

        {/* Student Profile Card */}
        <div className="row">
          <div className="col-md-12">
            <div className="card bg-dark text-white shadow-sm overflow-hidden">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="avatar avatar-xxl rounded border border-2 border-white me-3">
                    <img src={stats?.student_info?.photo || "assets/img/students/student-01.jpg"} alt="Student" className="rounded" />
                  </div>
                  <div>
                    <h2 className="text-white mb-1">{stats?.student_info?.name}</h2>
                    <p className="text-light mb-0">Grade: {stats?.student_info?.grade} - {stats?.student_info?.section} | Adm No: {stats?.student_info?.admission_number}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="row mt-4">
          <StatCard icon="subject.svg" color="primary" count={stats?.stats?.total_memorized} label="Verses Memorized" />
          <StatCard icon="student.svg" color="success" count={stats?.stats?.attendance_present} label="Days Present" />
          <StatCard icon="staff.svg" color="danger" count={stats?.stats?.attendance_absent} label="Days Absent" />
          <StatCard icon="teacher.svg" color="warning" count={stats?.stats?.latest_percentage} label="Last Exam %" isPercent={true} />
        </div>

        <div className="row mt-4">
          {/* Progress Chart */}
          <div className="col-xxl-6 col-xl-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header border-0"><h4 className="card-title">Recitation Progress</h4></div>
              <div className="card-body text-center">
                <ReactApexChart options={chartOptions} series={progressSeries} type="radialBar" height={250} />
                <p className="mt-2 text-muted">You have completed {stats?.stats?.progress_percentage}% of your assigned tasks.</p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="col-xxl-6 col-xl-12 d-flex">
            <div className="card flex-fill shadow-sm border-0">
              <div className="card-body">
                <Calendar value={date} onChange={(e) => setDate(e.value)} inline className="w-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reuseable Stat Card with Percent support
const StatCard = ({ icon, color, count, label, isPercent }: any) => (
  <div className="col-xxl-3 col-sm-6 d-flex">
    <div className="card flex-fill border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className={`avatar avatar-lg bg-${color}-transparent me-3 p-1`}>
            <ImageWithBasePath src={`assets/img/icons/${icon}`} alt="img" />
          </div>
          <div className="flex-fill">
            <h3 className="mb-0">
              <CountUp end={count} />{isPercent ? '%' : ''}
            </h3>
            <p className="text-muted small mb-0">{label}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default StudentDashboard;