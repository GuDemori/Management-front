import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/pages/login.vue'
import Clients from '@/pages/Clients.vue'
import Fornecedores from '@/pages/fornecedores.vue'
import Produtos from '@/pages/Produtos.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { layout: 'login' },
  },
  {
    path: '/clients',
    name: 'Clients',
    component: Clients,
  },
  {
    path: '/fornecedores',
    name: 'Fornecedores',
    component: Fornecedores,
  },
  {
    path: '/produtos',
    name: 'Produtos',
    component: Produtos,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router


// // Composables
// import { createRouter, createWebHistory } from 'vue-router/auto'
// import { setupLayouts } from 'virtual:generated-layouts'
// import { routes } from 'vue-router/auto-routes'


// const router = createRouter({
//   history: createWebHistory(import.meta.env.BASE_URL),
//   routes: setupLayouts(routes),
// })

// // Workaround for https://github.com/vitejs/vite/issues/11804
// router.onError((err, to) => {
//   if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
//     if (!localStorage.getItem('vuetify:dynamic-reload')) {
//       console.log('Reloading page to fix dynamic import error')
//       localStorage.setItem('vuetify:dynamic-reload', 'true')
//       location.assign(to.fullPath)
//     } else {
//       console.error('Dynamic import error, reloading page did not fix it', err)
//     }
//   } else {
//     console.error(err)
//   }
// })


// router.isReady().then(() => {
//   localStorage.removeItem('vuetify:dynamic-reload')
// })
// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('token');

//   if (to.meta.requiresAuth && !token) {
//     next('/login');
//   } else {
//     next();
//   }
// });

// export default router
