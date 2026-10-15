"use client";

import { KeyRound, Pencil, Plus, Wand2 } from "lucide-react";
import { useState } from "react";
import { api, ApiError } from "@/shared/lib/api";
import { formatPhone, formatRelative } from "@/shared/lib/format";
import { useT } from "@/shared/i18n/client";
import { ROLES } from "@/shared/lib/status";
import type { Role, Staff } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { Badge } from "@/shared/ui/Badge";
import { Button, IconButton } from "@/shared/ui/Button";
import { Checkbox, Field, Input } from "@/shared/ui/Field";
import { Modal } from "@/shared/ui/Modal";
import { Card, PageHeader, Table } from "@/shared/ui/Page";
import { Alert, ErrorState, Loading } from "@/shared/ui/States";
import { useSession } from "../AdminShell";

function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(12));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function RolePicker({ value, onChange, disabled }: { value: Role; onChange: (r: Role) => void; disabled?: boolean }) {
  const t = useT();
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-sm font-semibold text-ink-800">{t.admin.staff.role}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {ROLES.map((r) => (
          <label key={r} className={`cursor-pointer rounded-2xl border-2 p-3 transition-colors ${value === r ? "border-ink-950 bg-lime-100/60" : "border-ink-100 hover:border-ink-300"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
            <input type="radio" name="role" value={r} checked={value === r} onChange={() => onChange(r)} className="sr-only" />
            <span className="block text-sm font-semibold">{t.status.role[r].label}</span>
            <span className="block text-xs text-ink-500">{t.status.role[r].hint}</span>
          </label>
        ))}
      </div>
      {disabled ? <p className="mt-1 text-xs text-ink-500">{t.admin.staff.selfRole}</p> : null}
    </fieldset>
  );
}

function PasswordField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useT().admin.staff;
  return (
    <Field label={t.password} hint={t.passwordHint}>
      {(id) => (
        <div className="flex gap-2">
          <Input id={id} required minLength={8} maxLength={200} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="new-password" />
          <Button variant="soft" aria-label={t.generate} onClick={() => onChange(generatePassword())}>
            <Wand2 className="size-4" aria-hidden />
          </Button>
        </div>
      )}
    </Field>
  );
}

function StaffForm({ initial, onSaved }: { initial: Staff | null; onSaved: (msg: string) => void }) {
  const me = useSession();
  const t = useT();
  const tr = t.admin.staff;
  const [role, setRole] = useState<Role>(initial?.role ?? "courier");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const self = initial?.id === me.id;

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setSaving(true);
        setError(null);
        try {
          if (initial) {
            await api(`/users/${initial.id}`, { method: "PATCH", json: { full_name: f.get("full_name"), phone: f.get("phone"), role, active: f.get("active") === "on" } });
            onSaved(t.common.saved);
          } else {
            await api("/users", { method: "POST", json: { username: f.get("username"), password, full_name: f.get("full_name"), phone: f.get("phone"), role } });
            onSaved(tr.created(String(f.get("username")), password));
          }
        } catch (err) {
          setError(err instanceof ApiError ? err.message : t.common.error);
          setSaving(false);
        }
      }}
    >
      <Field label={tr.fullName}>{(id) => <Input id={id} name="full_name" required minLength={2} maxLength={120} defaultValue={initial?.full_name} />}</Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={tr.phone}>{(id) => <Input id={id} name="phone" type="tel" maxLength={20} defaultValue={initial?.phone ?? ""} placeholder="+998 90 123 45 67" />}</Field>
        {initial ? null : (
          <Field label={tr.login} hint={tr.loginHint}>
            {(id) => <Input id={id} name="username" required minLength={3} maxLength={40} pattern="[A-Za-z0-9._\-]+" autoComplete="off" />}
          </Field>
        )}
      </div>
      {initial ? null : <PasswordField value={password} onChange={setPassword} />}
      <RolePicker value={role} onChange={setRole} disabled={self} />
      {initial ? <Checkbox name="active" label={tr.active} hint={tr.activeHint} defaultChecked={initial.active} disabled={self} /> : null}
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? t.common.saving : t.common.save}
      </Button>
    </form>
  );
}

function ResetPassword({ staff, onSaved }: { staff: Staff; onSaved: (msg: string) => void }) {
  const t = useT();
  const [password, setPassword] = useState(generatePassword);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await api(`/users/${staff.id}/password`, { method: "POST", json: { password } });
          onSaved(t.admin.staff.newPassword(staff.full_name, password));
        } catch (err) {
          setError(err instanceof ApiError ? err.message : t.common.error);
        }
      }}
    >
      <p className="text-sm text-ink-600">{t.admin.staff.resetHint}</p>
      <PasswordField value={password} onChange={setPassword} />
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" className="w-full">
        {t.admin.staff.setPassword}
      </Button>
    </form>
  );
}

export function StaffAdmin() {
  const t = useT();
  const tr = t.admin.staff;
  const { data, error, reload } = useApi<Staff[]>("/users");
  const [modal, setModal] = useState<{ kind: "new" } | { kind: "edit" | "password"; staff: Staff } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const done = (msg: string) => {
    setModal(null);
    setNotice(msg);
    reload();
  };

  return (
    <div>
      <PageHeader
        title={tr.title}
        subtitle={tr.subtitle}
        action={
          <Button onClick={() => setModal({ kind: "new" })}>
            <Plus className="size-4.5" aria-hidden /> {tr.new}
          </Button>
        }
      />
      {notice ? <div className="mb-3"><Alert tone="success">{notice}</Alert></div> : null}
      <Card>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data ? (
          <Loading />
        ) : (
          <Table head={tr.head}>
            {data.map((s) => (
              <tr key={s.id} className={s.active ? "" : "opacity-60"}>
                <td className="px-4 py-3">
                  <p className="font-semibold">{s.full_name}</p>
                  <p className="text-xs text-ink-500">
                    @{s.username}
                    {s.phone ? ` · ${formatPhone(s.phone)}` : ""}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={s.role === "admin" ? "ink" : s.role === "manager" ? "lime" : "sky"}>{t.status.role[s.role].label}</Badge>
                </td>
                <td className="px-4 py-3">{s.open_orders}</td>
                <td className="px-4 py-3 text-ink-500">{s.last_login_at ? formatRelative(s.last_login_at, t.time) : "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={s.active ? "leaf" : "flame"}>{s.active ? tr.active : tr.blocked}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconButton label={tr.editLabel(s.full_name)} onClick={() => setModal({ kind: "edit", staff: s })}>
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton label={tr.resetLabel(s.full_name)} onClick={() => setModal({ kind: "password", staff: s })}>
                      <KeyRound className="size-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Modal
        open={modal !== null}
        title={modal?.kind === "new" ? tr.new : modal?.kind === "edit" ? tr.edit : tr.reset}
        onClose={() => setModal(null)}
      >
        {modal?.kind === "new" ? <StaffForm initial={null} onSaved={done} /> : null}
        {modal?.kind === "edit" ? <StaffForm key={modal.staff.id} initial={modal.staff} onSaved={done} /> : null}
        {modal?.kind === "password" ? <ResetPassword key={modal.staff.id} staff={modal.staff} onSaved={done} /> : null}
      </Modal>
    </div>
  );
}
