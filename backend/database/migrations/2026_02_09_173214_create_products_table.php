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
        Schema::create('products', function (Blueprint $table) {
            $table->id('product_id');

            //Relaciones
            $table->foreignId('customer_id')->constrained(
                'customers', 'customer_id'
            );
            $table->foreignId('category_id')->constrained(
                'categories', 'category_id'
            );

            $table->string('product_name', 50);
            $table->string('product_model', 50);
            $table->string('product_serialNumber', 50)->unique();
            $table->date('product_purchaseDate');
            $table->boolean('product_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
