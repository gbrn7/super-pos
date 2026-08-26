import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editLanguage } from '@/routes/language';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { edit as editStore } from '@/routes/store';
import { edit as editDataManagement } from '@/routes/data-management';
import type { NavItem } from '@/types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { RoleEnums } from '@/support/enums/RoleEnums';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { t } = useTranslation();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { hasRole, isSuperAdmin } = useAuth();

    const sidebarNavItems: NavItem[] = [
        {
            title: t('page.settings.profile.label', 'Profil'),
            href: edit(),
            icon: null,
        },
        {
            title: t('page.settings.security.label', 'Keamanan'),
            href: editSecurity(),
            icon: null,
        },
        {
            title: t('page.settings.appearance.label', 'Tampilan'),
            href: editAppearance(),
            icon: null,
        },
        {
            title: t('page.settings.language.label', 'Bahasa'),
            href: editLanguage(),
            icon: null,
        },
        {
            title: t('page.settings.store.label', 'Informasi Toko'),
            href: editStore(),
            icon: null,
            role: [RoleEnums.SUPER_ADMIN, RoleEnums.ADMIN],
        },
        {
            title: t('page.data_management.title', 'Manajemen Data'),
            href: editDataManagement(),
            icon: null,
            role: RoleEnums.SUPER_ADMIN,
        },
    ];

    const filteredSidebarNavItems = sidebarNavItems.filter((item) => {
        if (isSuperAdmin()) {
            return true;
        }

        if (item.role) {
            const roles = Array.isArray(item.role) ? item.role : [item.role];
            return roles.some((r) => hasRole(r));
        }

        return true;
    });

    return (
        <div className="px-4 py-6">
            <Heading
                title={t('page.settings.title', 'Pengaturan')}
                description={t(
                    'page.settings.description',
                    'Kelola profil dan pengaturan akun Anda',
                )}
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {filteredSidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href!)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentOrParentUrl(item.href!),
                                })}
                            >
                                <Link href={item.href!}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 max-w-4xl">
                    <section className="space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
