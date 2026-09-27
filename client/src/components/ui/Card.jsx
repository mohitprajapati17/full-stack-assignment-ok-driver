import { cn } from '@/lib/cn';

export function Card({ title, actions, className, children }) {
  return (
    <section className={cn('rounded-lg border border-slate-800 bg-slate-900/60', className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
          {title && <h2 className="text-sm font-semibold text-slate-200">{title}</h2>}
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

/** `items` is an array of `{ label, value }`. */
export function DescriptionList({ items }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map(({ label, value }) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
          <dd className="mt-1 break-words text-sm text-slate-200">{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
