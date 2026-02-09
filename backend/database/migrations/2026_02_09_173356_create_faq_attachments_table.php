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
        Schema::create('faq_attachments', function (Blueprint $table) {
            $table->id('attachment_id');
            
            //Relaciones
            $table->foreignId('faq_id')->constrained(
                'faqs', 'faq_id'
            );

            $table->string('attachment_path', 255);
            $table->string('attachment_name', 100);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faq_attachments');
    }
};
