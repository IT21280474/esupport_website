import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompanyPage from "../../components/CompanyPage";
import { SiteContentProvider } from "../../components/SiteContentProvider";
import { companyEntries } from "@/lib/content/companies";
import { getSiteContent } from "@/lib/server/content";

/* Content edits from the admin call revalidatePath; this is a safety net.
   Companies added in the admin after a build are rendered on first visit. */
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
    const { portfolio } = await getSiteContent();
    return companyEntries(portfolio.postClients).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const { portfolio, seo } = await getSiteContent();
    const company = companyEntries(portfolio.postClients).find(c => c.slug === slug);
    if (!company) return {};

    const title = `${company.name} — ${seo.title.split(" — ")[0]}`;
    const description = company.summary || seo.description;

    return {
        title,
        description,
        openGraph: { title, description, images: seo.ogImage ? [seo.ogImage] : undefined },
    };
}

export default async function ClientPage({ params }: Props) {
    const { slug } = await params;
    const content = await getSiteContent();
    if (!companyEntries(content.portfolio.postClients).some(c => c.slug === slug)) notFound();

    return (
        <SiteContentProvider content={content}>
            <CompanyPage slug={slug} />
        </SiteContentProvider>
    );
}
