"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    setShake(false);
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setSuccess("Subscribed! Check your inbox.");
      setEmail("");
    } else {
      const data = await res.json();
      setError(data.error || "Subscription failed");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center max-w-md mx-auto mt-4">
      <motion.input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        required
        disabled={loading}
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
        transition={{ duration: 0.5 }}
      />
      <motion.button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
        whileHover={{ scale: 1.05, boxShadow: "0 0 0 4px #2563eb22" }}
        whileTap={{ scale: 0.98 }}
        disabled={loading}
      >
        {loading ? (
          <span className="animate-spin">⏳</span>
        ) : success ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="text-lg"
          >
            ✅
          </motion.span>
        ) : (
          "Subscribe"
        )}
      </motion.button>
      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-green-600 dark:text-green-400 text-sm font-medium mt-3 w-full text-center"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-red-600 dark:text-red-400 text-sm font-medium mt-3 w-full text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
} 