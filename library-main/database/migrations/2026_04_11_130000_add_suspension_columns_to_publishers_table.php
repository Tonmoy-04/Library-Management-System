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
            if (! Schema::hasColumn('publishers', 'is_suspended')) {
                $table->boolean('is_suspended')->default(false);
            }

            if (! Schema::hasColumn('publishers', 'suspended_at')) {
                $table->timestamp('suspended_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('publishers')) {
            return;
        }

        Schema::table('publishers', function (Blueprint $table) {
            if (Schema::hasColumn('publishers', 'suspended_at')) {
                $table->dropColumn('suspended_at');
            }

            if (Schema::hasColumn('publishers', 'is_suspended')) {
                $table->dropColumn('is_suspended');
            }
        });
    }
};
