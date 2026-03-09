<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ValidateUploadSize
{
    /**
     * Tamaño máximo permitido en bytes (5MB)
     */
    private const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): 
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Solo validar si la petición contiene archivos
        if ($request->hasFile('file')) {
            $file = $request->file('file');

            // Validar tamaño del archivo
            if ($file->getSize() > self::MAX_SIZE) {
                return response()->json([
                    'message' => 'El archivo excede el tamaño máximo permitido',
                    'max_size_mb' => 5,
                    'file_size_mb' => round($file->getSize() / (1024 * 1024), 2)
                ], 413); // 413 Payload Too Large
            }

            // Validar tipo de archivo (solo CSV y XLSX)
            $allowedMimes = [
                'text/csv',
                'application/csv',
                'text/plain',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
                'application/vnd.ms-excel', 
            ];

            $fileMime = $file->getMimeType();
            $fileExtension = strtolower($file->getClientOriginalExtension());

            if (!in_array($fileMime, $allowedMimes) && !in_array($fileExtension, ['csv', 'xlsx', 'xls'])) {
                return response()->json([
                    'message' => 'Tipo de archivo no permitido',
                    'allowed_formats' => ['CSV', 'XLSX', 'XLS'],
                    'received_format' => $fileExtension
                ], 422);
            }
        }

        return $next($request);
    }
}