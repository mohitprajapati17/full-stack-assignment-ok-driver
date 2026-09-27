import { apiRequest } from '@/lib/apiClient';

const getData = async (path, query) => (await apiRequest(path, { query })).data;

export const getDashboardSummary = (detectionsSince) =>
  getData('/dashboard/summary', { detectionsSince });

export const getActiveAlerts = (limit) => getData('/dashboard/active-alerts', { limit });

export const getRecentDetections = (limit) => getData('/dashboard/recent-detections', { limit });

export const getRecentActivity = (limit) => getData('/dashboard/recent-activity', { limit });
