type DebouncedFunction<TArgs extends unknown[]> = ((...args: TArgs) => void) & {
  cancel: () => void;
};

/*
  Input: a function and delay in milliseconds.
  Output: a debounced function that delays execution until calls settle.
*/
export const debounce = <TArgs extends unknown[]>(
  fn: (...args: TArgs) => void | Promise<void>,
  delay = 300,
): DebouncedFunction<TArgs> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = ((...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      void fn(...args);
    }, delay);
  }) as DebouncedFunction<TArgs>;

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
};
