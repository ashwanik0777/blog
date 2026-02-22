"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const currentTheme = theme === "system" ? resolvedTheme : theme;
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = currentTheme === "dark";

  if (!mounted) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white/90 text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 hover:shadow-md dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 h-5 w-5 text-amber-500 transition-all duration-300 ${
            !isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 text-indigo-500 transition-all duration-300 ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
      <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
