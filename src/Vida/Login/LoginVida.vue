<template>
    <div class="relative min-h-screen overflow-hidden">
        <div class="absolute inset-0 -z-10 bg-gradient-to-br dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950 from-white via-cyan-50 to-blue-50"></div>
        <div
            class="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full blur-3xl dark:opacity-30 opacity-40 -z-10"
            :style="{ background: 'radial-gradient(closest-side, #22d3ee, transparent)' }"
        ></div>
        <div
            class="absolute -bottom-40 -right-40 w-[36rem] h-[36rem] rounded-full blur-3xl dark:opacity-25 opacity-35 -z-10"
            :style="{ background: 'radial-gradient(closest-side, #60a5fa, transparent)' }"
        ></div>

        <div class="absolute top-6 right-6 z-20">
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
                    <button
                        @click="changeLanguage('FA')"
                        class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/40 transition text-black dark:!text-gray-50"
                    >
                        <img :src="irLogo" width="18" class="rounded-sm" />
                        <span>فارسی</span>
                    </button>
                    <button
                        @click="changeLanguage('EN')"
                        class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/20 dark:hover:bg-gray-800/40 transition text-black dark:!text-gray-50"
                    >
                        <img :src="usLogo" width="18" class="rounded-sm" />
                        <span>English</span>
                    </button>
                </div>
            </v-menu>
        </div>

        <div class="absolute top-6 left-6 z-20">
            <v-btn icon @click="toggleTheme" class="rounded-full p-2 bg-white/20 dark:bg-gray-900/20 shadow-lg hover:bg-white/30 dark:hover:bg-gray-800/30 transition">
                <v-icon v-if="isDark" class="text-yellow-400">mdi-white-balance-sunny</v-icon>
                <v-icon v-else class="text-gray-700 dark:text-gray-200">mdi-weather-night</v-icon>
            </v-btn>
        </div>

        <div class="flex flex-col-reverse lg:flex-row min-h-screen">
            <div class="flex items-center justify-center p-4 sm:p-6 lg:p-8 w-full lg:w-1/2">
                <div
                    class="backdrop-blur-2xl bg-white/80 dark:bg-white/15 border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-lg lg:max-w-xl text-slate-900 dark:text-slate-100 relative"
                >
                    <div class="flex items-center gap-3 mb-8">
                        <img :src="myLogo" alt="Logo" class="w-10 h-10" />
                        <span class="text-3xl font-bold text-cyan-300">Vida</span>
                    </div>

                    <h1 class="text-2xl md:text-3xl font-semibold leading-8 mb-2">{{ t("title") }}</h1>
                    <p class="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-6">{{ t("subtitle") }}</p>

                    <form @submit.prevent="submit" class="flex flex-col gap-4">
                        <v-text-field
                            v-model="name.value.value"
                            :error-messages="name.errorMessage.value"
                            :label="t('name')"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-account"
                            class="rounded-xl"
                            hide-details="auto"
                        />
                        <v-text-field
                            v-model="phone.value.value"
                            :error-messages="phone.errorMessage.value"
                            :label="t('phone')"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-phone"
                            class="rounded-xl"
                            hide-details="auto"
                        />
                        <v-text-field
                            v-model="email.value.value"
                            :error-messages="email.errorMessage.value"
                            :label="t('email')"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-email"
                            class="rounded-xl"
                            hide-details="auto"
                        />

                        <div class="flex flex-col sm:flex-row gap-3">
                            <v-autocomplete
                                v-model="selectedProvince"
                                :items="provinces"
                                :label="t('province')"
                                variant="outlined"
                                density="comfortable"
                                item-title="name"
                                item-value="name"
                                prepend-inner-icon="mdi-map-marker"
                                class="rounded-xl flex-1"
                                hide-details="auto"
                                clearable
                            />
                            <v-autocomplete
                                v-model="selectedCity"
                                :items="cities"
                                :label="t('city')"
                                variant="outlined"
                                density="comfortable"
                                :disabled="!selectedProvince"
                                item-title="name"
                                item-value="name"
                                prepend-inner-icon="mdi-city"
                                class="rounded-xl flex-1"
                                hide-details="auto"
                                clearable
                            />
                        </div>

                        <v-btn
                            type="submit"
                            class="mt-2 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 text-white"
                            block
                        >
                            {{ t("submit") }}
                        </v-btn>
                    </form>
                </div>
            </div>

            <div class="flex flex-col justify-center p-4 sm:p-6 lg:p-12 w-full lg:w-1/2 text-slate-900 dark:text-white mt-28 lg:mt-0">
                <div
                    class="mx-auto w-full max-w-md lg:max-w-xl rounded-3xl p-6 sm:p-8 backdrop-blur-2xl bg-white/70 dark:bg-white/10 border border-white/20 dark:border-white/10 shadow-2xl"
                >
                    <img :src="myLogo" alt="Logo" class="w-16 h-16 mx-auto mb-6" />
                    <h2 class="text-3xl font-semibold text-center mb-3">{{ t("welcomeTitle") }}</h2>
                    <p class="text-center text-slate-700 dark:text-slate-200">{{ t("welcomeText") }}</p>

                    <div class="mt-8 flex flex-col gap-4">
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 bg-white/30 dark:bg-white/20 rounded-full flex items-center justify-center">
                                <img :src="myLogo" alt="Logo" class="w-7 h-7" />
                            </div>
                            <div
                                class="bg-white/80 dark:bg-white/15 border border-white/20 dark:border-white/10 text-slate-900 dark:text-white p-3 rounded-2xl rounded-tl-none shadow-md max-w-full"
                            >
                                <h3 class="font-semibold mb-1">Vida</h3>
                                <p class="text-sm">{{ t("chatVida") }}</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3 justify-end">
                            <div class="bg-cyan-400/90 dark:bg-cyan-500/90 text-white p-3 rounded-2xl rounded-tr-none shadow-md max-w-full">
                                <h3 class="font-semibold mb-1 text-right">{{ t("you") }}</h3>
                                <p class="text-sm text-right">{{ t("chatUser") }}</p>
                            </div>
                            <div class="w-10 h-10"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useField, useForm } from "vee-validate";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import myLogo from "../../assets/Logo.svg";
