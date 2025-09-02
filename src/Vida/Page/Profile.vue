<template>
    <div
        class="relative min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white via-cyan-50 to-blue-50 dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950 space-y-6"
    >
        <!-- Header -->
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {{ $t("profileSettings") }}
        </h2>

        <!-- Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <!-- User Info -->
            <div
                class="backdrop-blur-2xl bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-white flex flex-col"
            >
                <h3 class="font-semibold mb-4 text-cyan-700 dark:text-cyan-300 text-lg sm:text-xl">
                    {{ $t("personalInfo") }}
                </h3>

                <div class="space-y-3 sm:space-y-4">
                    <v-text-field
                        v-model="profile.name"
                        :label="t('name')"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-account"
                        class="rounded-xl"
                        hide-details="auto"
                    />
                    <v-text-field
                        v-model="profile.email"
                        :label="t('email')"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-email"
                        class="rounded-xl"
                        hide-details="auto"
                    />
                    <v-text-field
                        v-model="profile.phone"
                        :label="t('phone')"
                        variant="outlined"
                        density="comfortable"
                        prepend-inner-icon="mdi-phone"
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
                </div>
            </div>

            <!-- Avatar -->
            <div
                class="backdrop-blur-2xl bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-white/10 shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-white flex flex-col items-center"
            >
                <img :src="profile.avatar || defaultAvatar" alt="Profile" class="w-20 h-20 sm:w-60 sm:h-60 rounded-full border shadow object-cover" />
                <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
                <button class="sm:mt-2 md:mt-9 lg:mt-12 text-cyan-500 dark:text-cyan-300 text-sm sm:text-base hover:underline" @click="triggerAvatarUpload">
                    {{ $t("changeAvatar") }}
                </button>
            </div>
        </div>

        <!-- Save Button -->
        <div class="mt-6 flex justify-end">
            <button
                :disabled="isSaving"
                class="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition font-semibold text-sm sm:text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                @click="saveProfile"
            >
                <span v-if="isSaving">{{ $t("saving") }}...</span>
                <span v-else>{{ $t("saveChanges") }}</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";



const { t } = useI18n();
const provinces = ref([]);
const cities = ref([]);
const selectedProvince = ref(null);
const selectedCity = ref(null);

const isSaving = ref(false);
const avatarInput = ref(null);
const defaultAvatar = "/default-avatar.png"; 

const profile = reactive({
    name: "",
    email: "",
    phone: "",
    avatar: "",
});

onMounted(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        Object.assign(profile, {
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            avatar: userData.avatar || "",
        });
        selectedProvince.value = userData.province || null;
        selectedCity.value = userData.city || null;

        if (userData.province) {
            fetchCities(userData.province);
        }
    }

    fetchProvinces();
});

const saveProfile = () => {
    isSaving.value = true;
    const userData = {
        ...profile, 
        province: selectedProvince.value ? selectedProvince.value : null,
        city: selectedCity.value ? selectedCity.value : null,
    };

    localStorage.setItem("user", JSON.stringify(userData));
    setTimeout(() => {
        isSaving.value = false;
    }, 800);
};

const triggerAvatarUpload = () => {
    avatarInput.value.click();
};

const onAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            profile.avatar = event.target.result;
            saveProfile();
        };
        reader.readAsDataURL(file);
    }
};

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
</script>
