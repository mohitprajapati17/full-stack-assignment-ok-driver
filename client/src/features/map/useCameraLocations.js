import { useQuery } from '@tanstack/react-query';
import { cameraKeys } from '@/features/cameras/useCameraQueries';
import { apiRequest } from '@/lib/apiClient';

const LOCATIONS_POLL_INTERVAL = 30_000;

async function getCameraLocations() {
  const { data } = await apiRequest('/cameras/locations');
  return data;
}

/** Every active camera with its coordinates and status, refreshed periodically. */
export function useCameraLocations() {
  return useQuery({
    queryKey: cameraKeys.locations(),
    queryFn: getCameraLocations,
    refetchInterval: LOCATIONS_POLL_INTERVAL,
  });
}
