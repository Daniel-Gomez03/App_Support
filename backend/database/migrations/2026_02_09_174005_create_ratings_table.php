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
            );
            $table->foreignId('customer_id')->constrained(
                'customers', 'customer_id'
            );
            $table->foreignId('user_id')->constrained(
                'users', 'user_id'
            );

            $table->integer('rating_score');
            $table->string('rating_comment', 255);
            $table->timestamp('rating_createdAt');
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
