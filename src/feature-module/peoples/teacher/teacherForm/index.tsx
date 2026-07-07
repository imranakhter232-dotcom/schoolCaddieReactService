import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import axiosInstance from "../../../../core/api/axiosInstance"; // Make sure this path is correct
import { all_routes } from "../../../router/all_routes";
import {
  Marital,
  gender,
  status,
  // Import other options if needed
} from "../../../../core/common/selectoption/selectoption";

import CommonSelect from "../../../../core/common/commonSelect";
import TagInput from "../../../../core/common/Taginput";

const TeacherForm = () => {
  const routes = all_routes;
  const { id } = useParams(); // Get ID from URL for edit mode
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const formRef = useRef(null);

  // --- State Management ---
  // Tag inputs
  const [languages, setLanguages] = useState([]);
  
  // Multi-select
  const [subjects, setSubjects] = useState([]);

  // Date pickers
  const [dateOfJoining, setDateOfJoining] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState(null);

  // File states (optional, for tracking)
  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [joiningLetterFile, setJoiningLetterFile] = useState(null);
  const [idProofFile, setIdProofFile] = useState(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --- Data Fetching for Edit Mode ---
  useEffect(() => {
    if (isEditMode) {
      const fetchTeacher = async () => {
        try {
          // Attempt to get the single teacher record
          // Using the "get-teachers/" list endpoint and filtering
          const resp = await axiosInstance.get("get-teachers/");
          const teacher = Array.isArray(resp.data)
            ? resp.data.find((t) => String(t.id) === String(id) || String(t.pk) === String(id))
            : null;

          if (!teacher) {
            Swal.fire({
              icon: "warning",
              title: "Not found",
              text: "Teacher not found to edit. You'll be redirected to the list.",
            });
            navigate(routes.teacherList);
            return;
          }
          fillForm(teacher);
        } catch (error) {
          console.error("Error fetching teacher for edit:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load teacher data for editing.",
          });
        }
      };
      fetchTeacher();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode, navigate, routes.teacherList]);

  // --- Form Population ---
  const fillForm = (teacher) => {
    console.log("Filling form with teacher data:", teacher);
    if (!formRef.current) return;
    const form = formRef.current;

    // List of simple fields to auto-fill
    const simpleFields = [
      'teacher_id', 'first_name', 'middle_name', 'last_name', 'grade',
      'gender', 'primary_contact', 'email', 'marital_status', 'qualification',
      'work_experience', 'status',
      'notes', 'medical_leaves', 'vacation_leaves', 'maternity_leaves', 'sick_leaves'
    ];

    simpleFields.forEach((key) => {
      try {
        if (form.elements[key]) {
          form.elements[key].value =
            teacher[key] !== undefined && teacher[key] !== null
              ? teacher[key]
              : "";
        }
      } catch (e) {
        console.warn(`Could not fill form field: ${key}`, e);
      }
    });

    // Fill address fields separately (they might be combined in the API)
    if (teacher.address && form.elements['current_address1']) {
      form.elements['current_address1'].value = teacher.address;
    }
    if (teacher.permanent_address && form.elements['permanent_address1']) {
      form.elements['permanent_address1'].value = teacher.permanent_address;
    }

    // Dates
    if (teacher.date_of_joining) setDateOfJoining(dayjs(teacher.date_of_joining));
    if (teacher.date_of_birth) setDateOfBirth(dayjs(teacher.date_of_birth));

    // JSON/Array fields - parse if they're strings
    try {
      const parsedLanguages = typeof teacher.languages === 'string' 
        ? JSON.parse(teacher.languages) 
        : teacher.languages;
      if (parsedLanguages && Array.isArray(parsedLanguages)) {
        setLanguages(parsedLanguages);
      }
    } catch (e) {
      console.warn("Could not parse languages:", e);
      if (Array.isArray(teacher.languages)) setLanguages(teacher.languages);
    }

    try {
      const parsedSubjects = typeof teacher.subjects === 'string' 
        ? JSON.parse(teacher.subjects) 
        : teacher.subjects;
      if (parsedSubjects && Array.isArray(parsedSubjects)) {
        setSubjects(parsedSubjects);
      }
    } catch (e) {
      console.warn("Could not parse subjects:", e);
      if (Array.isArray(teacher.subjects)) setSubjects(teacher.subjects);
    }

    // credentials (if your API returns the login email)
    if (teacher.login_email) setLoginEmail(teacher.login_email);

    // If teacher has files or file URLs, you might want to set file preview states here
    // e.g., setPhotoFile(...) if you want to show file name or preview (not shown here).
  };

  // --- Event Handlers ---
  const handleFileChange = (e, setter) => {
    const f = e.target.files && e.target.files[0];
    console.log("File selected:", f ? f.name : "No file");
    setter(f || null);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
  setSubjects(selected);
};


  // --- Credentials helpers ---
  const validatePasswordFields = () => {
    // On create: loginEmail + password + confirmPassword required
    if (!isEditMode) {
      if (!loginEmail) {
        Swal.fire({ icon: "warning", title: "Missing email", text: "Login email is required for new teacher." });
        return false;
      }
      if (!password) {
        Swal.fire({ icon: "warning", title: "Missing password", text: "Password is required for new teacher." });
        return false;
      }
      if (password !== confirmPassword) {
        Swal.fire({ icon: "warning", title: "Password mismatch", text: "Password and Confirm Password must match." });
        return false;
      }
    } else {
      // Edit: if password provided, require confirm match
      if (password && password !== confirmPassword) {
        Swal.fire({ icon: "warning", title: "Password mismatch", text: "Password and Confirm Password must match." });
        return false;
      }
      // loginEmail optional on edit but if provided it should have value (no further checks here)
    }
    return true;
  };

  /**
   * Append credentials to FormData.
   * - For create: append login_email and password (password required).
   * - For edit: append login_email if present; append password only if user provided a new one.
   */
  const appendCredentialsToFormData = (fd) => {
    // login email: send if provided (for create it's required and validated earlier)
    if (loginEmail) fd.append("login_email", loginEmail);

    // password: send only if provided (for create it's required; for edit optional)
    if (password) fd.append("password", password);

    return fd;
  };

  // --- Form Data Construction ---
  const buildFormData = () => {
    const fd = new FormData();
    const form = formRef.current;
    if (!form) return fd;

    // 1. Append simple fields
    const formFields = [
      'teacher_id', 'first_name', 'middle_name', 'last_name', 'grade',
      'gender', 'primary_contact', 'email', 'marital_status', 'qualification',
      'work_experience', 'status',
      'notes', 'medical_leaves', 'vacation_leaves', 'maternity_leaves', 'sick_leaves'
    ];
    
    formFields.forEach((name) => {
      if (form.elements[name]) {
        const val = form.elements[name].value;
        if (val !== undefined && val !== null && val !== '') {
          fd.append(name, val);
        }
      }
    });

    // 2. Build address fields from separate inputs
    const currentAddr = [
      form.elements['current_address1']?.value,
      form.elements['current_address2']?.value,
      form.elements['current_city']?.value,
      form.elements['current_state']?.value,
      form.elements['current_zipcode']?.value
    ].filter(Boolean).join(', ');
    
    if (currentAddr) {
      fd.append('address', currentAddr);
    }

    const permanentAddr = [
      form.elements['permanent_address1']?.value,
      form.elements['permanent_address2']?.value,
      form.elements['permanent_city']?.value,
      form.elements['permanent_state']?.value,
      form.elements['permanent_zipcode']?.value
    ].filter(Boolean).join(', ');
    
    if (permanentAddr) {
      fd.append('permanent_address', permanentAddr);
    }

    // 3. Append dates (YYYY-MM-DD format for backend)
    if (dateOfJoining) {
      fd.append("date_of_joining", dayjs(dateOfJoining).format("YYYY-MM-DD"));
    }
    if (dateOfBirth) {
      fd.append("date_of_birth", dayjs(dateOfBirth).format("YYYY-MM-DD"));
    }

    // 4. Append files with correct field names matching API
    if (photoFile) {
      console.log("Appending photo:", photoFile.name);
      fd.append("photo", photoFile, photoFile.name);
    }
    if (resumeFile) {
      console.log("Appending resume:", resumeFile.name);
      fd.append("resume", resumeFile, resumeFile.name);
    }
    if (joiningLetterFile) {
      console.log("Appending joining_letter:", joiningLetterFile.name);
      fd.append("joining_letter", joiningLetterFile, joiningLetterFile.name);
    }
    if (idProofFile) {
      console.log("Appending id_upload:", idProofFile.name);
      fd.append("id_upload", idProofFile, idProofFile.name); // Changed from id_proof to id_upload
    }
    
    // 5. Append JSON array fields
    if (languages && languages.length > 0) {
      fd.append("languages", JSON.stringify(languages));
    }
    if (subjects && subjects.length > 0) {
      fd.append("subjects", JSON.stringify(subjects));
    }

    // 6. Append credentials
    appendCredentialsToFormData(fd);

    return fd;
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords / credentials logic
    if (!validatePasswordFields()) return;

    const action = isEditMode ? "Update" : "Add";
    const confirmResult = await Swal.fire({
      title: `${action} Teacher?`,
      text: `Do you want to ${action.toLowerCase()} this teacher record?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: action,
    });

    if (!confirmResult.isConfirmed) return;

    const fd = buildFormData();

    // Debug: Log FormData contents
    console.log("=== FormData Contents ===");
    for (let pair of fd.entries()) {
      console.log(pair[0], pair[1]);
    }
    console.log("========================");

    try {
      if (isEditMode) {
        // Update
        await axiosInstance.put(`update-teacher/${id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({ icon: "success", title: "Updated", text: "Teacher updated successfully." });
      } else {
        // Add
        await axiosInstance.post("add-teacher/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire({ icon: "success", title: "Added", text: "Teacher added successfully." });
      }
      navigate(routes.teacherList); // Redirect to list on success
    } catch (err) {
      console.error("Submit error: ", err);
      const msg = err?.response?.data?.detail || err?.message || "An unexpected error occurred.";
      Swal.fire({ icon: "error", title: "Error", text: String(msg) });
    }
  };

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content content-two">
          {/* Page Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="mb-1">{isEditMode ? "Edit" : "Add"} Teacher</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={routes.teacherList}>Teacher</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {isEditMode ? "Edit" : "Add"} Teacher
                  </li>
                </ol>
              </nav>
            </div>
          </div>
          {/* /Page Header */}
          <div className="row">
            <div className="col-md-12">
              {/* Add ref and onSubmit to the form */}
              <form ref={formRef} onSubmit={handleSubmit}>
                <>
                  {/* Personal Information */}
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
                      <div className="row">
                        <div className="col-md-12">
                          <div className="d-flex align-items-center flex-wrap row-gap-3 mb-3">
                            <div className="d-flex align-items-center justify-content-center avatar avatar-xxl border border-dashed me-2 flex-shrink-0 text-dark frames">
                              <i className="ti ti-photo-plus fs-16" />
                            </div>
                            <div className="profile-upload">
                              <div className="profile-uploader d-flex align-items-center">
                                <div className="drag-upload-btn mb-3">
                                  Upload
                                  <input
                                    type="file"
                                    name="photo"
                                    className="form-control image-sign"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, setPhotoFile)}
                                  />
                                </div>
                                <Link
                                  to="#"
                                  className="btn btn-primary mb-3"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if(formRef.current) formRef.current.elements['photo'].value = '';
                                    setPhotoFile(null);
                                  }}
                                >
                                  Remove
                                </Link>
                              </div>
                              <p className="fs-12">
                                Upload image size 4MB, Format JPG, PNG, SVG
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row row-cols-xxl-5 row-cols-md-6">
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Teacher ID</label>
                            <input
                              type="text"
                              name="teacher_id" // Add name
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">First Name</label>
                            <input
                              type="text"
                              name="first_name" // Add name
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">M.I</label>
                            <input
                              type="text"
                              name="middle_name" // Add name
                              className="form-control"
                            />
                          </div>
                        </div>

                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Last Name</label>
                            <input 
                              type="text" 
                              name="last_name" // Add name
                              className="form-control" 
                            />
                          </div>
                        </div>
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Grade level</label>
                            <select name="grade" className="form-select"> {/* Add name */}
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
                            <label className="form-label">Subject</label>
                            <select
                              name="subjects" // Add name
                              className="form-select subject-multiselect"
                              multiple
                              value={subjects} // Control value
                              onChange={handleSubjectChange} // Add onChange
                            >
                              <option value="Maths">Maths</option>
                              <option value="Science">Science</option>
                              <option value="English">English</option>
                              <option value="Social Studies">Social Studies</option>
                              <option value="Computer">Computer</option>
                              <option value="Hindi">Hindi</option>
                              <option value="Urdu">Urdu</option>
                              <option value="Arabic">Arabic</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Gender</label>
                            <select name="gender" className="form-select"> {/* Add name */}
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Primary Contact Number
                            </label>
                            <input
                              type="text"
                              name="primary_contact" // Add name
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Email Address</label>
                            <input
                              type="email"
                              name="email" // Add name
                              className="form-control"
                            />
                          </div>
                        </div>
                        
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Date of Joining
                            </label>
                            <div className="input-icon position-relative">
                              <DatePicker
                                className="form-control datetimepicker"
                                format="MM-DD-YYYY"
                                value={dateOfJoining}
                                onChange={setDateOfJoining}
                                placeholder="Select Date"
                              />
                              {/* Hidden input to hold the formatted date for FormData */}
                              <input 
                                type="hidden" 
                                name="date_of_joining" 
                                value={dateOfJoining ? dayjs(dateOfJoining).format("YYYY-MM-DD") : ""}                              />
                              <span className="input-icon-addon">
                                <i className="ti ti-calendar" />
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Date of Birth</label>
                            <div className="input-icon position-relative">
                              <DatePicker
                                className="form-control datetimepicker"
                                format="MM-DD-YYYY"
                                value={dateOfBirth}
                                onChange={setDateOfBirth}
                                placeholder="Select Date"
                              />
                              {/* Hidden input to hold the formatted date for FormData */}
                              <input 
                                type="hidden" 
                                name="date_of_birth" 
                                value={dateOfBirth ? dayjs(dateOfBirth).format("YYYY-MM-DD") : ""}
                              />
                              <span className="input-icon-addon">
                                <i className="ti ti-calendar" />
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Marital Status</label>
                            {/* Assuming CommonSelect forwards 'name' or we read it by name */}
                            {/* For simplicity, let's use a standard select */}
                            <select name="marital_status" className="form-select">
                              <option value="">Select Status</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Language Known</label>
                            <TagInput
                              initialTags={languages} // Use state
                              onTagsChange={setLanguages} // Update state
                            />
                          </div>
                        </div>
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Qualification</label>
                            <input
                              type="text"
                              name="qualification" // Add name
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="col-xxl col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Work Experience
                            </label>
                            <input
                              type="text"
                              name="work_experience" // Add name
                              className="form-control"
                            />
                          </div>
                        </div>
                        

                        
                        
                        
                        <div className="col-xxl-3 col-xl-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Status</label>
                            <select name="status" className="form-select"> {/* Add name */}
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="Suspended">Suspended</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-xxl-12 col-xl-12">
                          <div className="mb-3">
                            <label className="form-label">Notes</label>
                            <textarea
                              name="notes" // Add name
                              className="form-control"
                              placeholder="Other Information"
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Personal Information */}
                </>

                <>


                {/* Address Section */}
