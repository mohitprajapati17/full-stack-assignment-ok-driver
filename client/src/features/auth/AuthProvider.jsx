import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { UNAUTHORIZED_EVENT, tokenStorage } from '@/lib/tokenStorage';
import { fetchCurrentUser, login as loginRequest } from './auth.api';
import { AuthContext } from './authContext';

const CURRENT_USER_KEY = ['auth', 'me'];

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => tokenStorage.get());

  const currentUser = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    staleTime: Infinity,
    retry: false,
  });

  const logout = useCallback(() => {
    tokenStorage.clear();
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  const login = useCallback(
    async (credentials) => {
      const result = await loginRequest(credentials);
      tokenStorage.set(result.token);
      queryClient.setQueryData(CURRENT_USER_KEY, result.user);
      setToken(result.token);
      return result.user;
    },
    [queryClient],
  );

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const value = useMemo(() => {
    const user = token ? (currentUser.data ?? null) : null;
    return {
      user,
      isAuthenticated: Boolean(user),
      isLoading: Boolean(token) && currentUser.isPending,
      hasRole: (...roles) => Boolean(user && roles.includes(user.role)),
      login,
      logout,
    };
  }, [token, currentUser.data, currentUser.isPending, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
