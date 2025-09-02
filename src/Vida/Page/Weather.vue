<template>
    <div
        class="relative min-h-screen overflow-x-hidden p-4 sm:p-6 bg-gradient-to-br from-white via-cyan-50 to-blue-50 dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950 space-y-6"
    >
        <div
            class="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-30 -z-10 bg-[radial-gradient(closest-side,#22d3ee,transparent)] dark:bg-[radial-gradient(closest-side,#22d3ee,transparent)]"
        ></div>
        <div
            class="absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-25 -z-10 bg-[radial-gradient(closest-side,#60a5fa,transparent)] dark:bg-[radial-gradient(closest-side,#60a5fa,transparent)]"
        ></div>

        <div class="flex flex-col sm:flex-row justify-end items-start sm:items-center text-gray-900 dark:text-white gap-2 sm:gap-0">
            <div class="text-gray-500 dark:text-slate-300">{{ currentTime }}</div>
        </div>

        <!-- Current Weather + Daily Tips -->
        <div class="flex flex-col md:flex-row gap-3 text-gray-900 dark:text-white">
            <!-- Current Weather -->
            <div
                class="flex-1 flex-col backdrop-blur-2xl bg-white/30 dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-2xl rounded-3xl flex lg:flex-row md:items-center gap-4 p-4 sm:p-6 text-gray-900 dark:text-white"
            >
                <div class="flex justify-between items-center">
                    <div class="text-3xl sm:text-4xl font-bold">{{ weatherData.temperature }}°C</div>
                    <div class="text-5xl sm:text-6xl mt-2 md:mt-0 lg:hidden block">{{ getWeatherIcon(weatherData.weathercode) }}</div>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm sm:text-base">
                    <p>{{ $t("feelsLike") }}: {{ weatherData.feels_like }}°C</p>
                    <p>{{ $t("humidity") }}: {{ weatherData.humidity }}%</p>
                    <p>{{ $t("pressure") }}: {{ weatherData.pressure }} hPa</p>
                    <p>{{ $t("wind") }}: {{ weatherData.windspeed }} km/h</p>
                    <p>{{ $t("sunrise") }}: {{ weatherData.sunrise }}</p>
                    <p>{{ $t("sunset") }}: {{ weatherData.sunset }}</p>
                </div>
                <div class="text-5xl sm:text-6xl mt-2 md:mt-0 hidden lg:block">{{ getWeatherIcon(weatherData.weathercode) }}</div>
            </div>

            <!-- Daily Tips -->
            <div class="flex-1 backdrop-blur-2xl bg-white/30 dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-2xl rounded-3xl p-4 text-gray-900 dark:text-white">
                <h3 class="font-semibold mb-2 text-cyan-500 dark:text-cyan-300">{{ $t("dailyTips") }}</h3>
                <p v-if="weatherData.weathercode === 0">{{ $t("sunny") }}</p>
                <p v-else-if="weatherData.weathercode >= 80">{{ $t("rainy") }}</p>
                <p v-else-if="weatherData.weathercode >= 71">{{ $t("snow") }}</p>
                <p v-else>{{ $t("mild") }}</p>
            </div>
        </div>

        <!-- Hourly Forecast -->
        <div class="backdrop-blur-2xl bg-white/30 dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-2xl rounded-3xl p-4 text-gray-900 dark:text-white">
            <h3 class="font-semibold mb-2 text-cyan-500 dark:text-cyan-300">{{ $t("hourlyForecast") }}</h3>

            <!-- Wrapper -->
            <div class="flex gap-4 overflow-x-auto md:overflow-x-hidden">
                <div v-for="hour in hourlyForecast" :key="hour.time" class="flex-1 min-w-[90px] flex flex-col items-center p-2 bg-gray-100/20 dark:bg-white/15 rounded-2xl">
                    <div class="text-sm sm:text-base">{{ hour.time }}</div>
                    <div class="text-xl sm:text-2xl">{{ hour.icon }}</div>
                    <div class="text-sm sm:text-base">{{ hour.temp }}°C</div>
                </div>
            </div>
        </div>

        <!-- Weekly Forecast -->
        <div
            class="backdrop-blur-2xl bg-white/30 dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-2xl rounded-3xl p-4 text-gray-900 dark:text-white overflow-x-auto"
        >
            <h3 class="font-semibold mb-2 text-cyan-500 dark:text-cyan-300">{{ $t("weeklyForecast") }}</h3>
            <div class="flex flex-nowrap md:flex-wrap gap-4 w-max md:w-full">
                <div v-for="day in weekForecast" :key="day.day" class="flex-1 flex flex-col items-center p-2 min-w-[120px]">
                    <div class="text-sm font-medium">{{ day.day }}</div>
                    <div class="text-2xl">{{ day.icon }}</div>
                    <div class="text-sm">{{ day.max }}° / {{ day.min }}°</div>
                </div>
            </div>
        </div>

        <!-- Temperature Chart -->
        <div class="backdrop-blur-2xl bg-white/30 dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-2xl rounded-3xl p-4 text-gray-900 dark:text-white">
            <h3 class="font-semibold mb-2 text-cyan-500 dark:text-cyan-300">{{ $t("temperatureChart") }}</h3>
            <canvas ref="chartCanvas" class="h-40 w-full"></canvas>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from "chart.js";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

