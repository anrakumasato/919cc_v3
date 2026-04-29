<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SneakerProduct extends Model
{
    protected $fillable = ['parent_asin', 'name', 'seo_name', 'brand', 'image_url', 'is_active'];

    public function sizePrices()
    {
        return $this->hasMany(SizePrice::class);
    }
}
