import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../core/api/axiosInstance";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import CommonSelect from "../../../core/common/commonSelect";
import { classSection } from "../../../core/common/selectoption/selectoption";
import { all_routes } from "../../router/all_routes";

const Classes = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [className, setClassName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const route = all_routes;
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

  const token = localStorage.getItem("token");

  const fetchClasses = async () => {
    try {
      const res = await axiosInstance.get("get-classes/", {
        headers: { Authorization: `Token ${token}` },
      });
      setClasses(res.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // 🟢 Add Class
  const handleAddClass = async () => {
    if (!className.trim()) {
      Swal.fire("Warning", "Please enter a class name", "warning");
      return;
    }

    try {
      await axiosInstance.post(
        "add-class/",
        { name: className },
        { headers: { Authorization: `Token ${token}` } }
      );
      Swal.fire("Success", "Class added successfully", "success");
      setClassName("");
      fetchClasses();
    } catch (error) {
      Swal.fire("Error", "Failed to add class", "error");
    }
  };

  // 🟡 Edit Class
  const handleEditClass = async () => {
    if (!selectedClassId || !className.trim()) {
      Swal.fire("Warning", "Please select a class and enter a name", "warning");
      return;
    }

    try {
      await axiosInstance.put(
        `update-class/${selectedClassId}/`,
        { name: className },
        { headers: { Authorization: `Token ${token}` } }
      );
      Swal.fire("Success", "Class updated successfully", "success");
      setSelectedClassId(null);
      setClassName("");
      fetchClasses();
    } catch (error) {
      Swal.fire("Error", "Failed to update class", "error");
    }
  };

  // 🔴 Delete Class
  const handleDeleteClass = async (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`delete-class/${id}/`, {
            headers: { Authorization: `Token ${token}` },
          });
          Swal.fire("Deleted!", "Class deleted successfully", "success");
          fetchClasses();
        } catch (error) {
          Swal.fire("Error", "Failed to delete class", "error");
        }
      }
    });
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Classes List</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={route.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  All Classes
                </li>
              </ol>
            </nav>
          </div>
          <div>
            <Link
              to="#"
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#add_class"
            >
              <i className="ti ti-square-rounded-plus-filled me-2" />
              Add Class
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header">
            <h4>Classes</h4>
          </div>
          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Class Name</th>
                  <th>Created On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {classes.length > 0 ? (
                  classes.map((cls) => (
                    <tr key={cls.id}>
                      <td>{cls.id}</td>
                      <td>{cls.name}</td>
                      <td>{new Date(cls.created_on).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => {
                            setSelectedClassId(cls.id);
                            setClassName(cls.name);
                          }}
                          data-bs-toggle="modal"
                          data-bs-target="#edit_class"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteClass(cls.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">
                      No classes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        <div className="modal fade" id="add_class">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4>Add Class</h4>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <label>Class Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  data-bs-dismiss="modal"
                  onClick={handleAddClass}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <div className="modal fade" id="edit_class">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4>Edit Class</h4>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <label>Class Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  data-bs-dismiss="modal"
                  onClick={handleEditClass}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classes;