<div className="col-xxl-12 col-xl-12">
  <div className="card mt-3">
    <div className="card-header bg-light">
      <h4 className="text-dark">Address Information</h4>
    </div>

    <div className="card-body pb-1">
      {/* Current Address */}
      <h5 className="text-dark mb-3">Current Address</h5>
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Address 1</label>
            <input name="current_address1" className="form-control" />
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Address 2</label>
            <input name="current_address2" className="form-control" />
          </div>
        </div>

        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">City</label>
            <input name="current_city" className="form-control" />
          </div>
        </div>

        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">State</label>
            <input name="current_state" className="form-control" />
          </div>
        </div>

        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">Zip Code</label>
            <input name="current_zipcode" className="form-control" />
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
            <input name="permanent_address1" className="form-control" />
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Address 2</label>
            <input name="permanent_address2" className="form-control" />
          </div>
        </div>

        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">City</label>
            <input name="permanent_city" className="form-control" />
          </div>
        </div>

        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">State</label>
            <input name="permanent_state" className="form-control" />
          </div>
        </div>

        <div className="col-md-4">
          <div className="mb-3">
            <label className="form-label">Zip Code</label>
            <input name="permanent_zipcode" className="form-control" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

                  
                  {/* Leaves */}
                  <div className="card">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                          <i className="ti ti-users fs-16" />
                        </span>
                        <h4 className="text-dark">Time Off</h4>
                      </div>
                    </div>
                    <div className="card-body pb-1">
                      <div className="row">
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Medical Leaves</label>
                            <input
                              type="number" // Use number
                              name="medical_leaves" // Add name
                              className="form-control"
                              defaultValue={0}
                            />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Vacation leave</label>
                            <input
                              type="number"
                              name="vacation_leaves" // Add name
                              className="form-control"
                              defaultValue={0}
                            />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Maternity Leaves
                            </label>
                            <input
                              type="number"
                              name="maternity_leaves" // Add name
                              className="form-control"
                              defaultValue={0}
                            />
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Sick Leaves</label>
                            <input
                              type="number"
                              name="sick_leaves" // Add name
                              className="form-control"
                              defaultValue={0}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Leaves */}
                  
                
                  {/* Documents */}
                  <div className="card">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                          <i className="ti ti-file fs-16" />
                        </span>
                        <h4 className="text-dark">Documents</h4>
                      </div>
                    </div>
                    <div className="card-body pb-1">
                      <div className="row">
                        <div className="col-lg-4">
                          <div className="mb-2">
                            <div className="mb-3">
                              <label className="form-label">
                                Upload Resume
                              </label>
                              <p>
                                Upload image size of 4MB, Accepted Format PDF
                              </p>
                            </div>
                            <div className="d-flex align-items-center flex-wrap">
                              <div className="btn btn-primary drag-upload-btn mb-2 me-2">
                                <i className="ti ti-file-upload me-1" />
                                Change
                                <input
                                  type="file"
                                  name="resume"
                                  className="form-control image_sign"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => handleFileChange(e, setResumeFile)}
                                />
                              </div>
                              <p className="mb-2">{resumeFile ? resumeFile.name : "Resume.pdf"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="mb-2">
                            <div className="mb-3">
                              <label className="form-label">
                                Upload Joining Letter
                              </label>
                              <p>
                                Upload image size of 4MB, Accepted Format PDF
                              </p>
                            </div>
                            <div className="d-flex align-items-center flex-wrap">
                              <div className="btn btn-primary drag-upload-btn mb-2 me-2">
                                <i className="ti ti-file-upload me-1" />
                                Upload Document
                                <input
                                  type="file"
                                  name="joining_letter"
                                  className="form-control image_sign"
                                  accept=".pdf,.doc,.docx"
                                  onChange={(e) => handleFileChange(e, setJoiningLetterFile)}
                                />
                              </div>
                              <p className="mb-2">{joiningLetterFile ? joiningLetterFile.name : "JoiningLetter.pdf"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="col-lg-4">
                          <div className="mb-2">
                            <div className="mb-3">
                              <label className="form-label">
                                Upload ID
                              </label>
                              <p>
                                Upload Id Upload , Accepted Format PDF
                              </p>
                            </div>
                            <div className="d-flex align-items-center flex-wrap">
                              <div className="btn btn-primary drag-upload-btn mb-2 me-2">
                                <i className="ti ti-file-upload me-1" />
                                Upload Id Upload 
                                <input
                                  type="file"
                                  name="id_upload"
                                  className="form-control image_sign"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onChange={(e) => handleFileChange(e, setIdProofFile)}
                                />
                              </div>
                              <p className="mb-2">{idProofFile ? idProofFile.name : "IdUpload.pdf"}</p>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                  {/* /Documents */}
                </>

                {/* Login Credentials */}
<div className="card">
  <div className="card-header bg-light">
    <h4 className="text-dark">Login Credentials</h4>
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
            required={!isEditMode} // optional: require on create, optional on edit
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
            required={!isEditMode} // required on create
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


                {/* Submit Buttons */}
                <div className="text-end mb-4">
                  <button 
                    type="button" 
                    className="btn btn-light me-3"
                    onClick={() => navigate(routes.teacherList)} // Add navigation
                  >
                    Cancel
                  </button>
                  {/* Change Link to button type="submit" */}
                  <button type="submit" className="btn btn-primary">
                    {isEditMode ? "Update Teacher" : "Add Teacher"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default TeacherForm;
