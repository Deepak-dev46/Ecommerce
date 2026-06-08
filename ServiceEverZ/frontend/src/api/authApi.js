// FILE: src/api/authApi.js
import { authAxios, tokenUtils } from './axiosInstance';
 
export const authApi = {
  login: (data) => authAxios.post('/api/v1/auth/login', data),
  verifyOtp: (data) => authAxios.post('/api/v1/auth/verify-otp', data),
 
  forgotPassword: (data) => authAxios.post('/api/v1/auth/forgot-password', data),
  verifyResetOtp: (data) => authAxios.post('/api/v1/auth/verify-reset-otp', data),
  resetPassword: (data) => authAxios.post('/api/v1/auth/reset-password', data),
  resendOtp: (data) => authAxios.post('/api/v1/auth/resend-otp', data),
 
  saveLoginSession: (responseData) => {
    alert(responseData.userId);
    if (!responseData) return;
    if (responseData.token) tokenUtils.setToken(responseData.token);
    
 
    tokenUtils.setUser({
      userId:         responseData.userId,
      email:          responseData.email      || '',
      fullName:       responseData.fullName   || '',
      // roles = assigned roles only (ADMIN | RMO | END_USER)
      roles:          responseData.roles      || [],
      // effectiveRoles = roles + project-derived roles
      // (APPROVAL_MANAGER_L1, APPROVAL_MANAGER_L2, RESOURCE_OWNER, ITSM_MANAGER)
      // This is what the sidebar and ProtectedRoute use for access decisions
      effectiveRoles: responseData.effectiveRoles || responseData.roles || [],
      firstLogin:     responseData.firstLogin || false,
      status:         responseData.status     || '',
    });
  },
 
  logout: async () => {
    tokenUtils.clearAll();
    return Promise.resolve();
  },
};
 
export { tokenUtils };
 