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
        Schema::create('customers', function (Blueprint $table) {
            $table->id('customer_id');
            
            //Referencias
            $table->foreignId('company_id')->constrained(
                'companies', 'company_id'
            );

            $table->string('customer_name', 50);
            $table->string('customer_email', 50)->unique();
            $table->string('customer_phone', 20);
            $table->string('customer_country', 50);
            $table->text('customer_address');
            $table->string('customer_image', 255)->nullable();
            $table->boolean('customer_status')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
