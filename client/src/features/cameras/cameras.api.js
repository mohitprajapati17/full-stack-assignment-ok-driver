import { apiRequest } from '@/lib/apiClient';

export async function listCameras(params) {
  const { data, pagination } = await apiRequest('/cameras', { query: params });
  return { items: data, pagination };
}

export async function getCameraFilterOptions() {
  const { data } = await apiRequest('/cameras/filter-options');
  return data;
}

export async function getCamera(id) {
  const { data } = await apiRequest(`/cameras/${id}`);
  return data;
}

export async function createCamera(payload) {
  const { data } = await apiRequest('/cameras', { method: 'POST', body: payload });
  return data;
}

export async function updateCamera(id, payload) {
  const { data } = await apiRequest(`/cameras/${id}`, { method: 'PUT', body: payload });
  return data;
}

export async function updateCameraStatus(id, payload) {
  const { data } = await apiRequest(`/cameras/${id}/status`, { method: 'PATCH', body: payload });
  return data;
}

export async function disableCamera(id) {
  const { data } = await apiRequest(`/cameras/${id}`, { method: 'DELETE' });
  return data;
}
