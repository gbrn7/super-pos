import { Link } from '@inertiajs/react';
import { Book, LayoutGrid, Tags, User, Weight } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as categories } from '@/routes/categories';
import { index as roles } from '@/routes/roles';
import { index as users } from '@/routes/users';
import { index as units } from '@/routes/units';
import type { NavItem } from '@/types';
import { useTranslation } from 'react-i18next';
import { IconUserKey } from '@tabler/icons-react';
import { PERMISSIONENUMS } from '@/support/enums/PermissionEnums';


const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: FolderGit2,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const { t } = useTranslation()

    const mainNavItems: NavItem[] =
        [
            {
                title: t("component.sidebar.dashboard_menu_label", "Dasbor"),
                href: dashboard(),
                icon: LayoutGrid,
                permission: PERMISSIONENUMS.DASHBOARD.READ,
                role: []
            },
            {
                title: 'Example',
                href: '/example',
                icon: Book,
                permission: PERMISSIONENUMS.DASHBOARD.READ,
                role: []
            },
            {
                title: t("component.sidebar.unit_menu_label", "Satuan"),
                href: units(),
                icon: Weight,
                permission: PERMISSIONENUMS.UNIT.READ,
                role: []
            },
            {
                title: t("component.sidebar.category_menu_label", "Kategori"),
                href: categories(),
                icon: Tags,
                permission: PERMISSIONENUMS.CATEGORY.READ,
                role: []
            },
            {
                title: t("component.sidebar.role_menu_label", "Peran"),
                href: roles(),
                icon: IconUserKey,
                permission: PERMISSIONENUMS.ROLE.READ,
                role: []
            },
            {
                title: t("component.sidebar.user_menu_label", "Pengguna"),
                href: users(),
                icon: User,
                permission: PERMISSIONENUMS.USER.READ,
                role: []
            }
        ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
