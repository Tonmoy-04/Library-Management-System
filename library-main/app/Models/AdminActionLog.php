<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminActionLog extends Model
{
    use HasFactory;

    protected $table = 'admin_actions_log';

    protected $fillable = [
        'submission_id',
        'action',
        'admin_id',
        'action_date',
    ];

    protected $casts = [
        'action_date' => 'datetime',
    ];

    public function submission()
    {
        return $this->belongsTo(PublisherBookSubmission::class, 'submission_id');
    }
}
