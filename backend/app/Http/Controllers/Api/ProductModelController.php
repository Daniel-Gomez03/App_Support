<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductModel;
use App\Models\Products;
use OpenApi\Attributes as OA;
use League\Csv\Reader;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ProductModelController extends Controller
{
     #[OA\Get(
        path: "/api/products/{product_id}/models",
        summary: "Obtener lista de modelos de un producto",
        description: "Retorna todos los modelos activos de un producto específico",
        tags: ["Modelos de Productos"],
        parameters: [
            new OA\Parameter(
                name: "product_id",
                in: "path",
                required: true,
                description: "ID del producto",
                schema: new OA\Schema(
                    type: "integer", 
                    example: 1
                )
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de modelos obtenida con éxito",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(
                        ref: "#/components/schemas/ProductModel"
                    ),
                    example: [
                        [
                            "product_model_id" => 1,
                            "product_id" => 1,
                            "product_model_name" => "Hybrid Tablet",
                            "product_model_status" => true,
                            "created_at" => "2026-03-06T10:30:00.000000Z",
                            "updated_at" => "2026-03-06T10:30:00.000000Z"
                        ]
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autorizado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Unauthenticated"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Modelo del producto no encontrado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Modelo del producto no encontrada"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: "Error interno del servidor",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error", 
                            type: "string", 
                            example: "Error al obtener el Modelo del Producto especifico"
                        ),
                        new OA\Property(
                            property: "details", 
                            type: "string"
                        )
                    ]
                )
            )
        ]
    )]
    public function index($product_id)
    {
        try {
            if (!Products::where('product_id', $product_id)->exists()) {
                return response()->json([
                    'message' => 'Producto no encontrado'
                ], 404);
            }

            $models = ProductModel::where('product_id', $product_id)
                ->where('product_model_status', true)
                ->get();

            return response()->json($models, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener modelos',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Get(
        path: "/api/products/{product_id}/models/inactives",
        summary: "Obtener lista de modelos inactivos de un producto",
        description: "Retorna todos los modelos inactivos de un producto específico",
        tags: ["Modelos de Productos"],
        parameters: [
            new OA\Parameter(
                name: "product_id",
                in: "path",
                required: true,
                description: "ID del producto",
                schema: new OA\Schema(
                    type: "integer", 
                    example: 1
                )
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de modelos inactivos obtenida con éxito",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(
                        ref: "#/components/schemas/ProductModel"
                    ),
                    example: [
                        [
                            "product_model_id" => 2,
                            "product_id" => 1,
                            "product_model_name" => "Monitor 1053FPH",
                            "product_model_status" => false,
                            "created_at" => null,
                            "updated_at" => null
                        ]
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autorizado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Unauthenticated"
                        )
                    ]
                )
            ),
             new OA\Response(
                response: 404,
                description: "Modelo del producto no encontrado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Modelo del producto no encontrada"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: "Error interno del servidor",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error", 
                            type: "string", 
                            example: "Error al obtener el Modelo del Producto especifico"
                        ),
                        new OA\Property(
                            property: "details", 
                            type: "string"
                        )
                    ]
                )
            )
        ]
    )]
    public function getInactives($product_id)
    {
        try {
            if (!Products::where('product_id', $product_id)->exists()) {
                return response()->json([
                    'message' => 'Producto no encontrado'
                ], 404);
            }

            $models = ProductModel::where('product_id', $product_id)
                ->where('product_model_status', false)
                ->get();

            return response()->json($models, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener modelos inactivos',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Get(
        path: "/api/products/{product_id}/models/{model_id}",
        summary: "Obtener un modelo específico",
        description: "Retorna los detalles de un modelo de producto",
        tags: ["Modelos de Productos"],
        parameters: [
            new OA\Parameter(
                name: "product_id",
                in: "path",
                required: true,
                description: "ID del producto",
                schema: new OA\Schema(
                    type: "integer", 
                    example: 1
                )
            ),
            new OA\Parameter(
                name: "model_id",
                in: "path",
                required: true,
                description: "ID del modelo",
                schema: new OA\Schema(
                    type: "integer", 
                    example: 1
                )
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Modelo obtenido con éxito",
                content: new OA\JsonContent(
                    ref: "#/components/schemas/ProductModel",
                    example: [
                        [
                            "product_model_id" => 1,
                            "product_id" => 1,
                            "product_model_name" => "SAT PL5005C",
                            "product_model_status" => true,
                            "created_at" => "2026-03-07T05:22:27.284Z",
                            "updated_at" => "2026-03-07T05:22:27.284Z"
                        ]
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autorizado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Unauthenticated"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Producto o modelo no encontrado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Producto o modelo no encontrada"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: "Error interno del servidor",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error", 
                            type: "string", 
                            example: "Error al obtener el Produto y el Modelo especifico"
                        ),
                        new OA\Property(
                            property: "details", 
                            type: "string"
                        )
                    ]
                )
            )
        ]
    )]
    public function show($product_id, $model_id)
    {
        try {
            if (!Products::where('product_id', $product_id)->exists()) {
                return response()->json([
                    'message' => 'Producto no encontrado'
                ], 404);
            }

            $model = ProductModel::where('product_model_id', $model_id)
                ->where('product_id', $product_id)
                ->firstOrFail();

            return response()->json($model, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Modelo no encontrado'
            ], 404);
        }
    }

    #[OA\Post(
        path: "/api/products/{product_id}/models",
        summary: "Crear un nuevo modelo de producto",
        description: "Crea un nuevo modelo con estado activo por defecto",
        tags: ["Modelos de Productos"],
        parameters: [
            new OA\Parameter(
                name: "product_id",
                in: "path",
                required: true,
                description: "ID del producto",
                schema: new OA\Schema(
                    type: "integer", 
                    example: 1
                )
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Datos del nuevo modelo (JSON)",
            content: new OA\JsonContent(
                required: ["product_model_name"],
                properties: [
                    new OA\Property(
                        property: "product_model_name",
                        type: "string",
                        description: "Nombre del modelo",
                        example: "Acrobat"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Modelo creado exitosamente",
                content: new OA\JsonContent(
                    ref: "#/components/schemas/ProductModel",
                    example: [
                        [
                            "product_model_id" => 1,
                            "product_id" => 1,
                            "product_model_name" => "N150",
                            "product_model_status" => true,
                            "created_at" => "2026-03-07T05:55:04.813Z",
                            "updated_at" => "2026-03-07T05:55:04.813Z"
                        ]
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autorizado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Unauthenticated"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Error de validación",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Los datos proporcionados no eran válidos."
                        ),
                        new OA\Property(
                            property: "errors",
                            type: "object",
                            example: [
                                "product_id" => ["El campo de ID de producto es obligatorio."],
                                "product_model_name" => ["El campo del nombre del modulo del producto es obligatorio."]
                            ]
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: "Error interno del servidor",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error", 
                            type: "string", 
                            example: "Error en procesar la petición"
                        ),
                        new OA\Property(
                            property: "details", 
                            type: "string"
                        )
                    ]
                )
            )
        ]
    )]
    public function store(Request $request, $product_id)
    {
        $request->validate([
            'product_model_name' => 'required|string|max:100|unique:products_models,product_model_name'
        ]);

        try {
            if (!Products::where('product_id', $product_id)->exists()) {
                return response()->json([
                    'message' => 'Producto no encontrado'
                ], 404);
            }

            $model = ProductModel::create([
                'product_id' => $product_id,
                'product_model_name' => $request->product_model_name,
                'product_model_status' => true
            ]);

            return response()->json($model, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al crear el modelo',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Put(
        path: "/api/products/{product_id}/models/{model_id}",
        summary: "Actualizar un modelo",
        description: "Actualiza los datos de un modelo existente",
        tags: ["Modelos de Productos"],
        parameters: [
            new OA\Parameter(
                name: "product_id",
                in: "path",
                required: true,
                description: "ID del producto",
                schema: new OA\Schema(type: "integer", example: 1)
            ),
            new OA\Parameter(
                name: "model_id",
                in: "path",
                required: true,
                description: "ID del modelo",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Datos a actualizar (JSON)",
            content: new OA\JsonContent(
                required: ["product_model_name"],
                properties: [
                    new OA\Property(
                        property: "product_model_name",
                        type: "string",
                        example: "N140"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Modelo actualizado exitosamente",
                content: new OA\JsonContent(
                    example: [
                        [
                            "product_model_id" => 1,
                            "product_id" => 1,
                            "product_model_name" => "N140",
                            "product_model_status" => true,
                            "created_at" => null,
                            "updated_at" => "2026-03-07T17:24:27.000000Z"
                        ]
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autorizado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Unauthenticated"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Producto o modelo no encontrado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Producto o modelo no encontrado"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Error de validación",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Los datos proporcionados no eran válidos."
                        ),
                        new OA\Property(
                            property: "errors", 
                            type: "object"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: "Error interno del servidor",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error", 
                            type: "string", 
                            example: "Error en procesar la solicitud"
                        ),
                        new OA\Property(
                            property: "details", 
                            type: "string"
                        )
                    ]
                )
            )
        ]
    )]
    public function update(Request $request, $product_id, $model_id)
    {
        $request->validate([
            'product_model_name' => 'required|string|max:100|unique:products_models,product_model_name,' . $model_id . ',product_model_id'
        ]);

        try {
            if (!Products::where('product_id', $product_id)->exists()) {
                return response()->json([
                    'message' => 'Producto no encontrado'
                ], 404);
            }

            $model = ProductModel::where('product_model_id', $model_id)
                ->where('product_id', $product_id)
                ->firstOrFail();

            $model->update(['product_model_name' => $request->product_model_name]);

            return response()->json($model, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Modelo no encontrado'
            ], 404);
        }
    }

    #[OA\Delete(
        path: "/api/products/{product_id}/models/{model_id}",
        summary: "Eliminar un modelo",
        description: "Elimina un modelo de la base de datos de forma permanente",
        tags: ["Modelos de Productos"],
        parameters: [
            new OA\Parameter(
                name: "product_id",
                in: "path",
                required: true,
                description: "ID del producto",
                schema: new OA\Schema(type: "integer", example: 1)
            ),
            new OA\Parameter(
                name: "model_id",
                in: "path",
                required: true,
                description: "ID del modelo",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Modelo eliminado exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Modelo eliminado"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autorizado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Unauthenticated"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Producto o modelo no encontrado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Producto o Modelo no encontrado"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: "Error interno del servidor",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error", 
                            type: "string", 
                            example: "Error en procesar la solicitud"
                        ),
                        new OA\Property(
                            property: "details", 
                            type: "string"
                        )
                    ]
                )
            )
        ]
    )]
    public function destroy($product_id, $model_id)
    {
        try {
            if (!Products::where('product_id', $product_id)->exists()) {
                return response()->json([
                    'message' => 'Producto no encontrado'
                ], 404);
            }

            $model = ProductModel::where('product_model_id', $model_id)
                ->where('product_id', $product_id)
                ->firstOrFail();

            $model->delete();

            return response()->json(['message' => 'Modelo eliminado'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Modelo no encontrado'
            ], 404);
        }
    }

    #[OA\Patch(
        path: "/api/products/{product_id}/models/{model_id}/toggle",
        summary: "Cambiar el estado de un modelo",
        description: "Alterna el estado de un modelo entre activo e inactivo",
        tags: ["Modelos de Productos"],
        parameters: [
            new OA\Parameter(
                name: "product_id",
                in: "path",
                required: true,
                description: "ID del producto",
                schema: new OA\Schema(
                    type: "integer", 
                    example: 1
                )
            ),
            new OA\Parameter(
                name: "model_id",
                in: "path",
                required: true,
                description: "ID del modelo",
                schema: new OA\Schema(
                    type: "integer", 
                    example: 1
                )
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Estado actualizado con éxito",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string",
                            example: "Estado del model actualizado"
                        ),
                        new OA\Property(
                            property: "product_model_name", 
                            type: "string",
                            example: "N150"
                        ),
                        new OA\Property(
                            property: "new_status", 
                            type: "boolean"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autorizado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Unauthenticated"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 404,
                description: "Producto o modelo no encontrado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error", 
                            type: "string", 
                            example: "No se pudo actualizar el estado"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 500,
                description: "Error interno del servidor",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error", 
                            type: "string", 
                            example: "Error en procesar la solicitud"
                        ),
                        new OA\Property(
                            property: "details", 
                            type: "string"
                        )
                    ]
                )
            )
        ]
    )]
    public function toggleStatus($product_id, $model_id)
    {
        try {
            if (!Products::where('product_id', $product_id)->exists()) {
                return response()->json([
                    'message' => 'Producto no encontrado'
                ], 404);
            }

            $model = ProductModel::where('product_model_id', $model_id)
                ->where('product_id', $product_id)
                ->firstOrFail();

            $model->product_model_status = !$model->product_model_status;
            $model->save();

            return response()->json([
                'message' => 'Estado del modelo actualizado',
                'product_model_name' => $model->product_model_name,
                'new_status' => $model->product_model_status
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo actualizar el estado'], 404);
        }
    }

    #[OA\Post(
        path: "/api/products/models/bulk-upload",
        summary: "Carga masiva de modelos de productos",
        description: "Carga múltiples modelos de diferentes productos desde un archivo CSV o Excel (máximo 5MB). El archivo DEBE contener exactamente estos encabezados en la primera fila: product_id, product_model_name, product_model_status (en minúsculas, sin espacios extra)",
        tags: ["Modelos de Productos"],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Archivo CSV o Excel con los modelos. REQUERIDO: Los encabezados de la primera fila deben ser exactamente: product_id, product_model_name, product_model_status (en minúsculas, sin espacios extra)",
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["file"],
                    properties: [
                        new OA\Property(
                            property: "file",
                            type: "string",
                            format: "binary",
                            description: "Archivo CSV o XLSX (máximo 5MB). ENCABEZADOS REQUERIDOS: product_id, product_model_name, product_model_status"
                        )
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Carga completada exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "Carga de modelos completada"
                        ),
                        new OA\Property(
                            property: "total_processed",
                            type: "integer",
                            description: "Total de filas procesadas",
                            example: 52
                        ),
                        new OA\Property(
                            property: "successful",
                            type: "integer",
                            description: "Modelos creados exitosamente",
                            example: 52
                        ),
                        new OA\Property(
                            property: "failed",
                            type: "integer",
                            description: "Modelos que fallaron",
                            example: 0
                        ),
                        new OA\Property(
                            property: "duplicated_omitted",
                            type: "integer",
                            description: "Modelos omitidos por ser duplicados",
                            example: 0
                        ),
                        new OA\Property(
                            property: "errors",
                            type: "array",
                            description: "Errores encontrados en filas específicas",
                            items: new OA\Items(
                                type: "object",
                                properties: [
                                ]
                            )
                        ),
                        new OA\Property(
                            property: "file_saved",
                            type: "boolean",
                            example: false
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 400,
                description: "Archivo no proporcionado o falta el campo 'file'",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "El campo file es obligatorio"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 401,
                description: "No autorizado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Unauthenticated"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 413,
                description: "Archivo excede el tamaño máximo permitido (5MB)",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message",
                            type: "string",
                            example: "El archivo excede el tamaño máximo de 5MB"
                        ),
                        new OA\Property(
                            property: "max_size",
                            type: "string",
                            example: "5MB"
                        )
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Errores de validación - Encabezados inválidos, formato no soportado o archivo corrupto",
                content: new OA\JsonContent(
                    oneOf: [
                        new OA\Schema(
                            title: "Encabezados inválidos",
                            properties: [
                                new OA\Property(
                                    property: "message",
                                    type: "string",
                                    example: "Encabezados inválidos en el archivo"
                                ),
                                new OA\Property(
                                    property: "expected_headers",
                                    type: "array",
                                    items: new OA\Items(type: "string"),
                                    example: ["product_id", "product_model_name", "product_model_status "]
                                ),
                                new OA\Property(
                                    property: "received_headers",
                                    type: "array",
                                    items: new OA\Items(type: "string"),
                                    example: ["id", "nombre", "estado"]
                                ),
                                new OA\Property(
                                    property: "file_saved",
                                    type: "boolean",
                                    example: false
                                )
                            ]
                        ),
                        new OA\Schema(
                            title: "Formato de archivo no soportado",
                            properties: [
                                new OA\Property(
                                    property: "message",
                                    type: "string",
                                    example: "Formato de archivo no soportado"
                                ),
                                new OA\Property(
                                    property: "supported_formats",
                                    type: "array",
                                    items: new OA\Items(type: "string"),
                                    example: ["CSV", "XLSX", "XLS"]
                                )
                            ]
                        ),
                        new OA\Schema(
                            title: "Archivo corrupto o dañado",
                            properties: [
                                new OA\Property(
                                    property: "message",
                                    type: "string",
                                    example: "Error al procesar el archivo Excel"
                                ),
                                new OA\Property(
                                    property: "error",
                                    type: "string",
                                    example: "Archivo corrupto o dañado"
                                ),
                                new OA\Property(
                                    property: "file_saved",
                                    type: "boolean",
                                    example: false
                                )
                            ]
                        )
                    ]
                )
                
            ),
            new OA\Response(
                response: 500,
                description: "Error interno del servidor",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error",
                            type: "string",
                            example: "Error al procesar el archivo"
                        ),
                        new OA\Property(
                            property: "details",
                            type: "string"
                        )
                    ]
                )
            )
        ]
    )]
    public function bulkUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file'
        ]);

        try {
            $file = $request->file('file');
            $extension = strtolower($file->getClientOriginalExtension());

            if ($extension === 'csv') {
                return $this->uploadFromCSV($file);
            } elseif (in_array($extension, ['xlsx', 'xls'])) {
                return $this->uploadFromExcel($file);
            } else {
                return response()->json([
                    'message' => 'Formato de archivo no soportado',
                    'supported_formats' => ['CSV', 'XLSX', 'XLS']
                ], 422);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al procesar el archivo',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Procesar carga desde archivo CSV para modelos
     */
    private function uploadFromCSV($file)
    {
        $successful = 0;
        $failed = 0;
        $duplicated = 0;
        $errors = [];

        try {
            $filePath = $file->getRealPath();
            $csv = Reader::createFromPath($filePath, 'r');
            $csv->setHeaderOffset(0);

            $expectedHeaders = ['product_id', 'product_model_name', 'product_model_status'];

            $fileHeaders = array_map('strtolower', array_map('trim', $csv->getHeader()));
            
            if ($fileHeaders !== $expectedHeaders) {
                return response()->json([
                    'message' => 'Encabezados inválidos en el archivo',
                    'expected_headers' => $expectedHeaders,
                    'received_headers' => $fileHeaders,
                    'file_saved' => false
                ], 422);
            }

            foreach ($csv->getRecords() as $rowIndex => $record) {
                try {
                    if (empty($record['product_id']) || empty($record['product_model_name'])) {
                        throw new \Exception('Faltan campos requeridos (product_id, product_model_name)');
                    }

                    $productId = (int)$record['product_id'];
                    if (!Products::where('product_id', $productId)->exists()) {
                        throw new \Exception("Producto {$productId} no existe");
                    }

                    $modelName = trim($record['product_model_name']);
                    
                    $exists = ProductModel::where('product_id', $productId)
                        ->where('product_model_name', $modelName)
                        ->exists();

                    if ($exists) {
                        $duplicated++;
                        continue;
                    }

                    ProductModel::create([
                        'product_id' => $productId,
                        'product_model_name' => $modelName,
                        'product_model_status' => isset($record['product_model_status']) && 
                                                in_array(strtolower($record['product_model_status']), ['true', '1', 'activo']) ? true : false
                    ]);

                    $successful++;
                } catch (\Exception $e) {
                    $failed++;
                    $errors[] = [
                        'row' => $rowIndex + 2,
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'message' => 'Carga de modelos completada',
                'total_processed' => $successful + $failed + $duplicated,
                'successful' => $successful,
                'failed' => $failed,
                'duplicated_omitted' => $duplicated,
                'errors' => $errors,
                'file_saved' => false
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al procesar el archivo CSV',
                'error' => $e->getMessage(),
                'file_saved' => false
            ], 422);
        }
    }

    /**
     * Procesar carga desde archivo Excel para modelos
     */
    private function uploadFromExcel($file)
    {
        $successful = 0;
        $failed = 0;
        $duplicated = 0;
        $errors = [];
        $headerRow = null;

        try {
            $filePath = $file->getRealPath();
            $spreadsheet = IOFactory::load($filePath);
            $sheet = $spreadsheet->getActiveSheet();

            $expectedHeaders = ['product_id', 'product_model_name', 'product_model_status'];

            foreach ($sheet->getRowIterator() as $rowIndex => $row) {
                try {
                    $cellIterator = $row->getCellIterator();
                    $cellIterator->setIterateOnlyExistingCells(false);

                    $rowData = [];
                    foreach ($cellIterator as $cell) {
                        $rowData[] = $cell->getValue();
                    }

                    if ($rowIndex === 1) {
                        $headerRow = array_map('strtolower', array_map('trim', $rowData));
                        
                        if ($headerRow !== $expectedHeaders) {
                            return response()->json([
                                'message' => 'Encabezados inválidos en el archivo',
                                'expected_headers' => $expectedHeaders,
                                'received_headers' => $headerRow,
                                'file_saved' => false
                            ], 422);
                        }
                        continue;
                    }

                    $record = array_combine($headerRow, $rowData);
                
                    if (empty($record['product_id']) || empty($record['product_model_name'])) {
                        throw new \Exception('Faltan campos requeridos (product_id, product_model_name)');
                    }

                    $productId = (int)$record['product_id'];
                    if (!Products::where('product_id', $productId)->exists()) {
                        throw new \Exception("Producto {$productId} no existe");
                    }

                    $modelName = trim($record['product_model_name']);
                    
                    $exists = ProductModel::where('product_id', $productId)
                        ->where('product_model_name', $modelName)
                        ->exists();

                    if ($exists) {
                        $duplicated++;
                        continue;
                    }

                    ProductModel::create([
                        'product_id' => $productId,
                        'product_model_name' => $modelName,
                        'product_model_status' => isset($record['product_model_status']) && 
                                                in_array(strtolower($record['product_model_status']), ['true', '1', 'activo']) ? true : false
                    ]);

                    $successful++;
                } catch (\Exception $e) {
                    $failed++;
                    $errors[] = [
                        'row' => $rowIndex,
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'message' => 'Carga de modelos completada',
                'total_processed' => $successful + $failed + $duplicated,
                'successful' => $successful,
                'failed' => $failed,
                'duplicated_omitted' => $duplicated,
                'errors' => $errors,
                'file_saved' => false
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al procesar el archivo Excel',
                'error' => $e->getMessage(),
                'file_saved' => false
            ], 422);
        }
    }
}
