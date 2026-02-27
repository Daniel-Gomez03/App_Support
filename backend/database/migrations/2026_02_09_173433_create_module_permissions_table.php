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
        Schema::create('module_permissions', function (Blueprint $table) {
            $table->id('module_permissions_id');
            
            //Relaciones
            $table->foreignId('rol_id')->constrained(
                'roles', 'rol_id'
            );
            $table->foreignId('module_id')->constrained(
                'modules', 'module_id'
            );

            $table->boolean('module_permission_view')->default(true);
            $table->boolean('module_permission_create')->default(false);
            $table->boolean('module_permission_edit')->default(false);
            $table->boolean('module_permission_delete')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('module_permissions');
    }
};
