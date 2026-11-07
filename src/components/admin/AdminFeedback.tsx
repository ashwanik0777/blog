"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; message: string };

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
};

type ToastApi = Record<ToastTone, (message: string) => void>;
type FeedbackContextValue = { toast: ToastApi; confirm: (options: ConfirmOptions) => Promise<boolean> };

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const TOAST_STYLES: Record<ToastTone, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-400" },
  error: { icon: XCircle, className: "text-rose-600 dark:text-rose-400" },
  info: { icon: Info, className: "text-brand-600 dark:text-brand-400" },
};

let nextToastId = 0;

/** In-page toasts and confirmation dialogs for the admin dashboard (replaces alert/confirm). */
export function AdminFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = ++nextToastId;
      setToasts((current) => [...current.slice(-3), { id, tone, message }]);
      setTimeout(() => dismiss(id), tone === "error" ? 6000 : 3500);
    },
    [dismiss]
  );

  const toast = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      info: (message) => push("info", message),
    }),
    [push]
  );

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setDialog({ ...options, resolve })),
    []
  );

  const closeDialog = useCallback(
    (value: boolean) => {
      dialog?.resolve(value);
      setDialog(null);
    },
    [dialog]
  );

  useEffect(() => {
    if (!dialog) return;
    // Destructive actions start focused on "Cancel" so Enter never deletes by accident.
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, closeDialog]);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);
  const danger = dialog?.tone === "danger";

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((item) => {
          const { icon: Icon, className } = TOAST_STYLES[item.tone];
          return (
            <div
              key={item.id}
              role={item.tone === "error" ? "alert" : "status"}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg shadow-zinc-900/10 animate-fade-up dark:border-zinc-700 dark:bg-zinc-900"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${className}`} aria-hidden />
              <p className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-md p-0.5 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
            onClick={() => closeDialog(false)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby={dialog.message ? "confirm-message" : undefined}
            className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-fade-up dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="flex gap-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  danger
                    ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                    : "bg-brand-100 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300"
                }`}
              >
                {danger ? <AlertTriangle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
              </span>
              <div className="min-w-0">
                <h2 id="confirm-title" className="text-lg font-bold text-zinc-900 dark:text-white">
                  {dialog.title}
                </h2>
                {dialog.message && (
                  <p id="confirm-message" className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {dialog.message}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button ref={cancelRef} type="button" onClick={() => closeDialog(false)} className="btn-ghost">
                {dialog.cancelLabel || "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => closeDialog(true)}
                className={danger ? "btn bg-rose-600 text-white hover:bg-rose-700" : "btn-brand"}
              >
                {dialog.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useToast/useConfirm must be used inside <AdminFeedbackProvider>");
  return context;
}

export function useToast() {
  return useFeedback().toast;
}

export function useConfirm() {
  return useFeedback().confirm;
}

/** Reads the API's `{ error }` message so toasts explain *why* something failed. */
export async function errorMessage(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  return typeof data?.error === "string" && data.error ? data.error : fallback;
}
