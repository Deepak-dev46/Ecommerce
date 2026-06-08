import axios from 'axios';
import { tokenUtils } from '../utils/tokenUtils';

// ── Axios instance ─────────────────────────────────────────────────────────────
export const changeApi = axios.create({
  baseURL: import.meta.env.VITE_CHANGE_SERVICE_URL || 'http://localhost:8080',
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
changeApi.interceptors.request.use(attach);
changeApi.interceptors.response.use((r) => r, handle401);

// ── Change Plan Endpoints ──────────────────────────────────────────────────────

/** Create a new change plan (SP) */
export const createChangePlan = (body) =>
  changeApi.post('/api/change-management/change-plans', body);

/** Update a change plan (SP, only when DRAFT or REVISION_REQUESTED) */
export const updateChangePlan = (id, body) =>
  changeApi.put(`/api/change-management/change-plans/${id}`, body);

/** Delete a change plan */
export const deleteChangePlan = (id) =>
  changeApi.delete(`/api/change-management/change-plans/${id}`);

/** Submit change plan for manager approval */
export const submitChangePlan = (id, spId) =>
  changeApi.post(`/api/change-management/change-plans/${id}/submit`, null, {
    params: { spId },
  });

/** Manager: approve / reject / request revision */
export const makeDecision = (id, body) =>
  changeApi.post(`/api/change-management/change-plans/${id}/decision`, body);

/** Get all change plans */
export const getAllChangePlans = () =>
  changeApi.get('/api/change-management/change-plans');

/** Get change plan by ID */
export const getChangePlanById = (id) =>
  changeApi.get(`/api/change-management/change-plans/${id}`);

/** Get change plans created by a specific SP */
export const getChangePlansBySp = (spId) =>
  changeApi.get(`/api/change-management/change-plans/sp/${spId}`);

/** Get change plans assigned to a specific manager */
export const getChangePlansByManager = (managerId) =>
  changeApi.get(`/api/change-management/change-plans/manager/${managerId}`);

/** Get pending-approval change plans for a manager */
export const getPendingByManager = (managerId) =>
  changeApi.get(`/api/change-management/change-plans/manager/${managerId}/pending`);

/** Get change plans by status */
export const getChangePlansByStatus = (status) =>
  changeApi.get(`/api/change-management/change-plans/status/${status}`);

/** Get audit logs for a change plan */
export const getAuditLogs = (id) =>
  changeApi.get(`/api/change-management/change-plans/${id}/audit-logs`);

// ── Freeze Window Endpoints ────────────────────────────────────────────────────

/** Create a freeze window (Manager) */
export const createFreezeWindow = (body) =>
  changeApi.post('/api/change-management/freeze-windows', body);

/** Get all freeze windows */
export const getAllFreezeWindows = () =>
  changeApi.get('/api/change-management/freeze-windows');

/** Get active freeze windows */
export const getActiveFreezeWindows = () =>
  changeApi.get('/api/change-management/freeze-windows/active');

/** Delete a freeze window */
export const deleteFreezeWindow = (id) =>
  changeApi.delete(`/api/change-management/freeze-windows/${id}`);
