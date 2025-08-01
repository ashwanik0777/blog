"use client";
import { useEffect, useState } from "react";

export default function AdminNewsletterPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSubs() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/newsletter");
        const data = await res.json();
        setSubs(data.subscribers || []);
      } catch {
        setError("Failed to load subscribers");
      }
      setLoading(false);
    }
    fetchSubs();
  }, []);

  function exportCSV() {
    const csv = ["Email,Subscribed At"].concat(
      subs.map(s => `${s.email},${new Date(s.subscribedAt).toLocaleString()}`)
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Newsletter Subscribers</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Total: {subs.length}</span>
            <button onClick={exportCSV} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Export CSV</button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1">Email</th>
                  <th className="text-left px-2 py-1">Subscribed At</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-2 py-1">{s.email}</td>
                    <td className="px-2 py-1">{new Date(s.subscribedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
} 