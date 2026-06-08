// src/api/slaApi.js
// CHANGE: removed CRITICAL from PRIORITY_META, DEFAULT_SLA, and all priority arrays
import { userAxios } from './axiosInstance';
 
export const slaApi = {
  // ── Policies ──────────────────────────────────────────────────────────────
  getAllPolicies:       () => userAxios.get('/api/v1/admin/sla/policies'),
  getPolicyByPriority: (p) => userAxios.get(`/api/v1/admin/sla/policies/${p}`),
  savePolicy:          (d) => userAxios.post('/api/v1/admin/sla/policies', d),
  deletePolicy:        (id) => userAxios.delete(`/api/v1/admin/sla/policies/${id}`),
 
  // ── Evaluations ────────────────────────────────────────────────────────────
  getAllEvaluations:      ()          => userAxios.get('/api/v1/admin/sla/evaluations'),
  getEvaluationByTicket: (tid)       => userAxios.get(`/api/v1/admin/sla/evaluations/${tid}`),
  registerTicket:        (d)         => userAxios.post('/api/v1/admin/sla/evaluations', d),
  updateTicketSla:       (tid, d)    => userAxios.patch(`/api/v1/admin/sla/evaluations/${tid}`, d),
 
  // ── Ticket lifecycle ───────────────────────────────────────────────────────
  holdTicket:    (tid) => userAxios.post(`/api/v1/admin/sla/evaluations/${tid}/hold`),
  resumeTicket:  (tid) => userAxios.post(`/api/v1/admin/sla/evaluations/${tid}/resume`),
  resolveTicket: (tid) => userAxios.post(`/api/v1/admin/sla/evaluations/${tid}/resolve`),
  closeTicket:   (tid) => userAxios.post(`/api/v1/admin/sla/evaluations/${tid}/close`),
  changeStatus:  (tid, status) =>
    userAxios.patch(`/api/v1/admin/sla/evaluations/${tid}/status?status=${status}`),
 
  // ── Escalation config ──────────────────────────────────────────────────────
  getAllEscalations:         ()    => userAxios.get('/api/v1/admin/sla/escalations'),
  getEscalationsByPriority:  (p)   => userAxios.get(`/api/v1/admin/sla/escalations/${p}`),
  saveEscalation:            (d)   => userAxios.post('/api/v1/admin/sla/escalations', d),
  deleteEscalation:          (id)  => userAxios.delete(`/api/v1/admin/sla/escalations/${id}`),
 
  // ── Dashboard + Utility ────────────────────────────────────────────────────
  getDashboard:  () => userAxios.get('/api/v1/admin/sla/dashboard'),
  forceRefresh:  () => userAxios.post('/api/v1/admin/sla/refresh'),
};
 
// ── Priority metadata — CRITICAL REMOVED ──────────────────────────────────────
export const PRIORITY_META = {
  HIGH:   { label: 'High',   color: '#E01950', bg: '#FEE2E2', order: 0 },
  MEDIUM: { label: 'Medium', color: '#E2B93B', bg: '#FEF9C3', order: 1 },
  LOW:    { label: 'Low',    color: '#24A148', bg: '#DCFCE7', order: 2 },
};
 
export const SLA_STATUS_META = {
  ON_TRACK: { label: 'On Track', color: '#24A148', bg: '#DCFCE7' },
  AT_RISK:  { label: 'At Risk',  color: '#E2B93B', bg: '#FEF9C3' },
  BREACHED: { label: 'Breached', color: '#E01950', bg: '#FEE2E2' },
  MET:      { label: 'Met',      color: '#27235C', bg: '#EEF0FF' },
};
 
export const TICKET_STATUS_META = {
  OPEN:        { label: 'Open',        color: '#27235C', bg: '#EEF0FF' },
  IN_PROGRESS: { label: 'In Progress', color: '#1D4ED8', bg: '#DBEAFE' },
  ON_HOLD:     { label: 'On Hold',     color: '#854D0E', bg: '#FEF9C3' },
  RESOLVED:    { label: 'Resolved',    color: '#15803D', bg: '#DCFCE7' },
  CLOSED:      { label: 'Closed',      color: '#6B7280', bg: '#F3F4F6' },
};
 
export const ESCALATION_LEVEL_META = {
  0: { label: 'None',           color: '#6B7280', bg: '#F3F4F6' },
  1: { label: 'L1 — Team Lead', color: '#E2B93B', bg: '#FEF9C3' },
  2: { label: 'L2 — Manager',   color: '#F97316', bg: '#FEF3E2' },
  3: { label: 'L3 — Executive', color: '#E01950', bg: '#FEE2E2' },
};
 
// ── Default SLA values — CRITICAL REMOVED ─────────────────────────────────────
export const DEFAULT_SLA = {
  HIGH:   { responseTimeHours: 2,   resolutionTimeHours: 8,  breachTimeHours: 4  },
  MEDIUM: { responseTimeHours: 4,   resolutionTimeHours: 24, breachTimeHours: 12 },
  LOW:    { responseTimeHours: 8,   resolutionTimeHours: 48, breachTimeHours: 24 },
};
 
// ── Format helpers (exported for use in SlaManagementPage) ───────────────────
export const fmtHours = (h) => {
  if (!h && h !== 0) return '—';
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 24) {
    const wh = Math.floor(h), wm = Math.round((h - wh) * 60);
    return wm ? `${wh}h ${wm}m` : `${wh}h`;
  }
  const d = Math.floor(h / 24), rh = Math.round(h % 24);
  return rh ? `${d}d ${rh}h` : `${d}d`;
};
 
export const fmtMins = (m) => fmtHours(m / 60);
 
export const fmtSecs = (totalSecs) => {
  if (totalSecs <= 0) return '00:00:00';
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};
 
export const fmtDuration = (totalSecs) => {
  if (totalSecs == null || totalSecs < 0) return '—';
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};
 
export const fmtDT = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
};
 
 