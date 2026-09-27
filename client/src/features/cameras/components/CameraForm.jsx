import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SelectField } from '@/components/ui/SelectField';
import { FormAlert } from '@/components/ui/StatusMessage';
import { TextField } from '@/components/ui/TextField';
import { useZodForm } from '@/hooks/useZodForm';
import { mapApiErrorToForm } from '@/lib/formErrors';
import {
  CAMERA_STATUSES,
  CAMERA_TYPES,
  SOURCE_PROTOCOLS,
  STORAGE_TYPES,
  toOptions,
} from '../cameraConstants';
import {
  createCameraFormSchema,
  editCameraFormSchema,
  formDataToPayload,
  toFormFieldErrors,
} from '../cameraForm';
import { useCameraFilterOptions } from '../useCameraQueries';

/**
 * Shared create/edit form. `mode="create"` also lets the admin set the initial status;
 * in edit mode status is changed from the details page instead.
 */
export function CameraForm({ mode, initialValues, onSubmit, isSubmitting, onCancel }) {
  const isCreate = mode === 'create';
  const schema = isCreate ? createCameraFormSchema : editCameraFormSchema;
  const form = useZodForm(schema, initialValues);
  const [formError, setFormError] = useState(null);
  const { data: filterOptions } = useCameraFilterOptions();
  const field = form.register;

  // `onSubmit` must return a promise that rejects with the API error, so server-side
  // validation and uniqueness errors can be shown next to the matching field.
  const handleValid = async (data) => {
    setFormError(null);
    try {
      await onSubmit(formDataToPayload(data));
    } catch (error) {
      const { fieldErrors, formError: message } = mapApiErrorToForm(error);
      form.setErrors(toFormFieldErrors(fieldErrors));
      setFormError(message);
    }
  };

  return (
    <form noValidate onSubmit={form.handleSubmit(handleValid)} className="space-y-6">
      <FormAlert>{formError}</FormAlert>

      <Card title="Identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Camera ID"
            required
            hint="Unique. Stored in uppercase, e.g. CAM-GATE-01"
            {...field('cameraId')}
          />
          <TextField label="Name" required {...field('name')} />
          <TextField
            label="Department"
            suggestions={filterOptions?.departments}
            {...field('department')}
          />
          <TextField label="Zone" suggestions={filterOptions?.zones} {...field('zone')} />
          <SelectField
            label="Camera type"
            options={toOptions(CAMERA_TYPES)}
            {...field('cameraType')}
          />
          {isCreate && (
            <SelectField
              label="Initial status"
              options={toOptions(CAMERA_STATUSES)}
              {...field('status')}
            />
          )}
        </div>
      </Card>

      <Card title="Location">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Latitude"
            required
            inputMode="decimal"
            placeholder="19.0760"
            {...field('latitude')}
          />
          <TextField
            label="Longitude"
            required
            inputMode="decimal"
            placeholder="72.8777"
            {...field('longitude')}
          />
        </div>
      </Card>

      <Card title="Stream">
        <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
          <SelectField
            label="Source protocol"
            required
            placeholder="Select…"
            options={toOptions(SOURCE_PROTOCOLS)}
            {...field('sourceProtocol')}
          />
          <TextField
            label="Stream URL"
            required
            placeholder="rtsp://10.0.0.5:554/stream1"
            autoComplete="off"
            spellCheck={false}
            {...field('streamUrl')}
          />
        </div>
      </Card>

      <Card title="Storage">
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            label="Storage type"
            options={toOptions(STORAGE_TYPES)}
            {...field('storageType')}
          />
          <TextField
            label="Location"
            placeholder="nvr-01 or s3://bucket/path"
            {...field('storageLocation')}
          />
          <TextField
            label="Retention (days)"
            inputMode="numeric"
            placeholder="30"
            {...field('retentionDays')}
          />
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isCreate ? 'Create camera' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
