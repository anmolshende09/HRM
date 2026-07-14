import api from "./api";

export const regularizationService = {
  list: (params) => api.get("/regularizations", { params }),
  create: (data) => api.post("/regularizations", data),
  review: (id, status) => api.put(`/regularizations/${id}/review`, { status }),
  remove: (id) => api.delete(`/regularizations/${id}`),
};
