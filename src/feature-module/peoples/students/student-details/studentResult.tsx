import { useEffect, useState } from "react"; // Added FormEvent
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
// import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import { all_routes } from "../../../router/all_routes";
import StudentModals from "../studentModals";
import StudentSidebar from "./studentSidebar";
import StudentBreadcrumb from "./studentBreadcrumb";
import axiosInstance from "../../../../core/api/axiosInstance";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

// --- NEW ---
// Interface for a single subject row in the new result form
interface SubjectResultRow {
  id: number; // For React key
  subjectName: string;
  maxMarks: string;
  minMarks: string;
  obtainedMarks: string;
}
// --- END NEW ---


// --- RESULTS FROM BACKEND ---
interface ResultItem {
  id: number;
  exam_name: string;
  subjects: Array<{
    subjectName: string;
    maxMarks: number;
    minMarks: number;
    obtainedMarks: number;
  }>;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  result: string;
  created_on: string;
}


const exportSingleExamPDF = (student: Student | null, exam: ResultItem) => {
  const doc = new jsPDF();
  
  // Header section
  doc.setFontSize(18);
  doc.text("ACADEMIC REPORT CARD", 105, 15, { align: "center" });
  
  doc.setFontSize(11);
  doc.text(`Student: ${student?.first_name} ${student?.last_name}`, 14, 25);
  doc.text(`Exam: ${exam.exam_name}`, 14, 32);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 25);

  autoTable(doc, {
    startY: 40,
    head: [['Subject', 'Max', 'Min', 'Obtained', 'Status']],
    body: exam.subjects.map(s => [
      s.subjectName,
      s.maxMarks,
      s.minMarks,
      s.obtainedMarks,
      s.obtainedMarks >= s.minMarks ? "PASS" : "FAIL"
    ]),
    foot: [[
      `Total: ${exam.total_marks}`,
      '',
      `Obtained: ${exam.marks_obtained}`,
      `Percentage: ${exam.percentage.toFixed(2)}%`,
      `Result: ${exam.result.toUpperCase()}`
    ]],
    theme: 'grid',
    headStyles: { fillColor: [43, 54, 67] }
  });

  doc.save(`${student?.first_name}_${exam.exam_name.replace(/\s+/g, '_')}.pdf`);
};

