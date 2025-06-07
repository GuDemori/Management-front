<template>
  <v-container fluid class="py-4">
    <v-row class="mb-2">
      <v-col>
        <v-toolbar flat>
          <v-toolbar-title>Clientes</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" @click="openDialog">Novo Cliente</v-btn>
          <v-btn color="secondary" class="ml-2" @click="exportPDF">
            <v-icon left>mdi-file-pdf</v-icon>
            Exportar PDF
          </v-btn>
          <v-btn icon class="ml-2" @click="filterDialog = true">
            <v-icon>mdi-filter-variant</v-icon>
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
        >
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
          <ClientForm :form="form" :formRef="formRef" @submit="save" />
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
          <v-checkbox v-model="filterOptions.fullName" label="Filtrar por Nome" />
          <v-checkbox v-model="filterOptions.city" label="Filtrar por Cidade" />
          <v-checkbox v-model="filterOptions.email" label="Filtrar por E-mail" />
          <v-checkbox v-model="filterOptions.phone" label="Filtrar por Telefone" />

          <v-divider class="my-2" />

          <v-text-field v-if="filterOptions.fullName" v-model="filters.fullName" label="Nome" clearable />
          <v-text-field v-if="filterOptions.city" v-model="filters.city" label="Cidade" clearable />
          <v-text-field v-if="filterOptions.email" v-model="filters.email" label="E-mail" clearable />
          <v-text-field v-if="filterOptions.phone" v-model="filters.phone" label="Telefone" clearable />
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
import 'jspdf-autotable'
import ClientForm from '@/components/ClientForm.vue'

const store = useClientsStore()
const formRef = ref(null)
const dialog = ref(false)
const filterDialog = ref(false)
const successDialog = ref(false)
const error = ref('')

const filterOptions = reactive({
  fullName: false,
  city: false,
  email: false,
  phone: false,
})

const filters = reactive({
  fullName: '',
  city: '',
  email: '',
  phone: '',
})

const headers = [
  { text: 'ID', value: 'id', width: '80px' },
  { text: 'Nome', value: 'fullName' },
  { text: 'CPF/CNPJ', value: 'cpfCnpj' },
  { text: 'Endereço', value: 'address' },
  { text: 'Cidade', value: 'city' },
  { text: 'Telefone', value: 'phone' },
  { text: 'E-mail', value: 'email' },
  { text: 'Data Nasc.', value: 'birthDate' },
  { text: 'Ações', value: 'actions', sortable: false, width: '120px' },
]

const form = reactive({
  id: null,
  fullName: '',
  cpfCnpj: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  birthDate: '',
})

onMounted(() => {
  store.fetchAll()
})

const filteredClients = computed(() => {
  return store.list.filter(c => {
    const byName = !filterOptions.fullName || c.fullName?.toLowerCase().includes(filters.fullName.toLowerCase())
    const byCity = !filterOptions.city || c.city?.toLowerCase().includes(filters.city.toLowerCase())
    const byEmail = !filterOptions.email || c.email?.toLowerCase().includes(filters.email.toLowerCase())
    const byPhone = !filterOptions.phone || c.phone?.includes(filters.phone)
    return byName && byCity && byEmail && byPhone
  })
})

const loading = computed(() => store.loading)

function openDialog() {
  Object.assign(form, {
    id: null,
    fullName: '',
    cpfCnpj: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    birthDate: '',
  })
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
  if (!formRef.value.validate()) return
  error.value = ''

  try {
    if (form.id) {
      await axios.put(`/api/clients/${form.id}`, form)
    } else {
      await axios.post('/api/clients', form)
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
  if (!confirm(`Deseja excluir ${item.fullName}?`)) return
  try {
    await axios.delete(`/api/clients/${item.id}`)
    await store.fetchAll()
  } catch (e) {
    console.error(e)
    error.value = 'Erro ao excluir cliente.'
  }
}

function resetFilters() {
  filters.fullName = ''
  filters.city = ''
  filters.email = ''
  filters.phone = ''
  filterOptions.fullName = false
  filterOptions.city = false
  filterOptions.email = false
  filterOptions.phone = false
}

function exportPDF() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Lista de Clientes', 14, 22)

  const cols = headers.filter(h => h.value !== 'actions').map(h => h.text)
  const rows = filteredClients.value.map(c => [
    c.id,
    c.fullName,
    c.cpfCnpj,
    c.address,
    c.city,
    c.phone,
    c.email,
    c.birthDate,
  ])

  doc.autoTable({
    head: [cols],
    body: rows,
    startY: 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.save('clientes.pdf')
}
</script>
