// src/api/axiosInstance.js
// ✅ FIX: ticketAxios was missing a JWT interceptor.
// All calls to ticket-service through the API Gateway require a Bearer token.
// Added attachBearerToken + 401 redirect for ticketAxios.
// ✅ FIX: tokenUtils now imported from utils/tokenUtils to avoid duplication
//         and ensure isTokenValid() is available everywhere.

import axios from 'axios';
import { tokenUtils } from '../utils/tokenUtils';
export { tokenUtils };

const AUTH_BASE_URL = 'http://localhost:8080';  // API Gateway
const USER_BASE_URL = 'http://localhost:8080';  // user-service (direct, has JWT filter)
const ROLE_BASE_URL = 'http://localhost:8080';  // role-service (direct, has JWT filter)
const RMO_BASE_URL  = 'http://localhost:8080';  // rmo-service  (direct, has JWT filter)

const createInstance = (baseURL) =>
  axios.create({
    baseURL,
    timeout: 20000,
   // headers: { 'Content-Type': 'application/json' },
  });

export const authAxios   = createInstance(AUTH_BASE_URL);
export const userAxios   = createInstance(USER_BASE_URL);
export const roleAxios   = createInstance(ROLE_BASE_URL);
export const rmoAxios    = createInstance(RMO_BASE_URL);
export const ticketAxios = createInstance(AUTH_BASE_URL);  // ticket-service via gateway

// ── userAxios: JWT + user-context headers ────────────────────────────────────
// userAxios.interceptors.request.use(
//   (config) => {
//     const user  = tokenUtils.getUser();
//     const token = tokenUtils.getToken();

//     if (token) config.headers.Authorization = `Bearer ${token}`;

//     config.headers['X-User-Id']    = user?.userId ?? '';
//     config.headers['X-User-Email'] = user?.email  ?? '';
//     config.headers['X-User-Roles'] =
//       Array.isArray(user?.roles) && user.roles.length
//         ? user.roles.join(',')
//         : '';

//     return config;
//   },
//   (error) => Promise.reject(error)
// );


// ── Hari modifyed for profile photo update ────────────────────────────────────
userAxios.interceptors.request.use((config) => {
  const user  = tokenUtils.getUser();
  const token = tokenUtils.getToken();
 
  if (token) config.headers.Authorization = `Bearer ${token}`;
 
  config.headers['X-User-Id']    = user?.userId ?? '';
  config.headers['X-User-Email'] = user?.email  ?? '';
  config.headers['X-User-Roles'] =
    Array.isArray(user?.roles) && user.roles.length
      ? user.roles.join(',') : '';
 
  // ✅ Only force JSON if it's NOT a FormData upload
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
 
  return config;
},
(error) => Promise.reject(error)
);
 

// ── Shared JWT attach helper ──────────────────────────────────────────────────
const attachBearerToken = (config) => {
  const token = tokenUtils.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

roleAxios.interceptors.request.use(attachBearerToken,   (e) => Promise.reject(e));
rmoAxios.interceptors.request.use(attachBearerToken,    (e) => Promise.reject(e));
ticketAxios.interceptors.request.use(attachBearerToken, (e) => Promise.reject(e));

// ── 401 redirect for all authenticated instances ──────────────────────────────
[ticketAxios, roleAxios, rmoAxios, userAxios].forEach((instance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const url = error.config?.url || '';

      // Exclude public CSAT endpoints from redirect
      const isPublicCsat =
        url.includes('/api/csat/survey-form') ||
        url.includes('/api/csat/submit');

      // if (error.response?.status === 401 && !isPublicCsat) {
      //   tokenUtils.clearAll();
      //   window.location.href = '/login';
      // }

      return Promise.reject(error);
    }
  );
});
