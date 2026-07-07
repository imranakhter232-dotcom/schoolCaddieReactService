import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Table, Input } from "antd";
import Swal from "sweetalert2";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../router/all_routes";
import axiosInstance from "../../../core/api/axiosInstance";

interface Section {
  id: number;
  name: string;
  school_class: number;
  school_class_name: string;
  created_on: string;
}

interface SchoolClass {
  id: number;
  name: string;
}

const ClassSection = () => {
  const routes = all_routes;
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [searchText, setSearchText] = useState("");

  const handleApplyClick = () => {
    dropdownMenuRef.current?.classList.remove("show");
  };

  // ✅ Fetch sections
  const fetchSections = async () => {
    try {
      const response = await axiosInstance.get("get-sections/");
      setSections(response.data);
      setFilteredSections(response.data);
    } catch (error) {
      console.error("❌ Error fetching sections:", error);
      Swal.fire("Error", "Failed to load sections!", "error");
    }
  };

  // ✅ Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get("get-classes/");
      setClasses(response.data);
    } catch (error) {
      console.error("❌ Error fetching classes:", error);
      Swal.fire("Error", "Failed to load classes!", "error");
    }
  };

  useEffect(() => {
    fetchSections();
    fetchClasses();
  }, []);

  // ✅ Search handler
  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = sections.filter((section) =>
      Object.values(section).some((field) =>
        String(field).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredSections(filtered);
  };

  // ✅ Add new section
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName || !selectedClass) {
      Swal.fire("Warning", "Please enter section name and select a class.", "warning");
      return;
    }

    try {
      await axiosInstance.post("add-section/", {
        name: newSectionName,
        school_class: selectedClass,
      });
      setNewSectionName("");
      setSelectedClass(null);
      fetchSections();

      Swal.fire("Success", "Section added successfully!", "success");
    } catch (error) {
      console.error("❌ Error adding section:", error);
      Swal.fire("Error", "Failed to add section!", "error");
    }
  };

  // ✅ Update section
  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSection) return;

    try {
      await axiosInstance.put(`update-section/${editSection.id}/`, {
        name: editSection.name,
        school_class: editSection.school_class,
      });
      setEditSection(null);
      fetchSections();

      Swal.fire("Updated!", "Section updated successfully!", "success");
    } catch (error) {
      console.error("❌ Error updating section:", error);
      Swal.fire("Error", "Failed to update section!", "error");
    }
  };

  // ✅ Delete section with SweetAlert2 confirmation
  const handleDeleteSection = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This section will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`delete-section/${id}/`);
        fetchSections();
        Swal.fire("Deleted!", "Section has been deleted.", "success");
      } catch (error) {
        console.error("❌ Error deleting section:", error);
        Swal.fire("Error", "Failed to delete section!", "error");
      }
    }
  };

  // ✅ Table Columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <Link to="#">{id}</Link>,
    },
    {
      title: "Section Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Class",
      dataIndex: "school_class_name",
      key: "school_class_name",
    },
    {
      title: "Created On",
      dataIndex: "created_on",
      key: "created_on",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (record: Section) => (
        <div className="dropdown">
          <Link
            to="#"
            className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="ti ti-dots-vertical fs-14" />
          </Link>
          <ul className="dropdown-menu dropdown-menu-right p-3">
            <li>
              <Link
                className="dropdown-item rounded-1"
                to="#"
                data-bs-toggle="modal"
                data-bs-target="#edit_class_section"
                onClick={() => setEditSection(record)}
              >
                <i className="ti ti-edit-circle me-2" />
                Edit
              </Link>
            </li>
            <li>
              <Link
                className="dropdown-item rounded-1 text-danger"
                to="#"
                onClick={() => handleDeleteSection(record.id)}
              >
                <i className="ti ti-trash-x me-2" />
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
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div>
            <h3 className="page-title mb-1">Sections</h3>
          </div>
          <div className="d-flex align-items-center">
            <TooltipOption />
            <Link
              to="#"
              className="btn btn-primary ms-3"
              data-bs-toggle="modal"
              data-bs-target="#add_class_section"
            >
              <i className="ti ti-square-rounded-plus-filled me-2" />
              Add Section
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
            <h4 className="mb-3">Class Sections</h4>
            <Input
              placeholder="Search"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-auto"
            />
          </div>

          <div className="card-body p-0 py-3">
            <Table
              columns={columns}
              dataSource={filteredSections}
              rowKey="id"
              pagination={{
                locale: { items_per_page: "" },
                nextIcon: <span>Next</span>,
                prevIcon: <span>Prev</span>,
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "30"],
              }}
            />
          </div>
        </div>
      </div>

      {/* ✅ Add Section Modal */}
      <div className="modal fade" id="add_class_section">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleAddSection}>
              <div className="modal-header">
                <h4 className="modal-title">Add Section</h4>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Section Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Enter section name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Select Class</label>
                  <select
                    className="form-select"
                    value={selectedClass || ""}
                    onChange={(e) => setSelectedClass(Number(e.target.value))}
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">
                  Add Section
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ✅ Edit Section Modal */}
      <div className="modal fade" id="edit_class_section">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleUpdateSection}>
              <div className="modal-header">
                <h4 className="modal-title">Edit Section</h4>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                {editSection && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Section Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editSection.name}
                        onChange={(e) =>
                          setEditSection({ ...editSection, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Select Class</label>
                      <select
                        className="form-select"
                        value={editSection.school_class}
                        onChange={(e) =>
                          setEditSection({
                            ...editSection,
                            school_class: Number(e.target.value),
                          })
                        }
                      >
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassSection;
