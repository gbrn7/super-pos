<?php

namespace App\Http\Middleware;

use App\Support\Constants\Header;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLanguage
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supported = ['id', 'en'];

        $lang = $request->header(Header::X_LANGUAGE, 'id');

        if (! in_array($lang, $supported)) {
            $lang = Header::X_LANGUAGE_DEFAULT_VALUE;
        }

        App::setLocale($lang);

        return $next($request);
    }
}
