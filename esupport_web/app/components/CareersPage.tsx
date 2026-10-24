"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import Navbar from "./Navbar";
import Cursor from "./Cursor";
import { useContent } from "./SiteContentProvider";
import { submitLeadAction } from "../actions";
import type { CareerJob, CareerPerk } from "@/lib/content/types";

const ease = [0.76, 0, 0.24, 1] as const;
const LIGHT_BG = "#fafaf8";

export default function CareersPage() {
    const { careersPage, general, footer } = useContent();

    const [activeDept, setActiveDept] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedJobIndex, setExpandedJobIndex] = useState<number | null>(0);
    const [selectedJobForModal, setSelectedJobForModal] = useState<CareerJob | null>(null);

    // Modal Form State
    const [modalName, setModalName] = useState("");
    const [modalEmail, setModalEmail] = useState("");
    const [modalPhone, setModalPhone] = useState("");
    const [modalPortfolio, setModalPortfolio] = useState("");
    const [modalMessage, setModalMessage] = useState("");
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [uploadedCvUrl, setUploadedCvUrl] = useState<string>("");
    const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState<string>("");
    const [formStatus, setFormStatus] = useState<"idle" | "uploading_cv" | "submitting" | "success" | "error">("idle");
    const [formError, setFormError] = useState("");
    const [isPending, startTransition] = useTransition();

    const departments = useMemo(() => {
        if (!careersPage?.departments?.length) {
            return ["All", "Engineering", "Design", "Digital Marketing", "Internships"];
        }
        return careersPage.departments;
    }, [careersPage?.departments]);

    const activeJobs = useMemo(() => {
        const jobs = careersPage?.jobs || [];
        return jobs.filter(j => j.isActive !== false);
    }, [careersPage?.jobs]);

    const filteredJobs = useMemo(() => {
        return activeJobs.filter(job => {
            const matchesDept =
                activeDept === "All" ||
                job.department.toLowerCase().trim() === activeDept.toLowerCase().trim();
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                job.title.toLowerCase().includes(q) ||
                job.department.toLowerCase().includes(q) ||
                job.location.toLowerCase().includes(q) ||
                job.description.toLowerCase().includes(q);
            return matchesDept && matchesSearch;
        });
    }, [activeJobs, activeDept, searchQuery]);

    const handleOpenModal = (job: CareerJob) => {
        setSelectedJobForModal(job);
        setFormStatus("idle");
        setFormError("");
        setCvFile(null);
        setUploadedCvUrl("");
        setGeneratedWhatsAppUrl("");
    };

    const handleCloseModal = () => {
        setSelectedJobForModal(null);
        setFormStatus("idle");
        setFormError("");
        setCvFile(null);
        setUploadedCvUrl("");
        setGeneratedWhatsAppUrl("");
    };

    const handleApplicationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!modalName.trim()) {
            setFormError("Please enter your full name.");
            return;
        }
        if (!modalEmail.trim()) {
            setFormError("Please enter your email address.");
            return;
        }
        if (!modalPhone.trim()) {
            setFormError("Please enter your Phone or WhatsApp number.");
            return;
        }

        setFormError("");
        let finalCvUrl = modalPortfolio.trim();
        let directCvDownloadUrl = "";

        // 1. Upload CV file if attached
        if (cvFile) {
            setFormStatus("uploading_cv");
            try {
                const cvForm = new FormData();
                cvForm.append("cv", cvFile);

                const uploadRes = await fetch("/api/upload-cv", {
                    method: "POST",
                    body: cvForm,
                });

                const uploadData = await uploadRes.json();
                if (!uploadRes.ok || !uploadData.ok) {
                    throw new Error(uploadData.error || "Failed to upload CV file.");
                }

                finalCvUrl = uploadData.url;
                setUploadedCvUrl(uploadData.url);
                directCvDownloadUrl = typeof window !== "undefined"
                    ? `${window.location.origin}${uploadData.url}`
                    : uploadData.url;
            } catch (err: unknown) {
                setFormStatus("error");
                setFormError((err as Error).message || "Failed to upload CV. Please try again or provide a direct link.");
                return;
            }
        } else if (modalPortfolio) {
            directCvDownloadUrl = modalPortfolio;
        }

        setFormStatus("submitting");

        // 2. Build structured WhatsApp Message
        const cleanCompanyNumber = (general.whatsappNumber || "94707820810").replace(/[^0-9]/g, "");
        const jobTitle = selectedJobForModal?.title || "General Application";
        const jobDept = selectedJobForModal?.department || "General";

        const messageLines: string[] = [
            `*📄 NEW JOB APPLICATION — eSUPPORT TECHNOLOGIES*`,
            `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            `👤 *Applicant Name:* ${modalName.trim()}`,
            `💼 *Position Applied:* ${jobTitle}`,
            `🏢 *Department:* ${jobDept}`,
            `📧 *Email:* ${modalEmail.trim()}`,
            `📱 *Phone / WhatsApp:* ${modalPhone.trim()}`,
        ];

        if (directCvDownloadUrl) {
            messageLines.push(``);
            messageLines.push(`📎 *CV / Resume Document:*`);
            messageLines.push(`${directCvDownloadUrl}`);
            messageLines.push(`_(Click the link above to view or download CV)_`);
        }

        if (modalPortfolio && modalPortfolio !== directCvDownloadUrl) {
            messageLines.push(``);
            messageLines.push(`🔗 *Portfolio / LinkedIn:* ${modalPortfolio.trim()}`);
        }

        if (modalMessage.trim()) {
            messageLines.push(``);
            messageLines.push(`📝 *Cover Note:*`);
            messageLines.push(`${modalMessage.trim()}`);
        }

        messageLines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        messageLines.push(`_Sent via eSupport Careers Portal_`);

        const waText = encodeURIComponent(messageLines.join("\n"));
        const waUrl = `https://wa.me/${cleanCompanyNumber}?text=${waText}`;
        setGeneratedWhatsAppUrl(waUrl);

        // 3. Save application in Admin Inbox (Laravel Backend)
        const leadForm = new FormData();
        leadForm.append("name", modalName.trim());
        leadForm.append("email", modalEmail.trim());
        leadForm.append("phone", modalPhone.trim());
        leadForm.append("source", `Careers — ${jobTitle}`);

        const compositeNote = [
            `[Position: ${jobTitle}]`,
            `Department: ${jobDept}`,
            directCvDownloadUrl ? `CV File Link: ${directCvDownloadUrl}` : null,
            modalPortfolio && modalPortfolio !== directCvDownloadUrl ? `Portfolio / LinkedIn: ${modalPortfolio.trim()}` : null,
            modalMessage.trim() ? `\nCover Note:\n${modalMessage.trim()}` : null,
        ]
            .filter(Boolean)
            .join("\n");

        leadForm.append("message", compositeNote);

        startTransition(async () => {
            try {
                await submitLeadAction(undefined, leadForm);
            } catch {
                // Lead submission background catch
            }

            setFormStatus("success");

            // Open WhatsApp automatically
            try {
                window.open(waUrl, "_blank");
            } catch {
                // If pop-up was blocked, user can tap the Open WhatsApp button on success view
            }
        });
    };

    const whatsappDirectLink = useMemo(() => {
        const num = general.whatsappNumber || "94707820810";
        const text = encodeURIComponent(
            `Hi eSupport Careers Team! I am interested in applying for the ${selectedJobForModal?.title || "open roles"}. Could we connect?`
        );
        return `https://wa.me/${num}?text=${text}`;
    }, [general.whatsappNumber, selectedJobForModal]);

    return (
        <div className="relative min-h-screen text-brand-navy selection:bg-brand-navy selection:text-white" style={{ backgroundColor: LIGHT_BG }}>
            <Cursor />
            <Navbar />

            {/* ── Background Glow Elements ── */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
                <div
                    className="absolute -top-[20%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[140px]"
                    style={{ background: "radial-gradient(circle, var(--brand-1, #f43f5e) 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[40%] -right-[15%] h-[500px] w-[500px] rounded-full blur-[160px]"
                    style={{ background: "radial-gradient(circle, var(--brand-3, #3b82f6) 0%, transparent 70%)" }}
                />
            </div>

            {/* ── Hero Section ── */}
            <section className="relative z-10 pt-36 pb-20 sm:pt-44 sm:pb-28 px-4 sm:px-8 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease }}
                    className="max-w-3xl"
                >
                    {/* Top Hiring Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/10 bg-white/80 backdrop-blur-md shadow-xs mb-6 text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>
                            {careersPage.badgeText
                                ? careersPage.badgeText.replace(/\d+\s+ROLES/i, `${activeJobs.length} ROLES`)
                                : `WE'RE HIRING · ${activeJobs.length} ROLES OPEN`}
                        </span>
                    </div>

                    <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-brand-navy/50 mb-3">
                        {careersPage.eyebrow || "Careers & Culture"}
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight uppercase leading-[0.95] mb-6">
                        <span className="block">{careersPage.titleLine1 || "Build The Future"}</span>
                        <span className="block text-brand-navy/35 italic font-serif normal-case tracking-normal">
                            {careersPage.titleLine2 || "With eSupport."}
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-brand-navy/70 leading-relaxed max-w-2xl font-light">
                        {careersPage.intro ||
                            "We are a tight-knit collective of engineers, designers, digital marketers, and strategists creating transformative digital products across Sri Lanka, Dubai, and Australia. Join us to solve challenging problems and do the best work of your career."}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                        <a
                            href="#openings"
                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-navy text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:opacity-90 active:scale-95 transition-all shadow-md"
                        >
                            <span>Explore Open Roles</span>
                            <span>↓</span>
                        </a>
                        <a
                            href={`mailto:${careersPage.ctaEmail || "careers@esupport.live"}`}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border border-brand-navy/15 text-brand-navy text-xs font-semibold uppercase tracking-[0.15em] rounded-full hover:bg-black/5 active:scale-95 transition-all"
                        >
                            <span>Drop Your CV Directly</span>
                            <span className="opacity-50">↗</span>
                        </a>
                    </div>
                </motion.div>

                {/* Hero Stats Ribbon */}
                {careersPage.stats && careersPage.stats.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease, delay: 0.2 }}
                        className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-md border border-brand-navy/10 shadow-sm"
                    >
                        {careersPage.stats.map((stat, i) => (
                            <div key={i} className="p-3 border-l first:border-l-0 border-brand-navy/10 pl-4">
                                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-navy">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-brand-navy/60 font-medium mt-1">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </section>

            {/* ── Culture & Perks Grid ── */}
            <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-8 border-t border-black/10 bg-white/40">
                <div className="max-w-6xl mx-auto">
                    <div className="max-w-2xl mb-12 sm:mb-16">
                        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-brand-navy/50 mb-2">
                            The eSupport Advantage
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight uppercase">
                            {careersPage.perksTitle || "Why Build Your Career With Us?"}
                        </h2>
                        {careersPage.perksSubtitle && (
                            <p className="mt-3 text-sm sm:text-base text-brand-navy/65 leading-relaxed">
                                {careersPage.perksSubtitle}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {careersPage.perks?.map((perk: CareerPerk, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ duration: 0.5, delay: idx * 0.08 }}
                                className="group relative p-6 sm:p-8 rounded-2xl bg-white border border-brand-navy/10 shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <span className="absolute top-6 right-6 font-mono text-xs font-bold tracking-widest text-brand-navy/30 group-hover:text-brand-navy transition-colors">
                                    {perk.tag || String(idx + 1).padStart(2, "0")}
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center font-mono text-xs font-bold text-brand-navy mb-5">
                                    ✓
                                </div>
                                <h3 className="text-lg font-bold tracking-tight text-brand-navy mb-2">
                                    {perk.title}
                                </h3>
                                <p className="text-sm text-brand-navy/65 leading-relaxed">
                                    {perk.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Open Roles Section ── */}
            <section id="openings" className="relative z-10 py-20 sm:py-28 px-4 sm:px-8 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-black/10">
                    <div>
                        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-brand-navy/50 mb-2">
                            Open Positions ({activeJobs.length})
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight uppercase">
                            {careersPage.openingsTitle || "Current Opportunities"}
                        </h2>
                        {careersPage.openingsSubtitle && (
                            <p className="mt-2 text-sm sm:text-base text-brand-navy/65 max-w-xl">
                                {careersPage.openingsSubtitle}
                            </p>
                        )}
                    </div>

                    {/* Quick Search */}
                    <div className="w-full md:w-72">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search role or keyword..."
                            className="w-full px-4 py-2.5 rounded-full border border-black/15 bg-white text-xs text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 shadow-xs"
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {departments.map(dept => {
                        const count =
                            dept === "All"
                                ? activeJobs.length
                                : activeJobs.filter(j => j.department.toLowerCase() === dept.toLowerCase()).length;
                        const isSelected = activeDept.toLowerCase() === dept.toLowerCase();

                        return (
                            <button
                                key={dept}
                                type="button"
                                onClick={() => setActiveDept(dept)}
                                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                                    isSelected
                                        ? "bg-brand-navy text-white shadow-sm"
                                        : "bg-white/80 hover:bg-white border border-brand-navy/10 text-brand-navy/70 hover:text-brand-navy"
                                }`}
                            >
                                <span>{dept}</span>
                                <span
                                    className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono ${
                                        isSelected ? "bg-white/20 text-white" : "bg-black/5 text-brand-navy/50"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Jobs Accordion / Cards List */}
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white/60 border border-dashed border-black/15 rounded-2xl">
                        <p className="text-lg font-bold text-brand-navy/70">No openings match your criteria.</p>
                        <p className="text-xs text-brand-navy/50 mt-1 max-w-md mx-auto">
                            Try switching to "All" departments or clear your search query. You can also send an unsolicited application!
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveDept("All");
                                setSearchQuery("");
                            }}
                            className="mt-4 px-4 py-2 bg-brand-navy text-white text-xs font-bold rounded-full uppercase tracking-wider"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map((job: CareerJob, idx: number) => {
                            const isExpanded = expandedJobIndex === idx;

                            return (
                                <motion.div
                                    key={idx}
                                    layout
                                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                                        isExpanded
                                            ? "bg-white border-brand-navy/20 shadow-md ring-1 ring-black/5"
                                            : "bg-white/90 hover:bg-white border-brand-navy/10 shadow-xs"
                                    }`}
                                >
                                    {/* Card Header (Always Visible) */}
                                    <div
                                        onClick={() => setExpandedJobIndex(isExpanded ? null : idx)}
                                        className="p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 cursor-pointer select-none"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold bg-brand-navy/5 text-brand-navy">
                                                    {job.department}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                    {job.type}
                                                </span>
                                                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider bg-neutral-100 text-neutral-600">
                                                    {job.location}
                                                </span>
                                                {job.experience && (
                                                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider bg-neutral-100 text-neutral-600">
                                                        {job.experience}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-brand-navy">
                                                {job.title}
                                            </h3>

                                            <p className="text-xs sm:text-sm text-brand-navy/65 max-w-2xl line-clamp-2">
                                                {job.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0">
                                            <button
                                                type="button"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleOpenModal(job);
                                                }}
                                                className="px-5 py-2.5 rounded-full bg-brand-navy text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-xs"
                                            >
                                                Apply Now →
                                            </button>
                                            <button
                                                type="button"
                                                aria-label={isExpanded ? "Collapse job details" : "Expand job details"}
                                                className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center text-sm font-bold text-brand-navy/60 hover:text-brand-navy hover:bg-black/5 transition-colors"
                                            >
                                                {isExpanded ? "↑" : "↓"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable Details Drawer */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.35, ease }}
                                                className="border-t border-black/10 bg-neutral-50/50 p-6 sm:p-8"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                                    {job.responsibilities && (
                                                        <div>
                                                            <h4 className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-brand-navy/50 mb-3">
                                                                Key Responsibilities
                                                            </h4>
                                                            <div className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed whitespace-pre-line space-y-1.5 font-normal">
                                                                {job.responsibilities}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {job.requirements && (
                                                        <div>
                                                            <h4 className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-brand-navy/50 mb-3">
                                                                What We Look For
                                                            </h4>
                                                            <div className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed whitespace-pre-line space-y-1.5 font-normal">
                                                                {job.requirements}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-black/10 flex flex-wrap items-center justify-between gap-4">
                                                    <div className="text-xs text-brand-navy/60">
                                                        Questions regarding this role? Email{" "}
                                                        <a
                                                            href={`mailto:${job.applyEmail || "careers@esupport.live"}`}
                                                            className="font-bold underline text-brand-navy"
                                                        >
                                                            {job.applyEmail || "careers@esupport.live"}
                                                        </a>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <a
                                                            href={`mailto:${job.applyEmail || "careers@esupport.live"}?subject=${encodeURIComponent(`Application: ${job.title}`)}`}
                                                            className="text-xs font-semibold text-brand-navy/70 hover:text-brand-navy underline"
                                                        >
                                                            Apply via Email Client
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenModal(job)}
                                                            className="px-6 py-2.5 rounded-full bg-brand-navy text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md"
                                                        >
                                                            Fill Application Form →
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Spontaneous Application CTA Banner ── */}
            <section className="relative z-10 py-16 sm:py-20 px-4 sm:px-8 max-w-6xl mx-auto mb-16">
                <div className="p-8 sm:p-12 rounded-3xl bg-brand-navy text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                    <div className="relative z-10 max-w-2xl">
                        <div className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/50 mb-3">
                            General Applications
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight uppercase mb-4">
                            {careersPage.ctaTitle || "Don't see your specific role listed?"}
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-8 font-light">
                            {careersPage.ctaBody ||
                                "We are constantly expanding our footprint and welcoming exceptional talents. Send us your CV, GitHub, or portfolio and let's explore how we can collaborate."}
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                type="button"
                                onClick={() =>
                                    handleOpenModal({
                                        title: "General Application",
                                        department: "General / Cross-functional",
                                        location: "Global / Hybrid",
                                        type: "Full-time",
                                        experience: "All Experience Levels",
                                        description: "Spontaneous applicant eager to contribute to eSupport Technologies.",
                                        responsibilities: "",
                                        requirements: "",
                                        applyEmail: careersPage.ctaEmail || "careers@esupport.live",
                                        isActive: true,
                                    })
                                }
                                className="px-6 py-3.5 bg-white text-brand-navy text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-neutral-100 active:scale-95 transition-all shadow-md"
                            >
                                {careersPage.ctaButtonLabel || "Apply Spontaneously →"}
                            </button>
                            <a
                                href={`mailto:${careersPage.ctaEmail || "careers@esupport.live"}?subject=General%20Careers%20Inquiry`}
                                className="px-6 py-3.5 border border-white/20 text-white text-xs font-semibold uppercase tracking-[0.15em] rounded-full hover:bg-white/10 active:scale-95 transition-all"
                            >
                                {careersPage.ctaEmail || "careers@esupport.live"}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Interactive Application Modal ── */}
            <AnimatePresence>
                {selectedJobForModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease }}
                            className="relative w-full max-w-xl rounded-2xl bg-white p-6 sm:p-10 shadow-2xl z-10 my-8 border border-black/10"
                        >
                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                aria-label="Close modal"
                                className="absolute top-5 right-5 w-8 h-8 rounded-full border border-black/10 flex items-center justify-center text-sm font-bold text-brand-navy/50 hover:text-brand-navy hover:bg-black/5 transition-colors"
                            >
                                ✕
                            </button>

                            {formStatus === "success" ? (
                                <div className="text-center py-6 sm:py-8">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4 animate-bounce">
                                        ✓
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight text-brand-navy mb-2">
                                        Application & CV Ready!
                                    </h3>
                                    <p className="text-sm text-brand-navy/70 leading-relaxed mb-6 max-w-md mx-auto">
                                        Thank you, <span className="font-bold text-brand-navy">{modalName}</span>! Your application for{" "}
                                        <span className="font-bold text-brand-navy">{selectedJobForModal.title}</span> has been processed.
                                        WhatsApp will open with all your details and your CV attached.
                                    </p>

                                    {uploadedCvUrl && (
                                        <div className="mb-6 p-3.5 rounded-xl bg-neutral-50 border border-black/10 text-left max-w-md mx-auto flex items-center justify-between text-xs">
                                            <div className="truncate min-w-0 mr-2">
                                                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">Uploaded CV:</span>
                                                <span className="font-medium text-brand-navy truncate block">{cvFile?.name || "CV File"}</span>
                                            </div>
                                            <a
                                                href={uploadedCvUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="shrink-0 px-3 py-1 rounded bg-white border border-black/15 text-[11px] font-semibold text-brand-navy hover:bg-neutral-100"
                                            >
                                                View CV ↗
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <a
                                            href={generatedWhatsAppUrl || whatsappDirectLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full sm:w-auto px-6 py-3 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <span>Open WhatsApp Chat 💬</span>
                                            <span>→</span>
                                        </a>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="w-full sm:w-auto px-5 py-3 rounded-full border border-black/15 text-xs font-bold uppercase tracking-wider text-brand-navy/70 hover:text-brand-navy cursor-pointer"
                                        >
                                            Close
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-brand-navy/45 mt-4">
                                        Tip: Tap the button above if WhatsApp didn't open automatically on your device.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-6">
                                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-1 rounded bg-brand-navy/5 text-brand-navy font-bold">
                                            {selectedJobForModal.department}
                                        </span>
                                        <h3 className="text-2xl font-bold tracking-tight text-brand-navy mt-2">
                                            Apply for {selectedJobForModal.title}
                                        </h3>
                                        <p className="text-xs text-brand-navy/60 mt-1">
                                            {selectedJobForModal.location} · {selectedJobForModal.type}
                                        </p>
                                    </div>

                                    {formError && (
                                        <div className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                                            {formError}
                                        </div>
                                    )}

                                    <form onSubmit={handleApplicationSubmit} className="space-y-4">
                                        {/* Honeypot */}
                                        <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy/70 mb-1.5">
                                                Your Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={modalName}
                                                onChange={e => setModalName(e.target.value)}
                                                placeholder="e.g. Kasun Perera"
                                                className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-sm text-brand-navy placeholder:text-brand-navy/35 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy/70 mb-1.5">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={modalEmail}
                                                    onChange={e => setModalEmail(e.target.value)}
                                                    placeholder="you@domain.com"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-sm text-brand-navy placeholder:text-brand-navy/35 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy/70 mb-1.5">
                                                    Phone / WhatsApp *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={modalPhone}
                                                    onChange={e => setModalPhone(e.target.value)}
                                                    placeholder="+94 77 123 4567"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-sm text-brand-navy placeholder:text-brand-navy/35 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                                                />
                                            </div>
                                        </div>

                                        {/* CV / Resume File Upload Zone */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy/70 mb-1.5">
                                                Upload Your CV / Resume (PDF, DOC, DOCX)
                                            </label>

                                            {!cvFile ? (
                                                <label className="relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-black/15 hover:border-brand-navy/40 rounded-xl bg-neutral-50/70 hover:bg-neutral-50 transition-colors cursor-pointer group">
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                if (file.size > 15 * 1024 * 1024) {
                                                                    setFormError("File size exceeds 15MB. Please choose a smaller file.");
                                                                    return;
                                                                }
                                                                setCvFile(file);
                                                                setFormError("");
                                                            }
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-lg mb-2 text-brand-navy/60 group-hover:scale-105 transition-transform">
                                                        📎
                                                    </div>
                                                    <p className="text-xs font-semibold text-brand-navy">
                                                        Click to select or drag & drop your CV
                                                    </p>
                                                    <p className="text-[10px] text-brand-navy/45 mt-0.5">
                                                        Supports PDF, DOC, DOCX (Max 15MB)
                                                    </p>
                                                </label>
                                            ) : (
                                                <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <span className="text-2xl">📄</span>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-brand-navy truncate">
                                                                {cvFile.name}
                                                            </p>
                                                            <p className="text-[10px] text-emerald-800 font-mono">
                                                                {(cvFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to upload & send
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCvFile(null)}
                                                        className="p-1 rounded-md text-brand-navy/50 hover:text-rose-600 hover:bg-rose-50 transition-colors font-bold text-sm ml-2 shrink-0 cursor-pointer"
                                                        title="Remove CV file"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy/70 mb-1.5">
                                                Portfolio / LinkedIn / Online CV Link (Optional)
                                            </label>
                                            <input
                                                type="url"
                                                value={modalPortfolio}
                                                onChange={e => setModalPortfolio(e.target.value)}
                                                placeholder="https://linkedin.com/in/... or drive link"
                                                className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-sm text-brand-navy placeholder:text-brand-navy/35 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy/70 mb-1.5">
                                                Cover Note / Introduction
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={modalMessage}
                                                onChange={e => setModalMessage(e.target.value)}
                                                placeholder="Tell us about yourself, key projects, and what excites you about eSupport..."
                                                className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-sm text-brand-navy placeholder:text-brand-navy/35 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 resize-none"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isPending || formStatus === "submitting" || formStatus === "uploading_cv"}
                                                className="w-full py-3.5 rounded-full bg-brand-navy text-white text-xs font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-98 transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                                            >
                                                {formStatus === "uploading_cv" ? (
                                                    <span>Uploading CV...</span>
                                                ) : formStatus === "submitting" ? (
                                                    <span>Submitting Application...</span>
                                                ) : (
                                                    <>
                                                        <span>Submit & Send to WhatsApp</span>
                                                        <span>💬 →</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-center text-brand-navy/45 mt-2">
                                            🔒 Your CV and details are sent directly to the eSupport hiring team.
                                        </p>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Standard Footer ── */}
            <footer className="border-t border-black/10 bg-white/70 backdrop-blur-md py-12 px-4 sm:px-8">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-brand-navy/60">
                    <p>{footer.copyright || "© 2026 eSupport Technologies (Pvt) Ltd — All Rights Reserved"}</p>
                    <p className="font-mono tracking-wider uppercase text-[11px] text-brand-navy/50">
                        {footer.areas || "Sri Lanka · Dubai · Australia"}
                    </p>
                    <Link href="/" className="font-semibold text-brand-navy hover:underline">
                        ← Back to Home
                    </Link>
                </div>
            </footer>
        </div>
    );
}
