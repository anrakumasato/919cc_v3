# 919.band — プロジェクト指示書

## プロジェクト概要

スニーカー・アパレルの「特定サイズだけ安い」商品を自動検出して紹介するセール情報サイト。
Twitterコアフォロワー向け。マネタイズはAmazonアフィリエイト中心。

---

## コア機能

同一商品内でサイズによって価格が異なる場合、標準価格より安いサイズを自動検出して紹介する。

```
例:
  ニューバランス 996（全サイズ）→ 標準価格 11,800円
  ニューバランス 996（22.5cm） →  9,800円  ← これを検出・紹介
```

---

## ディレクトリ構成（推奨）

```
/
├── src/
│   ├── api/
│   │   └── keepa.ts          # Keepa APIクライアント（Amazon価格取得）
│   ├── crawler/
│   │   ├── zozo.ts           # ZOZOTOWNスクレーパー（補助）
│   │   └── abc-mart.ts       # ABCマートスクレーパー（補助）
│   ├── detector/
│   │   └── price-anomaly.ts  # 価格異常検出ロジック
│   ├── poster/
│   │   └── twitter.ts        # X自動投稿
│   └── db/
│       └── schema.ts         # DBスキーマ定義
├── app/                      # Next.js (App Router)
│   ├── items/[slug]/
│   │   └── [size]/           # サイズ別ページ（SEO主力）
│   ├── small-size/           # 24cm以下まとめページ
│   │   └── [size]/
│   └── large-size/           # 29cm以上まとめページ
│       └── [size]/
├── CLAUDE.md                 # このファイル
└── .env.example
```

---

## 技術スタック

| 用途 | 技術 |
|------|------|
| フロント・ページ生成 | Next.js (App Router, ISR) |
| バックエンド | Laravel (PHP) |
| DB | MariaDB（ConoHaレンタルDB、bakayasu_v2と共用） |
| ORM | Eloquent（Laravel標準） |
| ローカル開発環境 | Docker（pm2不要） |
| 本番サーバー | Docker + pm2（Next.js プロセス管理） |
| CI/CD・定期実行 | GitHub Actions |
| デプロイ | GitHub Actions経由 |

---

## データソース

### 優先順位

1. **Keepa API**（Amazon価格・バリアントデータ・メイン）
2. ZOZOTOWNスクレーピング（補助）
3. ABCマート / atmosスクレーピング（補助）
4. 楽天市場API / Yahoo!ショッピングAPI（将来的に追加）

### Keepa APIの基本仕様

- bakayasu_v2プロジェクトで既に有料プランを利用中（トークン残あり）
- 親ASIN → 子ASINリストを取得し、子ASINごとに価格を取得
- 既存DBに親ASIN・子ASINのテーブルあり（bakayasu_v2と共用）
- トークン消費に注意（バッチ処理で効率化）

### AmazonのASIN構造

```
親ASIN（例: ニューバランス 996）
  ├── 子ASIN-A（22.5cm） → 現在価格をKeepaで取得
  ├── 子ASIN-B（23.0cm） → 現在価格をKeepaで取得
  └── 子ASIN-C（23.5cm） → 現在価格をKeepaで取得
```

**重要**: 既存DBの親ASIN・子ASINテーブルのスキーマをベースに設計する。
追加テーブル（size_prices, posts）はこのプロジェクト専用として追加。

---

## 価格異常検出ロジック（`src/detector/price-anomaly.ts`）

```typescript
// 処理フロー
// 1. 親ASINに紐づく全子ASINの現在価格をKeepaから取得
// 2. 中央値を「標準価格」とする
// 3. (標準価格 - サイズ価格) / 標準価格 が閾値(THRESHOLD)以上 → フラグ
// 4. 差額・割引率でソートしてDBに保存

const THRESHOLD = 0.15 // 15%以上安いサイズを検出対象とする

interface SizePrice {
  size: string    // "22.5cm" | "US8" など表記はそのまま保持
  price: number
  asin: string    // 子ASIN
}

interface AnomalyResult {
  productId: string
  productName: string
  parentAsin: string
  standardPrice: number
  anomalySize: string
  anomalyAsin: string
  anomalyPrice: number
  discountRate: number  // 0.0〜1.0
  discountAmount: number
  affiliateUrl: string  // Amazon アソシエイトリンク
}
```

