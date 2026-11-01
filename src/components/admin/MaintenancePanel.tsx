"use client";
import { useState } from "react";
import { Database, ImageUp, Loader2, Wrench } from "lucide-react";

type ImportResult = { checked: number; external: number; imported: number; failed: Array<{ title: string; reason: string }> };

export default function MaintenancePanel() {
  const [running, setRunning] = useState<"" | "import-images" | "create-indexes">("");
  const [message, setMessage] = useState("");
  const [failures, setFailures] = useState<ImportResult["failed"]>([]);

  async function run(action: "import-images" | "create-indexes") {
    setRunning(action);
    setMessage("");
    setFailures([]);
    try {
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.error || "Task failed");
        return;
      }
      if (action === "import-images") {
        const result = data as ImportResult;
        setMessage(
          result.external === 0
            ? "All featured images are already hosted on Cloudinary."
            : `Imported ${result.imported} of ${result.external} external image(s).`
        );
        setFailures(result.failed || []);
      } else {
        setMessage("Database indexes are up to date.");
      }
    } catch {
      setMessage("Network error — please try again.");
    } finally {
      setRunning("");
    }
  }

  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
        <Wrench className="h-5 w-5 text-brand-600" /> Maintenance
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">One-click fixes for site health. Safe to run more than once.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
            <ImageUp className="h-4 w-4" /> Host featured images on Cloudinary
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Copies images hotlinked from other websites so they load fast and never break.
          </p>
          <button type="button" onClick={() => run("import-images")} disabled={Boolean(running)} className="btn-primary mt-4">
            {running === "import-images" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
            Import images
          </button>
        </div>
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
            <Database className="h-4 w-4" /> Create database indexes
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Adds any missing MongoDB indexes so listings and analytics stay fast. Existing indexes are kept.
          </p>
          <button type="button" onClick={() => run("create-indexes")} disabled={Boolean(running)} className="btn-primary mt-4">
            {running === "create-indexes" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Sync indexes
          </button>
        </div>
      </div>

      {message && (
        <div role="status" className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <p className="font-medium">{message}</p>
          {failures.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-rose-600 dark:text-rose-400">
              {failures.map((failure) => (
                <li key={failure.title}>
                  {failure.title}: {failure.reason} — please upload a new image for this post.
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
