<?php

return [
    'success' => [
        'success' => 'Sukses',
        'created' => 'Data berhasil dibuat',
        'bulk_created' => ':count data berhasil dibuat',
        'import_processing' => 'Impor sedang diproses',
        'updated' => 'Data berhasil diperbarui',
        'bulk_updated' => ':count data berhasil diperbarui',
        'deleted' => 'Data berhasil dihapus',
        'bulk_deleted' => ':count data berhasil dihapus',
        'profile_updated' => 'Profil berhasil diperbarui',
        'password_updated' => 'Password diperbarui',
        'store_settings_updated' => 'Pengaturan toko berhasil diperbarui',
        'profit_wallet' => [
            'sales_notes' => 'Penjualan dari POS kasir',
        ],
        'capital_wallet' => [
            'sales_recovery_notes' => 'Pemulihan modal dari penjualan POS',
            'reinvestment_notes' => 'Reinvestasi dari dompet profit',
        ],
    ],
    'error' => [
        'data_not_found' => 'Data tidak ditemukan',
        'data_already_exists' => 'Data sudah tersedia',
        'product_with_barcode_exist' => 'Produk dengan barcode %s sudah ditambahkan',
        'super_admin_cannot_be_updated' => 'Data super admin tidak dapat diubah',
        'super_admin_cannot_be_deleted' => 'Data super admin tidak dapat dihapus',
        'role_data_used_by_user' => 'Data peran masih digunakan pengguna',
        'internal_server_error' => 'Kesalahan server internal',
        'duplicate_data_error_import' => 'Terdapat data yang duplikat',
        'not_found' => ':resource tidak ditemukan',
        'unauthorized' => 'Anda tidak memiliki izin',
        'validation' => 'Validasi gagal',
        'cost_price_greater_than_price_validation' => 'Harga modal produk tidak boleh lebih besar dari harga jual.',
        'cost_price_greater_than_price_template_validation' => 'Harga modal produk %s tidak boleh lebih besar dari harga jual, silakan periksa kembali templat Anda.',
        'blank_name_template_validation' => 'Terdapat nama kosong pada templat, silakan periksa kembali templat Anda.',
        'blank_category_template_validation' => 'Terdapat kategori kosong pada templat, silakan periksa kembali templat Anda.',
        'blank_unit_template_validation' => 'Terdapat unit kosong pada templat, silakan periksa kembali templat Anda.',
        'product_not_active' => 'Produk tidak aktif',
        'out_of_stock' => 'Stok produk :product tidak mencukupi',
        'profit_wallet' => [
            'amount_must_be_greater_than_zero' => 'Jumlah nominal harus lebih besar dari nol.',
            'insufficient_balance_for_disbursement' => 'Saldo dompet profit tidak mencukupi untuk pencairan.',
            'insufficient_balance_for_capital_withdrawal' => 'Saldo dompet profit tidak mencukupi untuk penarikan modal.',
        ],
        'capital_wallet' => [
            'amount_must_be_greater_than_zero' => 'Jumlah nominal harus lebih besar dari nol.',
            'insufficient_balance_for_drawdown' => 'Saldo dompet modal tidak mencukupi untuk penarikan modal.',
            'insufficient_balance_for_purchase' => 'Saldo dompet modal tidak mencukupi untuk pembelian produk.',
        ],
    ],
];
