"use client";
import { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: "Hi! I am Gemini AI. Ask me anything about this blog, get suggestions, or summaries!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    async function fetchSetting() {
      try {
        const res = await fetch("/api/settings/chatbot");
        const data = await res.json();
        setEnabled(data.chatbotEnabled);
      } catch {
        setEnabled(true);
      }
    }
    fetchSetting();
    // Listen for storage changes (in case admin toggles in another tab)
    function onStorage() { fetchSetting(); }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function sendMessage() {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.content || "(No response)" }]);
      setTimeout(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't respond right now." }]);
    }
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!enabled) return null;

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl hover:scale-110 transition"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI Chatbot"
      >
        💬
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[95vw] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="font-bold text-lg">Gemini Chatbot</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">✕</button>
          </div>
          <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-2" style={{ maxHeight: 320 }}>
            {messages.map((m, i) => (
              <div key={i} className={
                m.role === "user"
                  ? "text-right"
                  : "text-left text-blue-600 dark:text-blue-400"
              }>
                <div className={
                  "inline-block px-3 py-2 rounded-lg " +
                  (m.role === "user"
                    ? "bg-blue-100 dark:bg-blue-800 text-gray-900 dark:text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300")
                }>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-left text-gray-400">Gemini is typing...</div>}
          </div>
          <form
            className="flex gap-2 p-2 border-t border-gray-200 dark:border-gray-700"
            onSubmit={e => { e.preventDefault(); sendMessage(); }}
          >
            <textarea
              className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none"
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              disabled={loading}
              style={{ minHeight: 36, maxHeight: 80 }}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
