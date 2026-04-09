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
            if (Schema::hasColumn('publishers', 'phone')) {
                $table->dropColumn('phone');
            }

            if (Schema::hasColumn('publishers', 'address')) {
                $table->dropColumn('address');
            }

            if (! Schema::hasColumn('publishers', 'website')) {
                $table->string('website')->nullable()->after('email');
            }

            if (! Schema::hasColumn('publishers', 'location')) {
                $table->string('location', 500)->nullable()->after('website');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('publishers', function (Blueprint $table) {
            if (Schema::hasColumn('publishers', 'website')) {
                $table->dropColumn('website');
            }

            if (Schema::hasColumn('publishers', 'location')) {
                $table->dropColumn('location');
            }

            if (! Schema::hasColumn('publishers', 'phone')) {
                $table->string('phone', 20)->nullable();
            }

            if (! Schema::hasColumn('publishers', 'address')) {
                $table->string('address', 500)->nullable();
            }
        });
    }
};
