import { cn } from '@/lib/cn';

const MESSAGES = {
  ONLINE: { text: 'Live view not connected', className: 'text-slate-500' },
  DEGRADED: { text: 'Degraded signal', className: 'text-amber-400/80' },
  OFFLINE: { text: 'No signal', className: 'text-red-400/80' },
};

/** Stand-in for the live stream until video integration is built. */
export function VideoPlaceholder({ status, className }) {
  const message = MESSAGES[status] ?? MESSAGES.OFFLINE;

  return (
    <div
      className={cn(
        'flex aspect-video flex-col items-center justify-center gap-2 bg-slate-950',
        'bg-[repeating-linear-gradient(135deg,transparent,transparent_10px,rgb(15_23_42/0.8)_10px,rgb(15_23_42/0.8)_20px)]',
        className,
      )}
      role="img"
      aria-label={`Video placeholder: ${message.text}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={cn('h-8 w-8', message.className)}
        aria-hidden="true"
      >
        <path d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        {status === 'OFFLINE' && <path d="M3 3l18 18" />}
      </svg>
      <span className={cn('text-xs font-medium', message.className)}>{message.text}</span>
    </div>
  );
}
