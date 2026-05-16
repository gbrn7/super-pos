<?php

return [

  'required' => 'The :attribute field is required.',

  'string' => 'The :attribute field must be a string.',

  'numeric' => 'The :attribute field must be a number.',

  'array' => 'The :attribute field must be a array.',


  'unique' => 'The :attribute already exists',

  'min' => [
    'string' => 'The :attribute field must be at least :min characters.',
    'numeric' => 'The :attribute field must be at least :min.',
    'array' => 'The :attribute field must have at least :min items.',
  ],

  'max' => [
    'string' => 'The :attribute field must not be greater than :max characters.',
    'numeric' => 'The :attribute field must not be greater than :max.',
  ],

  'attributes' => [
    'name' => 'Name',
    'desc' => 'Description',
    'age' => 'Age',
  ],

];
