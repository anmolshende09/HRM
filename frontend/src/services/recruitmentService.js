import api from "./api";

export const recruitmentService = {
  // Categories
  listCategories: (params) => api.get("/recruitment/categories", { params }),
  createCategory: (data) => api.post("/recruitment/categories", data),
  updateCategory: (id, data) => api.put(`/recruitment/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/recruitment/categories/${id}`),

  // Job Types
  listTypes: (params) => api.get("/recruitment/types", { params }),
  createType: (data) => api.post("/recruitment/types", data),
  updateType: (id, data) => api.put(`/recruitment/types/${id}`, data),
  deleteType: (id) => api.delete(`/recruitment/types/${id}`),

  // Job Postings
  listJobPostings: (params) => api.get("/recruitment/job-postings", { params }),
  getJobPosting: (id) => api.get(`/recruitment/job-postings/${id}`),
  createJobPosting: (data) => api.post("/recruitment/job-postings", data),
  updateJobPosting: (id, data) => api.put(`/recruitment/job-postings/${id}`, data),
  deleteJobPosting: (id) => api.delete(`/recruitment/job-postings/${id}`),

  // Candidates
  listCandidates: (params) => api.get("/recruitment/candidates", { params }),
  getCandidate: (id) => api.get(`/recruitment/candidates/${id}`),
  createCandidate: (data) => api.post("/recruitment/candidates", data),
  updateCandidate: (id, data) => api.put(`/recruitment/candidates/${id}`, data),
  deleteCandidate: (id) => api.delete(`/recruitment/candidates/${id}`),

  // Interviews
  listInterviews: (params) => api.get("/recruitment/interviews", { params }),
  createInterview: (data) => api.post("/recruitment/interviews", data),
  updateInterview: (id, data) => api.put(`/recruitment/interviews/${id}`, data),
  deleteInterview: (id) => api.delete(`/recruitment/interviews/${id}`),

  // Offers
  listOffers: (params) => api.get("/recruitment/offers", { params }),
  createOffer: (data) => api.post("/recruitment/offers", data),
  updateOffer: (id, data) => api.put(`/recruitment/offers/${id}`, data),
  deleteOffer: (id) => api.delete(`/recruitment/offers/${id}`),

  // Onboarding
  listOnboardings: (params) => api.get("/recruitment/onboardings", { params }),
  createOnboarding: (data) => api.post("/recruitment/onboardings", data),
  updateOnboarding: (id, data) => api.put(`/recruitment/onboardings/${id}`, data),
  deleteOnboarding: (id) => api.delete(`/recruitment/onboardings/${id}`),
};
