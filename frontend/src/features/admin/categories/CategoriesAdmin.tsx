"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api, ApiError } from "@/shared/lib/api";
import { useT } from "@/shared/i18n/client";
import type { Category } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { Badge } from "@/shared/ui/Badge";
import { Button, IconButton } from "@/shared/ui/Button";
import { CATEGORY_ICONS, CategoryIcon } from "@/shared/ui/CategoryIcon";
import { Checkbox, Field, Input } from "@/shared/ui/Field";
import { Modal } from "@/shared/ui/Modal";
import { Card, PageHeader, Table } from "@/shared/ui/Page";
import { Alert, Empty, ErrorState, Loading } from "@/shared/ui/States";

function CategoryForm({ initial, onSaved }: { initial: Category | null; onSaved: () => void }) {
  const t = useT();
  const tr = t.admin.categories;
  const [icon, setIcon] = useState(initial?.icon ?? "package");
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
          const body = { name: f.get("name"), name_ky: f.get("name_ky") ?? "", slug: f.get("slug"), sort: Number(f.get("sort")) || 0, active: f.get("active") === "on", icon, image: initial?.image ?? null };
          if (initial) await api(`/categories/${initial.id}`, { method: "PATCH", json: body });
          else await api("/categories", { method: "POST", json: body });
          onSaved();
        } catch (err) {
          setError(err instanceof ApiError ? err.message : t.common.error);
          setSaving(false);
        }
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={tr.name}>{(id) => <Input id={id} name="name" required minLength={2} maxLength={80} defaultValue={initial?.name} placeholder={tr.namePlaceholder} />}</Field>
        <Field label={tr.nameKy} hint={t.admin.kyHint}>{(id) => <Input id={id} name="name_ky" lang="ky" maxLength={80} defaultValue={initial?.name_ky ?? ""} />}</Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Field label={tr.slug} hint={tr.slugHint}>
          {(id) => <Input id={id} name="slug" maxLength={80} defaultValue={initial?.slug} placeholder="televizory" />}
        </Field>
        <Field label={tr.sort}>{(id) => <Input id={id} name="sort" type="number" min={0} max={10000} defaultValue={initial?.sort ?? 0} />}</Field>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink-800">{tr.icon}</legend>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
          {Object.keys(CATEGORY_ICONS).map((key) => (
            <button
              key={key}
              type="button"
              aria-label={t.icons[key]}
              aria-pressed={icon === key}
              title={t.icons[key]}
              onClick={() => setIcon(key)}
              className={`grid aspect-square place-items-center rounded-xl transition-colors ${icon === key ? "bg-ink-950 text-lime-400" : "bg-ink-50 text-ink-600 hover:bg-ink-100"}`}
            >
              <CategoryIcon name={key} className="size-5" />
            </button>
          ))}
        </div>
      </fieldset>
      <Checkbox name="active" label={tr.show} hint={tr.showHint} defaultChecked={initial?.active ?? true} />
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? t.common.saving : t.common.save}
      </Button>
    </form>
  );
}

export function CategoriesAdmin() {
  const t = useT();
  const tr = t.admin.categories;
  const { data, error, reload } = useApi<Category[]>("/categories");
  const [edit, setEdit] = useState<Category | null | "new">(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const remove = async (c: Category) => {
    if (!confirm(tr.removeConfirm(c.name))) return;
    setActionError(null);
    try {
      await api(`/categories/${c.id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? (err.status === 409 ? tr.hasProducts : err.message) : t.common.error);
    }
  };

  return (
    <div>
      <PageHeader
        title={tr.title}
        subtitle={tr.subtitle}
        action={
          <Button onClick={() => setEdit("new")}>
            <Plus className="size-4.5" aria-hidden /> {tr.new}
          </Button>
        }
      />
      {actionError ? <div className="mb-3"><Alert>{actionError}</Alert></div> : null}
      <Card>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data ? (
          <Loading />
        ) : !data.length ? (
          <Empty title={tr.empty} />
        ) : (
          <Table head={tr.head}>
            {data.map((c) => (
              <tr key={c.id} className="hover:bg-ink-50">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3 font-semibold">
                    <span className="grid size-10 place-items-center rounded-xl bg-lime-100 text-leaf-700">
                      <CategoryIcon name={c.icon} />
                    </span>
                    <span>
                      {c.name}
                      {c.name_ky ? <span lang="ky" className="block text-xs font-normal text-ink-500">{c.name_ky}</span> : null}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-500">/katalog/{c.slug}</td>
                <td className="px-4 py-3">{c.product_count}</td>
                <td className="px-4 py-3">{c.sort}</td>
                <td className="px-4 py-3">
                  <Badge tone={c.active ? "leaf" : "muted"}>{c.active ? tr.visible : tr.hidden}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconButton label={tr.editLabel(c.name)} onClick={() => setEdit(c)}>
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton label={tr.removeLabel(c.name)} onClick={() => remove(c)} className="hover:!bg-flame-50 hover:!text-flame-600">
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Modal open={edit !== null} title={edit === "new" ? tr.new : tr.edit} onClose={() => setEdit(null)}>
        {edit !== null ? (
          <CategoryForm
            key={edit === "new" ? "new" : edit.id}
            initial={edit === "new" ? null : edit}
            onSaved={() => {
              setEdit(null);
              reload();
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
