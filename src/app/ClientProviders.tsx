"use client";
import { SessionProvider } from "next-auth/react";
import NotificationProvider from "@/components/NotificationProvider";
import Chatbot from "@/components/Chatbot";
import { ThemeProvider } from "next-themes";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <NotificationProvider>
          {children}
          <Chatbot />
        </NotificationProvider>
      </SessionProvider>
    </ThemeProvider>
  );
} 