import { Badge } from '@/components/ui/Badge';
import { useHealth } from './useHealth';

export function SystemStatus() {
  const { data, error, isPending } = useHealth();

  if (isPending) return <Badge dot>Checking system…</Badge>;
  if (error)
    return (
      <Badge tone="red" dot>
        API unreachable
      </Badge>
    );

  const database = data.services?.database;
  if (data.status === 'ok')
    return (
      <Badge tone="green" dot>
        All systems operational
      </Badge>
    );
  return (
    <Badge tone="amber" dot>
      Degraded{database ? ` · database ${database}` : ''}
    </Badge>
  );
}
