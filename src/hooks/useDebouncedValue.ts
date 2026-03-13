import { useEffect, useState } from "react";

/*
  Input: any value and a small delay in milliseconds.
  Output: a debounced value that updates only after the delay passes.
*/
export const useDebouncedValue = <T,>(value: T, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
};
