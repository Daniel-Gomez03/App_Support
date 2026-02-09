<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('warranties', function (Blueprint $table) {
            $table->id('warranty_id');
            
            //Relaciones
            $table->foreignId('product_id')->constrained(
                'products', 'product_id'
            );

            $table->date('warranty_start');
            $table->date('warranty_end');
            $table->boolean('warranty_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warranties');
    }
};
