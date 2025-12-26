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
          <v-text-field 
            v-model="profile.name" 
            :label="t('name')" 
            variant="outlined" 
            prepend-inner-icon="mdi-account"
          />
          
          <v-text-field 
            v-model="profile.email" 
            :label="t('email')" 
            variant="outlined" 
            prepend-inner-icon="mdi-email"
          />
          
          <v-text-field 
            v-model="profile.phone" 
            :label="t('phone')" 
            variant="outlined" 
            prepend-inner-icon="mdi-phone"
          />

          <div class="flex gap-4">
            <!-- Province -->
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

            <!-- City -->
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
          class="w-40 h-40 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl"
          alt="User Avatar"
        />

        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onAvatarChange"
        />

        <button 
          class="mt-6 px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors shadow-md" 
          @click="triggerAvatarUpload"
        >
          {{ profile.avatar ? t("changeAvatar") : t("uploadAvatar") }}
        </button>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        :disabled="isSaving"
        class="bg-gradient-to-r from-cyan-500 to-blue-600
               text-white px-8 py-3 rounded-xl font-semibold shadow-lg
               hover:shadow-xl transition-all
               disabled:opacity-50 disabled:cursor-not-allowed"
        @click="saveProfile"
      >
        {{ isSaving ? t("saving") : t("saveChanges") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useUserStore, type User } from "../../stores/user";

const { t } = useI18n();
const userStore = useUserStore();

const profile = reactive<User>({
  name: "",
  email: "",
  phone: "",
  avatar: "",
  province: null,
  city: null,
});

const provinces = ref<any[]>([]);
const cities = ref<any[]>([]);
const selectedProvince = ref<string | null>(null);
const selectedCity = ref<string | null>(null);

const isSaving = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);
const defaultAvatar = "/default-avatar.png";
const isInitializing = ref(true);

const fetchProvinces = async () => {
  try {
    const res = await fetch("https://iranplacesapi.liara.run/api/provinces");
    provinces.value = await res.json();
  } catch (error) {
    console.error("Error fetching provinces:", error);
  }
};

const fetchCities = async (provinceName: string) => {
  try {
    const res = await fetch(
      `https://iranplacesapi.liara.run/api/provinces/name/${provinceName}/cities`
    );
    cities.value = await res.json();
  } catch (error) {
    console.error("Error fetching cities:", error);
    cities.value = [];
  }
};

onMounted(async () => {
  isInitializing.value = true; 
  
  userStore.init();
  
  await fetchProvinces();


  if (!userStore.user) {
    isInitializing.value = false;
    return;
  }

  Object.assign(profile, userStore.user);

  if (profile.province) {
    selectedProvince.value = profile.province;

    if (profile.city) {
      
      await fetchCities(profile.province);
      
      
      await nextTick();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      
      selectedCity.value = profile.city;

    }
  }
  
  isInitializing.value = false; 
});

watch(selectedProvince, async (newProvince, oldProvince) => {
  if (isInitializing.value) {
    return;
  }


  if (!newProvince) {
    cities.value = [];
    selectedCity.value = null;
    return;
  }

  if (newProvince !== oldProvince) {
    
    await fetchCities(newProvince);
    
    selectedCity.value = null;
    
  }
});

const saveProfile = async () => {
  isSaving.value = true;

  try {
    userStore.setUser({
      ...profile,
      province: selectedProvince.value,
      city: selectedCity.value,
    });

  } catch (error) {
    console.error(" saving profile:", error);
  } finally {
    setTimeout(() => {
      isSaving.value = false;
    }, 600);
  }
};

const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const onAvatarChange = (e: Event) => {
  const file = (e.target as HTMLInputElement)?.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("File size must be less than 5MB");
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file");
    return;
  }

  const reader = new FileReader();
  
  reader.onload = (ev) => {
    profile.avatar = ev.target?.result as string;
    saveProfile();
  };
  
  reader.onerror = () => {
    console.error("Error reading file");
    alert("Error uploading avatar");
  };
  
  reader.readAsDataURL(file);
};
</script>