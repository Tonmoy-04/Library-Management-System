<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id(); // primary key
            $table->unsignedBigInteger('user_id')->nullable(); // optional link to users table
            $table->string('department');
            $table->integer('year');
            $table->integer('semester');
            $table->string('gender');
            $table->string('number');
            $table->timestamps();

            // Foreign key if you have a users table
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};