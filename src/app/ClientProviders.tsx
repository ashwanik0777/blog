"use client";
import ChatbotLauncher from "@/components/ChatbotLauncher";
import { ThemeProvider } from "next-themes";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <ChatbotLauncher />
    </ThemeProvider>
  );
}
