import { controlClasses } from './controlClasses';
import { FormField } from './FormField';

/**
 * `options` is an array of `{ value, label }`. Pass `placeholder` to add an
 * empty first option (e.g. "All statuses").
 */
export function SelectField({
  label,
  hint,
  error,
  required,
  className,
  options,
  placeholder,
  ...selectProps
}) {
  return (
    <FormField label={label} hint={hint} error={error} required={required} className={className}>
      {(fieldProps) => (
        <select
          {...fieldProps}
          {...selectProps}
          required={required}
          className={controlClasses(error)}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  );
}
