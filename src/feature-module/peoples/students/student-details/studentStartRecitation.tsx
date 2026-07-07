import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import StudentModals from "../studentModals";
import StudentSidebar from "./studentSidebar";
import StudentBreadcrumb from "./studentBreadcrumb";
import axiosInstance from "../../../../core/api/axiosInstance";
import Swal from "sweetalert2";

/**
 * Student interface (condensed)
 */
export interface Student {
  id: number;
  photo?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  grade?: string | null;
  section?: string | null;
  // other fields omitted for brevity
}

/**
 * Assigned task shape (matches RecitationLog unified model)
 */
type AssignedTask = {
  id?: number;
  surah_name?: string | null;
  start_verse?: number | null;
  juz_number?: number | null;
  end_verse?: number | null;
  total_verses?: number | null;
  expected_minutes?: number | null;
  lesson_notes?: string | null;
  difficulty?: string | null;
  assigned_on?: string | null;
  updated_on?: string | null;
  status?: string | null;
  memorized_verses?: number | null;
  percent?: number | null;
  quality?: string | null;
  teacher_feedback?: string | null;
  assigned_date?: string | null;
};

const SURAH_OPTIONS = [
  "Al-Fatiha",
  "Al-Baqarah",
  "Al-Imran",
  "An-Nisa",
  "Al-Ma'idah",
  "Al-An'am",
  "Al-A'raf",
  "Al-Anfal",
  "At-Tawbah",
  "Yunus",
  "Hud",
  // ... you can expand or fetch from API
];

