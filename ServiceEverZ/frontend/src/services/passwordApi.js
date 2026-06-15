// src/services/passwordApi.js
import { userAxios } from '../api/axiosInstance';
 
export const passwordApi = {
  // 3.1 — Save/Update policy
  savePolicy: (data) =>
    userAxios.post('/api/v1/admin/password-policy', data),
 
  // 3.2 — Get current policy
  getPolicy: () =>
    userAxios.get('/api/v1/admin/password-policy'),
};