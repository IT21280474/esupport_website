/* ══════════════════════════════════════════════════════════════════════════
   eSupport Video Productions & Commercial Reels
   Videos sourced from E:\E support Company\Videos
   ══════════════════════════════════════════════════════════════════════════ */

export type VideoCategory =
    | "All"
    | "Automotive"
    | "Commercials"
    | "Education"
    | "Media & News"
    | "Tech & Mobile"
    | "Motion Graphics";

export type PortfolioVideo = {
    id: string;
    title: string;
    client: string;
    clientSlug?: string;
    logo?: string;
    category: Exclude<VideoCategory, "All">;
    duration: string;
    videoSrc: string;
    posterSrc: string;
    description: string;
    accent: string;
    tags: string[];
};

export const VIDEO_CATEGORIES: VideoCategory[] = [
    "All",
    "Automotive",
    "Commercials",
    "Education",
    "Media & News",
    "Tech & Mobile",
    "Motion Graphics",
];

export const PORTFOLIO_VIDEOS: PortfolioVideo[] = [
    {
        id: "tmr-bikes-xgw-scooter",
        title: "TMR XGW Electric Scooter",
        client: "TMR Bikes",
        clientSlug: "tmr-bikes",
        logo: "/portfolio/logos/tmr-bikes.webp",
        category: "Automotive",
        duration: "0:24",
        videoSrc: "/portfolio/videos/tmr-bikes-xgw-scooter.mp4",
        posterSrc: "/portfolio/videos/thumbnails/tmr-bikes-xgw-scooter.webp",
        description: "Studio launch showcase and test-ride promo for the high-efficiency TMR XGW model.",
        accent: "var(--brand-1)",
        tags: ["EV Scooter", "Test Ride", "Commercial"],
    },
    {
        id: "tmr-bikes-1000w-red-scooter",
        title: "1000W Hub Motor Red Scooter",
        client: "TMR Bikes",
        clientSlug: "tmr-bikes",
        logo: "/portfolio/logos/tmr-bikes.webp",
        category: "Automotive",
        duration: "0:21",
        videoSrc: "/portfolio/videos/tmr-bikes-1000w-red-scooter.mp4",
        posterSrc: "/portfolio/videos/thumbnails/tmr-bikes-1000w-red-scooter.webp",
        description: "High-performance crimson EV scooter reel showcasing 1000W torque, LED headlights, and digital dash.",
        accent: "var(--brand-2)",
        tags: ["1000W Motor", "Electric Ride", "Test Drive"],
    },
    {
        id: "tmr-bikes-zero-fuel-commute",
        title: "Zero Fuel Cost Daily Commute",
        client: "TMR Bikes",
        clientSlug: "tmr-bikes",
        logo: "/portfolio/logos/tmr-bikes.webp",
        category: "Automotive",
        duration: "0:23",
        videoSrc: "/portfolio/videos/tmr-bikes-zero-fuel-commute.mp4",
        posterSrc: "/portfolio/videos/thumbnails/tmr-bikes-zero-fuel-commute.webp",
        description: "Urban commuting reel highlighting massive fuel savings, eco-friendly travel, and dual riding comfort.",
        accent: "var(--brand-3)",
        tags: ["Fuel Free", "City Commute", "Lifestyle"],
    },
    {
        id: "sansu-campus-future",
        title: "Build Your Future Today",
        client: "SANSU International Campus",
        clientSlug: "sansu-international-campus",
        logo: "/portfolio/logos/sansu-international-campus.webp",
        category: "Education",
        duration: "0:24",
        videoSrc: "/portfolio/videos/sansu-campus-future.mp4",
        posterSrc: "/portfolio/videos/thumbnails/sansu-campus-future.webp",
        description: "Dynamic campus life reel featuring higher education pathways, modern facilities, and student community.",
        accent: "var(--brand-4)",
        tags: ["Higher Education", "Campus Reel", "Kandy"],
    },
    {
        id: "apex-industries-eco-packaging",
        title: "100% Food Grade Packaging",
        client: "Apex Industries",
        clientSlug: "apex-industries",
        logo: "/portfolio/logos/apex-industries.webp",
        category: "Commercials",
        duration: "0:24",
        videoSrc: "/portfolio/videos/apex-industries-eco-packaging.mp4",
        posterSrc: "/portfolio/videos/thumbnails/apex-industries-eco-packaging.webp",
        description: "Sustainable café and restaurant disposable packaging commercial highlighting food-grade safety.",
        accent: "var(--brand-5)",
        tags: ["Eco Friendly", "Food Packaging", "Manufacturing"],
    },
    {
        id: "ngm-motors-bajaj-service",
        title: "Certified Bajaj Service Center",
        client: "NGM Motors",
        clientSlug: "ngm-motors",
        logo: "/portfolio/logos/ngm-motors.webp",
        category: "Automotive",
        duration: "0:24",
        videoSrc: "/portfolio/videos/ngm-motors-bajaj-service.mp4",
        posterSrc: "/portfolio/videos/thumbnails/ngm-motors-bajaj-service.webp",
        description: "Workshop showcase highlighting genuine Bajaj spare parts, precision tuning, and certified expertise.",
        accent: "var(--brand-1)",
        tags: ["Bajaj Center", "Maintenance", "Welisara"],
    },
    {
        id: "rm-traders-honda-ride",
        title: "Modern Power, Superior Ride",
        client: "RM Traders",
        clientSlug: "rm-traders",
        logo: "/portfolio/logos/rm-traders.webp",
        category: "Automotive",
        duration: "0:24",
        videoSrc: "/portfolio/videos/rm-traders-honda-ride.mp4",
        posterSrc: "/portfolio/videos/thumbnails/rm-traders-honda-ride.webp",
        description: "Cinematic promo for Honda CB100 series with authorized sales centers across Sri Lanka.",
        accent: "var(--brand-2)",
        tags: ["Honda CB100", "Motorbike", "RM Traders"],
    },
    {
        id: "serendib-news-civic-advisory",
        title: "Severe Conditions & Civic Alert",
        client: "Serendib News",
        clientSlug: "serendib-news",
        logo: "/portfolio/logos/serendib-news.webp",
        category: "Media & News",
        duration: "0:24",
        videoSrc: "/portfolio/videos/serendib-news-civic-advisory.mp4",
        posterSrc: "/portfolio/videos/thumbnails/serendib-news-civic-advisory.webp",
        description: "Urgent weather and flood rescue alert video broadcast across Sinhala, Tamil, and English.",
        accent: "var(--brand-3)",
        tags: ["Civic Alert", "Broadcast News", "Multilingual"],
    },
    {
        id: "taste-of-weddings-jar-cake",
        title: "Jar Cake 'Open & Eat'",
        client: "Taste of Weddings by Charvi",
        clientSlug: "taste-of-weddings",
        category: "Commercials",
        duration: "0:24",
        videoSrc: "/portfolio/videos/taste-of-weddings-jar-cake.mp4",
        posterSrc: "/portfolio/videos/thumbnails/taste-of-weddings-jar-cake.webp",
        description: "Rich, multi-layered chocolate dessert commercial — no plates, no cutting, just open & eat.",
        accent: "var(--brand-4)",
        tags: ["Dessert", "F&B Commercial", "Social Reel"],
    },
    {
        id: "thara-cooling-mattress",
        title: "Cooling Water Mattress",
        client: "Thara Healthy Service",
        clientSlug: "thara-healthy-service",
        category: "Commercials",
        duration: "0:24",
        videoSrc: "/portfolio/videos/thara-cooling-mattress.mp4",
        posterSrc: "/portfolio/videos/thumbnails/thara-cooling-mattress.webp",
        description: "Medical-grade cooling water mattress promo highlighting bedsore prevention and islandwide delivery.",
        accent: "var(--brand-5)",
        tags: ["Healthcare", "Product Demo", "Delivery"],
    },
    {
        id: "mumea-skin-care-reel",
        title: "Herbal Skincare & Glow Treatment",
        client: "Illumea Skin",
        clientSlug: "illumea-skin",
        category: "Commercials",
        duration: "0:24",
        videoSrc: "/portfolio/videos/mumea-skin-care-reel.mp4",
        posterSrc: "/portfolio/videos/thumbnails/mumea-skin-care-reel.webp",
        description: "Luxury botanical facial therapy commercial showcasing organic ingredients and radiant skincare.",
        accent: "var(--brand-1)",
        tags: ["Skincare", "Beauty Therapy", "Organic"],
    },
    {
        id: "ceylux-travel-portal-app",
        title: "24/7 Customer Portal & Mobile App",
        client: "Ceylux Travel",
        clientSlug: "ceylux-travel",
        category: "Tech & Mobile",
        duration: "0:20",
        videoSrc: "/portfolio/videos/ceylux-travel-portal-app.mp4",
        posterSrc: "/portfolio/videos/thumbnails/ceylux-travel-portal-app.webp",
        description: "Interactive mobile app demo highlighting 24/7 dedicated travel experts, direct audio calls, and itinerary chat.",
        accent: "var(--brand-2)",
        tags: ["Mobile App", "Travel Portal", "UX Showcase"],
    },
    {
        id: "esupport-motion-reel",
        title: "Motion Graphics & VFX Reel",
        client: "eSupport Technology",
        clientSlug: "esupport",
        logo: "/logo1.png",
        category: "Motion Graphics",
        duration: "0:16",
        videoSrc: "/portfolio/videos/esupport-motion-reel.mp4",
        posterSrc: "/portfolio/videos/thumbnails/esupport-motion-reel.webp",
        description: "Behind-the-scenes motion design, keyframe sequencing, and visual effects production.",
        accent: "var(--brand-3)",
        tags: ["After Effects", "Motion Graphics", "Production"],
    },
];

