import {userAxios} from "./axiosInstance";
 
export const getAdminPasswordPolicy = () =>
  userAxios.get("/api/v1/admin/password-policy");
 
export const saveAdminPasswordPolicy = (data) =>
  userAxios.post("/api/v1/admin/password-policy", data);
 
export const getUserPasswordPolicy = () =>
  userAxios.get("/api/v1/users/password-policy");
 