<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PublisherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();

        $publishers = [
            ['name' => "O'Reilly Media", 'email' => 'contact@oreilly.com', 'website' => 'https://www.oreilly.com', 'location' => 'California, USA'],
            ['name' => 'Prentice Hall', 'email' => 'info@penticehall.com', 'website' => 'https://www.pearson.com', 'location' => 'New Jersey, USA'],
            ['name' => 'Addison-Wesley', 'email' => 'sales@awl.com', 'website' => 'https://www.addison-wesley.com', 'location' => 'Massachusetts, USA'],
            ['name' => 'Packt Publishing', 'email' => 'enquiry@packt.com', 'website' => 'https://www.packtpub.com', 'location' => 'Birmingham, UK'],
        ];

        foreach ($publishers as $publisher) {
            DB::table('publishers')->updateOrInsert(
                ['name' => $publisher['name']],
                [
                    'email' => $publisher['email'],
                    'website' => $publisher['website'],
                    'location' => $publisher['location'],
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }
    }
}
