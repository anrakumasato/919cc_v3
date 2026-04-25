FROM php:8.3-fpm AS base
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring xml bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

# ローカル開発（アプリ未初期化時はコンテナを待機、初期化後はartisan serve起動）
FROM base AS development
EXPOSE 8000
CMD ["sh", "-c", "if [ -f artisan ]; then php artisan serve --host=0.0.0.0 --port=8000; else tail -f /dev/null; fi"]

# 本番（php-fpm）
FROM base AS production
COPY . .
RUN composer install --no-dev --optimize-autoloader \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache
EXPOSE 9000
CMD ["php-fpm"]
