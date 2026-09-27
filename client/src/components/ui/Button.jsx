import { Link } from 'react-router';
import { cn } from '@/lib/cn';

const VARIANTS = {
  primary: 'bg-sky-600 text-white hover:bg-sky-500 disabled:bg-sky-600/50',
  secondary:
    'border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 disabled:text-slate-500',
  danger: 'bg-red-600 text-white hover:bg-red-500 disabled:bg-red-600/50',
  ghost: 'text-slate-300 hover:bg-slate-800 hover:text-white disabled:text-slate-600',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  to,
  className,
  type = 'button',
  isLoading = false,
  disabled,
  children,
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
    'disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && <Spinner />}
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span
      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  );
}
