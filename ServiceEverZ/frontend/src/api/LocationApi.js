import {userAxios} from './axiosInstance';
 
export const getAllLocations = async () => {
  const response = await userAxios.get('/api/v1/admin/locations');
  return response.data;
};
 
export const createLocation = async (data) => {
  const response = await userAxios.post('/api/v1/admin/locations', data);
  return response.data;
};
 
export const mapLocationToUser = async (userId, locationId) => {
  const response = await userAxios.patch(`/api/v1/admin/users/${userId}/location`, {
    locationId,
  });
  return response.data;
};
 
export const updateLocation = async (id, data) => {
  const response = await userAxios.put(`/api/v1/admin/locations/${id}`, data);
  return response.data;
};
 
