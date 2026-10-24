"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";
import Image from "./ContentImage";
import { useContent } from "./SiteContentProvider";
import { companyEntries, POSTS_ANCHOR, type Company } from "@/lib/content/companies";

const ease = [0.76, 0, 0.24, 1] as const;
const BRAND_COLORS = ["var(--brand-1)", "var(--brand-2)", "var(--brand-3)", "var(--brand-4)", "var(--brand-5)"] as const;

const MotionLink = motion.create(Link);


const pad2 = (n: number) => String(n).padStart(2, "0");
const postsLabel = (n: number) => `${n} ${n === 1 ? "post" : "posts"}`;

/* ── One company: a fanned stack of its posts, linking to its page ────────── */
function CompanyCard({ company, index, accent }: { company: Company; index: number; accent: string }) {
    const [cover, second, third] = company.posts;
    const stackLayer =
        "absolute inset-0 overflow-hidden border border-white/10 bg-[#161616] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]";

    return (
        <MotionLink
            href={`/clients/${company.slug}`}
            /* Mark this spot in the history, so the browser's Back button returns here instead of the top. */
            onClick={() => window.history.replaceState(null, "", `/#${POSTS_ANCHOR}`)}
            data-hover
            aria-label={`${company.name}: view the company page and ${postsLabel(company.posts.length)}`}
            className="group block w-full self-start text-left active:scale-[0.98] transition-transform"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, delay: (index % 4) * 0.07, ease }}
        >
            <div className="relative mx-1.5 sm:mx-3 aspect-[4/5]">
                {third && (
                    <div className={`${stackLayer} opacity-60 rotate-[3deg] sm:rotate-[6deg] translate-x-1 sm:translate-x-2 group-hover:rotate-[6deg] sm:group-hover:rotate-[10deg] group-hover:translate-x-2 sm:group-hover:translate-x-4`}>
                        <Image src={third.image} alt="" fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                    </div>
                )}
                {second && (
                    <div className={`${stackLayer} opacity-80 -rotate-[2.5deg] sm:-rotate-[4deg] -translate-x-1 sm:-translate-x-2 group-hover:-rotate-[5deg] sm:group-hover:-rotate-[8deg] group-hover:-translate-x-2 sm:group-hover:-translate-x-4`}>
                        <Image src={second.image} alt="" fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                    </div>
                )}
                <div className={`${stackLayer} border-white/15 group-hover:-translate-y-2`}>
                    <Image
                        src={cover.image}
                        alt={`${company.name} post design`}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="absolute inset-x-0 bottom-4 sm:bottom-5 flex justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] uppercase font-bold text-brand-navy" style={{ backgroundColor: accent }}>
                            View Work ↗︎
                        </span>
                    </span>
                    <span
                        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                        style={{ backgroundColor: accent }}
                    />
                </div>
            </div>

            <div className="mt-4 sm:mt-7 flex items-start justify-between gap-2 sm:gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.4em] uppercase font-mono" style={{ color: accent }}>
                        {postsLabel(company.posts.length)}
                    </p>
                    <h4 className="mt-1 sm:mt-2 text-sm sm:text-lg md:text-xl font-normal uppercase tracking-wide leading-tight transition-transform duration-300 group-hover:translate-x-1 break-words line-clamp-2 sm:truncate">
                        {company.name}
                    </h4>
                    {company.industry && <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-white/40 truncate">{company.industry}</p>}
                </div>
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] font-mono text-white/25 pt-0.5 shrink-0">{pad2(index + 1)}</span>
            </div>
        </MotionLink>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   POST DESIGNS — social media posts we designed, one card per company
   ══════════════════════════════════════════════════════════════════════════ */
export default function PostDesigns() {
    const { portfolio } = useContent();

    /* Companies without any post image have no cover for their card, so they are skipped here. */
    const companies = useMemo(() => companyEntries(portfolio.postClients).filter(c => c.posts.length), [portfolio.postClients]);

    if (!companies.length) return null;

    return (
        <div id={POSTS_ANCHOR} className="mt-20 sm:mt-28 md:mt-36 pt-14 sm:pt-20 border-t border-white/10 overflow-x-clip">
            <div className="flex items-end justify-between flex-wrap gap-6 mb-10 sm:mb-14">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease }}
                >
                    <p className="text-[10px] tracking-[0.5em] uppercase text-white/35 font-mono mb-2 sm:mb-3">{portfolio.postsEyebrow}</p>
                    <h3 className="text-[clamp(2.1rem,6vw,5rem)] font-black uppercase tracking-tighter leading-[0.9]">
                        {portfolio.postsTitle1}
                        <br />
                        <span style={{ WebkitTextStroke: "1px rgba(255,255,255,0.35)", color: "transparent" }}>{portfolio.postsTitle2}</span>
                    </h3>
                </motion.div>
                <motion.p
                    className="text-xs sm:text-sm text-white/40 max-w-sm leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease }}
                >
                    {portfolio.postsDescription}
                </motion.p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 sm:gap-x-6 md:gap-x-8 gap-y-10 sm:gap-y-14">
                {companies.map((company, i) => (
                    <CompanyCard key={company.slug} company={company} index={i} accent={BRAND_COLORS[i % BRAND_COLORS.length]} />
                ))}
            </div>
        </div>
    );
}
