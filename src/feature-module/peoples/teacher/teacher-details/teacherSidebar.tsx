import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../../core/api/axiosInstance";
import { mediaUrl } from "../../../../core/api/mediaUrl";

const TeacherSidebar = () => {
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const parseSafe = (data: any, key: string) => {
    try {
      const item = data[key];
      return typeof item === "string" ? JSON.parse(item) : item || [];
    } catch {
      return data[key] || [];
    }
  };

  useEffect(() => {
    if (!id) return;
    axiosInstance.get("get-teachers/")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [res.data];
        const found = list.find((t: any) => String(t.id) === String(id));
        setTeacher(found || null);
      })
      .catch(() => setTeacher(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="col-xxl-3 col-xl-4 theiaStickySidebar">
        <div className="card border-white">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary mb-3" />
            <div className="text-muted">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="col-xxl-3 col-xl-4 theiaStickySidebar">
        <div className="card border-white">
          <div className="card-body text-center text-danger py-4">No teacher data found.</div>
        </div>
      </div>
    );
  }

  const subjects: string[] = parseSafe(teacher, "subjects");
  const languages: string[] = parseSafe(teacher, "languages");

  return (
    <div className="col-xxl-3 col-xl-4 theiaStickySidebar">
      <div className="stickybar pb-4">

        {/* Profile Card */}
        <div className="card border-white">
          <div className="card-header">
            <div className="d-flex align-items-center flex-wrap row-gap-3">
              <div className="avatar avatar-xxl border border-dashed me-2 flex-shrink-0">
                {teacher.photo ? (
                  <img src={mediaUrl(teacher.photo)} className="img-fluid rounded-circle"
                    style={{ width: 70, height: 70, objectFit: "cover" }} alt="photo" />
                ) : (
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 70, height: 70, fontSize: 22 }}>
                    {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                  </div>
                )}
              </div>
              <div>
                <h5 className="mb-1 text-truncate">{teacher.first_name} {teacher.last_name}</h5>
                <p className="text-primary mb-1">{teacher.teacher_id}</p>
                <p className="mb-0 text-muted">Joined: {teacher.date_of_joining || "—"}</p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <h5 className="mb-3">Basic Information</h5>
            <dl className="row mb-0">
              <dt className="col-6 fw-medium text-dark mb-3">Grade</dt>
              <dd className="col-6 mb-3">{teacher.grade || "—"}</dd>

              <dt className="col-6 fw-medium text-dark mb-3">Gender</dt>
              <dd className="col-6 mb-3">{teacher.gender || "—"}</dd>

              <dt className="col-6 fw-medium text-dark mb-3">Marital Status</dt>
              <dd className="col-6 mb-3">{teacher.marital_status || "—"}</dd>

              <dt className="col-6 fw-medium text-dark mb-3">Qualification</dt>
              <dd className="col-6 mb-3">{teacher.qualification || "—"}</dd>

              <dt className="col-6 fw-medium text-dark mb-3">Experience</dt>
              <dd className="col-6 mb-3">{teacher.work_experience || "—"}</dd>

              <dt className="col-6 fw-medium text-dark mb-3">Status</dt>
              <dd className="col-6 mb-3">
                <span className={`badge ${teacher.status === "Active" ? "badge-soft-success" : "badge-soft-danger"}`}>
                  {teacher.status || "—"}
                </span>
              </dd>

              {subjects.length > 0 && (
                <>
                  <dt className="col-6 fw-medium text-dark mb-3">Subjects</dt>
                  <dd className="col-6 mb-3">
                    <div className="d-flex flex-wrap gap-1">
                      {subjects.map((s) => (
                        <span key={s} className="badge badge-light text-dark">{s}</span>
                      ))}
                    </div>
                  </dd>
                </>
              )}

              {languages.length > 0 && (
                <>
                  <dt className="col-6 fw-medium text-dark mb-0">Languages</dt>
                  <dd className="col-6 mb-0">
                    <div className="d-flex flex-wrap gap-1">
                      {languages.map((l) => (
                        <span key={l} className="badge badge-light text-dark">{l}</span>
                      ))}
                    </div>
                  </dd>
                </>
              )}
            </dl>
          </div>
        </div>

        {/* Contact Card */}
        <div className="card border-white">
          <div className="card-body">
            <h5 className="mb-3">Contact Info</h5>
            <div className="d-flex align-items-center mb-3">
              <span className="avatar avatar-md bg-light-300 rounded me-2 flex-shrink-0 text-default">
                <i className="ti ti-phone" />
              </span>
              <div>
                <span className="text-dark fw-medium d-block">Phone</span>
                <p className="mb-0">{teacher.primary_contact || "—"}</p>
              </div>
            </div>
            <div className="d-flex align-items-center mb-3">
              <span className="avatar avatar-md bg-light-300 rounded me-2 flex-shrink-0 text-default">
                <i className="ti ti-mail" />
              </span>
              <div>
                <span className="text-dark fw-medium d-block">Email</span>
                <p className="mb-0">{teacher.email || "—"}</p>
              </div>
            </div>
            {teacher.address && (
              <div className="d-flex align-items-center">
                <span className="avatar avatar-md bg-light-300 rounded me-2 flex-shrink-0 text-default">
                  <i className="ti ti-map-pin" />
                </span>
                <div>
                  <span className="text-dark fw-medium d-block">Address</span>
                  <p className="mb-0">{teacher.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherSidebar;
