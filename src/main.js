import { createApp, watch } from "vue";
import App from "./App.vue";
import {vuetify} from "./vuetify";
import "@mdi/font/css/materialdesignicons.css";
import "./style.css";
import router from "./router";
import VCalendar from "v-calendar";
import "v-calendar/style.css";

import { createI18n } from "vue-i18n";
import fa from "./i18n/fa.json";
import us from "./i18n/us.json";
import { createPinia } from "pinia";

const savedLang = localStorage.getItem("lang") || "FA";

const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: "FA",
  messages: {
    FA: fa,
    EN: us,
  },
});

const app = createApp(App);

app.use(router);
app.use(vuetify);
app.use(VCalendar, {});
app.use(createPinia());
app.use(i18n);

watch(
  () => i18n.global.locale.value,
  (locale) => {
    const isRTL = locale === "FA";

    document.documentElement.lang = locale === "FA" ? "fa" : "en";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";

    vuetify.locale.current.value = locale === "FA" ? "fa" : "en";

    localStorage.setItem("lang", locale);
  },
  { immediate: true }
);

app.mount("#app");
