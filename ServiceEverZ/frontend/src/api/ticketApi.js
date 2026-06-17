import { ticketAxios } from './axiosInstance';

// =====================
// End User
// =====================
export const getMyTickets = (userId) =>
  ticketAxios.get(`/api/tickets/my?userId=${userId}`);

export const getAllTickets = () =>
  ticketAxios.get('api/tickets/allTickets');

export const getAssignee = (id) =>
  ticketAxios.get(`api/tickets/getAssignee/${id}`);

export const getTicketById = (id) =>
  ticketAxios.get(`/api/tickets/${id}`);



// export const getAllowUserReply = (id) =>
//   ticketAxios.get(`/api/tickets/allowUserReply${id}`);

export const getAllowUserReply = (id) =>
  ticketAxios.get(`/api/tickets/allowUserReply/${id}`);//changed by Atchaya

export const getTicketHistory = (id) =>
  ticketAxios.get(`/api/tickets/${id}/history`);

export const getTicketComments = (id) =>
  ticketAxios.get(`/api/tickets/${id}/comments`);

export const addComment = (id, body) =>
  ticketAxios.post(`/api/tickets/${id}/comments`, body);

// TASK 1: PUT /tickets/{id}/reopen (was incorrectly POST)


export const reopenTicket = (id, body) =>
  ticketAxios.post(`/api/tickets/${id}/reopen`, body)

export const cancelTicket = (id, body) =>
  ticketAxios.post(`/api/tickets/${id}/cancel`, body);

// =====================
// Support Personnel
// =====================
export const getAssignedTickets = (assigneeId) =>
  ticketAxios.get(`/api/tickets/assigned`, {
    params: { assigneeId: assigneeId },
  });

export const getTicketSla = (id) =>
  ticketAxios.get(`/api/tickets/${id}/sla`);

export const updateTicketStatus = (id, body) =>
  ticketAxios.patch(`/api/tickets/${id}/status`, body);

export const assignTicket = (id, body) =>
  ticketAxios.put(`/api/tickets/${id}/assign`, body);

// TASK 2: SLA Pause / Resume — POST /tickets/{id}/pause|resume
// export const pauseTicket = (id) =>
//   ticketAxios.post(`/api/tickets/${id}/pause`, {
//     status: "ON_HOLD",
//     resolutionNotes: "Data Paused",
//     changedBy: 1
//   });
export const pauseTicket = (id) => {
  const payload = {
    status: "ON_HOLD",
    resolutionNotes: "Paused by user",
    changedById: 1,
    changedBy: "Support Agent"
  };

  console.log("✅ PAUSE PAYLOAD:", payload);

  return ticketAxios.post(`/api/tickets/${id}/pause`, payload);
};

// export const resumeTicket = (id) =>
//   ticketAxios.post(`/api/tickets/${id}/resume`, {
//     status: "ON_HOLD",
//     resolutionNotes: "Data Paused",
//     changedBy: 1
//   });
export const resumeTicket = (id) => {
  const payload = {
    status: "OPEN",
    resolutionNotes: "Resumed",
    changedById: 1,
    changedBy: "Support Agent"
  };

  console.log("✅ RESUME PAYLOAD:", payload);

  return ticketAxios.post(`/api/tickets/${id}/resume`, payload);
};

// =====================
// Conversations — TASK 4
// =====================
// GET /conversations/{ticketId}
export const getConversations = (ticketId) =>
  ticketAxios.get(`/api/conversations/${ticketId}`);

// POST /conversations  body: { ticketId, senderId, senderName, message }
export const sendConversationMessage = (body) =>
  ticketAxios.post(`/api/conversations`, body);

// =====================
// Approvals — TASK 3
// =====================
// GET /approvals  (ITSM_MANAGER only)
export const getAllApprovals = () =>
  ticketAxios.get(`/api/approvals`);

// GET /approvals/pending  (ITSM_MANAGER only)
export const getPendingApprovals = () =>
  ticketAxios.get(`/api/approvals/pending`);
 
export const deleteDraft = (ticketId) =>
  ticketAxios.delete(`/api/tickets/draft/${ticketId}`);

//allow reply
export const updateAllowUserReply = (id, allowUserReply) =>
  ticketAxios.patch(`/api/tickets/${id}/allowUserReply`, {
    allowUserReply,
  });
