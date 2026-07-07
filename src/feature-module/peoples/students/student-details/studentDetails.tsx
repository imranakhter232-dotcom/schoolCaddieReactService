
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import StudentModals from "../studentModals";
import StudentSidebar from "./studentSidebar";
import StudentBreadcrumb from "./studentBreadcrumb";
import axiosInstance from "../../../../core/api/axiosInstance";
import { mediaUrl } from "../../../../core/api/mediaUrl";

export interface Student {
  // --- Primary Identifiers ---
  id: number;
  photo?: string | null;

  // --- Personal Information ---
  academic_year?: string | null;
  admission_number?: string | null;
  admission_date?: string | null; // ISO string (MM-DD-YYYY)
  student_id?: string | null;
  status?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  grade?: string | null;
  section?: string | null;
  gender?: string | null;
  house?: string | null;
  religion?: string | null;
  primary_contact?: string | null;
  email?: string | null;
  date_of_birth?: string | null;

  // --- School Relation ---
  school?: number | string | null; // FK to SchoolUser ID or name
  created_on?: string | null;

  // --- Parents & Guardian ---
  father_name?: string | null;
  father_email?: string | null;
  father_phone?: string | null;
  father_occupation?: string | null;

  mother_name?: string | null;
  mother_email?: string | null;
  mother_phone?: string | null;
  mother_occupation?: string | null;

  guardian_relation?: string | null;
  guardian_phone?: string | null;
  guardian_email?: string | null;
  guardian_occupation?: string | null;
  guardian_address?: string | null;

  // --- Siblings ---
  siblings?: Array<{
    name?: string;
    roll_no?: string;
    admission_no?: string;
    class?: string;
  }> | null;

  // --- Address (Current & Permanent) ---
  current_address1?: string | null;
  current_address2?: string | null;
  current_city?: string | null;
  current_state?: string | null;
  current_zipcode?: string | null;

  permanent_address1?: string | null;
  permanent_address2?: string | null;
  permanent_city?: string | null;
  permanent_state?: string | null;
  permanent_zipcode?: string | null;

  // --- Medical History ---
  allergies?: string[] | null;
  medical_document?: string | null;
  transfer_certificate?: string | null;
  medical_report_1?: string | null;
  medical_report_2?: string | null;
  medical_report_3?: string | null;

  // --- Previous School ---
  previous_school_name?: string | null;
  previous_school_phone?: string | null;
  previous_school_address?: string | null;

  // --- Bank Details ---
  bank_name?: string | null;
  account_number?: string | null;
  routing_number?: string | null;

  // --- Other Info ---
  other_info?: string | null;

  // --- UI / Extra Info ---
  languages?: string[] | null; // Example: ["English", "Arabic"]
}


