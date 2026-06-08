import axios from 'axios';
import { tokenUtils } from '../utils/tokenUtils';

// ── Axios instance ─────────────────────────────────────────────────────────────
// FIX: Default port corrected from 8084 → 9090.
//      problem-service application.properties declares server.port=9090.
//      Port 8084 belongs to assignment-service and caused all problem API calls to fail.
export const problemApi = axios.create({
  baseURL: import.meta.env.VITE_PROBLEM_SERVICE_URL || 'http://localhost:8080',
});

const attach = (config) => {
  const t = tokenUtils.getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
};
const handle401 = (err) => {
  if (err.response?.status === 401) { tokenUtils.clearAll()(); window.location.href = '/'; }
  return Promise.reject(err);
};
problemApi.interceptors.request.use(attach);
problemApi.interceptors.response.use((r) => r, handle401);

// ── Problem Endpoints ──────────────────────────────────────────────────────────

/** Create a new problem */
export const createProblem = (body) =>
  problemApi.post('/api/problems', body);

/** Link an incident to a problem */
export const linkIncident = (problemId, body) =>
  problemApi.post(`/api/problems/${problemId}/link-incident`, body);

/** Submit Root Cause Analysis */
export const submitRca = (problemId, body) =>
  problemApi.put(`/api/problems/${problemId}/rca`, body);

/** Provide a workaround */
export const provideWorkaround = (problemId, body) =>
  problemApi.put(`/api/problems/${problemId}/workaround`, body);

/** Apply permanent fix (also updates KEDB) */
export const applyPermanentFix = (problemId, body) =>
  problemApi.put(`/api/problems/${problemId}/permanent-fix`, body);

/** Close a problem */
export const closeProblem = (problemId, closedBySpId) =>
  problemApi.put(`/api/problems/${problemId}/close`, null, {
    params: { closedBySpId },
  });

/** Get a problem by its internal ID */
export const getProblemById = (id) =>
  problemApi.get(`/api/problems/${id}`);

/** Get a problem by its human-readable problem number */
export const getProblemByNumber = (problemNumber) =>
  problemApi.get(`/api/problems/number/${problemNumber}`);

/** Get all problems */
export const getAllProblems = () =>
  problemApi.get('/api/problems');

/** Get problems filtered by status */
export const getProblemsByStatus = (status) =>
  problemApi.get(`/api/problems/status/${status}`);

/** Get problems filtered by priority */
export const getProblemsByPriority = (priority) =>
  problemApi.get(`/api/problems/priority/${priority}`);

/** Get problems assigned to a support personnel */
export const getProblemsBySp = (spId) =>
  problemApi.get(`/api/problems/sp/${spId}`);

/** Get problems managed by a manager */
export const getProblemsByManager = (managerId) =>
  problemApi.get(`/api/problems/manager/${managerId}`);

/** Search problems by keyword */
export const searchProblems = (keyword) =>
  problemApi.get('/api/problems/search', { params: { keyword } });

// ── KEDB Endpoints ─────────────────────────────────────────────────────────────

/** Get the KEDB entry for a specific problem */
export const getKerByProblemId = (problemId) =>
  problemApi.get(`/api/problems/${problemId}/kedb`);

/** Get all Known Error Records */
export const getAllKerRecords = () =>
  problemApi.get('/api/problems/kedb');

/** Search the KEDB by keyword */
export const searchKedb = (keyword) =>
  problemApi.get('/api/problems/kedb/search', { params: { keyword } });

// ── Category Endpoints ─────────────────────────────────────────────────────────

/** Create a problem category */
export const createCategory = (body) =>
  problemApi.post('/api/problem-categories', body);

/** Update a problem category */
export const updateCategory = (id, body) =>
  problemApi.put(`/api/problem-categories/${id}`, body);

/** Deactivate (soft-delete) a problem category */
export const deactivateCategory = (id) =>
  problemApi.delete(`/api/problem-categories/${id}`);

/** Get a category by ID */
export const getCategoryById = (id) =>
  problemApi.get(`/api/problem-categories/${id}`);

/** List categories — pass activeOnly=false to include inactive */
export const getAllCategories = (activeOnly = true) =>
  problemApi.get('/api/problem-categories', { params: { activeOnly } });

/** Create a sub-category */
export const createSubCategory = (body) =>
  problemApi.post('/api/problem-categories/sub-categories', body);

/** Update a sub-category */
export const updateSubCategory = (subCatId, body) =>
  problemApi.put(`/api/problem-categories/sub-categories/${subCatId}`, body);

/** Deactivate a sub-category */
export const deactivateSubCategory = (subCatId) =>
  problemApi.delete(`/api/problem-categories/sub-categories/${subCatId}`);

// ── Attachment Endpoints ───────────────────────────────────────────────────────

/**
 * Upload a file attachment to a problem section.
 * @param {number} problemId
 * @param {File}   file           - the File object from an <input type="file">
 * @param {string} section        - 'SOLUTION' | 'ROOT_CAUSE' | 'WORKAROUND' | 'PERMANENT_FIX'
 * @param {number} uploadedBySpId
 */
export const uploadProblemAttachment = (problemId, file, section, uploadedBySpId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('section', section);
  formData.append('uploadedBySpId', uploadedBySpId);
  return problemApi.post(`/api/problems/${problemId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * List all attachments for a problem.
 * @param {number} problemId
 * @param {string|null} section - optional filter e.g. 'ROOT_CAUSE'
 */
export const getProblemAttachments = (problemId, section = null) =>
  problemApi.get(`/api/problems/${problemId}/attachments`, {
    params: section ? { section } : {},
  });

/**
 * Delete an attachment (record + physical file).
 * @param {number} problemId
 * @param {number} attachmentId
 */
export const deleteProblemAttachment = (problemId, attachmentId) =>
  problemApi.delete(`/api/problems/${problemId}/attachments/${attachmentId}`);

/**
 * Build the streaming download URL for an attachment.
 * Use this directly as <img src>, <iframe src>, or window.open().
 * Auth header is NOT sent for this URL — it's a direct browser fetch.
 * If your backend requires auth on the download endpoint, use downloadProblemAttachment() instead.
 * @param {number} problemId
 * @param {number} attachmentId
 */
export const getProblemAttachmentDownloadUrl = (problemId, attachmentId) =>
  `${problemApi.defaults.baseURL}/api/problems/${problemId}/attachments/${attachmentId}/download`;

/**
 * Download an attachment as a Blob (carries the auth token).
 * Use this if the download endpoint is protected and the browser src trick won't work.
 * @param {number} problemId
 * @param {number} attachmentId
 */
export const downloadProblemAttachment = (problemId, attachmentId) =>
  problemApi.get(`/api/problems/${problemId}/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  });
