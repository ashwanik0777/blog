import React, { useState } from "react";

export default function AdminBlogTable({ blogs, onEdit, onDelete, onBulkAction }: {
  blogs: any[];
  onEdit: (blog: any) => void;
  onDelete: (blog: any) => void;
  onBulkAction?: (ids: string[], action: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id]);
  }
  function toggleAll() {
    if (selected.length === blogs.length) setSelected([]);
    else setSelected(blogs.map(b => b._id));
  }

  return (
    <div className="overflow-x-auto">
      {onBulkAction && (
        <div className="mb-2 flex gap-2">
          <button
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
            disabled={selected.length === 0}
            onClick={() => onBulkAction(selected, "delete")}
          >
            Delete Selected
          </button>
          <button
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={selected.length === 0}
            onClick={() => onBulkAction(selected, "publish")}
          >
            Publish Selected
          </button>
        </div>
      )}
      <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
        <thead>
          <tr>
            <th className="px-2 py-2 text-left">
              <input
                type="checkbox"
                checked={selected.length === blogs.length && blogs.length > 0}
                onChange={toggleAll}
                className="accent-blue-600"
              />
            </th>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr key={blog._id} className="border-t border-gray-200 dark:border-gray-700">
              <td className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={selected.includes(blog._id)}
                  onChange={() => toggle(blog._id)}
                  className="accent-blue-600"
                />
              </td>
              <td className="px-4 py-2 font-medium">{blog.title}</td>
              <td className="px-4 py-2">
                {blog.published ? (
                  <span className="text-green-600">Published</span>
                ) : (
                  <span className="text-yellow-600">Draft</span>
                )}
              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={() => onEdit(blog)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => onDelete(blog)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 