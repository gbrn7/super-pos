<?php

return [
    'success' => [
        'success' => 'Sukses',
        'created' => 'Data successfully created',
        'bulk_created' => ':count data successfully created',
        'import_processing' => 'Import is processing',
        'updated' => 'Data successfully updated',
        'bulk_updated' => ':count data successfully updated',
        'deleted' => 'Data successfully deleted',
        'bulk_deleted' => ':count data successfully deleted',
        'profile_updated' => 'Profil updated',
        'password_updated' => 'Password updated',
        'store_settings_updated' => 'Store settings successfully updated',
        'profit_wallet' => [
            'sales_profit_notes' => 'Sales profit from POS checkout',
        ],
    ],

    'error' => [
        'data_not_found' => 'Data not found',
        'data_already_exists' => 'Data already exist',
        'product_with_barcode_exist' => 'Product with barcode %s has been added',
        'super_admin_cannot_be_updated' => 'Super admin data cannot be deleted',
        'super_admin_cannot_be_deleted' => 'Super admin data cannot be deleted',
        'role_data_used_by_user' => 'Role data is still used by users',
        'internal_server_error' => 'Internal server error',
        'duplicate_data_error_import' => 'There is duplicate data',
        'something_went_wrong' => 'Something went wrong',
        'unauthorized' => 'Unauthorized access',
        'validation' => 'Validation failed',
        'cost_price_greater_than_price_validation' => 'Cost price of product cannot be greater than selling price.',
        'cost_price_greater_than_price_template_validation' => 'Cost price of %s product cannot be greater than selling price, please check your template.',
        'blank_name_template_validation' => 'There are blank names in the template, please check your template.',
        'blank_category_template_validation' => 'There are blank categories in the template, please check your template.',
        'blank_unit_template_validation' => 'There are blank units in the template, please check your template.',
        'product_not_active' => 'Product is not active',
        'out_of_stock' => 'Product stock for :product is insufficient',
        'profit_wallet' => [
            'amount_must_be_greater_than_zero' => 'Amount must be greater than zero.',
            'insufficient_balance_for_disbursement' => 'Insufficient wallet balance for disbursement.',
            'insufficient_balance_for_capital_withdrawal' => 'Insufficient wallet balance for capital withdrawal.',
        ],
    ],

];
