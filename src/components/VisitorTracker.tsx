"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip tracking for admin pages
    if (pathname?.startsWith('/admin')) return;

    const sessionId = sessionStorage.getItem('visitor-session-id') || 
                     `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('visitor-session-id', sessionId);

    fetch('/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, sessionId }),
    }).catch(err => console.error('Visitor tracking error:', err));
  }, [pathname]);

  return null;
}

