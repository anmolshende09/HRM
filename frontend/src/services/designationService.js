import api from "./api";

export const designationService = {
  list: (params) => api.get("/designations", { params }),
  get: (id) => api.get(`/designations/${id}`),
  create: (data) => api.post("/designations", data),
  update: (id, data) => api.put(`/designations/${id}`, data),
  remove: (id) => api.delete(`/designations/${id}`),
};
