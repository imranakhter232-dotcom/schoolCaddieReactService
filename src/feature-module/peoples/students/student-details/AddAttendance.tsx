// @ts-nocheck
import React, { useState, useEffect } from "react";
import axiosInstance from "../../../../core/api/axiosInstance";
import Swal from "sweetalert2";
import { DatePicker } from "antd";
import CommonSelect from "../../../../core/common/commonSelect";
import dayjs from "dayjs";

const statusOptions = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "late", label: "Late" },
  { value: "tardi", label: "Tardi" },
  { value: "holiday", label: "Holiday" },
];

const ClassAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [date, setDate] = useState(dayjs());
  const [attendanceList, setAttendanceList] = useState([]);

  // ---------------- Fetch Students on First Load ----------------
  useEffect(() => {
    fetchStudents();
  }, []);

  // ---------------- Fetch Attendance when Date Changes ----------------
  useEffect(() => {
    fetchAttendanceList();
  }, [date]);

  // ---------------- Fetch Students ----------------
  const fetchStudents = async () => {
  try {
    const res = await axiosInstance.get("/get-students/");
    setStudents(res.data);
    
    const initialStatus = {};
    res.data.forEach(s => {
      initialStatus[s.id] = "present";
    });
    setAttendanceStatus(initialStatus);
    
  } catch (e) {
    console.error("Students fetch fail");
  }
};

  // ---------------- Fetch Saved Attendance for Selected Date ----------------
  const fetchAttendanceList = async () => {
    const selectedDate = dayjs(date).format("YYYY-MM-DD");

    try {
      const res = await axiosInstance.get(`/attendance/list/?date=${selectedDate}`);
      setAttendanceList(res.data);

      const statusMap = {};

      // If attendance exists for this date → use that status
      if (res.data.length > 0) {
        res.data.forEach((rec) => {
          statusMap[rec.student_id] = rec.status;
        });
      }

      // Students list → if no saved status → default present
      students.forEach((s) => {
        if (!statusMap[s.id]) {
          statusMap[s.id] = "present";
        }
      });

      setAttendanceStatus(statusMap);

    } catch (e) {
      console.error("Attendance load fail");
    }
  };

  // ---------------- Status Change ----------------
  const handleStatusChange = (studentId, newStatus) => {
    setAttendanceStatus((p) => ({
      ...p,
      [studentId]: newStatus,
    }));
  };

  // ---------------- Submit Attendance ----------------
  const handleSubmit = async () => {
    const missing = students.filter(
      s =>
        attendanceStatus[s.id] === undefined ||
        attendanceStatus[s.id] === null ||
        attendanceStatus[s.id] === ""
    );
    if (missing.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete",
        text: "Please select status for all students before saving.",
      });
      return;
    }

    const payload = {
      date: dayjs(date).format("YYYY-MM-DD"),
      statuses: students.map(s => ({
        student: s.id,
        status: attendanceStatus[s.id],
      })),
    };

    console.log("Attendance Status Map:", attendanceStatus);
    console.log("FINAL PAYLOAD:", payload);

    try {
      await axiosInstance.post("/attendance/bulk-manage/", payload);

      Swal.fire({
        icon: "success",
        title: "Attendance Saved!",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchAttendanceList();

    } catch (e) {
      Swal.fire("Error", "Failed to save attendance.", "error");
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="page-wrapper">
      <div className="content">

        <h3>Class Attendance</h3>

        {/* Date Picker */}
        <div className="mb-3">
          <label>Select Date</label>
          <DatePicker
            className="form-control"
            value={date}
            onChange={(d) => setDate(d)}
            format={"YYYY-MM-DD"}
          />
        </div>

        {/* Students Table */}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Grade</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.first_name} {s.last_name}</td>
                <td>{s.grade}</td>

                <td>
                  <CommonSelect
                    options={statusOptions}
                    value={statusOptions.find(
                      (opt) => opt.value === attendanceStatus[s.id]
                    ) ?? null}
                    onChange={(opt) => {
                      const value = opt?.value || opt;
                      console.log("Status changed:", s.id, value);
                      setAttendanceStatus((prev) => ({ ...prev, [s.id]: value }));
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="btn btn-primary" onClick={handleSubmit}>
          Save Attendance
        </button>


        {/* ================= Attendance History ================= */}
        <div className="card mt-4">
          <div className="card-header">
            <h4>Attendance - {dayjs(date).format("YYYY-MM-DD")}</h4>
          </div>

          <table className="table table-striped">
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center">No data</td>
                </tr>
              ) : (
                attendanceList.map((a) => (
                  <tr key={a.id}>
                    <td>{a.student_name}</td>
                    <td>{a.grade}</td>
                    <td>{a.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ClassAttendance;
