import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".rtf", ".txt"];

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("cv") as File | null;

        if (!file || !(file instanceof File) || file.size === 0) {
            return NextResponse.json({ error: "No CV file was uploaded." }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "CV file size exceeds the 15MB limit. Please upload a smaller file." },
                { status: 400 }
            );
        }

        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return NextResponse.json(
                { error: "Invalid file type. Please upload a PDF, DOC, or DOCX document." },
                { status: 400 }
            );
        }

        // Generate safe unique filename
        const rawName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeBase = rawName.substring(0, 50) || "cv";
        const finalFilename = `${Date.now()}_${safeBase}${ext}`;

        const uploadDir = path.join(process.cwd(), "public", "uploads", "cv");
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, finalFilename);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await fs.writeFile(filePath, buffer);

        const fileUrl = `/uploads/cv/${finalFilename}`;

        return NextResponse.json({
            ok: true,
            url: fileUrl,
            filename: file.name,
            size: file.size,
        });
    } catch (err) {
        console.error("Error uploading CV:", err);
        return NextResponse.json(
            { error: "Failed to upload CV. Please try again or provide a direct link." },
            { status: 500 }
        );
    }
}
