<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;
use App\Models\Tickets;
use App\Events\TicketCreated;
use App\Models\TicketEvidence;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TicketsController extends Controller
{
    #[OA\Get(
        path: "/api/tickets",
        summary: "Obtiene todos los tickets",
        tags: ["Tickets"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de tickets con relaciones",
            ),
        ]
    )]
    public function index () {
        $tickets = Tickets::with(['customer', 'category', 'model', 'status'])->get();
        return response()->json($tickets);
    }

    #[OA\Post(
        path: "/api/tickets",
        summary: "Crea un ticket, guarda evidencias y notifica por Reverb",
        tags: ["Tickets"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["customer_id", "category_id", "ticket_subject", "ticket_description", "ticket_invoice_number"],
                    properties: [
                        new OA\Property(property: "customer_id", type: "integer"),
                        new OA\Property(property: "category_id", type: "integer"),
                        new OA\Property(property: "product_model_id", type: "integer", nullable: true),
                        new OA\Property(property: "ticket_subject", type: "string"),
                        new OA\Property(property: "ticket_description", type: "string"),
                        new OA\Property(property: "ticket_invoice_number", type: "string"),
                        new OA\Property(property: "ticket_serial_number", type: "string", nullable: true),
                        new OA\Property(
                            property: "evidences[]", 
                            type: "array", 
                            items: new OA\Items(type: "string", format: "binary")
                        )
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Ticket creado y transmitido"),
            new OA\Response(response: 422, description: "Error de validación"),
        ]
    )]

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id'           => 'required|exists:customers,customer_id',
            'category_id'           => 'required|exists:categories,category_id',
            'product_model_id'      => 'nullable|exists:products_models,product_model_id',
            'ticket_subject'        => 'required|string|max:255',
            'ticket_description'    => 'required|string',
            'ticket_invoice_number' => 'required|string|max:50',
            'ticket_serial_number'  => 'nullable|string|max:50',
            'evidences.*'           => 'nullable|file|max:15360', // Limite de 15MB por archivo
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $ticket = DB::transaction(function () use ($request) {
                $newTicket = Tickets::create([
                    'customer_id'           => $request->customer_id,
                    'category_id'           => $request->category_id,
                    'product_model_id'      => $request->product_model_id,
                    'ticket_subject'        => $request->ticket_subject,
                    'ticket_description'    => $request->ticket_description,
                    'ticket_invoice_number' => $request->ticket_invoice_number,
                    'ticket_serial_number'  => $request->ticket_serial_number,
                    'ticket_status_id'      => 1, 
                ]);

                if ($request->hasFile('evidences')) {
                    foreach ($request->file('evidences') as $file) {
                        $path = $file->store('evidences/' . $newTicket->ticket_id, 'public');
                        
                        TicketEvidence::create([
                            'ticket_id' => $newTicket->ticket_id,
                            'ticket_evidence_path' => $path
                        ]);
                    }
                }

                return $newTicket;
            });

            $ticket->load(['customer', 'status', 'category', 'model']);
            
            broadcast(new TicketCreated($ticket))->toOthers();

            return response()->json([
                'message' => "Ticket {$ticket->ticket_code} creado exitosamente",
                'data' => $ticket
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al procesar el ticket',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