**重要**: サイズ表記の正規化は行わない。同一親ASIN配下での比較のみ実施。

---

## DBスキーマ（追加テーブル）

既存テーブル（親ASIN・子ASIN）はbakayasu_v2から流用。
以下のテーブルをこのプロジェクト用に追加する。

```sql
-- サイズ別価格スナップショット（919.band専用）
size_prices (
  id, parent_asin, child_asin, size, price, is_anomaly,
  standard_price, discount_rate, fetched_at
)

-- 投稿済みログ
posts (
  id, parent_asin, child_asin, size, platform, posted_at
)

-- 商品スラッグ管理（SEO用）
product_slugs (
  id, parent_asin, slug, name, brand, image_url, created_at
)
```

---

## SEO・URL設計

### URLルール

```
/items/{slug}/              → 商品ページ
/items/{slug}/{size}/       → サイズ別ページ ← SEO主力、大量自動生成
/small-size/                → 24cm以下セール一覧
/small-size/{size}/         → 例: /small-size/22-5cm/
/large-size/                → 29cm以上セール一覧
/large-size/{size}/         → 例: /large-size/29cm/
```

### slugルール

```
ニューバランス 996 → new-balance-996
Nike Air Max 90  → nike-air-max-90
```

### sizeのURLエンコード

```
22.5cm → 22-5cm  （ドットはハイフンに変換）
US8.5  → us8-5
```

### titleタグ

```
{商品名} {size} 最安値 | 919.band
例: ニューバランス 996 22.5cm 最安値 | 919.band
```

---

## X（Twitter）自動投稿（`src/poster/twitter.ts`）

### 投稿フォーマット

```
【サイズ限定セール】
{商品名}

通常: ¥{標準価格}
22.5cmのみ: ¥{安値} (-{割引率}%)

{AmazonアフィリエイトURL}

#スニーカー #セール #サイズ限定
```

### 投稿条件

- 割引率15%以上のもののみ投稿
- 同一商品・同一サイズは24時間以内に再投稿しない
- 1時間に最大3件まで

---

## 環境変数（`.env`）

```
# Keepa API
KEEPA_API_KEY=

# Amazon アソシエイト
AMAZON_ASSOCIATE_TAG=

# X (Twitter) API
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=

# DB（ConoHa MariaDB、bakayasu_v2と共用）
DATABASE_URL=mysql://user:password@host:3306/dbname

# その他
PRICE_ANOMALY_THRESHOLD=0.15
MAX_POSTS_PER_HOUR=3
```

---

## 実装優先順位

1. 既存DBスキーマ確認（bakayasu_v2の親ASIN・子ASINテーブル）
2. `src/api/keepa.ts` — Keepa APIクライアント（子ASIN価格取得）
3. `src/detector/price-anomaly.ts` — 価格異常検出
4. 追加テーブル（size_prices, posts, product_slugs）Prismaセットアップ
5. Next.js `/items/[slug]/[size]/` ページ自動生成
6. `/small-size/` `/large-size/` ランディングページ
7. `src/poster/twitter.ts` — X自動投稿
8. GitHub Actions cronジョブ（定期実行）

---

## 注意事項

- Keepa APIのトークン消費を最小化する（バッチ処理・キャッシュ活用）
- DBはbakayasu_v2と共用なので既存テーブルを変更しない
- Amazonアフィリエイトリンクには必ずアソシエイトタグを付与する
- 価格データは必ずfetched_atをDBに記録する（価格推移グラフ対応のため）
- スクレーピングはrobots.txtを必ず確認する
