import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { all_routes } from '../../../router/all_routes';
import axiosInstance from '../../../../core/api/axiosInstance';
import { mediaUrl } from '../../../../core/api/mediaUrl';
import Swal from 'sweetalert2';
import TeacherSidebar from './teacherSidebar';
import TeacherBreadcrumb from './teacherBreadcrumb';

const TeacherDetails = () => {
  const routes = all_routes;
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherDetails();
  }, [id]);

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('get-teachers/');
      const teachers = Array.isArray(res.data) ? res.data : [res.data];
      const foundTeacher = teachers.find((t: any) => String(t.id) === String(id));
      
      if (!foundTeacher) {
        Swal.fire({
          icon: 'error',
          title: 'Not Found',
          text: 'Teacher not found',
        });
        navigate(routes.teacherList);
        return;
      }
      
      console.log('Teacher data:', foundTeacher);
      console.log('Photo URL:', foundTeacher.photo);
      console.log('Full photo URL:', foundTeacher.photo ? mediaUrl(foundTeacher.photo) : 'No photo');
      
      setTeacher(foundTeacher);
    } catch (error) {
      console.error('Error fetching teacher:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load teacher details',
      });
    } finally {
      setLoading(false);
    }
  };

  const parseSafe = (data: any) => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data || [];
    } catch {
      return data || [];
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      Swal.fire({ icon: 'warning', title: 'No File', text: 'No file available to download' });
      return;
    }
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : mediaUrl(fileUrl);
    console.log('Opening file:', { fileUrl, fullUrl });
    window.open(fullUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return null;
  }

  const languages = parseSafe(teacher.languages);
  const subjects = parseSafe(teacher.subjects);

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="row">
            <TeacherBreadcrumb />
            
            <TeacherSidebar />
            
            <div className="col-xxl-9 col-xl-8">
              <div className="row">
                <div className="col-md-12">
                  {/* Personal Information */}
                  <div className="card">
                    <div className="card-header">
                      <h5>Personal Information</h5>
                    </div>
                    <div className="card-body">
                      <div className="border rounded p-3 pb-0">
                        <div className="row">
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Teacher ID</p>
                              <p>{teacher.teacher_id || '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Full Name</p>
                              <p>{`${teacher.first_name || ''} ${teacher.middle_name || ''} ${teacher.last_name || ''}`.trim() || '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Gender</p>
                              <p>{teacher.gender || '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Date of Birth</p>
                              <p>{teacher.date_of_birth || '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Date of Joining</p>
                              <p>{teacher.date_of_joining || '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Marital Status</p>
                              <p>{teacher.marital_status || '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Qualification</p>
                              <p>{teacher.qualification || '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Work Experience</p>
                              <p>{teacher.work_experience || '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Grade</p>
                              <p>{teacher.grade || '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Subjects</p>
                              <p>{subjects.length > 0 ? subjects.join(', ') : '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Languages Known</p>
                              <p>{languages.length > 0 ? languages.join(', ') : '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-4">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Status</p>
                              <span className={`badge ${teacher.status === 'Active' ? 'badge-soft-success' : 'badge-soft-danger'}`}>
                                {teacher.status || 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="card">
                    <div className="card-header">
                      <h5>Contact Information</h5>
                    </div>
                    <div className="card-body">
                      <div className="border rounded p-3 pb-0">
                        <div className="row">
                          <div className="col-sm-6 col-lg-6">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Primary Contact</p>
                              <p>{teacher.primary_contact || '—'}</p>
                            </div>
                          </div>
                          <div className="col-sm-6 col-lg-6">
                            <div className="mb-3">
                              <p className="text-dark fw-medium mb-1">Email Address</p>
                              <p>{teacher.email || '—'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="col-xxl-12 d-flex">
                  <div className="card flex-fill">
                    <div className="card-header">
                      <h5>Documents</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {/* Photo */}
                        {teacher.photo && (
                          <div className="col-md-4 mb-3">
                            <div className="bg-light-300 border rounded p-3">
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center overflow-hidden">
                                  <span className="avatar avatar-md bg-white rounded flex-shrink-0 text-default">
                                    <i className="ti ti-photo fs-15" />
                                  </span>
                                  <div className="ms-2">
                                    <p className="text-truncate fw-medium text-dark mb-0">Photo</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleDownload(teacher.photo, 'photo')}
                                  className="btn btn-dark btn-icon btn-sm"
                                >
                                  <i className="ti ti-download" />
                                </button>
                              </div>
                              <img 
                                src={teacher.photo.startsWith('http') ? teacher.photo : mediaUrl(teacher.photo)}
                                alt="Teacher Photo" 
                                className="img-fluid rounded"
                                style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement.innerHTML += '<p class="text-muted text-center mt-2">Image not available</p>';
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Resume */}
                        {teacher.resume && (
                          <div className="col-md-4 mb-3">
                            <div className="bg-light-300 border rounded p-3">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center overflow-hidden">
                                  <span className="avatar avatar-md bg-white rounded flex-shrink-0 text-default">
                                    <i className="ti ti-pdf fs-15" />
                                  </span>
                                  <div className="ms-2">
                                    <p className="text-truncate fw-medium text-dark mb-0">Resume</p>
                                    <small className="text-muted">PDF Document</small>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleDownload(teacher.resume, 'resume.pdf')}
                                  className="btn btn-dark btn-icon btn-sm"
                                >
                                  <i className="ti ti-download" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Joining Letter */}
                        {teacher.joining_letter && (
                          <div className="col-md-4 mb-3">
                            <div className="bg-light-300 border rounded p-3">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center overflow-hidden">
                                  <span className="avatar avatar-md bg-white rounded flex-shrink-0 text-default">
                                    <i className="ti ti-pdf fs-15" />
                                  </span>
                                  <div className="ms-2">
                                    <p className="text-truncate fw-medium text-dark mb-0">Joining Letter</p>
                                    <small className="text-muted">PDF Document</small>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleDownload(teacher.joining_letter, 'joining_letter.pdf')}
                                  className="btn btn-dark btn-icon btn-sm"
                                >
                                  <i className="ti ti-download" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ID Upload */}
                        {teacher.id_upload && (
                          <div className="col-md-4 mb-3">
                            <div className="bg-light-300 border rounded p-3">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center overflow-hidden">
                                  <span className="avatar avatar-md bg-white rounded flex-shrink-0 text-default">
                                    <i className="ti ti-id fs-15" />
                                  </span>
                                  <div className="ms-2">
                                    <p className="text-truncate fw-medium text-dark mb-0">ID Document</p>
                                    <small className="text-muted">Document</small>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleDownload(teacher.id_upload, 'id_document')}
                                  className="btn btn-dark btn-icon btn-sm"
                                >
                                  <i className="ti ti-download" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {!teacher.photo && !teacher.resume && !teacher.joining_letter && !teacher.id_upload && (
                          <div className="col-12">
                            <p className="text-muted text-center">No documents uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="col-xxl-12 d-flex">
                  <div className="card flex-fill">
                    <div className="card-header">
                      <h5>Address</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="d-flex align-items-start mb-3">
                            <span className="avatar avatar-md bg-light-300 rounded me-2 flex-shrink-0 text-default">
                              <i className="ti ti-map-pin-up" />
                            </span>
                            <div>
                              <p className="text-dark fw-medium mb-1">Current Address</p>
                              <p>{teacher.address || '—'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="d-flex align-items-start">
                            <span className="avatar avatar-md bg-light-300 rounded me-2 flex-shrink-0 text-default">
                              <i className="ti ti-map-pins" />
                            </span>
                            <div>
                              <p className="text-dark fw-medium mb-1">Permanent Address</p>
                              <p>{teacher.permanent_address || '—'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Off / Leaves */}
                <div className="col-xxl-12">
                  <div className="card">
                    <div className="card-header">
                      <h5>Time Off / Leaves</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-3">
                          <div className="bg-primary text-white rounded p-3 text-center">
                            <h3 className="text-white mb-1">{teacher.medical_leaves || 0}</h3>
                            <p className="mb-0">Medical Leaves</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-success text-white rounded p-3 text-center">
                            <h3 className="text-white mb-1">{teacher.vacation_leaves || 0}</h3>
                            <p className="mb-0">Vacation Leaves</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-warning text-white rounded p-3 text-center">
                            <h3 className="text-white mb-1">{teacher.maternity_leaves || 0}</h3>
                            <p className="mb-0">Maternity Leaves</p>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="bg-danger text-white rounded p-3 text-center">
                            <h3 className="text-white mb-1">{teacher.sick_leaves || 0}</h3>
                            <p className="mb-0">Sick Leaves</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {teacher.notes && (
                  <div className="col-xxl-12">
                    <div className="card">
                      <div className="card-header">
                        <h5>Notes</h5>
                      </div>
                      <div className="card-body">
                        <p>{teacher.notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherDetails;
