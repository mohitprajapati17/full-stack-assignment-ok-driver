import { Link, Outlet } from 'react-router';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            okDriver <span className="text-slate-400">CCTV Monitoring</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
