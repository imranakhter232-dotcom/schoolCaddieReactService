import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../../../core/api/axiosInstance";
import { mediaUrl } from "../../../../core/api/mediaUrl";

// ✅ Define the Student interface (matches your Django model)
interface Sibling {
  name: string;
  roll_no: string;
  admission_no: string;
  class: string;
}

interface Student {
  id: number;
  photo?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  admission_number?: string;
  student_id?: string;
  gender?: string;
  date_of_birth?: string;
  religion?: string;
  grade?: string;
  section?: string;
  house?: string;
  languages?: string[];
  status?: string;
  primary_contact?: string;
  email?: string;
  siblings?: Sibling[];
}

const StudentSidebar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Fetch student details from API
  const fetchStudent = async () => {
    try {
      const response = await axiosInstance.get(`get-student/${id}/`);
      setStudent(response.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchStudent();
  }, [id]);

  // if (loading) {
  //   return <div className="text-center py-4">Loading student details...</div>;
  // }

  // if (!student) {
  //   return <div className="text-center py-4 text-danger">No student data found.</div>;
  // }

  return (
    <div className="col-xxl-3 col-xl-4 theiaStickySidebar">
      <div className="stickybar pb-4">
  {loading ? (
    /* ================= LOADER (ONLY DATA AREA) ================= */
    <div className="card border-white">
      <div className="card-body text-center py-5">
        <div className="spinner-border text-primary mb-3" />
        <div className="text-muted">Loading student details...</div>
      </div>
    </div>
  ) : !student ? (
    /* ================= NO DATA ================= */
    <div className="card border-white">
      <div className="card-body text-center text-danger py-4">
        No student data found.
      </div>
    </div>
  ) : (
    /* ================= ACTUAL CONTENT ================= */
    <>
      {/* ---------- PROFILE CARD ---------- */}
      <div className="card border-white">
        <div className="card-header">
          <div className="d-flex align-items-center flex-wrap row-gap-3">
            <div className="avatar avatar-xxl border border-dashed me-2">
              {student.photo ? (
                <img
                  src={mediaUrl(student.photo)}
                  className="img-fluid rounded"
                  alt={`${student.first_name} ${student.last_name}`}
                  style={{ width: 70, height: 70, objectFit: "cover" }}
                />
              ) : (
                <div
                  className="avatar-initials bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 70, height: 70 }}
                >
                  {student.first_name?.[0]}
                  {student.last_name?.[0]}
                </div>
              )}
            </div>

            <div className="overflow-hidden">
              <span
                className={`badge ${
                  student.status === "Active"
                    ? "badge-soft-success"
                    : "badge-soft-danger"
                } d-inline-flex align-items-center mb-1`}
              >
                <i className="ti ti-circle-filled fs-5 me-1" />
                {student.status || "Inactive"}
              </span>

              <h5 className="mb-1 text-truncate">
                {student.first_name} {student.middle_name} {student.last_name}
              </h5>

              <p className="text-primary">{student.admission_number}</p>
            </div>
          </div>
        </div>

        {/* ---------- BASIC INFO ---------- */}
        <div className="card-body">
          <h5 className="mb-3">Basic Information</h5>
          <dl className="row mb-0">
            <dt className="col-6">Student ID</dt>
            <dd className="col-6">{student.student_id || "N/A"}</dd>

            <dt className="col-6">Gender</dt>
            <dd className="col-6">{student.gender || "N/A"}</dd>

            <dt className="col-6">Date of Birth</dt>
            <dd className="col-6">{student.date_of_birth || "N/A"}</dd>

            <dt className="col-6">Class</dt>
            <dd className="col-6">{student.grade || "N/A"}</dd>

            <dt className="col-6">Section</dt>
            <dd className="col-6">{student.section || "N/A"}</dd>
          </dl>
        </div>
      </div>

      {/* ---------- CONTACT ---------- */}
      <div className="card border-white">
        <div className="card-body">
          <h5 className="mb-3">Primary Contact Info</h5>
          <p>{student.primary_contact || "N/A"}</p>
          <p>{student.email || "N/A"}</p>
        </div>
      </div>

      {/* ---------- SIBLINGS ---------- */}
      <div className="card border-white">
        <div className="card-body">
          <h5 className="mb-3">Sibling Information</h5>
          {/* Use Array.isArray to ensure .map() won't crash the app */}
          {Array.isArray(student.siblings) && student.siblings.length > 0 ? (
            student.siblings.map((s, i) => (
              <div key={i} className="mb-2">
                {s.name} — {s.class}
              </div>
            ))
          ) : (
            <p className="text-muted">No siblings found.</p>
          )}
        </div>
      </div>
    </>
  )}
</div>

    </div>
  );
};

export default StudentSidebar;
