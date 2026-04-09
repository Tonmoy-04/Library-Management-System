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
        Schema::table('publishers', function (Blueprint $table) {
            // Add password and remember_token if they don't exist
            if (!Schema::hasColumn('publishers', 'password')) {
                $table->string('password')->nullable();
            }
            if (!Schema::hasColumn('publishers', 'remember_token')) {
                $table->rememberToken()->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('publishers', function (Blueprint $table) {
            if (Schema::hasColumn('publishers', 'password')) {
                $table->dropColumn('password');
            }
            if (Schema::hasColumn('publishers', 'remember_token')) {
                $table->dropColumn('remember_token');
            }
        });
    }
};
