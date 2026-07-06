import api from "./api";

export const attendanceService = {
  mark: (payload) => api.post("/attendance", payload),
  today: () => api.get("/attendance/today"),
  history: (employeeId, params) => api.get(`/attendance/history/${employeeId}`, { params }),
  percentage: (employeeId, params) => api.get(`/attendance/percentage/${employeeId}`, { params }),
};
