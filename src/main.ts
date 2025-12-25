import { createApp, watch } from "vue";
import App from "./App.vue";
import { vuetify } from "./plugins/vuetify.ts";
import "@mdi/font/css/materialdesignicons.css";
import "./style.css";
import router from "./router";
import VCalendar from "v-calendar";
import "v-calendar/style.css";

import { createI18n } from "vue-i18n";
import fa from "./i18n/fa.json";
import us from "./i18n/us.json";
import { createPinia } from "pinia";

type Locale = "FA" | "EN";

const savedLang = (localStorage.getItem("lang") as Locale) || "FA";

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

const pinia = createPinia();

app.use(router);
app.use(vuetify);
app.use(VCalendar, {});
app.use(pinia);
app.use(i18n);

watch(
  () => i18n.global.locale.value as Locale,
  (locale: Locale) => {
    const isRTL = locale === "FA";

    document.documentElement.lang = isRTL ? "fa" : "en";
    document.documentElement.dir = isRTL ? "rtl" : "ltr";

    // Vuetify locale
    vuetify.locale.current.value = isRTL ? "fa" : "en";

    localStorage.setItem("lang", locale);
  },
  { immediate: true }
);

app.mount("#app");
