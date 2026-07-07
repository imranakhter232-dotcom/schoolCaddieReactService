import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import StudentModals from "../studentModals";
import StudentSidebar from "./studentSidebar";
import StudentBreadcrumb from "./studentBreadcrumb";
import axiosInstance from "../../../../core/api/axiosInstance";
import Swal from "sweetalert2";

// --- STUDENT INTERFACE ADDED ---
// (Assuming the Student interface is the same as the previous file)
export interface Student {
  id: number;
  photo?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  grade?: string | null;
  section?: string | null;
}
// --- END STUDENT INTERFACE ---


/**
 * Assigned task shape (from RecitationLog)
 */
type AssignedTask = {
  id?: number;
  surah_name?: string | null;
  start_verse?: number | null;
  end_verse?: number | null;
  juz_number?: number | null;
  total_verses?: number | null;
  expected_minutes?: number | null;
  lesson_notes?: string | null;
  difficulty?: string | null;
  assigned_on?: string | null;
  assigned_date?: string | null;
  updated_on?: string | null;
  status?: string | null;
  memorized_verses?: number | null;
  percent?: number | null;
  quality?: string | null;
  teacher_feedback?: string | null;
};

const qualityOptions = ["poor", "average", "good", "excellent"];

// type RecentEntry = {
//   date: string;
//   minutes: number;
//   surahs: string[];
//   juzs: string[];
//   notes: string;
//   quality: string;
// };

// type ProgressItem = {
//   title: string;
//   verses: string;
//   progressPercent: number;
//   confidence: string;
//   time: string;
//   status: "in progress" | "completed" | string;
//   difficulty: "easy" | "medium" | "hard" | string;
// };

// type RecitationData = {
//   todayMinutes: number;
//   weeklyTotal: number;
//   totalSurahsCompleted: number;
//   inProgressSurahs: number;
//   confidence: string;
//   timeSpent: string;
//   currentGoal: {
//     title: string;
//     remaining: string;
//     percent: number;
//   };
//   recentEntries: RecentEntry[];
//   progressOverview: ProgressItem[];
//   thisWeek: {
//     sessions: number;
//     timeSpent: string;
//     versesMemorized: number;
//     avgConfidence: string;
//   };
//   currentStreak?: number;
// };

