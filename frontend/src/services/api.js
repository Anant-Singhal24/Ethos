import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Entity APIs
export const entityAPI = {
  search: (query, type, limit) => 
    api.get('/entities/search', { params: { query, type, limit } }),
  
  getById: (id) => 
    api.get(`/entities/${id}`),
  
  getAll: (type, page, limit) => 
    api.get('/entities', { params: { type, page, limit } }),
  
  getStats: () => 
    api.get('/entities/stats'),
  
  resolve: (identifiers) => 
    api.post('/entities/resolve', identifiers),
};

// Timeline APIs
export const timelineAPI = {
  getTimeline: (entityId, start, end) => 
    api.get(`/timeline/${entityId}`, { params: { start, end } }),
  
  getTodayTimeline: (entityId) => 
    api.get(`/timeline/${entityId}/today`),
  
  getTimelineWithPredictions: (entityId, start, end) => 
    api.get(`/timeline/${entityId}/with-predictions`, { params: { start, end } }),
};

// Alert APIs
export const alertAPI = {
  getAlerts: (status, type, severity) => 
    api.get('/alerts', { params: { status, type, severity } }),
  
  getStats: (timeWindow) => 
    api.get('/alerts/stats', { params: { timeWindow } }),
  
  checkAlerts: (thresholdHours) => 
    api.post('/alerts/check', {}, { params: { thresholdHours } }),
  
  acknowledge: (id, acknowledgedBy) => 
    api.patch(`/alerts/${id}/acknowledge`, { acknowledgedBy }),
  
  resolve: (id, resolvedBy, notes) => 
    api.patch(`/alerts/${id}/resolve`, { resolvedBy, notes }),
};

// Prediction APIs
export const predictionAPI = {
  predictState: (entityId, time) => 
    api.get(`/predictions/${entityId}/state`, { params: { time } }),
  
  predictNextLocation: (entityId) => 
    api.get(`/predictions/${entityId}/next-location`),
  
  detectAnomalies: (entityId, timeWindow) => 
    api.get(`/predictions/${entityId}/anomalies`, { params: { timeWindow } }),
};

export default api;
