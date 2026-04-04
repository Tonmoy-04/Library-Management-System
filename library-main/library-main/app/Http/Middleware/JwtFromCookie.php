<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class JwtFromCookie
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
  public function handle($request, Closure $next)
    {
        if (!$request->bearerToken() && $request->hasCookie('token')) {
           $token = $request->cookie('token');
           $request->headers->set('Authorization', 'Bearer ' . $token);
        }

    return $next($request);
    }
}
