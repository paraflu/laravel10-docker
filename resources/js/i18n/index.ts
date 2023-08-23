import {createI18n} from "vue-i18n";

const transpile = (translations) => {
    if (typeof translations === "string") {
        return translations.replace(/:(?<key>\w+)/g, "{$1}");
    }
    for (let tr in translations) {
        translations[tr] = transpile(translations[tr]);
    }
    return translations;
};

if (!window.translations && !top?.window.translations) {
    console.error("[createi18n] window.translations non definito!");
}

const translations = window.translations ?? top?.window.translations;

export const i18n = createI18n({
    legacy: false,
    locale: "it",
    fallbackLocale: "it",
    messages: {
        it: transpile(translations),
    },
});
