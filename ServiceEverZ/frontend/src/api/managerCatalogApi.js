// src/api/managerCatalogApi.js
import { authAxios } from './axiosInstance';

// ─── Manager: Service Catalog Tree ──────────────────────────────────────────
// FIX: Was /api/manager/service-catalog/tree (double /api prefix).
// Controller class maps to "api/service-catalog", so manager routes
// must be under /api/service-catalog/manager/...
export const getCatalogTree = () =>
  authAxios.get('/api/service-catalog/manager/tree');

// ─── Manager: Category ───────────────────────────────────────────────────────
export const createCategory = (body) =>
  authAxios.post('/api/service-catalog/manager/categories', body);

export const checkCategoryExists = (name, type) =>
  authAxios.get(
    `/api/service-catalog/manager/categories/exists?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`
  );

// ─── Manager: SubCategory ────────────────────────────────────────────────────
export const createSubCategory = (body) =>
  authAxios.post('/api/service-catalog/manager/subcategories', body);

export const checkSubCategoryExists = (name, catId) =>
  authAxios.get(
    `/api/service-catalog/manager/subcategories/exists?name=${encodeURIComponent(name)}&categoryId=${catId}`
  );

// ─── Manager: Item ───────────────────────────────────────────────────────────
export const createItem = (body) =>
  authAxios.post('/api/service-catalog/manager/items', body);

// ─── Manager: Toggle Service Active/Inactive ─────────────────────────────────
// FIX: Moved here from serviceCatalogApi.js so authAxios sends JWT + X-User-Role
// automatically via the interceptor. The controller checks X-User-Role = ITSM_MANAGER.
export const toggleServiceActive = (id) =>
  authAxios.patch(`/api/service-catalog/services/${id}/toggle-active`);
