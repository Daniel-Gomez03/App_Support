<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "ProductModel",
    properties: [
        new OA\Property(
            property: "product_model_id",
            type: "integer",
            description: "Código único del modelo del producto",
            example: 1
        ),
        new OA\Property(
            property: "product_id",
            type: "integer",
            description: "ID del producto al que pertenece este modelo",
            example: 1
        ),
        new OA\Property(
            property: "product_model_name",
            type: "string",
            description: "Nombre del modelo del producto",
            example: "SAT PL5005C"
        ),
        new OA\Property(
            property: "product_model_status",
            type: "boolean",
            description: "Estado del modelo (true = activo, false = inactivo)",
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
class ProductModel extends Model
{
    use HasFactory;

    protected $table = 'products_models';
    protected $primaryKey = 'product_model_id';
    protected $keyType = 'int';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'product_id',
        'product_model_name',
        'product_model_status',
    ];

    protected $casts = [
        'product_model_status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Products::class, 'product_id', 'product_id');
    }
}