/**
 * ticketRelationshipApi.js
 *
 * Axios API calls for the Sprint-5 Ticket Relationship features.
 * All calls go through the existing ticketAxios instance (same base URL as ticketApi.js).
 *
 * Feature 1 – Merge Duplicate Tickets
 * Feature 2 – Split Complex Tickets
 * Feature 3 – Link Related Tickets
 * Feature 4 – View Parent-Child Hierarchy
 */

//Added by team - A

import { ticketAxios } from './axiosInstance';

// ── Feature 1: Merge Duplicate Tickets ───────────────────────────────────────

/**
 * Fetch all auto-flagged duplicate pairs awaiting support-agent review.
 * GET /api/tickets/duplicates/pending
 * Response: ApiResponse<DuplicateFlagResponse[]>
 */
export const getPendingDuplicates = () =>
  ticketAxios.get('/api/tickets/duplicates/pending');

/**
 * Support agent confirms the merge.
 * POST /api/tickets/merge
 * Body: { originalTicketId, duplicateTicketId, mergedBy }
 */
export const confirmMerge = (body) =>
  ticketAxios.post('/api/tickets/merge', body);

/**
 * Support agent dismisses a duplicate suggestion.
 * DELETE /api/tickets/duplicates/{scoreId}/dismiss?reviewedBy=userId
 */
export const dismissDuplicate = (scoreId, reviewedBy) =>
  ticketAxios.delete(`/api/tickets/duplicates/${scoreId}/dismiss`, {
    params: { reviewedBy },
  });

// ── Feature 2: Split Complex Tickets ─────────────────────────────────────────

/**
 * Split a parent ticket into multiple child tickets.
 * POST /api/tickets/{parentId}/split
 *
 * Body: { children: [{ subject, description }], splitBy: userId }
 *   — NOTE: assignedTeam is intentionally omitted; the ITSM team
 *     handles assignment after receiving the split notification.
 *
 * On success the backend should:
 *   1. Persist child tickets in the ITSM database.
 *   2. Notify the ITSM team (in-app + email) about the new child tickets.
 *   3. Notify the original requester with child ticket details.
 *   Later, when ITSM assigns a support agent to a child ticket, the
 *   backend sends the agent a notification with full ticket details.
 *
 * Response: ApiResponse<TicketResponse[]>
 */
export const splitTicket = (parentId, body) =>
  ticketAxios.post(`/api/tickets/${parentId}/split`, body);



export const triggerDuplicate = (ticketId) =>
  ticketAxios.post(`/api/tickets/${ticketId}/detect-duplicates`);
// ── Feature 3: Link Related Tickets ──────────────────────────────────────────

/**
 * Create a relationship link between two tickets.
 * POST /api/tickets/{sourceTicketId}/relationships
 * Body: { targetTicketId, relationshipType, notes, createdBy }
 * relationshipType: 'RELATED' | 'DUPLICATE' | 'DEPENDS_ON' | 'PARENT_CHILD'
 */
export const linkTickets = (sourceTicketId, body) =>
  ticketAxios.post(`/api/tickets/${sourceTicketId}/relationships`, body);

/**
 * Fetch all relationships (any type) involving a ticket.
 * GET /api/tickets/{ticketId}/relationships
 * Response: ApiResponse<RelationshipResponse[]>
 */
export const getRelationships = (ticketId) =>
  ticketAxios.get(`/api/tickets/${ticketId}/relationships`);

/**
 * Remove a specific relationship by its id.
 * DELETE /api/tickets/relationships/{relationshipId}
 */
export const removeRelationship = (relationshipId) =>
  ticketAxios.delete(`/api/tickets/relationships/${relationshipId}`);

// ── Feature 4: View Parent-Child Hierarchy ────────────────────────────────────

/**
 * Fetch the full hierarchy tree rooted at the given ticket.
 * Works for both parent and child tickets — backend walks up to the root.
 * GET /api/tickets/{ticketId}/hierarchy
 * Response: ApiResponse<HierarchyNode>
 *   HierarchyNode: { ticketId, ticketNumber, subject, status, assigneeName,
 *                    relationToParent, children: HierarchyNode[] }
 */
export const getTicketHierarchy = (ticketId) =>
  ticketAxios.get(`/api/tickets/${ticketId}/hierarchy`);
