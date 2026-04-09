<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ReaderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        $readers = [
            ['name' => 'Alice Johnson', 'email' => 'alice@example.com', 'phone' => '123-456-7890', 'address' => '123 Maple St'],
            ['name' => 'Bob Smith', 'email' => 'bob@example.com', 'phone' => '234-567-8901', 'address' => '456 Oak Ave'],
            ['name' => 'Charlie Brown', 'email' => 'charlie@example.com', 'phone' => '345-678-9012', 'address' => '789 Pine Rd'],
            ['name' => 'Diana Prince', 'email' => 'diana@example.com', 'phone' => '456-789-0123', 'address' => '101 Wonder Ln'],
        ];

        foreach ($readers as $reader) {
            DB::table('readers')->updateOrInsert(
                ['name' => $reader['name']],
                [
                    'email' => $reader['email'],
                    'phone' => $reader['phone'],
                    'address' => $reader['address'],
                    'password' => Hash::make('password123'),
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }
    }
}
