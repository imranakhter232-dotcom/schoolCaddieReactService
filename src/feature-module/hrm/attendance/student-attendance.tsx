// @ts-nocheck
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import axiosInstance from "../../../core/api/axiosInstance";
import CommonSelect from "../../../core/common/commonSelect";
import { all_routes } from "../../router/all_routes";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "present", label: "Present"  },
  { value: "absent",  label: "Absent"   },
  { value: "late",    label: "Late"     },
  { value: "tardi", label: "Tardi" },
  { value: "holiday", label: "Holiday"  },
];

const STATUS_BADGE: Record<string, string> = {
  present: "bg-success",
  absent:  "bg-danger",
  late:    "bg-warning text-dark",
  tardi: "bg-secondary",
  holiday: "bg-info text-dark",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── Component ────────────────────────────────────────────────────────────────

const StudentAttendance = () => {
  const routes = all_routes;

  const roleId   = localStorage.getItem("role_id");
  const canEdit  = roleId === "1" || roleId === "2";
  const isStudent = roleId === "3";
  const studentId = localStorage.getItem("student_id");

  // Shared state
  const [loading, setLoading]       = useState(true);
  const [date, setDate]             = useState(dayjs());

  // Teacher / Admin state
  const [classes, setClasses]       = useState([]);
  const [classId, setClassId]       = useState<string>("");
  const [weeklyData, setWeeklyData] = useState([]);   // [{student_id, student_name, attendance:[]}]
  const [statusMap, setStatusMap]   = useState<Record<string, Record<number, string>>>({});
  // statusMap[student_id][dayIndex] = status

  // Student state
  const [history, setHistory]       = useState([]);

  // ── Fetch classes list ──────────────────────────────────────────────────────
  const fetchClasses = async () => {
    try {
      const res = await axiosInstance.get("get-classes/");
      setClasses(res.data);
      if (res.data.length > 0) setClassId(String(res.data[0].id));
    } catch {
      console.error("Failed to load classes");
    }
  };

  // ── Fetch weekly attendance for selected class ──────────────────────────────
  const fetchWeeklyAttendance = async (cId: string) => {
    if (!cId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`attendance/class/${cId}/weekly/`);
      const rows = Array.isArray(res.data) ? res.data : [];
      setWeeklyData(rows);

      // Build editable statusMap from fetched data
      const map: Record<string, Record<number, string>> = {};
      rows.forEach((row: any) => {
        map[row.student_id] = {};
        (row.attendance ?? []).forEach((status: string, idx: number) => {
          map[row.student_id][idx] = status ?? "present";
        });
      });
      setStatusMap(map);
    } catch {
      console.error("Failed to load weekly attendance");
      setWeeklyData([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch student's own history ─────────────────────────────────────────────
  const fetchStudentHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `attendance/student/${studentId}/history/`
      );
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch {
      console.error("Failed to load attendance history");
    } finally {
      setLoading(false);
    }
  };

  // ── Handle cell change ──────────────────────────────────────────────────────
  const handleChange = (studentId: string, dayIdx: number, value: string) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [dayIdx]: value },
    }));
  };

  // ── Submit attendance ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const selectedDate = dayjs(date).format("YYYY-MM-DD");
    const statuses: any[] = [];

    weeklyData.forEach((row: any) => {
      const dayStatuses = statusMap[row.student_id] ?? {};
      Object.entries(dayStatuses).forEach(([dayIdx, status]) => {
        statuses.push({ student: row.student_id, day_index: Number(dayIdx), status });
      });
    });

    try {
      await axiosInstance.post("/attendance/bulk-manage/", {
        date: selectedDate,
        class_id: classId,
        statuses,
      });
      Swal.fire({
        icon: "success",
        title: "Attendance Saved",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire("Error", "Failed to save attendance", "error");
    }
  };

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isStudent) {
      fetchStudentHistory();
    } else {
      fetchClasses();
    }
  }, []);

  useEffect(() => {
    if (!isStudent && classId) fetchWeeklyAttendance(classId);
  }, [classId]);

  // ── Class options for select ────────────────────────────────────────────────
  const classOptions = classes.map((c: any) => ({
    value: String(c.id),
    label: c.name ?? c.class_name ?? `Class ${c.id}`,
  }));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <div className="content">

        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Attendance</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Attendance
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap gap-3">
            <h4 className="mb-0">
              {isStudent ? "My Attendance History" : "Class Attendance"}
            </h4>

            {/* Controls — Teacher / Admin only */}
            {canEdit && (
              <div className="d-flex align-items-center flex-wrap gap-3">
                {/* Class selector */}
                <div style={{ minWidth: 180 }}>
                  <CommonSelect
                    options={classOptions}
                    value={classOptions.find((o) => o.value === classId) ?? null}
                    onChange={(opt: any) => setClassId(opt.value)}
                    placeholder="Select Class"
                  />
                </div>

                {/* Date picker */}
                <DatePicker
                  value={date}
                  onChange={(d) => setDate(d ?? dayjs())}
                  format="YYYY-MM-DD"
                  className="form-control"
                  style={{ width: 160 }}
                />
              </div>
            )}
          </div>

          {/* Table */}
          <div className="card-body p-0" style={{ overflowX: "auto" }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : isStudent ? (
              <StudentHistoryTable history={history} />
            ) : (
              <WeeklyTable
                rows={weeklyData}
                statusMap={statusMap}
                canEdit={canEdit}
                onChange={handleChange}
              />
            )}
          </div>

          {/* Footer */}
          <div className="card-footer">
            {canEdit ? (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={weeklyData.length === 0}
              >
                <i className="ti ti-check me-1" />
                Save Attendance
              </button>
            ) : (
              <p className="text-muted mb-0 small">
                <i className="ti ti-info-circle me-1" />
                Attendance can only be submitted by a Teacher or Admin.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Weekly Table (Teacher / Admin) ──────────────────────────────────────────

const WeeklyTable = ({ rows, statusMap, canEdit, onChange }: any) => (
  <table className="table table-bordered table-hover mb-0">
    <thead className="table-light">
      <tr>
        <th style={{ minWidth: 160 }}>Student</th>
        {DAYS.map((d) => <th key={d} style={{ minWidth: 130 }}>{d}</th>)}
      </tr>
    </thead>
    <tbody>
      {rows.length === 0 ? (
        <tr>
          <td colSpan={DAYS.length + 1} className="text-center py-4 text-muted">
            No students found for this class.
          </td>
        </tr>
      ) : (
        rows.map((row: any) => (
          <tr key={row.student_id}>
            <td className="fw-semibold">{row.student_name}</td>
            {DAYS.map((_, idx) => {
              const val = statusMap[row.student_id]?.[idx] ?? "present";
              return (
                <td key={idx}>
                  {canEdit ? (
                    <select
                      className="form-select form-select-sm"
                      value={val}
                      onChange={(e) => onChange(row.student_id, idx, e.target.value)}
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="tardi">Tardi</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  ) : (
                    <span className={`badge ${STATUS_BADGE[val] ?? "bg-secondary"}`}>
                      {val}
                    </span>
                  )}
                </td>
              );
            })}
          </tr>
        ))
      )}
    </tbody>
  </table>
);

// ─── Student History Table ────────────────────────────────────────────────────

const StudentHistoryTable = ({ history }: { history: any[] }) => (
  <table className="table table-hover mb-0">
    <thead className="table-light">
      <tr>
        <th>Date</th>
        <th>Status</th>
        <th>Updated</th>
      </tr>
    </thead>
    <tbody>
      {history.length === 0 ? (
        <tr>
          <td colSpan={3} className="text-center py-4 text-muted">
            No attendance records found.
          </td>
        </tr>
      ) : (
        history.map((r: any) => (
          <tr key={r.id}>
            <td>{r.date}</td>
            <td>
              <span className={`badge ${STATUS_BADGE[r.status] ?? "bg-secondary"}`}>
                {r.status}
              </span>
            </td>
            <td>{r.updated_at ?? "—"}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
);

export default StudentAttendance;
