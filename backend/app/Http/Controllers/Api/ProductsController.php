<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Products;
use App\Models\Categories;
use OpenApi\Attributes as OA;
use League\Csv\Reader;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ProductsController extends Controller
{
    #[OA\Get(
        path: "/api/products",
        summary: "Obtener lista de productos activos",
        description: "Retorna todos los productos con estado activo ordenados por nombre",
        tags: ["Productos"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de productos obtenida con éxito",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(ref: "#/components/schemas/Products"),
                    example: [
                        [
                            "product_id" => 30,
                            "category_id" => 1,
                            "product_name" => "ALl in One",
                            "product_status" => true,
                            "created_at" => "2026-03-05T22:57:45.000000Z",
                            "updated_at" => "2026-03-05T22:57:45.000000Z",
                            "category"=> [
                                "category_id" => 11,
                                "category_name" => "Dispositivos",
                                "category_description" => "Dispositivos tecnológicos disponibles",
                                "category_status"=> true,
                                "created_at" => "2026-03-05T20:23:21.000000Z",
                                "updated_at" => "2026-03-05T20:37:23.000000Z"
                            ] 
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
                response: 500,
                description: "Error interno del servidor",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error", 
                            type: "string", 
                            example: "Error al obtener los productos"
                        ),
                        new OA\Property(
                            property: "details", 
                            type: "string", 
                            example: "Database connection error"
                        )
                    ]
                )
            )
        ]
    )]
    public function index()
    {
        try {
            $products = Products::where('product_status', true)
                ->with('category')
                ->get();

            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener productos',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Get(
        path: "/api/products/inactives",
        summary: "Obtener lista de productos inactivos",
        description: "Retorna todos los productos con estado inactivo",
        tags: ["Productos"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de productos inactivos obtenida con éxito",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(ref: "#/components/schemas/Products"), 
                    example: [
                        [
                            "product_id" => 9,
                            "category_id" => 1,
                            "product_name" => "Impresoras",
                            "product_status" => false,
                            "created_at" => "2026-03-05T23:19:48.000000Z",
                            "updated_at" => "2026-03-05T23:19:48.000000Z",
                            "category" => [
                                "category_id" => 1,
                                "category_name" => "Dispositivos",
                                "category_description" => "Dispositivos tecnológicos disponibles",
                                "category_status" => true,
                                "created_at" => "2026-03-05T20:23:21.000000Z",
                                "updated_at" => "2026-03-05T20:37:23.000000Z"
                            ]
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
                response: 500,
                description: "Error interno del servidor",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "error", 
                            type: "string", 
                            example: "Error al obtener los Productos inactivas"
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
    public function getInactives()
    {
        try {
            $products = Products::where('product_status', false)
                ->with('category')
                ->get();

            return response()->json($products, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener productos inactivos',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Get(
        path: "/api/products/{id}",
        summary: "Obtener un producto específico",
        description: "Retorna los detalles de un producto por su ID",
        tags: ["Productos"],
        parameters: [
            new OA\Parameter(
                name: "id",
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
                description: "Producto obtenido con éxito",
                content: new OA\JsonContent(
                    ref: "#/components/schemas/Products",
                    example: [
                        [
                            "product_id" => 1,
                            "category_id" => 12,
                            "product_name" => "Computadoras Moviles",
                            "product_status" => true,
                            "created_at" => "2026-03-05T22:57:45.000000Z",
                            "updated_at" => "2026-03-05T22:57:45.000000Z",
                            "category" => [
                                "category_id" => 1,
                                "category_name" => "Dispositivos",
                                "category_description" => "Dispositivos tecnológicos disponibles",
                                "category_status" => true,
                                "created_at" => "2026-03-05T20:23:21.000000Z",
                                "updated_at" => "2026-03-05T20:37:23.000000Z"
                            ]
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
                description: "Categoría no encontrada",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Categoria no encontrada"
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
                            example: "Error al obtener el Produto especifico"
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
    public function show($id)
    {
        try {
            $product = Products::with('category')->findOrFail($id);
            return response()->json($product, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Producto no encontrado'
            ], 404);
        }
    }

    #[OA\Post(
        path: "/api/products",
        summary: "Crear un nuevo producto",
        description: "Crea un nuevo producto con estado activo por defecto",
        tags: ["Productos"],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Datos del nuevo producto (JSON)",
            content: new OA\JsonContent(
                required: ["category_id", "product_name"],
                properties: [
                    new OA\Property(
                        property: "category_id",
                        type: "integer",
                        description: "ID de la categoría",
                        example: 1
                    ),
                    new OA\Property(
                        property: "product_name",
                        type: "string",
                        description: "Nombre del producto",
                        example: "Mini PC'S"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Producto creado exitosamente",
                content: new OA\JsonContent(
                    ref: "#/components/schemas/Products",
                    example: [
                        [
                            "category_id" => 1,
                            "product_name" => "UPS",
                            "product_status" => true,
                            "updated_at" => "2026-03-06T15:34:51.000000Z",
                            "created_at" => "2026-03-06T15:34:51.000000Z",
                            "product_id" => 12,
                            "category" => [
                                "category_id" => 1,
                                "category_name" => "Dispositivos",
                                "category_description" => "Dispositivos tecnológicos disponibles",
                                "category_status" => true,
                                "created_at" => "2026-03-05T20:23:21.000000Z",
                                "updated_at" => "2026-03-05T20:37:23.000000Z"
                            ]
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
                                "category_id" => ["El campo de ID de categoria es obligatorio.", "El ID de la categoria ya está tomado."],
                                "product_name" => ["El campo del nombre del producto es obligatorio."]
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
    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|integer|exists:categories,category_id',
            'product_name' => 'required|string|max:100'
        ]);

        try {
            $product = Products::create([
                'category_id' => $request->category_id,
                'product_name' => $request->product_name,
                'product_status' => true
            ]);

            return response()->json($product->load('category'), 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al crear el producto',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Put(
        path: "/api/products/{id}",
        summary: "Actualizar un producto",
        description: "Actualiza los datos de un producto existente",
        tags: ["Productos"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID del producto",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Datos a actualizar (JSON)",
            content: new OA\JsonContent(
                required: ["category_id", "product_name"],
                properties: [
                    new OA\Property(
                        property: "category_id",
                        type: "integer",
                        example: 1
                    ),
                    new OA\Property(
                        property: "product_name",
                        type: "string",
                        example: "Escaneres y Soluciones"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Producto actualizado exitosamente",
                content: new OA\JsonContent(
                    example: [
                        [
                            "product_id" => 1,
                            "category_id" => 1,
                            "product_name" => "Cajones Monederos",
                            "product_status" => true,
                            "created_at" => "2026-03-06T16:31:24.000000Z",
                            "updated_at" => "2026-03-06T17:41:29.000000Z",
                            "category" => [
                                "category_id" => 1,
                                "category_name" => "Dispositivos",
                                "category_description" => "Dispositivos tecnológicos disponibles",
                                "category_status" => true,
                                "created_at" => "2026-03-06T16:10:46.000000Z",
                                "updated_at" => "2026-03-06T16:13:57.000000Z"
                            ]
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
                description: "Producto no encontrada",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Producto no encontrada"
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
    public function update(Request $request, $id)
    {
        $request->validate([
            'category_id' => 'required|integer|exists:categories,category_id',
            'product_name' => 'required|string|max:100'
        ]);

        try {
            $product = Products::findOrFail($id);
            $product->update($request->only('category_id', 'product_name'));

            return response()->json($product->load('category'), 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Producto no encontrado'
            ], 404);
        }
    }

    #[OA\Delete(
        path: "/api/products/{id}",
        summary: "Eliminar un producto",
        description: "Elimina un producto de la base de datos de forma permanente",
        tags: ["Productos"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID del producto",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Producto eliminado exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Producto eliminado"
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
                description: "Producto no encontrado",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Producto no encontrada"
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
    public function destroy($id)
    {
        try {
            $product = Products::findOrFail($id);
            $product->delete();

            return response()->json(['message' => 'Producto eliminado'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Producto no encontrado'
            ], 404);
        }
    }

    #[OA\Patch(
        path: "/api/products/{id}/toggle",
        summary: "Cambiar el estado de un producto",
        description: "Alterna el estado de un producto entre activo e inactivo",
        tags: ["Productos"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID del producto",
                schema: new OA\Schema(type: "integer", example: 1)
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
                            example: "Estado del producto actualizado"
                        ),
                        new OA\Property(
                            property: "product_name", 
                            type: "string", 
                            example: "UPS"
                        ),
                        new OA\Property(
                            property: "new_status", 
                            type: "boolean", 
                            example: false
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
                description: "Producto no encontrada",
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
                            example: "Error al obtener el producto  especifico"
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
    public function toggleStatus($id)
    {
        try {
            $product = Products::findOrFail($id);
            $product->product_status = !$product->product_status;
            $product->save();

            return response()->json([
                'message' => 'Estado del producto actualizado',
                'product_name' => $product->product_name,
                'new_status' => $product->product_status
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo actualizar el estado'], 404);
        }
    }

    #[OA\Post(
        path: "/api/products/bulk-upload",
        summary: "Carga masiva de productos",
        description: "Archivo CSV o Excel con los productos. REQUERIDO: Los encabezados de la primera fila deben ser exactamente: category_id, product_name, product_status (en minúsculas, sin espacios extra)",
        tags: ["Productos"],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Archivo CSV o Excel con los productos",
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["file"],
                    properties: [
                        new OA\Property(
                            property: "file",
                            type: "string",
                            format: "binary",
                            description: "Archivo CSV o XLSX (máximo 5MB)"
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
                            example: "Carga de productos completada"
                        ),
                        new OA\Property(
                            property: "total_processed",
                            type: "integer",
                            description: "Total de filas procesadas",
                            example: 150
                        ),
                        new OA\Property(
                            property: "successful",
                            type: "integer",
                            description: "Productos creados exitosamente",
                            example: 120
                        ),
                        new OA\Property(
                            property: "failed",
                            type: "integer",
                            description: "Productos que fallaron",
                            example: 10
                        ),
                        new OA\Property(
                            property: "duplicated_omitted",
                            type: "integer",
                            description: "Productos omitidos por ser duplicados",
                            example: 20
                        ),
                        new OA\Property(
                            property: "errors",
                            type: "array",
                            description: "Errores encontrados en filas específicas",
                            items: new OA\Items(
                                type: "object",
                                properties: [
                                    new OA\Property(property: "row", type: "integer", example: 5),
                                    new OA\Property(property: "error", type: "string", example: "Categoría 99 no existe")
                                ]
                            ),
                            example: [
                                [
                                    "row" => 5,
                                    "error" => "Categoría 99 no existe"
                                ],
                                [
                                    "row" => 12,
                                    "error" => "Faltan campos requeridos (category_id, product_name)"
                                ]
                            ]
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
                description: "Errores de validación",
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
                                    example: ["category_id", "product_name", "product_status"]
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
     * Procesar carga desde archivo CSV
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

            $expectedHeaders = ['category_id', 'product_name', 'product_status'];

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
                    if (empty($record['category_id']) || empty($record['product_name'])) {
                        throw new \Exception('Faltan campos requeridos (category_id, product_name)');
                    }

                    $categoryId = (int)$record['category_id'];
                    if (!Categories::where('category_id', $categoryId)->exists()) {
                        throw new \Exception("Categoría {$categoryId} no existe");
                    }

                    $productName = trim($record['product_name']);
                    $exists = Products::where('category_id', $categoryId)
                        ->where('product_name', $productName)
                        ->exists();

                    if ($exists) {
                        $duplicated++;
                        continue;
                    }

                    Products::create([
                        'category_id' => $categoryId,
                        'product_name' => $productName,
                        'product_status' => isset($record['product_status']) && 
                                        in_array(strtolower($record['product_status']), ['true', '1', 'activo']) ? true : false
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
                'message' => 'Carga de productos completada',
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

            $expectedHeaders = ['category_id', 'product_name', 'product_status'];

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

                    if (empty($record['category_id']) || empty($record['product_name'])) {
                        throw new \Exception('Faltan campos requeridos (category_id, product_name)');
                    }

                    $categoryId = (int)$record['category_id'];
                    if (!Categories::where('category_id', $categoryId)->exists()) {
                        throw new \Exception("Categoría {$categoryId} no existe");
                    }

                    $productName = trim($record['product_name']);
                    $exists = Products::where('category_id', $categoryId)
                        ->where('product_name', $productName)
                        ->exists();

                    if ($exists) {
                        $duplicated++;
                        continue;
                    }

                    Products::create([
                        'category_id' => $categoryId,
                        'product_name' => $productName,
                        'product_status' => isset($record['product_status']) && 
                                        in_array(strtolower($record['product_status']), ['true', '1', 'activo']) ? true : false
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
                'message' => 'Carga de productos completada',
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