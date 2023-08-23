FROM node:16 AS node

# -------------------------------------------------------------------------
# Dipendenze per build
# -------------------------------------------------------------------------
FROM php:8-apache as base
RUN apt update -y && apt install -y git zip neovim cron zlib1g-dev libpng-dev libonig-dev libzip-dev mariadb-client libfreetype6-dev \
    libmcrypt-dev libjpeg-dev libpng-dev && \
    docker-php-ext-install mysqli && \
    docker-php-ext-install pdo && \
    docker-php-ext-install pdo_mysql && \
    docker-php-ext-install mbstring && \
    docker-php-ext-install zip && \
    docker-php-ext-configure gd --with-freetype && \
    docker-php-ext-install gd && \
    docker-php-ext-install pcntl && \
    a2enmod proxy proxy_wstunnel proxy_http rewrite


COPY apache.conf /etc/apache2/sites-available/000-default.conf

# ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html
COPY --chown=www-data:www-data . /var/www/html
RUN rm -f app/bootstrap/cache/*.php \
    storage/framework/cache/data/* storage/framework/sessions/* \
    storage/framework/views/* storage/logs/*

# -------------------------------------------------------------------------
# Compilazione
# -------------------------------------------------------------------------
FROM base as build
COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
RUN mkdir /var/www/.npm && chown -R 33:33 "/var/www/.npm"

# USER www-data
RUN echo "* * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1" | crontab -
ARG APP_ENV
ENV APP_ENV=${APP_ENV}
RUN rm -rf vendor  &&  \
    if [ "${APP_ENV}" = "local" ] ; then composer install ; else composer install --optimize-autoloader --no-dev ; fi
RUN rm -rf node_modules && npm install
RUN if [ "${APP_ENV}" = "local" ] ; then npm run build:dev ; else npm run build ; fi



# -------------------------------------------------------------------------
# Produzione
# -------------------------------------------------------------------------
FROM build as deploy

USER root
RUN apt install -y supervisor && mkdir -p "/etc/supervisor/logs"
COPY ./supervisord.conf /etc/supervisor/supervisord.conf


WORKDIR /var/www/html

# RUN rm -rf node_modules /var/www/html/storage/logs/* /var/www/html/bootstrap/cache/*
# RUN chown -R www-data.www-data /var/www
COPY entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh

RUN php artisan config:clear
USER www-data
CMD ["/entrypoint.sh", "apache"]

# -------------------------------------------------------------------------
# Develop
# -------------------------------------------------------------------------

FROM deploy as develop
USER root

# COPY --from=composer /usr/bin/composer /usr/bin/composer
# COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
# COPY --from=node /usr/local/bin/node /usr/local/bin/node
# RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

RUN pecl install xdebug && docker-php-ext-enable xdebug && \
    printf "zend_extension=xdebug.so\n\
    xdebug.mode=develop,coverage,debug,profile\n\
    xdebug.idekey=docker\n\
    xdebug.start_with_request=yes\n\
    xdebug.discover_client_host=0\n\
    xdebug.client_host=host.docker.internal\n\
    xdebug.log=/dev/stdout\n\
    xdebug.log_level=0\n\
    xdebug.client_port=9003\n" > /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini
