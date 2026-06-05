// src/api/autoCloseApi.js
// Auto-Close feature API — communicates with action-service (:8087)

import axios from 'axios';
import { tokenUtils } from './axiosInstance';

const ACTION_BASE_URL = 'http://localhost:8087';

const actionAxios = axios.create({
  baseURL: ACTION_BASE_URL,
  timeout: 20000,
});

// Attach JWT + manager header automatically
actionAxios.interceptors.request.use((config) => {
  const token = tokenUtils.getToken();
  const user  = tokenUtils.getUser();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (user?.id) config.headers['X-Manager-Id'] = user.id;
  return config;
});

export const autoCloseApi = {
  // ── Config (ITSM Manager) ────────────────────────────────────────────────
  /** Upsert global (slaId=null) or SLA-specific config */
  upsertConfig: (data,id) => actionAxios.post('/api/auto-close/config', data, {
    headers: { 'X-Manager-Id': id },
  }),

  /** Fetch all configs */
  getAllConfigs: () => actionAxios.get('/api/auto-close/config'),

  /** Effective config for a slaId (omit param for global) */
  getEffectiveConfig: (slaId) =>
    actionAxios.get('/api/auto-close/config/effective', {
      params: slaId != null ? { slaId } : {},
    }),

  /** Delete a config by id */
  deleteConfig: (configId) =>
    actionAxios.delete(`/api/auto-close/config/${configId}`),

  // ── Ticket state ─────────────────────────────────────────────────────────
  /** Get auto-close timer state for a specific ticket */
  getTicketState: (ticketId) =>
    actionAxios.get(`/api/auto-close/ticket/${ticketId}/state`),
};

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Format hours → "72h" / "2d" / "2d 12h" */
export const fmtAutoCloseHours = (h) => {
  if (h == null || h <= 0) return '—';
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24), rh = h % 24;
  return rh ? `${d}d ${rh}h` : `${d}d`;
};

export const AUTO_CLOSE_STATUS_META = {
  PENDING:   { label: 'Pending',   color: '#1D4ED8', bg: '#DBEAFE' },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', bg: '#F3F4F6' },
  CLOSED:    { label: 'Auto Closed', color: '#15803D', bg: '#DCFCE7' },
};

// ── Action Service — resolve/reopen with auto-close integration ──────────────
export const actionApi = {
  /** Resolve a ticket — starts auto-close countdown */
  resolveTicket: (data) => actionAxios.post('/api/actions/resolve', data),

  /** Reopen a ticket — cancels auto-close countdown (throws 400 if CLOSED) */
  reopenTicket: (data) => actionAxios.post('/api/actions/reopen', data),
};