const city = ref("");
const weatherData = ref({});
const weekForecast = ref([]);
const hourlyForecast = ref([]);
const currentTime = ref(new Date().toLocaleTimeString());

const { t } = useI18n();
const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";
    if (code === 1) return "🌤️";
    if (code === 2) return "⛅";
    if (code === 3) return "☁️";
    if (code >= 45 && code <= 48) return "🌫️";
    if (code >= 51 && code <= 67) return "🌦️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌧️";
    if (code >= 95) return "⛈️";
    return "❔";
};

const fetchWeather = async (lat, lon) => {
    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&hourly=temperature_2m,weathercode&timezone=Asia/Tehran`
        );
        const data = await res.json();
        weatherData.value = {
            ...data.current_weather,
            humidity: data.hourly.relativehumidity_2m ? data.hourly.relativehumidity_2m[0] : 50,
            pressure: data.hourly.pressure_msl ? data.hourly.pressure_msl[0] : 1013,
            feels_like: data.current_weather.temperature,
            sunrise: "06:12", 
            sunset: "18:45", 
        };

        weekForecast.value = data.daily.time.slice(0, 7).map((date, i) => ({
            day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
            max: data.daily.temperature_2m_max[i],
            min: data.daily.temperature_2m_min[i],
            icon: getWeatherIcon(data.daily.weathercode[i]),
        }));

        hourlyForecast.value = data.hourly.time.slice(0, 10).map((t, i) => ({
            time: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            temp: data.hourly.temperature_2m[i],
            icon: getWeatherIcon(data.hourly.weathercode[i]),
        }));
    } catch (err) {
        console.error(err);
    }
};

onMounted(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const weather = await fetchWeather(position.coords.latitude, position.coords.longitude);
                console.log(weather);
            },
            (error) => {
                console.error("Geolocation error:", error);
                fetchWeather(35.6892, 51.389); // Tehran fallback
            }
        );
    } else {
        fetchWeather(35.6892, 51.389);
    }

    setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString();
    }, 1000);
});

const chartCanvas = ref(null);
let chartInstance = null;

const renderChart = () => {
    if (!chartCanvas.value) return;

    const labels = hourlyForecast.value.map((h) => h.time);
    const maxTemps = hourlyForecast.value.map((h) => h.temp);
    const weekLabels = weekForecast.value.map((d) => d.day);
    const weekMax = weekForecast.value.map((d) => d.max);
    const weekMin = weekForecast.value.map((d) => d.min);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(chartCanvas.value, {
        type: "line",
        data: {
            labels: labels.length ? labels : weekLabels,
            datasets: labels.length
                ? [
                      {
                          label: "Hourly Temp (°C)",
                          data: maxTemps,
                          borderColor: "#ff5722",
                          backgroundColor: "rgba(255,87,34,0.2)",
                          tension: 0.3,
                      },
                  ]
                : [
                      {
                          label: "Max Temp (°C)",
                          data: weekMax,
                          borderColor: "#ff5722",
                          backgroundColor: "rgba(255,87,34,0.2)",
                          tension: 0.3,
                      },
                      {
                          label: "Min Temp (°C)",
                          data: weekMin,
                          borderColor: "#2196f3",
                          backgroundColor: "rgba(33,150,243,0.2)",
                          tension: 0.3,
                      },
                  ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                title: { display: false },
            },
            scales: { y: { beginAtZero: false } },
        },
    });
};

watch([weekForecast, hourlyForecast], () => {
    renderChart();
});
</script>

<style scoped>
</style>
