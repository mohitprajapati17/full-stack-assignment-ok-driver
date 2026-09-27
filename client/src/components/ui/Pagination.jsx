import { Button } from './Button';

export function Pagination({ page, limit, total, totalPages, onPageChange, isFetching }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400"
      aria-label="Pagination"
    >
      <p aria-live="polite">
        Showing <span className="text-slate-200">{from}</span>–
        <span className="text-slate-200">{to}</span> of{' '}
        <span className="text-slate-200">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isFetching}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isFetching}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
