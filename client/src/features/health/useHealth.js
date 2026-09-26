import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/apiClient';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiRequest('/health'),
    refetchInterval: 30_000,
  });
}
