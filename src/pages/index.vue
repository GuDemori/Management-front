<template>
  <v-container fluid class="pa-6">
    <!-- Card de boas-vindas -->
    <v-row>
      <v-col cols="12">
        <v-card class="elevation-5 rounded-xl pa-6 mb-8">
          <v-col cols="auto" justify="center" align="center">
              <v-img
                src="@/assets/logo.png"
                alt="Logo Sabor Doce"
                width="120"
                height="120"
              />
            </v-col>
          <!-- Logo + Texto centralizados -->
          <v-row justify="center" align="center" class="mb-4">
            
            <v-col class="text-center">
              <div class="text-h4 mb-1">Bem-vindo ao Sabor Doce!</div>
              <div>
                Use o menu à esquerda para navegar pelos módulos do sistema.
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Cards de acesso rápido -->
    <v-row dense>
      <!-- Produtos -->
      <v-col cols="12" sm="6" md="4">
        <v-card class="elevation-3 rounded-lg hoverable">
          <v-card-title>
            <v-icon left class="mr-2">mdi-package-variant</v-icon>
            <span class="text-h6">Produtos</span>
          </v-card-title>
          <v-card-text>
            Gerencie seu catálogo de produtos.
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" to="/produtos">Ir para Produtos</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Clientes -->
      <v-col v-if="isAdmin" cols="12" sm="6" md="4">
        <v-card class="elevation-3 rounded-lg hoverable">
          <v-card-title>
            <v-icon left class="mr-2">mdi-account-multiple</v-icon>
            <span class="text-h6">Clientes</span>
          </v-card-title>
          <v-card-text>
            Cadastre e visualize seus clientes.
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" to="/clientes">Ir para Clientes</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Pedidos (só admin) -->
      <v-col
        cols="12"
        sm="6"
        md="4"
        v-if="isAdmin"
      >
        <v-card class="elevation-3 rounded-lg hoverable">
          <v-card-title>
            <v-icon left class="mr-2">mdi-truck-fast</v-icon>
            <span class="text-h6">Pedidos</span>
          </v-card-title>
          <v-card-text>
            Acompanhe os pedidos realizados.
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" to="/pedidos">Ir para Pedidos</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const userRole = ref(null)
const route    = useRoute()

// rotas públicas que não fazem fetch de usuário
const publicNames = ['LoginPage', 'RegisterPage']

onMounted(async () => {
  if (publicNames.includes(route.name)) return

  try {
    const { data } = await axios.get('/api/users')
    userRole.value  = data.role
  } catch {
    userRole.value = null
  }
})

const isAdmin = computed(() => userRole.value === 'admin')
</script>

<style scoped>
.hoverable {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}
</style>
