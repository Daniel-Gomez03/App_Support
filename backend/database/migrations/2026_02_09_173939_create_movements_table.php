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
        Schema::create('movements', function (Blueprint $table) {
            $table->id('movement_id');

            //Relaciones
            $table->foreignId('user_id')->constrained(
                'users', 'user_id'
            );
            $table->foreignId('ticket_id')->constrained(
                'tickets', 'ticket_id'
            )->onDelete('cascade');
            $table->foreignId('ticket_status_id')->constrained(
                'tickets_statuses', 'ticket_status_id'
            );

            $table->timestamp('movement_createdAt')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movements');
    }
};
