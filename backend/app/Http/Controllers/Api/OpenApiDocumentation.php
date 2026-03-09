<?php

namespace App\Http\Controllers\Api;

use OpenApi\Attributes as OA;

#[OA\OpenApi(
    info: new OA\Info(
        version: "1.0.0",
        title: "API de App de Soporte",
        description: "Documentación de la API para el sistema de Soporte",
        contact: new OA\Contact(
            name: "Henry Paz",
            email: "henry@tboxsa.com"
        )
    )
)]
class OpenApiDocumentation
{
    // Archivo de configuración OpenAPI
}