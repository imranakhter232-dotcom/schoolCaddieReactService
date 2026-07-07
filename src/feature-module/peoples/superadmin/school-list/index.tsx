import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import Table from "../../../../core/common/dataTable/index";
import axiosInstance from "../../../../core/api/axiosInstance";
import Swal from "sweetalert2";

const AdminSchoolList = () => {
  const routes = all_routes;

  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /* ================= FETCH SCHOOLS ================= */
  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("superadmin/all-schools/");
      setSchools(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to load schools", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    {
      title: "School ID",
      dataIndex: "school_id",
      key: "school_id",
      sorter: (a: any, b: any) =>
        (a.school_id || "").localeCompare(b.school_id || ""),
    },
    {
      title: "School Name",
      dataIndex: "school_name",
      key: "school_name",
      sorter: (a: any, b: any) =>
        (a.school_name || "").localeCompare(b.school_name || ""),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a: any, b: any) =>
        (a.email || "").localeCompare(b.email || ""),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">

        {/* HEADER */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div>
            <h3 className="page-title mb-1">Schools List</h3>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to={routes.adminDashboard}>Dashboard</Link>
              </li>
              <li className="breadcrumb-item active">
                Schools
              </li>
            </ol>
          </div>
        </div>

        {/* TABLE */}
        <div className="card">
          <div className="card-body p-0 py-3">
            {loading ? (
              <div className="text-center py-4">
                Loading schools...
              </div>
            ) : schools.length === 0 ? (
              <div className="text-center py-4">
                No schools found
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={schools}
                // rowKey={(record) => record.school_id}
                // pagination={{ pageSize: 10 }}
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSchoolList;
