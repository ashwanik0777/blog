"use client";
import { SessionProvider } from "next-auth/react";
import NotificationProvider from "@/components/NotificationProvider";
import Chatbot from "@/components/Chatbot";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
        <Chatbot />
      </NotificationProvider>
    </SessionProvider>
  );
} 