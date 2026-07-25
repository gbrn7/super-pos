import { useTranslation } from 'react-i18next';

enum CategoryPermissionEnums {
    CREATE = 'create-category',
    READ = 'read-category',
    UPDATE = 'update-category',
    DELETE = 'delete-category',
}

enum DashboardPermissionEnums {
    READ = 'read-dashboard',
}

enum RolePermissionEnums {
    CREATE = 'create-role',
    READ = 'read-role',
    UPDATE = 'update-role',
    DELETE = 'delete-role',
}

enum UserPermissionEnums {
    CREATE = 'create-user',
    READ = 'read-user',
    UPDATE = 'update-user',
    DELETE = 'delete-user',
}

enum UnitPermissionEnums {
    CREATE = 'create-unit',
    READ = 'read-unit',
    UPDATE = 'update-unit',
    DELETE = 'delete-unit',
}

enum PaymentMethodPermissionEnums {
    CREATE = 'create-payment-method',
    READ = 'read-payment-method',
    UPDATE = 'update-payment-method',
    DELETE = 'delete-payment-method',
}

enum ProductPermissionEnums {
    CREATE = 'create-product',
    READ = 'read-product',
    UPDATE = 'update-product',
    DELETE = 'delete-product',
}

enum MasterProductPermissionEnums {
    CREATE = 'create-master-product',
    READ = 'read-master-product',
    UPDATE = 'update-master-product',
    DELETE = 'delete-master-product',
}

enum TransactionPermissionEnums {
    CREATE = 'create-transaction',
    READ = 'read-transaction',
    UPDATE = 'update-transaction',
    DELETE = 'delete-transaction',

}

enum ProfitWalletPermissionEnums {
    CREATE = 'create-profit-wallet',
    READ = 'read-profit-wallet',
    DISBURSE = 'disburse-profit-wallet',
    WITHDRAW_CAPITAL = 'withdraw-capital-profit-wallet',
}

enum CapitalWalletPermissionEnums {
    CREATE = 'create-capital-wallet',
    READ = 'read-capital-wallet',
    INJECT = 'inject-capital-wallet',
    DRAWDOWN = 'drawdown-capital-wallet',
    PURCHASE_PRODUCT = 'purchase-product-capital-wallet',
}

export const PERMISSIONENUMS = {
    CATEGORY: CategoryPermissionEnums,
    DASHBOARD: DashboardPermissionEnums,
    ROLE: RolePermissionEnums,
    USER: UserPermissionEnums,
    UNIT: UnitPermissionEnums,
    PAYMENT_METHOD: PaymentMethodPermissionEnums,
    PRODUCT: ProductPermissionEnums,
    MASTER_PRODUCT: MasterProductPermissionEnums,
    TRANSACTION: TransactionPermissionEnums,
    PROFIT_WALLET: ProfitWalletPermissionEnums,
    CAPITAL_WALLET: CapitalWalletPermissionEnums,
};

