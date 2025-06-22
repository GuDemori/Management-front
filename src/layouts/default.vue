<template>
  <v-app>
    <!-- MENU LATERAL -->
    <v-navigation-drawer
      v-model="drawer"
      app
      permanent
    >
      <v-list-item to="/" title="Sabor Doce" subtitle="" />

      <v-divider />

      <v-list>
        <v-list-item
          v-if="isAdmin || isV1 || isClient"
          to="/produtos"
          title="Produtos"
          prepend-icon="mdi-package-variant"
          :active-class="'active-link'"
        />
        <v-list-item
          v-if="isAdmin"
          to="/clientes"
          title="Clientes"
          prepend-icon="mdi-account-multiple"
          :active-class="'active-link'"
        />
        <v-list-item
          v-if="isAdmin"
          to="/pedidos"
          title="Pedidos"
          prepend-icon="mdi-truck-fast"
          :active-class="'active-link'"
        />
        <v-list-item
          v-if="isAdmin"
          to="/fornecedores"
          title="Fornecedores"
          prepend-icon="mdi-account-group"
          :active-class="'active-link'"
        />
        <v-list-item
          v-if="isAdmin"
          to="/estoque"
          title="Estoque"
          prepend-icon="mdi-package-variant-closed"
          :active-class="'active-link'"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- BARRA SUPERIOR -->
    <v-app-bar
      app
      flat
      style="background-color: darkgoldenrod;"
    >
      <v-btn
        icon
        @click="drawer = !drawer"
      >
        <v-icon class="text-white">mdi-menu</v-icon>
      </v-btn>

      <v-spacer />

      <v-btn icon>
        <v-icon class="text-white">mdi-magnify</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon class="text-white">mdi-cart</v-icon>
      </v-btn>

      <!-- MENU DE OPÇÕES -->
      <v-menu
        v-model="menu"
        offset-y
        placement="bottom-end"
      >
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon class="text-white">mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title class="text">Sair</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- CONTEÚDO PRINCIPAL -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const drawer    = ref(true)
const menu      = ref(false)
const userRole  = ref(null)
const route     = useRoute()
const router    = useRouter()

// rotas públicas que não precisam de fetch /api/users
const publicNames = ['LoginPage', 'RegisterPage']

onMounted(async () => {
  if (publicNames.includes(route.name)) {
    userRole.value = null
    return
  }

  try {
    const { data } = await axios.get('/api/users')
    userRole.value = data.role
  } catch {
    userRole.value = null
  }
})

const isAdmin  = computed(() => userRole.value === 'admin')
const isV1     = computed(() => userRole.value === 'v1')
const isClient = computed(() => userRole.value === 'client')

function logout() {
  // limpeza de credenciais/tokens
  localStorage.removeItem('authToken')
  router.push({ name: 'LoginPage' })
}
</script>

<style scoped>
.active-link {
  background-color: darkgoldenrod !important;
  color: white !important;
}
</style>
