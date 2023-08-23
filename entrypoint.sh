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
    # echo "* * * * * cd /var/www/html && php artisan schedule:run >> /dev/null 2>&1" | crontab -
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
