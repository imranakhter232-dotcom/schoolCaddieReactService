import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../../../../core/common/dataTable/index";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { all_routes } from "../../../router/all_routes";
import axiosInstance from "../../../../core/api/axiosInstance";
import Swal from "sweetalert2";

const Exam = () => {
  const routes = all_routes;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });

  // 1️⃣ Fetch Exams from API
  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("exams/");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const showSuccess = (msg: string) => {
    Swal.fire({ 
      title: "Success!", 
      text: msg, 
      icon: "success", 
      timer: 1500, 
      showConfirmButton: false 
    });
  };

  // 2️⃣ POST: Add Exam
  const handleAddExam = async (e: any) => {
    e.preventDefault();
    try {
      // Backend expects YYYY-MM-DD which is handled by handleDateChange
      await axiosInstance.post("exams/", formData);
      showSuccess("Exam added successfully!");
      fetchExams();
      setFormData({ name: "", start_date: "", end_date: "" });
    } catch (error: any) {
      console.error("API Error:", error.response?.data);
      Swal.fire("Error", "Failed to add exam. Check backend connection.", "error");
    }
  };

  // 3️⃣ DELETE: Delete Exam
  const handleDeleteExam = async () => {
    if (!selectedExam) return;
    try {
      await axiosInstance.delete(`exams/${selectedExam.id}/`);
      showSuccess("Exam deleted!");
      fetchExams();
    } catch (error) {
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  const handleDateChange = (field: string, date: any) => {
    setFormData({ 
      ...formData, 
      [field]: date ? dayjs(date).format("YYYY-MM-DD") : "" 
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: "Exam Name",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Start Date (USA)",
      dataIndex: "start_date",
      render: (text: string) => dayjs(text).format("MM-DD-YYYY"), // USA Pattern in Table
    },
    {
      title: "End Date (USA)",
      dataIndex: "end_date",
      render: (text: string) => dayjs(text).format("MM-DD-YYYY"), // USA Pattern in Table
    },
    {
      title: "Action",
      render: (_: any, record: any) => (
        <div className="dropdown">
          <Link to="#" className="btn btn-white btn-icon btn-sm" data-bs-toggle="dropdown">
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu p-3">
            <li>
              <Link className="dropdown-item" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal"
                onClick={() => setSelectedExam(record)}>
                <i className="ti ti-trash me-2" />Delete
              </Link>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Examination</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to={routes.adminDashboard}>Dashboard</Link></li>
                <li className="breadcrumb-item active">Exams</li>
              </ol>
            </nav>
          </div>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add_exam">
            <i className="ti ti-plus me-2" /> Add Exam
          </button>
        </div>

        <div className="card">
          <div className="card-body p-0 py-3">
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2">Loading Exams...</p>
              </div>
            ) : (
              <Table columns={columns} dataSource={data} Selection={true} />
            )}
          </div>
        </div>
      </div>

      {/* Add Exam Modal */}
      <div className="modal fade" id="add_exam">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Exam</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <form onSubmit={handleAddExam}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Exam Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Midterm USA 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Date (MM-DD-YYYY)</label>
                    <DatePicker
                      className="form-control w-100"
                      format="MM-DD-YYYY" // USA Pattern Display
                      onChange={(date) => handleDateChange("start_date", date)}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">End Date (MM-DD-YYYY)</label>
                    <DatePicker
                      className="form-control w-100"
                      format="MM-DD-YYYY" // USA Pattern Display
                      onChange={(date) => handleDateChange("end_date", date)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Save Exam</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center">
              <span className="delete-icon text-danger fs-1"><i className="ti ti-trash-x" /></span>
              <h4 className="mt-3">Confirm Deletion</h4>
              <p>Are you sure you want to delete <strong>{selectedExam?.name}</strong>?</p>
              <div className="d-flex justify-content-center mt-4">
                <button className="btn btn-light me-3" data-bs-dismiss="modal">Cancel</button>
                <button className="btn btn-danger" data-bs-dismiss="modal" onClick={handleDeleteExam}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;