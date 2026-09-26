import { useHealth } from '@/features/health/useHealth';

export function HomePage() {
  const { data, error, isPending } = useHealth();

  let statusLabel = 'Checking…';
  let statusColor = 'bg-slate-500';
  if (error) {
    statusLabel = `Unavailable: ${error.message}`;
    statusColor = 'bg-red-500';
  } else if (data) {
    statusLabel = `API ${data.status} · database ${data.services.database}`;
    statusColor = data.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500';
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">System status</h1>
      <div className="inline-flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3">
        <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} aria-hidden="true" />
        <span className="text-sm text-slate-300">{isPending ? 'Checking…' : statusLabel}</span>
      </div>
    </section>
  );
}
