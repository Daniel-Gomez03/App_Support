<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class Tickets extends Model
{
    use HasFactory;

    protected $table = 'tickets';
    protected $primaryKey = 'ticket_id';
    protected $appends = ['ticket_code'];

    protected $fillable = [
        'customer_id',
        'category_id',
        'product_model_id',
        'ticket_status_id',
        'priority_id',
        'user_id',
        'ticket_subject',
        'ticket_description',
        'ticket_invoice_number',
        'ticket_serial_number',
    ];

    public function getTicketCodeAttribute()
    {
        if (!$this->ticket_id) return "T-" . date('Y') . "-XXX";

        $date = $this->created_at ? Carbon::parse($this->created_at) : now();
        $year = $date->format('Y');
        $number = str_pad($this->ticket_id, 3, '0', STR_PAD_LEFT);
        
        return "T-{$year}-{$number}";
    }


    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function model()
    {
        return $this->belongsTo(ProductModel::class, 'product_model_id');
    }

    public function status()
    {
        return $this->belongsTo(TicketStatus::class, 'ticket_status_id');
    }

    public function evidences()
    {
        return $this->hasMany(TicketEvidence::class, 'ticket_id');
    }
}
