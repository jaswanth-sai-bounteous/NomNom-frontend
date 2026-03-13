import type { ComponentType } from "react";

/*
  Input: a dynamic import function used by React.lazy.
  Output: a lazy loader that retries once by refreshing the page if the chunk URL is stale.

  This helps after a new deployment when the browser still has an older HTML file cached
  that points to chunk names that no longer exist.
*/
export const lazyWithRetry = <T extends { default: ComponentType<object> }>(
  importer: () => Promise<T>,
  key: string,
) => {
  return async () => {
    const storageKey = `nomnom-lazy-retry-${key}`;

    try {
      const module = await importer();
      sessionStorage.removeItem(storageKey);
      return module;
    } catch (error) {
      const hasRetried = sessionStorage.getItem(storageKey) === "true";

      if (!hasRetried) {
        sessionStorage.setItem(storageKey, "true");
        window.location.reload();
      }

      throw error;
    }
  };
};
