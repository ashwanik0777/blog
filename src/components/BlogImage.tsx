"use client";
import { useState } from "react";
import Image from "next/image";
import { isOptimizableImage } from "@/lib/site";

type BlogImageProps = {
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Shown on the placeholder when there is no image (e.g. the post's topic). */
  label?: string;
};

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(to right, rgb(124 58 237 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(124 58 237 / 0.08) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

/** Featured image with a branded placeholder (also used when a hotlinked image is gone). */
export default function BlogImage({ src, alt, sizes, priority = false, className = "", label }: BlogImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`absolute inset-0 overflow-hidden bg-brand-50 dark:bg-zinc-800/80 ${className}`} role="img" aria-label={alt}>
        <div className="absolute inset-0" style={GRID_STYLE} aria-hidden />
        <div className="relative flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-brand-100 dark:bg-zinc-900 dark:ring-zinc-700">
            <Image src="/logo.png" alt="" width={32} height={32} />
          </span>
          {label && (
            <span className="max-w-[80%] truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700/80 dark:text-brand-300/80">
              {label}
            </span>
          )}
        </div>
      </div>
    );
  }

  const optimized = isOptimizableImage(src);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!optimized}
      // Hotlinked images: many sites block requests that carry a foreign referrer.
      referrerPolicy={optimized ? undefined : "no-referrer"}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
