import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const role = ref(null)

    const isAdmin = computed(() => {
      return role.value === 'admin'
    })

    const isManager = computed(() => {
      return role.value === 'manager'
    })

    return {
      isAdmin,
      isManager,
      role,
    }
  },
  {
    persist: [
      {
        pick: ['role'],
        storage: localStorage,
      },
    ],
  },
)
