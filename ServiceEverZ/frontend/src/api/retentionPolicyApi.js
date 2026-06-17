// src/api/retentionPolicyApi.js
import { assetApi } from './assetApi';

const BASE = '/api/assets/data-management/retention-policies';

export const getAllRetentionPolicies = () =>
  assetApi.get(BASE).then((r) => r.data);

export const getActivePolicies = () =>
  assetApi.get(`${BASE}/active`).then((r) => r.data);

export const getRetentionPolicyById = (id) =>
  assetApi.get(`${BASE}/${id}`).then((r) => r.data);

export const getPoliciesByManager = (managerId) =>
  assetApi.get(`${BASE}/manager/${managerId}`).then((r) => r.data);

export const getPoliciesByType = (type) =>
  assetApi.get(`${BASE}/type/${type}`).then((r) => r.data);

export const createRetentionPolicy = (data) =>
  assetApi.post(BASE, data).then((r) => r.data);

export const updateRetentionPolicy = (id, data) =>
  assetApi.put(`${BASE}/${id}`, data).then((r) => r.data);

export const deleteRetentionPolicy = (id) =>
  assetApi.delete(`${BASE}/${id}`).then((r) => r.data);
