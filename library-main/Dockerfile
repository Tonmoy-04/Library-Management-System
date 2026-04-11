# Dockerfile
FROM php:8.2-cli

# Set working directory
WORKDIR /var/www/html

# Install system dependencies and Microsoft SQL Server ODBC driver prerequisites
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    gnupg2 \
    ca-certificates \
    apt-transport-https \
    unixodbc-dev \
    libgssapi-krb5-2 \
    libzip-dev \
    libonig-dev \
    libpng-dev \
    libxml2-dev \
    mariadb-client \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && pecl install sqlsrv pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv \
    && docker-php-ext-install pdo pdo_mysql mbstring zip exif pcntl bcmath gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . .

# Install PHP dependencies
RUN composer install --no-interaction --prefer-dist --no-scripts

# Set permissions for Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose app port
EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]