"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type SafeImageProps = ImageProps & {
  /** Rendered instead of the image when the remote URL fails (404/offline). */
  fallback?: React.ReactNode;
};

/**
 * next/image wrapper for user/tutor-supplied remote URLs (ImgBB etc.).
 * A dead URL no longer leaves a broken-image icon — the caller's fallback
 * (initials, placeholder banner, …) is rendered instead.
 */
export default function SafeImage({
  src,
  alt,
  fallback,
  onError,
  ...props
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const srcKey = typeof src === "string" ? src : JSON.stringify(src);

  // Comparing against the current src resets the failed state when the
  // image URL changes — no effect/setState-in-effect needed.
  if (failedSrc === srcKey) return <>{fallback ?? null}</>;

  return (
    <Image
      src={src}
      alt={alt}
      onError={(event) => {
        setFailedSrc(srcKey);
        onError?.(event);
      }}
      {...props}
    />
  );
}
