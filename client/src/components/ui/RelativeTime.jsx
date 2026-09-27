import { useEffect, useState } from 'react';
import { formatDateTime, formatRelativeTime } from '@/lib/format';

/** "5 minutes ago" that keeps itself current, with the absolute time on hover. */
export function RelativeTime({ value, fallback = 'Never', refreshMs = 30_000, className }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!value) return undefined;
    const timer = setInterval(() => setTick((tick) => tick + 1), refreshMs);
    return () => clearInterval(timer);
  }, [value, refreshMs]);

  if (!value) return <span className={className}>{fallback}</span>;
  return (
    <time
      dateTime={new Date(value).toISOString()}
      title={formatDateTime(value)}
      className={className}
    >
      {formatRelativeTime(value)}
    </time>
  );
}
