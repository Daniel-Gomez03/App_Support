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
        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');

            //Relaciones
            $table->foreignId('department_id')->constrained(
                'departments', 'department_id'
            );
            $table->foreignId('rol_id')->constrained(
                'roles', 'rol_id'
            );
            $table->foreignId('position_id')->constrained(
                'positions', 'position_id'
            );

            $table->string('user_firstName', 50);
            $table->string('user_lastName', 50);
            $table->string('user_email',60)->unique();
            $table->string('user_password', 255);
            $table->string('user_image', 255)->nullable();
            $table->boolean('user_status')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
