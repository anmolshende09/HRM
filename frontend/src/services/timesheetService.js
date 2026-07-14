import api from "./api";

export const timesheetService = {
  list: (params) => api.get("/timesheets", { params }),
  get: (id) => api.get(`/timesheets/${id}`),
  create: (data) => api.post("/timesheets", data),
  update: (id, data) => api.put(`/timesheets/${id}`, data),
  remove: (id) => api.delete(`/timesheets/${id}`),
  review: (id, status) => api.put(`/timesheets/${id}/review`, { status }),
  import: (data) => api.post("/timesheets/import", { data }),
  getExportUrl: () => `${api.defaults.baseURL || "/api"}/timesheets/export`,
};
