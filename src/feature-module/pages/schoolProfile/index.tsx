import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../core/api/axiosInstance";
import { mediaUrl } from "../../../core/api/mediaUrl";
import { all_routes } from "../../router/all_routes";
import Swal from "sweetalert2";

const SchoolProfile: React.FC = () => {
  const routes = all_routes;
  const [profile, setProfile] = useState<any>(null);
  const [schoolName, setSchoolName] = useState(localStorage.getItem("school_name") || "");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"teachers" | "students">("teachers");

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const roleId = localStorage.getItem("role_id");
    try {
      // Teachers/students use the public endpoint; admin uses the full profile endpoint
      const profileEndpoint = roleId === "1" ? "school/profile/" : "school/info/";
      const requests: Promise<any>[] = [axiosInstance.get(profileEndpoint)];
      if (roleId === "1") {
        requests.push(axiosInstance.get("get-teachers/"));
        requests.push(axiosInstance.get("get-students/"));
      }
      const results = await Promise.all(requests);
      setProfile(results[0].data);
      setForm(results[0].data);
      if (roleId === "1") {
        setTeachers(Array.isArray(results[1].data) ? results[1].data : []);
        setStudents(Array.isArray(results[2].data) ? results[2].data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      const fields = [
        "about_us", "established_year", "website",
        "contact_phone", "alternate_phone",
        "address_line_1", "city", "state", "zip_code",
      ];
      fields.forEach((f) => { if (form[f] !== undefined && form[f] !== null) fd.append(f, form[f]); });
      if (logoFile) fd.append("logo", logoFile);
      const res = await axiosInstance.patch("school/profile/", fd);
      setProfile(res.data);
      setForm(res.data);
      setEditing(false);
      setLogoFile(null);
      setLogoPreview(null);
      Swal.fire({ icon: "success", title: "Saved", text: "Profile updated.", timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const parseSafe = (data: any, key: string) => {
    try {
      const v = data[key];
      return typeof v === "string" ? JSON.parse(v) : v || [];
    } catch { return []; }
  };

  const schoolInitial = (schoolName || "S")[0].toUpperCase();

  const isAdmin = localStorage.getItem("role_id") === "1";

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex align-items-center justify-content-center" style={{ minHeight: 400 }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
            <p className="text-muted">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-4">
          <div>
            <h3 className="page-title mb-1">School Profile</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to={routes.adminDashboard}>Dashboard</Link></li>
                <li className="breadcrumb-item active">School Profile</li>
              </ol>
            </nav>
          </div>
          {!editing && isAdmin && (
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setEditing(true)}>
              <i className="ti ti-edit" /> Edit Profile
            </button>
          )}
        </div>

        {editing && isAdmin ? (
          /* ── EDIT FORM ── */
          <form onSubmit={handleSave}>
            <div className="row g-4">
              {/* Logo upload */}
              <div className="col-12">
                <div className="card">
                  <div className="card-body d-flex align-items-center gap-4 flex-wrap">
                    <div className="flex-shrink-0">
                      {logoPreview || profile?.logo ? (
                        <img src={logoPreview || mediaUrl(profile.logo)} alt="logo"
                          className="rounded-circle border" style={{ width: 90, height: 90, objectFit: "cover" }} />
                      ) : (
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: 90, height: 90, fontSize: 28 }}>
                          {schoolInitial}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="btn btn-outline-primary btn-sm mb-1">
                        <i className="ti ti-upload me-1" />Upload Logo
                        <input type="file" accept="image/*" className="d-none" onChange={handleLogoChange} />
                      </label>
                      <p className="text-muted small mt-1 mb-0">JPG, PNG — max 4MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card">
                  <div className="card-header bg-light">
                    <h5 className="mb-0"><i className="ti ti-building-school me-2 text-primary" />School Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">Contact Phone</label>
                        <input type="text" name="contact_phone" className="form-control"
                          value={form.contact_phone || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Alternate Phone</label>
                        <input type="text" name="alternate_phone" className="form-control"
                          value={form.alternate_phone || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Website</label>
                        <input type="url" name="website" className="form-control"
                          value={form.website || ""} onChange={handleChange} placeholder="https://" />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Established Year</label>
                        <input type="number" name="established_year" className="form-control"
                          value={form.established_year || ""} onChange={handleChange} placeholder="e.g. 2005" />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label">Address</label>
                        <input type="text" name="address_line_1" className="form-control"
                          value={form.address_line_1 || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">City</label>
                        <input type="text" name="city" className="form-control"
                          value={form.city || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">State</label>
                        <input type="text" name="state" className="form-control"
                          value={form.state || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Zip Code</label>
                        <input type="text" name="zip_code" className="form-control"
                          value={form.zip_code || ""} onChange={handleChange} />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">About Us</label>
                        <textarea name="about_us" className="form-control" rows={3}
                          value={form.about_us || ""} onChange={handleChange}
                          placeholder="Brief description of your school..." />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 d-flex justify-content-end gap-2 pb-4">
                <button type="button" className="btn btn-light"
                  onClick={() => { setEditing(false); setLogoFile(null); setLogoPreview(null); setForm(profile); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* ── VIEW MODE ── */
          <div className="row g-4">
            {/* Profile Banner */}
            <div className="col-12">
              <div className="card overflow-hidden">
                <div style={{ background: "linear-gradient(135deg,#4a6fa5 0%,#6b8cce 100%)", height: 120 }} />
                <div className="card-body pt-0">
                  <div className="d-flex align-items-end flex-wrap gap-3" style={{ marginTop: -50 }}>
                    <div className="flex-shrink-0">
                      {profile?.logo ? (
                        <img src={mediaUrl(profile.logo)} alt="logo"
                          className="rounded-circle border border-4 border-white shadow"
                          style={{ width: 100, height: 100, objectFit: "cover" }} />
                      ) : (
                        <div className="rounded-circle border border-4 border-white shadow bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: 100, height: 100, fontSize: 32 }}>
                          {schoolInitial}
                        </div>
                      )}
                    </div>
                    <div className="pb-2 flex-grow-1">
                      <h3 className="mb-1">{schoolName || "—"}</h3>
                      <p className="text-muted mb-0">
                        <i className="ti ti-map-pin me-1" />
                        {[profile?.address_line_1, profile?.city, profile?.state].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                    <div className="pb-2 d-flex gap-2 flex-wrap">
                      {isAdmin && <>
                        <span className="badge bg-primary-subtle text-primary fs-6 px-3 py-2">
                          <i className="ti ti-users me-1" />{teachers.length} Teachers
                        </span>
                        <span className="badge bg-success-subtle text-success fs-6 px-3 py-2">
                          <i className="ti ti-school me-1" />{students.length} Students
                        </span>
                      </>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info + Tabs */}
            <div className={isAdmin ? "col-xl-4 col-lg-5" : "col-12"}>
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="mb-0"><i className="ti ti-info-circle me-2 text-primary" />School Details</h5>
                </div>
                <div className="card-body">
                  <dl className="row mb-0">
                    {[
                      { icon: "ti-phone", label: "Phone", value: profile?.contact_phone },
                      { icon: "ti-phone-plus", label: "Alt. Phone", value: profile?.alternate_phone },
                      { icon: "ti-world", label: "Website", value: profile?.website },
                      { icon: "ti-calendar", label: "Est. Year", value: profile?.established_year },
                      { icon: "ti-map-pin", label: "Address", value: [profile?.address_line_1, profile?.city, profile?.state, profile?.zip_code].filter(Boolean).join(", ") },
                    ].map((item) => (
                      <React.Fragment key={item.label}>
                        <dt className="col-5 d-flex align-items-center gap-1 mb-3 text-muted fw-normal small">
                          <i className={`ti ${item.icon}`} />{item.label}
                        </dt>
                        <dd className="col-7 mb-3 fw-medium text-dark small">{item.value || "—"}</dd>
                      </React.Fragment>
                    ))}
                    {profile?.about_us && (
                      <>
                        <dt className="col-12 mb-2 text-muted fw-normal small"><i className="ti ti-notes me-1" />About</dt>
                        <dd className="col-12 mb-0 text-dark small">{profile.about_us}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>

            {/* Teachers & Students Tabs — admin only */}
            {isAdmin && (
            <div className="col-xl-8 col-lg-7">
              <div className="card">
                <div className="card-header bg-light">
                  <ul className="nav nav-tabs card-header-tabs border-0 mb-0">
                    <li className="nav-item">
                      <button className={`nav-link ${activeTab === "teachers" ? "active" : ""}`}
                        onClick={() => setActiveTab("teachers")}>
                        <i className="ti ti-users me-1" />Teachers
                        <span className="badge bg-primary ms-2">{teachers.length}</span>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link ${activeTab === "students" ? "active" : ""}`}
                        onClick={() => setActiveTab("students")}>
                        <i className="ti ti-school me-1" />Students
                        <span className="badge bg-success ms-2">{students.length}</span>
                      </button>
                    </li>
                  </ul>
                </div>
                <div className="card-body p-0" style={{ maxHeight: 460, overflowY: "auto" }}>
                  {activeTab === "teachers" ? (
                    teachers.length === 0 ? (
                      <div className="text-center text-muted py-5">No teachers found.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light sticky-top">
                            <tr><th>Teacher</th><th>Grade</th><th>Subjects</th><th>Contact</th><th>Status</th></tr>
                          </thead>
                          <tbody>
                            {teachers.map((t) => (
                              <tr key={t.id}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    {t.photo ? (
                                      <img src={mediaUrl(t.photo)} className="rounded-circle flex-shrink-0"
                                        style={{ width: 34, height: 34, objectFit: "cover" }} alt="" />
                                    ) : (
                                      <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                        style={{ width: 34, height: 34, fontSize: 12 }}>
                                        {t.first_name?.[0]}{t.last_name?.[0]}
                                      </div>
                                    )}
                                    <div>
                                      <Link to={`/teacher/teacher-details/${t.id}`} className="text-dark fw-medium d-block" style={{ fontSize: 13 }}>
                                        {t.first_name} {t.last_name}
                                      </Link>
                                      <small className="text-muted">{t.teacher_id}</small>
                                    </div>
                                  </div>
                                </td>
                                <td><span className="badge bg-light text-dark">{t.grade || "—"}</span></td>
                                <td><small>{parseSafe(t, "subjects").join(", ") || "—"}</small></td>
                                <td><small>{t.primary_contact || "—"}</small></td>
                                <td>
                                  <span className={`badge ${t.status === "Active" ? "badge-soft-success" : "badge-soft-danger"}`}>
                                    {t.status || "—"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    students.length === 0 ? (
                      <div className="text-center text-muted py-5">No students found.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light sticky-top">
                            <tr><th>Student</th><th>Grade</th><th>Section</th><th>Contact</th><th>Status</th></tr>
                          </thead>
                          <tbody>
                            {students.map((s) => (
                              <tr key={s.id}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    {s.photo ? (
                                      <img src={mediaUrl(s.photo)} className="rounded-circle flex-shrink-0"
                                        style={{ width: 34, height: 34, objectFit: "cover" }} alt="" />
                                    ) : (
                                      <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                                        style={{ width: 34, height: 34, fontSize: 12 }}>
                                        {s.first_name?.[0]}{s.last_name?.[0]}
                                      </div>
                                    )}
                                    <div>
                                      <Link to={`/student/student-details/${s.id}`} className="text-dark fw-medium d-block" style={{ fontSize: 13 }}>
                                        {s.first_name} {s.last_name}
                                      </Link>
                                      <small className="text-muted">{s.admission_number}</small>
                                    </div>
                                  </div>
                                </td>
                                <td><span className="badge bg-light text-dark">{s.grade || "—"}</span></td>
                                <td>{s.section || "—"}</td>
                                <td><small>{s.primary_contact || "—"}</small></td>
                                <td>
                                  <span className={`badge ${s.status === "Active" ? "badge-soft-success" : "badge-soft-danger"}`}>
                                    {s.status || "—"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            )} {/* end isAdmin */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolProfile;
