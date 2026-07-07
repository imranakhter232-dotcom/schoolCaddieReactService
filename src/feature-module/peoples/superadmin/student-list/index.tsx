import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { Table } from "antd"; // ✅ Ant Design Table directly import karein
import axiosInstance from "../../../../core/api/axiosInstance";
import Swal from "sweetalert2";
import { DatePicker } from "antd";
import dayjs from "dayjs";

declare const bootstrap: any;

const AdminStudentList = () => {
  const routes = all_routes;
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editStudentData, setEditStudentData] = useState<any>(null);
  
  // Form states
  const [admissionDate, setAdmissionDate] = useState<any>(null);
  const [dob, setDob] = useState<any>(null);
  const [languages, setLanguages] = useState<string[]>([]);

  // ✅ FETCH DATA LOGIC
  const fetchStudents = async () => {
    setLoading(true);
    const roleId = localStorage.getItem("role_id") || sessionStorage.getItem("role_id");

    try {
      let endpoint = "get-students/"; 
      if (roleId === "4") endpoint = "superadmin/all-students/";
      else if (roleId === "3") endpoint = "student/me/";
      else if (roleId === "2") endpoint = "teacher/students/";

      const res = await axiosInstance.get(endpoint);
      
      console.log("API Response:", res.data);
      
      if (roleId === "3") {
        // Single student profile
        setStudents(res.data ? [res.data] : []);
      } else {
        // Array of students
        const data = Array.isArray(res.data) ? res.data : [];
        console.log("Setting students data:", data);
        setStudents(data);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setStudents([]); // Fallback empty array
    } finally {
      setLoading(false);
    }
  };

  // ✅ TABLE COLUMNS CONFIGURATION
  const columns = [
    
    {
      title: "Student Name",
      dataIndex: "first_name",
      key: "name",
      render: (_: string, record: any) => (
        <div className="d-flex align-items-center">
          <div className="avatar avatar-sm me-2">
            {record.photo ? (
              <img 
                src={record.photo} 
                className="rounded-circle" 
                style={{width: '32px', height: '32px'}} 
                alt="img" 
              />
            ) : (
              <div 
                className="avatar-initials bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                style={{width: '32px', height: '32px', fontSize: '12px'}}
              >
                {record.first_name?.[0]?.toUpperCase() || 'N'}
                {record.last_name?.[0]?.toUpperCase() || 'A'}
              </div>
            )}
          </div>
          <div>
            <h6 className="mb-0 text-dark">
              {record.first_name || 'No Name'} {record.last_name || ''}
            </h6>
            <span className="small text-muted">{record.admission_number || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Class/Section",
      key: "class_section",
      render: (_: any, record: any) => (
        <span>
          {record.grade || "N/A"} - {record.section || "N/A"}
        </span>
      )
    },
    {
      title: "Contact",
      dataIndex: "primary_contact",
      key: "contact",
      render: (text: string) => text || "No Contact",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text: string) => {
        const isActive = text?.toLowerCase() === "active";
        return (
          <span 
            className={`badge ${isActive ? "bg-success-transparent text-success" : "bg-danger-transparent text-danger"} text-capitalize`}
          >
            {text || "Inactive"}
          </span>
        );
      }
    },
    // {
    //   title: "Actions",
    //   key: "action",
    //   render: (_: any, record: any) => (
    //     <div className="d-flex align-items-center">
    //       <button 
    //         onClick={() => handleView(record)} 
    //         className="btn btn-sm btn-outline-primary me-2"
    //       >
    //         <i className="ti ti-eye" />
    //       </button>
    //       <button 
    //         onClick={() => handleEdit(record)} 
    //         className="btn btn-sm btn-outline-info me-2"
    //       >
    //         <i className="ti ti-edit" />
    //       </button>
    //       <button 
    //         onClick={() => deleteStudent(record.id)} 
    //         className="btn btn-sm btn-outline-danger"
    //       >
    //         <i className="ti ti-trash" />
    //       </button>
    //     </div>
    //   ),
    // },
  ];

  // ✅ DELETE LOGIC
  const deleteStudent = async (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Delete this student record?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`delete-student/${id}/`);
          setStudents(students.filter((s) => s.id !== id));
          Swal.fire("Deleted!", "Record removed.", "success");
        } catch (error) {
          Swal.fire("Error", "Action failed.", "error");
        }
      }
    });
  };

  // ✅ MODAL HANDLERS
  const handleView = (student: any) => {
    setSelectedStudent(student);
    const modal = new bootstrap.Modal(document.getElementById("viewStudentModal")!);
    modal.show();
  };

  const handleEdit = (student: any) => {
    setEditStudentData(student);
    setLanguages(Array.isArray(student.languages) ? student.languages : []);
    setAdmissionDate(student.admission_date ? dayjs(student.admission_date) : null);
    setDob(student.date_of_birth ? dayjs(student.date_of_birth) : null);
    
    const modal = new bootstrap.Modal(document.getElementById("editStudentModal")!);
    modal.show();
  };

  useEffect(() => {
    console.log("Component mounted, fetching students...");
    fetchStudents();
  }, []);

  useEffect(() => {
    console.log("Students data changed:", students);
  }, [students]);

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header Section */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Students List</h3>
            
          </div>
         
        </div>

        {/* Data Table Card */}
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center p-5">
                <h5>No students found</h5>
                <p className="text-muted">Add your first student to get started</p>
              </div>
            ) : (
              <Table 
                columns={columns} 
                dataSource={students} 
                loading={loading}
                rowKey={(record) => record.id} // ✅ Important for Ant Design Table
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Total ${total} students`
                }}
                bordered
                size="middle"
              />
            )}
          </div>
        </div>

        {/* Debug Section (Remove in production) */}
        
      </div>

      {/* Modals would go here */}
    </div>
  );
};

export default AdminStudentList;