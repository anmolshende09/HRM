import api from "./api";

export const policyService = {
  list: (params) => api.get("/policies", { params }),
  get: (id) => api.get(`/policies/${id}`),
  create: (data) => api.post("/policies", data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  remove: (id) => api.delete(`/policies/${id}`),
};
