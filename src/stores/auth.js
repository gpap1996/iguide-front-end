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

    const user = ref(null)

    const clearUser = () => {
      role.value = null
      user.value = null
    }

    return {
      isAdmin,
      isManager,
      role,
      user,
      clearUser,
    }
  },
  {
    persist: [
      {
        pick: ['role', 'user'],
        storage: localStorage,
      },
    ],
  },
)
