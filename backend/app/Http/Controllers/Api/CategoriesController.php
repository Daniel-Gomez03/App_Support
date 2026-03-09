<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Categories;
use OpenApi\Attributes as OA;

class CategoriesController extends Controller
{
    #[OA\Get(
        path: "/api/categories",
        summary: "Obtener lista de categorías activas",
        description: "Retorna todas las categorías con estado activo ordenadas alfabéticamente",
        tags: ["Categorías"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de categorías obtenidas con éxito",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(ref: "#/components/schemas/Categories"),
                    example: [
                        [
                            "category_id" => 2,
                            "category_name" => "Soluciones",
                            "category_description" => "Soluciones tecnologicas disponibles",
                            "category_status" => true,
                            "created_at" => "2026-03-05T10:30:00.000000Z",
                            "updated_at" => "2026-03-05T10:30:00.000000Z"
                        ],
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
                            example: "Error al obtener categorías"
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
            $categories = Categories::where('category_status', true)
                ->get();

            return response()->json($categories, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener categorías',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Get(
        path: "/api/categories/inactives",
        summary: "Obtener lista de categorías inactivas",
        description: "Retorna todas las categorías con estado inactivo ordenadas alfabéticamente",
        tags: ["Categorías"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de categorías inactivas obtenidas con éxito",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(ref: "#/components/schemas/Categories"),
                    example: [
                        [
                            "category_id" => 3,
                            "category_name" => "Servicios",
                            "category_description" => "Servicios de reparación",
                            "category_status" => false,
                            "created_at" => "2026-03-05T10:30:00.000000Z",
                            "updated_at" => "2026-03-05T10:30:00.000000Z"
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
                            example: "Categoría no encontrada"
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
                            example: "Error al obtener categorías inactivas"
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
            $categories = Categories::where('category_status', false)
                ->get();

            return response()->json($categories, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener categorías inactivas',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Get(
        path: "/api/categories/{id}",
        summary: "Obtener una categoría específica",
        description: "Retorna los detalles de una categoría por su ID",
        tags: ["Categorías"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID de la categoría",
                schema: new OA\Schema(
                    type: "integer", 
                    example: 1
                )
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Categoría obtenida con éxito",
                content: new OA\JsonContent(
                    ref: "#/components/schemas/Categories",
                    example: [
                        "category_id" => 1,
                        "category_name" => "Dispositivos",
                        "category_description" => "Productos tecnologicos de la empresa",
                        "category_status" => true,
                        "created_at" => "2026-03-05T10:30:00.000000Z",
                        "updated_at" => "2026-03-05T10:30:00.000000Z"
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
                            example: "Categoría no encontrada"
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
                            example: "Error al obtener la Categoria especifico"
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
            $category = Categories::findOrFail($id);
            return response()->json($category, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Categoría no encontrada'
            ], 404);
        }
    }

    #[OA\Patch(
        path: "/api/categories/{id}/toggle",
        summary: "Cambiar el estado de una categoría (Activar/Desactivar)",
        description: "Alterna el estado de una categoría entre activa e inactiva",
        tags: ["Categorías"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID de la categoría",
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
                            example: "Estado de la categoría actualizado"
                        ),
                        new OA\Property(
                            property: "category_name", 
                            type: "string", 
                            example: "Software"
                        ),
                        new OA\Property(
                            property: "category_description", 
                            type: "string", 
                            example: "Categoría para productos de software"
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
                description: "Categoría no encontrada",
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
                            example: "Error al obtener la Categoria especifico"
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
            $category = Categories::findOrFail($id);
            $category->category_status = !$category->category_status;
            $category->save();

            return response()->json([
                'message' => 'Estado de la categoría actualizado',
                'category_name' => $category->category_name,
                'category_description' => $category->category_description,
                'new_status' => $category->category_status
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo actualizar el estado'], 404);
        }
    }

    #[OA\Post(
        path: "/api/categories",
        summary: "Crear una nueva categoría",
        description: "Crea una nueva categoría con estado activo por defecto",
        tags: ["Categorías"],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Datos de la nueva categoría (JSON)",
            content: new OA\JsonContent(
                required: ["category_name", "category_description"],
                properties: [
                    new OA\Property(
                        property: "category_name",
                        type: "string",
                        description: "Nombre de la categoría (debe ser único)",
                        example: "Sistemas"
                    ),
                    new OA\Property(
                        property: "category_description",
                        type: "string",
                        description: "Descripción de la categoría",
                        example: "Sistemas para productos de software"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Categoría creada exitosamente",
                content: new OA\JsonContent(
                    ref: "#/components/schemas/Categories",
                    example: [
                        "category_id" => 4,
                        "category_name" => "Sistemas",
                        "category_description" => "Sistemas para productos de software",
                        "category_status" => true,
                        "created_at" => "2026-03-05T15:45:00.000000Z",
                        "updated_at" => "2026-03-05T15:45:00.000000Z"
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
                                "category_name" => ["El campo de nombre de categoría es obligatorio.", "El nombre de la categoría ya está tomado."],
                                "category_description" => ["El campo de descripción de categoría es obligatorio."]
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
            'category_name' => 'required|string|max:50|unique:categories,category_name',
            'category_description' => 'required|string|max:50'
        ]);
        
        $category = Categories::create([
            'category_name' => $request->category_name,
            'category_description' => $request->category_description,
            'category_status' => true
        ]);
        
        return response()->json($category, 201);
    }

    #[OA\Put(
        path: "/api/categories/{id}",
        summary: "Actualizar una categoría",
        description: "Actualiza el nombre y descripción de una categoría existente",
        tags: ["Categorías"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID de la categoría",
                schema: new OA\Schema(
                    type: "integer", 
                    example: 1
                )
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Datos a actualizar (JSON)",
            content: new OA\JsonContent(
                required: ["category_name", "category_description"],
                properties: [
                    new OA\Property(
                        property: "category_name",
                        type: "string",
                        description: "Nuevo nombre de la categoría",
                        example: "Servicio Actualizado"
                    ),
                    new OA\Property(
                        property: "category_description",
                        type: "string",
                        description: "Nueva descripción de la categoría",
                        example: "Descripción actualizada de sistemas"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Categoría actualizada exitosamente",
                content: new OA\JsonContent(
                    ref: "#/components/schemas/Categories",
                    example: [
                        "category_id" => 1,
                        "category_name" => "Servicio Actualizado",
                        "category_description" => "Descripción actualizada de sistemas",
                        "category_status" => true,
                        "created_at" => "2026-03-05T10:30:00.000000Z",
                        "updated_at" => "2026-03-05T16:00:00.000000Z"
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
                            example: "Categoría no encontrada"
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
        try {
            $request->validate([
                'category_name' => 'required|string|max:50|unique:categories,category_name,' . $id . ',category_id',
                'category_description' => 'required|string|max:50'
            ]);

            $category = Categories::findOrFail($id);
            $category->update($request->only('category_name', 'category_description'));
            
            return response()->json($category, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Categoría no encontrada'
            ], 404);
        }
    }

    #[OA\Delete(
        path: "/api/categories/{id}",
        summary: "Eliminar una categoría",
        description: "Elimina una categoría de la base de datos de forma permanente",
        tags: ["Categorías"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID de la categoría",
                schema: new OA\Schema(
                    type: "integer", 
                    example: 1
                )
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Categoría eliminada exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Categoría eliminada"
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
                description: "Categoría no encontrada",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "Categoría no encontrada"
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
            $category = Categories::findOrFail($id);
            $category->delete();
            
            return response()->json(['message' => 'Categoría eliminada'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Categoría no encontrada'
            ], 404);
        }
    }
}