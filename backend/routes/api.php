<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', function () {
    return response()->json([
        'estado' => 'ok',
        'mensaje' => 'El backend de soporte esta funcionando',
        'servidor' => 'Laravel 11'
    ]);
});
