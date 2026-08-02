# Design Spec: Backend Setup Messages Multi-Language Support

## Overview
Menambahkan dukungan i18n/multi-bahasa pada pesan balasan JSON backend di `SetupController.php` menggunakan helper `__()` bawaan Laravel dan file translasi `lang/en/setup.php` serta `lang/id/setup.php`.

## Lang Files Structure

### `lang/en/setup.php`
```php
<?php

return [
    'db_success' => 'Database connection successful & credentials saved to .env.',
    'db_failed' => 'Database connection failed: :error',
    'migrate_success' => 'Database migrated and seeded successfully.',
    'migrate_failed' => 'Migration failed: :error',
];
```

### `lang/id/setup.php`
```php
<?php

return [
    'db_success' => 'Koneksi database berhasil & kredensial disimpan ke .env.',
    'db_failed' => 'Koneksi database gagal: :error',
    'migrate_success' => 'Database berhasil di-migrate dan di-seed.',
    'migrate_failed' => 'Migrasi gagal: :error',
];
```

## SetupController Updates
Mengganti string respons JSON statis dengan:
- `__('setup.db_success')`
- `__('setup.db_failed', ['error' => $e->getMessage()])`
- `__('setup.migrate_success')`
- `__('setup.migrate_failed', ['error' => $e->getMessage()])`

## Testing & Verification
- Memastikan pengujian `SetupControllerTest` dan `EnsureAppIsNotInstalledTest` tetap berjalan lancar.
