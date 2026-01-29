"use client";

import { useEffect } from "react";

export default function BlogViewTracker({ blogId }: { blogId: string }) {
  useEffect(() => {
    if (!blogId) return;

    const sendView = () => {
      fetch(`/api/blog/${blogId}?view=1`, {
        method: "PATCH",
        keepalive: true,
      }).catch(() => {});
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(sendView, { timeout: 2000 });
    } else {
      setTimeout(sendView, 0);
    }
  }, [blogId]);

  return null;
}
