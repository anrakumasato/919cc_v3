<?php

namespace App\Console\Commands;

use App\Models\SizePrice;
use App\Models\SneakerProduct;
use App\Services\AmazonProductService;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

class FetchPricesAndDetectAnomalies extends Command
{
    protected $signature = 'prices:fetch
                            {--limit=100 : 処理する sneaker_products の件数}
                            {--offset=0 : 開始オフセット}';

    protected $description = 'Amazon APIで価格を取得し、サイズ異常を検出する';

    private const THRESHOLD = 0.15;

    public function __construct(private AmazonProductService $amazon)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $limit  = (int) $this->option('limit');
        $offset = (int) $this->option('offset');

        $products = SneakerProduct::where('is_active', true)
            ->orderBy('updated_at', 'asc')
            ->limit($limit)
            ->get();

        $this->info("対象商品: {$products->count()} 件");

        $bar = $this->output->createProgressBar($products->count());
        $bar->start();

        foreach ($products as $product) {
            $this->processProduct($product);
            $bar->advance();
            sleep(1); // 1 TPS 制限
        }

        $bar->finish();
        $this->newLine();
        $this->info('完了');

        return self::SUCCESS;
    }

    private function processProduct(SneakerProduct $product): void
    {
        $sizePrices = SizePrice::where('sneaker_product_id', $product->id)->get();
        if ($sizePrices->isEmpty()) return;

        // 子ASINを最大10件ずつ分割してAPIリクエスト
        $chunks = $sizePrices->pluck('child_asin', 'id')->chunk(10);

        $priceMap = [];
        foreach ($chunks as $chunk) {
            $results = $this->amazon->getProductInfo($chunk->values()->toArray());
            if ($results) {
                foreach ($results as $r) {
                    if ($r['current_price'] !== null) {
                        $priceMap[$r['asin']] = $r['current_price'];
                    }
                }
            }
            if ($chunks->count() > 1) sleep(1);
        }

        // 価格をDBに反映
        foreach ($sizePrices as $sp) {
            if (isset($priceMap[$sp->child_asin])) {
                $sp->price = (int) round($priceMap[$sp->child_asin]);
                $sp->save();
            }
        }

        $fresh = $sizePrices->fresh();

        // 処理済みとして updated_at を更新（次回は他の商品が優先される）
        $product->touch();

        // 全サイズの価格が取得できなかった場合は非アクティブに
        if ($fresh->every(fn($sp) => $sp->price === 0)) {
            $product->is_active = false;
            $product->save();
            return;
        }

        // 異常検出: 価格がある行のみ対象
        $this->detectAnomalies($fresh);
    }

    private function detectAnomalies(Collection $sizePrices): void
    {
        $prices = $sizePrices
            ->filter(fn($sp) => $sp->price > 0)
            ->pluck('price')
            ->sort()
            ->values();

        if ($prices->count() < 2) return;

        $standardPrice = $this->median($prices->toArray());

        foreach ($sizePrices as $sp) {
            if ($sp->price <= 0) continue;

            $discountRate = ($standardPrice - $sp->price) / $standardPrice;
            $isAnomaly    = $discountRate >= self::THRESHOLD;

            $sp->standard_price = (int) $standardPrice;
            $sp->discount_rate  = $isAnomaly ? round($discountRate, 4) : null;
            $sp->is_anomaly     = $isAnomaly;
            $sp->fetched_at     = now();
            $sp->save();
        }
    }

    private function median(array $sorted): float
    {
        $count = count($sorted);
        $mid   = (int) floor($count / 2);
        return $count % 2 === 0
            ? ($sorted[$mid - 1] + $sorted[$mid]) / 2
            : $sorted[$mid];
    }
}
