import { userAxios } from './axiosInstance';
 
export const orgApi = {
  getAllDepartments: () =>
    userAxios.get('/api/v1/admin/org/departments'),
 
  createDepartment: (data) =>
    userAxios.post('/api/v1/admin/org/departments', data),
 
  getAllDesignations: () =>
    userAxios.get('/api/v1/admin/org/designations'),
 
  getDesignationsByDepartment: (departmentId) =>
    userAxios.get(`/api/v1/admin/org/designations?departmentId=${departmentId}`),
 
  createDesignation: (data) =>
    userAxios.post('/api/v1/admin/org/designations', data),
};
 