const exportToPDF = (student: Student | null, results: ResultItem[]) => {
  const doc = new jsPDF();

  // --- Header Styling ---
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text("STUDENT ACADEMIC REPORT", 105, 15, { align: "center" });
  
  // --- Student Info Section ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Student Name: ${student?.first_name} ${student?.last_name}`, 14, 30);
  doc.setFont("helvetica", "normal");
  doc.text(`Admission No: ${student?.admission_number || "N/A"}`, 14, 37);
  doc.text(`Grade/Section: ${student?.grade || ""} - ${student?.section || ""}`, 14, 44);
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 160, 30);

  doc.line(14, 50, 196, 50); // Horizontal line

  let finalY = 55;

  // --- Loop through each exam result ---
  results.forEach((exam, index) => {
    // Exam Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Exam: ${exam.exam_name}`, 14, finalY + 10);

    // Table for subjects
    autoTable(doc, {
      startY: finalY + 15,
      head: [['Subject', 'Max Marks', 'Min Marks', 'Obtained', 'Status']],
      body: exam.subjects.map(s => [
        s.subjectName,
        s.maxMarks,
        s.minMarks,
        s.obtainedMarks,
        s.obtainedMarks >= s.minMarks ? "PASS" : "FAIL"
      ]),
      theme: 'striped',
      headStyles: { fillColor: [63, 81, 181] }, // Brand blue color
      foot: [[
        `Total: ${exam.total_marks}`,
        '',
        `Obtained: ${exam.marks_obtained}`,
        `Percentage: ${exam.percentage.toFixed(2)}%`,
        `Result: ${exam.result.toUpperCase()}`
      ]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    });

    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 10;

    // Check if we need a new page for the next exam
    if (finalY > 240 && index !== results.length - 1) {
      doc.addPage();
      finalY = 15;
    }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Online Generated Report - Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
  }

  doc.save(`${student?.first_name}_Report_Card.pdf`);
};



const StudentResult = () => {
  const { id } = useParams<{ id: string }>(); // ✅ Extract ID (like 8) from URL
  const routes = all_routes;
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [resultsLoading, setResultsLoading] = useState<boolean>(true);

  const roleId = sessionStorage.getItem("role_id") || localStorage.getItem("role_id");


  // --- NEW: State for the "Add Result" modal form ---
  const [examName, setExamName] = useState<string>("");
  const [subjectRows, setSubjectRows] = useState<SubjectResultRow[]>([
    {
      id: 1,
      subjectName: "",
      maxMarks: "100",
      minMarks: "35",
      obtainedMarks: "",
    },
  ]);
  const [nextSubjectId, setNextSubjectId] = useState<number>(2);
  // --- END NEW ---

  const fetchResults = async () => {
  setResultsLoading(true);
  try {
    const res = await axiosInstance.get(`/student-result/${id}/`);
    setResults(res.data);
  } catch (error) {
    console.error("Error loading results:", error);
  } finally {
    setResultsLoading(false);
  }
};


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
    if (id) {
      fetchStudent();
      fetchResults();
    }
  }, [id]);


  // --- NEW: Handlers for the "Add Result" modal ---

  /**
   * Adds a new empty subject row to the form
   */
  const handleAddSubjectRow = () => {
    setSubjectRows([
      ...subjectRows,
      {
        id: nextSubjectId,
        subjectName: "",
        maxMarks: "100",
        minMarks: "35",
        obtainedMarks: "",
      },
    ]);
    setNextSubjectId(nextSubjectId + 1);
  };

  /**
   * Removes a subject row by its unique id
   */
  const handleRemoveSubjectRow = (rowId: number) => {
    if (subjectRows.length <= 1) return; // Don't remove the last row
    setSubjectRows(subjectRows.filter((row) => row.id !== rowId));
  };

  /**
   * Updates a specific field in a specific subject row
   */
  const handleSubjectChange = (
    rowId: number,
    field: keyof SubjectResultRow,
    value: string
  ) => {
    setSubjectRows(
      subjectRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row
      )
    );
  };

  /**
   * Handles the submission of the new result form
   */
 const handleResultFormSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (!id) {
    Swal.fire({
      icon: "error",
      title: "Missing Student ID",
      text: "Student ID was not found in URL.",
    });
    return;
  }

  // Validation – exam name
  if (!examName) {
    return Swal.fire({
      icon: "warning",
      title: "Exam Name Required",
      text: "Please select an exam name.",
    });
  }

  // Validation – subjects
  if (subjectRows.some((row) => !row.subjectName || !row.obtainedMarks)) {
    return Swal.fire({
      icon: "warning",
      title: "Incomplete Subject Data",
      text: "Please fill all subject fields.",
    });
  }

  const payload = {
    exam_name: examName,
    subjects: subjectRows.map((row) => ({
      subjectName: row.subjectName,
      maxMarks: parseInt(row.maxMarks),
      minMarks: parseInt(row.minMarks),
      obtainedMarks: parseInt(row.obtainedMarks),
    })),
  };

  try {
    await axiosInstance.post(`/student-result/${id}/`, payload);

    Swal.fire({
      icon: "success",
      title: "Result Added Successfully",
      text: "The exam result has been saved.",
      timer: 1500,
      showConfirmButton: false,
    });

    // Refresh results
    fetchResults();

    // Reset form
    setExamName("");
    setSubjectRows([
      {
        id: 1,
        subjectName: "",
        maxMarks: "100",
        minMarks: "35",
        obtainedMarks: "",
      },
    ]);
    setNextSubjectId(2);

    // Close modal manually
    const modalEl = document.getElementById("addResultModal");
    // @ts-ignore
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

  } catch (error: any) {
    console.error("Error saving result:", error);

    Swal.fire({
      icon: "error",
      title: "Error Saving Result",
      text:
        error.response?.data?.message ||
        "An unexpected error occurred while saving the result.",
    });
  }
};


  // --- END NEW ---

  // if (loading) {
  //   return <div className="text-center py-5">Loading student details...</div>;
  // }

  // if (!student) {
  //   return (
  //     <div className="text-center py-5 text-danger">No student found.</div>
  //   );
  // }

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
                      <Link
                        to={routes.studentDetail.replace(":id", id!)}
                        className="nav-link "
                      >
                        <i className="ti ti-school me-2" />
                        Student Details
                      </Link>
                    </li>
                    <li>
                      <Link
                        to={routes.studentResult.replace(":id", id!)}
                        className="nav-link active"
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
                        className="nav-link"
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
                  {/* /List */}
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                      <h4 className="mb-3">Exams &amp; Results</h4>
                      <div className="d-flex align-items-center flex-wrap">
                        {/* <div className="dropdown mb-3 me-2">
                          <Link
                            to="#"
                            className="btn btn-outline-light bg-white dropdown-toggle"
                            data-bs-toggle="dropdown"
                            data-bs-auto-close="outside"
                          >
                            <i className="ti ti-calendar-due me-2" />
                            Year : 2024 / 2025
                          </Link>
                          <ul className="dropdown-menu p-3">
                            <li>
                              <Link to="#" className="dropdown-item rounded-1">
                                Year : 2024 / 2025
                              </Link>
                            </li>
                            <li>
                              <Link to="#" className="dropdown-item rounded-1">
                                Year : 2023 / 2024
                              </Link>
                            </li>
                            <li>
                              <Link to="#" className="dropdown-item rounded-1">
                                Year : 2022 / 2023
                              </Link>
                            </li>
                          </ul>
                        </div> */}
                        {/* --- NEW "ADD RESULT" BUTTON --- */}

                        <button 
    className="btn btn-outline-danger mb-3 me-2 d-inline-flex align-items-center"
    onClick={() => exportToPDF(student, results)}
    disabled={results.length === 0}
  >
    <i className="ti ti-file-type-pdf me-1" />
    Download Report
  </button>
                        {roleId !== "3" && (
                        <button
                          className="btn btn-primary mb-3"
                          data-bs-toggle="modal"
                          data-bs-target="#addResultModal"
                        >
                          <i className="ti ti-plus me-1" />
                          Add Result
                        </button>
                        )}

                        
                        {/* --- END NEW BUTTON --- */}
                      </div>
                    </div>
                    <div className="card-body">
  {resultsLoading ? (
    <div className="text-center py-4 text-muted">
      <div className="spinner-border spinner-border-sm me-2" />
      Loading tasks...
    </div>
  ) : results.length === 0 ? (
    <div className="text-center py-4 text-muted">
      No results found.
    </div>
  ) : (
    results.map((res) => (
      <div className="accordion-item" key={res.id}>
    <div className="accordion-header d-flex align-items-center justify-content-between pe-3 bg-light mb-3">
            {/* Left Side: Accordion Trigger */}
            <button
              className="accordion-button collapsed shadow-none bg-transparent text-dark flex-grow-1"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#dyn-${res.id}`}
              style={{ width: 'auto' }}
            >
              <span className="avatar avatar-sm bg-success me-2">
                <i className="ti ti-checks" />
              </span>
              <span className="fw-bold">{res.exam_name}</span>
            </button>

            {/* Right Side: Download Button */}
            <button
              className="btn btn-sm btn-outline-danger d-flex align-items-center"
              onClick={(e) => {
                e.stopPropagation(); // Accordion open hone se rokne ke liye
                exportSingleExamPDF(student, res);
              }}
              title="Download PDF"
            >
              <i className="ti ti-file-type-pdf me-1" />
              PDF
            </button>
          </div>

    <div
      id={`dyn-${res.id}`}
      className="accordion-collapse collapse"
      data-bs-parent="#accordionExample"
    >
      <div className="accordion-body">
        <div className="table-responsive">
          <table className="table">
            <thead className="thead-light">
              <tr>
                <th>Subject</th>
                <th>Max</th>
                <th>Min</th>
                <th>Obtained</th>
                <th className="text-end">Result</th>
              </tr>
            </thead>
            <tbody>
              {res.subjects.map((s, si) => (
                <tr key={si}>
                  <td>{s.subjectName}</td>
                  <td>{s.maxMarks}</td>
                  <td>{s.minMarks}</td>
                  <td>{s.obtainedMarks}</td>
                  <td className="text-end">
                    {s.obtainedMarks >= s.minMarks ? (
                      <span className="badge badge-soft-success">Pass</span>
                    ) : (
                      <span className="badge badge-soft-danger">Fail</span>
                    )}
                  </td>
                </tr>
              ))}

              <tr>
                <td className="bg-dark text-white">Total: {res.total_marks}</td>
                <td className="bg-dark text-white">
                  Obtained: {res.marks_obtained}
                </td>
                <td className="bg-dark text-white" colSpan={2}>
                  Percentage: {res.percentage.toFixed(2)}%
                </td>
                <td className="bg-dark text-white text-end">
                  Result:{" "}
                  {res.result === "Pass" ? (
                    <span className="text-success">Pass</span>
                  ) : (
                    <span className="text-danger">Fail</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  )
))}


                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}

      {/* --- NEW MODAL FOR ADDING RESULTS --- */}
      <div
        className="modal fade"
        id="addResultModal"
        tabIndex={-1}
        aria-labelledby="addResultModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addResultModalLabel">
                Add New Exam Result
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleResultFormSubmit}>
                <div className="card">
                  <div className="card-header bg-light">
                    <h4 className="text-dark mb-0">Exam Details</h4>
                  </div>
                  <div className="card-body">
                    {/* Exam Name Input */}
                    <div className="mb-3">
                      <label className="form-label">Exam Name</label>
                      {/* Changed from <input> to <select> */}
                      <select
                        className="form-select" // Use "form-select" for Bootstrap dropdown styling
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        required
                      >
                        {/* Add your dropdown options here */}
                        <option value="" disabled>Select an exam...</option>
                        <option value="Monthly Test (June)">Monthly Test (June)</option>
                        <option value="Monthly Test (July)">Monthly Test (July)</option>
                        <option value="Mid-Term Exam">Mid-Term Exam</option>
                        <option value="Final Exam">Final Exam</option>
                      </select>
                    </div>

                    <hr />

                    {/* Dynamic Subject Rows */}
                    <div className="add-subject-info">
                      <div className="row">
                        <div className="col-md-12 mb-2">
                          <label className="form-label fw-bold">Subjects</label>
                        </div>

                        {subjectRows.map((row) => (
                          <div
                            key={row.id}
                            className="col-lg-12"
                            data-subject-index={row.id}
                          >
                            <div className="row">
                              {/* Subject Name */}
                              <div className="col-lg-4 col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Subject</label>
                                  {/* Replaced <input> with <select> */}
                                  <select
                                    name={`subject_${row.id}_name`}
                                    className="form-select" // Use "form-select" for Bootstrap dropdown styling
                                    value={row.subjectName}
                                    onChange={(e) =>
                                      handleSubjectChange(
                                        row.id,
                                        "subjectName",
                                        e.target.value
                                      )
                                    }
                                    required
                                  >
                                    {/* Add your subject options here */}
                                    <option value="" disabled>Select a subject...</option>
                                    <option value="English">English</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="Computer Science">Computer Science</option>
                                  </select>
                                </div>
                              </div>

                              {/* Max Marks */}
                              <div className="col-lg-2 col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">
                                    Max Marks
                                  </label>
                                  <input
                                    type="number"
                                    name={`subject_${row.id}_max`}
                                    className="form-control"
                                    placeholder="100"
                                    value={row.maxMarks}
                                    onChange={(e) =>
                                      handleSubjectChange(
                                        row.id,
                                        "maxMarks",
                                        e.target.value
                                      )
                                    }
                                    required
                                  />
                                </div>
                              </div>

                              {/* Min Marks */}
                              <div className="col-lg-2 col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">
                                    Min Marks
                                  </label>
                                  <input
                                    type="number"
                                    name={`subject_${row.id}_min`}
                                    className="form-control"
                                    placeholder="35"
                                    value={row.minMarks}
                                    onChange={(e) =>
                                      handleSubjectChange(
                                        row.id,
                                        "minMarks",
                                        e.target.value
                                      )
                                    }
                                    required
                                  />
                                </div>
                              </div>

                              {/* Marks Obtained */}
                              <div className="col-lg-4 col-md-6">
                                <div className="mb-3 d-flex align-items-center">
                                  <div className="w-100">
                                    <label className="form-label">
                                      Marks Obtained
                                    </label>
                                    <input
                                      type="number"
                                      name={`subject_${row.id}_obtained`}
                                      className="form-control"
                                      placeholder="Enter Marks"
                                      value={row.obtainedMarks}
                                      onChange={(e) =>
                                        handleSubjectChange(
                                          row.id,
                                          "obtainedMarks",
                                          e.target.value
                                        )
                                      }
                                      required
                                    />
                                  </div>

                                  {/* Remove Button */}
                                  {subjectRows.length > 1 && (
                                    <div>
                                      <label className="form-label">&nbsp;</label>
                                      <button
                                        className="trash-icon ms-3 btn btn-link text-danger"
                                        type="button"
                                        onClick={() =>
                                          handleRemoveSubjectRow(row.id)
                                        }
                                      >
                                        <i className="ti ti-trash-x" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-top pt-3">
                      <button
                        className="add-subject btn btn-primary d-inline-flex align-items-center"
                        type="button"
                        onClick={handleAddSubjectRow}
                      >
                        <i className="ti ti-circle-plus me-2" />
                        Add New Subject
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Result
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* --- END NEW MODAL --- */}

      <StudentModals />
    </>
  );
};

export default StudentResult;