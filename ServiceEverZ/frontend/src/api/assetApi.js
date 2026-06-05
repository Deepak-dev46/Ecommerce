import axios from 'axios';
import { tokenUtils } from '../utils/tokenUtils';
 
export const assetApi = axios.create({
  baseURL: import.meta.env.VITE_ASSET_SERVICE_URL || 'http://localhost:8085',
});
 
const attach = (config) => {
  const t = tokenUtils.getToken()();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
};
const handle401 = (err) => {
  // FIX: Redirect to '/' (root) on 401 — there is no '/login' route in this app.
  if (err.response?.status === 401) { tokenUtils.clearAll()(); window.location.href = '/'; }
  return Promise.reject(err);
};
assetApi.interceptors.request.use(attach);
assetApi.interceptors.response.use(r => r, handle401);
 
// ── Asset CRUD ──────────────────────────────────────────────────────────────
export const addAsset            = (data)           => assetApi.post('/api/assets', data);
export const updateAsset         = (id, data)       => assetApi.put(`/api/assets/${id}`, data);
export const updateAssetStatus   = (id, status, remarks) => assetApi.put(`/api/assets/${id}/status`, { status, remarks: remarks || undefined });
export const deleteAsset         = (id)             => assetApi.delete(`/api/assets/${id}`);
export const getAssetById        = (id)             => assetApi.get(`/api/assets/${id}`);
export const getAllAssets         = ()               => assetApi.get('/api/assets');
export const getAssetsByStatus   = (status)         => assetApi.get(`/api/assets/status/${status}`);
export const getAssetsByCategory = (category)       => assetApi.get(`/api/assets/category/${category}`);
export const getAssetsByOwnership= (type)           => assetApi.get(`/api/assets/ownership/${type}`);
export const getAssetsByUser     = (userId)         => assetApi.get(`/api/assets/user/${userId}`);
export const searchAssets           = (keyword)        => assetApi.get('/api/assets/search', { params: { keyword } });
export const searchAvailableAssets  = (keyword, category) => assetApi.get('/api/assets/search/available', { params: { keyword, ...(category ? { category } : {}) } });
export const getExpiringSoon     = (days = 30)      => assetApi.get('/api/assets/rental/expiring-soon', { params: { days } });
export const markRentalReturned  = (id, data)       => assetApi.put(`/api/assets/${id}/rental/return`, data);
export const getAssetStats       = ()               => assetApi.get('/api/assets/stats');
export const bulkImportAssets    = (file, spId)     => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('spId', spId);
  return assetApi.post('/api/assets/bulk-import', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
 
// ── Asset Mappings ───────────────────────────────────────────────────────────
export const createMapping          = (data)       => assetApi.post('/api/asset-mappings', data);
export const spDecision             = (id, data)   => assetApi.put(`/api/asset-mappings/${id}/sp-decision`, data);
export const managerDecision        = (id, data)   => assetApi.put(`/api/asset-mappings/${id}/manager-decision`, data);
export const submitAdditionalDetails= (id, data)   => assetApi.put(`/api/asset-mappings/${id}/additional-details`, data);
export const releaseAsset           = (id, data)   => assetApi.put(`/api/asset-mappings/${id}/release`, data);
export const getMappingById         = (id)         => assetApi.get(`/api/asset-mappings/${id}`);
export const getAllMappings          = ()           => assetApi.get('/api/asset-mappings');
export const getMappingsByUser      = (userId)     => assetApi.get(`/api/asset-mappings/user/${userId}`);
export const getMappingsBySp        = (spId)       => assetApi.get(`/api/asset-mappings/sp/${spId}`);
export const getMappingsByAsset     = (assetId)    => assetApi.get(`/api/asset-mappings/asset/${assetId}`);
export const getPendingSpApprovals  = ()           => assetApi.get('/api/asset-mappings/pending/sp');
export const getPendingManagerApprovals = ()       => assetApi.get('/api/asset-mappings/pending/manager');
export const getHistoryByAsset      = (assetId)    => assetApi.get(`/api/asset-mappings/history/asset/${assetId}`);
export const getHistoryByUser       = (userId)     => assetApi.get(`/api/asset-mappings/history/user/${userId}`);
 
 