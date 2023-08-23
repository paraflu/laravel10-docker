import '../css/app.scss';
import './bootstrap';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;
console.log( import.meta.env.VITE_PUSHER_APP_KEY)
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: window.location.hostname,
    httpHost: window.location.hostname,
    httpsHost: window.location.hostname,
    wssHost: window.location.hostname,
    wsPort: window.location.port ?? 80,
    wssPort: window.location.port ?? 80,
    cluster: 'eu',
    forceTLS: false,
    disableStats: false,
});

window.Echo.channel('public')
    .listen('.event', (data) => console.log(data))
