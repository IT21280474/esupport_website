/* ══════════════════════════════════════════════════════════════════════════
   eSupport client portfolio — live websites + digital marketing accounts.
   Preview screenshots live in /public/portfolio/<slug>.webp and are
   regenerated with `node scripts/capture-portfolio.mjs`.
   ══════════════════════════════════════════════════════════════════════════ */

export const PORTFOLIO_CATEGORIES = [
    "Tourism",
    "Travel",
    "Hotels",
    "Agriculture",
    "Education",
    "Corporate",
    "Clothing",
    "Beauty",
    "Jewellery",
    "E-Commerce",
    "Construction",
    "Health",
    "Charity",
    "Logistics",
    "Spare Parts",
] as const;

export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

export type PortfolioSite = {
    slug: string;
    name: string;
    url: string;
    categories: PortfolioCategory[];
};

export const PORTFOLIO_SITES: PortfolioSite[] = [
    /* Tourism */
    { slug: "ceyloraholidays", name: "Ceylora Holidays", url: "http://ceyloraholidays.com/", categories: ["Tourism"] },
    { slug: "ceylonshentours", name: "Ceylon Shen Tours", url: "https://ceylonshentours.com/", categories: ["Tourism"] },
    { slug: "lankaattravel", name: "Lanka At Travel", url: "http://lankaattravel.com/", categories: ["Tourism"] },
    { slug: "tropicaladventuresl", name: "Tropical Adventure SL", url: "https://tropicaladventuresl.com/", categories: ["Tourism"] },
    { slug: "buddhanjalitravel", name: "Buddhanjali Travel", url: "https://buddhanjalitravel.com/", categories: ["Tourism"] },
    { slug: "islandjourneys", name: "Island Journeys", url: "https://islandjourneys.lk/", categories: ["Tourism"] },
    { slug: "triptastictourssl", name: "Triptastic Tours", url: "https://triptastictourssl.com/", categories: ["Tourism"] },
    { slug: "lankorajourneys", name: "Lankora Journeys", url: "https://lankorajourneys.com/", categories: ["Tourism"] },
    { slug: "justintours", name: "Justin Tours", url: "https://justintours.com/", categories: ["Tourism"] },
    { slug: "ceyluxtravel", name: "Ceylux Travel", url: "https://ceyluxtravel.com/", categories: ["Tourism"] },

    /* Travel */
    { slug: "colomboflights", name: "Colombo Flights", url: "https://colomboflights.com/", categories: ["Travel"] },
    { slug: "srilankaprivatedriver", name: "Sri Lanka Private Driver", url: "https://srilankaprivatedriver.com/", categories: ["Travel"] },
    { slug: "taxikingtk", name: "Taxi King", url: "https://taxikingtk.com/", categories: ["Travel"] },
    { slug: "tuktukbyt2", name: "TukTuk by T2", url: "https://tuktukbyt2.com/", categories: ["Travel"] },

    /* Hotels */
    { slug: "theceamoragalla", name: "The Cea Moragalla", url: "https://theceamoragalla.com/", categories: ["Hotels"] },
    { slug: "sulangaluxury", name: "Sulanga Luxury", url: "https://sulangaluxury.com/", categories: ["Hotels"] },
    { slug: "crownandcrownkandy", name: "Crown & Crown Kandy", url: "http://crownandcrownkandy.com/", categories: ["Hotels"] },

    /* Agriculture */
    { slug: "koslanka", name: "Kos Lanka", url: "https://koslanka.com/", categories: ["Agriculture"] },
    { slug: "superfeedlk", name: "Super Feed", url: "https://superfeedlk.com/", categories: ["Agriculture"] },
    { slug: "kandyhillfarm", name: "Kandy Hill Farm", url: "https://kandyhillfarm.lk/", categories: ["Agriculture"] },

    /* Education */
    { slug: "maximuseducation", name: "Maximus Education", url: "http://www.maximuseducation.lk/", categories: ["Education"] },
    { slug: "edugatesglobal", name: "EduGates Global", url: "https://edugatesglobal.lk/", categories: ["Education"] },
    { slug: "iconiceducation", name: "Iconic Education", url: "https://iconiceducation.lk/", categories: ["Education"] },

    /* Corporate & info sites */
    { slug: "techdrive", name: "TechDrive", url: "https://techdrive.lk/", categories: ["Corporate"] },
    { slug: "blis", name: "BLIS", url: "http://blis.lk/", categories: ["Corporate"] },
    { slug: "shanumanpower", name: "Shanu Manpower", url: "https://shanumanpower.lk/", categories: ["Corporate"] },
    { slug: "upalieetransworks", name: "Upaliee Transworks", url: "http://upalieetransworks.com/", categories: ["Corporate"] },
    { slug: "lankagoldbuyer", name: "Lanka Gold Buyer", url: "https://lankagoldbuyer.lk/", categories: ["Corporate", "Jewellery"] },
    { slug: "rjinterior", name: "RJ Interior", url: "http://rjinterior.lk/", categories: ["Corporate"] },
    { slug: "kdjeans", name: "KD Jeans", url: "http://kdjeans.com/", categories: ["Corporate"] },
    { slug: "sandaru", name: "Sandaru", url: "https://sandaru.lk/", categories: ["Corporate"] },
    { slug: "ruapparel", name: "RU Apparel", url: "https://ruapparel.com/", categories: ["Corporate", "Clothing"] },

    /* Clothing */
    { slug: "montageclothing", name: "Montage Clothing", url: "https://montageclothing.lk/", categories: ["Clothing"] },
    { slug: "realcap", name: "RealCap", url: "https://realcap.lk/", categories: ["Clothing"] },
    { slug: "gloviaglobal", name: "Glovia Global", url: "https://gloviaglobal.com/", categories: ["Clothing"] },
    { slug: "pattern", name: "Pattern", url: "https://pattern.lk/", categories: ["Clothing"] },
    { slug: "jaktec", name: "Jaktec", url: "https://jaktec.lk/", categories: ["Clothing"] },

    /* Beauty */
    { slug: "drmelki", name: "Dr. Melki", url: "https://drmelki.com/", categories: ["Beauty"] },
    { slug: "drrashellanka", name: "Dr. Rashel Lanka", url: "https://drrashellanka.com/", categories: ["Beauty"] },
    { slug: "sviss", name: "Sviss", url: "https://sviss.lk/", categories: ["Beauty"] },

    /* Jewellery */
    { slug: "bullionlankajewellers", name: "Bullion Lanka Jewellers", url: "https://bullionlankajewellers.lk/", categories: ["Jewellery"] },
    { slug: "vilvagold", name: "Vilva Gold", url: "https://vilvagold.lk/", categories: ["Jewellery"] },

    /* E-commerce */
    { slug: "nishanthahardware", name: "Nishantha Hardware", url: "https://nishanthahardware.lk/", categories: ["E-Commerce"] },
    { slug: "imethsports", name: "Imeth Sports", url: "http://imethsports.com/", categories: ["E-Commerce"] },
    { slug: "limarklanka", name: "Limark Lanka", url: "http://limarklanka.com/", categories: ["E-Commerce"] },
    { slug: "royalfreshness", name: "Royal Freshness", url: "http://royalfreshness.lk/", categories: ["E-Commerce"] },
    { slug: "kiwivault-nz", name: "KiwiVault NZ", url: "https://kiwivault-nz.com/", categories: ["E-Commerce"] },
    { slug: "surathala", name: "Surathala", url: "https://surathala.com/", categories: ["E-Commerce"] },
    { slug: "gadget-brat", name: "Gadget Brat", url: "https://gadget-brat.com/", categories: ["E-Commerce"] },
    { slug: "rnrmobile", name: "RNR Mobile", url: "https://rnrmobile.com/", categories: ["E-Commerce"] },
    { slug: "quantumtek", name: "QuantumTek", url: "https://quantumtek.lk/", categories: ["E-Commerce"] },
    { slug: "meatzone", name: "MeatZone", url: "https://meatzone.lk/", categories: ["E-Commerce"] },

    /* Construction */
    { slug: "australianconcrete", name: "Australian Concrete", url: "https://australianconcrete.com/", categories: ["Construction"] },
    { slug: "onarahomes", name: "Onara Homes", url: "https://onarahomes.com/", categories: ["Construction"] },
    { slug: "buildwayinternational", name: "Buildway International", url: "https://buildwayinternational.com/", categories: ["Construction"] },
    { slug: "noahlankaglory", name: "Noah Lanka Glory", url: "https://noahlankaglory.com/", categories: ["Construction"] },
    { slug: "gallageconstruction", name: "Gallage Construction", url: "https://gallageconstruction.lk/", categories: ["Construction"] },

    /* Health */
    { slug: "billingnavigator", name: "Billing Navigator", url: "https://billingnavigator.com/", categories: ["Health"] },
    { slug: "helplineacademy", name: "Helpline Academy", url: "https://helplineacademy.lk/", categories: ["Health"] },
    { slug: "verdantcare", name: "Verdant Care", url: "http://verdantcare.com.au/", categories: ["Health"] },
    { slug: "medri", name: "Medri", url: "https://medri.lk/", categories: ["Health"] },
    { slug: "safelifepharma", name: "SafeLife Pharma", url: "https://safelifepharma.com/", categories: ["Health"] },

    /* Charity */
    { slug: "lifeonhelp", name: "LifeOn Help", url: "https://lifeonhelp.com/", categories: ["Charity"] },
    { slug: "surakshafund", name: "Suraksha Fund", url: "https://surakshafund.lk/", categories: ["Charity"] },

    /* Logistics */
    { slug: "oceanasialogistics", name: "Ocean Asia Logistics", url: "https://oceanasialogistics.com/", categories: ["Logistics"] },
    { slug: "crestlog", name: "Crestlog", url: "https://crestlog.com/", categories: ["Logistics"] },
    { slug: "sevenkeyshipping", name: "Seven Key Shipping", url: "http://sevenkeyshipping.com/", categories: ["Logistics"] },

    /* Spare parts */
    { slug: "sagojapan", name: "Sago Japan", url: "https://sagojapan.com/", categories: ["Spare Parts"] },
    { slug: "globaltechsecure", name: "GlobalTech Secure", url: "https://globaltechsecure.lk/", categories: ["Spare Parts"] },
];

