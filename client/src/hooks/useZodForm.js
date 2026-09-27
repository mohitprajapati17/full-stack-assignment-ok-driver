import { useCallback, useState } from 'react';

/**
 * Minimal controlled-form state backed by a Zod schema.
 * `handleSubmit(onValid)` validates, stores per-field errors, and calls `onValid(parsedData)`.
 */
export function useZodForm(schema, initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const setField = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  }, []);

  const register = useCallback(
    (name) => ({
      name,
      value: values[name] ?? '',
      error: errors[name],
      onChange: (event) => setField(name, event.target.value),
    }),
    [values, errors, setField],
  );

  const handleSubmit = (onValid) => (event) => {
    event.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const nextErrors = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        nextErrors[path] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    onValid(result.data);
  };

  return { values, errors, setErrors, setField, register, handleSubmit };
}
