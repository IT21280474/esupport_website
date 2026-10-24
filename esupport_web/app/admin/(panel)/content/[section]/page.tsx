import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/server/api";
import { requireUser } from "@/lib/server/auth";
import type { SectionDef } from "@/lib/content/schema";
import type { SectionKey } from "@/lib/content/types";
import SectionEditor, { type Draft } from "../../../_components/SectionEditor";

/* Where "View" opens for each section. */
const PREVIEW: Partial<Record<SectionKey, string>> = {
    servicesShowcase: "/services",
    galleryPage: "/gallery",
    careersPage: "/careers",
    portfolio: "/#portfolio",
    about: "/#about",
    contact: "/#contact",
};

type SectionResponse = {
    definition: SectionDef;
    data: Record<string, unknown>;
    meta: { updated_at: string; updated_by: string | null } | null;
    draft: Draft | null;
    pending_count: number;
    revisions: { id: number; created_at: string; user_name: string | null }[];
};

export const metadata = { title: "Edit content" };

export default async function ContentPage({ params }: { params: Promise<{ section: string }> }) {
    const { user, token } = await requireUser();
    const key = (await params).section as SectionKey;

    let section: SectionResponse;
    try {
        section = await api<SectionResponse>(`/admin/sections/${encodeURIComponent(key)}`, { token });
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) notFound();
        throw err;
    }

    return (
        <SectionEditor
            key={key}
            definition={section.definition}
            initial={section.data}
            revisions={section.revisions}
            meta={section.meta ?? undefined}
            canReset={user.role === "admin"}
            canPublish={user.role === "admin"}
            draft={section.draft}
            pendingCount={section.pending_count ?? 0}
            previewHref={PREVIEW[key] ?? "/"}
        />
    );
}
