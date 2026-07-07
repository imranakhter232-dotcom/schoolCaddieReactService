import axios, { AxiosHeaders } from "axios";

export const API_BASE_URL = "https://api.schoolcaddie.com/school/";
// export const API_BASE_URL = "http://127.0.0.1:8000/school/";
// export const API_BASE_URL = "https://127.0.0.1:8000/school/";
// export const API_BASE_URL = "http://127.0.0.1:8000/school/";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});



axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    const headers = new AxiosHeaders(config.headers);

    // Only set JSON content-type when NOT sending FormData
    // (FormData needs the browser to set Content-Type with the multipart boundary automatically)
    if (!(config.data instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Token ${token}`);
    }

    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
