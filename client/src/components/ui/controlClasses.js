import { cn } from '@/lib/cn';

export const controlClasses = (error) =>
  cn(
    'h-9 w-full rounded-md border bg-slate-900 px-3 text-sm text-slate-100 placeholder:text-slate-500',
    'focus:outline-none focus:ring-2 focus:ring-sky-500/60',
    'disabled:cursor-not-allowed disabled:opacity-60',
    error ? 'border-red-500/70' : 'border-slate-700',
  );
