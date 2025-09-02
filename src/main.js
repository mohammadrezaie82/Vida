import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./vuetify";
import "@mdi/font/css/materialdesignicons.css";
import "./style.css";
import router from "./router";
import VCalendar from "v-calendar";
import "v-calendar/style.css";

// i18n
import { createI18n } from "vue-i18n";
import fa from "./i18n/fa.json";
import us from "./i18n/us.json";

// ایجاد i18n
const i18n = createI18n({
  legacy: false,       // برای Composition API
  locale: localStorage.getItem("lang") || "FA", // پیش‌فرض فارسی
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
app.use(i18n); // اضافه کردن i18n

app.mount("#app");
