import { api } from "@/lib/server/api";
import { requireUser } from "@/lib/server/auth";
import MediaLibrary, { type MediaItem } from "./MediaLibrary";

export const metadata = { title: "Media library" };

export default async function MediaPage() {
    const { token } = await requireUser();
    const { data } = await api<{ data: MediaItem[] }>("/admin/media", { token });
    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Media library</h1>
            <p className="mb-6 mt-1 text-sm text-neutral-500">
                Images are optimised to WebP automatically (max 2400px). Copy a link, or pick images straight from any image field.
            </p>
            <MediaLibrary initial={data} />
        </div>
    );
}