const BRAND_COLORS = ["var(--brand-1)", "var(--brand-2)", "var(--brand-3)", "var(--brand-4)", "var(--brand-5)"] as const;

export function normalizeVideoReels(rawList?: unknown[]): PortfolioVideo[] {
    if (!Array.isArray(rawList) || rawList.length === 0) {
        return PORTFOLIO_VIDEOS;
    }
    return rawList
        .filter((item): item is Record<string, unknown> => {
            if (typeof item !== "object" || item === null) return false;
            const rec = item as Record<string, unknown>;
            return Boolean(rec.title || rec.videoSrc);
        })
        .map((item, i) => {
            const client = String(item.client ?? "").trim();
            const clientSlug = String(item.clientSlug ?? "").trim() || (client ? client.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : undefined);
            const rawCat = String(item.category ?? "").trim();
            const category = (VIDEO_CATEGORIES.includes(rawCat as VideoCategory) && rawCat !== "All"
                ? rawCat
                : "Commercials") as Exclude<VideoCategory, "All">;

            return {
                id: String(item.id ?? `reel-${i + 1}-${item.title || "video"}`),
                title: String(item.title ?? `Reel ${i + 1}`).trim(),
                client: client || "Client",
                clientSlug,
                logo: item.logo ? String(item.logo) : undefined,
                category,
                duration: String(item.duration ?? "0:24"),
                videoSrc: String(item.videoSrc ?? ""),
                posterSrc: String(item.posterSrc ?? ""),
                description: String(item.description ?? ""),
                accent: BRAND_COLORS[i % BRAND_COLORS.length],
                tags: Array.isArray(item.tags) ? item.tags.map(String).filter(Boolean) : [],
            };
        });
}

/** Return videos relevant to a given company slug */
export function getVideosForCompany(slug: string, customReels?: unknown[]): PortfolioVideo[] {
    const list = normalizeVideoReels(customReels);
    const clean = slug.toLowerCase().trim();
    return list.filter(v => v.clientSlug === clean);
}