export const PERMISSIONLIST = (): Permission[] => {
    const { t } = useTranslation();

    return [
        {
            LABEL: t('permission_label.category.permission', 'Kategori'),
            ACCESSLIST: [
                {
                    LABEL: t(
                        'permission_label.category.create',
                        'Buat Kategori',
                    ),
                    VALUE: CategoryPermissionEnums.CREATE,
                },
                {
                    LABEL: t('permission_label.category.read', 'Baca Kategori'),
                    VALUE: CategoryPermissionEnums.READ,
                },
                {
                    LABEL: t(
                        'permission_label.category.update',
                        'Update Kategori',
                    ),
                    VALUE: CategoryPermissionEnums.UPDATE,
                },
                {
                    LABEL: t(
                        'permission_label.category.delete',
                        'Hapus Kategori',
                    ),
                    VALUE: CategoryPermissionEnums.DELETE,
                },
            ],
        },
        {
            LABEL: t('permission_label.role.permission', 'Peran'),
            ACCESSLIST: [
                {
                    LABEL: t('permission_label.role.create', 'Buat Peran'),
                    VALUE: RolePermissionEnums.CREATE,
                },
                {
                    LABEL: t('permission_label.role.read', 'Baca Peran'),
                    VALUE: RolePermissionEnums.READ,
                },
                {
                    LABEL: t('permission_label.role.update', 'Update Peran'),
                    VALUE: RolePermissionEnums.UPDATE,
                },
                {
                    LABEL: t('permission_label.role.delete', 'Hapus Peran'),
                    VALUE: RolePermissionEnums.DELETE,
                },
            ],
        },
        {
            LABEL: t('permission_label.dashboard.permission', 'Dasbor'),
            ACCESSLIST: [
                {
                    LABEL: t('permission_label.dashboard.read', 'Baca Dasbor'),
                    VALUE: DashboardPermissionEnums.READ,
                },
            ],
        },
        {
            LABEL: t('permission_label.user.permission', 'Pengguna'),
            ACCESSLIST: [
                {
                    LABEL: t('permission_label.user.create', 'Buat Pengguna'),
                    VALUE: UserPermissionEnums.CREATE,
                },
                {
                    LABEL: t('permission_label.user.read', 'Baca Pengguna'),
                    VALUE: UserPermissionEnums.READ,
                },
                {
                    LABEL: t('permission_label.user.update', 'Update Pengguna'),
                    VALUE: UserPermissionEnums.UPDATE,
                },
                {
                    LABEL: t('permission_label.user.delete', 'Hapus Pengguna'),
                    VALUE: UserPermissionEnums.DELETE,
                },
            ],
        },
        {
            LABEL: t('permission_label.unit.permission', 'Satuan'),
            ACCESSLIST: [
                {
                    LABEL: t('permission_label.unit.create', 'Buat Satuan'),
                    VALUE: UnitPermissionEnums.CREATE,
                },
                {
                    LABEL: t('permission_label.unit.read', 'Baca Satuan'),
                    VALUE: UnitPermissionEnums.READ,
                },
                {
                    LABEL: t('permission_label.unit.update', 'Update Satuan'),
                    VALUE: UnitPermissionEnums.UPDATE,
                },
                {
                    LABEL: t('permission_label.unit.delete', 'Hapus Satuan'),
                    VALUE: UnitPermissionEnums.DELETE,
                },
            ],
        },
        {
            LABEL: t(
                'permission_label.payment_method.permission',
                'Metode Pembayaran',
            ),
            ACCESSLIST: [
                {
                    LABEL: t(
                        'permission_label.payment_method.create',
                        'Buat Metode Pembayaran',
                    ),
                    VALUE: PaymentMethodPermissionEnums.CREATE,
                },
                {
                    LABEL: t(
                        'permission_label.payment_method.read',
                        'Baca Metode Pembayaran',
                    ),
                    VALUE: PaymentMethodPermissionEnums.READ,
                },
                {
                    LABEL: t(
                        'permission_label.payment_method.update',
                        'Update Metode Pembayaran',
                    ),
                    VALUE: PaymentMethodPermissionEnums.UPDATE,
                },
                {
                    LABEL: t(
                        'permission_label.payment_method.delete',
                        'Hapus Metode Pembayaran',
                    ),
                    VALUE: PaymentMethodPermissionEnums.DELETE,
                },
            ],
        },
        {
            LABEL: t('permission_label.product.permission', 'Produk'),
            ACCESSLIST: [
                {
                    LABEL: t('permission_label.product.create', 'Buat Produk'),
                    VALUE: ProductPermissionEnums.CREATE,
                },
                {
                    LABEL: t('permission_label.product.read', 'Baca Produk'),
                    VALUE: ProductPermissionEnums.READ,
                },
                {
                    LABEL: t(
                        'permission_label.product.update',
                        'Update Produk',
                    ),
                    VALUE: ProductPermissionEnums.UPDATE,
                },
                {
                    LABEL: t('permission_label.product.delete', 'Hapus Produk'),
                    VALUE: ProductPermissionEnums.DELETE,
                },
            ],
        },
        {
            LABEL: t('permission_label.master_product.permission', 'Produk'),
            ACCESSLIST: [
                {
                    LABEL: t(
                        'permission_label.master_product.create',
                        'Buat Master Produk',
                    ),
                    VALUE: MasterProductPermissionEnums.CREATE,
                },
                {
                    LABEL: t(
                        'permission_label.master_product.read',
                        'Baca Master Produk',
                    ),
                    VALUE: MasterProductPermissionEnums.READ,
                },
                {
                    LABEL: t(
                        'permission_label.master_product.update',
                        'Update Master Produk',
                    ),
                    VALUE: MasterProductPermissionEnums.UPDATE,
                },
                {
                    LABEL: t(
                        'permission_label.master_product.delete',
                        'Hapus Master Produk',
                    ),
                    VALUE: MasterProductPermissionEnums.DELETE,
                },
            ],
        },
        {
            LABEL: t('permission_label.transaction.permission', 'Transaksi'),
            ACCESSLIST: [
                {
                    LABEL: t(
                        'permission_label.transaction.create',
                        'Buat Transaksi',
                    ),
                    VALUE: TransactionPermissionEnums.CREATE,
                },
                {
                    LABEL: t(
                        'permission_label.transaction.read',
                        'Baca Transaksi',
                    ),
                    VALUE: TransactionPermissionEnums.READ,
                },
                {
                    LABEL: t(
                        'permission_label.transaction.update',
                        'Update Transaksi',
                    ),
                    VALUE: TransactionPermissionEnums.UPDATE,
                },
                {
                    LABEL: t(
                        'permission_label.transaction.delete',
                        'Hapus Transaksi',
                    ),
                    VALUE: TransactionPermissionEnums.DELETE,
                },

            ],
        },
        {
            LABEL: t('permission_label.profit_wallet.permission', 'Dompet Profit'),
            ACCESSLIST: [
                {
                    LABEL: t('permission_label.profit_wallet.read', 'Baca Dompet Profit'),
                    VALUE: ProfitWalletPermissionEnums.READ,
                },
                {
                    LABEL: t('permission_label.profit_wallet.disburse', 'Pencairan Dana'),
                    VALUE: ProfitWalletPermissionEnums.DISBURSE,
                },
                {
                    LABEL: t('permission_label.profit_wallet.withdraw_capital', 'Penarikan Modal'),
                    VALUE: ProfitWalletPermissionEnums.WITHDRAW_CAPITAL,
                },
            ],
        },
        {
            LABEL: t('permission_label.capital_wallet.permission', 'Dompet Modal'),
            ACCESSLIST: [
                {
                    LABEL: t('permission_label.capital_wallet.read', 'Baca Dompet Modal'),
                    VALUE: CapitalWalletPermissionEnums.READ,
                },
                {
                    LABEL: t('permission_label.capital_wallet.inject', 'Suntik Modal'),
                    VALUE: CapitalWalletPermissionEnums.INJECT,
                },
                {
                    LABEL: t('permission_label.capital_wallet.drawdown', 'Tarik Modal'),
                    VALUE: CapitalWalletPermissionEnums.DRAWDOWN,
                },
                {
                    LABEL: t('permission_label.capital_wallet.purchase_product', 'Kulakan Produk'),
                    VALUE: CapitalWalletPermissionEnums.PURCHASE_PRODUCT,
                },
            ],
        },
    ];
};
