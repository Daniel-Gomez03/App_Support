<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Faqs;
use App\Models\Categories;
use App\Models\Products;
use App\Models\ProductModel;
use OpenApi\Attributes as OA;

class FaqsModelController extends Controller
{
     #[OA\Get(
        path: "/api/faqs",
        summary: "Obtener lista de preguntas frecuentes activas",
        description: "Retorna todas las preguntas frecuentes con estado activo ordenadas por fecha de creación",
        tags: ["Preguntas Frecuentes"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de FAQs obtenida con éxito",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(ref: "#/components/schemas/FAQ"),
                    example: [
                        [
                            "faq_id" => 1,
                            "category_id" => 1,
                            "product_id" => 1,
                            "product_model_id" => 1,
                            "faq_question" => "¿Que sistemas operativos tiene?",
                            "faq_answer" => "Windows, Linux y Android",
                            "faq_video_url" => "https://www.youtube.com/",
                            "faq_status" => true,
                            "created_at" => null,
                            "updated_at" => null,
                            "category" => [
                                "category_id" => 1,
                                "category_name" => "Dispositivos",
                                "category_description" => "Dispositivos tecnológicos disponibles",
                                "category_status" => true,
                                "created_at" => "2026-03-09T14:39:21.000000Z",
                                "updated_at" => "2026-03-09T14:39:21.000000Z"
                            ],
                            "product" => [
                                "product_id" => 1,
                                "category_id" => 1,
                                "product_name" => "All in one",
                                "product_status" => true,
                                "created_at" => "2026-03-09T14:41:21.000000Z",
                                "updated_at" => "2026-03-09T14:41:21.000000Z"
                            ],
                            "product_model" => [
                                "product_model_id" => 1,
                                "product_id" => 1,
                                "product_model_name" => "Hybrid Tablet",
                                "product_model_status" => true,
                                "created_at" => "2026-03-09T14:42:14.000000Z",
                                "updated_at" => "2026-03-09T14:42:14.000000Z"
                            ],
                            "attachments" => []
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
                            example: "Error al obtener las preguntas frecuentes"
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
            $faqs = Faqs::where('faq_status', true)
                ->with(['category', 'product', 'productModel',])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($faqs, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener FAQs',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Get(
        path: "/api/faqs/inactives",
        summary: "Obtener lista de preguntas frecuentes inactivas",
        description: "Retorna todas las preguntas frecuentes con estado inactivo",
        tags: ["Preguntas Frecuentes"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de FAQs inactivas obtenida con éxito",
                content: new OA\JsonContent(
                    type: "array",
                    items: new OA\Items(ref: "#/components/schemas/FAQ"),
                    example: [
                        [
                            "faq_id" => 1,
                            "category_id" => 1,
                            "product_id" => 1,
                            "product_model_id" => 1,
                            "faq_question" => "¿Que sistemas operativos tiene?",
                            "faq_answer" => "Windows, Linux y Android",
                            "faq_video_url" => "https://www.youtube.com/",
                            "faq_status" => false,
                            "created_at" => null,
                            "updated_at" => null,
                            "category" => [
                                "category_id" => 1,
                                "category_name" => "Dispositivos",
                                "category_description" => "Dispositivos tecnológicos disponibles",
                                "category_status" => true,
                                "created_at" => "2026-03-09T14:39:21.000000Z",
                                "updated_at" => "2026-03-09T14:39:21.000000Z"
                            ],
                            "product" => [
                            "product_id" => 1,
                            "category_id" => 1,
                                "product_name" => "All in one",
                                "product_status" => true,
                                "created_at" => "2026-03-09T14:41:21.000000Z",
                                "updated_at" => "2026-03-09T14:41:21.000000Z"
                            ],
                            "product_model" => [
                            "product_model_id" => 1,
                            "product_id" => 1,
                                "product_model_name" => "Hybrid Tablet",
                                "product_model_status" => true,
                                "created_at" => "2026-03-09T14:42:14.000000Z",
                                "updated_at" => "2026-03-09T14:42:14.000000Z"
                            ],
                            "attachments" => []
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
                            example: "Error al obtener las preguntas frecuentes inactivas"
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
            $faqs = Faqs::where('faq_status', false)
                ->with(['category', 'product', 'productModel',])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($faqs, 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener FAQs inactivas',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Get(
        path: "/api/faqs/{id}",
        summary: "Obtener una pregunta frecuente específica",
        description: "Retorna los detalles de una pregunta frecuente por su ID",
        tags: ["Preguntas Frecuentes"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID de la pregunta frecuente",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "FAQ obtenida con éxito",
                content: new OA\JsonContent(
                    ref: "#/components/schemas/FAQ",
                    example: [
                        [
                            "faq_id" => 1,
                            "category_id" => 1,
                            "product_id" => 1,
                            "product_model_id" => 1,
                            "faq_question" => "¿Que sistemas operativos tiene?",
                            "faq_answer" => "Windows, Linux y Android",
                            "faq_video_url" => "https://www.youtube.com/",
                            "faq_status" => false,
                            "created_at" => null,
                            "updated_at" => null,
                            "category" => [
                                "category_id" => 1,
                                "category_name" => "Dispositivos",
                                "category_description" => "Dispositivos tecnológicos disponibles",
                                "category_status" => true,
                                "created_at" => "2026-03-09T14:39:21.000000Z",
                                "updated_at" => "2026-03-09T14:39:21.000000Z"
                            ],
                            "product" => [
                                "product_id" => 1,
                                "category_id" => 1,
                                "product_name" => "All in one",
                                "product_status" => true,
                                "created_at" => "2026-03-09T14:41:21.000000Z",
                                "updated_at" => "2026-03-09T14:41:21.000000Z"
                            ],
                            "product_model" => [
                                "product_model_id"=> 1,
                                "product_id" => 1,
                                "product_model_name" => "Hybrid Tablet",
                                "product_model_status" => true,
                                "created_at" => "2026-03-09T14:42:14.000000Z",
                                "updated_at" => "2026-03-09T14:42:14.000000Z"
                            ],
                            "attachments" => []
                        ]
                    ]
                ),
                
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
                description: "FAQ no encontrada",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "FAQ no encontrada"
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
                            example: "Error al obtener la pregunta frecuente especifico"
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
            $faq = Faqs::with(['category', 'product', 'productModel',])
                ->findOrFail($id);

            return response()->json($faq, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'FAQ no encontrada'
            ], 404);
        }
    }

    #[OA\Post(
        path: "/api/faqs",
        summary: "Crear una nueva pregunta frecuente",
        description: "Crea una nueva pregunta frecuente con estado activo por defecto",
        tags: ["Preguntas Frecuentes"],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Datos de la nueva pregunta frecuente (JSON)",
            content: new OA\JsonContent(
                required: ["category_id", "product_id", "product_model_id", "faq_question", "faq_answer", "faq_video_url"],
                properties: [
                    new OA\Property(
                        property: "category_id",
                        type: "integer",
                        description: "ID de la categoría",
                        example: 1
                    ),
                    new OA\Property(
                        property: "product_id",
                        type: "integer",
                        description: "ID del producto",
                        example: 1
                    ),
                    new OA\Property(
                        property: "product_model_id",
                        type: "integer",
                        description: "ID del modelo del producto",
                        example: 1
                    ),
                    new OA\Property(
                        property: "faq_question",
                        type: "string",
                        description: "Pregunta frecuente",
                        example: "¿Cómo reiniciar el dispositivo?"
                    ),
                    new OA\Property(
                        property: "faq_answer",
                        type: "string",
                        description: "Respuesta a la pregunta",
                        example: "Mantenga presionado el botón de encendido durante 10 segundos..."
                    ),
                    new OA\Property(
                        property:"faq_video_url",
                        type: "string",
                        description: "URL del video",
                        example: "https://www.youtube.com/"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "FAQ creada exitosamente",
                content: new OA\JsonContent(
                    ref: "#/components/schemas/FAQ",
                    example: [
                        [
                            "category_id "=> 1,
                            "product_id" => 1,
                            "product_model_id" => 1,
                            "faq_question" => "¿Cómo reiniciar el dispositivo?",
                            "faq_answer" => "Mantenga presionado el botón de encendido durante 10 segundos...",
                            "faq_video_url"=> "https://www.youtube.com/",
                            "faq_status" => true,
                            "updated_at" => "2026-03-09T15:40:43.000000Z",
                            "created_at" => "2026-03-09T15:40:43.000000Z",
                            "faq_id" => 2,
                            "category" => [
                                "category_id" => 1,
                                "category_name" => "Dispositivos",
                                "category_description" => "Dispositivos tecnológicos disponibles",
                                "category_status" => true,
                                "created_at" => "2026-03-09T14:39:21.000000Z",
                                "updated_at" => "2026-03-09T14:39:21.000000Z"
                            ],
                            "product" => [
                                "product_id" => 1,
                                "category_id" => 1,
                                "product_name" => "All in one",
                                "product_status" => true,
                                "created_at" => "2026-03-09T14:41:21.000000Z",
                                "updated_at" => "2026-03-09T14:41:21.000000Z"
                            ],
                            "product_model" => [
                                "product_model_id" => 1,
                                "product_id" => 1,
                                "product_model_name" => "Hybrid Tablet",
                                "product_model_status" => true,
                                "created_at" => "2026-03-09T14:42:14.000000Z",
                                "updated_at" => "2026-03-09T14:42:14.000000Z"
                            ],
                            "attachments" => []
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
                                "category_id" => ["El campo de ID de categoria es obligatorio."],
                                "product_id" => ["El campo de ID de producto es obligatorio."],
                                "product_model_id" => ["El campo ID del producto de modelo es obligatorio"],
                                "faq_question" => ["El campo del nombre de la pregunta es obligatorio."],
                                "faq_answer" => ["El campo de la respuesta de la pregunta es obligatoria."],
                                "faq_video_url" => ["El campo del video es obligatorio"]
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
            'product_id' => 'required|integer|exists:products,product_id',
            'product_model_id' => 'required|integer|exists:products_models,product_model_id',
            'faq_question' => 'required|string|max:255',
            'faq_answer' => 'required|string',
            'faq_video_url'=> 'required|string|url'
        ]);

        try {
            $faq = Faqs::create([
                'category_id' => $request->category_id,
                'product_id' => $request->product_id,
                'product_model_id' => $request->product_model_id,
                'faq_question' => $request->faq_question,
                'faq_answer' => $request->faq_answer,
                'faq_video_url' => $request->faq_video_url,
                'faq_status' => true
            ]);

            return response()->json($faq->load(['category', 'product', 'productModel']), 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al crear la FAQ',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[OA\Put(
        path: "/api/faqs/{id}",
        summary: "Actualizar una pregunta frecuente",
        description: "Actualiza los datos de una pregunta frecuente existente",
        tags: ["Preguntas Frecuentes"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID de la pregunta frecuente",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Datos a actualizar (JSON)",
            content: new OA\JsonContent(
                required: ["category_id", "product_id", "product_model_id", "faq_question", "faq_answer", "faq_video_url"],
                properties: [
                    new OA\Property(
                        property: "category_id",
                        type: "integer",
                        example: 1
                    ),
                    new OA\Property(
                        property: "product_id",
                        type: "integer",
                        example: 1
                    ),
                    new OA\Property(
                        property: "product_model_id",
                        type: "integer",
                        example: 1
                    ),
                    new OA\Property(
                        property: "faq_question",
                        type: "string",
                        example: "¿Cómo reiniciar el dispositivo?"
                    ),
                    new OA\Property(
                        property: "faq_answer",
                        type: "string",
                        example: "Mantenga presionado el botón de encendido..."
                    ),
                    new OA\Property(
                        property:"faq_video_url",
                        type: "string",
                        description: "URL del video",
                        example: "https://www.youtube.com/"
                    )
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "FAQ actualizada exitosamente",
                content: new OA\JsonContent(
                    example:[
                        [
                            "faq_id" => 1,
                            "category_id" => 1,
                            "product_id" => 1,
                            "product_model_id" => 1,
                            "faq_question" => "¿Cómo reiniciar el dispositivo?",
                            "faq_answer" => "Mantenga presionado el botón de encendido...",
                            "faq_video_url"=> "https://www.youtube.com/",
                            "faq_status" => false,
                            "created_at" => null,
                            "updated_at" => "2026-03-09T15:57:21.000000Z",
                            "category" => [
                                "category_id" => 1,
                                "category_name" => "Dispositivos",
                                "category_description" => "Dispositivos tecnológicos disponibles",
                                "category_status" => true,
                                "created_at" => "2026-03-09T14:39:21.000000Z",
                                "updated_at" => "2026-03-09T14:39:21.000000Z"
                            ],
                            "product" => [
                                "product_id" => 1,
                                "category_id" => 1,
                                "product_name" => "All in one",
                                "product_status" => true,
                                "created_at" => "2026-03-09T14:41:21.000000Z",
                                "updated_at" => "2026-03-09T14:41:21.000000Z"
                            ],
                            "product_model"=> [
                                "product_model_id" => 1,
                                "product_id" => 1,
                                "product_model_name" => "Hybrid Tablet",
                                "product_model_status" => true,
                                "created_at" => "2026-03-09T14:42:14.000000Z",
                                "updated_at" => "2026-03-09T14:42:14.000000Z"
                            ],
                            "attachments" => []
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
                description: "FAQ no encontrada",
                 content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "FAQ no encontrada"
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
            'product_id' => 'required|integer|exists:products,product_id',
            'product_model_id' => 'required|integer|exists:products_models,product_model_id',
            'faq_question' => 'required|string|max:255',
            'faq_answer' => 'required|string',
            'faq_video_url'=> 'required|string|url'
        ]);

        try {
            $faq = Faqs::findOrFail($id);
            $faq->update($request->only('category_id', 'product_id', 'product_model_id', 'faq_question', 'faq_answer', "faq_video_url"));

            return response()->json($faq->load(['category', 'product', 'productModel',]), 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'FAQ no encontrada'
            ], 404);
        }
    }

    #[OA\Delete(
        path: "/api/faqs/{id}",
        summary: "Eliminar una pregunta frecuente",
        description: "Elimina una pregunta frecuente de la base de datos de forma permanente",
        tags: ["Preguntas Frecuentes"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID de la pregunta frecuente",
                schema: new OA\Schema(type: "integer", example: 1)
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "FAQ eliminada exitosamente",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "FAQ eliminada existosamente"
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
                description: "FAQ no encontrada",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "message", 
                            type: "string", 
                            example: "FAQ no encontrada"
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
            $faq = Faqs::findOrFail($id);
            $faq->delete();

            return response()->json(['message' => 'FAQ eliminada'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'FAQ no encontrada'
            ], 404);
        }
    }

    #[OA\Patch(
        path: "/api/faqs/{id}/toggle",
        summary: "Cambiar el estado de una pregunta frecuente",
        description: "Alterna el estado de una pregunta frecuente entre activa e inactiva",
        tags: ["Preguntas Frecuentes"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID de la pregunta frecuente",
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
                            example: "Estado de la FAQ actualizado"
                        ),
                        new OA\Property(
                            property: "faq_question", 
                            type: "string",
                            example: "¿Cómo reiniciar el dispositivo?"
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
                description: "FAQ no encontrada",
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
            $faq = Faqs::findOrFail($id);
            $faq->faq_status = !$faq->faq_status;
            $faq->save();

            return response()->json([
                'message' => 'Estado de la FAQ actualizado',
                'faq_question' => $faq->faq_question,
                'new_status' => $faq->faq_status
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo actualizar el estado'], 404);
        }
    }
}