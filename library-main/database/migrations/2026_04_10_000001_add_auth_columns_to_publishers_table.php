<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('publishers')) {
            return;
        }

        Schema::table('publishers', function (Blueprint $table) {
            if (! Schema::hasColumn('publishers', 'password')) {
                $table->string('password')->nullable()->after('email');
            }

            if (! Schema::hasColumn('publishers', 'description')) {
                $table->text('description')->nullable()->after('name');
            }

            if (! Schema::hasColumn('publishers', 'city')) {
                $table->string('city')->nullable()->after('address');
            }

            if (! Schema::hasColumn('publishers', 'country')) {
                $table->string('country')->nullable()->after('city');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('publishers')) {
            return;
        }

        Schema::table('publishers', function (Blueprint $table) {
            if (Schema::hasColumn('publishers', 'country')) {
                $table->dropColumn('country');
            }

            if (Schema::hasColumn('publishers', 'city')) {
                $table->dropColumn('city');
            }

            if (Schema::hasColumn('publishers', 'description')) {
                $table->dropColumn('description');
            }

            if (Schema::hasColumn('publishers', 'password')) {
                $table->dropColumn('password');
            }
        });
    }
};
