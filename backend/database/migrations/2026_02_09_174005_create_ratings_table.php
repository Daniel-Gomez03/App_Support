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
        Schema::create('ratings', function (Blueprint $table) {
            $table->id('rating_id');

            //Relaciones
            $table->foreignId('ticket_id')->constrained(
                'tickets', 'ticket_id'
            )->onDelete('cascade');
            $table->foreignId('customer_id')->constrained(
                'customers', 'customer_id'
            )->onDelete('cascade');
            $table->foreignId('user_id')->constrained(
                'users', 'user_id'
            )->onDelete('cascade');

            $table->tinyInteger('rating_score');
            $table->string('rating_comment', 255)->nullable();
            $table->timestamp('rating_createdAt')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
