/**
 * you need to import the some interfaces
 */
import {
    DefineLocaleMessage,
    DefineDateTimeFormat,
    DefineNumberFormat
} from 'vue-i18n'

declare module "*.vue" {
    import type {defineComponent} from "vue";
    const component: defineComponent<{}, {}, any>;
    export default component;
}

interface ImportMetaEnv {
    readonly VITE_PUSHER_APP_KEY: string;
    readonly VITE_PUSHER_HOST: string;
    readonly VITE_PUSHER_PORT: number;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module 'vue-i18n' {
    // define the locale messages schema
    export interface DefineLocaleMessage {
        hello: string
        menu: {
            login: string
        }
        errors: string[]
    }

    // define the datetime format schema
    export interface DefineDateTimeFormat {
        short: {
            hour: 'numeric'
            minute: 'numeric'
            second: 'numeric'
            timeZoneName: 'short'
            timezone: string
        }
    }

    // define the number format schema
    export interface DefineNumberFormat {
        currency: {
            style: 'currency'
            currencyDisplay: 'symbol'
            currency: string
        }
    }
}

type Theme = 'light' | 'dark' | 'system';
