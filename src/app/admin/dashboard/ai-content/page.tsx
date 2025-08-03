"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AIContentPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/admin-session');
        if (response.ok) {
          const data = await response.json();
          setAdminUser(data.user);
        } else {
          router.push('/admin');
        }
      } catch (error) {
        router.push('/admin');
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Content Generation
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate content using Google Gemini AI
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          AI Content Tools
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          AI-powered content generation features coming soon...
        </p>
      </div>
    </div>
  );
} 