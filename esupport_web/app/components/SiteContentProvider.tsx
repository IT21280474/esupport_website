"use client";

import { createContext, useContext } from "react";
import type { SiteContent } from "@/lib/content/types";

const SiteContentContext = createContext<SiteContent | null>(null);

/* Server pages load content from the database and hand it to client sections here. */
export function SiteContentProvider({ content, children }: { content: SiteContent; children: React.ReactNode }) {
    return <SiteContentContext value={content}>{children}</SiteContentContext>;
}

export function useContent(): SiteContent {
    const content = useContext(SiteContentContext);
    if (!content) throw new Error("useContent must be used inside <SiteContentProvider>");
    return content;
}
