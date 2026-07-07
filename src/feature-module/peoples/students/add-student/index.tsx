// AddStudent.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import axiosInstance from "../../../../core/api/axiosInstance";
import { all_routes } from "../../../router/all_routes";
import {
  AdmissionNo,
  Hostel,
  PickupPoint,
  VehicleNumber,
  academicYear,
  allClass,
  allSection,
  bloodGroup,
  cast,
  gender,
  house,
  mothertongue,
  names,
  religion,
  rollno,
  roomNO,
  route,
  status,
} from "../../../../core/common/selectoption/selectoption";

import CommonSelect from "../../../../core/common/commonSelect";
import TagInput from "../../../../core/common/Taginput";

/**
 * Full AddStudent component with:
 * - Add and Edit modes (uses :id param to detect edit)
 * - FormData submission to `add-student/` or `update-student/<id>/`
 * - SweetAlert2 confirmation + success/error popups
 *
 * Notes:
 * - This component reads values from the form DOM via formRef to avoid
 *   controlling every single input state for this large form.
 * - TagInput controlled state is kept in component state (owner / owner1 / owner2).
 * - Sibling rows are gathered from DOM (elements using data-sibling-index attribute).
 * - For production you may prefer controlled components or a form library (Formik / React Hook Form).
 */

const AddStudent = () => {
  const routes = all_routes;
  const { id } = useParams(); // if route is /students/edit/:id
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);

  // Tag states (language, allergies, medications)
  const [languages, setLanguages] = useState(["English", "Spanish"]);
  const [allergies, setAllergies] = useState([]);
  const [medications, setMedications] = useState([]);

  // sibling row indices
  const [siblingIndices, setSiblingIndices] = useState([0]);

  // date state used for DatePicker fields (admission_date & dob)
  const [admissionDate, setAdmissionDate] = useState(null);
  const [dob, setDob] = useState(null);

  // files preview / store (optional)
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [proofOfResidencyFile, setProofOfResidencyFile] = useState<File | null>(null);
  const [proofOfResidencyPreview, setProofOfResidencyPreview] = useState<string | null>(null);
  const [medicalDocumentFile, setMedicalDocumentFile] = useState<File | null>(null);
  const [transferCertificateFile, setTransferCertificateFile] = useState<File | null>(null);

  // ── File validation ──────────────────────────────────────────────────────────
  const validateFile = (file: File, type: "image" | "pdf"): boolean => {
    if (!file) return false;
    if (type === "image") {
      const allowed = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowed.includes(file.type)) {
        alert("Only JPG and PNG images are allowed");
        return false;
      }
      if (file.size > 4 * 1024 * 1024) {
        alert("Image must be less than 4MB");
        return false;
      }
    }
    if (type === "pdf") {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed");
        return false;
      }
    }
    return true;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    type: "image" | "pdf"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file, type)) {
      e.target.value = "";
      return;
    }
    setter(file);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file, "image")) {
      e.target.value = "";
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleProofOfResidencyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !validateFile(file, "pdf")) {
      e.target.value = "";
      return;
    }

    setProofOfResidencyFile(file);

    // PDF preview image nahi hota, sirf name show karo
    setProofOfResidencyPreview(null);
  };

  // login credentials state
  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // when editing, fetch existing student for prefilling
  useEffect(() => {
    if (isEditMode) {
      // Try to fetch single record. If API doesn't offer single-get, we request all and find by id.
      const fetchStudent = async () => {
        try {
          const resp = await axiosInstance.get("get-students/");
          const records = resp.data;
          // adjust property used for matching depending on response (id, pk, or pkId)
          const student = Array.isArray(records)
            ? records.find((r) => String(r.id) === String(id) || String(r.pk) === String(id))
            : null;

          if (!student) {
            // If not found in list, still attempt to get via update endpoint (some APIs use GET on update)
            try {
              const alt = await axiosInstance.get(`update-student/${id}/`);
              if (alt?.data) {
                fillForm(alt.data);
                return;
              }
            } catch (err) {
              console.warn("Single student fetch fallback failed", err);
            }
            Swal.fire({
              icon: "warning",
              title: "Not found",
              text: "Student not found to edit. You'll be redirected to list.",
            });
            navigate(routes.studentList);
            return;
          }
          fillForm(student);
        } catch (error) {
          console.error("Error fetching students for edit:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load student data for editing.",
          });
        }
      };
      fetchStudent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // fill the form DOM and component state using fetched student object
  const fillForm = (student) => {
    if (!formRef.current) return;
    const form = formRef.current;

    // Basic fields (these names must match form input `name` attributes below)
    const simpleFields = [
      // Personal Info
      "academic_year",
      "admission_number",
      "admission_date",
      "student_id",
      "status",
      "first_name",
      "middle_name",
      "last_name",
      "grade",
      "section",
      "gender",
      "house",
      "religion",
      "primary_contact",
      "email",
      "date_of_birth",

      // Parents / Guardian
      "father_name",
      "father_email",
      "father_phone",
      "father_occupation",

      "mother_name",
      "mother_email",
      "mother_phone",
      "mother_occupation",

      "guardian_relation",
      "guardian_phone",
      "guardian_email",
      "guardian_occupation",
      "guardian_address",

      // Address - Current
      "current_address1",
      "current_address2",
      "current_city",
      "current_state",
      "current_zipcode",

      // Address - Permanent
      "permanent_address1",
      "permanent_address2",
      "permanent_city",
      "permanent_state",
      "permanent_zipcode",

      // Previous School
      "previous_school_name",
      "previous_school_phone",
      "previous_school_address",

      // Bank Info
      "bank_name",
      "account_number",
      "routing_number",

      // Other
      "other_info",
    ];

    simpleFields.forEach((key) => {
      try {
        if (form.elements[key]) {
          form.elements[key].value =
            student[key] !== undefined && student[key] !== null
              ? student[key]
              : "";
        }
      } catch (e) {
        // ignore if element not present
      }
    });

    // dates
    if (student.admission_date) {
      setAdmissionDate(dayjs(student.admission_date));
      if (form.elements["admission_date"]) {
        form.elements["admission_date"].value = student.admission_date;
      }
    }
    if (student.date_of_birth) {
      setDob(dayjs(student.date_of_birth));
      if (form.elements["date_of_birth"]) {
        form.elements["date_of_birth"].value = student.date_of_birth;
      }
    }

    // tags (languages, allergies, medications)
    if (student.languages) setLanguages(Array.isArray(student.languages) ? student.languages : []);
    if (student.allergies) setAllergies(Array.isArray(student.allergies) ? student.allergies : []);
    if (student.medications) setMedications(Array.isArray(student.medications) ? student.medications : []);

    // siblings (if present, fill dynamic rows)
    if (Array.isArray(student.siblings) && student.siblings.length > 0) {
      const idxs = student.siblings.map((_, i) => i);
      setSiblingIndices(idxs.length ? idxs : [0]);

      // We'll fill them after a short timeout so DOM sibling rows exist
      setTimeout(() => {
        student.siblings.forEach((sib, i) => {
          const prefix = `sibling_${i}_`;
          if (form.elements[`${prefix}name`]) form.elements[`${prefix}name`].value = sib.name || "";
          if (form.elements[`${prefix}roll_no`]) form.elements[`${prefix}roll_no`].value = sib.roll_no || "";
          if (form.elements[`${prefix}admission_no`]) form.elements[`${prefix}admission_no`].value = sib.admission_no || "";
          if (form.elements[`${prefix}class`]) form.elements[`${prefix}class`].value = sib.class || "";
        });
      }, 100);
    }

    // PREFILL LOGIN EMAIL (if API returns it)
    if (student.login_email) {
      setLoginEmail(student.login_email);
      if (form.elements["login_email"]) form.elements["login_email"].value = student.login_email;
    }

    // files won't be auto-filled for security; you can show file name in UI if needed
  };

  // manage sibling rows (add/remove)
  const addSiblingRow = (e) => {
    e.preventDefault();
    setSiblingIndices((prev) => [...prev, prev.length ? Math.max(...prev) + 1 : 0]);
  };
  const removeSiblingRow = (index) => {
    setSiblingIndices((prev) => prev.filter((i) => i !== index));
  };

  // Tag inputs handlers
  const handleLanguagesChange = (newTags) => setLanguages(newTags);
  const handleAllergiesChange = (newTags) => setAllergies(newTags);
  const handleMedicationsChange = (newTags) => setMedications(newTags);

  // Date pickers handlers (antd DatePicker)
  const handleAdmissionDateChange = (val) => setAdmissionDate(val);
  const handleDobChange = (val) => setDob(val);

  // file input handlers — replaced by typed validateFile + handlePhotoChange above

  // Validate credential fields before sending
  const validatePasswordFields = () => {
    if (!isEditMode) {
      // create mode: require loginEmail + password + confirm
      if (!loginEmail) {
        Swal.fire({ icon: "warning", title: "Missing email", text: "Login email is required for new student." });
        return false;
      }
      if (!password) {
        Swal.fire({ icon: "warning", title: "Missing password", text: "Password is required for new student." });
        return false;
      }
      if (password !== confirmPassword) {
        Swal.fire({ icon: "warning", title: "Password mismatch", text: "Password and Confirm Password must match." });
        return false;
      }
    } else {
      // edit mode: password optional but if provided must match confirm
      if (password && password !== confirmPassword) {
        Swal.fire({ icon: "warning", title: "Password mismatch", text: "Password and Confirm Password must match." });
        return false;
      }
      // loginEmail optional in edit
    }
    return true;
  };

  // Build FormData from form DOM + tag arrays + dynamic siblings
  const buildFormData = () => {
    const fd = new FormData();
    const form = formRef.current;
    if (!form) return fd;

    // Append primitive fields by name
    const formFields = [
      // Personal Info
      "academic_year",
      "admission_number",
      "student_id",
      "status",
      "first_name",
      "middle_name",
      "last_name",
      "grade",
      "section",
      "gender",
      "house",
      "religion",
      "primary_contact",
      "email",

      // Parents / Guardian
      "father_name",
      "father_email",
      "father_phone",
      "father_occupation",

      "mother_name",
      "mother_email",
      "mother_phone",
      "mother_occupation",

      "guardian_relation",
      "guardian_phone",
      "guardian_email",
      "guardian_occupation",
      "guardian_address",

      // Address - Current
      "current_address1",
      "current_address2",
      "current_city",
      "current_state",
      "current_zipcode",

      // Address - Permanent
      "permanent_address1",
      "permanent_address2",
      "permanent_city",
      "permanent_state",
      "permanent_zipcode",

      // Previous School
      "previous_school_name",
      "previous_school_phone",
      "previous_school_address",

      // Bank Info
      "bank_name",
      "account_number",
      "routing_number",

      // Other
      "other_info",
    ];

    formFields.forEach((name) => {
      if (form.elements[name]) {
        const val = form.elements[name].value;
        if (val !== undefined) fd.append(name, val);
      }
    });

    // Dates: convert to MM-DD-YYYY
    // ✅ Correct format for Django
    if (admissionDate) {
      fd.append("admission_date", dayjs(admissionDate).format("YYYY-MM-DD"));
    }

    if (dob) {
      fd.append("date_of_birth", dayjs(dob).format("YYYY-MM-DD"));
    }

    // Files — use validated state values
    if (photoFile) fd.append("photo", photoFile);
    if (proofOfResidencyFile) fd.append("medical_report_1", proofOfResidencyFile);
    if (medicalDocumentFile) fd.append("medical_report_2", medicalDocumentFile);
    if (transferCertificateFile) fd.append("medical_report_3", transferCertificateFile);

    // Tags: languages, allergies, medications — send as JSON strings
    fd.append("languages", JSON.stringify(languages || []));
    fd.append("allergies", JSON.stringify(allergies || []));
    fd.append("medications", JSON.stringify(medications || []));

    // Siblings: gather from DOM by naming convention sibling_<index>_name etc.
    const siblings = [];
    siblingIndices.forEach((idx) => {
      const prefix = `sibling_${idx}_`;
      const nameEl = form.elements[`${prefix}name`];
      const rollEl = form.elements[`${prefix}roll_no`];
      const admEl = form.elements[`${prefix}admission_no`];
      const classEl = form.elements[`${prefix}class`];
      if (nameEl || rollEl || admEl || classEl) {
        const s = {
          name: nameEl ? nameEl.value : "",
          roll_no: rollEl ? rollEl.value : "",
          admission_no: admEl ? admEl.value : "",
          class: classEl ? classEl.value : "",
        };
        // only push if at least one value present
        if (s.name || s.roll_no || s.admission_no || s.class) siblings.push(s);
      }
    });
    fd.append("siblings", JSON.stringify(siblings));

    // --- APPEND LOGIN CREDENTIALS ---
    if (loginEmail) fd.append("login_email", loginEmail);
    // Only send password if provided (required on create, optional on edit)
    if (password) fd.append("password", password);

    return fd;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate credentials before proceeding
    if (!validatePasswordFields()) return;

    const action = isEditMode ? "Update" : "Add";
    const confirmResult = await Swal.fire({
      title: `${action} student?`,
      text: `Do you want to ${action.toLowerCase()} this student record now?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: action,
    });

    if (!confirmResult.isConfirmed) return;

    const fd = buildFormData();

    // Debug: log all FormData keys being sent
    console.log("Submitting FormData fields:");
    for (const [key, value] of fd.entries()) {
      console.log(`  ${key}:`, value);
    }

    try {
      if (isEditMode) {
        // DO NOT set Content-Type manually — let axios set it with the correct multipart boundary
        await axiosInstance.put(`update-student/${id}/`, fd);
        Swal.fire({ icon: "success", title: "Updated", text: "Student updated successfully." });
      } else {
        // DO NOT set Content-Type manually — let axios set it with the correct multipart boundary
        await axiosInstance.post("add-student/", fd);
        Swal.fire({ icon: "success", title: "Added", text: "Student added successfully." });
      }
      navigate(routes.studentList);
    } catch (err: any) {
      console.error("Submit error:", err);
      console.error("Response data:", err?.response?.data);

      // Show the full backend error — could be an object with field errors
      const responseData = err?.response?.data;
      let msg = "Unexpected error";
      if (typeof responseData === "string") {
        msg = responseData;
      } else if (responseData?.detail) {
        msg = responseData.detail;
      } else if (typeof responseData === "object" && responseData !== null) {
        // Django REST Framework returns field errors as { field: ["error msg"] }
        msg = Object.entries(responseData)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
          .join("\n");
      } else {
        msg = err?.message || "Unexpected error";
      }

      Swal.fire({ icon: "error", title: `Error ${err?.response?.status || ""}`, text: msg });
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content content-two">
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="mb-1">{isEditMode ? "Edit" : "Add"} Student</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={routes.studentList}>Students</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {isEditMode ? "Edit" : "Add"} Student
                  </li>
                </ol>
              </nav>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <form ref={formRef} onSubmit={handleSubmit}>
                {/* --- Personal Information --- */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-info-square-rounded fs-16" />
                      </span>
                      <h4 className="text-dark">Personal Information</h4>
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    {/* profile upload */}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center flex-wrap row-gap-3 mb-3">
                          <div className="d-flex align-items-center justify-content-center avatar avatar-xxl border border-dashed me-2 flex-shrink-0 text-dark frames overflow-hidden">
                            {photoPreview ? (
                              <img
                                src={photoPreview}
                                alt="Preview"
                                style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px" }}
                              />
                            ) : (
                              <i className="ti ti-photo-plus fs-16" />
                            )}
                          </div>
                          <div className="profile-upload">
                            <div className="profile-uploader d-flex align-items-center">
                              <div className="drag-upload-btn mb-3">
                                Upload
                                <input
                                  name="photo"
                                  type="file"
                                  accept="image/jpeg,image/png,image/jpg"
                                  className="form-control image-sign"
                                  onChange={handlePhotoChange}
                                />
                              </div>
                              <button
                                type="button"
                                className="btn btn-primary mb-3 ms-2"
                                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                              >
                                Remove
                              </button>
                            </div>
                            <p className="fs-12">Upload image size 4MB, Format JPG, PNG</p>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                      <div className="d-flex align-items-center flex-wrap row-gap-3 mb-3">

                        {/* Preview / File Name Box */}
                        <div className="d-flex align-items-center justify-content-center avatar avatar-xxl border border-dashed me-2 flex-shrink-0 text-dark frames overflow-hidden">

                          {proofOfResidencyFile ? (
                            <div className="text-center p-2">
                              <i className="ti ti-file fs-24 text-primary" />
                              <p
                                style={{
                                  fontSize: "12px",
                                  marginTop: "6px",
                                  wordBreak: "break-all"
                                }}
                              >
                                {proofOfResidencyFile.name}
                              </p>
                            </div>
                          ) : (
                            <i className="ti ti-file-upload fs-16" />
                          )}

                        </div>

                        {/* Upload Section */}
                        <div className="profile-upload">

                          <div className="profile-uploader d-flex align-items-center">

                            <div className="drag-upload-btn mb-3">
                              Upload

                              <input
                                name="medical_report_1"
                                type="file"
                                accept="application/pdf"
                                className="form-control"
                                onChange={handleProofOfResidencyChange}
                              />

                            </div>

                            <button
                              type="button"
                              className="btn btn-primary mb-3 ms-2"
                              onClick={() => {
                                setProofOfResidencyFile(null);
                                setProofOfResidencyPreview(null);
                              }}
                            >
                              Remove
                            </button>

                          </div>

                          <p className="fs-12">
                            Upload Proof of Residency, Format PDF (Max 5MB)
                          </p>

                        </div>

                      </div>
                    </div>
                    </div>

                    <div className="row row-cols-xxl-5 row-cols-md-6">
                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Academic Year</label>
                          <select name="academic_year" className="form-select">
                            <option value="2023-2024">2023-2024</option>
                            <option value="2024-2025">2024-2025</option>
                            <option value="2025-2026">2025-2026</option>
                            <option value="2026-2027">2026-2027</option>
                            <option value="2027-2028">2027-2028</option>
                          </select>
                        </div>

                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Admission Number</label>
                          <input name="admission_number" type="text" className="form-control" defaultValue={isEditMode ? undefined : ""} />
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Admission Date</label>
                          <div className="input-icon position-relative">
                            <DatePicker
                              name="admission_date_picker"
                              className="form-control datetimepicker"
                              format="MM-DD-YYYY"
                              value={admissionDate}
                              onChange={handleAdmissionDateChange}
                              placeholder="Select Date"
                            />
                            <input type="hidden" name="admission_date" value={admissionDate ? dayjs(admissionDate).format("MM-DD-YYYY") : ""} />
                            <span className="input-icon-addon">
                              <i className="ti ti-calendar" />
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Student Id</label>
                          <input name="student_id" type="text" className="form-control" defaultValue={isEditMode ? undefined : ""} />
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Status</label>
                          <select name="status" className="form-select">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">First Name</label>
                          <input name="first_name" type="text" className="form-control" defaultValue={isEditMode ? undefined : ""} />
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">M.I</label>
                          <input name="middle_name" type="text" className="form-control" defaultValue={isEditMode ? undefined : ""} />
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Last Name</label>
                          <input name="last_name" type="text" className="form-control" defaultValue={isEditMode ? undefined : ""} />
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Grade level</label>
                          <select name="grade" className="form-select">
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
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Section</label>
                          <select name="section" className="form-select">
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Gender</label>
                          <select name="gender" className="form-select">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Date of Birth</label>
                          <div className="input-icon position-relative">
                            <DatePicker name="dob_picker" className="form-control datetimepicker" format="MM-DD-YYYY" value={dob} onChange={handleDobChange} placeholder="Select Date" />
                            <input type="hidden" name="date_of_birth" value={dob ? dayjs(dob).format("MM-DD-YYYY") : ""} />
                            <span className="input-icon-addon">
                              <i className="ti ti-calendar" />
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">House</label>
                          <select name="house" className="form-select">
                            <option value="Red">Red</option>
                            <option value="Blue">Blue</option>
                            <option value="Green">Green</option>
                            <option value="Yellow">Yellow</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Religion</label>
                          <select name="religion" className="form-select">
                            <option value="Islam">Islam</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Christian">Christian</option>
                            <option value="Sikh">Sikh</option>
                            <option value="Buddhist">Buddhist</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Primary Contact Number</label>
                          <input name="primary_contact" type="text" className="form-control" defaultValue={isEditMode ? undefined : ""} />
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Email Address</label>
                          <input name="email" type="email" className="form-control" defaultValue={isEditMode ? undefined : ""} />
                        </div>
                      </div>

                      <div className="col-xxl col-xl-3 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Language Known</label>
                          <TagInput initialTags={languages} onTagsChange={handleLanguagesChange} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Parents & Guardian --- */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-user-shield fs-16" />
                      </span>
                      <h4 className="text-dark">Parents &amp; Guardian Information</h4>
                    </div>
                  </div>

                  <div className="card-body pb-0">
                    {/* Father's info */}
                    <div className="border-bottom mb-3">
                      <h5 className="mb-3">Father’s Info</h5>
                      <div className="row">
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Father Name</label>
                            <input name="father_name" type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input name="father_email" type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <input name="father_phone" type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Father Occupation</label>
                            <input name="father_occupation" type="text" className="form-control" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mother's info */}
                    <div className="border-bottom mb-3">
                      <h5 className="mb-3">Mother’s Info</h5>
                      <div className="row">
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Mother Name</label>
                            <input name="mother_name" type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input name="mother_email" type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <input name="mother_phone" type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Mother Occupation</label>
                            <input name="mother_occupation" type="text" className="form-control" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guardian */}
                    <div>
                      <h5 className="mb-3">Guardian Details</h5>
                      <div className="row">
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Guardian Name</label>
                            <input name="guardian_name" type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Guardian Relation</label>
                            <input name="guardian_relation" type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <input name="guardian_phone" type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input name="guardian_email" type="email" className="form-control" />
                          </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Occupation</label>
                            <input name="guardian_occupation" type="text" className="form-control" />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Address</label>
                            <input name="guardian_address" type="text" className="form-control" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- Siblings (dynamic) --- */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-users fs-16" />
                      </span>
                      <h4 className="text-dark">Sibilings</h4>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="addsibling-info">
                      <div className="row">
                        <div className="col-md-12 mb-2">
                          <label className="form-label">Sibling Info</label>
                        </div>

                        {siblingIndices.map((idx) => (
                          <div key={idx} className="col-lg-12" data-sibling-index={idx}>
                            <div className="row">

                              {/* Name */}
                              <div className="col-lg-3 col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Name</label>
                                  <input
                                    type="text"
                                    name={`sibling_${idx}_name`}
                                    className="form-control"
                                    placeholder="Enter Name"
                                  />
                                </div>
                              </div>

                              {/* Student ID */}
                              <div className="col-lg-3 col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Student Id</label>
                                  <input
                                    type="text"
                                    name={`sibling_${idx}_roll_no`}
                                    className="form-control"
                                    placeholder="Enter Student ID"
                                  />
                                </div>
                              </div>

                              {/* Admission No */}
                              <div className="col-lg-3 col-md-6">
                                <div className="mb-3">
                                  <label className="form-label">Admission No</label>
                                  <input
                                    type="text"
                                    name={`sibling_${idx}_admission_no`}
                                    className="form-control"
                                    placeholder="Enter Admission No"
                                  />
                                </div>
                              </div>

                              {/* Grade level */}
                              <div className="col-lg-3 col-md-6">
                                <div className="mb-3 d-flex align-items-center">
                                  <div className="w-100">
                                    <label className="form-label">Grade level</label>
                                    <input
                                      type="text"
                                      name={`sibling_${idx}_class`}
                                      className="form-control"
                                      placeholder="Enter Grade level"
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

                {/* --- Address --- */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-map fs-16" />
                      </span>
                      <h4 className="text-dark">Address</h4>
                    </div>
                  </div>

                  <div className="card-body pb-1">

                    {/* Current Address */}
                    <h5 className="text-dark mb-3">Current Address</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Address 1</label>
                          <input name="current_address1" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Address 2</label>
                          <input name="current_address2" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <input name="current_city" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <input name="current_state" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Zip Code</label>
                          <input name="current_zipcode" type="text" className="form-control" />
                        </div>
                      </div>
                    </div>

                    <hr className="my-4" />

                    {/* Permanent Address */}
                    <h5 className="text-dark mb-3">Permanent Address</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Address 1</label>
                          <input name="permanent_address1" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Address 2</label>
                          <input name="permanent_address2" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">City</label>
                          <input name="permanent_city" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">State</label>
                          <input name="permanent_state" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Zip Code</label>
                          <input name="permanent_zipcode" type="text" className="form-control" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* --- Medical History --- */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-medical-cross fs-16" />
                      </span>
                      <h4 className="text-dark">Medical History</h4>
                    </div>
                  </div>

                  <div className="card-body pb-1">

                    <div className="mb-3">
                      <label className="form-label">Allergies</label>
                      <input name="allergies" type="text" className="form-control" />
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Medical Document (PDF)</label>
                          <input
                            name="medical_report_2"
                            type="file"
                            accept="application/pdf"
                            className="form-control"
                            onChange={(e) => handleFileChange(e, setMedicalDocumentFile, "pdf")}
                          />
                          {medicalDocumentFile && (
                            <p className="fs-12 mt-1 text-muted">Selected: {medicalDocumentFile.name}</p>
                          )}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Transfer Certificate (PDF)</label>
                          <input
                            name="medical_report_3"
                            type="file"
                            accept="application/pdf"
                            className="form-control"
                            onChange={(e) => handleFileChange(e, setTransferCertificateFile, "pdf")}
                          />
                          {transferCertificateFile && (
                            <p className="fs-12 mt-1 text-muted">Selected: {transferCertificateFile.name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* --- Previous School --- */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-building fs-16" />
                      </span>
                      <h4 className="text-dark">Previous School Details</h4>
                    </div>
                  </div>

                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">School Name</label>
                          <input name="previous_school_name" type="text" className="form-control" />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Address</label>
                          <input name="previous_school_address" type="text" className="form-control" />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Phone Number</label>
                          <input name="previous_school_phone" type="text" className="form-control" />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* --- Other Details --- */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-building-bank fs-16" />
                      </span>
                      <h4 className="text-dark">Bank Details</h4>
                    </div>
                  </div>

                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Bank Name</label>
                          <input name="bank_name" type="text" className="form-control" />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Account Number</label>
                          <input name="account_number" type="text" className="form-control" />
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="mb-3">
                          <label className="form-label">Routing Number</label>
                          <input name="routing_number" type="text" className="form-control" />
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="mb-3">
                          <label className="form-label">Other Information</label>
                          <textarea name="other_info" className="form-control" rows={3} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- LOGIN CREDENTIALS (NEW) --- */}
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex align-items-center">
                      <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                        <i className="ti ti-lock fs-16" />
                      </span>
                      <h4 className="text-dark">Login Credentials</h4>
                    </div>
                  </div>
                  <div className="card-body pb-1">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Login Email</label>
                          <input
                            type="email"
                            name="login_email"
                            className="form-control"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required={!isEditMode} // required for create
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">New Password</label>
                          <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isEditMode ? "Leave blank to keep existing password" : ""}
                            required={!isEditMode}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            name="confirm_password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={isEditMode ? "Leave blank to keep existing password" : ""}
                            required={!isEditMode}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* submit buttons */}
                <div className="text-end mb-5">
                  <button type="button" className="btn btn-light me-3" onClick={() => navigate(routes.studentList)}>
                    Cancel
                  </button>

                  <button type="submit" className="btn btn-primary">
                    {isEditMode ? "Update Student" : "Add Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddStudent;
