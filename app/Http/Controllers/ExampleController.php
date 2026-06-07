<?php

namespace App\Http\Controllers;

class ExampleController extends Controller
{
    public function index()
    {
        return inertia('example/index');
    }
}
