<?php

namespace App\Http\Controllers;

use App\Models\SizePrice;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SizePrice::where('is_anomaly', true)
            ->with('sneakerProduct')
            ->whereHas('sneakerProduct', fn($q) => $q->where('is_active', true))
            ->orderBy('fetched_at', 'desc');

        if ($request->filled('size')) {
            $query->where('size', $request->input('size'));
        }

        $items = $query->get()->map(fn($sp) => $this->format($sp));

        return response()->json($items);
    }

    public function sizes(): JsonResponse
    {
        $sizes = SizePrice::where('is_anomaly', true)
            ->join('sneaker_products', 'size_prices.sneaker_product_id', '=', 'sneaker_products.id')
            ->where('sneaker_products.is_active', true)
            ->select('size_prices.size', DB::raw('count(*) as count'))
            ->groupBy('size_prices.size')
            ->orderBy('size_prices.size')
            ->get();

        return response()->json($sizes);
    }

    private function format(SizePrice $sp): array
    {
        $product = $sp->sneakerProduct;
        $tag = config('services.amazon.partner_tag', '');

        return [
            'id'            => $sp->id,
            'slug'          => (string) $product->id,
            'name'          => $product->seo_name ?? $product->name,
            'brand'         => $product->brand,
            'parentAsin'    => $product->parent_asin,
            'standardPrice' => $sp->standard_price,
            'anomalySize'   => $sp->size,
            'anomalyPrice'  => $sp->price,
            'discountRate'  => (float) $sp->discount_rate,
            'discountAmount' => $sp->standard_price - $sp->price,
            'affiliateUrl'  => "https://www.amazon.co.jp/dp/{$sp->child_asin}?tag={$tag}",
            'detectedAt'    => $this->relativeTime($sp->fetched_at),
            'imageUrl'      => $product->image_url ?? '',
        ];
    }

    private function relativeTime(string $fetchedAt): string
    {
        $diff = (int) now()->diffInMinutes(Carbon::parse($fetchedAt));
        if ($diff < 60) return "{$diff}分前";
        $hours = (int) floor($diff / 60);
        if ($hours < 24) return "{$hours}時間前";
        return floor($diff / 1440) . '日前';
    }
}
