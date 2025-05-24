// Admin routes configuration
export default [
  {
    path: '/projects',
    name: 'projects',
    component: () => import('../views/admin/projects/ProjectsList.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/admin/users/UsersList.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
]
