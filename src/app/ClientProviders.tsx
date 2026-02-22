"use client";
import NotificationProvider from "@/components/NotificationProvider";
import Chatbot from "@/components/Chatbot";
import { ThemeProvider } from "next-themes";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <NotificationProvider>
        {children}
        <Chatbot />
      </NotificationProvider>
    </ThemeProvider>
  );
} 