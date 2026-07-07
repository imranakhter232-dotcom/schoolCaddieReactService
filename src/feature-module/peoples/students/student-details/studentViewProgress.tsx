import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import StudentModals from "../studentModals";
import StudentSidebar from "./studentSidebar";
import StudentBreadcrumb from "./studentBreadcrumb";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";
import axiosInstance from "../../../../core/api/axiosInstance";

// ---------------- STUDENT TYPE ----------------
export interface Student {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  grade?: string | null;
  section?: string | null;
}

// ---------------- PROGRESS API RESPONSE TYPE ----------------
type ProgressSummary = {
  todayMinutes: number;
  weeklyTotal: number;
  currentStreak: number;
  avgQuality: string;

  dailyActivity: { day: string; minutes: number }[];
  versesPerDay: { day: string; verses: number }[];
  weeklyBreakdown: {
    week: string;
    memorization: number;
    recitation: number;
    revision: number;
  }[];

  juzzProgress: {
    juz: number;
    pct: number;
    sub: string;
  }[];

  insights: {
    title: string;
    message: string;
  }[];   // 🔥 ADD THIS
};


const StudentViewProgress: React.FC = () => {
  const routes = all_routes;
  const { id } = useParams<{ id: string }>();

  // ---------------- LOCAL STATES ----------------
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
 
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  const [activeView, setActiveView] = useState<"progress" | "activity">(
    "progress"
  );

  const palette = {
    bg: "#f3fbf6",
  };

  // ---------------- FETCH STUDENT ----------------
  const fetchStudent = async () => {
    try {
      const res = await axiosInstance.get(`get-student/${id}/`);
      setStudent(res.data);
    } catch (err) {
      console.error("Student fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FETCH PROGRESS SUMMARY ----------------
  const fetchProgressSummary = async () => {
    setProgressLoading(true);
    try {
      const res = await axiosInstance.get(
        `/recitation/${id}/progress-summary/`
      );
      setProgress(res.data);
    } catch (err) {
      console.error("Progress fetch error", err);
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudent();
      fetchProgressSummary();
    }
  }, [id]);

  // ---------------- LOADING STATES ----------------
  // if (loading || progressLoading) {
  //   return (
  //     <div className="text-center py-5">
  //       Loading student progress...
  //     </div>
  //   );
  // }

  // if (!student || !progress) {
  //   return (
  //     <div className="text-center py-5 text-danger">
  //       No student data or progress found.
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="page-wrapper" style={{ background: palette.bg }}>
        <div className="content">
          <div className="row">
            <StudentBreadcrumb />
          </div>

          <div className="row">
            <StudentSidebar />

            <div className="col-xxl-9 col-xl-8 position-relative">

{(loading || progressLoading) && (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(255,255,255,0.6)",
      zIndex: 10,
      borderRadius: 8,
    }}
  >
    <div className="text-center">
      <div className="spinner-border text-primary mb-2" />
      <div className="text-muted small">
        Loading student progress...
      </div>
    </div>
  </div>
)}


              {/* ---------------- TOP NAV TABS ---------------- */}
              <ul className="nav nav-tabs nav-tabs-bottom mb-4">
                <li>
                  <Link
                    to={routes.studentDetail.replace(":id", id!)}
                    className="nav-link"
                  >
                    <i className="ti ti-school me-2" />
                    Student Details
                  </Link>
                </li>

                <li>
                  <Link
                    to={routes.studentResult.replace(":id", id!)}
                    className="nav-link"
                  >
                    <i className="ti ti-bookmark-edit me-2" />
                    Exam & Results
                  </Link>
                </li>

                <li>
                  <Link
                    to={routes.studentStartRecitation.replace(":id", id!)}
                    className="nav-link"
                  >
                    <i className="ti ti-report-money me-2" />
                    Start Recitation
                  </Link>
                </li>

                <li>
                  <Link
                    to={routes.studentLogMemorization.replace(":id", id!)}
                    className="nav-link"
                  >
                    <i className="ti ti-books me-2" />
                    Log Memorization
                  </Link>
                </li>

                <li>
                  <Link
                    to={routes.studentViewProgress.replace(":id", id!)}
                    className="nav-link active"
                  >
                    <i className="ti ti-books me-2" />
                    View Progress
                  </Link>
                </li>

                {/* <li>
                  <Link
                    to={routes.studentTimeTable.replace(":id", id!)}
                    className="nav-link"
                  >
                    <i className="ti ti-table-options me-2" />
                    Time Table
                  </Link>
                </li> */}

                <li>
                  <Link
                    to={routes.studentLeaves.replace(":id", id!)}
                    className="nav-link"
                  >
                    <i className="ti ti-calendar-due me-2" />
                    Leave & Attendance
                  </Link>
                </li>
              </ul>

              {/* ---------------- SUMMARY CARDS ---------------- */}
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <div className="card p-3">
                    <small className="text-muted">Today Minutes</small>
                    <h4 className="mt-2">{progress?.todayMinutes ?? "--"}</h4>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card p-3">
                    <small className="text-muted">Weekly Total</small>
                    <h4 className="mt-2">{progress?.weeklyTotal ?? "--"} min</h4>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card p-3">
                    <small className="text-muted">Study Streak</small>
                    <h4 className="mt-2">{progress?.currentStreak ?? "--"} days</h4>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="card p-3">
                    <small className="text-muted">Avg. Quality</small>
                    <h4 className="mt-2">{progress?.avgQuality ?? "--"}</h4>
                  </div>
                </div>
              </div>

              {/* ---------------- GREEN SWITCH ---------------- */}
              <div className="mb-4">
                <div className="d-flex bg-primary rounded-pill p-1">
                  <button
                    className={`btn btn-sm flex-fill rounded-pill ms-1 ${
                      activeView === "progress"
                        ? "btn-light"
                        : "btn-outline-light"
                    }`}
                    style={{ fontWeight: 500 }}
                    onClick={() => setActiveView("progress")}
                  >
                    <i className="bi bi-bar-chart-fill me-1" />
                    Progress
                  </button>

                  <button
                    className={`btn btn-sm flex-fill rounded-pill ms-1 ${
                      activeView === "activity"
                        ? "btn-light"
                        : "btn-outline-light"
                    }`}
                    style={{ fontWeight: 500 }}
                    onClick={() => setActiveView("activity")}
                  >
                    Activity
                  </button>
                </div>
              </div>

              {/* ================= PROGRESS VIEW ================= */}
{activeView === "progress" ? (
  <>
    <div className="row g-3 mb-4">

      {/* ------------ WEEKLY PROGRESS BAR CHART ------------ */}
      <div className="col-lg-7">
        <div className="card p-4">
          <h5 style={{ color: "#174a34", fontWeight: 700 }}>
            Weekly Progress
          </h5>
          <small className="text-muted d-block mb-3">
            Memorization, recitation & revision (per week)
          </small>

          <div style={{ width: "100%", height: 340 }}>
            <ResponsiveContainer>
              <BarChart
                data={progress?.weeklyBreakdown ?? []} 
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#e6efe8"
                  strokeDasharray="4 6"
                />

                <YAxis
                  tick={{ fill: "#6b776f", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b776f", fontSize: 13 }}
                />

                <Tooltip
                  wrapperStyle={{
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                  contentStyle={{ borderRadius: 8 }}
                />

                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ top: -6, right: 0 }}
                />

                <Bar
                  dataKey="memorization"
                  name="Memorization"
                  barSize={18}
                  radius={[6, 6, 0, 0]}
                  fill="#184f35"
                />
                <Bar
                  dataKey="recitation"
                  name="Recitation"
                  barSize={18}
                  radius={[6, 6, 0, 0]}
                  fill="#2f855a"
                />
                <Bar
                  dataKey="revision"
                  name="Revision"
                  barSize={18}
                  radius={[6, 6, 0, 0]}
                  fill="#bfe7c9"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ------------ DYNAMIC JUZZ PROGRESS (1–30) ------------ */}
      <div className="col-lg-5">
        <div className="card p-4">
          <h5>Juzz Progress</h5>
          <small className="text-muted d-block mb-3">
            Dynamic progress for each Juzz
          </small>

          {(progress?.juzzProgress ?? []).map((juzz, i) => (
            <div key={i} className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div>
                  <strong>Juzz {juzz.juz}</strong>
                  <div className="small text-muted">{juzz.sub}</div>
                </div>

                <span className="badge rounded-pill bg-dark text-white">
                  {juzz.pct}%
                </span>
              </div>

              <div
                className="progress"
                style={{ height: 10, background: "#e9f3ea" }}
              >
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: `${juzz.pct}%` }}
                  aria-valuenow={juzz.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>

  </>
) : (

/* ================= ACTIVITY VIEW ================= */
<div className="row">
  {/* ------------ DAILY ACTIVITY CHART ------------ */}
  <div className="col-md-6 mb-4">
    <div className="card p-4">
      <h4 className="mb-2" style={{ color: "#174a34", fontWeight: 600 }}>
        Daily Activity
      </h4>
      <p className="text-muted small mb-4">
        Minutes spent memorizing per day
      </p>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={progress?.dailyActivity ?? []}>
          <defs>
            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />

          <Area
            type="monotone"
            dataKey="minutes"
            stroke="#4CAF50"
            fillOpacity={1}
            fill="url(#colorActivity)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* ------------ VERSES MEMORIZED DAILY ------------ */}
  <div className="col-md-6 mb-4">
    <div className="card p-4">
      <h4 className="mb-2" style={{ color: "#174a34", fontWeight: 600 }}>
        Verses Memorized
      </h4>
      <p className="text-muted small mb-4">
        Number of verses memorized daily
      </p>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={progress?.versesPerDay ?? []}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="verses"
            stroke="#174a34"
            strokeWidth={2}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
)}





</div>
</div>
</div>
</div>

<StudentModals />
</>
);
};

export default StudentViewProgress;
