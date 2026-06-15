import { assetApi } from './assetApi';

// ── Retention Policies (ITSM Manager) ────────────────────────────────────────
export const createRetentionPolicy     = (data)        => assetApi.post('/api/assets/data-management/retention-policies', data);
export const getAllRetentionPolicies   = ()             => assetApi.get('/api/assets/data-management/retention-policies');
export const getActiveRetentionPolicies = ()           => assetApi.get('/api/assets/data-management/retention-policies/active');
export const getRetentionPolicyById   = (id)           => assetApi.get(`/api/assets/data-management/retention-policies/${id}`);
export const getRetentionPoliciesByManager = (managerId) => assetApi.get(`/api/assets/data-management/retention-policies/manager/${managerId}`);
export const updateRetentionPolicy    = (id, data)     => assetApi.put(`/api/assets/data-management/retention-policies/${id}`, data);
export const deleteRetentionPolicy    = (id)           => assetApi.delete(`/api/assets/data-management/retention-policies/${id}`);

// ── Backup Schedules (Support Personnel) ─────────────────────────────────────
export const createBackupSchedule     = (data)         => assetApi.post('/api/assets/data-management/backup-schedules', data);
export const getAllBackupSchedules     = ()             => assetApi.get('/api/assets/data-management/backup-schedules');
export const getBackupScheduleById    = (id)           => assetApi.get(`/api/assets/data-management/backup-schedules/${id}`);
export const getBackupSchedulesBySp   = (spId)         => assetApi.get(`/api/assets/data-management/backup-schedules/sp/${spId}`);
export const getBackupSchedulesByStatus = (status)     => assetApi.get(`/api/assets/data-management/backup-schedules/status/${status}`);
export const getBackupSchedulesByAsset  = (assetId)    => assetApi.get(`/api/assets/data-management/backup-schedules/asset/${assetId}`);
export const getGenericBackupSchedules  = ()           => assetApi.get('/api/assets/data-management/backup-schedules/generic');
export const getAssetSpecificBackupSchedules = ()      => assetApi.get('/api/assets/data-management/backup-schedules/asset-specific');
export const updateBackupSchedule     = (id, data)     => assetApi.put(`/api/assets/data-management/backup-schedules/${id}`, data);
export const deleteBackupSchedule     = (id)           => assetApi.delete(`/api/assets/data-management/backup-schedules/${id}`);
