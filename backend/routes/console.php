<?php

use Illuminate\Support\Facades\Schedule;

// is_active=0 の商品に子ASINを補充・昇格（毎日深夜2時）
Schedule::command('products:sync --limit=500')->dailyAt('02:00');

// 価格取得 + 異常検出（3時間ごと）
Schedule::command('prices:fetch --limit=200')->everythreeHours();
