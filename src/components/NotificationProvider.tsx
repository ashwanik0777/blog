"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NotificationContext = createContext({ addNotification: (msg: string, type?: string) => {} });

export function useNotification() {
  return useContext(NotificationContext);
}

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<{ msg: string; type?: string }[]>([]);

  function addNotification(msg: string, type: string = "info") {
    setNotifications((prev) => [...prev, { msg, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 4000);
  }

  function removeNotification(idx: number) {
    setNotifications((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000] space-y-2">
        <AnimatePresence>
          {notifications.map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`flex items-center gap-2 px-4 py-2 rounded shadow-lg text-white font-medium animate-fade-in
                ${n.type === "success" ? "bg-green-600" : n.type === "error" ? "bg-red-600" : "bg-blue-600"}`}
            >
              {n.type === "success" && <span className="text-lg">✅</span>}
              {n.type === "error" && <span className="text-lg">❌</span>}
              {n.type === "info" && <span className="text-lg">ℹ️</span>}
              <span>{n.msg}</span>
              <button onClick={() => removeNotification(i)} className="ml-2 text-white/80 hover:text-white">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
} 