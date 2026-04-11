<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('transactions')) {
            return;
        }

        Schema::table('transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('transactions', 'publisher_id')) {
                $table->unsignedBigInteger('publisher_id')->nullable()->after('book_id');
                $table->index('publisher_id', 'transactions_publisher_idx');
            }

            if (! Schema::hasColumn('transactions', 'admin_share')) {
                $table->decimal('admin_share', 10, 2)->default(0)->after('amount');
            }

            if (! Schema::hasColumn('transactions', 'publisher_share')) {
                $table->decimal('publisher_share', 10, 2)->default(0)->after('admin_share');
            }

            if (! Schema::hasColumn('transactions', 'payment_method')) {
                $table->string('payment_method', 40)->nullable()->after('payment_status');
            }

            if (! Schema::hasColumn('transactions', 'payment_reference')) {
                $table->string('payment_reference', 120)->nullable()->after('payment_method');
            }
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->foreign('publisher_id', 'transactions_publisher_fk')
                ->references('id')
                ->on('publishers')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('transactions')) {
            return;
        }

        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'publisher_id')) {
                $table->dropForeign('transactions_publisher_fk');
            }
        });

        Schema::table('transactions', function (Blueprint $table) {
            if (Schema::hasColumn('transactions', 'payment_reference')) {
                $table->dropColumn('payment_reference');
            }

            if (Schema::hasColumn('transactions', 'payment_method')) {
                $table->dropColumn('payment_method');
            }

            if (Schema::hasColumn('transactions', 'publisher_share')) {
                $table->dropColumn('publisher_share');
            }

            if (Schema::hasColumn('transactions', 'admin_share')) {
                $table->dropColumn('admin_share');
            }

            if (Schema::hasColumn('transactions', 'publisher_id')) {
                $table->dropIndex('transactions_publisher_idx');
                $table->dropColumn('publisher_id');
            }
        });
    }
};
