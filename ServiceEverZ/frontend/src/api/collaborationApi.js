// frontend/src/api/collaborationApi.js

import axios from 'axios';
import { ticketAxios, tokenUtils } from './axiosInstance';

// Internal axios through gateway — same base URL as ticketAxios
const gatewayAxios = axios.create({ baseURL: 'http://localhost:8080', timeout: 15000 });

// Use tokenUtils.getToken() — same key ("sez_token") as every other axios instance
gatewayAxios.interceptors.request.use((config) => {
  const token = tokenUtils.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Existing collaboration endpoints ────────────────────────────────────────

export const getInternalNotes = (ticketId) =>
  ticketAxios.get(`/api/internal-notes/${ticketId}`);

export const addInternalNote = (body) =>
  ticketAxios.post('/api/internal-notes', body);

export const getMentionSuggestions = (query) =>
  ticketAxios.get('/api/internal-notes/mention-suggestions', { params: { query } });

// ── Fetch all support agents for @mention auto-suggestion ───────────────────
//
// Step 1 — GET /api/v1/internal/roles/by-name/SUPPORT_PERSONNEL/user-ids
//           role-service returns List<Long> of userIds
// Step 2 — GET /api/v1/internal/users/by-ids?ids=1,2,...
//           user-service returns List<UserResponse>
// Step 3 — filter client-side by query on every keystroke
//
export const getSupportAgents = async (query = '') => {
  try {
    // Step 1: get userIds for SUPPORT_PERSONNEL role
    const roleRes = await gatewayAxios.get(
      '/api/v1/internal/roles/by-name/SUPPORT_PERSONNEL/user-ids'
    );

    const userIds = Array.isArray(roleRes.data) ? roleRes.data : [];
    if (userIds.length === 0) return [];

    // Step 2: resolve full user details
    const userRes = await gatewayAxios.get('/api/v1/internal/users/by-ids', {
      params: { ids: userIds.join(',') },
    });

    const agents = (userRes.data || []).map((u) => ({
      userId:   u.id,
      fullName: u.fullName || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
      email:    u.email,
    }));

    // Step 3: client-side filter
    if (!query) return agents;
    const q = query.toLowerCase();
    return agents.filter(
      (a) =>
        a.fullName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
    );
  } catch (err) {
    console.error('getSupportAgents failed:', err.response?.status, err.message);
    return [];
  }
};
