import { createApp, watch } from "vue";
import App from "./App.vue";
import { vuetify } from "./plugins/vuetify";
import "@mdi/font/css/materialdesignicons.css";
import "./style.css";
import router from "./router";
import VCalendar from "v-calendar";
import "v-calendar/style.css";

import { createI18n } from "vue-i18n";
import fa from "./i18n/fa.json";
import en from "./i18n/en.json";
import { createPinia } from "pinia";

type Locale = "fa" | "en";

const savedLang = (localStorage.getItem("lang") as Locale) || "fa";

const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: "fa",
  messages: {
    fa,
    en,
  },
});

const app = createApp(App);

const pinia = createPinia();

app.use(router);
app.use(vuetify);
app.use(VCalendar, {});
app.use(pinia);
app.use(i18n);

watch(
  () => i18n.global.locale.value as Locale,
  (locale: Locale) => {
    const isRTL = locale === "fa";

    document.documentElement.lang = isRTL ? "fa" : "en";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";

    vuetify.locale.current.value = isRTL ? "fa" : "en";

    localStorage.setItem("lang", locale);
  },
  { immediate: true },
);

app.mount("#app");
