<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SizePrice extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'sneaker_product_id', 'child_asin', 'size', 'price',
        'standard_price', 'is_anomaly', 'discount_rate', 'color', 'fetched_at',
    ];

    public function sneakerProduct()
    {
        return $this->belongsTo(SneakerProduct::class);
    }
}
