import { useRef, useEffect, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import axiosInstance from "../../../core/api/axiosInstance";
import Swal from "sweetalert2"; // 1. Import SweetAlert

const ClassSubject = () => {
  const routes = all_routes;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "", // Ensure your backend supports this field
    type: "Theory",
    status: "Active",
  });

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("subjects/");
      // Agar backend list deta hai to setData(response.data) sahi hai
      setData(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Success Popup Utility
  const showSuccess = (msg: string) => {
    Swal.fire({
      title: "Success!",
      text: msg,
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleAddSubject = async (e: any) => {
    e.preventDefault();
    try {
      await axiosInstance.post("subjects/", formData);
      showSuccess("Subject added successfully!");
      fetchSubjects();
      setFormData({ name: "", code: "", type: "Theory", status: "Active" });
    } catch (error) {
      Swal.fire("Error", "Failed to add subject", "error");
    }
  };

  const handleEditSubject = async (e: any) => {
    e.preventDefault();
    if (!selectedSubject) return;
    try {
      await axiosInstance.patch(`subjects/${selectedSubject.id}/`, formData);
      showSuccess("Subject updated successfully!");
      fetchSubjects();
    } catch (error) {
      Swal.fire("Error", "Failed to update subject", "error");
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;
    try {
      await axiosInstance.delete(`subjects/${selectedSubject.id}/`);
      showSuccess("Subject deleted!");
      fetchSubjects();
    } catch (error) {
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Created At", // Response mein created_on hai isliye ye use karein
      dataIndex: "created_on",
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <span className="badge badge-soft-success">Active</span>
      ),
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
              <Link className="dropdown-item" to="#" data-bs-toggle="modal" data-bs-target="#edit_subject"
                onClick={() => {
                  setSelectedSubject(record);
                  setFormData({ name: record.name, code: record.code || "", type: record.type || "Theory", status: "Active" });
                }}>
                Edit
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="#" data-bs-toggle="modal" data-bs-target="#delete-modal"
                onClick={() => setSelectedSubject(record)}>
                Delete
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
        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
           <h4>Subjects</h4>
           <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add_subject">
             Add Subject
           </button>
        </div>

        <div className="card">
          <div className="card-body p-0">
            {/* Table wrapper for loading state */}
            {loading ? (
              <div className="text-center p-5">Loading...</div>
            ) : (
              <Table columns={columns} dataSource={data} Selection={true} />
            )}
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      <div className="modal fade" id="add_subject">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Subject</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <form onSubmit={handleAddSubject}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
               
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Add Subject</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Subject Modal */}
      <div className="modal fade" id="edit_subject">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Subject</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <form onSubmit={handleEditSubject}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
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
              <h4>Confirm Deletion</h4>
              <p>Are you sure you want to delete this subject?</p>
              <div className="d-flex justify-content-center">
                <button className="btn btn-light me-3" data-bs-dismiss="modal">Cancel</button>
                <button className="btn btn-danger" data-bs-dismiss="modal" onClick={handleDeleteSubject}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSubject;