<?php

namespace App\Http\Controllers;

use App\Models\ReturnModel;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function index(): Response
    {
        $returns = ReturnModel::with(['transaction', 'user', 'details.product'])
            ->latest()
            ->paginate(10);

        return Inertia::render('returns/index', [
            'returns' => $returns,
        ]);
    }
}
