import { createContext, useContext } from 'react';

export const ROLES = Object.freeze({ ADMIN: 'ADMIN', OPERATOR: 'OPERATOR' });

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
