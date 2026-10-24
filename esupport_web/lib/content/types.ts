/* ══════════════════════════════════════════════════════════════════════════
   Site content model — everything an admin can edit.
   Each top-level key is one "section" stored as a JSON row in the database.
   ══════════════════════════════════════════════════════════════════════════ */

export const LAYOUT_SECTION_KEYS = [
    "velocityTicker",
    "agency",
    "gallery",
    "workIntro",
    "portfolio",
    "culture",
    "servicesShowcase",
    "services",
    "packages",
    "manifesto",
    "editorial",
    "about",
    "stats",
    "offices",
    "reverseTicker",
    "focusAreas",
    "testimonials",
    "contact",
] as const;

export type LayoutSectionKey = (typeof LAYOUT_SECTION_KEYS)[number];

export type PortfolioSite = {
    name: string;
    url: string;
    categories: string[];
    image: string;
};

export type GalleryShape = "Portrait" | "Landscape" | "Square";

export type GalleryPhoto = {
    image: string;
    title: string;
    caption: string;
    categories: string[];
    shape: GalleryShape;
};

export type SocialClient = {
    name: string;
    platform: string;
    url: string;
};

export type PostClient = {
    name: string;
    logo: string;
    logoBackground: "Light" | "Dark";
    industry: string;
    websiteUrl: string;
    summary: string;
    services: string[];
    objectives: string[];
    posts: { image: string }[];
};

export type CareerPerk = {
    tag: string;
    title: string;
    description: string;
};

export type CareerJob = {
    title: string;
    department: string;
    location: string;
    type: "Full-time" | "Part-time" | "Internship" | "Contract";
    experience: string;
    description: string;
    responsibilities: string;
    requirements: string;
    applyEmail: string;
    isActive: boolean;
};

export type CareersPageContent = {
    badgeText: string;
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    intro: string;
    stats: { value: string; label: string }[];
    perksTitle: string;
    perksSubtitle: string;
    perks: CareerPerk[];
    openingsTitle: string;
    openingsSubtitle: string;
    departments: string[];
    jobs: CareerJob[];
    ctaTitle: string;
    ctaBody: string;
    ctaButtonLabel: string;
    ctaEmail: string;
    seoTitle: string;
    seoDescription: string;
};

export interface SiteContent {
    general: {
        brandColors: string[];
        whatsappNumber: string;
        navLogo: string;
        footerLogo: string;
    };
    seo: {
        title: string;
        description: string;
        keywords: string;
        ogImage: string;
    };
    navbar: {
        servicesLabel: string;
        showServices: boolean;
        productsLabel: string;
        productsHref: string;
        showProducts: boolean;
        portfolioLabel: string;
        showPortfolio: boolean;
        galleryLabel: string;
        showGallery: boolean;
        aboutLabel: string;
        showAbout: boolean;
        careersLabel?: string;
        showCareers?: boolean;
        contactLabel: string;
        showContact: boolean;
    };
    layout: {
        sections: { key: LayoutSectionKey; visible: boolean }[];
    };
    hero: {
        eyebrow: string;
        line1: string;
        line2: string;
        tagline: string;
        slogan: string;
        metaRight: string;
        backgroundImage: string;
        tiles: { tag: string; image: string }[];
    };
    tickers: {
        top: string[];
        bottom: string[];
    };
    agency: {
        eyebrow: string;
        title: string;
        titleAccent: string;
        body: string;
        stats: { value: string; label: string }[];
        tags: string[];
    };
    gallery: {
        eyebrow: string;
        title: string;
        words: string[];
        images: { image: string; label: string }[];
    };
    workIntro: {
        eyebrow: string;
        line1: string;
        line2: string;
        body: string;
        tagline: string;
    };
    portfolio: {
        eyebrow: string;
        description: string;
        categories: string[];
        sites: PortfolioSite[];
        socialEyebrow: string;
        socialTitle1: string;
        socialTitle2: string;
        socialDescription: string;
        dmPortfolioUrl: string;
        dmPortfolioImage: string;
        dmLabel: string;
        dmTitle: string;
        socialClients: SocialClient[];
        postsEyebrow: string;
        postsTitle1: string;
        postsTitle2: string;
        postsDescription: string;
        videosEyebrow?: string;
        videosTitle1?: string;
        videosTitle2?: string;
        videosDescription?: string;
        companyCtaTitle: string;
        companyCtaLabel: string;
        companyCtaHref: string;
        postClients: PostClient[];
        videoReels?: {
            title: string;
            client: string;
            clientSlug?: string;
            category: string;
            duration: string;
            videoSrc: string;
            posterSrc: string;
            description: string;
            tags: string[];
        }[];
    };
    culture: {
        word1: string;
        word2: string;
        caption: string;
    };
    servicesShowcase: {
        items: { name: string; type: string; desc: string; image1: string; label1: string; image2: string; label2: string }[];
        bottomLeft: string;
        bottomRight: string;
    };
    galleryPage: {
        eyebrow: string;
        titleLine1: string;
        titleLine2: string;
        intro: string;
        allLabel: string;
        categories: string[];
        photos: GalleryPhoto[];
        ctaTitle: string;
        ctaLabel: string;
        ctaHref: string;
        seoTitle: string;
        seoDescription: string;
    };
    careersPage: CareersPageContent;
    services: {
        eyebrow: string;
        title: string;
        subtitle: string;
        items: { name: string; desc: string }[];
    };
    packages: {
        label: string;
        title: string;
        ctaLabel: string;
        items: { name: string; category: string; price: string; features: string[] }[];
    };
    manifesto: {
        label: string;
        text: string;
        caption: string;
    };
    editorial: {
        slides: { title: string; subtitle: string; description: string; image: string }[];
    };
    about: {
        label: string;
        title: string;
        body: string;
        quote: string;
        quoteAuthor: string;
        mission: string;
        vision: string;
        buttonLabel: string;
        buttonLink: string;
        visualLine1: string;
        visualLine2: string;
        visualCaption: string;
        image?: string;
    };
    stats: {
        label: string;
        intro: string;
        items: { value: number; suffix: string; label: string; sub: string; fill: number }[];
    };
    offices: {
        label: string;
        items: { city: string; country: string; tag: string; address: string; phone: string; coords: string }[];
    };
    focusAreas: {
        label: string;
        title: string;
        items: { name: string; count: number; description: string }[];
    };
    testimonials: {
        label: string;
        title: string;
        titleAccent: string;
        intro: string;
        items: { quote: string; name: string; company: string; service: string }[];
    };
    contact: {
        label: string;
        title: string;
        body: string;
        placeholder: string;
        buttonLabel: string;
        note: string;
        bgWord: string;
        successMessage: string;
    };
    footer: {
        branchesLabel: string;
        branches: { country: string; address: string }[];
        contactsLabel: string;
        contacts: { label: string; detail: string; href: string }[];
        navColumns: { title: string; links: { label: string; href: string }[] }[];
        socialsLabel: string;
        socials: { name: string; href: string }[];
        copyright: string;
        location: string;
        bigWord: string;
        areas: string;
    };
}

export type SectionKey = keyof SiteContent;
