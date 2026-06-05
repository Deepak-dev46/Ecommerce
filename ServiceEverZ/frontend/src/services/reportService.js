// src/services/reportService.js
// Central axios client + all report-service API calls.
// Covers US-94 (dashboard), US-95 (custom reports), US-96 (scheduling), US-97 (Excel export).

import axios from 'axios';

const REPORT_BASE = 'http://localhost:8095';

const reportAxios = axios.create({
  baseURL: REPORT_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

reportAxios.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Send role header so backend role-guard works
  const roles = localStorage.getItem('userRoles') || 'ITSM_MANAGER';
  config.headers['X-User-Roles'] = roles;
  return config;
});

// ── US-94: Fetch report category / report metadata ────────────────────────────
export async function fetchReportMeta() {
  const res = await reportAxios.get('/api/reports/meta');
  return res.data;
}

// ── US-95: Fetch report data for any endpoint returned by meta ────────────────
export async function fetchReportData(endpoint, params = {}) {
  const query = {};
  if (params.startDate)    query.startDate    = params.startDate;
  if (params.endDate)      query.endDate      = params.endDate;
  if (params.searchKeyword?.trim()) query.searchKeyword = params.searchKeyword.trim();
  if (params.status)       query.status       = params.status;
  if (params.priority)     query.priority     = params.priority;
  if (params.categoryName) query.categoryName = params.categoryName;
  if (params.assigneeName) query.assigneeName = params.assigneeName;
  if (params.projectId)    query.projectId    = params.projectId;
  query.size = 1000;
  query.page = 0;

  const res = await reportAxios.get(endpoint, { params: query });
  return res.data;
}

// ── US-94: Prebuilt ITSM Manager dashboard ────────────────────────────────────
export async function fetchDashboard() {
  const res = await reportAxios.get('/api/reports/dashboard');
  return res.data;
}

// ── US-96: Schedule reports ───────────────────────────────────────────────────
/** Create a new schedule. payload: { reportType, frequency, recipients: string[] } */
export async function createReportSchedule(payload) {
  const res = await reportAxios.post('/api/reports/schedules', payload);
  return res.data;
}

/** List all active schedules. */
export async function fetchReportSchedules() {
  const res = await reportAxios.get('/api/reports/schedules');
  return res.data;
}

/** Remove a schedule by id. */
export async function deleteReportSchedule(id) {
  const res = await reportAxios.delete(`/api/reports/schedules/${id}`);
  return res.data;
}

// ── US-97: Excel export ───────────────────────────────────────────────────────
/**
 * Triggers a browser download of an .xlsx file for the given reportType.
 * Falls back gracefully if the server returns an error.
 */
export async function exportReportAsExcel(reportType, params = {}) {
  const query = {};
  if (params.startDate)    query.startDate    = params.startDate;
  if (params.endDate)      query.endDate      = params.endDate;
  if (params.status)       query.status       = params.status;
  if (params.priority)     query.priority     = params.priority;
  if (params.categoryName) query.categoryName = params.categoryName;
  if (params.assigneeName) query.assigneeName = params.assigneeName;
  if (params.projectId)    query.projectId    = params.projectId;

  const res = await reportAxios.get(`/api/reports/export-excel/${reportType}`, {
    params: query,
    responseType: 'blob',
  });

  // Create a temporary link and click it to trigger download
  const blob = new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  const date = new Date().toISOString().split('T')[0];
  link.download = `${reportType}_${date}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default reportAxios;
