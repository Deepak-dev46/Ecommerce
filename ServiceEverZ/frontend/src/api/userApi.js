// FILE: src/api/userApi.js
import { userAxios } from './axiosInstance';
 
export const userApi = {
  createUser: (data) =>
    userAxios.post('/api/v1/admin/users', data),
 
  createBulkUsers: (users) =>
    userAxios.post('/api/v1/admin/users/bulk', users),
 
  uploadCSV: (file) => {
    const form = new FormData();
    form.append('file', file);
    return userAxios.post('/api/v1/admin/users/upload-csv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
 

  deleteUserById: (id) =>
    userAxios.delete(`/api/v1/admin/users/${id}`),
 
  getAllUsers: (params) =>
    userAxios.get('/api/v1/admin/users', { params }),
 
  getUserById: (id) =>
    userAxios.get(`/api/v1/admin/users/${id}`),
 
  updateUser: (id, data) =>
    userAxios.put(`/api/v1/admin/users/${id}`, data),
 
  disableUser: (id) =>
    userAxios.patch(`/api/v1/admin/users/${id}/disable`),
 
  getAllLocations: () =>
    userAxios.get('/api/v1/admin/locations'),
 
  createLocation: (data) =>
    userAxios.post('/api/v1/admin/locations', data),
 
  mapLocation: (userId, data) =>
    userAxios.patch(`/api/v1/admin/users/${userId}/location`, data),
 
  deleteLocation: (id) =>
    userAxios.delete(`/api/v1/admin/locations/${id}`),
 
  updateLocation: (id, payload) =>
    userAxios.put(`/api/v1/admin/locations/${id}`, payload),
 
  // ── NEW: manager-related ──────────────────────────────────────────────────
  // Returns users who hold ITSM_MANAGER / APPROVAL_MANAGER_L1 / L2 / RESOURCE_OWNER
  // Optional ?role=ITSM_MANAGER to filter to a specific role
  getEligibleManagers: (role) =>
    userAxios.get('/api/v1/admin/users/eligible-managers', {
      params: role ? { role } : {},
    }),
 
  // Returns all END_USERs whose managerId = given managerId
  getUsersByManager: (managerId) =>
    userAxios.get(`/api/v1/admin/users/by-manager/${managerId}`),

  setActive: (email) =>
    userAxios.post(`/api/v1/admin/users/setActive/${email}`),
};
 