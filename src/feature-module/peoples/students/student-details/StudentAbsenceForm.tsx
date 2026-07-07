import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../../core/api/axiosInstance";

// ── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  guardian_name: string;
  signature_date: string;
}

const LEAVE_OPTIONS = [
  { value: "vacation",          label: "Vacation" },
  { value: "doctor_visit",      label: "Doctor Visit" },
  { value: "illness",           label: "Illness" },
  { value: "religious",         label: "Religious" },
  { value: "mental_health_day", label: "Mental Health Day (Grades K-8)" },
  { value: "other",             label: "Other" },
];

const INITIAL_FORM: FormState = {
  leave_type:     "",
  start_date:     "",
  end_date:       "",
  reason:         "",
  guardian_name:  "",
  signature_date: "",
};

// ── Component ────────────────────────────────────────────────────────────────

const StudentAbsenceForm: React.FC = () => {
  const { id: studentId } = useParams<{ id: string }>();

  const [studentName, setStudentName] = useState<string>("");
  const [form, setForm]               = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting]   = useState(false);
  const [successMsg, setSuccessMsg]   = useState("");
  const [errorMsg, setErrorMsg]       = useState("");

  // ── Load student name ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!studentId) return;
    axiosInstance
      .get(`get-student/${studentId}/`)
      .then((res) => {
        const { first_name, last_name } = res.data;
        setStudentName(
          [last_name, first_name].filter(Boolean).join(", ") || "—"
        );
      })
      .catch(() => setStudentName("—"));
  }, [studentId]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccessMsg("");
    setErrorMsg("");
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    // Validation
    if (!form.leave_type) {
      setErrorMsg("Please select a reason for absence.");
      return;
    }
    if (!form.start_date) {
      setErrorMsg("Please select a start date.");
      return;
    }
    if (form.end_date && form.end_date < form.start_date) {
      setErrorMsg("End date must be on or after start date.");
      return;
    }
    if (!form.guardian_name.trim()) {
      setErrorMsg("Parent / Guardian name is required.");
      return;
    }
    if (!form.signature_date) {
      setErrorMsg("Signature date is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        end_date: form.end_date || null,
      };
      const res = await axiosInstance.post(
        `student/${studentId}/leave/apply-or-update/`,
        payload
      );
      setSuccessMsg(res.data?.message || "Leave applied successfully.");
      setForm(INITIAL_FORM);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="card" style={{ maxWidth: 640, margin: "0 auto" }}>
      {/* Header */}
      <div className="card-header" style={{ background: "#4a6fa5" }}>
        <h4 className="mb-0 text-white">Absence Form</h4>
      </div>

      <div className="card-body p-4">
        <p className="text-muted mb-4">
          Use this form to submit a reason for your child's absence.
        </p>

        {/* Alerts */}
        {successMsg && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="ti ti-circle-check me-2" />
            {successMsg}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccessMsg("")}
            />
          </div>
        )}
        {errorMsg && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="ti ti-alert-circle me-2" />
            {errorMsg}
            <button
              type="button"
              className="btn-close"
              onClick={() => setErrorMsg("")}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Student Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Student Name <span className="text-muted fw-normal">(Read-only)</span>
            </label>
            <input
              type="text"
              className="form-control bg-light"
              value={studentName}
              readOnly
            />
          </div>

          {/* Reason for Absence */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Reason For Absence <span className="text-danger">*</span>
            </label>
            <select
              name="leave_type"
              className="form-select"
              value={form.leave_type}
              onChange={handleChange}
              required
            >
              <option value="">— Select a reason —</option>
              {LEAVE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date row */}
          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label className="form-label fw-semibold">
                Start Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                className="form-control"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-sm-6">
              <label className="form-label fw-semibold">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                className="form-control"
                value={form.end_date}
                min={form.start_date || undefined}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Additional reason / notes */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Additional Notes</label>
            <textarea
              name="reason"
              className="form-control"
              rows={3}
              placeholder="Optional details..."
              value={form.reason}
              onChange={handleChange}
            />
          </div>

          {/* Guardian name */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Parent / Guardian Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="guardian_name"
              className="form-control"
              placeholder="Full name"
              value={form.guardian_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Signature date */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              Signature Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              name="signature_date"
              className="form-control"
              value={form.signature_date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentAbsenceForm;
