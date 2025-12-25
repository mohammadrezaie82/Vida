<template>
  <v-app :theme="activeTheme" >
    <!-- Navbar -->
    <v-app-bar app class="relative backdrop-blur-2xl shadow-2xl z-50">
      <!-- Gradient background -->
      <div class="absolute inset-0 -z-10 bg-gradient-to-br from-white via-cyan-50 to-blue-50 dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950"></div>

      <!-- Logo -->
      <div class="flex items-center gap-3 ms-6 cursor-pointer" @click="router.push('/dashboard/dashboard-home')">
        <img :src="myLogo" alt="Logo" class="w-10 h-10 rounded-xl shadow-sm" />
        <span class="text-2xl font-bold text-cyan-500 dark:text-cyan-300">Vida</span>
      </div>

      <v-spacer></v-spacer>

      <div class="items-center gap-3 sm:gap-6 flex">
        <!-- Location -->
        <div v-if="userStore.user" class="hidden sm:flex items-center gap-2 text-sm px-3 py-1 rounded-xl text-slate-900 dark:text-white shadow">
          <span>{{ userStore.user.province }} {{ userStore.user.city ? ',' : '' }} {{ userStore.user.city }}</span>
          <v-icon size="18" class="text-cyan-500 dark:text-cyan-400">mdi-map-marker</v-icon>
        </div>

        <!-- Language Menu -->
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="flex items-center px-3 py-1 rounded-2xl bg-white/15 dark:bg-gray-900/30 text-white/80 shadow-lg hover:bg-white/20 dark:hover:bg-gray-800/40 transition"
            >
              <img v-if="currentLanguage === 'FA'" :src="irLogo" width="20" class="rounded-sm mr-2" />
              <img v-if="currentLanguage === 'EN'" :src="usLogo" width="20" class="rounded-sm mr-2" />
              <span class="text-sm font-medium text-black dark:!text-gray-50">{{ currentLanguageLabel }}</span>
              <v-icon size="18" class="ml-1 text-black dark:!text-gray-50">mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <div class="mt-2 w-36 rounded-3xl backdrop-blur-2xl bg-white/15 dark:bg-gray-900/30 border border-white/10 dark:border-gray-800 shadow-2xl p-2 flex flex-col gap-2">
            <button @click="changeLanguage('FA')" class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/40 transition text-black dark:!text-gray-50">
              <img :src="irLogo" width="18" class="rounded-sm" />
              <span>فارسی</span>
            </button>
            <button @click="changeLanguage('EN')" class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/40 transition text-black dark:!text-gray-50">
              <img :src="usLogo" width="18" class="rounded-sm" />
              <span>English</span>
            </button>
          </div>
        </v-menu>

        <!-- Theme Toggle -->
        <v-btn icon @click="toggleTheme" class="rounded-full p-2 shadow-lg hover:shadow-xl transition">
          <v-icon v-if="isDark" class="text-yellow-400">mdi-white-balance-sunny</v-icon>
          <v-icon v-else class="text-gray-700 dark:text-gray-200">mdi-weather-night</v-icon>
        </v-btn>

        <!-- User Info -->
        <div v-if="userStore.user" class="flex items-center gap-2 me-6">
          <span class="font-medium text-slate-900 dark:text-white hidden lg:block">{{ userStore.user.name }}</span>
          <div
            class="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white flex items-center justify-center text-sm font-bold shadow cursor-pointer"
            @click="router.push('/dashboard/profile')"
          >
            {{ userStore.user.name?.[0] || "U" }}
          </div>
        </div>
      </div>
    </v-app-bar>

    <!-- Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :mini-variant="isMini"
      :width="drawerWidth"
      permanent
      class="relative backdrop-blur-2xl bg-white/70 dark:bg-gray-900/30 border-0 shadow-2xl z-40 transition-all duration-300"
    >
      <div class="absolute inset-0 -z-10 bg-gradient-to-b from-white via-cyan-50 to-blue-50 dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950"></div>

      <v-list density="comfortable" nav class="relative z-10 p-4">
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.route" class="rounded-2xl mb-3 hover:bg-cyan-50 dark:hover:bg-gray-800 transition shadow justify-center lg:justify-start">
          <div class="flex items-center gap-3 w-full text-slate-900 dark:text-white">
            <div class="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-100 dark:bg-gray-700 shadow">
              <template v-if="typeof item.icon === 'string' && item.icon.startsWith('mdi-')">
                <v-icon class="text-cyan-600 dark:text-cyan-400">{{ item.icon }}</v-icon>
              </template>
              <template v-else>
                <img :src="item.icon" class="w-5 h-5" />
              </template>
            </div>
            <span class="font-medium" v-if="!isMini">{{ item.title }}</span>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="p-0">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserStore } from "../stores/user";
import myLogo from "../assets/Logo.svg";
import irLogo from "../assets/Ir.svg";
import usLogo from "../assets/us.svg";

const router = useRouter();
const { t, locale } = useI18n();
const userStore = useUserStore();

const activeTheme = ref("light");
const isDark = ref(false);
const drawer = ref(true);
const screenWidth = ref(window.innerWidth);
const isMini = computed(() => screenWidth.value < 1024);
const drawerWidth = computed(() => (isMini.value ? 72 : 256));

const items = computed(() => [
  { title: t("dashboard"), icon: "mdi-view-dashboard", route: "/dashboard/dashboard-home" },
  { title: t("todoList"), icon: "mdi-clipboard-list", route: "/dashboard/todo-list" },
  { title: t("weather"), icon: "mdi-weather-cloudy", route: "/dashboard/weather" },
  { title: t("profile"), icon: "mdi-chart-bar", route: "/dashboard/profile" },
]);

const currentLanguage = ref(locale.value);
const currentLanguageLabel = computed(() => (currentLanguage.value === "FA" ? "fa" : "Us"));

// init theme
const initTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  const html = document.documentElement;
  if (savedTheme === "dark") {
    html.classList.add("dark");
    isDark.value = true;
    activeTheme.value = "dark";
  } else {
    html.classList.remove("dark");
    isDark.value = false;
    activeTheme.value = "light";
  }
};
onMounted(initTheme);

const toggleTheme = () => {
  const html = document.documentElement;
  if (isDark.value) {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
    isDark.value = false;
    activeTheme.value = "light";
  } else {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
    isDark.value = true;
    activeTheme.value = "dark";
  }
};

const changeLanguage = (lang: string) => {
  locale.value = lang;
  currentLanguage.value = lang;
  localStorage.setItem("lang", lang);
};

// handle window resize
const onResize = () => (screenWidth.value = window.innerWidth);
onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));

// sync user store with storage (multi-tab)
watch(userStore.user, (newVal) => {
  if (newVal) localStorage.setItem("user", JSON.stringify(newVal));
}, { deep: true });

window.addEventListener("storage", (event) => {
  if (event.key === "user" && event.newValue) {
    userStore.user = JSON.parse(event.newValue);
  }
});
</script>
