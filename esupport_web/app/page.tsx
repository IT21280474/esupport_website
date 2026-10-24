import HomeClient from "./components/HomeClient";
import { SiteContentProvider } from "./components/SiteContentProvider";
import { getSiteContent } from "@/lib/server/content";

/* Content edits from the admin call revalidatePath; this is a safety net. */
export const revalidate = 300;

export default async function Home() {
  return (
    <SiteContentProvider content={await getSiteContent()}>
      <HomeClient />
    </SiteContentProvider>
  );
}
