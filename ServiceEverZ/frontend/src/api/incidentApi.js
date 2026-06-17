// FILE: src/api/incidentApi.js
import axios from 'axios';

const BASE = 'http://localhost:8080/api/incidents';

/**
 * Fetch all incidents (all statuses).
 * Returns ApiResponse<List<IncidentResponse>>
 * Filtered to "In Progress" in the UI for the Link Incident dropdown.
 */
export const getAllIncidents = () => axios.get(`${BASE}/all`);

/** Fetch a single incident by ID */
export const getIncident = (incidentId) => axios.get(`${BASE}/${incidentId}`);

/** Fetch incidents by user (My Tickets) */
export const getIncidentsByUser = (userId) =>
  axios.get(BASE, { params: { userId } });

/** Fetch incidents assigned to a support person */
export const getIncidentsByAssignee = (assignedTo) =>
  axios.get(BASE, { params: { assignedTo } });

/** Create a new incident */
export const createIncident = (data) => axios.post(BASE, data);

/** Update an incident (status, priority, assignment) */
export const updateIncident = (incidentId, data) =>
  axios.put(`${BASE}/${incidentId}`, data);

/** Support resolves incident → status: Pending_User_Ack */
export const resolveIncident = (incidentId, resolutionNotes) =>
  axios.post(`${BASE}/${incidentId}/resolve`, { resolutionNotes });

/** User acknowledges resolution → status: Resolved */
export const acknowledgeIncident = (incidentId, userId) =>
  axios.post(`${BASE}/${incidentId}/user-acknowledge`, { userId });
