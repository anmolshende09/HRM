import api from "./api";

export const holidayService = {
  list: (params) => api.get("/holidays", { params }),
  get: (id) => api.get(`/holidays/${id}`),
  create: (data) => api.post("/holidays", data),
  update: (id, data) => api.put(`/holidays/${id}`, data),
  remove: (id) => api.delete(`/holidays/${id}`),
  // URLs for direct browser downloads
  getExportICalUrl: () => `${api.defaults.baseURL || "/api"}/holidays/export/ical`,
  getExportPDFUrl: () => `${api.defaults.baseURL || "/api"}/holidays/export/pdf`,
};
