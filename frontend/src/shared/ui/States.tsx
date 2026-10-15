import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function Loading({ label = "Yuklanmoqda…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-ink-500">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function Empty({ title, hint, action, icon }: { title: string; hint?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-ink-100 text-ink-500">{icon ?? <Inbox className="size-6" aria-hidden />}</div>
      <p className="font-display text-base font-semibold text-ink-900">{title}</p>
      {hint ? <p className="max-w-sm text-sm text-ink-500">{hint}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-flame-50 text-flame-600">
        <AlertTriangle className="size-5" aria-hidden />
      </div>
      <p className="text-sm text-ink-700">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="text-sm font-semibold text-leaf-700 underline-offset-4 hover:underline">
          Qayta urinish
        </button>
      ) : null}
    </div>
  );
}

export function Alert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "success" | "info" }) {
  const cls =
    tone === "error"
      ? "bg-flame-50 text-flame-600 ring-flame-500/20"
      : tone === "success"
        ? "bg-lime-100 text-leaf-700 ring-leaf-600/20"
        : "bg-ink-100 text-ink-700 ring-ink-300";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl px-3.5 py-2.5 text-sm font-medium ring-1 ${cls}`}>
      {children}
    </div>
  );
}
