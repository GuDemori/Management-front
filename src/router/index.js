import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/pages/login.vue'
import Fornecedores from '@/pages/fornecedores.vue'
import Produtos from '@/pages/Produtos.vue'
import Pedidos from '@/pages/Pedidos.vue'
import Estoque from '@/pages/estoque.vue'
import Clients from '@/pages/Clients.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { layout: 'login' },
  },
  {
    path: '/clientes',
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
  {
    path: '/pedidos',
    name: 'Pedidos',
    component: Pedidos,
  },
  {
    path: '/estoque',
    name: 'Estoque',
    component: Estoque,
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router