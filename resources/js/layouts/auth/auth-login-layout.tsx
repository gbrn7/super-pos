import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthLoginLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh w-full flex-col lg:flex-row">
            {/* ── LEFT: Hero Panel (hidden on mobile) ─────────────────── */}
            <div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col overflow-hidden">
                {/* Gradient overlay for better text legibility */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-transparent to-orange-900/30 z-10" />

                {/* Hero Image */}
                <img
                    src="/asset/Hero-Login.png"
                    alt="Praktis POS - Kelola bisnis dengan mudah"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                />

                {/* Bottom brand strip */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-8">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-8 rounded-full bg-orange-400" />
                        <p className="text-sm font-medium text-white/80">
                            Platform POS terpercaya untuk bisnis Anda
                        </p>
                    </div>
                    <div className="mt-3 flex gap-6">
                        {[
                            { label: 'Transaksi Cepat', value: '⚡' },
                            { label: 'Laporan Real-time', value: '📊' },
                            { label: 'Multi-kasir', value: '👥' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center gap-1.5">
                                <span className="text-xs text-white/60">{value}</span>
                                <span className="text-xs font-medium text-white/80">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Form Panel ────────────────────────────────────── */}
            <div className="flex flex-1 flex-col items-center justify-center bg-background p-6 sm:p-10 lg:p-12">
                {/* Mobile hero image (only shown on mobile) */}
                <div className="mb-6 lg:hidden w-full max-w-sm overflow-hidden rounded-2xl shadow-lg">
                    <img
                        src="/asset/Hero-Login.png"
                        alt="Praktis POS"
                        className="h-40 w-full object-cover object-top"
                    />
                </div>

                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <Link
                        href={home()}
                        className="mb-8 flex items-center gap-2 transition-opacity hover:opacity-80"
                        aria-label="Kembali ke halaman utama"
                    >
                        <img
                            src="/asset/Logo-with-text.png"
                            alt="Logo Praktis POS"
                            className="h-10 w-auto object-contain"
                        />
                    </Link>

                    {/* Heading */}
                    <div className="mb-8 space-y-1.5">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {title}
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Form content */}
                    {children}

                    {/* Footer */}
                    <p className="mt-10 text-center text-xs text-muted-foreground/60">
                        © {new Date().getFullYear()} Praktis POS. Seluruh hak dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}
