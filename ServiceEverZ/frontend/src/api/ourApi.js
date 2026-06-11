/**
 * ourApi.js  — API client for our integrated services.
 *
 * Ticket API  → Team A's gateway (8080) — our endpoints live in their ticket-service
 * Master Data → our master-data-service (8090)
 * Approval    → our approval-service (8091)
 * Assignment  → our assignment-service (8092)
 * SLA         → our sla-service (8093)
 */
import axios from 'axios';
import { tokenUtils } from '../utils/tokenUtils';

const GATEWAY_URL = 'http://localhost:8080';
const MASTER_URL = 'http://localhost:8080';
const APPROVAL_URL = 'http://localhost:8080';
const ASSIGNMENT_URL = 'http://localhost:8080';
const SLA_URL = 'http://localhost:8080';
const USER_URL = 'http://localhost:8080';

// In ourApi.js — add ASSET_URL constant at the top with the others
const ASSET_URL = 'http://localhost:8080';

// Add assetClient

// Replace in masterApi object:


const make = (base) => {
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

const gatewayClient = make(GATEWAY_URL);
const masterClient = make(MASTER_URL);
const approvalClient = make(APPROVAL_URL);
const assignmentClient = make(ASSIGNMENT_URL);
const slaClient = make(SLA_URL);
const userClient = make(USER_URL);

const assetClient = make(ASSET_URL);

// unwrap our ApiResponse<T> wrapper { success, message, data, timestamp }
const uw = r => r.data?.data ?? r.data;
// their endpoints return raw JSON
const raw = r => r.data;

// ── TICKET API (our endpoints inside their ticket-service, via gateway) ────────
// export const ticketApi = {
//   // POST /api/tickets — create + submit full approval flow (our endpoint, replaces theirs)
//   createAndSubmit: (body) => gatewayClient.post('/api/tickets', body).then(uw),
//   // POST /api/tickets/draft — save without triggering approval
//   saveDraft: (body) => gatewayClient.post('/api/tickets/draft', body).then(uw),
//   updateDraft: (ticketId, body) => gatewayClient.put(`/api/tickets/draft/${ticketId}`, body).then(uw),
//   // POST /api/tickets/submit — submit existing draft
//   submitDraft: (body) => gatewayClient.post('/api/tickets/submit', body).then(uw),
//   // GET /api/tickets/user-tickets?userId=X — my tickets with L1/L2 queue status
//   getByUser: (userId) => gatewayClient.get('/api/tickets/user-tickets', { params: { userId } }).then(uw),
//   // GET /api/tickets/:id — ticket detail (their endpoint, direct JSON)
//   getById: (id) => gatewayClient.get(`/api/tickets/${id}`).then(raw),
//   // GET /api/tickets/my?userId=X — their My Tickets (for their existing MyTicketsPage)
//   getMyTickets: (userId) => gatewayClient.get('/api/tickets/my', { params: { userId } }).then(raw),
// };

export const ticketApi = {
  createAndSubmit: (body) => gatewayClient.post('/api/tickets', body).then(uw),
  saveDraft: (body) => gatewayClient.post('/api/tickets/draft', body).then(uw),
  updateDraft: (ticketId, body) => gatewayClient.put(`/api/tickets/draft/${ticketId}`, body).then(uw),
  submitDraft: (body) => gatewayClient.post('/api/tickets/submit', body).then(uw),
  getByUser: (userId) => gatewayClient.get('/api/tickets/user-tickets', { params: { userId } }).then(uw),
  getById: (id) => gatewayClient.get(`/api/tickets/${id}`).then(raw),
  getMyTickets: (userId) => gatewayClient.get('/api/tickets/my', { params: { userId } }).then(raw),
  getAttachments: (ticketId) => gatewayClient.get(`/api/attachments/ticket/${ticketId}`).then(raw), // ← ADD
  // NEW: load conversation/comments for L1 & L2 modal view
  getComments: (ticketId) => gatewayClient.get(`/api/tickets/${ticketId}/comments`).then(raw),
  getCommentsByChannel: (ticketId, channel) =>
  gatewayClient.get(`/api/tickets/${ticketId}/comments/channel/${channel}`).then(raw),
 
addApprovalComment: (ticketId, body) =>
  gatewayClient.post(`/api/tickets/${ticketId}/comments`, body).then(raw),
 
};
 


// ── MASTER DATA API (from our master-data-service — type→category→subcategory→item) ─
export const masterApi = {
  getTypes: () => masterClient.get('/api/master/types').then(uw),
  getCategories: (tid) => masterClient.get('/api/master/categories', { params: { typeId: tid } }).then(uw),
  getSubcategories: (cid) => masterClient.get('/api/master/subcategories', { params: { categoryId: cid } }).then(uw),
  getItems: (sid) => masterClient.get('/api/master/items', { params: { subcategoryId: sid } }).then(uw),
  getPriorities: () => masterClient.get('/api/master/priority-sla').then(uw),
  getProjects: () => masterClient.get('/api/master/projects').then(uw),
  getAssets: (uid) => masterClient.get('/api/master/assets', { params: { userId: uid } }).then(uw),
  getUserById: (id) => masterClient.get(`/api/master/users/${id}`).then(uw),
  getAssets: (uid) => assetClient
    .get(`/api/assets/user/${uid}`)
    .then(r => {
      const all = r.data?.data ?? r.data ?? [];
      // Filter LAPTOP only, return in the shape the frontend expects
      return (Array.isArray(all) ? all : [])
        .filter(a => a.category === 'LAPTOP')
        .map(a => ({ id: a.id, assetTag: a.assetTag, assetName: a.name }));
    }),
};

// ── APPROVAL API ──────────────────────────────────────────────────────────────
export const approvalApi = {
  getByTicket: (tid) => approvalClient.get(`/api/approvals/ticket/${tid}`).then(uw),
  // FIX 2: pass approverId so backend filters tickets belonging to this user's project only
  getPendingL1: (approverId) => approvalClient.get('/api/approvals/l1/pending',
    approverId ? { params: { approverId } } : {}).then(uw),
  getPendingL2: (approverId) => approvalClient.get('/api/approvals/l2/pending',
    approverId ? { params: { approverId } } : {}).then(uw),
  getPendingResourceOwner: (approverId) => approvalClient.get('/api/approvals/resource-owner/pending',
    approverId ? { params: { approverId } } : {}).then(uw),
  // FIX 3: history endpoints (were missing — caused empty history tab)
  getL1History: (approverId) => approvalClient.get('/api/approvals/l1/history',
    approverId ? { params: { approverId } } : {}).then(uw),
  getL2History: (approverId) => approvalClient.get('/api/approvals/l2/history',
    approverId ? { params: { approverId } } : {}).then(uw),
      getPendingForApprover: (approverId) => approvalClient.get('/api/approvals/pending',
    approverId ? { params: { approverId } } : {}).then(uw),

  getHistoryForApprover: (approverId) => approvalClient.get('/api/approvals/history',
    approverId ? { params: { approverId } } : {}).then(uw),
  processAction: (b) => approvalClient.post('/api/approvals/action', b).then(uw),
};

// ── ASSIGNMENT API ────────────────────────────────────────────────────────────
export const assignmentApi = {
  getByTicket: (tid) => assignmentClient.get(`/api/assignments/ticket/${tid}`).then(uw),
  getByPerson: (pid) => assignmentClient.get(`/api/assignments/by-person/${pid}`).then(uw),
  acknowledge: (b) => assignmentClient.post('/api/assignments/acknowledge', b).then(uw),
};

// ── SLA API ───────────────────────────────────────────────────────────────────
export const slaApi = {
  getByTicket: (tid) => slaClient.get(`/api/sla/${tid}`).then(uw),
};

export const userApi = {
  searchByName: (name) => userClient.get('/api/v1/admin/users', { params: { search: name } }).then(raw),
  getById: (id) => userClient.get(`/api/v1/admin/users/${id}`).then(raw),
};

