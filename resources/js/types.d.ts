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
