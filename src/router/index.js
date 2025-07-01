import { createRouter, createWebHistory } from 'vue-router'

import LoginPage     from '@/pages/login.vue'
import RegisterPage  from '@/pages/registro.vue'
import IndexPage     from '@/pages/index.vue'
import ClientsPage   from '@/pages/clientes.vue'
import SuppliersPage from '@/pages/fornecedores.vue'
import ProductsPage  from '@/pages/produtos.vue'
import OrdersPage    from '@/pages/pedidos.vue'
import OrderDetails  from '@/pages/orderDetails.vue'
import StockPage     from '@/pages/estoque.vue'
import NotFound      from '@/pages/notFound.vue'
import Users         from '@/pages/users.vue'
import Cart          from '@/pages/cart.vue'

import { useAuthStore } from '../stores/auth'
const routes = [
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage,
    meta: { layout: 'login' , requiresAuth: false}
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
    meta: { requiresAuth: true, roles: ['admin', 'coworker'] }
  },
  {
    path: '/fornecedores',
    name: 'SuppliersPage',
    component: SuppliersPage,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/produtos',
    name: 'ProductsPage',
    component: ProductsPage,
    meta: { requiresAuth: true, roles: ['admin', 'coworker', 'client'] }
  },
  {
    path: '/pedidos',
    name: 'OrdersPage',
    component: OrdersPage,
    meta: { requiresAuth: true, roles: ['admin', 'coworker', 'client'] }
  },
  {
    path: '/pedidos/:id',
    name: 'OrderDetailsPage',
    component: OrderDetails,
    meta: { requiresAuth: true, roles: ['admin', 'coworker', 'client'] }
  },
  {
    path: '/estoque',
    name: 'StockPage',
    component: StockPage,
    meta: { requiresAuth: true, roles: ['admin', 'coworker'] }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { layout: 'login' }
  },
  {
  path: '/usuarios',
  name: 'Users',
  component: Users,
  meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/carrinho',
    name: 'CartPage',
    component: Cart,
    meta: { requiresAuth: true, roles: ['admin', 'coworker', 'client'] }
  }

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const token = localStorage.getItem('authToken')

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRoles = to.meta.roles

  if (requiresAuth && !token) {
    return next({ name: 'LoginPage', query: { redirect: to.fullPath } })
  }

  // Redireciona usuários logados que acessarem login ou registro
  if ((to.name === 'LoginPage' || to.name === 'RegisterPage') && authStore.isLogged) {
    return next({ name: 'IndexPage' })
  }

  // Verifica permissões por role
  if (requiredRoles && !requiredRoles.includes(authStore.user?.role)) {
    // Redireciona baseado no papel
    switch (authStore.user?.role) {
      case 'admin':
        return next({ name: 'IndexPage' }) // ou outro painel de admin
      case 'coworker':
        return next({ name: 'OrdersPage' })
      case 'client':
        return next({ name: 'ProductsPage' })
      default:
        return next({ name: 'LoginPage' })
    }
  }
 if (token && !authStore.user) {
  try {
    await authStore.fetchUser()
  } catch (e) {
    authStore.logout()
    return next({ name: 'LoginPage' })
  }
}
  return next()
})



export default router