"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";

// The chat panel (and its code) is only downloaded after the first click.
const ChatPanel = dynamic(() => import("./Chatbot"), { ssr: false });

export default function ChatbotLauncher() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = () => {
      fetch("/api/settings/chatbot")
        .then((res) => (res.ok ? res.json() : { chatbotEnabled: false }))
        .then((data) => setEnabled(data.chatbotEnabled !== false))
        .catch(() => setEnabled(false));
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(load, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!enabled || pathname?.startsWith("/admin")) return null;

  return (
    <>
      {loaded && <ChatPanel open={open} onClose={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => {
          setLoaded(true);
          setOpen((value) => !value);
        }}
        className="fixed bottom-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-zinc-900/20 transition-colors duration-200 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}
