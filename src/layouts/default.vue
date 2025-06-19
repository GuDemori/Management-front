<template>
  <v-app>
    <!-- MENU LATERAL -->
    <v-navigation-drawer
      v-model="drawer"
      app
      permanent
    >
      <v-list-item to="/" title="Sabor Doce" subtitle="" />

      <div class="d-flex align-center justify-center" style="height: 100px;">
        <v-btn
          icon
          @click="drawer = false"
          class="border border-grey-darken-2 rounded-xl"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </div>

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
      color="teal-darken-4"
      flat
    >
      <v-btn
        icon
        v-if="!drawer"
        @click="drawer = true"
      >
        <v-icon class="text-white">mdi-menu</v-icon>
      </v-btn>

      <v-spacer />

      <v-btn icon><v-icon class="text-white">mdi-magnify</v-icon></v-btn>
      <v-btn icon><v-icon class="text-white">mdi-cart</v-icon></v-btn>
      <v-btn icon><v-icon class="text-white">mdi-dots-vertical</v-icon></v-btn>
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
import { useRoute } from 'vue-router'
import axios from 'axios'

const drawer    = ref(true)
const userRole  = ref(null)
const route     = useRoute()

// nomes de rota em que NÃO queremos buscar /api/users
const publicNames = ['LoginPage', 'RegisterPage']

onMounted(async () => {
  // se estivermos em qualquer rota pública, pulamos a chamada inteira
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
</script>


<style scoped>
.active-link {
  background-color: darkgoldenrod !important;
  color: white !important;
}
</style>
