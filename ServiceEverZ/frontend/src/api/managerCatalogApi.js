// src/api/managerCatalogApi.js
// ✅ FIX: Was importing `userApi` which does not exist in axiosInstance.js.
//         Changed to `authAxios` which points to the API Gateway (localhost:8080).
//         The gateway routes /api/manager/** → service-catalog (port 9086),
//         so these calls must go through the gateway, not the user-service.

import { authAxios } from './axiosInstance';

// ─── Manager: Service Catalog Tree ───────────────────────────────────────────
export const getCatalogTree         = ()             => authAxios.get('/api/manager/service-catalog/tree');

// ─── Manager: Category (= Service Type anchor) ────────────────────────────────
export const createCategory         = (body)         => authAxios.post('/api/manager/categories', body);
export const checkCategoryExists    = (name, type)   => authAxios.get(`/api/manager/categories/exists?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`);

// ─── Manager: SubCategory ─────────────────────────────────────────────────────
export const createSubCategory      = (body)         => authAxios.post('/api/manager/subcategories', body);
export const checkSubCategoryExists = (name, catId)  => authAxios.get(`/api/manager/subcategories/exists?name=${encodeURIComponent(name)}&categoryId=${catId}`);

// ─── Manager: Item ────────────────────────────────────────────────────────────
export const createItem             = (body)         => authAxios.post('/api/manager/items', body);
