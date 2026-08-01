import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { TabbiedArtwork } from 'tabbied/react';
import { radius } from 'tabbied/artworks';
import { t } from 'i18next';

export default function AuthLoginLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh w-full items-center justify-center bg-background p-3 sm:p-6 lg:p-8">
            <div className="flex w-full max-w-7xl flex-col lg:flex-row overflow-hidden rounded-3xl bg-card shadow-2xl border border-border min-h-[600px]">
                {/* ── MOBILE TOP HERO BANNER (hidden on lg) ────────────────── */}
                <div className="relative lg:hidden w-full h-36 sm:h-48 overflow-hidden bg-muted/40 border-b border-border">
                    <TabbiedArtwork
                        artwork={radius}
                        seed="Mcj7"
                        palette={['#ffffff00', '#e0511f', '#ff9f1c', '#ffe8c7']}
                        options={{ grid: '6x2', frequency: 0.7, shadow: false }}
                    />
                </div>

                {/* ── LEFT: Hero Panel (hidden on mobile) ─────────────────── */}
                <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-center items-center overflow-hidden p-8 xl:p-12 bg-muted/30">
                    <div className="w-full h-full min-h-[500px] relative rounded-2xl overflow-hidden bg-background/50 border border-border/40">
                        <TabbiedArtwork
                            artwork={radius}
                            seed="Mcj7"
                            palette={['#ffffff00', '#e0511f', '#ff9f1c', '#ffe8c7']}
                            options={{ grid: '3x4', frequency: 0.7, shadow: false }}
                        />
                    </div>
                </div>

                {/* ── RIGHT: Form Panel ────────────────────────────────────── */}
                <div className="flex flex-1 flex-col justify-center bg-card p-6 sm:p-10 lg:p-12 xl:p-16">
                    <div className="w-full max-w-md mx-auto">
                        {/* Logo / Back link */}
                        <Link
                            href={home()}
                            className="mb-8 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Kembali ke halaman utama"
                        >
                            <img
                                src="/asset/Logo-with-text-white-bg.png"
                                alt="Logo Praktis POS"
                                className="h-7 sm:h-8 w-auto block dark:hidden object-contain"
                            />
                            <img
                                src="/asset/Logo-with-text-dark-bg.png"
                                alt="Logo Praktis POS"
                                className="h-7 sm:h-8 w-auto hidden dark:block object-contain"
                            />
                        </Link>

                        {/* Heading */}
                        <div className="mb-8 space-y-1.5">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
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
                            © {new Date().getFullYear()} Praktis POS.{' '}
                            {t(
                                'common.all_rights_reserved',
                                'Seluruh hak dilindungi.',
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
