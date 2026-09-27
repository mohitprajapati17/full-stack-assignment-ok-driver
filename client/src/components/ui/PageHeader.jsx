import { Link } from 'react-router';

export function PageHeader({ title, description, backTo, backLabel = 'Back', actions }) {
  return (
    <header className="mb-6 space-y-3">
      {backTo && (
        <Link to={backTo} className="text-sm text-slate-400 hover:text-slate-200">
          ← {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">{title}</div>
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function PageTitle({ children }) {
  return <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>;
}
