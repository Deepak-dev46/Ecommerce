// src/api/rmoApi.js
// RMO Service — port 8085
// All endpoints require: Authorization: Bearer <rmo_jwt_token>
// rmoAxios already attaches Bearer token via interceptor in axiosInstance.js
 
import { rmoAxios } from './axiosInstance';
 
// ─── PROJECTS ─────────────────────────────────────────────────────────────────
 
export const rmoApi = {
  // GET /api/v1/rmo/projects → ProjectResponse[]
  getProjects: () =>
    rmoAxios.get('/api/v1/rmo/projects'),
 
  // GET /api/v1/rmo/projects/:id → ProjectResponse
  getProjectById: (id) =>
    rmoAxios.get(`/api/v1/rmo/projects/${id}`),
 
  getProjectsByUserId: (id) =>
    rmoAxios.get(`/api/v1/rmo/projects/${1}/members/${id}`),
 
  deleteProject: (id) =>
    rmoAxios.delete(`/api/v1/rmo/projects/${id}/members`),
 
  // POST /api/v1/rmo/projects
  // Body: { client, projectName, description, practice, businessUnit, region,
  //         department, engagementModel, displayName, projectShortName, type,
  //         category, clientCostCenter, costGroup, division,
  //         resourceOwnerId, l1ManagerId, l2ManagerId,
  //         clientOwner, reportingDetails }
  createProject: (data) =>
    rmoAxios.post('/api/v1/rmo/projects', data),
 
  // PUT /api/v1/rmo/projects/:id (all fields optional)
  updateProject: (id, data) =>
    rmoAxios.put(`/api/v1/rmo/projects/${id}`, data),
 
  // ─── PROJECT MEMBERS ────────────────────────────────────────────────────────
 
  // GET /api/v1/rmo/projects/:projectId/members
  getProjectMembers: (projectId) =>
    rmoAxios.get(`/api/v1/rmo/projects/${projectId}/members`),
 
  // POST /api/v1/rmo/projects/:projectId/members
  // Body: { members: [{ userId, membershipType: 'PRIMARY'|'SECONDARY' }] }
  addProjectMembers: (projectId, members) =>
    rmoAxios.post(`/api/v1/rmo/projects/${projectId}/members`, { members }),
 
  // PATCH /api/v1/rmo/projects/:projectId/members/:userId
  // Body: { membershipType?, active? }
  updateProjectMember: (projectId, userId, data) =>
    rmoAxios.patch(`/api/v1/rmo/projects/${projectId}/members/${userId}`, data),
 
  // DELETE /api/v1/rmo/projects/:projectId/members/:userId (soft delete)
  removeProjectMember: (projectId, userId) =>
    rmoAxios.delete(`/api/v1/rmo/projects/${projectId}/members/${userId}`),
 
  // ─── USERS (via RMO proxy) ──────────────────────────────────────────────────
 
  // GET /api/v1/rmo/users → UserResponse[]
  getUsers: () =>
    rmoAxios.get('/api/v1/rmo/users'),
 
  // GET /api/v1/rmo/users/:userId
  getUserById: (userId) =>
    rmoAxios.get(`/api/v1/rmo/users/${userId}`),
 
  // GET /api/v1/rmo/users/:userId/projects
  getUserProjects: (userId) =>
    rmoAxios.get(`/api/v1/rmo/users/${userId}/projects`),
 
  // GET /api/v1/rmo/users/:userId/roles → string[]
  getUserRoles: (userId) =>
    rmoAxios.get(`/api/v1/rmo/users/${userId}/roles`),
 
  // GET /api/v1/rmo/users/roles → RoleResponse[]
  getRoles: () =>
    rmoAxios.get('/api/v1/rmo/users/roles'),
 
  // POST /api/v1/rmo/users/:userId/roles/:roleId
  // RMO can assign: RESOURCE_OWNER, APPROVAL_MANAGER_L1, APPROVAL_MANAGER_L2
  assignRole: (userId, roleId) =>
    rmoAxios.post(`/api/v1/rmo/users/${userId}/roles/${roleId}`),
 
  // DELETE /api/v1/rmo/users/:userId/roles/:roleId
  removeRole: (userId, roleId) =>
    rmoAxios.delete(`/api/v1/rmo/users/${userId}/roles/${roleId}`),
};
 
// ─── ENUMS (backend-aligned) ──────────────────────────────────────────────────
export const RMO_DEPARTMENTS = [
  'HR','ENGINEERING','FINANCE','OPERATIONS',
  'SUPPORT','MANAGEMENT','SALES','LEGAL',
];
export const RMO_ENGAGEMENT_MODELS = ['T&M','FIXED_PRICE','RETAINER','MILESTONE'];
export const RMO_PROJECT_STATUSES  = ['ACTIVE','INACTIVE','COMPLETED','ON_HOLD'];
export const RMO_MEMBERSHIP_TYPES  = ['PRIMARY','SECONDARY'];
 
// Roles RMO can assign (backend enforced)
export const RMO_ASSIGNABLE_ROLES  = [
  'RESOURCE_OWNER','APPROVAL_MANAGER_L1','APPROVAL_MANAGER_L2',
];
 
 