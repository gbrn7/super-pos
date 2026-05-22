<?php

return [

  'required' => ':attribute wajib diisi.',

  'string' => ':attribute harus berupa teks.',

  'array' => ':attribute harus berupa array.',

  'numeric' => ':attribute harus berupa angka.',

  'unique' => ':attribute sudah ada',

  'min' => [
    'string' => ':attribute minimal :min karakter.',
    'numeric' => ':attribute minimal :min.',
    'array' => ':attribute minimal memiliki :min item.',
  ],

  'max' => [
    'string' => ':attribute maksimal :max karakter.',
    'numeric' => ':attribute maksimal :max.',
  ],

  'attributes' => [
    'name' => 'Nama',
    'desc' => 'Deskripsi',
    'age' => 'Umur',
    'permissions' => 'Hak akses'
  ],

];
