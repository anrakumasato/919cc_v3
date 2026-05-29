<?php

use App\Http\Controllers\SaleController;
use Illuminate\Support\Facades\Route;

Route::get('/sales', [SaleController::class, 'index']);
Route::get('/sizes', [SaleController::class, 'sizes']);
Route::get('/items/{id}', [SaleController::class, 'show']);
