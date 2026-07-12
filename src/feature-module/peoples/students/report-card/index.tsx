import {Input} from "antd";
import type {SubjectMarks} from "../../../../core/data/interface/report-card.tsx";
import React, {useState} from "react";

const ReportCard = () => {
    // const [subjects, setSubjects] = useState<SubjectMarks[]>([]);

    const [subjects, setSubjects] = useState<SubjectMarks[]>([
        {
            id: 1,
            name: "Mathematics",
            totalMarks: 100,
            marksObtained: 85
        },
        {
            id: 2,
            name: "Science",
            totalMarks: 100,
            marksObtained: 90
        },
        {
            id: 3,
            name: "English",
            totalMarks: 100,
            marksObtained: 90
        },
        {
            id: 4,
            name: "French",
            totalMarks: 100,
            marksObtained: 90
        },
        {
            id: 5,
            name: "EVS",
            totalMarks: 100,
            marksObtained: 90
        }
    ]);
    const roleId =
        sessionStorage.getItem("role_id") || localStorage.getItem("role_id");
    // const roleId = "3";
    const isTeacher = roleId === "2";

    const handleMarksChange = (
        subjectId: number,
        value: string
    ) => {
        setSubjects((prevSubjects) =>
            prevSubjects.map((subject) =>
                subject.id === subjectId
                    ? {
                        ...subject,
                        marksObtained: Number(value)
                    }
                    : subject
            )
        );
    };

    const handleSubjectChange = (
        subjectId: number,
        value: string
    ) => {
        setSubjects((prevSubjects) =>
            prevSubjects.map((subject) =>
                subject.id === subjectId
                    ? {
                        ...subject,
                        name: value
                    }
                    : subject
            )
        );
    };

    const handleTotalMarksChange = (
        subjectId: number,
        value: string
    ) => {
        setSubjects((prevSubjects) =>
            prevSubjects.map((subject) =>
                subject.id === subjectId
                    ? {
                        ...subject,
                        totalMarks: Number(value)
                    }
                    : subject
            )
        );
    };
    const addSubject = () => {
        const newSubject: SubjectMarks = {
            id: 100,
            name: "",
            totalMarks: 100,
            marksObtained: 0
        };

        setSubjects((prev) => [
            ...prev,
            newSubject
        ]);
    };

    const deleteSubject = (subjectId: number) => {
        setSubjects((prevSubjects) =>
            prevSubjects.filter(
                (subject) => subject.id !== subjectId
            )
        );
    };

    const totalMarks = subjects.reduce(
        (sum, subject) => sum + subject.totalMarks,
        0
    );

    const totalObtainedMarks = subjects.reduce(
        (sum, subject) => sum + subject.marksObtained,
        0
    );


    return (
        <div className="page-wrapper ">
            <div className="content p-0 bg-body-tertiary min-vh-100">
                {/* Page Header */}
                <div className="d-md-flex d-block align-items-center justify-content-between border-bottom bg-white">
                    <div className="my-auto p-3">
                        <h1 className="page-title mb-1 ps-4">Report Card</h1>
                    </div>
                </div>
                <div className="card mx-auto my-3 shadow-sm border rounded-4" style={{maxWidth: "95%"}}>
                    <div className="card-body">
                        <div className="row g-3 align-items-end">

                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-dark-emphasis ps-2">Class / Grade</label>
                                <Input
                                    type="text"
                                    size="small"
                                    placeholder="Select class"
                                    className="form-control form-control-lg shadow-sm rounded-3 border"
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-dark-emphasis ps-2">Student</label>
                                <Input
                                    type="text"
                                    size="small"
                                    placeholder="Search student"
                                    className="form-control form-control-lg shadow-sm rounded-3 border"
                                />
                            </div>

                            <div className="col-md-3">
                                <label className="form-label fw-semibold text-dark-emphasis ps-2">Term</label>
                                <Input
                                    type="text"
                                    size="small"
                                    placeholder="Select term"
                                    className="form-control form-control-lg shadow-sm rounded-3 border"
                                />
                            </div>

                            <div className="col-md-3">
                                <button className="btn btn-primary w-100 shadow rounded-3 search-btn">
                                    Search
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="card mx-auto my-3 shadow-sm rounded-4" style={{maxWidth: "95%"}}>
                    {isTeacher && (
                        <button
                            className="btn btn-primary"
                            onClick={addSubject}
                        >
                            + Add Subject
                        </button>
                    )}
                </div>
                <div className="card mx-auto my-3 shadow-sm rounded-4" style={{maxWidth: "95%"}}>
                    <div className="card-body p-0">

                        <div className="table-responsive rounded-4">
                            <table className="table mb-0 marks-table">
                                <colgroup>
                                    <col style={{width: "45%"}}/>
                                    <col style={{width: "20%"}}/>
                                    <col style={{width: "25%"}}/>
                                    <col style={{width: "10%"}}/>
                                </colgroup>

                                <thead className="marks-header">
                                <tr>
                                    <th className="subject-cell">
                                        <div className="subject-text">
                                            Subject
                                        </div>
                                    </th>
                                    <th className="text-center">Total Marks</th>
                                    <th className="text-center">Marks Obtained</th>
                                    <th></th>
                                </tr>
                                </thead>

                                <tbody>
                                {subjects.map((subject) => (
                                    <tr key={subject.id}>
                                        <td className="subject-cell">
                                            {isTeacher ? (
                                                <Input
                                                    type="text"
                                                    value={subject.name}
                                                    className="form-control shadow-sm rounded-3 subject-text-input"
                                                    onChange={(e) =>
                                                        handleSubjectChange(
                                                            subject.id,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <div className="subject-text">
                                                    {subject.name}
                                                </div>
                                            )}
                                        </td>

                                        <td className="text-center">
                                            {isTeacher ? (
                                                <Input
                                                    type="number"
                                                    value={subject.totalMarks}
                                                    className="form-control shadow-sm rounded-3 marks-input"
                                                    onChange={(e) =>
                                                        handleTotalMarksChange(
                                                            subject.id,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <span>{subject.totalMarks}</span>
                                            )}
                                        </td>

                                        <td className="text-center">
                                            {isTeacher ? (
                                                <Input
                                                    type="number"
                                                    value={subject.marksObtained}
                                                    className="form-control shadow-sm rounded-3 marks-input"
                                                    onChange={(e) =>
                                                        handleMarksChange(
                                                            subject.id,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <span className="fw-semibold">
                            {subject.marksObtained}
                        </span>
                                            )}
                                        </td>
                                        <td>
                                            {isTeacher && (
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-danger btn-icon rounded-circle"
                                                        title="Delete" onClick={() => deleteSubject(subject.id)}><i className="ti ti-trash"></i></button>
                                                </td>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>

                                <tfoot>
                                <tr className="marks-total-row">
                                    <td className="subject-cell">
                                        <div className="subject-text">Total</div>
                                    </td>
                                    <td className="text-center">{totalMarks}</td>
                                    <td className="text-center">{totalObtainedMarks}</td>
                                    <td></td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>

                    </div>
                </div>
                <div className="card mx-auto my-3 shadow-sm rounded-4 mb-5 mt-2" style={{maxWidth: "40%"}}>
                    {isTeacher && (
                        <button
                            className="btn btn-primary"
                            onClick={addSubject}
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
