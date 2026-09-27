import { Navigate, useLocation } from 'react-router';
import { Button } from '@/components/ui/Button';
import { EmptyState, LoadingState } from '@/components/ui/StatusMessage';
import { useAuth } from './authContext';

export function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingState label="Checking session…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

export function RequireRole({ roles, children }) {
  const { hasRole } = useAuth();

  if (!hasRole(...roles)) {
    return (
      <EmptyState
        title="Access denied"
        description="You don't have permission to view this page."
        action={
          <Button variant="secondary" to="/">
            Go home
          </Button>
        }
      />
    );
  }
  return children;
}

/** Renders children only for the given roles; use for buttons and other inline actions. */
export function RoleGate({ roles, children }) {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? children : null;
}
