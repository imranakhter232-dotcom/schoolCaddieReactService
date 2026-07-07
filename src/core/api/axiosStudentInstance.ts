import axios from "axios";

export const API_BASE_URL = "https://api.schoolcaddie.com/school/";

//export const API_BASE_URL = "http://127.0.0.1:8000/school/";

const axiosStudentInstance = axios.create({
  baseURL: API_BASE_URL,
});

// ❗ ONLY student token (sessionStorage)
axiosStudentInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token"); // student token

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosStudentInstance;
