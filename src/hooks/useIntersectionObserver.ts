import { useEffect, useRef } from "react";

type UseIntersectionObserverOptions = {
  enabled: boolean;
  onIntersect: () => void;
};

// This small hook watches the "load more" element at the bottom of the list.
export const useIntersectionObserver = ({
  enabled,
  onIntersect,
}: UseIntersectionObserverOptions) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !targetRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onIntersect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(targetRef.current);

    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return targetRef;
};
