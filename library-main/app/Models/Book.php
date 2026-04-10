<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'publisher_id',
        'author',
        'quantity',
        'available_quantity',
        'price',
        'available',
        'pdf_url',
    ];

    public function publisher()
    {
        return $this->belongsTo(Publisher::class);
    }

    public function bookIssues()
    {
        return $this->hasMany(BookIssue::class);
    }

    public function feedback()
    {
        return $this->hasMany(Feedback::class);
    }
}
