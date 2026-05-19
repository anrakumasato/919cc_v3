<?php

namespace App\Console\Commands;

use App\Models\SizePrice;
use App\Models\SneakerProduct;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncProducts extends Command
{
    protected $signature = 'products:sync
                            {--limit=500 : 処理する sneaker_products の件数}
                            {--offset=0 : 開始オフセット}';

    protected $description = 'is_active=0の商品に子ASINがあればis_active=1に昇格し、size_pricesに同期する';

    public function handle(): int
    {
        $limit  = (int) $this->option('limit');
        $offset = (int) $this->option('offset');

        $products = SneakerProduct::where('is_active', false)
            ->offset($offset)
            ->limit($limit)
            ->get();

        $this->info("対象商品: {$products->count()} 件");

        $activated = 0;
        $added     = 0;

        $bar = $this->output->createProgressBar($products->count());
        $bar->start();

        foreach ($products as $product) {
            [$a, $b] = $this->syncProduct($product);
            $activated += $a;
            $added     += $b;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("is_active=1に昇格: {$activated} 件 / 子ASIN追加: {$added} 件");

        return self::SUCCESS;
    }

    private function syncProduct(SneakerProduct $product): array
    {
        // 旧DBから子ASINを取得
        $childAsins = DB::table('asin')
            ->where('parent_asin', $product->parent_asin)
            ->whereNotNull('asin')
            ->where('asin', '!=', '')
            ->whereNotNull('size_name')
            ->where('size_name', '!=', '')
            ->select('asin', 'size_name', 'color')
            ->get();

        if ($childAsins->isEmpty()) return [0, 0];

        // 既存の子ASINを取得してマップ化
        $existing = SizePrice::where('sneaker_product_id', $product->id)
            ->pluck('child_asin')
            ->flip();

        // 新しい子ASINだけ size_prices に追加
        $newRows = [];
        foreach ($childAsins as $child) {
            if ($existing->has($child->asin)) continue;
            $newRows[] = [
                'sneaker_product_id' => $product->id,
                'child_asin'         => $child->asin,
                'size'               => $child->size_name,
                'color'              => $child->color ?? null,
                'price'              => 0,
                'standard_price'     => 0,
                'is_anomaly'         => false,
                'discount_rate'      => null,
                'fetched_at'         => now(),
            ];
        }

        if (!empty($newRows)) {
            SizePrice::insert($newRows);
        }

        // is_active を 1 に昇格
        $product->is_active = true;
        $product->save();

        return [1, count($newRows)];
    }
}
