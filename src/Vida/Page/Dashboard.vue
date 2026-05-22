<template>
  <v-app :theme="activeTheme">
    <v-main
      class="relative bg-gradient-to-br from-white via-cyan-50 to-blue-50 dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950 overflow-hidden"
    >
      <!-- پس‌زمینه‌ها -->
      <div
        class="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-30 -z-10"
        style="background: radial-gradient(closest-side, #22d3ee, transparent)"
      ></div>
      <div
        class="absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-25 -z-10"
        style="background: radial-gradient(closest-side, #60a5fa, transparent)"
      ></div>

      <div class="flex flex-col items-center justify-start gap-8 p-6 pt-16">
        <div
          class="backdrop-blur-2xl bg-white/70 dark:bg-white/10 border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl w-full max-w-2xl p-8 text-center text-slate-900 dark:text-white animate-fadeIn"
        >
          <h1 class="text-4xl font-bold mb-4">
            {{ greetingMessage }}, {{ user?.name }}!
          </h1>

          <div class="text-5xl font-mono animate-pulse mb-2">
            {{ time.toLocaleTimeString() }}
          </div>

          <div class="flex justify-center items-center gap-4">
            <div
              class="text-xl font-semibold mb-4 cursor-pointer select-none"
              @click="typeDate = typeDate === 'fa' ? 'en' : 'fa'"
            >
              <span v-if="typeDate === 'fa'">
                {{
                  time.toLocaleDateString("fa-IR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }}
              </span>
              <span v-else>
                {{
                  time.toLocaleDateString("en-GB", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }}
              </span>
            </div>
          </div>

          <p class="text-lg text-slate-700 dark:text-slate-200">
            {{ t("hopeGreatDay") }}
          </p>
        </div>

        <!-- TODO و Weather -->
        <div class="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
          <div
            class="flex-1 backdrop-blur-2xl bg-white/70 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-6 text-slate-900 dark:text-white"
          >
            <h2 class="text-2xl font-bold mb-4">{{ t("todaysTodo") }}</h2>
            <ul class="space-y-2 h-[8.5rem]" v-if="todos.length !== 0">
              <li
                v-for="todo in todos.slice(0, 5)"
                :key="todo.id"
                class="flex justify-between items-center"
              >
                <span :class="todo.done ? 'line-through text-gray-400' : ''">{{
                  todo.title
                }}</span>
                <span v-if="todo.done" class="text-green-400 font-bold">✔</span>
              </li>
            </ul>
            <p
              v-if="todos.length === 0"
              class="text-slate-500 dark:text-slate-400 h-[8.5rem]"
            >
              {{ t("addTodoToday") }}
            </p>
            <button
              class="mt-4 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition"
              @click="goToToDo"
            >
              {{ todos.length === 0 ? t("addTodo") : t("viewDetails") }}
            </button>
          </div>

          <div
            class="flex-1 backdrop-blur-2xl bg-white/70 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-6 text-center text-slate-900 dark:text-white"
          >
            <h2 class="text-2xl font-bold mb-4">{{ t("todaysWeather") }}</h2>
            <div class="text-6xl mb-2">
              <img
                v-if="weather.icon"
                :src="weather.icon"
                alt="weather icon"
                class="w-16 h-16 mx-auto"
              />
            </div>
            <div class="text-3xl font-semibold">{{ weather.temp }}°C</div>
            <div class="text-lg text-slate-700 dark:text-slate-200">
              {{ weather.condition }}
            </div>
            <button
              class="mt-4 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition"
              @click="goToWeather"
            >
              {{ t("viewDetails") }}
            </button>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserStore, type User } from "../../stores/user";
import { useTodoStore, type Todo } from "../../stores/todoStore";

import clearIcon from "../../assets/weather/day.svg";
import partlyCloudyIcon from "../../assets/weather/cloudy-day-1.svg";
import cloudyIcon from "../../assets/weather/cloudy.svg";
import rainIcon from "../../assets/weather/rainy-1.svg";
import snowIcon from "../../assets/weather/snowy-1.svg";
import drizzleIcon from "../../assets/weather/rainy-1.svg";
import fogIcon from "../../assets/weather/thunder.svg";

const router = useRouter();
const { t } = useI18n();

type Locale = "fa" | "en";
const typeDate = ref<Locale>("fa");

const time = ref(new Date());
let timer: number;

const userStore = useUserStore();
const user = computed<User | null>(() => userStore.user);

const todoStore = useTodoStore();
todoStore.init();

const todayStr = computed(() => new Date().toISOString().slice(0, 10));
const todos = computed<Todo[]>(() =>
  todoStore.todos.filter((t) => t.date === todayStr.value),
);

const weather = ref({
  temp: 0,
  condition: "",
  icon: "",
  loading: false,
});

const greetingMessage = computed(() => {
  const hour = time.value.getHours();
  if (hour < 12) return t("goodMorning");
  if (hour < 17) return t("goodAfternoon");
  if (hour < 20) return t("goodEvening");
  return t("goodNight");
});

async function fetchWeather(lat: number, lon: number) {
  weather.value.loading = true;

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&timezone=auto`,
    );

    const data = await res.json();
    const today = data.daily;

    weather.value.temp = today.temperature_2m_max[0];
    const code = today.weathercode[0];

    const conditionMap: Record<number, string> = {
      0: "Clear",
      1: "Partly Cloudy",
      2: "Partly Cloudy",
      3: "Cloudy",
      45: "Fog",
      48: "Fog",
      51: "Drizzle",
      53: "Drizzle",
      55: "Drizzle",
      61: "Rain",
      63: "Rain",
      65: "Rain",
      71: "Snow",
      73: "Snow",
      75: "Snow",
    };

    const condition = conditionMap[code] || "Cloudy";
    weather.value.condition = condition;

    const icons: Record<string, string> = {
      Clear: clearIcon,
      "Partly Cloudy": partlyCloudyIcon,
      Cloudy: cloudyIcon,
      Rain: rainIcon,
      Snow: snowIcon,
      Drizzle: drizzleIcon,
      Fog: fogIcon,
    };

    weather.value.icon = icons[condition] || "";
  } catch (err) {
    weather.value.condition = "N/A";
  } finally {
    weather.value.loading = false;
  }
}

onMounted(() => {
  timer = window.setInterval(() => {
    time.value = new Date();
  }, 1000);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeather(35.6892, 51.389),
    );
  } else {
    fetchWeather(35.6892, 51.389);
  }
});

onUnmounted(() => clearInterval(timer));

function goToToDo() {
  router.push("/dashboard/todo-list");
}
function goToWeather() {
  router.push("/dashboard/weather");
}
</script>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.8s ease-out;
}
</style>
