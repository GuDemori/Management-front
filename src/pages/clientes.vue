<template>
  <v-container fluid class="py-4">
    <v-row class="mb-2">
      <v-col>
        <v-toolbar flat>
          <v-toolbar-title>Clientes</v-toolbar-title>
          <v-text-field
            v-model="filters.name"
            label="Buscar por nome"
            prepend-inner-icon="mdi-magnify"
            dense
            hide-details
            outlined
            class="mr-4"
            style="max-width: 200px"
          />

          <v-text-field
            v-model="filters.city"
            label="Buscar por cidade"
            prepend-inner-icon="mdi-map-marker"
            dense
            hide-details
            outlined
            class="mr-4"
            style="max-width: 200px"
          />
          <v-spacer />
          <v-btn color="primary" @click="openDialog">Novo Cliente</v-btn>
          <v-btn color="secondary" class="ml-2" @click="handlePDFExport">
            <v-icon left>mdi-file-pdf</v-icon>
            Exportar PDF
          </v-btn>
        </v-toolbar>
      </v-col>
    </v-row>

    <v-alert
      v-if="error"
      type="error"
      dismissible
      class="mb-4"
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="filteredClients"
          :loading="loading"
          class="elevation-1"
          item-value="id"
          no-data-text="Nenhum cliente encontrado"
          loading-text="Carregando clientes..."
        >
          <!-- Coluna: Estabelecimento -->
          <template #item.establishment_type="{ item }">
            {{ item.establishment_type || 'N/A' }} - {{ item.establishment_code }}
          </template>

          <!-- Coluna: Endereço -->
          <template #item.address="{ item }">
            {{ item.address }}, {{ item.number }}
          </template>
          <template #item.actions="{ item }">
            <v-btn icon @click="edit(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click="remove(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px" :fullscreen="$vuetify.display.smAndDown">
      <v-card>
        <v-card-title class="text-h6">
          {{ form.id ? 'Editar Cliente' : 'Novo Cliente' }}
        </v-card-title>
        <v-card-text>
          <ClientForm
            ref="formRef"
            :form="form"
            :isEdit="!!form.id"
            @submit="save"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" @click="closeDialog" prepend-icon="mdi-close">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="save" prepend-icon="mdi-content-save">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="filterDialog" max-width="400px">
      <v-card>
        <v-card-title>Filtros</v-card-title>
        <v-card-text>
          <v-checkbox v-model="filterOptions.name" label="Filtrar por Nome" />
          <v-checkbox v-model="filterOptions.city" label="Filtrar por Cidade" />

          <v-divider class="my-2" />

          <v-text-field v-if="filterOptions.name" v-model="filters.name" label="Nome" clearable />
          <v-text-field v-if="filterOptions.city" v-model="filters.city" label="Cidade" clearable />

        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="resetFilters">Limpar</v-btn>
          <v-btn color="primary" @click="filterDialog = false">Aplicar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="successDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="headline">Sucesso</v-card-title>
        <v-card-text>
          Cliente {{ form.id ? 'atualizado' : 'cadastrado' }} com sucesso!
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="successDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { useClientsStore } from '@/stores/clients'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import ClientForm from '@/components/clientForm.vue'
import { exportPdfWithLogo } from '@/utils/exportPDF'

const store = useClientsStore()
const formRef = ref(null)
const dialog = ref(false)
const filterDialog = ref(false)
const successDialog = ref(false)
const isEdit = ref(false)
const error = ref('')

const filterOptions = reactive({
  name: false,
  city: false,
})

const filters = reactive({
  name: '',
  city: '',
})

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Tipo de Estabelecimento', key: 'establishment_type' },
  { title: 'Cidade', key: 'city' },
  { title: 'Endereço', key: 'address' },
  { title: 'Ações', key: 'actions', sortable: false }
]

const form = reactive({
  id: null,
  establishment_type_id: null,
  name: '',
  document: '',
  email: '',
  password: '',
  confirmPassword: '',
  cep: '',
  address: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: ''
})

onMounted(() => {
  store.fetchAll()
})

const filteredClients = computed(() =>
  store.list
    .filter(u => u.role === 'client')
    .map(u => ({
      ...u,
      establishment_type: u.establishment_type?.name || 'N/A',
      establishment_code: u.establishment_type?.code || 'N/A'
    }))
    .filter(u => {
      const byName = !filters.name || u.name.toLowerCase().includes(filters.name.toLowerCase())
      const byCity = !filters.city || u.city.toLowerCase().includes(filters.city.toLowerCase())
      return byName && byCity
    })
)

const loading = computed(() => store.loading)

const getEmptyForm = () => ({
  establishment_type_id: null,
  name: '',
  document: '',
  email: '',
  password: '',
  confirmPassword: '',
  cep: '',
  address: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: ''
})

function openDialog() {
  Object.assign(form, getEmptyForm())
  isEdit.value = false
  formRef.value?.resetValidation()
  dialog.value = true
}

function edit(item) {
  Object.assign(form, item)
  formRef.value?.resetValidation()
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
}

async function save() {
  await nextTick()
  if (!await formRef.value?.validate()) return
  error.value = ''

  const payload = { ...form }

  try {
    if (form.id) {
      delete payload.password
      delete payload.confirmPassword
      await axios.put(`/api/clients/${form.id}`, payload)
    } else {
      await axios.post('/api/clients', payload)
    }
    await store.fetchAll()
    closeDialog()
    successDialog.value = true
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || 'Erro ao salvar cliente. Tente novamente.'
  }
}

async function remove(item) {
  if (!confirm(`Deseja excluir ${item.name}?`)) return
  try {
    await axios.delete(`/api/clients/${item.id}`)
    await store.fetchAll()
  } catch (e) {
    console.error(e)
    error.value = 'Erro ao excluir cliente.'
  }
}

function resetFilters() {
  filters.name = ''
  filters.city = ''

  filterOptions.name = false
  filterOptions.city = false
}

function handlePDFExport() {
  const headers = ['Nome', 'Tipo de Estabelecimento', 'Cidade', 'Endereço']

  const rows = filteredClients.value.map(c => [
    c.name,
    `${c.establishment_type} - ${c.establishment_code}`,
    c.city,
    `${c.address}, ${c.number}`
  ])

  exportPdfWithLogo({
    title: 'Lista de Clientes',
    filename: 'clientes.pdf',
    headers,
    rows
  })
}

</script>
