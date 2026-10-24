import type { Metadata } from "next";
import GalleryPage from "../components/GalleryPage";
import { SiteContentProvider } from "../components/SiteContentProvider";
import { getSiteContent } from "@/lib/server/content";

/* Content edits from the admin call revalidatePath; this is a safety net. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
    const { galleryPage, seo } = await getSiteContent();
    const title = galleryPage.seoTitle || seo.title;
    const description = galleryPage.seoDescription || seo.description;

    return {
        title,
        description,
        openGraph: { title, description, images: seo.ogImage ? [seo.ogImage] : undefined },
    };
}

export default async function Gallery() {
    return (
        <SiteContentProvider content={await getSiteContent()}>
            <GalleryPage />
        </SiteContentProvider>
    );
}
