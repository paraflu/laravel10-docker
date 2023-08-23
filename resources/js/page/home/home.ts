import {createApp} from "vue";
import HomePage from "@js/page/home/HomePage.vue";
import {i18n} from "@js/i18n";

createApp(HomePage)
    .use(i18n)
    .mount('#app');
