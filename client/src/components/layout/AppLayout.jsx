import { Link, NavLink, Outlet } from 'react-router';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/authContext';
import { cn } from '@/lib/cn';
import { formatEnum } from '@/lib/format';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/cameras', label: 'Cameras' },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-[96rem] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            okDriver <span className="text-slate-400">CCTV Monitoring</span>
          </Link>
          <nav className="flex items-center gap-1" aria-label="Main">
            {NAV_ITEMS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium',
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-slate-300">{user.name}</span>
            <Badge tone="sky">{formatEnum(user.role)}</Badge>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[96rem] px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
