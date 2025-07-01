<template>
  <v-container fluid>
    <!-- Filtro + botão -->
    <v-row class="d-flex justify-space-between mb-4">
      <v-text-field
        v-model="search"
        label="Filtrar por nome"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="outlined"
        @input="fetchUsers"
      />
      <v-btn color="primary" @click="openCreateDialog">Criar Usuário</v-btn>
    </v-row>

    <!-- Erro -->
    <v-alert v-if="userStore.error" type="error" class="mb-4">
      {{ userStore.error }}
    </v-alert>

    <!-- Tabela de usuários -->
    <v-data-table :headers="headers" :items="filteredUsers" class="elevation-1">
      <template #item.isActive="{ item }">
        <v-chip :color="item.isActive ? 'green' : 'red'" dark>
          {{ item.isActive ? 'Ativo' : 'Inativo' }}
        </v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn icon @click="deactivateUser(item.id)">
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Modal -->
    <v-dialog v-model="openDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">Criar Usuário</span>
          <v-spacer />
          <v-btn icon @click="openDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <UserForm
            v-if="openDialog"
            v-model="form"
            :isEdit="false"
            ref="formComponent"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
  color="primary"
  @click="handleSave"
>
  Salvar
</v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import UserForm from '@/components/userForm.vue'

const userStore = useUsersStore()
const search = ref('')
const openDialog = ref(false)
const formComponent = ref()

const form = ref({
  name: '',
  email: '',
  password: '',
  role: '',
  document: ''
})


const handleSave = async () => {
  const valid = await formComponent.value?.validate()
  if (valid) {
    await saveUser()
  }
}
// Cabeçalhos da tabela
const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Documento', key: 'document' },
  { title: 'Tipo', key: 'role' },
  { title: 'Status', key: 'isActive' },
  { title: 'Ações', key: 'actions', sortable: false }
]

// Buscar usuários
const fetchUsers = () => {
  userStore.fetchUsers(search.value)
}

// Salvar novo usuário
const saveUser = async () => {
  try {
    await userStore.createUser(form.value)
    openDialog.value = false
    resetForm()
  } catch (err) {
    console.error('Erro ao criar usuário:', err)
  }
}

// Desativar
const deactivateUser = async (id) => {
  if (!confirm('Tem certeza que deseja desativar este usuário?')) return
  await userStore.deactivateUser(id)
}

// Resetar form
const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    password: '',
    role: '',
    document: ''
  }
}

// Abrir modal
const openCreateDialog = () => {
  resetForm()
  openDialog.value = true
}

// Filtrar apenas admin/coworker
const filteredUsers = computed(() =>
  userStore.users.filter(u => ['admin', 'coworker'].includes(u.role))
)

onMounted(fetchUsers)
</script>
