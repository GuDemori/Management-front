// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import LoginPage     from '@/pages/login.vue'
import RegisterPage  from '@/pages/registro.vue'
import IndexPage     from '@/pages/index.vue'
import ClientsPage   from '@/pages/clientes.vue'
import SuppliersPage from '@/pages/fornecedores.vue'
import ProductsPage  from '@/pages/produtos.vue'
import OrdersPage    from '@/pages/pedidos.vue'
import StockPage     from '@/pages/estoque.vue'
import NotFound      from '@/pages/notFound.vue'

const routes = [
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage,
    meta: { layout: 'login' }
  },
  {
    path: '/registro',
    name: 'RegisterPage',
    component: RegisterPage,
    meta: { layout: 'login' }
  },
  {
    path: '/',
    name: 'IndexPage',
    component: IndexPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/clientes',
    name: 'ClientsPage',
    component: ClientsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/fornecedores',
    name: 'SuppliersPage',
    component: SuppliersPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/produtos',
    name: 'ProductsPage',
    component: ProductsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/pedidos',
    name: 'OrdersPage',
    component: OrdersPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/estoque',
    name: 'StockPage',
    component: StockPage,
    meta: { requiresAuth: true }
  },
  // catch-all 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { layout: 'login' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
    const token     = localStorage.getItem('authToken')
    const needsAuth = to.matched.some(r => r.meta.requiresAuth)

    if (needsAuth && !token) {
      return next({ name: 'LoginPage', query: { redirect: to.fullPath } })
    }
    if ((to.name === 'LoginPage' || to.name === 'RegisterPage') && token) {
      return next({ name: 'IndexPage' })
    }
    next()
})


export default router