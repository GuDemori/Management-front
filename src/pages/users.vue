<template>
  <v-container fluid class="py-4">
    <!-- Título + Botão -->
    <v-row class="mb-4 justify-space-between align-center">
      <v-col cols="auto">
        <h2 class="text-h5 font-weight-bold">Usuários</h2>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="dialog = true">
          <v-icon left>mdi-account-plus</v-icon>
          Novo Usuário
        </v-btn>
      </v-col>
    </v-row>

    <!-- Alerta de erro -->
    <v-alert v-if="error" type="error" class="mb-4" dense>
      {{ error }}
    </v-alert>

    <!-- Tabela de usuários -->
    <v-data-table
      :headers="headers"
      :items="users"
      :loading="loading"
      :search="search"
      class="elevation-1"
      item-value="id"
      density="comfortable"
    >
      <template #top>
        <v-text-field
          v-model="search"
          label="Pesquisar"
          prepend-inner-icon="mdi-magnify"
          clearable
          density="compact"
          class="mx-4"
        />
      </template>

      <template #item.role="{ item }">
        {{ formatRole(item.role) }}
      </template>

      <template #item.actions="{ item }">
        <v-icon small class="me-2" color="primary" @click="editUser(item)">
          mdi-pencil
        </v-icon>
      </template>
    </v-data-table>

    <!-- Modal de criação -->
    <UserDialog v-model="dialog" />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import UserDialog from '@/components/userDialog.vue'

const users = ref([])
const dialog = ref(false)
const loading = ref(false)
const error = ref('')
const search = ref('')

const headers = [
  { text: 'Nome', value: 'name' },
  { text: 'Email', value: 'email' },
  { text: 'CPF/CNPJ', value: 'document' },
  { text: 'Tipo de Estabelecimento', value: 'establishment_type.name' },
  { text: 'Tipo de Acesso', value: 'role' },
  { text: 'Ações', value: 'actions', sortable: false },
]

function formatRole(role) {
  if (role === 'admin') return 'Administrador'
  if (role === 'coworker') return 'Funcionário'
  return 'Cliente'
}

function fetchUsers() {
  loading.value = true
  axios.get('/api/users')
    .then(res => {
      users.value = res.data
    })
    .catch(() => {
      error.value = 'Erro ao buscar usuários.'
    })
    .finally(() => {
      loading.value = false
    })
}

function editUser(user) {
}

onMounted(fetchUsers)
</script>
