import {Channel} from "laravel-echo";
import {Ref, onUnmounted, ref} from "vue";
import {onMounted} from "vue";

import Pusher from "pusher-js";
import Echo from "laravel-echo";

const opt = {
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    wsHost: window.location.hostname,
    httpHost: window.location.hostname,
    httpsHost: window.location.hostname,
    wssHost: window.location.hostname,
    // path: "/app",
    wsPort: window.location.port ?? 80,
    wssPort: window.location.port ?? 80,
    forceTLS: false,
    disableStats: false,
};

// console.log("[echo] ", opt);

type MessageFunctionHandler = (event: string, message: any) => void;

/**
 *
 * @param channel Nome del canale dove mettersi in ascolto
 * @param privateChannel Indica che il canale è un canale privato
 * @param eventName nome o nomi degli eventi da ascoltare
 * @param handleMessage oggetto con il nome dell'evento e corrispondente handler
 * @returns
 */
export function useEcho(
    channel: string,
    privateChannel: boolean,
    eventName: string | string[],
    handleMessage: { [eventName: string]: Function } | MessageFunctionHandler
): {
    connection: Channel | undefined;
    messages: Ref<{ eventName: string; message: any } | null>;
    subscribed: Ref<boolean>;
} {
    let connection: Channel | undefined;
    const echo = new Echo(opt);

    const messages = ref<{ eventName: string; message: any } | null>(null);
    const subscribed = ref(false);

    onMounted(() => {
        connection = echo[privateChannel ? "private" : "channel"](channel);

        connection?.error((err: Error | any) => {
            console.error("[useEcho] errore", err);
        });

        connection?.subscribed(() => {
            subscribed.value = true;
        });

        if (typeof eventName === "string") {
            eventName = [eventName];
        }

        eventName
            // Aggiungo il '.' se necessario
            .map((e) => (/^\./.test(e) ? e : `.${e}`))
            .forEach((evt) =>
                connection?.listen(evt, (message: any) => {
                    messages.value = {eventName: evt, message};
                    if (typeof handleMessage === "function") {
                        handleMessage(evt, message);
                    } else if (handleMessage[evt]) {
                        handleMessage[evt](message);
                    } else {
                        console.warn("[useEcho] evento non gestito", evt);
                    }
                })
            );
    });

    onUnmounted(() => {
        echo.leave(channel);
    });

    return {
        // canale di connessione
        connection,
        // ultimo messaggio ricevuto
        messages,
        // stato sottoscrizione
        subscribed,
    };
}
