import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { cameraKeys } from '@/features/cameras/useCameraQueries';
import * as dashboardApi from './dashboard.api';

export const FEED_LIMIT = 10;

// REST polling stands in for realtime updates until Socket.IO is added. The realtime layer
// should write to these query keys (setQueryData / invalidateQueries) and turn polling off.
export const POLL_INTERVALS = Object.freeze({
  summary: 30_000,
  cameras: 30_000,
  alerts: 15_000,
  detections: 15_000,
  activity: 30_000,
});

export const dashboardKeys = {
  all: ['dashboard'],
  summary: (detectionsSince) => [...dashboardKeys.all, 'summary', detectionsSince],
  activeAlerts: () => [...dashboardKeys.all, 'active-alerts'],
  recentDetections: () => [...dashboardKeys.all, 'recent-detections'],
  recentActivity: () => [...dashboardKeys.all, 'recent-activity'],
};

function startOfLocalDay() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

/** "Detections today" follows the operator's local day, so the key changes at midnight. */
export function useDashboardSummary() {
  const detectionsSince = startOfLocalDay();
  return useQuery({
    queryKey: dashboardKeys.summary(detectionsSince),
    queryFn: () => dashboardApi.getDashboardSummary(detectionsSince),
    refetchInterval: POLL_INTERVALS.summary,
  });
}

export function useActiveAlerts() {
  return useQuery({
    queryKey: dashboardKeys.activeAlerts(),
    queryFn: () => dashboardApi.getActiveAlerts(FEED_LIMIT),
    refetchInterval: POLL_INTERVALS.alerts,
  });
}

export function useRecentDetections() {
  return useQuery({
    queryKey: dashboardKeys.recentDetections(),
    queryFn: () => dashboardApi.getRecentDetections(FEED_LIMIT),
    refetchInterval: POLL_INTERVALS.detections,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(),
    queryFn: () => dashboardApi.getRecentActivity(FEED_LIMIT),
    refetchInterval: POLL_INTERVALS.activity,
  });
}

export function useRefreshDashboard() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
        queryClient.invalidateQueries({ queryKey: cameraKeys.lists() }),
      ]),
    [queryClient],
  );
}