const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // ✅ Extract ID (like 8) from URL
  const routes = all_routes;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Fetch student by ID
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

  if (loading) {
    return <div className="text-center py-5">Loading student details...</div>;
  }

  if (!student) {
    return <div className="text-center py-5 text-danger">No student found.</div>;
  }



  return (
    <>
  {/* Page Wrapper */}
  <div className="page-wrapper">
    <div className="content">
      <div className="row">
        {/* Page Header */}
        <StudentBreadcrumb />
        {/* /Page Header */}
      </div>
      <div className="row">
        {/* Student Information */}
        <StudentSidebar />
        {/* /Student Information */}
        <div className="col-xxl-9 col-xl-8">
          <div className="row">
            <div className="col-md-12">
              {/* List */}
              <ul className="nav nav-tabs nav-tabs-bottom mb-4">
                    <li>
                      <Link to={routes.studentDetail.replace(":id", id!)} className="nav-link active">
                        <i className="ti ti-school me-2" />
                        Student Details
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.studentResult.replace(":id", id!)} className="nav-link">
                        <i className="ti ti-bookmark-edit me-2" />
                        Exam & Results
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.studentStartRecitation.replace(":id", id!)} className="nav-link">
                        <i className="ti ti-report-money me-2" />
                        Start Recitation
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
                        Leave & Attendance
                      </Link>
                    </li>
                  </ul>

              
              {/* /List */}
              {/* Parents Information */}
              <div className="card">
                <div className="card-header">
                  <h5>Parents Information</h5>
                </div>
                <div className="card-body">
                      <div className="border rounded p-3 mb-3">
                        <div className="row">
                          <div className="col-md-4">
                            <p className="text-dark fw-medium mb-1">Father</p>
                            <p>{student.father_name || "N/A"}</p>
                          </div>
                          <div className="col-md-4">
                            <p className="text-dark fw-medium mb-1">Phone</p>
                            <p>{student.father_phone || "N/A"}</p>
                          </div>
                          <div className="col-md-4">
                            <p className="text-dark fw-medium mb-1">Email</p>
                            <p>{student.father_email || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded p-3 mb-3">
                        <div className="row">
                          <div className="col-sm-4">
                            <p className="text-dark fw-medium mb-1">Mother</p>
                            <p>{student.mother_name || "N/A"}</p>
                          </div>
                          <div className="col-sm-4">
                            <p className="text-dark fw-medium mb-1">Phone</p>
                            <p>{student.mother_phone || "N/A"}</p>
                          </div>
                          <div className="col-sm-4">
                            <p className="text-dark fw-medium mb-1">Email</p>
                            <p>{student.mother_email || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded p-3">
                        <div className="row">
                          <div className="col-sm-4">
                            <p className="text-dark fw-medium mb-1">Guardian</p>
                            <p>{student.guardian_relation || "N/A"}</p>
                          </div>
                          <div className="col-sm-4">
                            <p className="text-dark fw-medium mb-1">Phone</p>
                            <p>{student.guardian_phone || "N/A"}</p>
                          </div>
                          <div className="col-sm-4">
                            <p className="text-dark fw-medium mb-1">Email</p>
                            <p>{student.guardian_email || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  
              </div>
              {/* /Parents Information */}
            </div>
            {/* Documents */}
           <div className="col-xxl-6 d-flex">
  <div className="card flex-fill">
    <div className="card-header">
      <h5>Medical History</h5>
    </div>
    <div className="card-body">
      {/* Allergies */}
      {Array.isArray(student.allergies) && student.allergies.length > 0 ? (
        <div className="mb-3">
          <p className="text-dark fw-medium mb-1">Known Allergies</p>
          {student.allergies.map((item: string, i: number) => (
            <span key={i} className="badge bg-light text-dark me-2">
              {item}
            </span>
          ))}
        </div>
      ) : student.allergies && typeof student.allergies === 'string' ? (
        <div className="mb-3">
          <p className="text-dark fw-medium mb-1">Known Allergies</p>
          <span className="badge bg-light text-dark me-2">{student.allergies}</span>
        </div>
      ) : null}

      {/* Documents: medical_document + transfer_certificate + legacy reports */}
      {[
        { label: "Medical Document", url: student.medical_document },
        { label: "Transfer Certificate", url: student.transfer_certificate },
        { label: "Medical Report 1", url: student.medical_report_1 },
        { label: "Medical Report 2", url: student.medical_report_2 },
        { label: "Medical Report 3", url: student.medical_report_3 },
      ]
        .filter((d) => Boolean(d.url))
        .map((doc, idx) => (
          <div
            key={idx}
            className="bg-light-300 border rounded d-flex align-items-center justify-content-between mb-3 p-2"
          >
            <div className="d-flex align-items-center overflow-hidden">
              <span className="avatar avatar-md bg-white rounded flex-shrink-0 text-default">
                <i className="ti ti-file-description fs-15" />
              </span>
              <div className="ms-2">
                <p className="text-truncate fw-medium text-dark mb-0">
                  {doc.label}
                </p>
                <small className="text-muted text-truncate">
                  {doc.url?.split("/").pop()}
                </small>
              </div>
            </div>
            <a
              href={mediaUrl(doc.url)}
              className="btn btn-dark btn-icon btn-sm"
              target="_blank"
              rel="noopener noreferrer"
              download
              title="Download"
            >
              <i className="ti ti-download" />
            </a>
          </div>
        ))}

      {![student.medical_document, student.transfer_certificate, student.medical_report_1, student.medical_report_2, student.medical_report_3].some(Boolean) && (
        <p className="text-muted mb-0">No documents uploaded.</p>
      )}
    </div>
  </div>
</div>
            {/* /Documents */}
            {/* Address */}
            <div className="col-xxl-6 d-flex">
  <div className="card flex-fill">
    <div className="card-header">
      <h5>Address</h5>
    </div>
    <div className="card-body">
      <div className="d-flex align-items-center mb-3">
        <span className="avatar avatar-md bg-light-300 rounded me-2 flex-shrink-0 text-default">
          <i className="ti ti-map-pin-up" />
        </span>
        <div>
          <p className="text-dark fw-medium mb-1">Current Address</p>
          <p>
            {student.current_address1 || ""}{" "}
            {student.current_city || ""}{" "}
            {student.current_state || ""}{" "}
            {student.current_zipcode || "N/A"}
          </p>
        </div>
      </div>
      <div className="d-flex align-items-center">
        <span className="avatar avatar-md bg-light-300 rounded me-2 flex-shrink-0 text-default">
          <i className="ti ti-map-pins" />
        </span>
        <div>
          <p className="text-dark fw-medium mb-1">Permanent Address</p>
          <p>
            {student.permanent_address1 || ""}{" "}
            {student.permanent_city || ""}{" "}
            {student.permanent_state || ""}{" "}
            {student.permanent_zipcode || "N/A"}
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
            {/* /Address */}
            {/* Previous School Details */}
            <div className="col-xxl-12">
  <div className="card">
    <div className="card-header">
      <h5>Previous School Details</h5>
    </div>
    <div className="card-body pb-1">
      <div className="row">
        <div className="col-md-4">
          <div className="mb-3">
            <p className="text-dark fw-medium mb-1">Previous School Name</p>
            <p>{student.previous_school_name || "N/A"}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <p className="text-dark fw-medium mb-1">School Address</p>
            <p>{student.previous_school_address || "N/A"}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <p className="text-dark fw-medium mb-1">School Number</p>
            <p>{student.previous_school_phone || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

            {/* /Previous School Details */}
            {/* Bank Details */}
            <div className="col-xxl-12 d-flex">
  <div className="card flex-fill">
    <div className="card-header">
      <h5>Bank Details</h5>
    </div>
    <div className="card-body pb-1">
      <div className="row">
        <div className="col-md-4">
          <div className="mb-3">
            <p className="text-dark fw-medium mb-1">Bank Name</p>
            <p>{student.bank_name || "N/A"}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <p className="text-dark fw-medium mb-1">Account Number</p>
            <p>{student.account_number || "N/A"}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <p className="text-dark fw-medium mb-1">Routing Number</p>
            <p>{student.routing_number || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
            {/* /Bank Details */}
            {/* Medical History */}
            
            {/* /Medical History */}
            {/* Other Info */}
            <div className="col-xxl-12">
  <div className="card">
    <div className="card-header">
      <h5>Other Info</h5>
    </div>
    <div className="card-body">
      {student.other_info && student.other_info.trim() !== "" ? (
        <p>{student.other_info}</p>
      ) : (
        <p className="text-muted mb-0">
          Depending on the specific needs of your organization or system,
          additional information may be collected or tracked. It's important to
          ensure that any data collected complies with privacy regulations and
          policies to protect students' sensitive information.
        </p>
      )}
    </div>
  </div>
</div>

            {/* /Other Info */}
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* /Page Wrapper */}
  <StudentModals />
</>

  )
}

export default StudentDetails