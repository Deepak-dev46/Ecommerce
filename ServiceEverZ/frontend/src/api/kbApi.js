/**
 * kbApi.js — Knowledge Base Service API (knowledgebase-service on :8080)
 *
 * FIXED: Replaced hardcoded 'http://localhost:8080/api/kb' with env variable
 */
import axios from 'axios';
import { tokenUtils } from '../utils/tokenUtils';

const BASE = (import.meta.env.VITE_KB_SERVICE_URL || 'http://localhost:8080') + '/api/kb';

const api = axios.create({ baseURL: BASE });
api.interceptors.request.use(config => {
  const t = tokenUtils.getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export const getAllArticles         = ()              => api.get('/articles');
export const getArticleById        = (id)            => api.get(`/articles/${id}`);
export const getArticlesByStatus   = (status)        => api.get(`/articles/status/${status}`);
export const getArticlesByAuthor   = (authorId)      => api.get(`/articles/author/${authorId}`);
export const getPendingApproval    = ()              => api.get('/articles/pending-approval');
export const searchArticles        = (keyword)       => api.get(`/search${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`);

// Article creation
export const createArticleForm     = (data)          => api.post('/articles/form', data);
export const createArticlePdf      = (formData)      => api.post('/articles/pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const createArticleVideo    = (formData)      => api.post('/articles/video', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Draft updates
export const updateDraftForm       = (aId, vId, data) => api.put(`/articles/${aId}/versions/${vId}/draft/form`, data);
export const updateDraftPdf        = (aId, vId, fd)   => api.put(`/articles/${aId}/versions/${vId}/draft/pdf`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateDraftVideo      = (aId, vId, fd)   => api.put(`/articles/${aId}/versions/${vId}/draft/video`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });

// New version
export const createNewVersionForm  = (aId, data)    => api.post(`/articles/${aId}/versions/form`, data);
export const createNewVersionPdf   = (aId, fd)      => api.post(`/articles/${aId}/versions/pdf`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const createNewVersionVideo = (aId, fd)      => api.post(`/articles/${aId}/versions/video`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });

// Versions
export const getVersionHistory     = (id, role)      => api.get(`/articles/${id}/versions${role ? `?role=${role}` : ''}`);
export const getVersionById        = (vId)           => api.get(`/versions/${vId}`);

// Approval
export const submitForApproval     = (aId, vId)      => api.post(`/articles/${aId}/versions/${vId}/submit`);
export const decideApproval        = (vId, data)     => api.put(`/versions/${vId}/approve`, data);
export const getApprovalsByVersion = (vId)           => api.get(`/versions/${vId}/approvals`);

// Feedback
export const submitFeedback        = (id, data)      => api.post(`/articles/${id}/feedback`, data);
export const getFeedback           = (id)            => api.get(`/articles/${id}/feedback`);

// Categories
export const getCategories         = ()              => api.get('/categories');
export const createCategory        = (data)          => api.post('/categories', data);
export const searchCategories      = (q)             => api.get(`/categories/search${q ? `?q=${encodeURIComponent(q)}` : ''}`);

// File download
export const getAttachmentDownloadUrl = (versionId)  => `${BASE}/versions/${versionId}/download`;
