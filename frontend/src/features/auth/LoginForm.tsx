"use client";

import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/shared/lib/api";
import { useT } from "@/shared/i18n/client";
import type { SessionUser } from "@/shared/lib/types";
import { Button } from "@/shared/ui/Button";
import { Field, Input } from "@/shared/ui/Field";
import { Alert } from "@/shared/ui/States";

function safeNext(next: string | null, role: SessionUser["role"]) {
  if (next && next.startsWith("/admin") && !next.startsWith("//")) return next;
  return role === "courier" ? "/admin/buyurtmalar" : "/admin";
}

export function LoginForm() {
  const t = useT();
  const params = useSearchParams();
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setSaving(true);
        setError(null);
        try {
          const user = await api<SessionUser>("/auth/login", { method: "POST", json: { username: f.get("username"), password: f.get("password") } });
          window.location.href = safeNext(params.get("next"), user.role);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : t.common.error);
          setSaving(false);
        }
      }}
    >
      <Field label={t.login.login}>{(id) => <Input id={id} name="username" required autoComplete="username" autoFocus maxLength={60} />}</Field>
      <Field label={t.login.password}>
        {(id) => (
          <div className="relative">
            <Input id={id} name="password" type={show ? "text" : "password"} required autoComplete="current-password" maxLength={200} className="pr-11" />
            <button
              type="button"
              aria-label={show ? t.login.hide : t.login.show}
              aria-pressed={show}
              onClick={() => setShow((v) => !v)}
              className="absolute right-1 top-1 grid size-9 place-items-center rounded-lg text-ink-500 hover:bg-ink-100"
            >
              {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          </div>
        )}
      </Field>
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" size="lg" className="w-full" disabled={saving}>
        {saving ? t.login.submitting : t.login.submit}
      </Button>
    </form>
  );
}
