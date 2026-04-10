<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublisherBookSubmission extends Model
{
    use HasFactory;

    protected $table = 'publisher_book_submissions';

    protected $fillable = [
        'title',
        'author',
        'publisher_id',
        'description',
        'price',
        'file_url',
        'cover_url',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function publisher()
    {
        return $this->belongsTo(Publisher::class);
    }
}
