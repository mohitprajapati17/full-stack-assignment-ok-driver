import { apiRequest } from '@/lib/apiClient';

export async function login(credentials) {
  const { data } = await apiRequest('/auth/login', { method: 'POST', body: credentials });
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiRequest('/auth/me');
  return data;
}
