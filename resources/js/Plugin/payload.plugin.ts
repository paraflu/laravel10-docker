/**
 * Gestione Payload
 *
 * Recupera il data-app dall'elemento root se definito
 *
 * Esempio
 *
 * ```js
 * import payload from "@/plugin/payload";
 *
 * const app = createApp({...}).use(payload);
 * ```
 *
 * All'interno del componente è possibile recuperare i dati tramite il metodo `usePayload`
 *
 * ```js
 * const payload = usePayload();
 * ```
 *
 * Il dato restituito è di tipo {{Payload}} con eventuale generics per gli altri dati potenzialmente
 * restituiti dal controller
 *
 */
import Swal from "sweetalert2";
import {Ref} from "vue";
import {App, ComponentPublicInstance} from "vue";
import {ref, inject} from "vue";

export default {
    install: (app: App<any>) => {
        /**
         * Ridefinisco il metodo mount per intercettare
         * l'elemento root
         */

        const _mount = app.mount;

        const payload = ref<Payload | null>(null);

        app.mount = (
            rootContainer: any | string,
            isHydrate?: boolean,
            isSVG?: boolean
        ): ComponentPublicInstance => {
            const rootElm =
                typeof rootContainer === "string"
                    ? document.querySelector(rootContainer)
                    : rootContainer;
            if (rootElm?.dataset?.app) {
                try {
                    payload.value = JSON.parse(
                        rootElm.dataset.app
                    ) as Payload | null;
                } catch (error) {
                    console.error("[payload-plugin]", error);
                }
            }
            return _mount(rootContainer, isHydrate, isSVG);
        };

        app.provide("payload", payload);
    },
};

interface PayloadOptions {
    autoShowStatus?: boolean;
    autoShowError?: boolean;
}

export function usePayload<T>(
    opts: PayloadOptions = {autoShowStatus: true, autoShowError: true}
): Ref<(Payload & T) | null> {
    const payload = inject<Ref<Payload & T>>("payload");
    if (opts.autoShowStatus) {
        if (payload?.value?.status) {
            Swal.fire({
                icon: "info",
                text: payload.value.status,
                toast: true,
                showConfirmButton: false,
                position: "top-right",
                timerProgressBar: true,
                timer: 3000,
            });
        }
    }
    if (opts.autoShowError) {
        if (payload?.value?.errors) {
            Swal.fire({
                icon: "error",
                text: payload.value.errors,
                toast: true,
                position: "top-right",
                timerProgressBar: true,
                showConfirmButton: false,
                timer: 3000,
            });
        }
    }
    return payload ?? ref(null);
}

/**
 * Interfaccia che rappresenta la porzione di dato
 */
export interface Payload {
    status: any;
    errors: any;
    role: "admin" | "dsoperator" | "operator" | "user";
}
