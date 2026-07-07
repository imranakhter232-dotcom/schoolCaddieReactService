import axiosInstance from "./axiosInstance";

export const getStudentTimeTable = () =>
  axiosInstance.get("student/timetable/");

export const getTeacherTimeTable = () =>
  axiosInstance.get("teacher/timetable/");

export const createTimeTable = (data: object) =>
  axiosInstance.post("timetable/create/", data);
