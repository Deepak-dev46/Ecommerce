// src/api/csatApi.js
// Sub-module 02 — Feedback (CSAT)

import { ticketAxios } from './axiosInstance';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/** Public axios (no auth token) — used for feedback form which is accessed from email link */
const publicAxios = axios.create({ baseURL: BASE, timeout: 15000,
  headers: { 'Content-Type': 'application/json' } });

/**
 * Decode survey token from email link → returns pre-filled form data.
 * Called publicly (user not necessarily logged in).
 */
export const getSurveyForm = (token) =>
  publicAxios.get('/api/csat/survey-form', { params: { token } });

/**
 * Submit user feedback.
 * @param {Object} body  { ticketId?, ticketNumber?, requesterName?, requesterUserId?,
 *                         resolvedById, resolvedByName, categoryName,
 *                         rating, comments, anonymous }
 */
export const submitFeedback = (body) =>
  publicAxios.post('/api/csat/submit', body);

export const triggerFeedback = (id,mail) =>
  ticketAxios.post(`/api/csat/trigger/${id}?requesterEmail=${mail}`);

/**
 * ITSM Manager dashboard — all CSAT records.
 * @param {Object} filters  { agentId?, ctegory?, from?, to? }
 */
export const getCsatDashboard = (filters = {}) =>
  ticketAxios.get('/api/csat/dashboard', { params: filters });
