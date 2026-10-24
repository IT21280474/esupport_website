import "server-only";

import { cache } from "react";
import { api } from "./api";
import type { SiteContent } from "@/lib/content/types";
import type { ContentSchema } from "@/lib/content/schema";

/* Cache tag for the public site content; admin saves expire it immediately. */
export const CONTENT_TAG = "site-content";

/** Full site content from Laravel (edited sections merged over defaults). */
export async function getSiteContent(): Promise<SiteContent> {
    const res = await api<{ data: SiteContent }>("/content", { next: { revalidate: 300, tags: [CONTENT_TAG] } });
    return res.data;
}

/** Field definitions for the admin forms (served by Laravel, which also validates saves). */
export const getSchema = cache(async (token: string): Promise<ContentSchema> => {
    const res = await api<{ data: ContentSchema }>("/admin/schema", { token });
    return res.data;
});
