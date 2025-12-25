<template>
    <div
        class="relative min-h-screen overflow-hidden  p-4 sm:p-6 bg-gradient-to-br from-white via-cyan-50 to-blue-50 dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950 space-y-6"
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
                    <div class="text-5xl sm:text-6xl mt-2 md:mt-0 lg:hidden block">
                        <img v-if="getWeatherIcon(weatherData.weathercode)" :src="getWeatherIcon(weatherData.weathercode)" alt="hour icon" class="w-16 h-16 mx-auto" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm sm:text-base">
                    <p>{{ $t("feelsLike") }}: {{ weatherData.feels_like }}°C</p>
                    <p>{{ $t("humidity") }}: {{ weatherData.humidity }}%</p>
                    <p>{{ $t("pressure") }}: {{ weatherData.pressure }} hPa</p>
                    <p>{{ $t("wind") }}: {{ weatherData.windspeed }} km/h</p>
                    <p>{{ $t("sunrise") }}: {{ weatherData.sunrise }}</p>
                    <p>{{ $t("sunset") }}: {{ weatherData.sunset }}</p>
                </div>
                <div class="text-5xl sm:text-6xl mt-2 md:mt-0 hidden lg:block">
                    <img v-if="getWeatherIcon(weatherData.weathercode)" :src="getWeatherIcon(weatherData.weathercode)" alt="hour icon" class="w-16 h-16 mx-auto" />
                </div>
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
                    <div class="text-xl sm:text-2xl"><img v-if="hour.icon" :src="hour.icon" alt="hour icon" class="w-16 h-16 mx-auto" /></div>
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
                    <div class="text-2xl"><img v-if="day.icon" :src="day.icon" alt="day icon" class="w-16 h-16 mx-auto" /></div>
                    <div class="text-sm">{{ day.max }}° / {{ day.min }}°</div>
                </div>
            </div>
        </div>

        <!-- Temperature Chart -->
        <div class="backdrop-blur-2xl bg-white/30 dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-2xl rounded-3xl p-4 text-gray-900 dark:text-white">
            <h3 class="font-semibold mb-2 text-cyan-500 dark:text-cyan-300">{{ $t("temperatureChart") }}</h3>
            <canvas ref="chartCanvas" style="height: 200px; width: 100%"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from "chart.js";
import clearIcon from "../../assets/weather/day.svg";
import partlyCloudyIcon1 from "../../assets/weather/cloudy-day-1.svg";
import partlyCloudyIcon3 from "../../assets/weather/cloudy-day-3.svg";
import cloudyIcon from "../../assets/weather/cloudy.svg";
import rainIcon from "../../assets/weather/rainy-1.svg";
import snowIcon4 from "../../assets/weather/snowy-4.svg";
import snowIcon6 from "../../assets/weather/snowy-6.svg";
import drizzleIcon from "../../assets/weather/rainy-1.svg";
import fogIcon from "../../assets/weather/thunder.svg";
import { onUnmounted } from "vue";

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

interface WeatherData {
    temperature: number;
    weathercode: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    windspeed: number;
    sunrise: string;
    sunset: string;
}

interface HourlyForecast {
    time: string;
    temp: number;
    icon: string;
}

interface WeekForecast {
    day: string;
    max: number;
    min: number;
    icon: string;
}

const weatherData = ref<WeatherData>({
    temperature: 0,
    weathercode: 0,
    feels_like: 0,
    humidity: 0,
    pressure: 0,
    windspeed: 0,
    sunrise: "",
    sunset: "",
});
const hourlyForecast = ref<HourlyForecast[]>([]);
const weekForecast = ref<WeekForecast[]>([]);
const currentTime = ref(new Date().toLocaleTimeString());

const { t } = useI18n();
const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;
let timeInterval: number;

const getWeatherIcon = (code: number) => {
    if (code === 0) return clearIcon;
    if (code === 1) return partlyCloudyIcon1;
    if (code === 2) return partlyCloudyIcon3;
    if (code === 3) return cloudyIcon;
    if (code >= 45 && code <= 48) return fogIcon;
    if (code >= 51 && code <= 67) return rainIcon;
    if (code >= 71 && code <= 77) return snowIcon4;
    if (code >= 80 && code <= 82) return snowIcon6;
    if (code >= 95) return drizzleIcon;
    return clearIcon;
};

const fetchWeather = async (lat: number, lon: number) => {
    try {
        const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&hourly=temperature_2m,weathercode,relativehumidity_2m,pressure_msl&windspeed&timezone=Asia/Tehran`
        );
        const data = await res.json();

        const current = data.current_weather;
        weatherData.value = {
            temperature: current.temperature,
            weathercode: current.weathercode,
            feels_like: current.temperature,
            humidity: data.hourly.relativehumidity_2m ? data.hourly.relativehumidity_2m[0] : 50,
            pressure: data.hourly.pressure_msl ? data.hourly.pressure_msl[0] : 1013,
            windspeed: data.current_weather.windspeed || 0,
            sunrise: "06:12",
            sunset: "18:45",
        };

        weekForecast.value = data.daily.time.slice(0, 7).map((date: string, i: number) => ({
            day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
            max: data.daily.temperature_2m_max[i],
            min: data.daily.temperature_2m_min[i],
            icon: getWeatherIcon(data.daily.weathercode[i]),
        }));

        hourlyForecast.value = data.hourly.time.slice(0, 10).map((t: string, i: number) => ({
            time: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            temp: data.hourly.temperature_2m[i],
            icon: getWeatherIcon(data.hourly.weathercode[i]),
        }));
    } catch (err) {
        console.error(err);
    }
};

const renderChart = () => {
    if (!chartCanvas.value) return;

    const labels = hourlyForecast.value.map((h) => h.time);
    const temps = hourlyForecast.value.map((h) => h.temp);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(chartCanvas.value, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Hourly Temp (°C)",
                    data: temps,
                    borderColor: "#ff5722",
                    backgroundColor: "rgba(255,87,34,0.2)",
                    tension: 0.3,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: { legend: { position: "top" }, title: { display: false } },
            scales: { y: { beginAtZero: false } },
        },
    });
};

watch([hourlyForecast, weekForecast], () => renderChart());

onMounted(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => fetchWeather(35.6892, 51.389)
        );
    } else {
        fetchWeather(35.6892, 51.389);
    }

    timeInterval = window.setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timeInterval);
    if (chartInstance) chartInstance.destroy();
});
</script>
