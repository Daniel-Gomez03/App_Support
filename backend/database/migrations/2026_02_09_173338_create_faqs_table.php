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
            )->onDelete('cascade');

            $table->string('faq_question', 255);
            $table->text('faq_answer');
            $table->boolean('faq_status')->default(true);
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
