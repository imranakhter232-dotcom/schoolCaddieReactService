import { useRef, useEffect, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { TimePicker } from "antd";
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import axiosInstance from "../../../core/api/axiosInstance";
import Swal from "sweetalert2";

const ClassRoutine = () => {
  const routes = all_routes;
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

  // --- API State Management ---
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Dropdown Lists States ---
  const [subjectList, setSubjectList] = useState<any[]>([]);
  const [classList, setClassList] = useState<any[]>([]);
  const [sectionList, setSectionList] = useState<any[]>([]);
  const [teacherList, setTeacherList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    school_class: "",
    section: "",
    subject: "",
    teacher: "",
    day: "monday",
    start_time: "",
    end_time: "",
    room_number: ""
  });

  // 1️⃣ Fetch All Data for Dropdowns & Table
  const fetchData = async () => {
    try {
      setLoading(true);
      // Saari APIs ko ek saath call kar rahe hain
      const [resRoutine, resSubs, resClasses, resSections, resTeachers] = await Promise.all([
        axiosInstance.get("class-routine/"),
        axiosInstance.get("subjects/"),
        axiosInstance.get("get-classes/"),
        axiosInstance.get("get-sections/"),
        axiosInstance.get("get-teachers/")
      ]);

      setData(resRoutine.data);
      setSubjectList(resSubs.data);
      setClassList(resClasses.data);
      setSectionList(resSections.data);
      setTeacherList(resTeachers.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Failed to load data from server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // 2️⃣ POST: Add Routine
  const handleAddRoutine = async (e: any) => {
    e.preventDefault();
    
    // Debugging ke liye: Check karein data kya ja raha hai
    console.log("Submitting FormData:", formData);

    // Basic validation check
    if (!formData.school_class || !formData.subject || !formData.teacher || !formData.section) {
      Swal.fire("Wait!", "Please select all required fields (Class, Subject, Teacher, Section)", "warning");
      return;
    }

    try {
      const response = await axiosInstance.post("class-routine/", formData);
      
      if (response.status === 201 || response.status === 200) {
        showSuccess("Class Routine added successfully!");
        fetchData(); // List refresh
        
        // Form reset properly
        setFormData({
          school_class: "",
          section: "",
          subject: "",
          teacher: "",
          day: "monday",
          start_time: "",
          end_time: "",
          room_number: ""
        });
      }
    } catch (error: any) {
      console.error("API Error:", error.response?.data || error.message);
      Swal.fire("Error", error.response?.data?.detail || "Failed to save routine.", "error");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: "Class",
      dataIndex: "name", // Backend Serializer se readable name
    },
    {
      title: "Section",
      dataIndex: "name",
    },
    {
      title: "Teacher",
      dataIndex: "teacher_name",
    },
    {
      title: "Subject",
      dataIndex: "subject_name",
    },
    {
      title: "Day",
      dataIndex: "day",
      render: (text: string) => <span className="text-capitalize">{text}</span>,
    },
    {
      title: "Timing",
      render: (_: any, record: any) => (
        <span className="badge badge-soft-info">
          {record.start_time} - {record.end_time}
        </span>
      ),
    },
    {
      title: "Room",
      dataIndex: "room_number",
    },
    {
      title: "Action",
      render: () => (
        <div className="dropdown">
          <Link to="#" className="btn btn-white btn-icon btn-sm" data-bs-toggle="dropdown">
            <i className="ti ti-dots-vertical" />
          </Link>
          <ul className="dropdown-menu p-3">
            <li><Link className="dropdown-item" to="#"><i className="ti ti-trash me-2" />Delete</Link></li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Page Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Class Routine</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to={routes.adminDashboard}>Dashboard</Link></li>
                <li className="breadcrumb-item active">Class Routine</li>
              </ol>
            </nav>
          </div>
          <div className="mb-2">
            <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add_routine">
              <i className="ti ti-square-rounded-plus-filled me-2" />
              Add Class Routine
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-body p-0 py-3">
            {loading ? (
              <div className="text-center p-5">Loading Routine...</div>
            ) : (
              <Table columns={columns} dataSource={data} Selection={true} />
            )}
          </div>
        </div>
      </div>

      {/* Add Routine Modal */}
      <div className="modal fade" id="add_routine">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Class Routine</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <form onSubmit={handleAddRoutine}>
              <div className="modal-body">
                <div className="row">
                  
                  {/* Subject Dropdown */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Subject</label>
                    <select className="form-control" value={formData.subject} 
                      onChange={(e) => setFormData({...formData, subject: e.target.value})} required>
                      <option value="">Select Subject</option>
                      {subjectList.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                    </select>
                  </div>

                  {/* Class Dropdown */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Class</label>
                    <select className="form-control" value={formData.school_class} 
                      onChange={(e) => setFormData({...formData, school_class: e.target.value})} required>
                      <option value="">Select Class</option>
                      {classList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Section Dropdown */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Section</label>
                    <select className="form-control" value={formData.section} 
                      onChange={(e) => setFormData({...formData, section: e.target.value})} required>
                      <option value="">Select Section</option>
                      {sectionList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  {/* Teacher Dropdown */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Teacher</label>
                    <select className="form-control" value={formData.teacher} 
                      onChange={(e) => setFormData({...formData, teacher: e.target.value})} required>
                      <option value="">Select Teacher</option>
                      {teacherList.map(t => (
                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Day Select */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label">Day</label>
                    <select className="form-control" value={formData.day} onChange={(e) => setFormData({...formData, day: e.target.value})}>
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>

                  {/* Timings */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Time</label>
                    <TimePicker 
                      className="form-control w-100" 
                      format="HH:mm" 
                      onChange={(_, timeStr) => setFormData({...formData, start_time: timeStr as string})} 
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">End Time</label>
                    <TimePicker 
                      className="form-control w-100" 
                      format="HH:mm" 
                      onChange={(_, timeStr) => setFormData({...formData, end_time: timeStr as string})} 
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Room Number</label>
                    <input type="text" className="form-control" value={formData.room_number} 
                      onChange={(e) => setFormData({...formData, room_number: e.target.value})} placeholder="e.g. Room 101" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Save Routine</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassRoutine;