import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import Table from "../../../../core/common/dataTable/index";
import axiosInstance from "../../../../core/api/axiosInstance";
import { mediaUrl } from "../../../../core/api/mediaUrl";
import Swal from "sweetalert2";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import TagInput from "../../../../core/common/Taginput";
import * as bootstrap from "bootstrap";


const StudentList = () => {
  const routes = all_routes;
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editStudentData, setEditStudentData] = useState<any>(null);
  const [siblingIndices, setSiblingIndices] = useState([0]);
  const [admissionDate, setAdmissionDate] = useState(null);
  const [dob, setDob] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [medicalDocFile, setMedicalDocFile] = useState<File | null>(null);
  const [transferCertFile, setTransferCertFile] = useState<File | null>(null);

  const roleId = sessionStorage.getItem("role_id") || localStorage.getItem("role_id");

  // ✅ Fetch students
  const fetchStudents = async () => {
  setLoading(true);

  const roleId =
    sessionStorage.getItem("role_id") || localStorage.getItem("role_id");

  try {
    // 🧑‍🎓 STUDENT
    if (roleId === "3") {
      const res = await axiosInstance.get("student/me/");
      setStudents([res.data]); // table expects array
    }

    // 👨‍🏫 TEACHER
    else if (roleId === "2") {
      const res = await axiosInstance.get("teacher/students/");
      setStudents(res.data);
    }

    // 🏫 ADMIN / SCHOOL
    else {
      const res = await axiosInstance.get("get-students/");
      setStudents(res.data);
    }
  } catch (err) {
    console.error("Error fetching students:", err);
  } finally {
    setLoading(false);
  }
};



  // ✅ Delete student
  const deleteStudent = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axiosInstance.delete(`delete-student/${id}/`);
      setStudents(students.filter((s) => s.id !== id));
      Swal.fire({ icon: "success", title: "Deleted", text: "Student deleted successfully." });
    } catch (error) {
      console.error("Error deleting student:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete student." });
    }
  };

  // ✅ Update student
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Append all fields
      const fields = [
        "academic_year", "admission_number", "admission_date", "student_id", "status",
        "first_name", "middle_name", "last_name", "grade", "section", "gender", "house",
        "religion", "primary_contact", "email", "date_of_birth", "father_name", "father_email",
        "father_phone", "father_occupation", "mother_name", "mother_email", "mother_phone",
        "mother_occupation", "guardian_relation", "guardian_phone", "guardian_email",
        "guardian_occupation", "guardian_address", "current_address1", "current_address2",
        "current_city", "current_state", "current_zipcode", "permanent_address1",
        "permanent_address2", "permanent_city", "permanent_state", "permanent_zipcode",
        "previous_school_name", "previous_school_phone", "previous_school_address",
        "bank_name", "account_number", "routing_number", "other_info"
      ];

      fields.forEach(field => {
        if (editStudentData[field] !== undefined && editStudentData[field] !== null) {
          formData.append(field, editStudentData[field]);
        }
      });

      // Append arrays as JSON
      formData.append("languages", JSON.stringify(languages));
      formData.append("allergies", JSON.stringify(allergies));
      formData.append("medications", JSON.stringify(medications));

      // Append siblings
      const siblings = [];
      siblingIndices.forEach((idx) => {
        const sibling = {
          name: editStudentData[`sibling_${idx}_name`] || "",
          roll_no: editStudentData[`sibling_${idx}_roll_no`] || "",
          admission_no: editStudentData[`sibling_${idx}_admission_no`] || "",
          class: editStudentData[`sibling_${idx}_class`] || "",
        };
        if (sibling.name || sibling.roll_no || sibling.admission_no || sibling.class) {
          siblings.push(sibling);
        }
      });
      formData.append("siblings", JSON.stringify(siblings));

      // Append files if they exist
      // Photo: only send if a new File was selected
      if (editStudentData.photo instanceof File) {
        formData.append("photo", editStudentData.photo);
      }
      // PDFs: only send new File — omitting keeps existing file on backend
      if (medicalDocFile instanceof File) {
        formData.append("medical_document", medicalDocFile);
      }
      if (transferCertFile instanceof File) {
        formData.append("transfer_certificate", transferCertFile);
      }

      // DO NOT set Content-Type manually — let axios set multipart boundary
      await axiosInstance.put(`update-student/${editStudentData.id}/`, formData);
      
      setStudents((prev) =>
        prev.map((s) => (s.id === editStudentData.id ? {...editStudentData} : s))
      );
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editStudentModal")!
      );
      modal.hide();
      Swal.fire({ icon: "success", title: "Updated", text: "Student updated successfully." });
    } catch (error) {
      console.error("Error updating student:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to update student." });
    }
  };

  // ✅ Open view modal
  const handleView = (student: any) => {
    setSelectedStudent(student);
    const modal = new bootstrap.Modal(
      document.getElementById("viewStudentModal")!
    );
    modal.show();
  };

  // ✅ Open edit modal
  const handleEdit = (student: any) => {
    const studentData = {...student};
    
    // Reset file states
    setPhotoPreview(student.photo ? mediaUrl(student.photo) : null);
    setMedicalDocFile(null);
    setTransferCertFile(null);

    // Parse arrays
    try {
      if (student.languages) setLanguages(typeof student.languages === 'string' ? JSON.parse(student.languages) : student.languages);
      if (student.allergies) setAllergies(typeof student.allergies === 'string' ? JSON.parse(student.allergies) : student.allergies);
      if (student.medications) setMedications(typeof student.medications === 'string' ? JSON.parse(student.medications) : student.medications);
    } catch (e) {
      console.error("Error parsing arrays:", e);
    }

    // Set dates
    if (student.admission_date) setAdmissionDate(dayjs(student.admission_date));
    if (student.date_of_birth) setDob(dayjs(student.date_of_birth));

    // Handle siblings
    try {
      const siblings = student.siblings ? (typeof student.siblings === 'string' ? JSON.parse(student.siblings) : student.siblings) : [];
      if (siblings.length > 0) {
        const indices = siblings.map((_: any, i: number) => i);
        setSiblingIndices(indices);
        siblings.forEach((sib: any, i: number) => {
          studentData[`sibling_${i}_name`] = sib.name;
          studentData[`sibling_${i}_roll_no`] = sib.roll_no;
          studentData[`sibling_${i}_admission_no`] = sib.admission_no;
          studentData[`sibling_${i}_class`] = sib.class;
        });
      } else {
        setSiblingIndices([0]);
      }
    } catch (e) {
      console.error("Error parsing siblings:", e);
      setSiblingIndices([0]);
    }

    setEditStudentData(studentData);
    const modal = new bootstrap.Modal(
      document.getElementById("editStudentModal")!
    );
    modal.show();
  };

  // Sibling management
  const addSiblingRow = (e: React.MouseEvent) => {
    e.preventDefault();
    setSiblingIndices((prev) => [...prev, prev.length ? Math.max(...prev) + 1 : 0]);
  };

  const removeSiblingRow = (index: number) => {
    setSiblingIndices((prev) => prev.filter((i) => i !== index));
    // Remove sibling data from state
    const newData = {...editStudentData};
    delete newData[`sibling_${index}_name`];
    delete newData[`sibling_${index}_roll_no`];
    delete newData[`sibling_${index}_admission_no`];
    delete newData[`sibling_${index}_class`];
    setEditStudentData(newData);
  };

  // Tag handlers
  const handleLanguagesChange = (newTags: string[]) => setLanguages(newTags);
  const handleAllergiesChange = (newTags: string[]) => setAllergies(newTags);
  const handleMedicationsChange = (newTags: string[]) => setMedications(newTags);

  // Date handlers
  const handleAdmissionDateChange = (date: any) => {
    setAdmissionDate(date);
    setEditStudentData({
      ...editStudentData,
      admission_date: date ? dayjs(date).format("MM-DD-YYYY") : ""
    });
  };

  const handleDobChange = (date: any) => {
    setDob(date);
    setEditStudentData({
      ...editStudentData,
      date_of_birth: date ? dayjs(date).format("MM-DD-YYYY") : ""
    });
  };

  // File handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (field === "photo") {
      const allowed = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowed.includes(file.type)) { alert("Only JPG/PNG images allowed"); e.target.value = ""; return; }
      if (file.size > 4 * 1024 * 1024) { alert("Image must be less than 4MB"); e.target.value = ""; return; }
      setPhotoPreview(URL.createObjectURL(file));
      setEditStudentData({ ...editStudentData, photo: file });
    } else if (field === "medical_document") {
      if (file.type !== "application/pdf") { alert("Only PDF files allowed"); e.target.value = ""; return; }
      setMedicalDocFile(file);
    } else if (field === "transfer_certificate") {
      if (file.type !== "application/pdf") { alert("Only PDF files allowed"); e.target.value = ""; return; }
      setTransferCertFile(file);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleApplyClick = () => {
    if (dropdownMenuRef.current) {
      dropdownMenuRef.current.classList.remove("show");
    }
  };

  // Helper function to parse JSON arrays safely
  const parseSafe = (data: any, key: string) => {
    try {
      if (typeof data[key] === 'string') {
        return JSON.parse(data[key]);
      }
      return data[key] || [];
    } catch {
      return data[key] || [];
    }
  };

  const columns = [
    {
      title: "Student",
      dataIndex: "first_name",
      render: (_: string, record: any) => (
        <div className="d-flex align-items-center">
          <div className="avatar avatar-md me-2 flex-shrink-0">
            {record.photo ? (
              <img
                src={mediaUrl(record.photo)}
                className="rounded-circle"
                alt={record.first_name}
                style={{ width: 40, height: 40, objectFit: "cover" }}
              />
            ) : (
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: 40, height: 40, fontSize: 14 }}
              >
                {record.first_name?.[0]}{record.last_name?.[0]}
              </div>
            )}
          </div>
          <div>
            <Link
              to={`/student/student-details/${record.id}`}
              className="text-dark fw-medium mb-0 d-block"
            >
              {record.first_name} {record.middle_name} {record.last_name}
            </Link>
            <small className="text-muted">{record.admission_number}</small>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => (a.first_name || "").localeCompare(b.first_name || ""),
    },
    {
      title: "Grade",
      dataIndex: "grade",
      render: (text: string) => <span className="badge bg-light text-dark">{text || "—"}</span>,
      sorter: (a: any, b: any) => (a.grade || "").localeCompare(b.grade || ""),
    },
    {
      title: "Section",
      dataIndex: "section",
      render: (text: string) => text || "—",
    },
    {
      title: "Contact",
      dataIndex: "primary_contact",
      render: (text: string) => text || "—",
    },
    {
      title: "Admission Date",
      dataIndex: "admission_date",
      render: (text: string) => text || "—",
      sorter: (a: any, b: any) => new Date(a.admission_date).getTime() - new Date(b.admission_date).getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <span className={`badge ${text === "Active" ? "badge-soft-success" : "badge-soft-danger"} d-inline-flex align-items-center`}>
          <i className="ti ti-circle-filled fs-5 me-1" />
          {text || "—"}
        </span>
      ),
      sorter: (a: any, b: any) => (a.status || "").localeCompare(b.status || ""),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (_: any, record: any) => (
        <div className="d-flex align-items-center gap-1">
          <Link
            to={`/student/student-details/${record.id}`}
            className="btn btn-sm btn-outline-primary btn-icon rounded-circle"
            title="View Details"
          >
            <i className="ti ti-eye" />
          </Link>
          {roleId !== "3" && (
            <>
              <button
                onClick={() => handleEdit(record)}
                className="btn btn-sm btn-outline-warning btn-icon rounded-circle"
                title="Edit"
              >
                <i className="ti ti-edit" />
              </button>
              <button
                onClick={() => deleteStudent(record.id)}
                className="btn btn-sm btn-outline-danger btn-icon rounded-circle"
                title="Delete"
              >
                <i className="ti ti-trash" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Students List</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">Students</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    All Students
                  </li>
                </ol>
              </nav>
            </div>
            
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              {/* <TooltipOption /> */}

              {roleId !== "3" && (
                <div className="mb-2">
                  <Link
                    to={routes.addStudent}
                    className="btn btn-primary d-flex align-items-center"
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    Add Student
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Students List */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Students List</h4>
              <div className="d-flex align-items-center flex-wrap">
                {/* <div className="input-icon-start mb-3 me-2 position-relative">
                  <PredefinedDateRanges />
                </div> */}
              </div>
            </div>

            <div className="card-body p-0 py-3">
              {loading ? (
                <div className="text-center py-4">Loading students...</div>
              ) : (
                <Table columns={columns} dataSource={students} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Student Modal - Same as before */}
      <div
        className="modal fade"
        id="viewStudentModal"
        tabIndex={-1}
        aria-labelledby="viewStudentLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="viewStudentLabel">
                Student Details - {selectedStudent?.first_name} {selectedStudent?.last_name}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {selectedStudent ? (
                <div className="container-fluid">
                  {/* Personal Information */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light fw-bold">Personal Information</div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4"><strong>Academic Year:</strong> {selectedStudent.academic_year}</div>
                        <div className="col-md-4"><strong>Admission Number:</strong> {selectedStudent.admission_number}</div>
                        <div className="col-md-4"><strong>Admission Date:</strong> {selectedStudent.admission_date}</div>
                        <div className="col-md-4"><strong>Student ID:</strong> {selectedStudent.student_id}</div>
                        <div className="col-md-4"><strong>Status:</strong> {selectedStudent.status}</div>
                        <div className="col-md-4"><strong>First Name:</strong> {selectedStudent.first_name}</div>
                        <div className="col-md-4"><strong>Middle Name:</strong> {selectedStudent.middle_name}</div>
                        <div className="col-md-4"><strong>Last Name:</strong> {selectedStudent.last_name}</div>
                        <div className="col-md-4"><strong>Grade level:</strong> {selectedStudent.grade}</div>
                        <div className="col-md-4"><strong>Section:</strong> {selectedStudent.section}</div>
                        <div className="col-md-4"><strong>Gender:</strong> {selectedStudent.gender}</div>
                        <div className="col-md-4"><strong>House:</strong> {selectedStudent.house}</div>
                        <div className="col-md-4"><strong>Religion:</strong> {selectedStudent.religion}</div>
                        <div className="col-md-4"><strong>Date of Birth:</strong> {selectedStudent.date_of_birth}</div>
                        <div className="col-md-4"><strong>Primary Contact:</strong> {selectedStudent.primary_contact}</div>
                        <div className="col-md-4"><strong>Email:</strong> {selectedStudent.email}</div>
                        <div className="col-md-12"><strong>Languages Known:</strong> {parseSafe(selectedStudent, 'languages').join(', ') || 'None'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Parents Information */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light fw-bold">Parents Information</div>
                    <div className="card-body">
                      <h6>Father's Information</h6>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6"><strong>Name:</strong> {selectedStudent.father_name}</div>
                        <div className="col-md-6"><strong>Email:</strong> {selectedStudent.father_email}</div>
                        <div className="col-md-6"><strong>Phone:</strong> {selectedStudent.father_phone}</div>
                        <div className="col-md-6"><strong>Occupation:</strong> {selectedStudent.father_occupation}</div>
                      </div>
                      
                      <h6>Mother's Information</h6>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6"><strong>Name:</strong> {selectedStudent.mother_name}</div>
                        <div className="col-md-6"><strong>Email:</strong> {selectedStudent.mother_email}</div>
                        <div className="col-md-6"><strong>Phone:</strong> {selectedStudent.mother_phone}</div>
                        <div className="col-md-6"><strong>Occupation:</strong> {selectedStudent.mother_occupation}</div>
                      </div>

                      <h6>Guardian Information</h6>
                      <div className="row g-3">
                        <div className="col-md-6"><strong>Relation:</strong> {selectedStudent.guardian_relation}</div>
                        <div className="col-md-6"><strong>Phone:</strong> {selectedStudent.guardian_phone}</div>
                        <div className="col-md-6"><strong>Email:</strong> {selectedStudent.guardian_email}</div>
                        <div className="col-md-6"><strong>Occupation:</strong> {selectedStudent.guardian_occupation}</div>
                        <div className="col-md-12"><strong>Address:</strong> {selectedStudent.guardian_address}</div>
                      </div>
                    </div>
                  </div>

                  {/* Siblings Information */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light fw-bold">Siblings Information</div>
                    <div className="card-body">
                      {parseSafe(selectedStudent, 'siblings').length > 0 ? (
                        parseSafe(selectedStudent, 'siblings').map((sibling: any, index: number) => (
                          <div key={index} className="row g-3 mb-3 border-bottom pb-3">
                            <div className="col-md-3"><strong>Name:</strong> {sibling.name}</div>
                            <div className="col-md-3"><strong>Roll No:</strong> {sibling.roll_no}</div>
                            <div className="col-md-3"><strong>Admission No:</strong> {sibling.admission_no}</div>
                            <div className="col-md-3"><strong>Class:</strong> {sibling.class}</div>
                          </div>
                        ))
                      ) : (
                        <p>No siblings information available</p>
                      )}
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light fw-bold">Address Information</div>
                    <div className="card-body">
                      <h6>Current Address</h6>
                      <div className="row g-3 mb-3">
                        <div className="col-md-12"><strong>Address 1:</strong> {selectedStudent.current_address1}</div>
                        <div className="col-md-12"><strong>Address 2:</strong> {selectedStudent.current_address2}</div>
                        <div className="col-md-4"><strong>City:</strong> {selectedStudent.current_city}</div>
                        <div className="col-md-4"><strong>State:</strong> {selectedStudent.current_state}</div>
                        <div className="col-md-4"><strong>Zip Code:</strong> {selectedStudent.current_zipcode}</div>
                      </div>
                      
                      <h6>Permanent Address</h6>
                      <div className="row g-3">
                        <div className="col-md-12"><strong>Address 1:</strong> {selectedStudent.permanent_address1}</div>
                        <div className="col-md-12"><strong>Address 2:</strong> {selectedStudent.permanent_address2}</div>
                        <div className="col-md-4"><strong>City:</strong> {selectedStudent.permanent_city}</div>
                        <div className="col-md-4"><strong>State:</strong> {selectedStudent.permanent_state}</div>
                        <div className="col-md-4"><strong>Zip Code:</strong> {selectedStudent.permanent_zipcode}</div>
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light fw-bold">Medical History</div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-12"><strong>Allergies:</strong> {parseSafe(selectedStudent, 'allergies').join(', ') || 'None'}</div>
                        <div className="col-md-12"><strong>Medications:</strong> {parseSafe(selectedStudent, 'medications').join(', ') || 'None'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Previous School Details */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light fw-bold">Previous School Details</div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6"><strong>School Name:</strong> {selectedStudent.previous_school_name}</div>
                        <div className="col-md-6"><strong>Phone:</strong> {selectedStudent.previous_school_phone}</div>
                        <div className="col-md-12"><strong>Address:</strong> {selectedStudent.previous_school_address}</div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light fw-bold">Bank Details</div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4"><strong>Bank Name:</strong> {selectedStudent.bank_name}</div>
                        <div className="col-md-4"><strong>Account Number:</strong> {selectedStudent.account_number}</div>
                        <div className="col-md-4"><strong>Routing Number:</strong> {selectedStudent.routing_number}</div>
                        <div className="col-md-12"><strong>Other Information:</strong> {selectedStudent.other_info}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Student Modal - Full form matching AddStudent */}
      <div
        className="modal fade"
        id="editStudentModal"
        tabIndex={-1}
        aria-labelledby="editStudentLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editStudentLabel">
                Edit Student - {editStudentData?.first_name} {editStudentData?.last_name}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {editStudentData && (
                <form onSubmit={handleUpdateStudent}>
                  {/* Personal Information */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                          <i className="ti ti-info-square-rounded fs-16" />
                        </span>
                        <h4 className="text-dark">Personal Information</h4>
                      </div>
                    </div>
                    <div className="card-body">
                      {/* Files row */}
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center flex-wrap row-gap-3">
                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl border border-dashed me-2 flex-shrink-0 text-dark frames overflow-hidden">
                              {photoPreview ? (
                                <img src={photoPreview} alt="Preview" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8 }} />
                              ) : (
                                <i className="ti ti-photo-plus fs-16" />
                              )}
                            </div>
                            <div className="profile-upload">
                              <div className="profile-uploader d-flex align-items-center">
                                <div className="drag-upload-btn mb-3">
                                  Upload Photo
                                  <input name="photo" type="file" accept="image/jpeg,image/png,image/jpg" className="form-control image-sign" onChange={(e) => handleFileChange(e, 'photo')} />
                                </div>
                                <button type="button" className="btn btn-primary mb-3 ms-2" onClick={() => { setPhotoPreview(null); setEditStudentData({ ...editStudentData, photo: null }); }}>Remove</button>
                              </div>
                              <p className="fs-12">Max 4MB, JPG/PNG only</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Medical Document (PDF)</label>
                            <input type="file" accept="application/pdf" className="form-control" onChange={(e) => handleFileChange(e, 'medical_document')} />
                            {editStudentData.medical_document && typeof editStudentData.medical_document === 'string' && (
                              <div className="mt-1 d-flex align-items-center gap-2">
                                <small className="text-muted">{editStudentData.medical_document.split("/").pop()}</small>
                                <a href={mediaUrl(editStudentData.medical_document)} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-dark btn-icon"><i className="ti ti-download" /></a>
                              </div>
                            )}
                            {medicalDocFile && <small className="text-success d-block mt-1">New: {medicalDocFile.name}</small>}
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Transfer Certificate (PDF)</label>
                            <input type="file" accept="application/pdf" className="form-control" onChange={(e) => handleFileChange(e, 'transfer_certificate')} />
                            {editStudentData.transfer_certificate && typeof editStudentData.transfer_certificate === 'string' && (
                              <div className="mt-1 d-flex align-items-center gap-2">
                                <small className="text-muted">{editStudentData.transfer_certificate.split("/").pop()}</small>
                                <a href={mediaUrl(editStudentData.transfer_certificate)} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-dark btn-icon"><i className="ti ti-download" /></a>
                              </div>
                            )}
                            {transferCertFile && <small className="text-success d-block mt-1">New: {transferCertFile.name}</small>}
                          </div>
                        </div>
                      </div>
                      {/* Fields row */}
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Academic Year</label>
                          <select name="academic_year" className="form-select" value={editStudentData.academic_year || ""} onChange={(e) => setEditStudentData({...editStudentData, academic_year: e.target.value})}>
                            <option value="2023-2024">2023-2024</option>
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                            <option value="2026-2027">2026-2027</option>
                            <option value="2027-2028">2027-2028</option>
                          </select>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Admission Number</label>
                          <input name="admission_number" type="text" className="form-control" value={editStudentData.admission_number || ""} onChange={(e) => setEditStudentData({...editStudentData, admission_number: e.target.value})} />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Admission Date</label>
                          <DatePicker className="form-control" format="MM-DD-YYYY" value={admissionDate} onChange={handleAdmissionDateChange} placeholder="Select Date" />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Student Id</label>
                          <input name="student_id" type="text" className="form-control" value={editStudentData.student_id || ""} onChange={(e) => setEditStudentData({...editStudentData, student_id: e.target.value})} />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Status</label>
                          <select 
                            name="status" 
                            className="form-select"
                            value={editStudentData.status || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, status: e.target.value})}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">First Name</label>
                          <input 
                            name="first_name" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.first_name || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, first_name: e.target.value})}
                          />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">M.I</label>
                          <input 
                            name="middle_name" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.middle_name || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, middle_name: e.target.value})}
                          />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Last Name</label>
                          <input 
                            name="last_name" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.last_name || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, last_name: e.target.value})}
                          />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Grade level</label>
                          <select 
                            name="grade" 
                            className="form-select"
                            value={editStudentData.grade || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, grade: e.target.value})}
                          >
                            <option value="Nursery">Nursery</option>
                            <option value="LKG">LKG</option>
                            <option value="UKG">UKG</option>
                            <option value="1">Class 1</option>
                            <option value="2">Class 2</option>
                            <option value="3">Class 3</option>
                            <option value="4">Class 4</option>
                            <option value="5">Class 5</option>
                            <option value="6">Class 6</option>
                            <option value="7">Class 7</option>
                            <option value="8">Class 8</option>
                            <option value="9">Class 9</option>
                            <option value="10">Class 10</option>
                            <option value="11">Class 11</option>
                            <option value="12">Class 12</option>
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Section</label>
                          <select 
                            name="section" 
                            className="form-select"
                            value={editStudentData.section || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, section: e.target.value})}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Gender</label>
                          <select 
                            name="gender" 
                            className="form-select"
                            value={editStudentData.gender || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, gender: e.target.value})}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Date of Birth</label>
                          <DatePicker 
                            className="form-control" 
                            format="MM-DD-YYYY" 
                            value={dob} 
                            onChange={handleDobChange} 
                            placeholder="Select Date" 
                          />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">House</label>
                          <select 
                            name="house" 
                            className="form-select"
                            value={editStudentData.house || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, house: e.target.value})}
                          >
                            <option value="Red">Red</option>
                            <option value="Blue">Blue</option>
                            <option value="Green">Green</option>
                            <option value="Yellow">Yellow</option>
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Religion</label>
                          <select 
                            name="religion" 
                            className="form-select"
                            value={editStudentData.religion || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, religion: e.target.value})}
                          >
                            <option value="Islam">Islam</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Christian">Christian</option>
                            <option value="Sikh">Sikh</option>
                            <option value="Buddhist">Buddhist</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Primary Contact Number</label>
                          <input 
                            name="primary_contact" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.primary_contact || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, primary_contact: e.target.value})}
                          />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Email Address</label>
                          <input 
                            name="email" 
                            type="email" 
                            className="form-control" 
                            value={editStudentData.email || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, email: e.target.value})}
                          />
                        </div>

                        <div className="col-md-4 mb-3">
                          <label className="form-label">Language Known</label>
                          <TagInput initialTags={languages} onTagsChange={handleLanguagesChange} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parents & Guardian */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                          <i className="ti ti-user-shield fs-16" />
                        </span>
                        <h4 className="text-dark">Parents & Guardian Information</h4>
                      </div>
                    </div>
                    <div className="card-body">
                      {/* Father's Info */}
                      <div className="border-bottom mb-3">
                        <h5 className="mb-3">Father's Info</h5>
                        <div className="row">
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Father Name</label>
                            <input 
                              name="father_name" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.father_name || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, father_name: e.target.value})}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Email</label>
                            <input 
                              name="father_email" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.father_email || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, father_email: e.target.value})}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Phone Number</label>
                            <input 
                              name="father_phone" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.father_phone || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, father_phone: e.target.value})}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Father Occupation</label>
                            <input 
                              name="father_occupation" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.father_occupation || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, father_occupation: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mother's Info */}
                      <div className="border-bottom mb-3">
                        <h5 className="mb-3">Mother's Info</h5>
                        <div className="row">
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Mother Name</label>
                            <input 
                              name="mother_name" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.mother_name || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, mother_name: e.target.value})}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Email</label>
                            <input 
                              name="mother_email" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.mother_email || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, mother_email: e.target.value})}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Phone Number</label>
                            <input 
                              name="mother_phone" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.mother_phone || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, mother_phone: e.target.value})}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Mother Occupation</label>
                            <input 
                              name="mother_occupation" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.mother_occupation || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, mother_occupation: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Guardian */}
                      <div>
                        <h5 className="mb-3">Guardian Details</h5>
                        <div className="row">
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Guardian Relation</label>
                            <input 
                              name="guardian_relation" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.guardian_relation || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, guardian_relation: e.target.value})}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Phone Number</label>
                            <input 
                              name="guardian_phone" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.guardian_phone || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, guardian_phone: e.target.value})}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Email</label>
                            <input 
                              name="guardian_email" 
                              type="email" 
                              className="form-control" 
                              value={editStudentData.guardian_email || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, guardian_email: e.target.value})}
                            />
                          </div>
                          <div className="col-md-3 mb-3">
                            <label className="form-label">Occupation</label>
                            <input 
                              name="guardian_occupation" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.guardian_occupation || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, guardian_occupation: e.target.value})}
                            />
                          </div>
                          <div className="col-md-12 mb-3">
                            <label className="form-label">Address</label>
                            <input 
                              name="guardian_address" 
                              type="text" 
                              className="form-control" 
                              value={editStudentData.guardian_address || ""}
                              onChange={(e) => setEditStudentData({...editStudentData, guardian_address: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Siblings */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                          <i className="ti ti-users fs-16" />
                        </span>
                        <h4 className="text-dark">Siblings</h4>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="addsibling-info">
                        <div className="row">
                          <div className="col-md-12 mb-2">
                            <label className="form-label">Sibling Info</label>
                          </div>

                          {siblingIndices.map((idx) => (
                            <div key={idx} className="col-lg-12">
                              <div className="row">
                                <div className="col-lg-3 col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">Name</label>
                                    <input
                                      type="text"
                                      name={`sibling_${idx}_name`}
                                      className="form-control"
                                      placeholder="Enter Name"
                                      value={editStudentData[`sibling_${idx}_name`] || ""}
                                      onChange={(e) => setEditStudentData({
                                        ...editStudentData,
                                        [`sibling_${idx}_name`]: e.target.value
                                      })}
                                    />
                                  </div>
                                </div>

                                <div className="col-lg-3 col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">Student Id</label>
                                    <input
                                      type="text"
                                      name={`sibling_${idx}_roll_no`}
                                      className="form-control"
                                      placeholder="Enter Student ID"
                                      value={editStudentData[`sibling_${idx}_roll_no`] || ""}
                                      onChange={(e) => setEditStudentData({
                                        ...editStudentData,
                                        [`sibling_${idx}_roll_no`]: e.target.value
                                      })}
                                    />
                                  </div>
                                </div>

                                <div className="col-lg-3 col-md-6">
                                  <div className="mb-3">
                                    <label className="form-label">Admission No</label>
                                    <input
                                      type="text"
                                      name={`sibling_${idx}_admission_no`}
                                      className="form-control"
                                      placeholder="Enter Admission No"
                                      value={editStudentData[`sibling_${idx}_admission_no`] || ""}
                                      onChange={(e) => setEditStudentData({
                                        ...editStudentData,
                                        [`sibling_${idx}_admission_no`]: e.target.value
                                      })}
                                    />
                                  </div>
                                </div>

                                <div className="col-lg-3 col-md-6">
                                  <div className="mb-3 d-flex align-items-center">
                                    <div className="w-100">
                                      <label className="form-label">Grade level</label>
                                      <input
                                        type="text"
                                        name={`sibling_${idx}_class`}
                                        className="form-control"
                                        placeholder="Enter Grade level"
                                        value={editStudentData[`sibling_${idx}_class`] || ""}
                                        onChange={(e) => setEditStudentData({
                                          ...editStudentData,
                                          [`sibling_${idx}_class`]: e.target.value
                                        })}
                                      />
                                    </div>

                                    {siblingIndices.length > 1 && (
                                      <div>
                                        <label className="form-label">&nbsp;</label>
                                        <button
                                          className="trash-icon ms-3 btn btn-link"
                                          type="button"
                                          onClick={() => removeSiblingRow(idx)}
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
                        <button className="add-sibling btn btn-primary d-inline-flex align-items-center" onClick={addSiblingRow}>
                          <i className="ti ti-circle-plus me-2" />
                          Add New
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                          <i className="ti ti-map fs-16" />
                        </span>
                        <h4 className="text-dark">Address</h4>
                      </div>
                    </div>
                    <div className="card-body">
                      {/* Current Address */}
                      <h5 className="text-dark mb-3">Current Address</h5>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Address 1</label>
                          <input 
                            name="current_address1" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.current_address1 || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, current_address1: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Address 2</label>
                          <input 
                            name="current_address2" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.current_address2 || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, current_address2: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">City</label>
                          <input 
                            name="current_city" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.current_city || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, current_city: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">State</label>
                          <input 
                            name="current_state" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.current_state || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, current_state: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Zip Code</label>
                          <input 
                            name="current_zipcode" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.current_zipcode || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, current_zipcode: e.target.value})}
                          />
                        </div>
                      </div>

                      <hr className="my-4" />

                      {/* Permanent Address */}
                      <h5 className="text-dark mb-3">Permanent Address</h5>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Address 1</label>
                          <input 
                            name="permanent_address1" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.permanent_address1 || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, permanent_address1: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Address 2</label>
                          <input 
                            name="permanent_address2" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.permanent_address2 || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, permanent_address2: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">City</label>
                          <input 
                            name="permanent_city" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.permanent_city || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, permanent_city: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">State</label>
                          <input 
                            name="permanent_state" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.permanent_state || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, permanent_state: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Zip Code</label>
                          <input 
                            name="permanent_zipcode" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.permanent_zipcode || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, permanent_zipcode: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical History */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                          <i className="ti ti-medical-cross fs-16" />
                        </span>
                        <h4 className="text-dark">Medical History</h4>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">Allergies</label>
                        <TagInput initialTags={allergies} onTagsChange={handleAllergiesChange} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Medications</label>
                        <TagInput initialTags={medications} onTagsChange={handleMedicationsChange} />
                      </div>
                    </div>
                  </div>

                  {/* Previous School */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                          <i className="ti ti-building fs-16" />
                        </span>
                        <h4 className="text-dark">Previous School Details</h4>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">School Name</label>
                          <input 
                            name="previous_school_name" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.previous_school_name || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, previous_school_name: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Address</label>
                          <input 
                            name="previous_school_address" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.previous_school_address || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, previous_school_address: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Phone Number</label>
                          <input 
                            name="previous_school_phone" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.previous_school_phone || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, previous_school_phone: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                          <i className="ti ti-building-bank fs-16" />
                        </span>
                        <h4 className="text-dark">Bank Details</h4>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Bank Name</label>
                          <input 
                            name="bank_name" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.bank_name || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, bank_name: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Account Number</label>
                          <input 
                            name="account_number" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.account_number || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, account_number: e.target.value})}
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Routing Number</label>
                          <input 
                            name="routing_number" 
                            type="text" 
                            className="form-control" 
                            value={editStudentData.routing_number || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, routing_number: e.target.value})}
                          />
                        </div>
                        <div className="col-md-12 mb-3">
                          <label className="form-label">Other Information</label>
                          <textarea 
                            name="other_info" 
                            className="form-control" 
                            rows={3}
                            value={editStudentData.other_info || ""}
                            onChange={(e) => setEditStudentData({...editStudentData, other_info: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="text-end">
                    <button type="button" className="btn btn-light me-3" data-bs-dismiss="modal">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Student
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentList;