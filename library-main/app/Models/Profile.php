<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'department',
        'year',
        'semester',
        'gender',
        'number',
        'profile_picture',
        'student_id', // I added this since you mentioned "ID" in your requirements
        'batch',      // I added this since you mentioned "Batch Number"
    ];

    /**
     * Get the user that owns the profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}