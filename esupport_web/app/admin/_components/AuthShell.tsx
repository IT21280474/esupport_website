import Image from "next/image";

/* Centered card used by the login and first-run setup screens. */
export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    return (
        <main className="min-h-screen grid lg:grid-cols-2">
            <div className="hidden lg:flex relative flex-col justify-between bg-neutral-950 p-12 text-white overflow-hidden">
                <div
                    className="absolute inset-0 opacity-40"
                    style={{ background: "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--brand-1) 35%, transparent), transparent 55%), radial-gradient(circle at 80% 80%, color-mix(in srgb, var(--brand-4) 30%, transparent), transparent 55%)" }}
                />
                <Image src="/wood-logo-dark-cop.png" alt="eSupport" width={200} height={60} className="relative h-12 w-auto object-contain self-start" />
                <div className="relative">
                    <p className="text-4xl font-black uppercase tracking-tighter leading-[0.95]">
                        Website<br />Control Centre
                    </p>
                    <p className="mt-4 max-w-sm text-sm text-white/60">
                        Edit every section of esupport.live — text, images, portfolio, team access and enquiries — from one place.
                    </p>
                </div>
                <div className="relative h-[3px] w-40" style={{ background: "linear-gradient(90deg, var(--brand-1), var(--brand-2), var(--brand-3), var(--brand-4), var(--brand-5))" }} />
            </div>
            <div className="flex items-center justify-center p-6">
                <div className="w-full max-w-sm">
                    <Image src="/logo1.png" alt="eSupport" width={160} height={56} className="h-12 w-auto object-contain mb-8 lg:hidden" />
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    <p className="mt-1 mb-8 text-sm text-neutral-500">{subtitle}</p>
                    {children}
                </div>
            </div>
        </main>
    );
}
