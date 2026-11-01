"use client";
import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = ["Explain React Server Components", "Best way to learn TypeScript?", "What's new in AI tooling?"];
const MAX_INPUT = 1000;

export default function Chatbot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm the TechUpdatesZone assistant. Ask me anything about programming, web development or tech news.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text = input) {
    const userMessage = text.trim().slice(0, MAX_INPUT);
    if (!userMessage || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: userMessage }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-12) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to get response");
      setMessages([...nextMessages, { role: "assistant", content: data.content || "Sorry, I couldn't respond right now." }]);
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : "Something went wrong.";
      setMessages([...nextMessages, { role: "assistant", content: `⚠️ ${message}` }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="AI assistant"
      className="fixed bottom-[4.5rem] right-4 z-50 flex max-h-[min(640px,calc(100dvh-8rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/20 animate-fade-up dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center gap-3 bg-brand-600 px-5 py-4 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-display text-sm font-bold">TechUpdatesZone AI</p>
          <p className="text-xs text-white/80">Usually replies in a few seconds</p>
        </div>
      </div>

      <div ref={chatRef} className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <p
              className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                message.role === "user"
                  ? "rounded-br-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "rounded-bl-md bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {message.content}
            </p>
            {message.role === "user" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-200">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" /> Thinking…
          </div>
        )}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} className="chip">
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="flex items-end gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <textarea
          ref={inputRef}
          className="input max-h-28 min-h-11 resize-none py-2.5"
          rows={1}
          value={input}
          maxLength={MAX_INPUT}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask me anything…"
          aria-label="Your message"
          disabled={loading}
        />
        <button
          type="submit"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
