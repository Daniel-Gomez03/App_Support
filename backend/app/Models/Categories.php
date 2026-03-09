<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: "Categories",
    properties: [
        new OA\Property(
            property: "category_id",
            type: "integer",
            description: "Codigo de la categoria del producto",
        ),
        new OA\Property(
            property: "category_name",
            type: "string",
            description: "Nombre de la categoría",
            example: "Servicios"
        ),
        new OA\Property(
            property: "category_description",
            type: "string",
            description: "Descripción de la categoría",
            example: "Categoría para productos de software"
        ),
        new OA\Property(
            property: "category_status",
            type: "boolean",
            description: "Estado de la categoría (activa/inactiva)",
            example: true
        ),
        new OA\Property(
            property: "created_at",
            type: "string",
            format: "date-time",
            description: "Fecha de creación"
        ),
        new OA\Property(
            property: "updated_at",
            type: "string",
            format: "date-time",
            description: "Fecha de actualización"
        )
    ]
)]

class Categories extends Model
{
    use HasFactory;

    // Configuración de la tabla
    protected $table = 'categories';
    protected $primaryKey = 'category_id';
    protected $keyType = 'int';
    public $incrementing = true;
    public $timestamps = true;

    // Campos asignables en masa
    protected $fillable = [
        'category_name',
        'category_description',
        'category_status',
    ];

    // Casting de atributos
    protected $casts = [
        'category_status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación: Una categoría tiene muchos productos
     */
    public function products()
    {
        return $this->hasMany(Products::class, 'category_id');
    }
}
