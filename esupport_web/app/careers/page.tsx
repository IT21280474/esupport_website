import type { Metadata } from "next";
import CareersPage from "../components/CareersPage";
import { SiteContentProvider } from "../components/SiteContentProvider";
import { getSiteContent } from "@/lib/server/content";

/* Content edits from the admin call revalidatePath; this is a safety net. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
    const { careersPage, seo } = await getSiteContent();
    const title = careersPage?.seoTitle || "Careers — eSupport Technologies";
    const description = careersPage?.seoDescription || seo.description;

    return {
        title,
        description,
        openGraph: { title, description, images: seo.ogImage ? [seo.ogImage] : undefined },
    };
}

export default async function Careers() {
    return (
        <SiteContentProvider content={await getSiteContent()}>
            <CareersPage />
        </SiteContentProvider>
    );
}
