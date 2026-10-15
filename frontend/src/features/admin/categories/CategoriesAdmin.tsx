"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api, ApiError } from "@/shared/lib/api";
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
          const body = { name: f.get("name"), slug: f.get("slug"), sort: Number(f.get("sort")) || 0, active: f.get("active") === "on", icon, image: initial?.image ?? null };
          if (initial) await api(`/categories/${initial.id}`, { method: "PATCH", json: body });
          else await api("/categories", { method: "POST", json: body });
          onSaved();
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Xatolik");
          setSaving(false);
        }
      }}
    >
      <Field label="Nomi">{(id) => <Input id={id} name="name" required minLength={2} maxLength={80} defaultValue={initial?.name} placeholder="Televizorlar" />}</Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
        <Field label="Manzil (slug)" hint="Bo'sh qolsa nomdan yasaladi">
          {(id) => <Input id={id} name="slug" maxLength={80} defaultValue={initial?.slug} placeholder="televizorlar" />}
        </Field>
        <Field label="Tartib">{(id) => <Input id={id} name="sort" type="number" min={0} max={10000} defaultValue={initial?.sort ?? 0} />}</Field>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink-800">Belgi (ikonka)</legend>
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
          {Object.entries(CATEGORY_ICONS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              aria-label={label}
              aria-pressed={icon === key}
              title={label}
              onClick={() => setIcon(key)}
              className={`grid aspect-square place-items-center rounded-xl transition-colors ${icon === key ? "bg-ink-950 text-lime-400" : "bg-ink-50 text-ink-600 hover:bg-ink-100"}`}
            >
              <CategoryIcon name={key} className="size-5" />
            </button>
          ))}
        </div>
      </fieldset>
      <Checkbox name="active" label="Saytda ko'rsatish" hint="O'chirilsa, kategoriya va uning tovarlari saytdan yashiriladi" defaultChecked={initial?.active ?? true} />
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Saqlanmoqda…" : "Saqlash"}
      </Button>
    </form>
  );
}

export function CategoriesAdmin() {
  const { data, error, reload } = useApi<Category[]>("/categories");
  const [edit, setEdit] = useState<Category | null | "new">(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const remove = async (c: Category) => {
    if (!confirm(`"${c.name}" kategoriyasini o'chirasizmi?`)) return;
    setActionError(null);
    try {
      await api(`/categories/${c.id}`, { method: "DELETE" });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? (err.status === 409 ? "Kategoriyada tovarlar bor. Avval tovarlarni boshqa kategoriyaga o'tkazing yoki kategoriyani yashiring." : err.message) : "Xatolik");
    }
  };

  return (
    <div>
      <PageHeader
        title="Kategoriyalar"
        subtitle="Katalog bo'limlari, menyu va bosh sahifadagi plitkalar"
        action={
          <Button onClick={() => setEdit("new")}>
            <Plus className="size-4.5" aria-hidden /> Yangi kategoriya
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
          <Empty title="Kategoriya yo'q" />
        ) : (
          <Table head={["Kategoriya", "Manzil", "Tovarlar", "Tartib", "Holat", ""]}>
            {data.map((c) => (
              <tr key={c.id} className="hover:bg-ink-50">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3 font-semibold">
                    <span className="grid size-10 place-items-center rounded-xl bg-lime-100 text-leaf-700">
                      <CategoryIcon name={c.icon} />
                    </span>
                    {c.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-500">/katalog/{c.slug}</td>
                <td className="px-4 py-3">{c.product_count}</td>
                <td className="px-4 py-3">{c.sort}</td>
                <td className="px-4 py-3">
                  <Badge tone={c.active ? "leaf" : "muted"}>{c.active ? "Ko'rinadi" : "Yashirin"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <IconButton label={`${c.name} — tahrirlash`} onClick={() => setEdit(c)}>
                      <Pencil className="size-4" />
                    </IconButton>
                    <IconButton label={`${c.name} — o'chirish`} onClick={() => remove(c)} className="hover:!bg-flame-50 hover:!text-flame-600">
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Modal open={edit !== null} title={edit === "new" ? "Yangi kategoriya" : "Kategoriyani tahrirlash"} onClose={() => setEdit(null)}>
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
