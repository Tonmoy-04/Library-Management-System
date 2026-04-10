<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bookshelf extends Model
{
    use HasFactory;

    protected $table = 'bookshelf';

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

    public function adminActions()
    {
        return $this->hasMany(AdminActionLog::class, 'book_id');
    }
}
