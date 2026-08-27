import { Link } from '@inertiajs/react';
import {
    Banknote,
    Book,
    LayoutGrid,
    Package,
    PackageSearch,
    Receipt,
    ShoppingCart,
    Tags,
    User,
    Weight,
    TrendingUp,
    Wallet,
    RotateCcw,
    Calculator,
} from 'lucide-react';
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
import { index as products } from '@/routes/products';
import { index as masterProducts } from '@/routes/master-products';
import { index as paymentMethods } from '@/routes/payment-methods';
import { index as roles } from '@/routes/roles';
import { index as users } from '@/routes/users';
import { index as units } from '@/routes/units';
import { index as transactions } from '@/routes/transactions';
import { index as cashier } from '@/routes/cashier';

import { index as profitWallet } from '@/routes/profit-wallet';
import { index as capitalWallet } from '@/routes/capital-wallet';
import type { NavGroup, NavItem } from '@/types';
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
    const { t } = useTranslation();

    const navGroups: NavGroup[] = [
        {
            title: t('component.sidebar.group_main', 'Utama'),
            items: [
                {
                    title: t(
                        'component.sidebar.dashboard_menu_label',
                        'Dasbor',
                    ),
                    href: dashboard(),
                    icon: LayoutGrid,
                    role: [],
                },
            ],
        },
        {
            title: t('component.sidebar.group_sales', 'Penjualan & Transaksi'),
            items: [
                {
                    title: t('component.sidebar.kasir_menu_label', 'Kasir'),
                    href: cashier(),
                    icon: ShoppingCart,
                    permission: PERMISSIONENUMS.TRANSACTION.CREATE,
                    role: [],
                },
                {
                    title: t(
                        'component.sidebar.transaction_menu_label',
                        'Transaksi',
                    ),
                    href: transactions(),
                    icon: Receipt,
                    permission: PERMISSIONENUMS.TRANSACTION.READ,
                    role: [],
                },
                {
                    title: t(
                        'component.sidebar.return_menu_label',
                        'Retur Barang',
                    ),
                    href: '/returns',
                    icon: RotateCcw,
                    permission: PERMISSIONENUMS.RETURN.READ,
                    role: [],
                },
                {
                    title: t(
                        'component.sidebar.payment_method_menu_label',
                        'Metode Pembayaran',
                    ),
                    href: paymentMethods(),
                    icon: Banknote,
                    permission: PERMISSIONENUMS.PAYMENT_METHOD.READ,
                    role: [],
                },
            ],
        },
        {
            title: t('component.sidebar.group_inventory', 'Produk & Inventori'),
            items: [
                {
                    title: t(
                        'component.sidebar.product_menu_label',
                        'Produk',
                    ),
                    href: products(),
                    icon: Package,
                    permission: PERMISSIONENUMS.PRODUCT.READ,
                    role: [],
                },
                {
                    title: t(
                        'component.sidebar.master_product_menu_label',
                        'Master Produk',
                    ),
                    href: masterProducts(),
                    icon: PackageSearch,
                    permission: PERMISSIONENUMS.MASTER_PRODUCT.READ,
                    role: [],
                },
                {
                    title: t(
                        'component.sidebar.category_menu_label',
                        'Kategori',
                    ),
                    href: categories(),
                    icon: Tags,
                    permission: PERMISSIONENUMS.CATEGORY.READ,
                    role: [],
                },
                {
                    title: t(
                        'component.sidebar.unit_menu_label',
                        'Satuan',
                    ),
                    href: units(),
                    icon: Weight,
                    permission: PERMISSIONENUMS.UNIT.READ,
                    role: [],
                },
            ],
        },
        {
            title: t('component.sidebar.group_finance', 'Keuangan'),
            items: [
                {
                    title: t('component.sidebar.profit_wallet_menu_label', 'Dompet Profit'),
                    href: profitWallet(),
                    icon: TrendingUp,
                    permission: PERMISSIONENUMS.PROFIT_WALLET.READ,
                    role: [],
                },
                {
                    title: t('component.sidebar.capital_wallet_menu_label', 'Dompet Modal'),
                    href: capitalWallet(),
                    icon: Wallet,
                    permission: PERMISSIONENUMS.CAPITAL_WALLET.READ,
                    role: [],
                },
                {
                    title: t('component.sidebar.hpp_calculator_menu_label', 'Kalkulator HPP'),
                    href: '/hpp-calculator',
                    icon: Calculator,
                    role: [],
                },
            ],
        },
        {
            title: t('component.sidebar.group_system', 'Sistem & Pengaturan'),
            items: [
                {
                    title: t(
                        'component.sidebar.user_menu_label',
                        'Pengguna',
                    ),
                    href: users(),
                    icon: User,
                    permission: PERMISSIONENUMS.USER.READ,
                    role: [],
                },
                {
                    title: t(
                        'component.sidebar.role_menu_label',
                        'Peran',
                    ),
                    href: roles(),
                    icon: IconUserKey,
                    permission: PERMISSIONENUMS.ROLE.READ,
                    role: [],
                },
            ],
        },
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
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
