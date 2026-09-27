import { useMutation } from '@tanstack/react-query';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/StatusMessage';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/features/auth/authContext';
import { loginInitialValues, loginSchema } from '@/features/auth/loginSchema';
import { useZodForm } from '@/hooks/useZodForm';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/';

  const form = useZodForm(loginSchema, loginInitialValues);
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => navigate(redirectTo, { replace: true }),
  });

  if (isAuthenticated && !loginMutation.isPending) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">okDriver CCTV Monitoring</h1>
          <p className="text-sm text-slate-400">Sign in to continue</p>
        </div>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
          className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/60 p-6"
        >
          <FormAlert>{loginMutation.error?.message}</FormAlert>
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            autoFocus
            {...form.register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            {...form.register('password')}
          />
          <Button type="submit" className="w-full" isLoading={loginMutation.isPending}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
