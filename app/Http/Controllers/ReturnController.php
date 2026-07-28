<?php

namespace App\Http\Controllers;

use App\Support\Interfaces\Services\ReturnServiceInterface;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function __construct(protected ReturnServiceInterface $returnService) {}

    public function index(): Response
    {
        $returns = $this->returnService->getAll(10);

        return Inertia::render('returns/index', [
            'returns' => $returns,
        ]);
    }
}
