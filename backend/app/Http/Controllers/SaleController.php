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

    public function show(int $id): JsonResponse
    {
        $sizePrice = SizePrice::with('sneakerProduct')->findOrFail($id);
        $product   = $sizePrice->sneakerProduct;
        $tag       = config('services.amazon.partner_tag', '');

        $sizes = SizePrice::where('sneaker_product_id', $product->id)
            ->where('price', '>', 0)
            ->get()
            ->sortBy(fn($sp) => (float) $sp->size)
            ->values();

        return response()->json([
            'featured' => $this->formatSize($sizePrice, $tag),
            'product'  => [
                'id'         => $product->id,
                'name'       => $product->seo_name ?: $product->name,
                'brand'      => $product->brand,
                'imageUrl'   => $this->largeImageUrl($product->image_url),
                'parentAsin' => $product->parent_asin,
            ],
            'sizes' => $sizes->map(fn($sp) => $this->formatSize($sp, $tag)),
        ]);
    }

    private function formatSize(SizePrice $sp, string $tag): array
    {
        return [
            'id'            => $sp->id,
            'size'          => $sp->size,
            'price'         => $sp->price,
            'standardPrice' => $sp->standard_price,
            'discountRate'  => $sp->discount_rate ? (float) $sp->discount_rate : null,
            'discountAmount' => $sp->standard_price - $sp->price,
            'isAnomaly'     => (bool) $sp->is_anomaly,
            'affiliateUrl'  => "https://www.amazon.co.jp/dp/{$sp->child_asin}?tag={$tag}",
        ];
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
            'name'          => $product->seo_name ?: $product->name,
            'brand'         => $product->brand,
            'parentAsin'    => $product->parent_asin,
            'standardPrice' => $sp->standard_price,
            'anomalySize'   => $sp->size,
            'anomalyPrice'  => $sp->price,
            'discountRate'  => (float) $sp->discount_rate,
            'discountAmount' => $sp->standard_price - $sp->price,
            'affiliateUrl'  => "https://www.amazon.co.jp/dp/{$sp->child_asin}?tag={$tag}",
            'detectedAt'    => $this->relativeTime($sp->fetched_at),
            'imageUrl'      => $this->largeImageUrl($product->image_url),
        ];
    }

    private function largeImageUrl(?string $url): string
    {
        if (!$url) return '';
        return preg_replace('/\._[A-Z]{2}\d+_\./', '._SL500_.', $url);
    }

    private function relativeTime(string $fetchedAt): string
    {
        $diff = max(0, (int) Carbon::parse($fetchedAt)->diffInMinutes(now()));
        if ($diff < 60) return "{$diff}分前";
        $hours = (int) floor($diff / 60);
        if ($hours < 24) return "{$hours}時間前";
        return floor($diff / 1440) . '日前';
    }
}
