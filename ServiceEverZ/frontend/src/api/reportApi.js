// src/api/reportApi.js
// Report Service — uses ticketAxios (gateway:8080) and approvalClient (8091)
import { ticketAxios } from './axiosInstance';
import axios from 'axios';
import { tokenUtils } from '../utils/tokenUtils';

const APPROVAL_URL = 'http://localhost:8080';
const TICKET_URL = 'http://localhost:8080';

const makeClient = (base) => {
  const c = axios.create({ baseURL: base, timeout: 15000 });
  c.interceptors.request.use(cfg => {
    const t = tokenUtils.getToken();
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
    return cfg;
  });
  c.interceptors.response.use(r => r, err => {
    if (err.response?.status === 401) { tokenUtils.clearAll(); window.location.href = '/login'; }
    return Promise.reject(err);
  });
  return c;
};

const approvalClient = makeClient(APPROVAL_URL);
const uw = r => r.data?.data ?? r.data;

// ── TICKET MANAGEMENT REPORTS ─────────────────────────────────────────────────
export const reportApi = {
  // GET /api/tickets/allTickets — used for Ticket Volume / Status Distribution / etc.
  getAllTickets: () =>
    ticketAxios.get('/api/tickets/allTickets').then(r => r.data),

  // GET /api/tickets/{id}/history
  getTicketHistory: (id) =>
    ticketAxios.get(`/api/tickets/${id}/history`).then(r => r.data),

  // ── APPROVAL REPORTS ────────────────────────────────────────────────────────
  // GET /api/approvals/report/status  — approval status report (all approvals)
  getApprovalStatusReport: (params) =>
    approvalClient.get('/api/approvals/report/status', { params }).then(uw),

  // GET /api/approvals/report/history — approval history
  getApprovalHistoryReport: (params) =>
    approvalClient.get('/api/approvals/report/history', { params }).then(uw),

  // GET /api/approvals/report/change  — change approval report
  getChangeApprovalReport: (params) =>
    approvalClient.get('/api/approvals/report/change', { params }).then(uw),

  // Fallback: fetch all approvals for client-side report building
  getAllApprovals: () =>
    approvalClient.get('/api/approvals').then(uw),

  // GET /api/approvals/all — list all with full details
  getAllApprovalsDetailed: () =>
    approvalClient.get('/api/approvals/all').then(uw),
};

export default reportApi;

