"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminBlogAnalyticsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<'views'|'date'>('views');

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/blog");
        const data = await res.json();
        setBlogs(data);
      } catch {
        setError("Failed to load blogs");
      }
      setLoading(false);
    }
    fetchBlogs();
  }, []);

  const sorted = [...blogs].sort((a, b) => {
    if (sort === 'views') return b.views - a.views;
    return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
  });

  function getLast30Days() {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Blog Analytics</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          <div className="flex items-center gap-4 mb-4">
            <span className="font-medium">Sort by:</span>
            <button onClick={() => setSort('views')} className={sort==='views'?"font-bold underline":""}>Views</button>
            <button onClick={() => setSort('date')} className={sort==='date'?"font-bold underline":""}>Date</button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1">Title</th>
                  <th className="text-left px-2 py-1">Views</th>
                  <th className="text-left px-2 py-1">Published</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(blog => (
                  <React.Fragment key={blog._id}>
                    <tr className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-2 py-1">{blog.title}</td>
                      <td className="px-2 py-1">{blog.views || 0}</td>
                      <td className="px-2 py-1">{blog.published ? new Date(blog.publishedAt || blog.createdAt).toLocaleDateString() : <span className="text-yellow-600">Draft</span>}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-2 pb-4">
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={getLast30Days().map(day => ({
                            day,
                            views: blog.viewsByDay?.[day] || 0,
                          }))}>
                            <XAxis dataKey="day" tickFormatter={d => d.slice(5)} fontSize={10} />
                            <YAxis allowDecimals={false} fontSize={10} width={30} />
                            <Tooltip labelFormatter={d => d} />
                            <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
} 