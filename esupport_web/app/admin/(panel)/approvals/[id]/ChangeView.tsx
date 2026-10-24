import type { Field } from "@/lib/content/schema";
import { cardCls } from "../../../_components/ui";

/* Side-by-side "live now" vs "proposed" for the fields an editor changed. */

type Obj = Record<string, unknown>;

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const IMAGE = /\.(webp|png|jpe?g|gif|svg|avif)(\?.*)?$/i;
const COLOR = /^#[0-9a-f]{3,8}$/i;

export default function ChangeView({ fields, live, proposed }: { fields: Field[]; live: Obj; proposed: Obj }) {
    const changed = fields.filter(f => !same(live[f.key], proposed[f.key]));

    if (!changed.length) {
        return <p className={`${cardCls} px-5 py-8 text-center text-sm text-neutral-500`}>No differences from the live content.</p>;
    }

    return (
        <div className="space-y-4">
            {changed.map(field => (
                <FieldChange key={field.key} field={field} before={live[field.key]} after={proposed[field.key]} />
            ))}
        </div>
    );
}

function FieldChange({ field, before, after }: { field: Field; before: unknown; after: unknown }) {
    /* Long lists (e.g. 69 portfolio sites): only show the items that differ. */
    if (field.kind === "list" && Array.isArray(before) && Array.isArray(after)) {
        const rows = Array.from({ length: Math.max(before.length, after.length) }, (_, i) => i).filter(i => !same(before[i], after[i]));
        const titleOf = (item: unknown, i: number) => String((item as Obj | undefined)?.[field.itemTitle] ?? "").trim() || `Item ${i + 1}`;

        return (
            <section className={`${cardCls} overflow-hidden`}>
                <h3 className="border-b border-neutral-200 px-5 py-3 text-sm font-semibold">
                    {field.label}
                    <span className="ml-2 font-normal text-neutral-400">
                        {before.length} → {after.length} items · {rows.length} changed
                    </span>
                </h3>
                <div className="divide-y divide-neutral-100">
                    {rows.map(i => (
                        <Compare
                            key={i}
                            label={`#${i + 1} ${titleOf(after[i] ?? before[i], i)}${before[i] === undefined ? " (new)" : after[i] === undefined ? " (removed)" : ""}`}
                            before={before[i]}
                            after={after[i]}
                            fields={field.fields}
                        />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className={`${cardCls} overflow-hidden`}>
            <Compare label={field.label} before={before} after={after} />
        </section>
    );
}

function Compare({ label, before, after, fields }: { label: string; before: unknown; after: unknown; fields?: Field[] }) {
    return (
        <div className="px-5 py-4">
            <p className="mb-3 text-sm font-semibold">{label}</p>
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Live now</p>
                    <Value value={before} fields={fields} />
                </div>
                <div className="min-w-0 rounded-lg border border-green-200 bg-green-50/60 p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-green-700">Proposed</p>
                    <Value value={after} fields={fields} />
                </div>
            </div>
        </div>
    );
}

function Value({ value, fields }: { value: unknown; fields?: Field[] }) {
    if (value === null || value === undefined || value === "") return <span className="text-sm italic text-neutral-400">empty</span>;
    if (typeof value === "boolean") return <span className="text-sm">{value ? "Yes" : "No"}</span>;
    if (typeof value === "number") return <span className="text-sm">{value}</span>;

    if (typeof value === "string") {
        if (IMAGE.test(value) || value.startsWith("/uploads/")) {
            return (
                <span className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={value} alt="" className="max-h-40 rounded-md border border-neutral-200 bg-white object-contain" loading="lazy" />
                    <span className="mt-1 block break-all text-xs text-neutral-500">{value}</span>
                </span>
            );
        }
        if (COLOR.test(value)) {
            return (
                <span className="inline-flex items-center gap-2 text-sm">
                    <span className="h-4 w-4 rounded border border-neutral-300" style={{ backgroundColor: value }} />
                    {value}
                </span>
            );
        }
        return <span className="block whitespace-pre-line break-words text-sm">{value}</span>;
    }

    if (Array.isArray(value)) {
        if (!value.length) return <span className="text-sm italic text-neutral-400">none</span>;
        return (
            <ol className="space-y-1.5">
                {value.map((item, i) => (
                    <li key={i} className="text-sm">
                        <Value value={item} fields={fields} />
                    </li>
                ))}
            </ol>
        );
    }

    if (typeof value === "object") {
        const labelOf = (key: string) => fields?.find(f => f.key === key)?.label ?? key;
        return (
            <dl className="space-y-1.5">
                {Object.entries(value as Obj).map(([key, v]) => (
                    <div key={key}>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{labelOf(key)}</dt>
                        <dd>
                            <Value value={v} />
                        </dd>
                    </div>
                ))}
            </dl>
        );
    }

    return <span className="text-sm">{String(value)}</span>;
}