const StudentStartRecitation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const routes = all_routes;

  // Student + loading
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // Assigned tasks list
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [taskDate, setTaskDate] = useState<string>("");
  // Modal / form state for assignment
  const [showModal, setShowModal] = useState<boolean>(false);
  const [surahName, setSurahName] = useState<string>(SURAH_OPTIONS[0]);
  const [startVerse, setStartVerse] = useState<number | "">("");
  const [endVerse, setEndVerse] = useState<number | "">("");
  const [expectedMinutes, setExpectedMinutes] = useState<number | "">(20);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [lessonNotes, setLessonNotes] = useState<string>("");
  const [juzNumber, setJuzNumber] = useState<number | "">("");
  const [saving, setSaving] = useState<boolean>(false);

  // error
  const [error, setError] = useState<string | null>(null);
  const roleId = sessionStorage.getItem("role_id") || localStorage.getItem("role_id");


  // Fetch student
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

  // Fetch existing assigned tasks for this student
  const fetchTasks = async () => {
    if (!id) return;
    setTasksLoading(true);
    try {
      const res = await axiosInstance.get<AssignedTask[]>(`/recitation/${id}/`);
      const data = Array.isArray(res.data) ? res.data : [];
      // normalize total_verses if present or compute if start/end present
      const normalized = data.map((t) => {
        const tv = t.total_verses ?? (t.start_verse && t.end_verse ? (t.end_verse - t.start_verse + 1) : null);
        return { ...t, total_verses: tv };
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

  // Derived: total verses for current form
  const computedTotalVerses = (): number | null => {
    if (startVerse === "" || endVerse === "") return null;
    const s = Number(startVerse);
    const e = Number(endVerse);
    if (!Number.isFinite(s) || !Number.isFinite(e) || e < s) return null;
    return e - s + 1;
  };

  // Open modal and reset form
  const openAssignModal = () => {
    setSurahName(SURAH_OPTIONS[0]);
    setStartVerse("");
    setEndVerse("");
    setExpectedMinutes(20);
    setDifficulty("medium");
    setLessonNotes("");
    setError(null);
    setShowModal(true);
  };


  const openEditModal = (task: AssignedTask) => {
  setSurahName(task.surah_name || SURAH_OPTIONS[0]);
  setStartVerse(task.start_verse || "");
  setEndVerse(task.end_verse || "");
  setExpectedMinutes(task.expected_minutes || "");
  setDifficulty(task.difficulty || "medium");
  setLessonNotes(task.lesson_notes || "");
  setJuzNumber(task.juz_number || "");
  setTaskDate(task.assigned_date || "");

  setEditingTaskId(task.id!);
  setEditMode(true);
  setShowModal(true);
};

const deleteTask = (taskId: number | undefined) => {
  if (!taskId) return;

  Swal.fire({
    title: "Are you sure?",
    text: "This task will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await axiosInstance.delete(`/recitation/delete/${taskId}/`);
      await fetchTasks();

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Task has been removed.",
      });
    }
  });
};



  const closeAssignModal = () => {
    setShowModal(false);
    setEditMode(false);
    setEditingTaskId(null);
  };

  // Submit assign task
  const submitAssignment = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setError(null);

  // validation
  if (!surahName) {
    setError("Please select a surah.");
    return;
  }
  if (startVerse === "" || endVerse === "") {
    setError("Please enter start and end verses.");
    return;
  }
  const s = Number(startVerse);
  const eV = Number(endVerse);
  if (!Number.isInteger(s) || !Number.isInteger(eV) || s <= 0 || eV <= 0) {
    setError("Verses must be positive integers.");
    return;
  }
  if (eV < s) {
    setError("End verse must be greater than or equal to start verse.");
    return;
  }

  const payload = {
    surah_name: surahName,
    start_verse: s,
    end_verse: eV,
    expected_minutes: expectedMinutes === "" ? null : Number(expectedMinutes),
    lesson_notes: lessonNotes || null,
    difficulty: difficulty || null,
    juz_number: juzNumber || null,
    assigned_date: taskDate,
  };

  try {
    setSaving(true);

    // -------------------------
    // UPDATE (EDIT MODE)
    // -------------------------
    if (editMode && editingTaskId) {
      await axiosInstance.put(`/recitation/update/${editingTaskId}/`, payload);

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Task updated successfully.",
        timer: 1400,
        showConfirmButton: false,
      });

    } 
    // -------------------------
    // CREATE (ADD MODE)
    // -------------------------
    else {
      await axiosInstance.post(`/recitation/${id}/add/`, payload);

      Swal.fire({
        icon: "success",
        title: "Task Assigned",
        text: "Memorization task assigned successfully.",
        timer: 1400,
        showConfirmButton: false,
      });
    }

    // Refresh tasks after save
    await fetchTasks();
    closeAssignModal();

  } catch (err: any) {
    console.error("submitAssignment error", err);
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      "Failed to assign task.";
    setError(typeof message === "string" ? message : JSON.stringify(message));
    Swal.fire({
      icon: "error",
      title: "Failed",
      text: typeof message === "string" ? message : "Could not assign task",
    });
  } finally {
    setSaving(false);
  }
};


  // Simple UI helpers
  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  };

  // if (loading) {
  //   return <div className="text-center py-5">Loading student details...</div>;
  // }

  // if (!student) {
  //   return <div className="text-center py-5 text-danger">No student found.</div>;
  // }

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="row">
            <StudentBreadcrumb />
          </div>

          <div className="row">
            <StudentSidebar />

            <div className="col-xxl-9 col-xl-8">
              <div className="row">
                <div className="col-md-12">
                  <ul className="nav nav-tabs nav-tabs-bottom mb-4">
                    <li>
                      <Link to={routes.studentDetail.replace(":id", id!)} className="nav-link">
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
                      <Link to={routes.studentStartRecitation.replace(":id", id!)} className="nav-link active">
                        <i className="ti ti-report-money me-2" />
                        Assign Memorization Task
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.studentLogMemorization.replace(":id", id!)} className="nav-link">
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

                  {/* Header card */}
                  {roleId !== "3" && (
                  <div className="card mb-3 p-3" style={{ background: "#eef7ee" }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-0">Assign Memorization Task</h5>
                        <small className="text-muted">Create a new task for this student (Surah + verses + expected time)</small>
                      </div>
                      <div>
                        <button className="btn btn-primary btn-sm" onClick={openAssignModal}>
                          + New Task
                        </button>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Assigned tasks list */}
                  <div className="card p-3">
                    <h5 className="mb-3">Assigned Tasks</h5>

                    {tasksLoading ? (
                      <div className="text-center py-3">Loading tasks...</div>
                    ) : tasks.length === 0 ? (
                      <div className="text-center text-muted py-4">No tasks assigned yet. Click <strong>New Task</strong> to create one.</div>
                    ) : (
                      tasks.map((t) => (
                        <div key={t.id ?? `${t.surah_name}-${t.start_verse}`} className="mb-3 p-3" style={{ border: "1px solid #eef6ef", borderRadius: 8 }}>
                          <div className="d-flex justify-content-between">
                            <div>
                              <strong>{t.surah_name ?? "—"}</strong>
                              <div className="text-muted small">Verses: {t.start_verse != null && t.end_verse != null ? `${t.start_verse} - ${t.end_verse}` : "—"}</div>
                              <div className="text-muted small">Juzz: {t.juz_number ?? "—"}</div>
                              <div className="text-muted small">
                                Task Date: {formatDate(t.assigned_date)}
                              </div>
                              <div className="text-muted small">Total: {t.total_verses ?? "—"}</div>
                              <div className="text-muted small">Expected time: {t.expected_minutes ?? "—"} min</div>
                              {t.lesson_notes ? <div className="mt-2 small text-muted">Notes: {t.lesson_notes}</div> : null}
                              <div className="mt-2 small text-muted">Assigned on: {formatDate(t.assigned_on)}</div>
                            </div>

                            <div className="text-end">

                              

                              <div className="mb-2">
                                <span className={`badge ${t.status === "completed" ? "bg-success" : t.status === "in progress" ? "bg-primary" : "bg-secondary"}`} >
                                  {t.status ?? "pending"}
                                </span>
                              </div>
                              {roleId !== "3" && (
                              <div className="mt-3">
                              <button
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => openEditModal(t)}
                              >
                                Edit
                              </button>

                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => deleteTask(t.id)}
                              >
                                Delete
                              </button>
                            </div>
                              )}
                            
                              {t.percent != null && <div className="small text-muted">{t.percent}% memorized</div>}
                              {t.quality && <div className="small mt-2"><span className="badge bg-light text-dark">{t.quality}</span></div>}
                              {t.teacher_feedback && <div className="mt-2 small text-muted">Feedback: {t.teacher_feedback}</div>}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal (Bootstrap style) */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <form onSubmit={submitAssignment}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">New Memorization Task</h5>
                  <button type="button" className="btn-close" onClick={closeAssignModal} />
                </div>

                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}

                  <div className="row">
                    <div className="col-lg-4 mb-3">
                      <label className="form-label">Surah</label>
                      <select className="form-select" value={surahName} onChange={(e) => setSurahName(e.target.value)} required>
                        {SURAH_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-lg-4 mb-3">
                      <label className="form-label">Juzz</label>
                      <select
                        className="form-select"
                        value={juzNumber}
                        onChange={(e) => setJuzNumber(Number(e.target.value))}
                        required
                      >
                        <option value="">Select Juz</option>
                        {Array.from({ length: 30 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Juz {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-lg-4 mb-3">
                      <label className="form-label">Task Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={taskDate}
                        onChange={(e) => setTaskDate(e.target.value)}
                        required
                      />
                    </div>



                    <div className="col-lg-4 mb-3">
                      <label className="form-label">Start Verse</label>
                      <input type="number" min={1} className="form-control" value={startVerse} onChange={(e) => setStartVerse(e.target.value === "" ? "" : Number(e.target.value))} required />
                    </div>

                    <div className="col-lg-4 mb-3">
                      <label className="form-label">End Verse</label>
                      <input type="number" min={1} className="form-control" value={endVerse} onChange={(e) => setEndVerse(e.target.value === "" ? "" : Number(e.target.value))} required />
                    </div>

                    <div className="col-lg-4 mb-3">
                      <label className="form-label">Total Verses</label>
                      <input type="text" className="form-control" value={computedTotalVerses() ?? "—"} readOnly />
                    </div>

                    <div className="col-lg-6 mb-3">
                      <label className="form-label">Expected Minutes</label>
                      <input type="number" min={1} className="form-control" value={expectedMinutes} onChange={(e) => setExpectedMinutes(e.target.value === "" ? "" : Number(e.target.value))} />
                    </div>

                    <div className="col-lg-6 mb-3">
                      <label className="form-label">Difficulty</label>
                      <select className="form-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="col-lg-12 mb-3">
                      <label className="form-label">Notes (teacher)</label>
                      <textarea rows={4} className="form-control" value={lessonNotes} onChange={(e) => setLessonNotes(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={closeAssignModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Assign Task"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <StudentModals />
    </>
  );
};

export default StudentStartRecitation;