const StudentLogMemorization: React.FC = () => {
   const routes = all_routes;
  const { id } = useParams<{ id: string }>();

  // student + loading
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // tasks
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);

  // update modal state
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updatingTask, setUpdatingTask] = useState<AssignedTask | null>(null);

  // update form fields (Option A)
  const [memorizedVerses, setMemorizedVerses] = useState<number | "">("");
  const [quality, setQuality] = useState<string>("good");
  const [teacherFeedback, setTeacherFeedback] = useState<string>("");

  // saving / error
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const roleId =
  sessionStorage.getItem("role_id") || localStorage.getItem("role_id");


  // fetch student
  const fetchStudent = async () => {
    if (!id) return;
    try {
      const res = await axiosInstance.get(`get-student/${id}/`);
      setStudent(res.data);
    } catch (err) {
      console.error("fetchStudent error", err);
    } finally {
      setLoading(false);
    }
  };

  // fetch tasks
  const fetchTasks = async () => {
    if (!id) return;
    setTasksLoading(true);
    try {
      const res = await axiosInstance.get<AssignedTask[]>(`/recitation/${id}/`);
      const data = Array.isArray(res.data) ? res.data : [];
      const normalized = data.map((t) => {
        // compute total_verses if missing
        const total =
          t.total_verses ??
          (t.start_verse != null && t.end_verse != null
            ? t.end_verse - t.start_verse + 1
            : null);
        return { ...t, total_verses: total };
      });
      setTasks(normalized);
    } catch (err) {
      console.error("fetchTasks error", err);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudent();
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // open update modal with selected task
  const openUpdateModal = (task: AssignedTask) => {
    setUpdatingTask(task);
    setMemorizedVerses(task.memorized_verses ?? "");
    setQuality(task.quality ?? "good");
    setTeacherFeedback(task.teacher_feedback ?? "");
    setError(null);
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdatingTask(null);
    setMemorizedVerses("");
    setQuality("good");
    setTeacherFeedback("");
    setError(null);
  };

  // format date helper
  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  };

  // submit update (PUT)
  const submitUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!updatingTask || !updatingTask.id) return;

    setError(null);

    // basic validation: memorizedVerses must be integer between 0 and total_verses (if total exists)
    const mem = memorizedVerses === "" ? null : Number(memorizedVerses);
    if (mem !== null && (!Number.isInteger(mem) || mem < 0)) {
      setError("Memorized verses must be a positive integer or blank.");
      return;
    }
    if (mem !== null && updatingTask.total_verses && mem > updatingTask.total_verses) {
      // allow but warn? We'll prevent > total
      setError("Memorized verses cannot be greater than total verses.");
      return;
    }

    const payload: any = {
      memorized_verses: mem,
      quality: quality || null,
      teacher_feedback: teacherFeedback || null,
    };

    try {
      setSaving(true);
      await axiosInstance.put(`/recitation/update/${updatingTask.id}/`, payload);

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Memorization update saved.",
        timer: 1400,
        showConfirmButton: false,
      });

      await fetchTasks();
      closeUpdateModal();
    } catch (err: any) {
      console.error("submitUpdate error", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to update.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: typeof msg === "string" ? msg : "Could not save update",
      });
    } finally {
      setSaving(false);
    }
  };

  // optional: quick mark complete (set memorized_verses = total and status completed)
  const markComplete = async (task: AssignedTask) => {
    if (!task.id) return;
    const total = task.total_verses ?? null;
    if (!total) {
      Swal.fire({
        icon: "info",
        title: "Cannot complete",
        text: "Total verses unknown for this task.",
      });
      return;
    }

    Swal.fire({
      title: "Mark as completed?",
      text: `Set memorized verses = ${total} and status = completed.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, complete",
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      try {
        setSaving(true);
        await axiosInstance.put(`/recitation/update/${task.id}/`, {
          memorized_verses: total,
          quality: "excellent",
          teacher_feedback: (task.teacher_feedback ?? "") + "\nMarked complete by teacher",
        });
        Swal.fire({ icon: "success", title: "Completed", text: "Task marked completed." });
        await fetchTasks();
      } catch (err) {
        console.error("markComplete error", err);
        Swal.fire({ icon: "error", title: "Failed", text: "Could not mark complete." });
      } finally {
        setSaving(false);
      }
    });
  };

  // // UI when loading or no student
  // if (loading) {
  //   return <div className="text-center py-5">Loading student details...</div>;
  // }
  // if (!student) {
  //   return <div className="text-center py-5 text-danger">No student found.</div>;
  // }

  


  

  const palette = {
    bg: "#f3fbf6",
    card: "#ffffff",
    softGreen: "#e6f4ea",
    primary: "#2f855a",
    mutedText: "#6b776f",
  };

 

 

  return (
    <>
      <div className="page-wrapper" style={{ background: palette.bg }}>
        <div className="content">
          <div className="row">
            <StudentBreadcrumb />
          </div>

          <div className="row">
            {/* StudentSidebar now has access to student data via context or props if you've set it up, 
                or you can pass `student` as a prop if needed. */}
            <StudentSidebar />

            <div className="col-xxl-9 col-xl-8">
              {/* --- LINKS UPDATED WITH ID --- */}
              <ul className="nav nav-tabs nav-tabs-bottom mb-4">
                <li>
                  <Link to={routes.studentDetail.replace(":id", id!)} className="nav-link ">
                    <i className="ti ti-school me-2" />
                    Student Details
                  </Link>
                </li>

                <li>
                  <Link to={routes.studentResult.replace(":id", id!)} className="nav-link">
                    <i className="ti ti-bookmark-edit me-2" />
                    Exam &amp; Results
                  </Link>
                </li>

                <li>
                  <Link to={routes.studentStartRecitation.replace(":id", id!)} className="nav-link">
                    <i className="ti ti-report-money me-2" />
                    Start Recitation
                  </Link>
                </li>

                <li>
                  <Link to={routes.studentLogMemorization.replace(":id", id!)} className="nav-link active">
                    <i className="ti ti-books me-2" />
                    Log Memorization
                  </Link>
                </li>

                <li>
                  <Link to={routes.studentViewProgress.replace(":id", id!)} className="nav-link">
                    <i className="ti ti-books me-2" />
                    View Progress
                  </Link>
                </li>

                {/* <li>
                  <Link to={routes.studentTimeTable.replace(":id", id!)} className="nav-link">
                    <i className="ti ti-table-options me-2" />
                    Time Table
                  </Link>
                </li> */}
                <li>
                  <Link to={routes.studentLeaves.replace(":id", id!)} className="nav-link">
                    <i className="ti ti-calendar-due me-2" />
                    Leave &amp; Attendance
                  </Link>
                </li>
              </ul>
              {/* --- END LINK UPDATES --- */}
              
              {/* /List */}
              <div className="card"></div>

              {/* Top summary cards */}

              

              {/* Log Memorization header + Add Entry */}
               <div className="card p-3 mb-3" style={{ background: "#eaf8ef" }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">Memorization Tasks & Updates</h5>
                    <small className="text-muted">Update student's memorization progress (memorized verses, quality, feedback)</small>
                  </div>
                </div>
              </div>


              {/* Main two-column layout: Progress Overview (left) + Right column (widgets) */}
              <div className="row">
                <div className="col-xl-8">
                  <div className="card p-3">
                <h5 className="mb-3">Assigned Tasks</h5>

                {tasksLoading ? (
  <div className="text-center py-3">Loading tasks...</div>
) : tasks.length === 0 ? (
  <div className="text-center text-muted py-4">No assigned tasks yet.</div>
) : (
  tasks.map((t) => (
    <div
      key={t.id ?? `${t.surah_name}-${t.start_verse}`}
      className="mb-3 p-3"
      style={{ border: "1px solid #eef6ef", borderRadius: 8 }}
    >
      <div className="d-flex justify-content-between">
        <div>
          <strong>{t.surah_name ?? "—"}</strong>
          <div className="text-muted small">
            Verses:{" "}
            {t.start_verse != null && t.end_verse != null
              ? `${t.start_verse} - ${t.end_verse}`
              : "—"}
          </div>
          <div className="text-muted small">Juz: {t.juz_number ?? "—"}</div>
          <div className="text-muted small">
            Task Date: {formatDate(t.assigned_date)}
          </div>
          <div className="text-muted small">
            Total: {t.total_verses ?? "—"}
          </div>
          <div className="text-muted small">
            Expected time: {t.expected_minutes ?? "—"} min
          </div>
          {t.lesson_notes && (
            <div className="mt-2 small text-muted">
              Notes: {t.lesson_notes}
            </div>
          )}
          <div className="mt-2 small text-muted">
            Assigned on: {formatDate(t.assigned_on)}
          </div>
        </div>

        <div className="text-end">
          <div className="mb-2">
            <span
              className={`badge ${
                t.status === "completed"
                  ? "bg-success"
                  : t.status === "in progress"
                  ? "bg-primary"
                  : "bg-secondary"
              }`}
            >
              {t.status ?? "pending"}
            </span>
          </div>

          {t.percent != null && (
            <div className="small text-muted mb-1">{t.percent}% memorized</div>
          )}
          <div className="small text-muted mb-2">
            Memorized verses: {t.memorized_verses ?? "—"}
          </div>
          {t.quality && (
            <div className="small mb-2">
              <span className="badge bg-light text-dark">{t.quality}</span>
            </div>
          )}
          {t.teacher_feedback && (
            <div className="small text-muted mb-2">
              Feedback: {t.teacher_feedback}
            </div>
          )}

        {roleId !== "3" && (
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => openUpdateModal(t)}
            >
              Update
            </button>
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => markComplete(t)}
            >
              Mark Complete
            </button>
          </div>
        )}
        </div>
      </div>

      {/* --- Progress Bar At Bottom --- */}
      <div className="mt-3">
        <div
          className="progress"
          style={{ height: 8, background: "#e8f5e9" }}
        >
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{
              width: `${t.percent ?? 0}%`,
              transition: "width 0.4s ease",
            }}
            aria-valuenow={t.percent ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
        <div className="small text-muted mt-1">
          Progress: {t.percent ?? 0}%
        </div>
      </div>
    </div>
  ))
)}

              </div>
          </div>
          

                {/* Right column widgets (matches image) */}
                <div className="col-xl-4">
                  <div className="card p-3 mb-3 text-center">
    <h6 className="mb-2">Current Goal</h6>
    <strong>Complete All 30 Juzz</strong>

    <div className="my-3">
      <div className="progress" style={{ height: 10, background: "#eef6ef" }}>
        <div
          className="progress-bar bg-primary"
          role="progressbar"
          style={{ width: `${(tasks.filter(t => t.status === "completed").length / 30) * 100}%` }}
        />
      </div>

      <small className="d-block mt-2 text-muted">
        Completed: {tasks.filter(t => t.status === "completed").length} / 30 Juzz
      </small>

      <small className="d-block text-muted">
        {Math.round((tasks.filter(t => t.status === "completed").length / 30) * 100)}% complete
      </small>
    </div>
  </div>

                  

                  <div
    className="card p-3 mb-3"
    style={{ background: "linear-gradient(135deg,#bfeccf,#86be98)", color: "white" }}
  >
    <h6>Great Progress!</h6>

    {(() => {
      const days = tasks
        .filter(t => t.assigned_date)
        .map(t => new Date(t.assigned_date || "").toDateString());

      
      const uniqueDays = Array.from(new Set(days)).sort((a, b) => new Date(a) > new Date(b) ? -1 : 1);

      let streak = 1;
      for (let i = 0; i < uniqueDays.length - 1; i++) {
        const d1 = new Date(uniqueDays[i]);
        const d2 = new Date(uniqueDays[i + 1]);
        const diff = (d1.getTime() - d2.getTime()) / (1000 * 3600 * 24);
        if (diff === 1) streak++;
        else break;
      }

      return (
        <small>You’ve maintained a {streak}-day memorization streak. Keep it up!</small>
      );
    })()}
  </div>

                  <div className="card p-3 mb-3">
                    <h6>Teacher Communication</h6>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Send your progress to your teacher</small>
                      <button className="btn btn-outline-primary btn-sm">Contact Teacher</button>
                    </div>
                  </div>

                  <div className="card p-3 mb-3">
                    <h6>Teacher Comments</h6>
                    <div className="text-center text-muted" style={{ padding: 18 }}>
                      <i className="bi bi-chat" style={{ fontSize: 24 }} />
                      <div className="mt-2 small">No teacher comments yet</div>
                      <div className="small text-muted">Comments will appear here when your teacher provides feedback</div>
                    </div>
                  </div>

                  <div className="card p-3">
                    <h6>Memorization Tips</h6>
                    <ul className="list-unstyled small mb-0">
                      <li className="p-2 mb-2" style={{ background: "#f3fbf6", borderRadius: 6 }}>
                        Best Time: Memorize after Fajr when your mind is fresh and focused.
                      </li>
                      <li className="p-2 mb-2" style={{ background: "#f3fbf6", borderRadius: 6 }}>
                        Repetition: Repeat each verse 7 times before moving to the next.
                      </li>
                      <li className="p-2" style={{ background: "#f3fbf6", borderRadius: 6 }}>
                        Revision: Review previous verses daily to strengthen retention.
                      </li>
                    </ul>
                  </div>
                </div>


                {/* Update Modal */}
      {showUpdateModal && updatingTask && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <form onSubmit={submitUpdate}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Memorization — {updatingTask.surah_name}</h5>
                  <button type="button" className="btn-close" onClick={closeUpdateModal} />
                </div>

                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="mb-3">
                    <label className="form-label">Memorized Verses</label>
                    <input
                      type="number"
                      min={0}
                      className="form-control"
                      value={memorizedVerses}
                      onChange={(e) => setMemorizedVerses(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder={updatingTask.total_verses ? `0 - ${updatingTask.total_verses}` : "Enter memorized verses"}
                    />
                    {updatingTask.total_verses && <small className="text-muted">Total verses: {updatingTask.total_verses}</small>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Quality</label>
                    <select className="form-select" value={quality} onChange={(e) => setQuality(e.target.value)}>
                      {qualityOptions.map((q) => (
                        <option key={q} value={q}>
                          {q.charAt(0).toUpperCase() + q.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Teacher Feedback</label>
                    <textarea className="form-control" rows={4} value={teacherFeedback} onChange={(e) => setTeacherFeedback(e.target.value)} />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn btn-light" type="button" onClick={closeUpdateModal}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Update"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
              </div>
              {/* End main area */}
            </div>
          </div>
        </div>
      </div>

      <StudentModals />
    </>
  );
};

export default StudentLogMemorization;