import { api } from "@/lib/server/api";
import { authorize } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/request";

export async function GET() {
    const session = await authorize();
    if (!session) return jsonError("Not signed in", 401);
    const res = await api<{ data: unknown[] }>("/admin/media", { token: session.token });
    return Response.json({ items: res.data });
}
