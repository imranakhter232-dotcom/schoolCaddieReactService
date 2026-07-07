import { useRef, useEffect, useState } from "react";
import Table from "../../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import { DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import { all_routes } from "../../../router/all_routes";
import axiosInstance from "../../../../core/api/axiosInstance";
import Swal from "sweetalert2";

const ExamSchedule = () => {
  const routes = all_routes;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Dropdown states
  const [examList, setExamList] = useState<any[]>([]);
  const [classList, setClassList] = useState<any[]>([]);
  const [subjectList, setSubjectList] = useState<any[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    exam: "",
    school_class: "",
    subject: "",
    exam_date: "",
    start_time: "",
    end_time: "",
  });

  // 1️⃣ Fetch All Data (Schedule + Dropdowns)
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSchedule, resExams, resClasses, resSubjects] = await Promise.all([
        axiosInstance.get("exam-schedule/"),
        axiosInstance.get("exams/"),
        axiosInstance.get("get-classes/"),
        axiosInstance.get("subjects/")
      ]);
      setData(resSchedule.data);
      setExamList(resExams.data);
      setClassList(resClasses.data);
      setSubjectList(resSubjects.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2️⃣ POST: Add Exam Schedule
  const handleAddSchedule = async (e: any) => {
    e.preventDefault();
    const payload = {
      ...formData,
      exam: parseInt(formData.exam),
      school_class: parseInt(formData.school_class),
      subject: parseInt(formData.subject),
    };

    try {
      await axiosInstance.post("exam-schedule/", payload);
      Swal.fire({ title: "Success!", text: "Schedule added!", icon: "success", timer: 1500, showConfirmButton: false });
      fetchData();
      setFormData({ exam: "", school_class: "", subject: "", exam_date: "", start_time: "", end_time: "" });
    } catch (error) {
      Swal.fire("Error", "Check all fields", "error");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Exam", dataIndex: "exam_name" }, // Serializer should return this
    { title: "Subject", dataIndex: "subject_name" },
    { 
      title: "Date", 
      dataIndex: "exam_date", 
      render: (text: string) => dayjs(text).format("MM-DD-YYYY") 
    },
    { 
      title: "Timing", 
      render: (_: any, record: any) => `${record.start_time} - ${record.end_time}` 
    },
    {
      title: "Action",
      render: () => (
        <button className="btn btn-sm btn-white text-danger"><i className="ti ti-trash"></i></button>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="page-title">Exam Schedule</h3>
          <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add_exam_schedule">
            <i className="ti ti-plus me-2" /> Add Schedule
          </button>
        </div>

        <div className="card">
          <div className="card-body p-0">
            {loading ? <div className="p-5 text-center">Loading...</div> : <Table columns={columns} dataSource={data} Selection={true} />}
          </div>
        </div>
      </div>

      {/* Add Schedule Modal */}
      <div className="modal fade" id="add_exam_schedule">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Add Exam Schedule</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <form onSubmit={handleAddSchedule}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Select Exam</label>
                    <select className="form-control" value={formData.exam} onChange={(e) => setFormData({...formData, exam: e.target.value})} required>
                      <option value="">-- Choose Exam --</option>
                      {examList.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Select Class</label>
                    <select className="form-control" value={formData.school_class} onChange={(e) => setFormData({...formData, school_class: e.target.value})} required>
                      <option value="">-- Choose Class --</option>
                      {classList.map(cl => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Select Subject</label>
                    <select className="form-control" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required>
                      <option value="">-- Choose Subject --</option>
                      {subjectList.map(sb => <option key={sb.id} value={sb.id}>{sb.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Exam Date</label>
                    <DatePicker className="form-control w-100" format="MM-DD-YYYY" 
                      onChange={(date) => setFormData({...formData, exam_date: date ? dayjs(date).format("YYYY-MM-DD") : ""})} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Time</label>
                    <TimePicker className="form-control w-100" format="HH:mm" 
                      onChange={(_, timeStr) => setFormData({...formData, start_time: timeStr as string})} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">End Time</label>
                    <TimePicker className="form-control w-100" format="HH:mm" 
                      onChange={(_, timeStr) => setFormData({...formData, end_time: timeStr as string})} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSchedule;