import { cn } from '@/lib/cn';

const TONES = {
  slate: 'text-slate-100',
  green: 'text-emerald-300',
  red: 'text-red-300',
  amber: 'text-amber-300',
  sky: 'text-sky-300',
};

const ACCENTS = {
  slate: 'before:bg-slate-600',
  green: 'before:bg-emerald-500',
  red: 'before:bg-red-500',
  amber: 'before:bg-amber-500',
  sky: 'before:bg-sky-500',
};

/** A single metric. When `onClick` is given it renders as a toggle button (e.g. to filter). */
export function KpiCard({ label, value, hint, tone = 'slate', isLoading, onClick, isSelected }) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-pressed={onClick ? Boolean(isSelected) : undefined}
      className={cn(
        'relative overflow-hidden rounded-lg border bg-slate-900/60 p-4 text-left',
        'before:absolute before:inset-y-0 before:left-0 before:w-1',
        ACCENTS[tone],
        isSelected ? 'border-sky-500/70 ring-1 ring-sky-500/40' : 'border-slate-800',
        onClick &&
          'transition-colors hover:border-slate-600 focus-visible:outline-2 focus-visible:outline-sky-500',
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      {isLoading ? (
        <span className="mt-2 block h-8 w-16 animate-pulse rounded bg-slate-800" aria-hidden />
      ) : (
        <p className={cn('mt-1 text-3xl font-semibold tabular-nums', TONES[tone])}>
          {value ?? '—'}
        </p>
      )}
      <p className="mt-1 min-h-4 truncate text-xs text-slate-500">{!isLoading && hint}</p>
    </Component>
  );
}
