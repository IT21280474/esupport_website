import type { PostClient } from "./types";

/* ══════════════════════════════════════════════════════════════════════════
   Client companies shown under Portfolio → Creative Posts. Each one gets its own
   page at /clients/<slug>; the slug is made from the company name in the admin.
   ══════════════════════════════════════════════════════════════════════════ */

/** The Creative Posts block on the home page: company pages send visitors back to `/#creative-posts`. */
export const POSTS_ANCHOR = "creative-posts";

export type Company = {
    slug: string;
    name: string;
    logo: string;
    logoBackground: "Light" | "Dark";
    industry: string;
    websiteUrl: string;
    summary: string;
    services: string[];
    objectives: string[];
    posts: { image: string }[];
};

export const slugify = (name: string) =>
    name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "company";

const cleanList = (list: unknown): string[] =>
    Array.isArray(list) ? list.map(item => String(item ?? "").trim()).filter(Boolean) : [];

/** Named companies only, with blank entries dropped and unique slugs. Missing fields (older saved content) default to empty. */
export function companyEntries(postClients: PostClient[] | undefined): Company[] {
    const seen = new Map<string, number>();

    return (postClients ?? [])
        .filter(client => client.name?.trim())
        .map(client => {
            const base = slugify(client.name);
            const count = (seen.get(base) ?? 0) + 1;
            seen.set(base, count);

            return {
                slug: count === 1 ? base : `${base}-${count}`,
                name: client.name.trim(),
                logo: client.logo ?? "",
                logoBackground: client.logoBackground === "Dark" ? "Dark" : "Light",
                industry: (client.industry ?? "").trim(),
                websiteUrl: client.websiteUrl ?? "",
                summary: (client.summary ?? "").trim(),
                services: cleanList(client.services),
                objectives: cleanList(client.objectives),
                posts: (client.posts ?? []).filter(post => post.image),
            };
        });
}
