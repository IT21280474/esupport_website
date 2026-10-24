import ServicesSection from "../components/Servicessection";
import Navbar from "../components/Navbar";
import Cursor from "../components/Cursor";
import { SiteContentProvider } from "../components/SiteContentProvider";
import { getSiteContent } from "@/lib/server/content";

export const revalidate = 300;

export default async function ServicesPage() {
    return (
        <SiteContentProvider content={await getSiteContent()}>
            <Cursor />
            <Navbar />
            <ServicesSection />
        </SiteContentProvider>
    );
}
