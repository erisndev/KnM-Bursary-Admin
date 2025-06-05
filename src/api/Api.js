import axios from "axios";
import baseAPI from "../../env";

export const getApplications = (page = 1, limit = 10, search = "") => {
  return axios.get(
    `${baseAPI}/applications?page=${page}&limit=${limit}&search=${search}`
  );
};

export const getUnnotifiedApplications = () => {
  return axios.get(`${baseAPI}/applications/unnotified`);
};

export const markAsNotified = (id) => {
  return axios.put(`${baseAPI}/applications/mark-notified/${id}`);
};

export const getApplicationById = (id) => {
  return axios.get(`${baseAPI}/applications/${id}`);
};
export const getApplicationStats = () => {
  return axios.get(`${baseAPI}/applications/stats`);
};

// Get application by user ID
export const getApplicationByUserId = (userId) => {
  return axios.get(`${baseAPI}/applications/user/${userId}`);
};

// Update application step
export const updateApplicationStep = (id, data) => {
  console.log("Sending to API:", data); // 👈 Add this
  const token = localStorage.getItem("adminToken");
  return axios.put(`${baseAPI}/applications/${id}/step`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Update application status
export const updateApplicationStatus = (id, data) => {
  console.log("Sending to API:", data); // 👈 Add this
  const token = localStorage.getItem("adminToken");
  return axios.put(`${baseAPI}/applications/${id}/status`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
