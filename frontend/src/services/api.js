import axios from "axios";

// Create an Axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
export default api;
