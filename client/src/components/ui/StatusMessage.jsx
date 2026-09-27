import { cn } from '@/lib/cn';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 py-10 text-sm text-slate-400" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      {label}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', error, action }) {
  return (
    <div className="space-y-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4" role="alert">
      <p className="font-medium text-red-300">{title}</p>
      {error?.message && <p className="text-sm text-red-200/80">{error.message}</p>}
      {action}
    </div>
  );
}

export function EmptyState({ title, description, action, className }) {
  return (
    <div className={cn('space-y-2 py-12 text-center', className)}>
      <p className="font-medium text-slate-200">{title}</p>
      {description && <p className="text-sm text-slate-400">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function FormAlert({ children }) {
  if (!children) return null;
  return (
    <div
      className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
      role="alert"
    >
      {children}
    </div>
  );
}
