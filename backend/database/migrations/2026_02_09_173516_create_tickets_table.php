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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id('ticket_id');

            //Relaciones
            $table->foreignId('customer_id')->constrained(
                'customers', 'customer_id'
            );
            $table->foreignId('product_id')->constrained(
                'products', 'product_id'
            );
            $table->foreignId('category_id')->constrained(
                'categories', 'category_id'
            );
            $table->foreignId('ticket_status_id')->constrained(
               'tickets_statuses', 'ticket_status_id'
            );
            $table->foreignId('priority_id')->nullable()->constrained(
                'priorities', 'priority_id'
            );
            $table->foreignId('user_id')->nullable()->constrained(
                'users', 'user_id'
            );

            $table->string('ticket_subject', 255);
            $table->text('ticket_description');
            $table->timestamp('ticket_createdAt')->useCurrent();
            $table->boolean('ticket_status')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
