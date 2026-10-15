"use client";

import {
  ExternalLink, Image as ImageIcon, LayoutDashboard, LogOut, Menu, MessageSquare, Package, Settings, ShoppingCart,
  Tags, Users, X, type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/shared/lib/api";
import { useT } from "@/shared/i18n/client";
import type { Dict } from "@/shared/i18n/dict";
import type { Role, SessionUser } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { LangSwitch } from "@/shared/ui/LangSwitch";
import { LogoMark } from "@/shared/ui/Logo";
import { Loading } from "@/shared/ui/States";

const SessionContext = createContext<SessionUser | null>(null);
export const useSession = () => useContext(SessionContext)!;
export const can = (user: SessionUser, ...roles: Role[]) => user.role === "admin" || roles.includes(user.role);

interface NavItem {
  href: string;
  label: keyof Dict["admin"]["nav"];
  icon: LucideIcon;
  roles: Role[];
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "dashboard", icon: LayoutDashboard, roles: ["manager"], exact: true },
  { href: "/admin/buyurtmalar", label: "orders", icon: ShoppingCart, roles: ["manager", "courier"] },
  { href: "/admin/tovarlar", label: "products", icon: Package, roles: ["manager"] },
  { href: "/admin/kategoriyalar", label: "categories", icon: Tags, roles: ["manager"] },
  { href: "/admin/bannerlar", label: "banners", icon: ImageIcon, roles: ["manager"] },
  { href: "/admin/sharhlar", label: "reviews", icon: MessageSquare, roles: ["manager"] },
  { href: "/admin/xodimlar", label: "staff", icon: Users, roles: ["admin"] },
  { href: "/admin/sozlamalar", label: "settings", icon: Settings, roles: ["admin"] },
];

function NewOrdersBadge() {
  const { data } = useApi<{ counts: Record<string, number> }>("/orders?limit=1", { pollMs: 30_000 });
  const n = data?.counts.new ?? 0;
  const title = useT().admin.docTitle;
  useEffect(() => {
    document.title = n ? `(${n}) ${title}` : title;
  }, [n, title]);
  return n ? <span className="ml-auto rounded-full bg-lime-400 px-2 text-xs font-bold text-ink-950">{n}</span> : null;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { data: user, error } = useApi<SessionUser>("/auth/me");
  const pathname = usePathname();
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  if (error) return <Loading label={t.admin.redirecting} />;
  if (!user) return <Loading />;

  const items = NAV.filter((n) => can(user, ...n.roles));
  const logout = async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    window.location.href = "/login";
  };

  const nav = (
    <nav aria-label={t.admin.menu} className="flex flex-1 flex-col gap-1">
      {items.map((n) => {
        const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${active ? "bg-white/10 text-white" : "text-ink-400 hover:bg-white/5 hover:text-white"}`}
          >
            <n.icon className={`size-4.5 ${active ? "text-lime-400" : ""}`} aria-hidden />
            {t.admin.nav[n.label]}
            {n.href === "/admin/buyurtmalar" ? <NewOrdersBadge /> : null}
          </Link>
        );
      })}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href={items[0]?.href ?? "/admin"} className="flex items-center gap-2.5 px-2 pt-1">
        <LogoMark className="size-9" />
        <span className="leading-none">
          <span className="block font-display text-lg font-extrabold text-white">МИР</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-400">{t.admin.brand}</span>
        </span>
      </Link>
      {nav}
      <div className="space-y-1 border-t border-white/10 pt-4">
        <Link href="/" target="_blank" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-400 hover:bg-white/5 hover:text-white">
          <ExternalLink className="size-4.5" aria-hidden />
          {t.admin.openSite}
        </Link>
        <button type="button" onClick={logout} className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink-400 hover:bg-white/5 hover:text-white">
          <LogOut className="size-4.5" aria-hidden />
          {t.admin.logout}
        </button>
        <LangSwitch tone="dark" className="ml-3 mt-2" />
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
        <span className="grid size-9 place-items-center rounded-full bg-lime-400 font-bold text-ink-950">{user.full_name.slice(0, 1)}</span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">{user.full_name}</span>
          <span className="block text-xs text-ink-400">{t.status.role[user.role].label}</span>
        </span>
      </div>
    </div>
  );

  return (
    <SessionContext.Provider value={user}>
      <div className="min-h-dvh lg:pl-64">
        <aside className="fixed inset-y-0 left-0 hidden w-64 bg-ink-950 lg:block">{sidebar}</aside>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button type="button" aria-label={t.admin.openMenu} aria-expanded={open} onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl hover:bg-ink-100">
            <Menu className="size-5" />
          </button>
          <span className="font-display font-bold">МИР</span>
          <span className="size-10" />
        </header>
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={t.admin.menuDialog}>
            <button type="button" aria-label={t.admin.closeMenu} className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 animate-fade-up bg-ink-950">
              <button type="button" aria-label={t.admin.closeMenu} onClick={() => setOpen(false)} className="absolute right-3 top-3 grid size-9 place-items-center rounded-xl text-ink-400 hover:bg-white/10">
                <X className="size-5" />
              </button>
              {sidebar}
            </div>
          </div>
        ) : null}
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </SessionContext.Provider>
  );
}
