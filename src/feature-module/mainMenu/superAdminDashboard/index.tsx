import React, { useEffect, useState } from "react";
import axiosInstance from "../../../core/api/axiosInstance";
import AdminDashboardModal from "../adminDashboard/adminDashboardModal";



interface DashboardStats {
  total_schools: number;
  total_teachers: number;
  total_students: number;
}

const SuperDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Backend API call jo humne pehle design ki thi
      const response = await axiosInstance.get("superadmin/stats/");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-5 text-center">Loading Master Dashboard...</div>;
  }

  return (
    <div className="page-wrapper p-4">
      <div className="content">
        {/* Header Section */}
        <div className="row mb-4 mt-5">
          <div className="col-12">
            <h4 className="fw-bold">Super Admin Dashboard</h4>
            <p className="text-muted">System-wide overview and management</p>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="row">
          {/* Total Schools Card */}
          <div className="col-md-4">
            <div className="card shadow-sm border-0 bg-primary text-white mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-uppercase mb-2" style={{ opacity: 0.8 }}>Total Schools</h6>
                    <h2 className="mb-0 fw-bold">{stats?.total_schools || 0}</h2>
                  </div>
                  <div className="icon-box bg-white text-primary rounded-circle p-3">
                    <i className="fas fa-university fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Teachers Card */}
          <div className="col-md-4">
            <div className="card shadow-sm border-0 bg-success text-white mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-uppercase mb-2" style={{ opacity: 0.8 }}>Total Teachers</h6>
                    <h2 className="mb-0 fw-bold">{stats?.total_teachers || 0}</h2>
                  </div>
                  <div className="icon-box bg-white text-success rounded-circle p-3">
                    <i className="fas fa-chalkboard-teacher fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Students Card */}
          <div className="col-md-4">
            <div className="card shadow-sm border-0 bg-warning text-dark mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-uppercase mb-2" style={{ opacity: 0.8 }}>Total Students</h6>
                    <h2 className="mb-0 fw-bold">{stats?.total_students || 0}</h2>
                  </div>
                  <div className="icon-box bg-white text-warning rounded-circle p-3">
                    <i className="fas fa-user-graduate fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Sections (Coming Next) */}
        
      </div>

      <AdminDashboardModal/>

    </div>
  );
};



export default SuperDashboard;