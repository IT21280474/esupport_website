/* Browser helpers for the admin upload/capture endpoints. */

export async function uploadFiles(files: FileList | File[]): Promise<{ url: string; id: number; original_name: string | null }[]> {
    const form = new FormData();
    for (const file of Array.from(files)) form.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    return data.items;
}

export async function captureSite(url: string): Promise<string> {
    const res = await fetch("/api/admin/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Capture failed.");
    return data.item.url;
}
