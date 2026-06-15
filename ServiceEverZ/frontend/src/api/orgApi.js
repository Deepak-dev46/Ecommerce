// FILE: src/api/orgApi.js
import { userAxios } from './axiosInstance';
 
export const orgApi = {
  // ── Departments ─────────────────────────────────────────────────────────
  getAllDepartments: () =>
    userAxios.get('/api/v1/admin/org/departments'),
 
  createDepartment: (data) =>
    userAxios.post('/api/v1/admin/org/departments', data),
 
  updateDepartment: (id, data) =>
    userAxios.put(`/api/v1/admin/org/departments/${id}`, data),
 
  deleteDepartment: (id) =>
    userAxios.delete(`/api/v1/admin/org/departments/${id}`),
 
  disableDepartment: (id) =>
    userAxios.patch(`/api/v1/admin/org/departments/${id}/disable`),
 
  // ── Designations ─────────────────────────────────────────────────────────
  getAllDesignations: () =>
    userAxios.get('/api/v1/admin/org/designations'),
 
  getDesignationsByDepartment: (departmentId) =>
    userAxios.get(`/api/v1/admin/org/designations?departmentId=${departmentId}`),
 
  createDesignation: (data) =>
    userAxios.post('/api/v1/admin/org/designations', data),
 
  updateDesignation: (id, data) =>
    userAxios.put(`/api/v1/admin/org/designations/${id}`, data),
 
  deleteDesignation: (id) =>
    userAxios.delete(`/api/v1/admin/org/designations/${id}`),
 
  disableDesignation: (id) =>
    userAxios.patch(`/api/v1/admin/org/designations/${id}/disable`),
};
 
 