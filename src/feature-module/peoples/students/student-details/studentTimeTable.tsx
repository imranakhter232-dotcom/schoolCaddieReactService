// @ts-nocheck
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import StudentModals from "../studentModals";
import StudentSidebar from "./studentSidebar";
import StudentBreadcrumb from "./studentBreadcrumb";
import { getStudentTimeTable } from "../../../../core/api/timetableService";

const DAY_COLORS = [
  "bg-transparent-danger",
  "bg-transparent-primary",
  "bg-transparent-success",
  "bg-transparent-pending",
  "bg-transparent-info",
  "bg-transparent-warning",
  "bg-transparent-light",
];

const groupByDay = (data: any[]) => {
  const grouped: Record<string, any[]> = {};
  data.forEach((item) => {
    if (!grouped[item.day]) grouped[item.day] = [];
    grouped[item.day].push(item);
  });
  return grouped;
};

const StudentTimeTable = () => {
  const routes = all_routes;
  const { id } = useParams<{ id: string }>();

  const [timeTable, setTimeTable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStudentTimeTable()
      .then((res) => setTimeTable(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Failed to load timetable."))
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupByDay(timeTable);

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="row">
            <StudentBreadcrumb />
          </div>
          <div className="row">
            <StudentSidebar />
            <div className="col-xxl-9 col-xl-8">
              <div className="row">
                <div className="col-md-12">
                  {/* Nav tabs */}
                  <ul className="nav nav-tabs nav-tabs-bottom mb-4">
                    <li>
                      <Link to={routes.studentDetail.replace(":id", id!)} className="nav-link">
                        <i className="ti ti-school me-2" />Student Details
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.studentResult.replace(":id", id!)} className="nav-link">
                        <i className="ti ti-bookmark-edit me-2" />Exam &amp; Results
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.studentStartRecitation.replace(":id", id!)} className="nav-link">
                        <i className="ti ti-report-money me-2" />Start Recitation
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.studentLogMemorization.replace(":id", id!)} className="nav-link">
                        <i className="ti ti-books me-2" />Log Memorization
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.studentViewProgress.replace(":id", id!)} className="nav-link">
                        <i className="ti ti-books me-2" />View Progress
                      </Link>
                    </li>
                    {/* <li>
                      <Link to={routes.studentTimeTable.replace(":id", id!)} className="nav-link active">
                        <i className="ti ti-table-options me-2" />Time Table
                      </Link>
                    </li> */}
                    <li>
                      <Link to={routes.studentLeaves.replace(":id", id!)} className="nav-link">
                        <i className="ti ti-calendar-due me-2" />Leave &amp; Attendance
                      </Link>
                    </li>
                  </ul>

                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                      <h4 className="mb-3">Time Table</h4>
                    </div>
                    <div className="card-body pb-0">
                      {loading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status" />
                        </div>
                      ) : error ? (
                        <div className="text-center py-4 text-danger">{error}</div>
                      ) : Object.keys(grouped).length === 0 ? (
                        <div className="text-center py-4 text-muted">No timetable found.</div>
                      ) : (
                        <div className="d-flex flex-nowrap overflow-auto">
                          {Object.keys(grouped).map((day) => (
                            <div key={day} className="d-flex flex-column me-4 flex-fill">
                              <div className="mb-3">
                                <h6>{day}</h6>
                              </div>
                              {grouped[day].map((item: any, idx: number) => (
                                <div
                                  key={item.id}
                                  className={`${DAY_COLORS[idx % DAY_COLORS.length]} rounded p-3 mb-4`}
                                >
                                  <p className="d-flex align-items-center text-nowrap mb-1">
                                    <i className="ti ti-clock me-1" />
                                    {item.start_time} - {item.end_time}
                                  </p>
                                  <p className="text-dark mb-1">Subject : {item.subject}</p>
                                  <p className="text-muted mb-0 small">Teacher : {item.teacher_name}</p>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StudentModals />
    </>
  );
};

export default StudentTimeTable;
