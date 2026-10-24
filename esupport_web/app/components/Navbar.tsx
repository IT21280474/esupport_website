"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Image from "./ContentImage";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useContent } from "./SiteContentProvider";

const ease = [0.76, 0, 0.24, 1] as const;
const NAV_BG = "#ffffff";
/* Same white, translucent: the navbar fades to this "glass" once the page scrolls. */
const GLASS_BG = "rgba(255, 255, 255, 0.5)";
const GLASS_BLUR = "blur(20px) saturate(180%)";
const GLASS_SCROLL_THRESHOLD = 24;

/* A link shows unless the admin switched it off or cleared its label. Only an explicit `false`
   hides it, so a cached copy of older content (without the switches) keeps every link visible. */
const isShown = (flag: boolean | undefined, label: string | undefined) => flag !== false && Boolean(label?.trim());

type NavbarProps = {
    /** When provided, scroll same-page sections instead of navigating */
    onPortfolio?: () => void;
    onAbout?: () => void;
    onContact?: () => void;
};

export default function Navbar({ onPortfolio, onAbout, onContact }: NavbarProps) {
    const { navbar, general } = useContent();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, "change", y => setScrolled(y > GLASS_SCROLL_THRESHOLD));
    const portfolioHref = onPortfolio ? "#portfolio" : "/#portfolio";
    const aboutHref     = onAbout     ? "#about"     : "/#about";
    const contactHref   = onContact   ? "#contact"   : "/#contact";
    const productsHref  = navbar.productsHref || "/products";

    const showServices  = isShown(navbar.showServices,  navbar.servicesLabel);
    const showProducts  = isShown(navbar.showProducts,  navbar.productsLabel);
    const showPortfolio = isShown(navbar.showPortfolio, navbar.portfolioLabel);
    const showGallery   = isShown(navbar.showGallery,   navbar.galleryLabel);
    const showAbout     = isShown(navbar.showAbout,     navbar.aboutLabel);
    const showCareers   = isShown(navbar.showCareers,   navbar.careersLabel ?? "Careers");
    const showContact   = isShown(navbar.showContact,   navbar.contactLabel);
    const hasAnyLink = showServices || showProducts || showPortfolio || showGallery || showAbout || showCareers || showContact;

    const handleClick = (fn?: () => void) =>
        fn
            ? (e: React.MouseEvent) => { e.preventDefault(); fn(); }
            : undefined;

    /* Phone menu: same-page links run their scroll handler, then the menu closes. */
    const closeMenu = () => setMenuOpen(false);
    const handleMobileClick = (fn?: () => void) => (e: React.MouseEvent) => {
        handleClick(fn)?.(e);
        closeMenu();
    };

    useEffect(() => {
        if (!menuOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", onKey);
        };
    }, [menuOpen]);

    const mobileLink = "flex items-center justify-between border-b border-black/10 py-3.5 sm:py-4 text-xs uppercase tracking-[0.25em] font-medium text-brand-navy hover:text-brand-navy/60 active:bg-black/[0.03] transition-colors px-1";

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] px-4 py-2.5 sm:py-3 md:px-8 md:py-4 border-b transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ${
                scrolled ? "border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.06)]" : "border-black/10 shadow-none"
            }`}
            style={{
                backgroundColor: scrolled ? GLASS_BG : NAV_BG,
                backdropFilter: scrolled ? GLASS_BLUR : "blur(0px) saturate(100%)",
                WebkitBackdropFilter: scrolled ? GLASS_BLUR : "blur(0px) saturate(100%)",
                color: "#111111",
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
        >
            {/* Left links */}
            <div className="hidden md:flex justify-self-start gap-8 text-[11px] tracking-widest uppercase">
                {showServices && (
                    <Link href="/services" className="hover:opacity-50 transition-opacity">
                        {navbar.servicesLabel}
                    </Link>
                )}
                {showProducts && (
                    <Link href={productsHref} className="hover:opacity-50 transition-opacity">
                        {navbar.productsLabel}
                    </Link>
                )}
                {showPortfolio && (
                    <a
                        href={portfolioHref}
                        onClick={handleClick(onPortfolio)}
                        className="hover:opacity-50 transition-opacity"
                    >
                        {navbar.portfolioLabel}
                    </a>
                )}
                {showGallery && (
                    <Link href="/gallery" className="hover:opacity-50 transition-opacity">
                        {navbar.galleryLabel}
                    </Link>
                )}
            </div>

            {/* Centre logo */}
            <Link href="/" onClick={closeMenu} className="flex items-center py-0.5">
                <Image
                    src={general.navLogo || "/logo-nav.png"}
                    alt="eSupport"
                    width={220}
                    height={48}
                    className="h-8 sm:h-9 md:h-11 w-auto object-contain"
                    preload
                />
            </Link>

            {/* Right links */}
            <div className="hidden md:flex justify-self-end gap-8 text-[11px] tracking-widest uppercase items-center">
                {showAbout && (
                    <a
                        href={aboutHref}
                        onClick={handleClick(onAbout)}
                        className="hover:opacity-50 transition-opacity"
                    >
                        {navbar.aboutLabel}
                    </a>
                )}
                {showCareers && (
                    <Link
                        href="/careers"
                        className="hover:opacity-50 transition-opacity"
                    >
                        {navbar.careersLabel ?? "Careers"}
                    </Link>
                )}
                {showContact && (
                    <a
                        href={contactHref}
                        onClick={handleClick(onContact)}
                        className="px-5 py-2.5 text-[10px] tracking-[0.35em] uppercase text-white font-bold transition-opacity hover:opacity-80"
                        style={{ backgroundColor: "var(--brand-1)" }}
                    >
                        {navbar.contactLabel}
                    </a>
                )}
            </div>

            {/* Phone menu button */}
            {hasAnyLink && (
                <button
                    type="button"
                    data-hover
                    onClick={() => setMenuOpen(o => !o)}
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    className="md:hidden min-h-[40px] flex items-center justify-center gap-2 border border-black/25 px-3.5 py-2 text-[10px] uppercase tracking-[0.25em] font-bold active:scale-95 transition-all bg-white/80 backdrop-blur-md shadow-sm"
                >
                    <span>{menuOpen ? "✕ Close" : "☰ Menu"}</span>
                </button>
            )}

            {/* Phone menu panel & backdrop overlay */}
            <AnimatePresence>
                {menuOpen && hasAnyLink && (
                    <>
                        {/* Dim backdrop to dismiss when tapping outside */}
                        <motion.div
                            key="mobile-backdrop"
                            className="fixed inset-0 top-[54px] sm:top-[60px] bg-black/40 backdrop-blur-sm z-40 md:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeMenu}
                            aria-hidden
                        />

                        <motion.div
                            id="mobile-menu"
                            key="mobile-menu"
                            className="absolute left-0 right-0 top-full md:hidden z-50 border-b border-black/10 px-5 pb-8 pt-3 max-h-[calc(100dvh-60px)] overflow-y-auto shadow-2xl bg-white/98 backdrop-blur-2xl"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.22, ease }}
                        >
                            {showServices && (
                                <Link href="/services" onClick={closeMenu} className={mobileLink}>
                                    <span>{navbar.servicesLabel}</span>
                                    <span className="opacity-40 text-xs">→</span>
                                </Link>
                            )}
                            {showProducts && (
                                <Link href={productsHref} onClick={closeMenu} className={mobileLink}>
                                    <span>{navbar.productsLabel}</span>
                                    <span className="opacity-40 text-xs">→</span>
                                </Link>
                            )}
                            {showPortfolio && (
                                <a href={portfolioHref} onClick={handleMobileClick(onPortfolio)} className={mobileLink}>
                                    <span>{navbar.portfolioLabel}</span>
                                    <span className="opacity-40 text-xs">→</span>
                                </a>
                            )}
                            {showGallery && (
                                <Link href="/gallery" onClick={closeMenu} className={mobileLink}>
                                    <span>{navbar.galleryLabel}</span>
                                    <span className="opacity-40 text-xs">→</span>
                                </Link>
                            )}
                            {showAbout && (
                                <a href={aboutHref} onClick={handleMobileClick(onAbout)} className={mobileLink}>
                                    <span>{navbar.aboutLabel}</span>
                                    <span className="opacity-40 text-xs">→</span>
                                </a>
                            )}
                            {showCareers && (
                                <Link href="/careers" onClick={closeMenu} className={mobileLink}>
                                    <span>{navbar.careersLabel ?? "Careers"}</span>
                                    <span className="opacity-40 text-xs">→</span>
                                </Link>
                            )}
                            {showContact && (
                                <a
                                    href={contactHref}
                                    onClick={handleMobileClick(onContact)}
                                    className="mt-5 block px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-white shadow-md active:scale-[0.98] transition-transform"
                                    style={{ backgroundColor: "var(--brand-1)" }}
                                >
                                    {navbar.contactLabel}
                                </a>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
