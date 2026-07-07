import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import Table from "../../../../core/common/dataTable";
import axiosInstance from "../../../../core/api/axiosInstance";
import Swal from "sweetalert2";

declare const bootstrap: any;

const AdminTeacherList = () => {
  const routes = all_routes;

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  /* ================= FETCH TEACHERS ================= */
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("superadmin/all-teachers/");
      setTeachers(res.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load teachers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  /* ================= DELETE ================= */
  const deleteTeacher = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    try {
      await axiosInstance.delete(`delete-teacher/${id}/`);
      setTeachers(prev => prev.filter(t => t.id !== id));
      Swal.fire("Deleted", "Teacher deleted successfully", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to delete teacher", "error");
    }
  };

  /* ================= VIEW ================= */
  const handleView = (teacher: any) => {
    setSelectedTeacher(teacher);
    new bootstrap.Modal(
      document.getElementById("viewTeacherModal")!
    ).show();
  };

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   sorter: (a: any, b: any) => a.id - b.id,
    // },
    {
      title: "Teacher ID",
      dataIndex: "teacher_id",
    },
    {
      title: "Name",
      render: (_: any, r: any) => (
        <div>
          <strong>
            {r.first_name} {r.middle_name} {r.last_name}
          </strong>
          <div className="text-muted">{r.email}</div>
        </div>
      ),
      sorter: (a: any, b: any) =>
        a.first_name.localeCompare(b.first_name),
    },
    {
      title: "Grade",
      dataIndex: "grade",
    },
    {
      title: "Subjects",
      dataIndex: "subjects",
      render: (subjects: string[]) =>
        subjects?.length ? subjects.join(", ") : "—",
    },
    {
      title: "Contact",
      dataIndex: "primary_contact",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <span
          className={`badge ${
            text === "Active"
              ? "badge-soft-success"
              : "badge-soft-danger"
          }`}
        >
          {text}
        </span>
      ),
    },
    // {
    //   title: "Action",
    //   render: (_: any, record: any) => (
    //     <div className="d-flex gap-2">
    //       <button
    //         className="btn btn-outline-light btn-icon"
    //         onClick={() => handleView(record)}
    //       >
    //         <i className="ti ti-eye" />
    //       </button>

    //       <Link
    //         to={`/teacher/edit/${record.id}`}
    //         className="btn btn-outline-light btn-icon"
    //       >
    //         <i className="ti ti-edit" />
    //       </Link>

    //       <button
    //         className="btn btn-outline-light btn-icon"
    //         onClick={() => deleteTeacher(record.id)}
    //       >
    //         <i className="ti ti-trash" />
    //       </button>
    //     </div>
    //   ),
    // },
  ];

  return (
    <>
      {/* PAGE */}
      <div className="page-wrapper">
        <div className="content">

          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="page-title">Teachers List</h3>
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to={routes.superadminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Teachers</li>
              </ol>
            </div>

            {/* <Link to={routes.addTeacher} className="btn btn-primary">
              <i className="ti ti-square-rounded-plus me-2" />
              Add Teacher
            </Link> */}
          </div>

          {/* TABLE */}
          <div className="card">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-4">Loading teachers...</div>
              ) : (
                <Table columns={columns} dataSource={teachers} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}
      <div
        className="modal fade"
        id="viewTeacherModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Teacher Details
              </h5>
              <button
                className="btn-close"
                data-bs-dismiss="modal"
              />
            </div>

            <div className="modal-body">
              {selectedTeacher && (
                <div className="container-fluid">

                  {/* BASIC */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4"><strong>Teacher ID:</strong> {selectedTeacher.teacher_id}</div>
                    <div className="col-md-4"><strong>Name:</strong> {selectedTeacher.first_name} {selectedTeacher.middle_name} {selectedTeacher.last_name}</div>
                    <div className="col-md-4"><strong>Gender:</strong> {selectedTeacher.gender}</div>

                    <div className="col-md-4"><strong>Email:</strong> {selectedTeacher.email}</div>
                    <div className="col-md-4"><strong>Contact:</strong> {selectedTeacher.primary_contact}</div>
                    <div className="col-md-4"><strong>Status:</strong> {selectedTeacher.status}</div>
                  </div>

                  <hr />

                  {/* ACADEMIC */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4"><strong>Grade:</strong> {selectedTeacher.grade}</div>
                    <div className="col-md-8">
                      <strong>Subjects:</strong>{" "}
                      {selectedTeacher.subjects?.join(", ") || "—"}
                    </div>
                  </div>

                  <hr />

                  {/* DATES */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <strong>Date of Joining:</strong> {selectedTeacher.date_of_joining}
                    </div>
                    <div className="col-md-6">
                      <strong>Date of Birth:</strong> {selectedTeacher.date_of_birth}
                    </div>
                  </div>

                  <hr />

                  {/* LANGUAGES */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-12">
                      <strong>Languages:</strong>{" "}
                      {selectedTeacher.languages?.join(", ") || "—"}
                    </div>
                  </div>

                  <hr />

                  {/* QUALIFICATION */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <strong>Qualification:</strong> {selectedTeacher.qualification}
                    </div>
                    <div className="col-md-6">
                      <strong>Work Experience:</strong> {selectedTeacher.work_experience || "—"}
                    </div>
                  </div>

                  <hr />

                  {/* ADDRESS */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <strong>Current Address:</strong> {selectedTeacher.address}
                    </div>
                    <div className="col-md-6">
                      <strong>Permanent Address:</strong> {selectedTeacher.permanent_address}
                    </div>
                  </div>

                  <hr />

                  {/* LEAVES */}
                  <div className="row g-3">
                    <div className="col-md-3"><strong>Medical:</strong> {selectedTeacher.medical_leaves}</div>
                    <div className="col-md-3"><strong>Sick:</strong> {selectedTeacher.sick_leaves}</div>
                    <div className="col-md-3"><strong>Maternity:</strong> {selectedTeacher.maternity_leaves}</div>
                    <div className="col-md-3"><strong>Vacation:</strong> {selectedTeacher.vacation_leaves || 0}</div>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminTeacherList;
