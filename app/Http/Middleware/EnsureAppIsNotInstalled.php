<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAppIsNotInstalled
{
    public function handle(Request $request, Closure $next): Response
    {
        $isInstalled = file_exists(storage_path('app/installed.lock'));
        $isSetupRoute = $request->routeIs('setup.*');

        if (! $isInstalled && ! $isSetupRoute) {
            return redirect()->route('setup.index');
        }

        if ($isInstalled && $isSetupRoute && ! $request->routeIs('setup.complete')) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
