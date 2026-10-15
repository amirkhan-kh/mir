"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/shared/lib/format";

export function SalesChart({ data }: { data: { day: string; sales: number; orders: number }[] }) {
  const rows = data.map((d) => ({ ...d, label: d.day.slice(8, 10) + "." + d.day.slice(5, 7) }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#a2d42b" stopOpacity={0.55} />
              <stop offset="1" stopColor="#a2d42b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eef0ea" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="#6b7165" />
          <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#6b7165" width={48} tickFormatter={(v: number) => (v >= 1e6 ? `${Math.round(v / 1e6)}m` : `${Math.round(v / 1e3)}k`)} />
          <Tooltip
            formatter={(v, name) => (name === "sales" ? [formatMoney(Number(v)), "Savdo"] : [v, "Buyurtma"])}
            labelFormatter={(l) => `Sana: ${l}`}
            contentStyle={{ borderRadius: 12, border: "1px solid #e0e3db", fontSize: 13 }}
          />
          <Area type="monotone" dataKey="sales" stroke="#3e8a1b" strokeWidth={2.5} fill="url(#sales-fill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
