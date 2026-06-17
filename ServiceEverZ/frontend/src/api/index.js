// import { apiFetch, SERVICE_URLS as U } from './config';

// export const ticketApi = {
//   getByUser:       (userId)   => apiFetch(U.TICKET, '/api/tickets', { params: { userId } }),
//   getById:         (id)       => apiFetch(U.TICKET, `/api/tickets/${id}`),
//   saveDraft:       (body)     => apiFetch(U.TICKET, '/api/tickets/draft',  { method: 'POST', body }),
//   createAndSubmit: (body)     => apiFetch(U.TICKET, '/api/tickets',        { method: 'POST', body }),
//   submitDraft:     (ticketId) => apiFetch(U.TICKET, '/api/tickets/submit', { method: 'POST', body: { ticketId } }),
//   updateDraft:     (ticketId, body) => apiFetch(U.TICKET, `/api/tickets/draft/${ticketId}`, { method: 'PUT', body }),
// };

// export const masterApi = {
//   getTypes:          ()              => apiFetch(U.MASTER, '/api/master/types'),
//   getCategories:     (typeId)        => apiFetch(U.MASTER, '/api/master/categories',    { params: { typeId } }),
//   getSubcategories:  (categoryId)    => apiFetch(U.MASTER, '/api/master/subcategories', { params: { categoryId } }),
//   getItems:          (subcategoryId) => apiFetch(U.MASTER, '/api/master/items',         { params: { subcategoryId } }),
//   getItemById:       (id)            => apiFetch(U.MASTER, `/api/master/items/${id}`),
//   getCategoryById:   (id)            => apiFetch(U.MASTER, `/api/master/categories/${id}`),
//   getSubcategoryById:(id)            => apiFetch(U.MASTER, `/api/master/subcategories/${id}`),
//   getPriorityById:   (id)            => apiFetch(U.MASTER, `/api/master/priority-sla/${id}`),
//   getAssets:         (userId)        => apiFetch(U.MASTER, '/api/master/assets',        { params: { userId } }),
//   getPriorities:     ()              => apiFetch(U.MASTER, '/api/master/priority-sla'),
//   getProjects:       ()              => apiFetch(U.MASTER, '/api/master/projects'),
//   getUserById:       (id)            => apiFetch(U.MASTER, `/api/master/users/${id}`),
//   getUsers:          (status)        => apiFetch(U.MASTER, '/api/master/users', { params: { status: status || 'ACTIVE' } }),
// };

// export const approvalApi = {
//   getByTicket:            (ticketId) => apiFetch(U.APPROVAL, `/api/approvals/ticket/${ticketId}`),
//   getPendingL1:           ()         => apiFetch(U.APPROVAL, '/api/approvals/l1/pending'),
//   getPendingL2:           ()         => apiFetch(U.APPROVAL, '/api/approvals/l2/pending'),
//   getPendingResourceOwner:()         => apiFetch(U.APPROVAL, '/api/approvals/resource-owner/pending'),
//   processAction:          (body)     => apiFetch(U.APPROVAL, '/api/approvals/action', { method: 'POST', body }),
// };

// export const assignmentApi = {
//   getByTicket: (ticketId)        => apiFetch(U.ASSIGNMENT, `/api/assignments/${ticketId}`),
//   getByPerson: (supportPersonId) => apiFetch(U.ASSIGNMENT, `/api/assignments/by-person/${supportPersonId}`),
//   acknowledge: (body)            => apiFetch(U.ASSIGNMENT, '/api/assignments/acknowledge', { method: 'POST', body }),
// };

// export const slaApi = {
//   getByTicket: (ticketId) => apiFetch(U.SLA, `/api/sla/${ticketId}`),
// };

// export const managerApi = {
//   // Ticket service: GET /api/tickets?userId=X — no "all" endpoint exists
//   // Manager fetches tickets per user; we use a special userId=0 or the manager's userId
//   // Actual backend only supports per-user, so manager page uses per-person assignment data
//   getTicketsByUser: (userId) => apiFetch(U.TICKET, '/api/tickets', { params: { userId } }),
//   // Approval: pending L1 + L2 combined
//   getPendingL1:     ()       => apiFetch(U.APPROVAL, '/api/approvals/l1/pending'),
//   getPendingL2:     ()       => apiFetch(U.APPROVAL, '/api/approvals/l2/pending'),
//   // Assignment: by-person (used for each support personnel)
//   getByPerson:      (id)     => apiFetch(U.ASSIGNMENT, `/api/assignments/by-person/${id}`),
//   // Manual assign
//   manualAssign:     (body)   => apiFetch(U.ASSIGNMENT, '/api/assignments/trigger', { method:'POST', body }),
// };




import { apiFetch, SERVICE_URLS as U } from './config';

// ── Existing APIs (UNCHANGED) ─────────────────────────────────────────────

export const ticketApi = {
  getByUser: (userId) => apiFetch(U.TICKET, '/api/tickets', { params: { userId } }),
  getById: (id) => apiFetch(U.TICKET, `/api/tickets/${id}`),
  saveDraft: (body) => apiFetch(U.TICKET, '/api/tickets/draft', { method: 'POST', body }),
  createAndSubmit: (body) => apiFetch(U.TICKET, '/api/tickets', { method: 'POST', body }),
  submitDraft: (ticketId) => apiFetch(U.TICKET, '/api/tickets/submit', { method: 'POST', body: { ticketId } }),
  updateDraft: (ticketId, body) => apiFetch(U.TICKET, `/api/tickets/draft/${ticketId}`, { method: 'PUT', body }),
};

