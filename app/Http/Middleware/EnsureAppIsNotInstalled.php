<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAppIsNotInstalled
{
    public function handle(Request $request, Closure $next): Response
    {
        $isInstalled = (bool) config('app.installed', false);
        $isSetupRoute = $request->routeIs('setup.*');

        if (! $isInstalled && ! $isSetupRoute) {
            return redirect()->route('setup.index');
        }

        if ($isInstalled && $isSetupRoute) {
            return redirect()->to('/dashboard');
        }

        return $next($request);
    }
}
