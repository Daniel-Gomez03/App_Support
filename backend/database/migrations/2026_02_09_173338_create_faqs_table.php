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
        Schema::create('faqs', function (Blueprint $table) {
            $table->id('faq_id');

            //Relaciones
            $table->foreignId('category_id')->constrained(
                'categories', 'category_id'
            );
            $table->foreignId('product_id')->constrained(
                'products', 'product_id'
            );
             $table->foreignId('product_model_id')->constrained(
                'products_models', 'product_model_id'
            );

            $table->string('faq_question', 255);
            $table->text('faq_answer');
            $table->string('faq_video_url', 255); 
            $table->boolean('faq_status')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs');
    }
};