export const masterApi = {
  getTypes: () => apiFetch(U.MASTER, '/api/master/types'),
  getCategories: (typeId) => apiFetch(U.MASTER, '/api/master/categories', { params: { typeId } }),
  getSubcategories: (categoryId) => apiFetch(U.MASTER, '/api/master/subcategories', { params: { categoryId } }),
  getItems: (subcategoryId) => apiFetch(U.MASTER, '/api/master/items', { params: { subcategoryId } }),
  getItemById: (id) => apiFetch(U.MASTER, `/api/master/items/${id}`),
  getCategoryById: (id) => apiFetch(U.MASTER, `/api/master/categories/${id}`),
  getSubcategoryById: (id) => apiFetch(U.MASTER, `/api/master/subcategories/${id}`),
  getPriorityById: (id) => apiFetch(U.MASTER, `/api/master/priority-sla/${id}`),
  getAssets: (userId) => apiFetch(U.MASTER, '/api/master/assets', { params: { userId } }),
  getPriorities: () => apiFetch(U.MASTER, '/api/master/priority-sla'),
  getProjects: () => apiFetch(U.MASTER, '/api/master/projects'),
  getUserById: (id) => apiFetch(U.MASTER, `/api/master/users/${id}`),
  getUsers: (status) => apiFetch(U.MASTER, '/api/master/users', { params: { status: status || 'ACTIVE' } }),
};

export const approvalApi = {
  getByTicket: (ticketId) => apiFetch(U.APPROVAL, `/api/approvals/ticket/${ticketId}`),
  getPendingL1: () => apiFetch(U.APPROVAL, '/api/approvals/l1/pending'),
  getPendingL2: () => apiFetch(U.APPROVAL, '/api/approvals/l2/pending'),
  getPendingResourceOwner: () => apiFetch(U.APPROVAL, '/api/approvals/resource-owner/pending'),
  processAction: (body) => apiFetch(U.APPROVAL, '/api/approvals/action', { method: 'POST', body }),
};

export const assignmentApi = {
  getByTicket: (ticketId) => apiFetch(U.ASSIGNMENT, `/api/assignments/${ticketId}`),
  getByPerson: (supportPersonId) => apiFetch(U.ASSIGNMENT, `/api/assignments/by-person/${supportPersonId}`),
  acknowledge: (body) => apiFetch(U.ASSIGNMENT, '/api/assignments/acknowledge', { method: 'POST', body }),
  managerReassign: (body) => apiFetch(U.ASSIGNMENT, '/api/assignments/manager-reassign', { method: 'POST', body }),

};

export const slaApi = {
  getByTicket: (ticketId) => apiFetch(U.SLA, `/api/sla/${ticketId}`),
};

export const managerApi = {
  getTicketsByUser: (userId) => apiFetch(U.TICKET, '/api/tickets', { params: { userId } }),
  getPendingL1: () => apiFetch(U.APPROVAL, '/api/approvals/l1/pending'),
  getPendingL2: () => apiFetch(U.APPROVAL, '/api/approvals/l2/pending'),
  getByPerson: (id) => apiFetch(U.ASSIGNMENT, `/api/assignments/by-person/${id}`),
  manualAssign: (body) => apiFetch(U.ASSIGNMENT, '/api/assignments/trigger', { method: 'POST', body }),
};

// ── NEW: Incident API ──────────────────────────────────────────────────────
// Hits POST /api/incidents (ticket-service port 8082)

// export const incidentApi = {
//   /** Create and submit an incident — direct support assignment, no L1/L2 */
//   createIncident:    (body)        => apiFetch(U.INCIDENT, '/api/incidents',              { method: 'POST', body }),
//   /** Fetch a single incident by its DB id */
//   getById:           (id)          => apiFetch(U.INCIDENT, `/api/incidents/${id}`),
//   /** All incidents raised by a specific user — for MyTickets */
//   getByUser:         (userId)      => apiFetch(U.INCIDENT, '/api/incidents',              { params: { userId } }),
//   /** All incidents assigned to a support person — for SupportDashboard */
//   getByAssignee:     (assignedTo)  => apiFetch(U.INCIDENT, '/api/incidents',              { params: { assignedTo } }),
// };


export const incidentApi = {
  // createIncident:    (body)        => apiFetch(U.INCIDENT, '/api/incidents',                         { method: 'POST', body }),
  createIncident: (formData) => {
  return fetch(`${U.INCIDENT}/api/incidents`, {
    method: 'POST',
    body: formData,
    // NO Content-Type header — browser sets it automatically with boundary
  }).then(res => res.json().then(json => {
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    return json.data !== undefined ? json.data : json;
  }));
},
  getById: (id) => apiFetch(U.INCIDENT, `/api/incidents/${id}`),
  getByUser: (userId) => apiFetch(U.INCIDENT, '/api/incidents', { params: { userId } }),
  getByAssignee: (assignedTo) => apiFetch(U.INCIDENT, '/api/incidents', { params: { assignedTo } }),
  resolve: (id, body) => apiFetch(U.INCIDENT, `/api/incidents/${id}/resolve`, { method: 'POST', body }),
  userAcknowledge: (id, body) => apiFetch(U.INCIDENT, `/api/incidents/${id}/user-acknowledge`, { method: 'POST', body }),
  update: (id, body) => apiFetch(U.INCIDENT, `/api/incidents/${id}`, { method: 'PUT', body }),
}
