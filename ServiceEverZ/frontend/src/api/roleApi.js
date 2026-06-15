// src/api/roleApi.js

import { roleAxios, userAxios } from './axiosInstance';

// ✅ Parse user safely from localStorage
const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('sez_user')) || {};
  } catch {
    return {};
  }
};

// ✅ Build headers dynamically
const getAuthHeaders = (singleRole = false) => {
  const user = getStoredUser();

  return {
    'Content-Type': 'application/json',
    'X-User-Roles': Array.isArray(user.roles)
      ? (singleRole ? user.roles[0] : user.roles.join(','))
      : '',
    'X-User-Email': user.email || '',
    'X-User-Id': user.userId ?? '',
  };
};

export const roleApi = {
  // ─────────────────────────────────────────
  // ✅ ROLE CRUD (role-service :8082)
  // ─────────────────────────────────────────

  getAllRoles: () =>
    roleAxios.get('/api/v1/admin/roles', {
      headers: getAuthHeaders(),
    }),

  getRoleById: (id) =>
    roleAxios.get(`/api/v1/admin/roles/${id}`, {
      headers: getAuthHeaders(),
    }),

  createRole: (data) =>
    roleAxios.post('/api/v1/admin/roles', data, {
      headers: getAuthHeaders(),
    }),

  updateRole: (id, data) =>
    roleAxios.put(`/api/v1/admin/roles/${id}`, data, {
      headers: getAuthHeaders(),
    }),

  deactivateRole: (id) =>
    roleAxios.delete(`/api/v1/admin/roles/${id}`, {
      headers: getAuthHeaders(),
    }),

  // ─────────────────────────────────────────
  // ✅ USER–ROLE MAPPING (role-service :8082)
  // ─────────────────────────────────────────

  assignRole: (userId, roleId) =>
    roleAxios.post(
      '/api/v1/admin/user-roles',
      { userId, roleId },
      {
        headers: getAuthHeaders(),
      }
    ),

    assignRoleBulk: (userIds, roleId) =>
  roleAxios.post(
    '/api/v1/admin/user-roles/bulk',
    { userIds, roleId },
    { headers: getAuthHeaders() }
  ),
 

  revokeRole: (userId, roleId) =>
    roleAxios.delete(
      `/api/v1/admin/user-roles/${userId}/roles/${roleId}`,
      {
        headers: getAuthHeaders(),
      }
    ),

  getRolesForUser: (userId) =>
    roleAxios.get(`/api/v1/admin/user-roles/${userId}/roles`, {
      headers: getAuthHeaders(),
    }),

  // ─────────────────────────────────────────
  // ✅ ROLE PERMISSIONS
  // ─────────────────────────────────────────

  savePermission: (payload) =>
    roleAxios.post('/api/v1/admin/role-permissions', payload, {
      headers: getAuthHeaders(),
    }),

  saveBulkPermissions: (payload) =>
    roleAxios.post('/api/v1/admin/role-permissions/bulk', payload, {
      headers: getAuthHeaders(),
    }),

  getRolePermissions: (roleId) =>
    roleAxios.get(`/api/v1/admin/role-permissions/${roleId}`, {
      headers: getAuthHeaders(),
    }),

  // ─────────────────────────────────────────
  // ✅ USERS (user-service :8081)
  // ─────────────────────────────────────────

  getUsers: (params = {}) =>
    userAxios.get('/api/v1/admin/users', {
      params,
      headers: getAuthHeaders(),
    }),
};
