// @ts-nocheck
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../../core/api/axiosInstance";
import { createTimeTable } from "../../core/api/timetableService";
import { all_routes } from "../router/all_routes";
import CommonSelect from "../../core/common/commonSelect";

const DAYS = [
  { value: "Monday",    label: "Monday"    },
  { value: "Tuesday",   label: "Tuesday"   },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday",  label: "Thursday"  },
  { value: "Friday",    label: "Friday"    },
  { value: "Saturday",  label: "Saturday"  },
  { value: "Sunday",    label: "Sunday"    },
];

const AddTimeTable = () => {
  const routes = all_routes;

  const [classes,  setClasses]  = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    school_class: "",
    section:      "",
    teacher:      "",
    subject:      "",
    day:          "",
    start_time:   "",
    end_time:     "",
  });

  useEffect(() => {
    axiosInstance.get("get-classes/")
      .then((r) => setClasses(r.data))
      .catch(() => console.error("Failed to load classes"));

    axiosInstance.get("get-sections/")
      .then((r) => setSections(r.data))
      .catch(() => console.error("Failed to load sections"));

    axiosInstance.get("get-teachers/")
      .then((r) => setTeachers(r.data))
      .catch(() => console.error("Failed to load teachers"));
  }, []);

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { school_class, section, teacher, subject, day, start_time, end_time } = form;
    if (!school_class || !teacher || !subject || !day || !start_time || !end_time) {
      Swal.fire({ icon: "warning", title: "Incomplete", text: "Please fill all required fields." });
      return;
    }
    setSubmitting(true);
    try {
      await createTimeTable(form);
      Swal.fire({ icon: "success", title: "Timetable Created!", timer: 1500, showConfirmButton: false });
      setForm({ school_class: "", section: "", teacher: "", subject: "", day: "", start_time: "", end_time: "" });
    } catch {
      Swal.fire("Error", "Failed to create timetable.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const classOptions   = classes.map((c: any)  => ({ value: String(c.id), label: c.name ?? `Class ${c.id}` }));
  const sectionOptions = sections.map((s: any) => ({ value: String(s.id), label: s.name ?? `Section ${s.id}` }));
  const teacherOptions = teachers.map((t: any) => ({
    value: String(t.id),
    label: `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() || `Teacher ${t.id}`,
  }));

  return (
    <div className="page-wrapper">
      <div className="content">

        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Create Time Table</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={routes.classTimetable}>Time Table</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">Create</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">New Timetable Entry</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">

                <div className="col-md-6">
                  <label className="form-label">Class <span className="text-danger">*</span></label>
                  <CommonSelect
                    options={classOptions}
                    value={classOptions.find((o) => o.value === form.school_class) ?? null}
                    onChange={(opt: any) => set("school_class", opt.value)}
                    placeholder="Select Class"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Section</label>
                  <CommonSelect
                    options={sectionOptions}
                    value={sectionOptions.find((o) => o.value === form.section) ?? null}
                    onChange={(opt: any) => set("section", opt.value)}
                    placeholder="Select Section"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Teacher <span className="text-danger">*</span></label>
                  <CommonSelect
                    options={teacherOptions}
                    value={teacherOptions.find((o) => o.value === form.teacher) ?? null}
                    onChange={(opt: any) => set("teacher", opt.value)}
                    placeholder="Select Teacher"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Subject <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Mathematics"
                    value={form.subject}
                    onChange={(e) => set("subject", e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Day <span className="text-danger">*</span></label>
                  <CommonSelect
                    options={DAYS}
                    value={DAYS.find((o) => o.value === form.day) ?? null}
                    onChange={(opt: any) => set("day", opt.value)}
                    placeholder="Select Day"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Start Time <span className="text-danger">*</span></label>
                  <input
                    type="time"
                    className="form-control"
                    value={form.start_time}
                    onChange={(e) => set("start_time", e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">End Time <span className="text-danger">*</span></label>
                  <input
                    type="time"
                    className="form-control"
                    value={form.end_time}
                    onChange={(e) => set("end_time", e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : <><i className="ti ti-plus me-1" />Create Timetable</>}
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddTimeTable;
