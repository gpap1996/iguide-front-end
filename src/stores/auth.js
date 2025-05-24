import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const isAdmin = computed(() => {
      return user.value?.role === 'admin'
    })

    const isManager = computed(() => {
      return user.value?.role === 'manager'
    })

    const user = ref({
      role: '',
      projectid: '',
      name: '',
      lastName: '',
    })

    return {
      user,
      isAdmin,
      isManager,
    }
  },
  {
    persist: [
      {
        pick: ['user'],
        storage: localStorage,
      },
    ],
  },
)
