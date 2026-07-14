import api from "./api";

export const shiftService = {
  list: (params) => api.get("/shifts", { params }),
  get: (id) => api.get(`/shifts/${id}`),
  create: (data) => api.post("/shifts", data),
  update: (id, data) => api.put(`/shifts/${id}`, data),
  remove: (id) => api.delete(`/shifts/${id}`),
};
