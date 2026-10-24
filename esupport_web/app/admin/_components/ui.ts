/* Shared Tailwind class strings for the admin panel. */

export const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 " +
    "focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:bg-neutral-100";

export const labelCls = "block text-[13px] font-medium text-neutral-800 mb-1.5";

export const helpCls = "mt-1 text-xs text-neutral-500";

const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors " +
    "disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900";

export const btn = {
    primary: `${btnBase} bg-neutral-900 text-white hover:bg-neutral-700`,
    brand: `${btnBase} bg-[var(--brand-1)] text-white hover:opacity-90`,
    secondary: `${btnBase} border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50`,
    ghost: `${btnBase} text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900`,
    danger: `${btnBase} border border-red-200 bg-white text-red-600 hover:bg-red-50`,
    small: "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40",
};

export const cardCls = "rounded-xl border border-neutral-200 bg-white";

export function formatDate(iso: string | null | undefined): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
