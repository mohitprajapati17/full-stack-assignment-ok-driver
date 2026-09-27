import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { formatDateTime, formatRelativeTime } from '@/lib/format';
import { SORTABLE_COLUMNS, labelFor } from '../cameraConstants';
import { CameraActiveBadge, CameraStatusBadge } from './CameraStatusBadge';

const COLUMNS = [
  { key: 'cameraId', label: 'Camera ID' },
  { key: 'name', label: 'Name' },
  { key: 'department', label: 'Department' },
  { key: 'zone', label: 'Zone' },
  { key: 'cameraType', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'lastHeartbeat', label: 'Last heartbeat' },
];

function SortableHeader({ column, sortBy, sortOrder, onSort }) {
  if (!SORTABLE_COLUMNS.includes(column.key)) {
    return <th className="px-4 py-3 font-medium">{column.label}</th>;
  }

  const isSorted = sortBy === column.key;
  const ariaSort = isSorted ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <th className="px-4 py-3 font-medium" aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onSort(column.key)}
        className={cn(
          'inline-flex items-center gap-1 uppercase tracking-wide hover:text-slate-200',
          isSorted && 'text-slate-200',
        )}
      >
        {column.label}
        <span aria-hidden="true" className="text-[10px]">
          {isSorted ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  );
}

export function CameraTable({ cameras, sortBy, sortOrder, onSort, isFetching }) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-lg border border-slate-800 transition-opacity',
        isFetching && 'opacity-60',
      )}
    >
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            {COLUMNS.map((column) => (
              <SortableHeader
                key={column.key}
                column={column}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {cameras.map((camera) => (
            <tr key={camera.id} className="hover:bg-slate-900/60">
              <td className="px-4 py-3 font-mono text-xs text-slate-300">{camera.cameraId}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/cameras/${camera.id}`}
                    className="font-medium text-sky-300 hover:text-sky-200 hover:underline"
                  >
                    {camera.name}
                  </Link>
                  <CameraActiveBadge isActive={camera.isActive} />
                </div>
              </td>
              <td className="px-4 py-3 text-slate-300">{camera.department ?? '—'}</td>
              <td className="px-4 py-3 text-slate-300">{camera.zone ?? '—'}</td>
              <td className="px-4 py-3 text-slate-300">{labelFor(camera.cameraType)}</td>
              <td className="px-4 py-3">
                <CameraStatusBadge status={camera.status} />
              </td>
              <td className="px-4 py-3 text-slate-400" title={formatDateTime(camera.lastHeartbeat)}>
                {formatRelativeTime(camera.lastHeartbeat)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
