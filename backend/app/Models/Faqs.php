<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "FAQ",
    properties: [
         new OA\Property(
            property: "faq_id",
            type: "integer",
            description: "Código único de la pregunta frecuente",
            example: 1
        ),
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
            example: "Para reiniciar el dispositivo, mantenga presionado el botón de encendido..."
        ),
        new OA\Property(
            property: "faq_video_url",
            type: "string",
            description: "URL del video tutorial de YouTube",
            example: "https://www.youtube.com/",
            nullable: true
        ),
        new OA\Property(
            property: "faq_status",
            type: "boolean",
            description: "Estado de la pregunta (true = activa, false = inactiva)",
            example: true
        ),
        new OA\Property(
            property: "created_at",
            type: "string",
            format: "date-time",
            description: "Fecha y hora de creación"
        ),
        new OA\Property(
            property: "updated_at",
            type: "string",
            format: "date-time",
            description: "Fecha y hora de última actualización"
        )
    ]
)]

class Faqs extends Model
{
    use HasFactory;

    protected $table = 'faqs';
    protected $primaryKey = 'faq_id';
    protected $keyType = 'int';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'category_id',
        'product_id',
        'product_model_id',
        'faq_question',
        'faq_answer',
        'faq_video_url',
        'faq_status',
    ];
    protected $casts = [
        'faq_status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Categories::class, 'category_id', 'category_id');
    }

    public function product()
    {
        return $this->belongsTo(Products::class, 'product_id', 'product_id');
    }

    public function productModel()
    {
        return $this->belongsTo(ProductModel::class, 'product_model_id', 'product_model_id');
    }
}
