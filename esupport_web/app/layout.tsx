import "./globals.css";
import type { Metadata, Viewport } from "next";
import { getSiteContent } from "@/lib/server/content";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fafaf8",
};

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteContent();
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords || undefined,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /* Brand colours from the admin become CSS variables used across the site. */
  const { general } = await getSiteContent();
  const brandVars = Object.fromEntries(general.brandColors.map((c, i) => [`--brand-${i + 1}`, c])) as React.CSSProperties;

  return (
    <html lang="en" style={brandVars}>
      <body className="min-h-full w-full flex flex-col overflow-x-clip">
        {children}
        {/* NexaBot chatbot widget — loads on every page via the root layout. */}
        <script async src="https://chat.socialgear.work/widget/v1.js" data-key="pk_live_yvQPNc5WRQ7EBAJjicSeEjc6nt8X6iML"></script>
      </body>
    </html>
  );
}
