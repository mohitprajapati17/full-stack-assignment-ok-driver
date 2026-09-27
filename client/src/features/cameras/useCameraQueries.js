import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as camerasApi from './cameras.api';

export const cameraKeys = {
  all: ['cameras'],
  lists: () => [...cameraKeys.all, 'list'],
  list: (params) => [...cameraKeys.lists(), params],
  details: () => [...cameraKeys.all, 'detail'],
  detail: (id) => [...cameraKeys.details(), id],
  filterOptions: () => [...cameraKeys.all, 'filter-options'],
};

export function useCameraList(params, options) {
  return useQuery({
    queryKey: cameraKeys.list(params),
    queryFn: () => camerasApi.listCameras(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useCamera(id) {
  return useQuery({
    queryKey: cameraKeys.detail(id),
    queryFn: () => camerasApi.getCamera(id),
    enabled: Boolean(id),
  });
}

export function useCameraFilterOptions() {
  return useQuery({
    queryKey: cameraKeys.filterOptions(),
    queryFn: camerasApi.getCameraFilterOptions,
    staleTime: 5 * 60_000,
  });
}

/** After any write: cache the returned camera and refetch lists and filter options. */
function useCameraMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (camera) => {
      queryClient.setQueryData(cameraKeys.detail(camera.id), camera);
      queryClient.invalidateQueries({ queryKey: cameraKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cameraKeys.filterOptions() });
    },
  });
}

export const useCreateCamera = () => useCameraMutation(camerasApi.createCamera);

export const useUpdateCamera = (id) =>
  useCameraMutation((payload) => camerasApi.updateCamera(id, payload));

export const useUpdateCameraStatus = (id) =>
  useCameraMutation((payload) => camerasApi.updateCameraStatus(id, payload));

export const useDisableCamera = () => useCameraMutation(camerasApi.disableCamera);
