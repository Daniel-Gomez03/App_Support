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
            $table->foreignId('user_id')->constrained(
                'users', 'user_id'
            );

            $table->string('faq_question', 255);
            $table->string('faq_answer', 255);
            $table->boolean('faq_status');
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
