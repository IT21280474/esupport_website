import type { SectionKey } from "./types";

/* ══════════════════════════════════════════════════════════════════════════
   Admin field schema types. The definitions themselves live in the Laravel
   API (esupport_api/resources/content/schema.json), which serves them to the
   admin forms and validates every save against them.
   ══════════════════════════════════════════════════════════════════════════ */

type Base = { key: string; label: string; help?: string };

export type Field =
    | (Base & { kind: "text" | "url"; placeholder?: string })
    | (Base & { kind: "textarea"; rows?: number })
    | (Base & { kind: "color" })
    | (Base & { kind: "image"; captureFrom?: string })
    | (Base & { kind: "number"; min?: number; max?: number; step?: number })
    | (Base & { kind: "boolean" })
    | (Base & { kind: "select"; options: string[] })
    | (Base & { kind: "stringList"; placeholder?: string; fixedLength?: number })
    | (Base & { kind: "multiSelect"; optionsFrom: string })
    | (Base & { kind: "list"; itemTitle: string; fields: Field[]; newItem: Record<string, unknown> })
    | (Base & { kind: "sections"; labels: Record<string, string> });

export type SectionGroup = "Global" | "Home page" | "Services page" | "Gallery page" | "Careers page" | "Footer";

export type SectionDef = {
    key: SectionKey;
    title: string;
    group: SectionGroup;
    description: string;
    fields: Field[];
};

export type ContentSchema = {
    layoutKeys: string[];
    sections: SectionDef[];
};
