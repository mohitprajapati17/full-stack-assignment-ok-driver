import { useEffect, useRef } from 'react';
import { controlClasses } from './controlClasses';

/**
 * Uncontrolled search box that calls `onSearch` after the user stops typing.
 * To reset it from the parent, change its `key`.
 */
export function SearchInput({ defaultValue = '', onSearch, delay = 300, ...props }) {
  const timerRef = useRef();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleChange = (event) => {
    const { value } = event.target;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(value.trim()), delay);
  };

  return (
    <input
      type="search"
      defaultValue={defaultValue}
      onChange={handleChange}
      className={controlClasses()}
      {...props}
    />
  );
}
