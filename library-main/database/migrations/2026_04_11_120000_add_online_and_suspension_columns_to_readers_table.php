<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('readers')) {
            return;
        }

        Schema::table('readers', function (Blueprint $table) {
            if (!Schema::hasColumn('readers', 'is_online_registered')) {
                $table->boolean('is_online_registered')->default(false);
            }

            if (!Schema::hasColumn('readers', 'is_suspended')) {
                $table->boolean('is_suspended')->default(false);
            }

            if (!Schema::hasColumn('readers', 'suspended_at')) {
                $table->timestamp('suspended_at')->nullable();
            }
        });

        DB::table('readers')
            ->whereNotNull('password')
            ->update(['is_online_registered' => true]);
    }

    public function down(): void
    {
        if (!Schema::hasTable('readers')) {
            return;
        }

        Schema::table('readers', function (Blueprint $table) {
            if (Schema::hasColumn('readers', 'suspended_at')) {
                $table->dropColumn('suspended_at');
            }

            if (Schema::hasColumn('readers', 'is_suspended')) {
                $table->dropColumn('is_suspended');
            }

            if (Schema::hasColumn('readers', 'is_online_registered')) {
                $table->dropColumn('is_online_registered');
            }
        });
    }
};
