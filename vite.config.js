

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';

export default defineConfig({
    define: {
        __VUE_I18N_FULL_INSTALL__: true,
        __VUE_I18N_LEGACY_API__: false,
        __INTLIFY_PROD_DEVTOOLS__: false,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources'),
            '@js': resolve(__dirname, 'resources/js'),
            ziggy: 'vendor/tightenco/ziggy/dist/vue.es.js',
            "~fa": resolve(__dirname, "node_modules", "@fortawesome", "fontawesome-free", "scss"),
            vue: "vue/dist/vue.esm-bundler",
        },
    },
    server: {
        host: '0.0.0.0',
        hmr: {
            host: 'localhost',
        },
    },
    plugins: [
        laravel([
            'resources/js/app.ts',
        ]),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
});
