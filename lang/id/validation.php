<?php

return [

    'required' => ':attribute wajib diisi.',

    'string' => ':attribute harus berupa teks.',

    'array' => ':attribute harus berupa array.',

    'numeric' => ':attribute harus berupa angka.',

    'unique' => ':attribute sudah ada',

    'confirmed' => ':attribute konfirmasi tidak cocok',

    'mimes' => ':attribute harus bertipe :values',

    'exists' => ':attribute yang dipilih tidak valid.',

    'min' => [
        'string' => ':attribute minimal :min karakter.',
        'numeric' => ':attribute minimal :min.',
        'array' => ':attribute minimal memiliki :min item.',
    ],

    'max' => [
        'file' => ':attribute maksimal :max Kb',
        'string' => ':attribute maksimal :max karakter.',
        'numeric' => ':attribute maksimal :max.',
    ],

    'attributes' => [
        'name' => 'Nama',
        'desc' => 'Deskripsi',
        'age' => 'Umur',
        'permissions' => 'Hak akses',
        'role' => 'Peran',
        'password' => 'Kata sandi',
        'password_confirmation' => 'Konfirmasi kata sandi',
        'image' => 'Gambar',
        'category_id' => 'Kategori',
        'unit_id' => 'Satuan',
        'stock' => 'Stok',
        'price' => 'Harga',
        'cost_price' => 'Harga Pokok',
        'is_active' => 'Status Aktif',
        'is_unlimited' => 'Status Stok',
    ],

];
