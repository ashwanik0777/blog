"use client";

export default function AdminAnalyticsPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <p className="mb-4">Google Analytics 4 is connected. To display real traffic, top blogs, and referrers, connect the GA4 API and use the <a href="https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Google Analytics Data API</a>.</p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300">
            <li>Show total pageviews, users, and sessions</li>
            <li>Show top performing blogs</li>
            <li>Show top referrers and traffic sources</li>
            <li>Show traffic by country/device</li>
            <li>Show real-time active users (optional)</li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">(This is a placeholder. For production, connect the GA4 API and display real analytics here.)</p>
        </div>
      </div>
    </main>
  );
} 