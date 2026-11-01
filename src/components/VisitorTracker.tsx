"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "visitor-session-id";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    let sessionId = "";
    try {
      sessionId = sessionStorage.getItem(SESSION_KEY) || crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    } catch {
      // Storage can be unavailable (private mode); the server falls back to a random id.
    }

    fetch("/api/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, sessionId }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
