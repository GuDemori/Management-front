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
        <v-btn icon @click="editUser(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon @click="confirmRemove(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <UserDialog
      v-model="dialog"
      :form="form"
      :isEdit="isEdit"
      @submit="fetchUsers"
      ref="userForm"
    />

  </v-container>
  <v-dialog v-model="confirmDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Confirmar Ação</v-card-title>
      <v-card-text>
        Deseja realmente desativar o usuário
        <strong>{{ userToRemove?.name }}</strong>?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="confirmDialog = false">Cancelar</v-btn>
        <v-btn color="error" @click="deactivateUser">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

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
const confirmDialog = ref(false)
const userToRemove = ref(null)
const userForm = ref(null)
const form = ref({})
const isEdit = ref(false)

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'CPF/CNPJ', key: 'document' },
  { title: 'Tipo de Acesso', key: 'role' },
  { title: 'Ações', key: 'actions', sortable: false },
]

function formatRole(role) {
  if (role === 'admin') return 'Administrador'
  if (role === 'coworker') return 'Funcionário'
  return 'Cliente'
}

async function fetchUsers() {
  loading.value = true
  await axios.get('/api/users/all')
    .then(res => {
      users.value = res.data.filter(u => u.is_active)
    })
    .catch(() => {
      error.value = 'Erro ao buscar usuários.'
    })
    .finally(() => {
      loading.value = false
    })
}

function editUser(user) {
  form.value = { ...user, password: '', confirmPassword: '' }
  isEdit.value = true
  dialog.value = true
}

function confirmRemove(user) {
  userToRemove.value = user
  confirmDialog.value = true
}

async function deactivateUser() {
  if (!userToRemove.value) return

  try {
    await axios.delete(`/api/users/${userToRemove.value.id}`)
    confirmDialog.value = false
    userToRemove.value = null
    await fetchUsers()
  } catch (err) {
    console.error(err)
    error.value = 'Erro ao desativar usuário.'
  }
}


onMounted(fetchUsers)
</script>
