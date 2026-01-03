<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function ($response, Throwable $exception, $request) {
            if (! app()->environment(['local', 'testing']) && in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                return Inertia::render('Errors/403', ['status' => $response->getStatusCode()])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            } elseif ($response->getStatusCode() === 403) {
                return Inertia::render('Errors/403', ['status' => 403, 'message' => $exception->getMessage()])
                    ->toResponse($request)
                    ->setStatusCode(403);
            }  elseif ($response->getStatusCode() === 405) {
                return Inertia::render('Errors/405', ['status' => 405, 'message' => $exception->getMessage()])
                    ->toResponse($request)
                    ->setStatusCode(405);
            }  elseif ($response->getStatusCode() === 404) {
                return Inertia::render('Errors/404', ['status' => 404, 'message' => $exception->getMessage()])
                    ->toResponse($request)
                    ->setStatusCode(404);
            }
            return $response;
        });
    })->create();
