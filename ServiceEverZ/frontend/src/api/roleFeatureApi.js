// FILE: src/api/roleFeatureApi.js
import { userAxios } from './axiosInstance';
 
export const roleFeatureApi = {
 
  // ── Admin: get all roles with their features ──────────────────────────────
  getAll: () =>
    userAxios.get('/api/v1/admin/role-features'),
 
  // ── Admin: get features for one role ─────────────────────────────────────
  getForRole: (roleName) =>
    userAxios.get(`/api/v1/admin/role-features/${roleName}`),
 
  // ── Login enrichment: get enabled keys for a role ─────────────────────────
  getEnabledKeys: (roleName) =>
    userAxios.get(`/api/v1/admin/role-features/${roleName}/enabled-keys`),
 
  // ── Admin: toggle a single feature for a role ─────────────────────────────
  toggle: (roleName, featureKey, enabled) =>
    userAxios.patch('/api/v1/admin/role-features/toggle', {
      roleName, featureKey, enabled,
    }),
 
  // ── Admin: bulk toggle features for a role ────────────────────────────────
  bulkToggle: (roleName, featureKeys, enabled) =>
    userAxios.patch('/api/v1/admin/role-features/bulk-toggle', {
      roleName, featureKeys, enabled,
    }),
 
  // ── Admin: reset role to defaults ────────────────────────────────────────
  resetRole: (roleName) =>
    userAxios.delete(`/api/v1/admin/role-features/${roleName}/reset`),
};
 