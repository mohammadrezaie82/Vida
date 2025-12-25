<template>
  <div
    class="relative min-h-screen overflow-y-auto p-4 sm:p-6 lg:p-8
           bg-gradient-to-br from-white via-cyan-50 to-blue-50
           dark:from-cyan-900 dark:via-slate-900 dark:to-slate-950 space-y-6"
  >
    <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
      {{ t("profileSettings") }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- User Info -->
      <div
        class="backdrop-blur-2xl bg-white/50 dark:bg-white/10
               border border-gray-200 dark:border-white/10
               shadow-2xl rounded-3xl p-6 text-gray-900 dark:text-white"
      >
        <h3 class="text-lg font-semibold mb-4 text-cyan-700 dark:text-cyan-300">
          {{ t("personalInfo") }}
        </h3>

        <div class="space-y-4">
          <v-text-field v-model="profile.name" :label="t('name')" variant="outlined" prepend-inner-icon="mdi-account" />
          <v-text-field v-model="profile.email" :label="t('email')" variant="outlined" prepend-inner-icon="mdi-email" />
          <v-text-field v-model="profile.phone" :label="t('phone')" variant="outlined" prepend-inner-icon="mdi-phone" />

          <div class="flex gap-4">
            <v-autocomplete
              v-model="selectedProvince"
              :items="provinces"
              item-title="name"
              item-value="name"
              :label="t('province')"
              prepend-inner-icon="mdi-map-marker"
              variant="outlined"
              clearable
              class="flex-1"
            />

            <v-autocomplete
              v-model="selectedCity"
              :items="cities"
              item-title="name"
              item-value="name"
              :label="t('city')"
              prepend-inner-icon="mdi-city"
              variant="outlined"
              :disabled="!selectedProvince"
              clearable
              class="flex-1"
            />
          </div>
        </div>
      </div>

      <!-- Avatar -->
      <div
        class="backdrop-blur-2xl bg-white/50 dark:bg-white/10
               border border-gray-200 dark:border-white/10
               shadow-2xl rounded-3xl p-6 flex flex-col items-center"
      >
        <img
          :src="profile.avatar || defaultAvatar"
          class="w-40 h-40 rounded-full object-cover border shadow"
        />
        <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
        <button class="mt-6 text-cyan-500 hover:underline" @click="triggerAvatarUpload">
          {{ t("changeAvatar") }}
        </button>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        :disabled="isSaving"
        class="bg-gradient-to-r from-cyan-500 to-blue-600
               text-white px-8 py-3 rounded-xl font-semibold shadow-lg
               disabled:opacity-50"
        @click="saveProfile"
      >
        {{ isSaving ? t("saving") : t("saveChanges") }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const profile = reactive({
  name: "",
  email: "",
  phone: "",
  avatar: "",
});

const provinces = ref([]);
const cities = ref([]);
const selectedProvince = ref(null);
const selectedCity = ref(null);

const isSaving = ref(false);
const avatarInput = ref(null);
const defaultAvatar = "/default-avatar.png";

const fetchProvinces = async () => {
  const res = await fetch("https://iranplacesapi.liara.run/api/provinces");
  provinces.value = await res.json();
};

const fetchCities = async (province, savedCity = null) => {
  const res = await fetch(
    `https://iranplacesapi.liara.run/api/provinces/name/${province}/cities`
  );
  cities.value = await res.json();

  if (savedCity) {
    selectedCity.value = savedCity;
  }
};

onMounted(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    const userData = JSON.parse(storedUser);

    Object.assign(profile, userData);

    selectedProvince.value = userData.province || null;

    if (userData.province) {
      fetchCities(userData.province, userData.city);
    }
  }

  fetchProvinces();
});

watch(selectedProvince, (newVal, oldVal) => {
  if (!newVal) {
    cities.value = [];
    selectedCity.value = null;
    return;
  }

  if (newVal !== oldVal) {
    fetchCities(newVal);
    selectedCity.value = null;
  }
});

const saveProfile = () => {
  isSaving.value = true;

  localStorage.setItem(
    "user",
    JSON.stringify({
      ...profile,
      province: selectedProvince.value,
      city: selectedCity.value,
    })
  );

  setTimeout(() => (isSaving.value = false), 700);
};

const triggerAvatarUpload = () => avatarInput.value.click();

const onAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    profile.avatar = ev.target.result;
    saveProfile();
  };
  reader.readAsDataURL(file);
};
</script>
