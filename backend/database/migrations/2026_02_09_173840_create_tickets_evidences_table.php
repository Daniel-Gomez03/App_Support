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
        Schema::create('tickets_evidences', function (Blueprint $table) {
            $table->id('ticket_evidence_id');
            
            //Relaciones
            $table->foreignId('ticket_id')->constrained(
                'tickets', 'ticket_id'
            );

            $table->string('ticket_evidence_path', 255);
            $table->string('ticket_evidence_description', 50);
            $table->timestamp('ticket_evidence_uploadedAt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets_evidences');
    }
};
