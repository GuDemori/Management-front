import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/pages/login.vue'
import Clients from '@/pages/clientes.vue'
import Fornecedores from '@/pages/fornecedores.vue'
import Produtos from '@/pages/produtos.vue'
import Pedidos from '@/pages/pedidos.vue'
import Estoque from '@/pages/estoque.vue'
import Clientes from '@/pages/clientes.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { layout: 'login' },
  },
  {
    path: '/clientes',
    name: 'Clientes',
    component: Clientes,
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


