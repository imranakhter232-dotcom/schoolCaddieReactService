// @ts-nocheck
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import StudentSidebar from "./studentSidebar";
import StudentBreadcrumb from "./studentBreadcrumb";
import Table from "../../../../core/common/dataTable/index";
import axiosInstance, { API_BASE_URL } from "../../../../core/api/axiosInstance";
import jsPDF from "jspdf";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DatePicker from "antd/es/date-picker";
import CommonSelect from "../../../../core/common/commonSelect";
import dayjs from "dayjs";
import StudentAbsenceForm from "./StudentAbsenceForm";

// -------------------- STUDENT INTERFACE --------------------
export interface Student {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  grade?: string | null;
  section?: string | null;
}

// -------------------- MAIN COMPONENT --------------------
const StudentLeaves = () => {
  const routes = all_routes;
  const { id } = useParams<{ id: string }>();

  // --- States ---
  const [student, setStudent] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  // --- Leave form states ---
  const leaveTypeOptions = [
    { value: "medical", label: "Medical" },
    { value: "casual", label: "Casual" },
    { value: "other", label: "Other" },
  ];

  const [leaveTypeValue, setLeaveTypeValue] = useState("medical");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [reason, setReason] = useState("");

  const [calendarMonth, setCalendarMonth] = useState(dayjs());
  const [calendarAttendance, setCalendarAttendance] = useState([]);

  // Role-based access
  const roleId = localStorage.getItem("role_id");
  const isTeacherOrAdmin = roleId === "1" || roleId === "2";

  // Single-select leave for PDF download
  const [selectedLeave, setSelectedLeave] = useState(null);

  // -------------------- API CALLS --------------------

  const fetchCalendarAttendance = async () => {
    try {
      const month = dayjs(calendarMonth).format("YYYY-MM");

      const res = await axiosInstance.get(
        `/student/${id}/attendance/?month=${month}`
      );

      setCalendarAttendance(res.data);
    } catch (e) {
      console.error("Calendar attendance fetch error");
    }
  };


  const fetchStudent = async () => {
    try {
      const res = await axiosInstance.get(`get-student/${id}/`);
      setStudent(res.data);
    } catch {
      console.error("Failed to load student");
    } finally {
      setLoadingStudent(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await axiosInstance.get(`/student/${id}/leaves/`);
      setLeaves(res.data);
    } catch {
      console.error("Failed to load leaves");
    } finally {
      setLoadingLeaves(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await axiosInstance.get(`/student/${id}/attendance/`);
      setAttendance(res.data);
    } catch {
      console.error("Failed to load attendance");
    } finally {
      setLoadingAttendance(false);
    }
  };

  // -------------------- Apply Leave --------------------
  const handleApplyLeave = async () => {
    if (!fromDate || !toDate) {
      Swal.fire("Error", "Please select dates", "error");
      return;
    }

    const payload = {
      student: id,
      leave_type: leaveTypeValue,
      start_date: dayjs(fromDate).format("MM-DD-YYYY"),
      end_date: dayjs(toDate).format("MM-DD-YYYY"),
      reason,
    };

    try {
      await axiosInstance.post(`/student/${id}/leaves/apply/`, payload);

      Swal.fire({
        icon: "success",
        title: "Leave Applied",
        timer: 1400,
        showConfirmButton: false,
      });

      fetchLeaves();
    } catch {
      Swal.fire("Error", "Could not apply leave", "error");
    }
  };

  // -------------------- Delete Leave --------------------
  const deleteLeave = async (leaveId) => {
    try {
      await axiosInstance.delete(`/student/leaves/${leaveId}/`);

      Swal.fire("Deleted", "Leave removed", "success");
      fetchLeaves();
    } catch {
      Swal.fire("Error", "Unable to delete", "error");
    }
  };

  // -------------------- Update Leave Status (Teacher/Admin) --------------------
  const updateLeaveStatus = async (leaveId, status) => {
    try {
      await axiosInstance.patch(`student/leaves/${leaveId}/status/`, { status });
      Swal.fire({
        icon: "success",
        title: `Leave ${status}`,
        timer: 1200,
        showConfirmButton: false,
      });
      fetchLeaves();
    } catch {
      Swal.fire("Error", "Could not update leave status", "error");
    }
  };

  // -------------------- Download PDF --------------------
  const downloadPDF = () => {
    const url = `${API_BASE_URL}student/leaves/report/pdf/`;
    window.open(url, "_blank");
  };

  // -------------------- Download Selected Leave PDF (frontend-only) --------------------
  const downloadLeavePDF = () => {
    if (!selectedLeave) {
      Swal.fire("Info", "Please select a leave row first", "info");
      return;
    }
    const leave = leaves.find((l) => l.id === selectedLeave);
    if (!leave) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Student Leave Report", 20, 20);
    doc.setFontSize(12);
    doc.text(`Student: ${student?.first_name ?? ""} ${student?.last_name ?? ""}`, 20, 40);
    doc.text(`Leave Type: ${leave.leave_type}`, 20, 50);
    doc.text(`Start Date: ${leave.start_date}`, 20, 60);
    doc.text(`End Date: ${leave.end_date}`, 20, 70);
    doc.text(`Status: ${leave.status}`, 20, 80);
    doc.text(`Reason: ${leave.reason ?? ""}`, 20, 90);
    doc.save("leave_report.pdf");
  };

  // -------------------- Load on Mount --------------------
  useEffect(() => {
    fetchStudent();
    fetchLeaves();
    fetchAttendance();
  }, [id]);

  useEffect(() => {
    if (id) fetchCalendarAttendance();
  }, [calendarMonth]);

  // -------------------- Table Columns --------------------
  const leaveColumns = [
    {
      title: "Select",
      render: (r) => (
        <input
          type="checkbox"
          checked={selectedLeave === r.id}
          onChange={() => setSelectedLeave(selectedLeave === r.id ? null : r.id)}
        />
      ),
    },
    { title: "Type", dataIndex: "leave_type" },
    {
      title: "Dates",
      render: (r) => r.end_date ? `${r.start_date} → ${r.end_date}` : r.start_date,
    },
    {
      title: "Days",
      render: (r) => r.end_date ? r.no_of_days : "1",
    },
    { title: "Applied", dataIndex: "applied_on" },
    {
      title: "Status",
      render: (r) => (
        <span className={`badge ${
          r.status === "approved"
            ? "bg-success"
            : r.status === "rejected"
            ? "bg-danger"
            : "bg-warning"
        }`}>
          {r.status}
        </span>
      ),
    },
    {
      title: "Action",
      render: (r) => (
        <div className="d-flex align-items-center gap-2">
          {isTeacherOrAdmin && r.status === "pending" && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => updateLeaveStatus(r.id, "approved")}
              >
                Accept
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => updateLeaveStatus(r.id, "rejected")}
              >
                Reject
              </button>
            </>
          )}
          {isTeacherOrAdmin && r.status !== "pending" && (
            <span className={`badge ${r.status === "approved" ? "bg-success" : "bg-danger"}`}>
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
            </span>
          )}
          {!isTeacherOrAdmin && r.status !== "approved" && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteLeave(r.id)}
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  const attendanceColumns = [
    { title: "Date", dataIndex: "date" },
    {
      title: "Status",
      render: (r) => (
        <span className={`badge ${
          r.status === "present"
            ? "bg-success"
            : r.status === "absent"
            ? "bg-danger"
            : r.status === "late"
            ? "bg-warning"
            : "bg-info"
        }`}>
          {r.status}
        </span>
      ),
    },
    { title: "Updated", dataIndex: "updated_at" },
  ];

  // -------------------- UI --------------------

  // if (loadingStudent) return <div className="text-center p-5">Loading...</div>;

  return (
    <>
      <div className="page-wrapper">
        <div className="content">

          <StudentBreadcrumb />

          <div className="row">
            <StudentSidebar />

            <div className="col-xxl-9 col-xl-8">

              {/* Tabs */}
              <ul className="nav nav-tabs nav-tabs-bottom mb-4">
                <li>
                  <Link className="nav-link" to={routes.studentDetail.replace(":id", id!)}>Student Details</Link>
                </li>
                <li>
                  <Link className="nav-link" to={routes.studentResult.replace(":id", id!)}>Results</Link>
                </li>
                <li>
                  <Link className="nav-link" to={routes.studentStartRecitation.replace(":id", id!)}>Recitation</Link>
                </li>
                <li>
                  <Link className="nav-link" to={routes.studentLogMemorization.replace(":id", id!)}>Memorization</Link>
                </li>
                <li>
                  <Link className="nav-link" to={routes.studentViewProgress.replace(":id", id!)}>Progress</Link>
                </li>
                <li>
                  <Link className="nav-link" to={routes.studentTimeTable.replace(":id", id!)}>Time Table</Link>
                </li>
                <li>
                  <Link className="nav-link active" to={routes.studentLeaves.replace(":id", id!)}>Leave & Attendance</Link>
                </li>
              </ul>

              <div className="tab-content">
                {/* Absence Form Section — hidden for Teacher/Admin */}
                {!isTeacherOrAdmin && (
                  <div className="mb-4">
                    <StudentAbsenceForm />
                  </div>
                )}

                {/* Leave Section */}
                <div className="tab-pane fade show active" id="leave">
                  <div className="card">

                    

                    <div className="card-header d-flex justify-content-between">
                      <h4>Leaves & Attendance</h4>

                      <button
      className="btn btn-success"
      data-bs-toggle="modal"
      data-bs-target="#attendance_calendar_modal"
    >
      View Attendance
    </button>

                      {/* <button
                        className="btn btn-info text-white"
                        onClick={downloadPDF}
                      >
                        <i className="ti ti-file-type-pdf me-1" />
                        Download PDF
                      </button> */}

                      <button
                        className="btn btn-primary"
                        disabled={!selectedLeave}
                        onClick={downloadLeavePDF}
                      >
                        <i className="ti ti-download me-1" />
                        Download Selected Leave
                      </button>

                      {/* <button
                        className="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#apply_leave"
                      >
                        Apply Leave
                      </button> */}
                    </div>

                    <div className="card-body">
                      {loadingLeaves ? (
                        <div>Loading...</div>
                      ) : (
                        <Table dataSource={leaves} columns={leaveColumns} Selection={false} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Attendance Section */}
                <div className="tab-pane fade" id="attendance">
                  <div className="card">
                    

                    <div className="card-body">
                      {loadingAttendance ? (
                        <div>Loading...</div>
                      ) : (
                        <Table dataSource={attendance} columns={attendanceColumns} Selection={false} />
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>


      {/* ======================= ATTENDANCE CALENDAR MODAL ======================== */}
<div className="modal fade" id="attendance_calendar_modal">
  <div className="modal-dialog modal-lg modal-dialog-centered">
    <div className="modal-content">

      <div className="modal-header">
        <h4 className="modal-title">Attendance Calendar</h4>
        <button className="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div className="modal-body">

        {/* Month Picker */}
        <div className="mb-3">
          <label>Select Month</label>
          <DatePicker
            picker="month"
            value={calendarMonth}
            onChange={(v) => setCalendarMonth(v)}
            format="YYYY-MM"
            className="form-control"
          />
        </div>

        {/* Calendar Grid */}
        <div className="attendance-calendar-grid">
          {calendarAttendance.length === 0 ? (
            <p className="text-center">No attendance found for this month.</p>
          ) : (
            calendarAttendance.map((att) => (
              <div
                key={att.id}
                className={`att-day-box ${
                  att.status === "present"
                    ? "bg-success text-white"
                    : att.status === "absent"
                    ? "bg-danger text-white"
                    : att.status === "late"
                    ? "bg-warning"
                    : att.status === "tardi"
                    ? "bg-dark text-white"
                    : "bg-info text-white"
                }`}
              >
                <small>{att.date}</small><br />
                <strong>{att.status}</strong>
              </div>
            ))
          )}
        </div>

      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>

    </div>
  </div>
</div>
{/* ======================= END MODAL ======================== */}



      {/* Apply Leave Modal */}
      <div className="modal fade" id="apply_leave">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h4 className="modal-title">Apply Leave</h4>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label>Leave Type</label>
                <CommonSelect
                  options={leaveTypeOptions}
                  defaultValue={leaveTypeOptions[0]}
                  onChange={(val) => setLeaveTypeValue(val.value)}
                />
              </div>

              <div className="mb-3">
                <label>From Date</label>
                <DatePicker className="form-control" onChange={setFromDate} />
              </div>

              <div className="mb-3">
                <label>To Date</label>
                <DatePicker className="form-control" onChange={setToDate} />
              </div>

              <div className="mb-3">
                <label>Reason</label>
                <input className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" data-bs-dismiss="modal" onClick={handleApplyLeave}>Apply</button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default StudentLeaves;
