import { useId, type ComponentProps, type ReactNode } from "react";

const control =
  "w-full rounded-xl border border-ink-200 bg-white px-3.5 text-[15px] text-ink-950 placeholder:text-ink-400 transition-colors hover:border-ink-300 focus:border-leaf-600 focus:outline-none focus:ring-4 focus:ring-lime-300/40 disabled:bg-ink-50 disabled:text-ink-500 aria-[invalid=true]:border-flame-500";

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-ink-800">
        {label}
      </label>
      {children(id)}
      {error ? (
        <p className="text-xs font-medium text-flame-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = ({ className = "", ...p }: ComponentProps<"input">) => (
  <input className={`${control} h-11 ${className}`} {...p} />
);

export const Select = ({ className = "", ...p }: ComponentProps<"select">) => (
  <select className={`${control} h-11 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 fill=%22none%22 stroke=%22%236b7165%22 stroke-width=%222%22 viewBox=%220 0 24 24%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_0.75rem_center] bg-no-repeat pr-9 ${className}`} {...p} />
);

export const Textarea = ({ className = "", ...p }: ComponentProps<"textarea">) => (
  <textarea className={`${control} min-h-24 py-2.5 ${className}`} {...p} />
);

export function Checkbox({ label, hint, ...p }: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 bg-white p-3 transition-colors hover:border-ink-300 has-[:checked]:border-leaf-600 has-[:checked]:bg-lime-100/60">
      <input type="checkbox" className="mt-0.5 size-4.5 accent-leaf-600" {...p} />
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-ink-900">{label}</span>
        {hint ? <span className="text-xs text-ink-500">{hint}</span> : null}
      </span>
    </label>
  );
}
