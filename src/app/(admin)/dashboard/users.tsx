"use client";
import { useEffect, useState } from "react";

const roles = ["admin", "editor", "reader"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch {
        setError("Failed to load users");
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  async function updateUser(userId: string, updates: any) {
    setSaving(userId);
    setError("");
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });
      setUsers(users => users.map(u => u._id === userId ? { ...u, ...updates } : u));
    } catch {
      setError("Failed to update user");
    }
    setSaving("");
  }

  async function deleteUser(userId: string) {
    if (!confirm("Delete this user?")) return;
    setSaving(userId);
    setError("");
    try {
      await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setUsers(users => users.filter(u => u._id !== userId));
    } catch {
      setError("Failed to delete user");
    }
    setSaving("");
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-2 py-1">Name</th>
                  <th className="text-left px-2 py-1">Email</th>
                  <th className="text-left px-2 py-1">Role</th>
                  <th className="text-left px-2 py-1">Status</th>
                  <th className="text-left px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-2 py-1">{u.name}</td>
                    <td className="px-2 py-1">{u.email}</td>
                    <td className="px-2 py-1">
                      <select
                        value={u.role}
                        onChange={e => updateUser(u._id, { role: e.target.value })}
                        disabled={saving === u._id}
                        className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1"
                      >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1">
                      {u.disabled ? (
                        <span className="text-red-600">Disabled</span>
                      ) : (
                        <span className="text-green-600">Active</span>
                      )}
                    </td>
                    <td className="px-2 py-1 flex gap-2">
                      <button
                        onClick={() => updateUser(u._id, { disabled: !u.disabled })}
                        className={
                          (u.disabled ? "bg-green-500 hover:bg-green-600" : "bg-yellow-500 hover:bg-yellow-600") +
                          " text-white px-3 py-1 rounded"
                        }
                        disabled={saving === u._id}
                      >
                        {u.disabled ? "Enable" : "Disable"}
                      </button>
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        disabled={saving === u._id}
                      >
                        Delete
                      </button>
                    </td>
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