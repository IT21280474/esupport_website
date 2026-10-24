import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { CONTENT_TAG } from "@/lib/server/content";

/* Called by the Laravel API whenever site content changes, so the cached pages refresh immediately. */
export async function POST(req: Request) {
    const expected = process.env.REVALIDATE_SECRET ?? "";
    const given = req.headers.get("x-revalidate-secret") ?? "";
    const valid = expected.length > 0 && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
    if (!valid) return Response.json({ error: "Invalid secret" }, { status: 401 });

    revalidateTag(CONTENT_TAG, { expire: 0 });
    revalidatePath("/", "layout");
    return Response.json({ revalidated: true });
}
