"use client";
import { useState, useEffect } from "react";

export default function ChatbotSettingsPage() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSetting() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/settings/chatbot");
        const data = await res.json();
        setEnabled(data.chatbotEnabled);
      } catch {
        setError("Failed to load setting");
      }
      setLoading(false);
    }
    fetchSetting();
  }, []);

  async function handleToggle() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatbotEnabled: !enabled }),
      });
      const data = await res.json();
      setEnabled(data.chatbotEnabled);
    } catch {
      setError("Failed to update setting");
    }
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Chatbot Settings</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow flex items-center gap-4">
          <span className="font-medium">Enable Chatbot:</span>
          <button
            onClick={handleToggle}
            className={
              (enabled
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-400 hover:bg-gray-500") +
              " text-white px-4 py-2 rounded transition"
            }
            disabled={loading || saving}
          >
            {loading ? "Loading..." : saving ? "Saving..." : enabled ? "Enabled" : "Disabled"}
          </button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <p className="mt-4 text-gray-500 text-sm">This setting is now global and applies to all users.</p>
      </div>
    </main>
  );
} 