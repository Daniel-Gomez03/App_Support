<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DepartmentsController;
use App\Http\Controllers\Api\TicketsController;
use App\Http\Controllers\Api\CategoriesController;
use App\Http\Controllers\Api\ProductsController;
use App\Http\Middleware\ValidateUploadSize;
use App\Http\Controllers\Api\ProductModelController;
use App\Http\Controllers\Api\FaqsModelController;
use App\Http\Controllers\Api\FaqsAttachmentsController;

Route::get('/ping', function () {
    return response()->json([
        'estado' => 'ok',
        'mensaje' => 'El backend de soporte esta funcionando',
        'servidor' => 'Laravel 11'
    ]);
});

// ============================================
// CATEGORÍAS 
// ============================================
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoriesController::class, 'index']);
    Route::get('/inactives', [CategoriesController::class, 'getInactives']);
    Route::post('/', [CategoriesController::class, 'store']);
    Route::get('/{id}', [CategoriesController::class, 'show']);
    Route::put('/{id}', [CategoriesController::class, 'update']);
    Route::delete('/{id}', [CategoriesController::class, 'destroy']);
    Route::patch('/{id}/toggle', [CategoriesController::class, 'toggleStatus']);
});

// ============================================
// PRODUCTOS 
// ============================================
Route::prefix('products')->group(function () {
    Route::get('/', [ProductsController::class, 'index']);
    Route::get('/inactives', [ProductsController::class, 'getInactives']);
    Route::post('/bulk-upload', [ProductsController::class, 'bulkUpload'])  
        ->middleware(ValidateUploadSize::class);
    Route::post('/', [ProductsController::class, 'store']);  
    Route::patch('/{id}/toggle', [ProductsController::class, 'toggleStatus']);  
    Route::get('/{id}', [ProductsController::class, 'show']);
    Route::put('/{id}', [ProductsController::class, 'update']);
    Route::delete('/{id}', [ProductsController::class, 'destroy']);
});

// ============================================
// MODELOS DE PRODUCTOS (Carga masiva)
// ============================================
Route::post('/products/models/bulk-upload', [ProductModelController::class, 'bulkUpload'])
    ->middleware(ValidateUploadSize::class);

// ============================================
// MODELOS DE LOS PRODUCTOS
// ============================================
Route::prefix('products')->group(function () {
    Route::prefix('{product_id}/models')->group(function () {
        Route::get('/', [ProductModelController::class, 'index']);
        Route::get('/inactives', [ProductModelController::class, 'getInactives']);
        Route::post('/', [ProductModelController::class, 'store']);
        Route::get('/{model_id}', [ProductModelController::class, 'show']);
        Route::put('/{model_id}', [ProductModelController::class, 'update']);
        Route::delete('/{model_id}', [ProductModelController::class, 'destroy']);
        Route::patch('/{model_id}/toggle', [ProductModelController::class, 'toggleStatus']);
    });
});

// ============================================
// PREGUNTAS FRECUENTES (FAQs)
// ============================================
Route::prefix('faqs')->group(function () {
    Route::get('/', [FaqsModelController::class, 'index']);
    Route::get('/inactives', [FaqsModelController::class, 'getInactives']);
    Route::post('/', [FaqsModelController::class, 'store']);
    Route::get('/{id}', [FaqsModelController::class, 'show']);
    Route::put('/{id}', [FaqsModelController::class, 'update']);
    Route::delete('/{id}', [FaqsModelController::class, 'destroy']);
    Route::patch('/{id}/toggle', [FaqsModelController::class, 'toggleStatus']);
});


// ============================================
// DEPARTAMENTOS
// ============================================
Route::prefix('departments')->group(function () {
    Route::get('/', [DepartmentsController::class, 'index']);
});

// ============================================
// TICKETS
// ============================================
Route::prefix('tickets')->group(function () {
    Route::get('/', [TicketsController::class, 'index']);
    Route::post('/', [TicketsController::class, 'store']);
});