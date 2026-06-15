import { userAxios } from './axiosInstance';
 
export const reportsApi = {
  downloadUsersReport: (format = 'excel') =>
    userAxios.get(`/api/v1/reports/users`, {
      params: { format },
      responseType: 'blob',
    }),
 
  downloadRolesReport: (format = 'excel', sheet = null) =>
    userAxios.get(`/api/v1/reports/roles`, {
      params: sheet ? { format, sheet } : { format },
      responseType: 'blob',
    }),
 
  downloadActivityReport: (format = 'excel') =>
    userAxios.get(`/api/v1/reports/user-activity`, {
      params: { format },
      responseType: 'blob',
    }),
};
 
 