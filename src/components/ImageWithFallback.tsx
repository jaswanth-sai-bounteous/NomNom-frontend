import type { ImgHTMLAttributes } from "react";
import { useMemo, useState } from "react";

import { createFoodPlaceholder, getImageUrl } from "@/lib/foodImage";

type ImageWithFallbackProps = ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | null;
  fallbackLabel?: string;
};

const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackLabel,
  ...props
}: ImageWithFallbackProps) => {
  const placeholder = useMemo(
    () => createFoodPlaceholder(fallbackLabel ?? alt ?? "NomNom"),
    [alt, fallbackLabel],
  );
  const resolvedSrc = useMemo(() => getImageUrl(src) || placeholder, [placeholder, src]);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  return (
    <img
      src={failedSrc === resolvedSrc ? placeholder : resolvedSrc}
      alt={alt}
      className={className}
      loading={props.loading ?? "lazy"}
      decoding={props.decoding ?? "async"}
      onError={() => setFailedSrc(resolvedSrc)}
      {...props}
    />
  );
};

export default ImageWithFallback;