/* Digital marketing side — social accounts managed by eSupport */
export const DM_PORTFOLIO_URL = "https://e-support-portfolio.vercel.app";

export type SocialClient = {
    name: string;
    platform: "Facebook" | "Instagram";
    url: string;
};

export const SOCIAL_CLIENTS: SocialClient[] = [
    { name: "TMR Bikes", platform: "Facebook", url: "https://www.facebook.com/share/19cvL43eZq/?mibextid=wwXIfr" },
    { name: "Fairplays Online", platform: "Instagram", url: "https://www.instagram.com/fairplays.online?stkn=bHluc25oejJ4ZzNu" },
    { name: "Serendib News", platform: "Facebook", url: "https://www.facebook.com/share/1BugvRdSv7/?mibextid=wwXIfr" },
    { name: "Bingshu Negombo", platform: "Facebook", url: "https://www.facebook.com/share/1MX49CKGYZ/?mibextid=wwXIfr" },
    { name: "Illumea Skin", platform: "Facebook", url: "https://www.facebook.com/illumea?mibextid=wwXIfr" },
    { name: "NGM Motors", platform: "Facebook", url: "https://www.facebook.com/share/195RQMiD55/?mibextid=wwXIfr" },
    { name: "Locums Lanka", platform: "Facebook", url: "https://www.facebook.com/share/14jZpHw3Qgp/?mibextid=wwXIfr" },
    { name: "Lanka Holidays", platform: "Instagram", url: "https://www.instagram.com/lanka_holidays?stkn=MW5mcXk4eXV4ODB3aw==" },
    { name: "Green Bricks", platform: "Facebook", url: "https://www.facebook.com/share/1Hgn5EHM7k/?mibextid=wwXIfr" },
    { name: "Upaliee Transworks", platform: "Facebook", url: "https://www.facebook.com/share/18nndjTMb7/?mibextid=wwXIfr" },
];
