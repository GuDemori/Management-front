import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/pages/login.vue'
import Fornecedores from '@/pages/fornecedores.vue'
import Produtos from '@/pages/Produtos.vue'
import Pedidos from '@/pages/pedidos.vue'
import Estoque from '@/pages/estoque.vue'
import Clients from '@/pages/clientes.vue'
import Registro from '@/pages/registro.vue'


const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { layout: 'login' },
     children: [
      { path: '', name: 'LoginPage', component: () => import('@/pages/login.vue') }
    ],
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
    path: '/registro',
    name: 'Registro',
    component: Registro,
    meta: { layout: 'login' },
    children: [
      { path: '', name: 'RegisterPage', component: () => import('@/pages/Registro.vue') }
    ],
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
