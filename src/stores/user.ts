import { defineStore } from "pinia";
import { ref, watch } from "vue";

export interface User {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  province: string | null;
  city: string | null;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<User | null>(null);

  const init = () => {
    const saved = localStorage.getItem("user");
    if (saved) {
      user.value = JSON.parse(saved) as User;
    }
  };

  const setUser = (data: User) => {
    user.value = data;
  };

  const updateUser = (payload: Partial<User>) => {
    if (!user.value) {
      user.value = payload as User;
    } else {
      user.value = {
        ...user.value,
        ...payload,
      };
    }
  };

  const clearUser = () => {
    user.value = null;
    localStorage.removeItem("user");
  };

  watch(
    user,
    (val) => {
      if (val) {
        localStorage.setItem("user", JSON.stringify(val));
      }
    },
    { deep: true }
  );

  return {
    user,
    init,
    setUser,
    updateUser,
    clearUser,
  };
});
