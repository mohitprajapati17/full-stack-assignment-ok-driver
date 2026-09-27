import { controlClasses } from './controlClasses';
import { FormField } from './FormField';

export function TextField({ label, hint, error, required, className, suggestions, ...inputProps }) {
  return (
    <FormField label={label} hint={hint} error={error} required={required} className={className}>
      {(fieldProps) => (
        <>
          <input
            {...fieldProps}
            {...inputProps}
            required={required}
            list={suggestions?.length ? `${fieldProps.id}-list` : undefined}
            className={controlClasses(error)}
          />
          {suggestions?.length > 0 && (
            <datalist id={`${fieldProps.id}-list`}>
              {suggestions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          )}
        </>
      )}
    </FormField>
  );
}
