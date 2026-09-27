import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { SelectField } from '@/components/ui/SelectField';
import { ROLES } from '@/features/auth/authContext';
import { RoleGate } from '@/features/auth/RouteGuards';
import { ACTIVE_FILTER_OPTIONS, CAMERA_STATUSES, toOptions } from '../cameraConstants';
import { useCameraFilterOptions } from '../useCameraQueries';

const toPlainOptions = (values = []) => values.map((value) => ({ value, label: value }));

export function CameraFilters({
  params,
  onChange,
  onReset,
  hasActiveFilters,
  showVisibilityFilter = true,
}) {
  const { data: filterOptions } = useCameraFilterOptions();
  // Bumped on reset so the uncontrolled search box remounts empty.
  const [searchKey, setSearchKey] = useState(0);

  const handleReset = () => {
    setSearchKey((key) => key + 1);
    onReset();
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-60 flex-1 space-y-1.5">
        <label htmlFor="camera-search" className="block text-sm font-medium text-slate-300">
          Search
        </label>
        <SearchInput
          key={searchKey}
          id="camera-search"
          placeholder="Name, camera ID, department or zone"
          defaultValue={params.search}
          onSearch={(search) => onChange({ search })}
        />
      </div>
      <SelectField
        label="Status"
        className="w-40"
        placeholder="All statuses"
        options={toOptions(CAMERA_STATUSES)}
        value={params.status}
        onChange={(event) => onChange({ status: event.target.value })}
      />
      <SelectField
        label="Department"
        className="w-44"
        placeholder="All departments"
        options={toPlainOptions(filterOptions?.departments)}
        value={params.department}
        onChange={(event) => onChange({ department: event.target.value })}
      />
      <SelectField
        label="Zone"
        className="w-40"
        placeholder="All zones"
        options={toPlainOptions(filterOptions?.zones)}
        value={params.zone}
        onChange={(event) => onChange({ zone: event.target.value })}
      />
      {showVisibilityFilter && (
        <RoleGate roles={[ROLES.ADMIN]}>
          <SelectField
            label="Visibility"
            className="w-44"
            options={ACTIVE_FILTER_OPTIONS}
            value={params.isActive}
            onChange={(event) => onChange({ isActive: event.target.value })}
          />
        </RoleGate>
      )}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={handleReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
