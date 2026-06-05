// src/api/backupScheduleApi.js
import { assetApi } from './assetApi';
 
const BASE = '/api/assets/data-management/backup-schedules';
 
// ── READ ──────────────────────────────────────────────────────────────────────
 
export const getAllBackupSchedules = () =>
  assetApi.get(BASE).then((r) => r.data);
 
export const getBackupScheduleById = (id) =>
  assetApi.get(`${BASE}/${id}`).then((r) => r.data);
 
export const getUpcomingBackupSchedules = () =>
  assetApi.get(`${BASE}/upcoming`).then((r) => r.data);
 
export const getBackupSchedulesByStatus = (status) =>
  assetApi.get(`${BASE}/status/${status}`).then((r) => r.data);
 
export const getBackupSchedulesByAsset = (assetId) =>
  assetApi.get(`${BASE}/asset/${assetId}`).then((r) => r.data);
 
export const getGenericBackupSchedules = () =>
  assetApi.get(`${BASE}/generic`).then((r) => r.data);
 
export const getAssetSpecificBackupSchedules = () =>
  assetApi.get(`${BASE}/asset-specific`).then((r) => r.data);
 
export const getNearingBackupSchedules = (days = 10) =>
  assetApi.get(`${BASE}/nearing`, { params: { days } }).then((r) => r.data);
 
export const getAllBackupSchedulesByNextBackupDate = () =>
  assetApi.get(`${BASE}/by-next-backup-date`).then((r) => r.data);
 
// ── WRITE ─────────────────────────────────────────────────────────────────────
 
export const createBackupSchedule = (data) => {
  const payload = { ...data, frequency: data.frequency || 'DAILY' };
  return assetApi.post(BASE, payload).then((r) => r.data);
};
 
export const updateBackupSchedule = (id, data) =>
  assetApi.put(`${BASE}/${id}`, data).then((r) => r.data);
 
export const deleteBackupSchedule = (id) =>
  assetApi.delete(`${BASE}/${id}`).then((r) => r.data);
 
 