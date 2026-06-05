import { userAxios } from "./axiosInstance";
 
// GET profile
export const getProfile = () =>
  userAxios.get("/api/v1/users/profile").then((r) => r.data);
 
// PUT profile — editable fields: firstName, lastName, mobile
export const updateProfile = (data) =>
  userAxios.put("/api/v1/users/profile", data).then((r) => r.data);
 
// POST profile photo — multipart/form-data with field "file"
// Backend: POST /api/v1/users/profile/photo  consumes multipart/form-data

 
// POST change password (logged-in user)
export const changePassword = (currentPassword, newPassword) =>
  userAxios
    .post("/api/v1/users/change-password", { currentPassword, newPassword })
    .then((r) => r.data);
 
// POST change first/forced password
export const changeFirstPassword = (data) =>
  userAxios
    .post("/api/v1/users/change-first-password", data)
    .then((r) => r.data);
    
 