import irLogo from "../../assets/Ir.svg";
import usLogo from "../../assets/us.svg"

const { t, locale } = useI18n();
const router = useRouter();
const provinces = ref([]);
const cities = ref([]);
const selectedProvince = ref(null);
const selectedCity = ref(null);
const currentLanguage = ref(locale.value);
const currentLanguageLabel = computed(() => (currentLanguage.value === "FA" ? "فارسی" : "English"));
const isDark = ref(false);
const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark.value) {
        html.classList.remove("dark");
        localStorage.setItem("theme", "light");
        isDark.value = false;
    } else {
        html.classList.add("dark");
        localStorage.setItem("theme", "dark");
        isDark.value = true;
    }
};

onMounted(() => {
    const savedTheme = localStorage.getItem("theme");
    const html = document.documentElement;
    if (savedTheme === "dark") {
        html.classList.add("dark");
        isDark.value = true;
    } else {
        html.classList.remove("dark");
        isDark.value = false;
    }

    fetchProvinces();
});

function changeLanguage(lang) {
    locale.value = lang;
    currentLanguage.value = lang;
    localStorage.setItem("lang", lang);
}

// API Provinces
const fetchProvinces = async () => {
    try {
        const res = await fetch("https://iranplacesapi.liara.run/api/provinces");
        provinces.value = await res.json();
    } catch (err) {
        console.error(err);
    }
};

// API Cities
const fetchCities = async (province) => {
    try {
        const res = await fetch(`https://iranplacesapi.liara.run/api/provinces/name/${province}/cities`);
        cities.value = await res.json();
    } catch (err) {
        console.error(err);
    }
};

watch(selectedProvince, (newProvince) => {
    if (newProvince) {
        fetchCities(newProvince);
        selectedCity.value = null;
    } else {
        cities.value = [];
        selectedCity.value = null;
    }
});

const { handleSubmit } = useForm({
    validationSchema: {
        name(value) {
            if (value?.length >= 2) return true;
            return "Name needs to be at least 2 characters.";
        },
        phone(value) {
            if (/^[0-9-]{7,}$/.test(value)) return true;
            return "Phone number needs to be at least 7 digits.";
        },
        email(value) {
            if (!value) return "E-mail is required.";
            value = value.trim();
            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return regex.test(value) ? true : "Must be a valid e-mail.";
        },
    },
});

const name = useField("name");
const phone = useField("phone");
const email = useField("email");

const submit = handleSubmit((values) => {
    const userData = {
        ...values,
        province: selectedProvince.value || null,
        city: selectedCity.value || null,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    router.push("/dashboard/dashboard-home");
});
</script>
