import React, { useEffect, useState } from "react";
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

const TeacherList = () => {
  const routes = all_routes;
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [editTeacherData, setEditTeacherData] = useState<any>(null);
  const [dateOfJoining, setDateOfJoining] = useState<any>(null);
  const [dateOfBirth, setDateOfBirth] = useState<any>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const roleId = localStorage.getItem("role_id");

  const parseSafe = (data: any, key: string) => {
    try {
      const item = data[key];
      return typeof item === "string" ? JSON.parse(item) : item || [];
    } catch {
      return data[key] || [];
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("get-teachers/");
      setTeachers(Array.isArray(res.data) ? res.data : [res.data]);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load teachers." });
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    try {
      await axiosInstance.delete(`delete-teacher/${id}/`);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      Swal.fire({ icon: "success", title: "Deleted", text: "Teacher deleted." });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete teacher." });
    }
  };

  const handleView = (teacher: any) => {
    // Navigate to teacher details page with teacher ID
    window.location.href = `${routes.teacherDetails}/${teacher.id}`;
  };

  const handleEdit = (teacher: any) => {
    // Navigate to teacher edit page with teacher ID
    window.location.href = `${routes.editTeacher}/${teacher.id}`;
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditTeacherData({ ...editTeacherData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setEditTeacherData({ ...editTeacherData, [field]: e.target.files?.[0] || null });
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeacherData?.id) return;
    try {
      const fd = new FormData();
      const fields = [
        "teacher_id","first_name","middle_name","last_name","grade","gender",
        "primary_contact","email","marital_status","qualification","work_experience",
        "address","permanent_address","status","notes",
        "medical_leaves","vacation_leaves","maternity_leaves","sick_leaves",
      ];
      fields.forEach((f) => {
        if (editTeacherData[f] !== undefined && editTeacherData[f] !== null)
          fd.append(f, editTeacherData[f]);
      });
      if (dateOfJoining) fd.append("date_of_joining", dayjs(dateOfJoining).format("YYYY-MM-DD"));
      if (dateOfBirth) fd.append("date_of_birth", dayjs(dateOfBirth).format("YYYY-MM-DD"));
      fd.append("languages", JSON.stringify(languages || []));
      fd.append("subjects", JSON.stringify(subjects || []));
      ["photo","resume","joining_letter","id_proof"].forEach((f) => {
        if (editTeacherData[f] instanceof File) fd.append(f, editTeacherData[f]);
      });
      const res = await axiosInstance.put(`update-teacher/${editTeacherData.id}/`, fd);
      setTeachers((prev) => prev.map((t) => (t.id === res.data.id ? res.data : t)));
      bootstrap.Modal.getInstance(document.getElementById("editTeacherModal")!)?.hide();
      Swal.fire({ icon: "success", title: "Updated", text: "Teacher updated successfully." });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to update teacher." });
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const columns = [
    {
      title: "Teacher",
      dataIndex: "first_name",
      render: (_: any, r: any) => (
        <div className="d-flex align-items-center">
          <div className="avatar avatar-md me-2 flex-shrink-0">
            {r.photo ? (
              <img src={mediaUrl(r.photo)} className="rounded-circle" alt={r.first_name}
                style={{ width: 40, height: 40, objectFit: "cover" }} />
            ) : (
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: 40, height: 40, fontSize: 14 }}>
                {r.first_name?.[0]}{r.last_name?.[0]}
              </div>
            )}
          </div>
          <div>
            <Link to={`/teacher/teacher-details/${r.id}`} className="text-dark fw-medium mb-0 d-block">
              {r.first_name} {r.middle_name} {r.last_name}
            </Link>
            <small className="text-muted">{r.teacher_id}</small>
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => (a.first_name || "").localeCompare(b.first_name || ""),
    },
    {
      title: "Grade",
      dataIndex: "grade",
      render: (t: string) => <span className="badge bg-light text-dark">{t || "—"}</span>,
      sorter: (a: any, b: any) => (a.grade || "").localeCompare(b.grade || ""),
    },
    {
      title: "Subjects",
      dataIndex: "subjects",
      render: (s: any, r: any) => parseSafe(r, "subjects").join(", ") || "—",
    },
    {
      title: "Contact",
      dataIndex: "primary_contact",
      render: (t: string) => t || "—",
    },
    {
      title: "Date of Join",
      dataIndex: "date_of_joining",
      render: (t: string) => t || "—",
      sorter: (a: any, b: any) => new Date(a.date_of_joining).getTime() - new Date(b.date_of_joining).getTime(),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (t: string) => (
        <span className={`badge ${t === "Active" ? "badge-soft-success" : "badge-soft-danger"} d-inline-flex align-items-center`}>
          <i className="ti ti-circle-filled fs-5 me-1" />{t || "—"}
        </span>
      ),
      sorter: (a: any, b: any) => (a.status || "").localeCompare(b.status || ""),
    },
    {
      title: "Action",
      render: (_: any, r: any) => (
        <div className="d-flex align-items-center gap-1">
          <button onClick={() => handleView(r)}
            className="btn btn-sm btn-outline-primary btn-icon rounded-circle" title="View">
            <i className="ti ti-eye" />
          </button>
          {roleId === "1" && (
            <>
              <button onClick={() => handleEdit(r)}
                className="btn btn-sm btn-outline-warning btn-icon rounded-circle" title="Edit">
                <i className="ti ti-edit" />
              </button>
              <button onClick={() => deleteTeacher(r.id)}
                className="btn btn-sm btn-outline-danger btn-icon rounded-circle" title="Delete">
                <i className="ti ti-trash" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const GRADE_OPTIONS = ["Nursery","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"];
  const SUBJECT_OPTIONS = ["Maths","Science","English","Social Studies","Computer","Hindi","Urdu","Arabic"];

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          {/* Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Teachers List</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item"><Link to={routes.adminDashboard}>Dashboard</Link></li>
                  <li className="breadcrumb-item">Teachers</li>
                  <li className="breadcrumb-item active">All Teachers</li>
                </ol>
              </nav>
            </div>
            {roleId === "1" && (
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                <Link to={routes.addTeacher} className="btn btn-primary d-flex align-items-center">
                  <i className="ti ti-square-rounded-plus me-2" />Add Teacher
                </Link>
              </div>
            )}
          </div>

          {/* Table Card */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Teachers List</h4>
            </div>
            <div className="card-body p-0 py-3">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" />
                </div>
              ) : (
                <Table columns={columns} dataSource={teachers} Selection={false} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── VIEW MODAL ── */}
      <div className="modal fade" id="viewTeacherModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Teacher Details — {selectedTeacher?.first_name} {selectedTeacher?.last_name}
              </h5>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              {selectedTeacher && (
                <div className="container-fluid">
                  {/* Profile banner */}
                  <div className="card border mb-4" style={{ background: "linear-gradient(135deg,#4a6fa5,#6b8cce)" }}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center flex-wrap gap-3">
                        <div className="avatar flex-shrink-0" style={{ width: 80, height: 80 }}>
                          {selectedTeacher.photo ? (
                            <img src={mediaUrl(selectedTeacher.photo)} className="rounded-circle border border-white border-3"
                              style={{ width: 80, height: 80, objectFit: "cover" }} alt="photo" />
                          ) : (
                            <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold fs-3"
                              style={{ width: 80, height: 80 }}>
                              {selectedTeacher.first_name?.[0]}{selectedTeacher.last_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="text-white">
                          <h4 className="text-white mb-1">{selectedTeacher.first_name} {selectedTeacher.middle_name} {selectedTeacher.last_name}</h4>
                          <p className="mb-1 opacity-75"><i className="ti ti-id-badge me-1" />{selectedTeacher.teacher_id}</p>
                          <p className="mb-0 opacity-75"><i className="ti ti-mail me-1" />{selectedTeacher.email}</p>
                        </div>
                        <div className="ms-auto">
                          <span className={`badge fs-6 ${selectedTeacher.status === "Active" ? "bg-success" : "bg-danger"}`}>
                            {selectedTeacher.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info cards row */}
                  <div className="row g-3 mb-4">
                    {[
                      { icon: "ti-school", label: "Grade", value: selectedTeacher.grade },
                      { icon: "ti-phone", label: "Contact", value: selectedTeacher.primary_contact },
                      { icon: "ti-calendar", label: "Date of Join", value: selectedTeacher.date_of_joining },
                      { icon: "ti-cake", label: "Date of Birth", value: selectedTeacher.date_of_birth },
                    ].map((item) => (
                      <div className="col-md-3 col-sm-6" key={item.label}>
                        <div className="card border h-100 mb-0">
                          <div className="card-body p-3 d-flex align-items-center gap-2">
                            <span className="avatar avatar-sm bg-light-300 rounded flex-shrink-0">
                              <i className={`ti ${item.icon} text-primary`} />
                            </span>
                            <div>
                              <small className="text-muted d-block">{item.label}</small>
                              <span className="fw-medium text-dark">{item.value || "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Personal Info */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light fw-semibold">
                      <i className="ti ti-user me-2 text-primary" />Personal Information
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-4"><small className="text-muted d-block">Gender</small><span>{selectedTeacher.gender || "—"}</span></div>
                        <div className="col-md-4"><small className="text-muted d-block">Marital Status</small><span>{selectedTeacher.marital_status || "—"}</span></div>
                        <div className="col-md-4"><small className="text-muted d-block">Qualification</small><span>{selectedTeacher.qualification || "—"}</span></div>
                        <div className="col-md-4"><small className="text-muted d-block">Work Experience</small><span>{selectedTeacher.work_experience || "—"}</span></div>
                        <div className="col-md-8"><small className="text-muted d-block">Subjects</small><span>{parseSafe(selectedTeacher, "subjects").join(", ") || "—"}</span></div>
                        <div className="col-md-12"><small className="text-muted d-block">Languages Known</small><span>{parseSafe(selectedTeacher, "languages").join(", ") || "—"}</span></div>
                        <div className="col-md-12"><small className="text-muted d-block">Notes</small><span>{selectedTeacher.notes || "—"}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="card border mb-4">
                    <div className="card-header bg-light fw-semibold">
                      <i className="ti ti-map-pin me-2 text-primary" />Address
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6"><small className="text-muted d-block">Current Address</small><span>{selectedTeacher.address || "—"}</span></div>
                        <div className="col-md-6"><small className="text-muted d-block">Permanent Address</small><span>{selectedTeacher.permanent_address || "—"}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Leaves */}
                  <div className="card border mb-0">
                    <div className="card-header bg-light fw-semibold">
                      <i className="ti ti-calendar-off me-2 text-primary" />Time Off / Leaves
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        {[
                          { label: "Medical", value: selectedTeacher.medical_leaves, color: "bg-info" },
                          { label: "Vacation", value: selectedTeacher.vacation_leaves, color: "bg-success" },
                          { label: "Maternity", value: selectedTeacher.maternity_leaves, color: "bg-warning" },
                          { label: "Sick", value: selectedTeacher.sick_leaves, color: "bg-danger" },
                        ].map((l) => (
                          <div className="col-md-3 col-6" key={l.label}>
                            <div className={`rounded p-3 text-white text-center ${l.color}`}>
                              <div className="fs-4 fw-bold">{l.value ?? 0}</div>
                              <small>{l.label} Leaves</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      <div className="modal fade" id="editTeacherModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Teacher — {editTeacherData?.first_name} {editTeacherData?.last_name}</h5>
              <button className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              {editTeacherData && (
                <form onSubmit={handleUpdateTeacher}>
                  {/* Personal Info */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <div className="d-flex align-items-center">
                        <span className="bg-white avatar avatar-sm me-2 text-gray-7 flex-shrink-0">
                          <i className="ti ti-info-square-rounded fs-16" />
                        </span>
                        <h4 className="text-dark mb-0">Personal Information</h4>
                      </div>
                    </div>
                    <div className="card-body">
                      {/* Photo */}
                      <div className="mb-3">
                        <label className="form-label">Photo</label>
                        <input type="file" className="form-control" onChange={(e) => handleFileChange(e, "photo")} />
                      </div>
                      <div className="row">
                        {[
                          { label: "Teacher ID", name: "teacher_id" },
                          { label: "First Name", name: "first_name" },
                          { label: "M.I", name: "middle_name" },
                          { label: "Last Name", name: "last_name" },
                          { label: "Primary Contact", name: "primary_contact" },
                          { label: "Email", name: "email", type: "email" },
                          { label: "Qualification", name: "qualification" },
                          { label: "Work Experience", name: "work_experience" },
                        ].map((f) => (
                          <div className="col-md-4 mb-3" key={f.name}>
                            <label className="form-label">{f.label}</label>
                            <input type={f.type || "text"} name={f.name} className="form-control"
                              value={editTeacherData[f.name] || ""} onChange={handleEditChange} />
                          </div>
                        ))}
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Grade</label>
                          <select name="grade" className="form-select" value={editTeacherData.grade || ""} onChange={handleEditChange}>
                            {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g === g && isNaN(Number(g)) ? g : `Class ${g}`}</option>)}
                          </select>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Gender</label>
                          <select name="gender" className="form-select" value={editTeacherData.gender || ""} onChange={handleEditChange}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Marital Status</label>
                          <select name="marital_status" className="form-select" value={editTeacherData.marital_status || ""} onChange={handleEditChange}>
                            <option value="">Select</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Status</label>
                          <select name="status" className="form-select" value={editTeacherData.status || "Active"} onChange={handleEditChange}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Date of Joining</label>
                          <DatePicker className="form-control" format="MM-DD-YYYY" value={dateOfJoining} onChange={setDateOfJoining} />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Date of Birth</label>
                          <DatePicker className="form-control" format="MM-DD-YYYY" value={dateOfBirth} onChange={setDateOfBirth} />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Subjects</label>
                          <select className="form-select" multiple value={subjects}
                            onChange={(e) => setSubjects(Array.from(e.target.selectedOptions, (o) => o.value))}>
                            {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Languages Known</label>
                          <TagInput initialTags={languages} onTagsChange={setLanguages} />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Current Address</label>
                          <input type="text" name="address" className="form-control" value={editTeacherData.address || ""} onChange={handleEditChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Permanent Address</label>
                          <input type="text" name="permanent_address" className="form-control" value={editTeacherData.permanent_address || ""} onChange={handleEditChange} />
                        </div>
                        <div className="col-md-12 mb-3">
                          <label className="form-label">Notes</label>
                          <textarea name="notes" className="form-control" rows={3} value={editTeacherData.notes || ""} onChange={handleEditChange} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leaves */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h4 className="text-dark mb-0">Time Off / Leaves</h4>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {[
                          { label: "Medical Leaves", name: "medical_leaves" },
                          { label: "Vacation Leaves", name: "vacation_leaves" },
                          { label: "Maternity Leaves", name: "maternity_leaves" },
                          { label: "Sick Leaves", name: "sick_leaves" },
                        ].map((f) => (
                          <div className="col-md-3 mb-3" key={f.name}>
                            <label className="form-label">{f.label}</label>
                            <input type="number" name={f.name} className="form-control"
                              value={editTeacherData[f.name] || 0} onChange={handleEditChange} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h4 className="text-dark mb-0">Documents</h4>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {[
                          { label: "Resume (PDF)", name: "resume" },
                          { label: "Joining Letter (PDF)", name: "joining_letter" },
                          { label: "ID Proof (PDF)", name: "id_proof" },
                        ].map((f) => (
                          <div className="col-md-4 mb-3" key={f.name}>
                            <label className="form-label">{f.label}</label>
                            <input type="file" className="form-control" onChange={(e) => handleFileChange(e, f.name)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    <button type="button" className="btn btn-light me-2" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" className="btn btn-primary">Update Teacher</button>
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

export default TeacherList;
