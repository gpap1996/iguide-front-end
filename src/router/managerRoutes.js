// Manager routes configuration
export default [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/manager/dashboard/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'manager' },
  },
  {
    path: '/areas',
    name: 'area',
    component: () => import('../views/manager/areas/AreasList.vue'),
    meta: { requiresAuth: true, role: 'manager' },
  },
  {
    path: '/files',
    name: 'files',
    component: () => import('../views/manager/files/FilesList.vue'),
    meta: { requiresAuth: true, role: 'manager' },
  },
  {
    path: '/external-files',
    name: 'external-files',
    component: () => import('../views/manager/external_files/ExternalFilesList.vue'),
    meta: { requiresAuth: true, role: 'manager' },
  },
  {
    path: '/languages',
    name: 'languages',
    component: () => import('../views/manager/languages/LanguagesList.vue'),
    meta: { requiresAuth: true, role: 'manager' },
  },
]
