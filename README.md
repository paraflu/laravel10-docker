# Setup Laravel 10 and docker

🎇 🎉 Now with Vue+Inertia+Tailwind 🎉 🎇

- Create the project

  `composer create-project laravel/laravel example-app`

- Setup docker-compose.yml

```yaml
services:
    web:
        build:
            context: .
            dockerfile: Dockerfile
            target: develop

        volumes:
            - .:/var/www/html
        env_file: .env

        ports:
            - ${APP_PORT:-8088}:80
            - ${VITE_PORT:-5173}:${VITE_PORT:-5173}

        extra_hosts:
            - "host.docker.internal:host-gateway"

        depends_on:
            db:
                condition: service_healthy
            cache:
                condition: service_healthy

    supervisor:
        build:
            context: .
            dockerfile: Dockerfile
        env_file: .env
        command: [ "/entrypoint.sh", "supervisor" ]
        volumes:
            - .:/var/www/html
        extra_hosts:
            - "host.docker.internal:host-gateway"

        depends_on:
            db:
                condition: service_healthy
            cache:
                condition: service_healthy

    cron:
        build:
            context: .
            dockerfile: Dockerfile
        env_file: .env
        command: [ "/entrypoint.sh", "cron" ]
        volumes:
            - .:/var/www/html
        extra_hosts:
            - "host.docker.internal:host-gateway"

        depends_on:
            db:
                condition: service_healthy
            cache:
                condition: service_healthy

    websocket:
        build:
            context: .
            dockerfile: Dockerfile
        env_file: .env
        command: [ "/entrypoint.sh", "websocket" ]
        volumes:
            - .:/var/www/html
        extra_hosts:
            - "host.docker.internal:host-gateway"

        ports:
            - 6100:6100

        depends_on:
            db:
                condition: service_healthy
            cache:
                condition: service_healthy
    db:
        image: mariadb
        env_file: .env
        environment:
            - MYSQL_DATABASE=${DB_DATABASE}
            - MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
            - MYSQL_USER=${DB_USERNAME}
            - MYSQL_PASSWORD=${DB_PASSWORD}
        ports:
            - ${DB_PORT:-3306}:3306

        volumes:
            - data/mysqldata:/var/lib/mysql
            - data/init:/docker-entrypoint-initdb.d

        healthcheck:
            test:
                [
                    "CMD",
                    "mysqladmin",
                    "ping",
                    "-u",
                    "root",
                    "-p${DB_PASSWORD}",
                    "-h",
                    "localhost"
                ]
            timeout: 20s
            retries: 10

    cache:
        image: redis
        env_file: .env
        healthcheck:
            test: [ "CMD", "redis-cli", "ping" ]
```

- Create Dockerfile
```
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
RUN if [ "${APP_ENV}" = "local" ] ; then npm run dev ; else npm run prod ; fi



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
COPY entrypoint.prod.sh /entrypoint.sh
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

```

- Create apache configuration
```

<VirtualHost *:80>
        ServerAdmin  webmaster@example.com
        DocumentRoot /var/www/html/public

        ErrorLog /dev/stderr
        TransferLog /dev/stdout

        ProxyPass "/app" "ws://websocket:6001/app"
        ProxyPassReverse "/app" "ws://websocket:6001/app"
        ProxyRequests Off

</VirtualHost>

```

- Create shell script as entrypoint of container
```shell
#!/bin/bash

set -e

cd /var/www/html
php artisan config:clear
php artisan view:clear
php artisan route:clear

case $1 in
cron)
    echo "[*] Cron"
    while [ true ]; do
        php artisan schedule:run --verbose --no-interaction &
        sleep 60
    done
    ;;
supervisor)
    echo "[*] Queue"
    /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
    ;;
apache)
    echo "[*] Apache"
    php artisan horizon:install
    php artisan optimize
    php artisan migrate --force
    cron &
    apache2-foreground
    ;;
websocket)
    echo "[*] Websockets"
    php artisan websockets:serve
    ;;
*)
    echo "[!] Comando fallito ($1 non riconosciuto)!"
    exit 99
    ;;
esac

```

- Create supervisor.conf for start horizon

```ini
[supervisord]
logfile=/etc/supervisor/logs/supervisord.log ; main log file; default $CWD/supervisord.log
logfile_maxbytes=5MB         ; max main logfile bytes b4 rotation; default 50MB
logfile_backups=10           ; # of main logfile backups; 0 means none, default 10
loglevel=info                ; log level; default info; others: debug,warn,trace
pidfile=/tmp/supervisord.pid ; supervisord pidfile; default supervisord.pid
nodaemon=false               ; start in foreground if true; default false
minfds=1024                  ; min. avail startup file descriptors; default 1024
minprocs=200                 ; min. avail process descriptors;default 200

[rpcinterface:supervisor]
supervisor.rpcinterface_factory = supervisor.rpcinterface:make_main_rpcinterface

[supervisorctl]
serverurl=unix:///tmp/supervisor.sock ; use a unix:// URL  for a unix socket

[program:horizon]
process_name=%(program_name)s
command=php /var/www/html/artisan horizon
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/html/storage/logs/horizon.log
stopwaitsecs=3600

```

- Create volumes 
  - `mkdir data/mysqldata`
    
    Here we got the mariadb tables
  - `mkdir data/initdb`
  
    Here we can place the sql file to init db

- Add php dependencies
  - `composer require beyondcode/laravel-websockets` for websocket
    
     After install need to run this command:
     
     - `php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"`
     - `php artisan migrate`
     - `php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"`
  - `composer require laravel/horizon` for horizon dashboard
  - `composer require predis/predis` for redis support
  - `composer require tightenco/ziggy` for @routes directive
  - `composer require yajra/laravel-datatables-oracle` for datatable facade
  - `composer require conedevelopment/i18n` for @translations blade directive

- Setup .env
```
DB_HOST=db

BROADCAST_DRIVER=pusher

CACHE_DRIVER=redis

QUEUE_CONNECTION=redis

SESSION_DRIVER=redis

REDIS_HOST=cache

```

# Start development

- start vite on container `docker-compose exec web npm start`
- I suggest to set this alias
```shell
 alias dce="docker-compose exec"
 alias a="docker-compose exec php artisan"
```

