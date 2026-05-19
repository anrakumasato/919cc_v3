<?php

namespace App\Services;

use Amazon\CreatorsAPI\v1\ApiException;
use Amazon\CreatorsAPI\v1\com\amazon\creators\api\DefaultApi;
use Amazon\CreatorsAPI\v1\com\amazon\creators\model\GetItemsRequestContent;
use Amazon\CreatorsAPI\v1\com\amazon\creators\model\GetItemsResource;
use Amazon\CreatorsAPI\v1\Configuration;
use Illuminate\Support\Facades\Log;

class AmazonProductService
{
    private DefaultApi $api;
    private string $partnerTag;
    private string $marketplace;

    public function __construct()
    {
        $config = new Configuration();
        $config->setCredentialId(config('services.amazon.credential_id'));
        $config->setCredentialSecret(config('services.amazon.credential_secret'));
        $config->setVersion(config('services.amazon.credential_version'));

        $this->partnerTag = config('services.amazon.partner_tag');
        $this->marketplace = config('services.amazon.marketplace', 'www.amazon.co.jp');
        $this->api = new DefaultApi(null, $config);
    }

    /**
     * ASINから商品情報のみを取得（価格なし）
     */
    public function getProductInfoOnly($asins): array
    {
        if (is_string($asins)) {
            $asins = [$asins];
        }
        $asins = array_slice($asins, 0, 10);

        $request = new GetItemsRequestContent();
        $request->setPartnerTag($this->partnerTag);
        $request->setItemIds($asins);
        $request->setResources([
            GetItemsResource::ITEM_INFO_TITLE,
            GetItemsResource::IMAGES_PRIMARY_LARGE,
            GetItemsResource::BROWSE_NODE_INFO_BROWSE_NODES,
        ]);

        try {
            $response = $this->api->getItems($this->marketplace, $request);

            if ($response->getItemsResult() !== null) {
                return $this->formatResponseBasic($response->getItemsResult()->getItems());
            }

            if ($response->getErrors()) {
                Log::error('Creators API errors', ['errors' => json_encode($response->getErrors())]);
            }

            return [];
        } catch (ApiException $e) {
            Log::error('Creators API exception', ['message' => $e->getMessage(), 'code' => $e->getCode()]);
            return [];
        }
    }

    /**
     * ASINから商品情報を取得（価格含む）
     */
    public function getProductInfo($asins): ?array
    {
        if (is_string($asins)) {
            $asins = [$asins];
        }
        $asins = array_slice($asins, 0, 10);

        $request = new GetItemsRequestContent();
        $request->setPartnerTag($this->partnerTag);
        $request->setItemIds($asins);
        $request->setResources([
            GetItemsResource::ITEM_INFO_TITLE,
            GetItemsResource::IMAGES_PRIMARY_LARGE,
            GetItemsResource::BROWSE_NODE_INFO_BROWSE_NODES,
            GetItemsResource::OFFERS_V2_LISTINGS_PRICE,
            GetItemsResource::OFFERS_V2_LISTINGS_CONDITION,
            GetItemsResource::OFFERS_V2_LISTINGS_MERCHANT_INFO,
        ]);

        try {
            $response = $this->api->getItems($this->marketplace, $request);

            if ($response->getItemsResult() !== null) {
                $items = $response->getItemsResult()->getItems() ?? [];
                if (empty($items)) {
                    Log::warning('Creators API: no items returned', ['asins' => $asins]);
                }
                return $this->formatResponse($items);
            }

            if ($response->getErrors()) {
                Log::error('Creators API errors', ['asins' => $asins, 'errors' => json_encode($response->getErrors())]);
            } else {
                Log::warning('Creators API: null ItemsResult with no errors', ['asins' => $asins]);
            }

            return null;
        } catch (ApiException $e) {
            Log::error('Creators API exception', [
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
                'body' => $e->getResponseBody(),
            ]);
            return null;
        } catch (\Exception $e) {
            Log::error('Creators API general exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    private function formatResponseBasic(?array $items): array
    {
        if (empty($items)) return [];

        $formatted = [];
        foreach ($items as $item) {
            $formatted[] = [
                'asin'      => $item->getAsin(),
                'title'     => $this->extractTitle($item),
                'image_url' => $this->extractImageUrl($item),
                'category'  => $this->extractCategory($item),
            ];
        }
        return $formatted;
    }

    private function formatResponse(?array $items): ?array
    {
        if (empty($items)) return null;

        $formatted = [];
        foreach ($items as $item) {
            $formatted[] = [
                'asin'          => $item->getAsin(),
                'title'         => $this->extractTitle($item),
                'image_url'     => $this->extractImageUrl($item),
                'current_price' => $this->extractPrice($item),
                'category'      => $this->extractCategory($item),
            ];
        }
        return $formatted;
    }

    private function extractTitle($item): ?string
    {
        return $item->getItemInfo()?->getTitle()?->getDisplayValue();
    }

    private function extractImageUrl($item): ?string
    {
        $primary = $item->getImages()?->getPrimary();
        if (!$primary) return null;

        return $primary->getLarge()?->getUrl()
            ?? $primary->getMedium()?->getUrl();
    }

    private function extractPrice($item): ?float
    {
        $listings = $item->getOffersV2()?->getListings();
        if (empty($listings)) return null;

        return $listings[0]->getPrice()?->getMoney()?->getAmount();
    }

    private function extractCategory($item): ?string
    {
        $nodes = $item->getBrowseNodeInfo()?->getBrowseNodes();
        if (empty($nodes)) return null;

        return $nodes[0]->getContextFreeName();
    }
}
