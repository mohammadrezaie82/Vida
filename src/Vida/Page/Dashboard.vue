<template>
    <v-app :theme="activeTheme">
        <v-main class="relative bg-gradient-to-br from-white via-cyan-50 to-blue-50 dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950 overflow-hidden">
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
                    <h1 class="text-4xl font-bold mb-4">{{ greetingMessage }}, {{ user?.name }}!</h1>

                    <div class="text-5xl font-mono animate-pulse mb-2">
                        {{ time.toLocaleTimeString() }}
                    </div>

                    <div class="flex justify-center items-center gap-4">
                        <div class="text-xl font-semibold mb-4 cursor-pointer select-none" @click="typeDate = typeDate === 'FA' ? 'EN' : 'FA'">
                            <span v-if="typeDate === 'FA'">
                                {{ time.toLocaleDateString("fa-IR", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) }}
                            </span>
                            <span v-else>
                                {{ time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) }}
                            </span>
                        </div>
                    </div>

                    <p class="text-lg text-slate-700 dark:text-slate-200">{{ t("hopeGreatDay") }}</p>
                </div>

                <div class="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
                    <div
                        class="flex-1 backdrop-blur-2xl bg-white/70 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-6 text-slate-900 dark:text-white"
                    >
                        <h2 class="text-2xl font-bold mb-4">{{ t("todaysTodo") }}</h2>
                        <ul class="space-y-2">
                            <li v-for="todo in todos.slice(0, 5)" :key="todo.id" class="flex justify-between items-center">
                                <span :class="todo.done ? 'line-through text-gray-400' : ''">{{ todo.title }}</span>
                                <span v-if="todo.done" class="text-green-400 font-bold">✔</span>
                            </li>
                        </ul>
                        <button
                            class="mt-4 w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition"
                            @click="goToToDo"
                        >
                            {{ t("viewDetails") }}
                        </button>
                    </div>

                    <div
                        class="flex-1 backdrop-blur-2xl bg-white/70 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-6 text-center text-slate-900 dark:text-white"
                    >
                        <h2 class="text-2xl font-bold mb-4">{{ t("todaysWeather") }}</h2>
                        <div class="text-6xl mb-2">{{ weather.icon }}</div>
                        <div class="text-3xl font-semibold">{{ weather.temp }}°C</div>
                        <div class="text-lg text-slate-700 dark:text-slate-200">{{ weather.condition }}</div>
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
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const user = ref({});
const time = ref(new Date());
const { t } = useI18n();
const typeDate = ref("FA");
let timer;

onMounted(() => {
    timer = setInterval(() => {
        time.value = new Date();
    }, 1000);
});

onUnmounted(() => clearInterval(timer));
onMounted(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        user.value = JSON.parse(storedUser);
    }
});

const greetingMessage = computed(() => {
    const hour = time.value.getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 17) return t("goodAfternoon");
    if (hour < 20) return t("goodEvening");
    return t("goodNight");
});
const todos = ref([
    { id: 1, title: "Submit report", done: false },
    { id: 2, title: "Team meeting at 11 AM", done: true },
    { id: 3, title: "Check emails", done: false },
    { id: 4, title: "Plan tomorrow tasks", done: false },
]);

const weather = ref({
    temp: null,
    condition: "",
    icon: "",
    loading: true,
});

async function fetchWeather(lat, lon) {
    console.log(lat, lon);
    weather.value.loading = true;
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,weathercode&timezone=auto`);
        const data = await response.json();
        const today = data.daily;

        weather.value.temp = today.temperature_2m_max[0];

        const code = today.weathercode[0];
        if (code === 0) weather.value.condition = "Clear";
        else if ([1, 2].includes(code)) weather.value.condition = "Partly Cloudy";
        else if ([3, 45, 48].includes(code)) weather.value.condition = "Fog";
        else if ([51, 53, 55, 56, 57].includes(code)) weather.value.condition = "Drizzle";
        else if ([61, 63, 65, 66, 67].includes(code)) weather.value.condition = "Rain";
        else if ([71, 73, 75, 77, 85, 86].includes(code)) weather.value.condition = "Snow";
        else weather.value.condition = "Cloudy";

        const icons = {
            Clear: "☀️",
            "Partly Cloudy": "⛅",
            Cloudy: "☁️",
            Rain: "🌧️",
            Snow: "❄️",
            Drizzle: "🌦️",
            Fog: "🌫️",
        };
        weather.value.icon = icons[weather.value.condition] || "🌡️";
    } catch (error) {
        console.error(error);
        weather.value.condition = "N/A";
        weather.value.icon = "❓";
    } finally {
        weather.value.loading = false;
    }
}

onMounted(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeather(lat, lon);
            },
            (error) => {
                console.warn("Geolocation denied or failed, using default city (Tehran)");
                fetchWeather(35.6892, 51.389);
            }
        );
    } else {
        console.warn("Geolocation not supported, using default city (Tehran)");
        fetchWeather(35.6892, 51.389);
    }
});

function goToToDo() {
    router.push("/dashboard/todo-list");
}
function goToWeather() {
    router.push("/dashboard/weather");
}
function changeDate(item) {
    typeDate.value = item;
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
