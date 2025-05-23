<template>
  <v-container fluid class="py-4">
    <!-- Toolbar -->
    <v-row class="mb-2">
      <v-col>
        <v-toolbar flat>
          <v-toolbar-title>Fornecedores</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" @click="openDialog">Novo Fornecedor</v-btn>
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

    <!-- Alerta de erro -->
    <v-alert
      v-if="error"
      type="error"
      dismissible
      class="mb-4"
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <!-- Tabela de fornecedores filtrada -->
    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="filteredSuppliers"
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

    <!-- Diálogo de Create/Edit -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          {{ form.id ? 'Editar Fornecedor' : 'Novo Fornecedor' }}
        </v-card-title>
        <v-card-text>
          <SupplierForm :form="form" :formRef="formRef" @submit="save" />
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

    <!-- Diálogo de Filtros -->
    <v-dialog v-model="filterDialog" max-width="400px">
      <v-card>
        <v-card-title>Filtros</v-card-title>
        <v-card-text>
          <v-checkbox v-model="filterOptions.name" label="Filtrar por Nome" />
          <v-checkbox v-model="filterOptions.email" label="Filtrar por E-mail" />
          <v-checkbox v-model="filterOptions.phone" label="Filtrar por Telefone" />

          <v-divider class="my-2" />

          <v-text-field
            v-if="filterOptions.name"
            v-model="filters.name"
            label="Nome"
            clearable
          />
          <v-text-field
            v-if="filterOptions.email"
            v-model="filters.email"
            label="E-mail"
            clearable
          />
          <v-text-field
            v-if="filterOptions.phone"
            v-model="filters.phone"
            label="Telefone"
            clearable
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="resetFilters">Limpar</v-btn>
          <v-btn color="primary" @click="filterDialog = false">Aplicar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de sucesso -->
    <v-dialog v-model="successDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="headline">Sucesso</v-card-title>
        <v-card-text>
          Fornecedor {{ form.id ? 'atualizado' : 'cadastrado' }} com sucesso!
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
import { useSuppliersStore } from '@/stores/suppliers'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import SupplierForm from '@/components/SupplierForm.vue'

const store = useSuppliersStore()
const formRef = ref(null)
const dialog = ref(false)
const filterDialog = ref(false)
const successDialog = ref(false)
const error = ref('')

// filtros
const filterOptions = reactive({
  name: false,
  email: false,
  phone: false,
})

const filters = reactive({
  name: '',
  email: '',
  phone: '',
})

// cabeçalho
const headers = [
  { text: 'ID', value: 'id', width: '80px' },
  { text: 'Nome', value: 'name' },
  { text: 'CNPJ', value: 'cnpj' },
  { text: 'Endereço', value: 'address' },
  { text: 'Cidade', value: 'city' },
  { text: 'Telefone', value: 'phone' },
  { text: 'E-mail', value: 'email' },
  { text: 'Ações', value: 'actions', sortable: false, width: '120px' },
]


// form
const form = reactive({
  id: null,
  name: '',
  cnpj: '',
  address: '',
  city: '',
  phone: '',
  email: '',
})


onMounted(() => {
  store.fetchAll()
})

const filteredSuppliers = computed(() => {
  return store.list.filter(s => {
    const byName = !filterOptions.name || s.name?.toLowerCase().includes(filters.name.toLowerCase())
    const byEmail = !filterOptions.email || s.email?.toLowerCase().includes(filters.email.toLowerCase())
    const byPhone = !filterOptions.phone || s.phone?.includes(filters.phone)
    return byName && byEmail && byPhone
  })
})

const loading = computed(() => store.loading)

function openDialog() {
  Object.assign(form, {
    id: null,
    name: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
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
      await axios.put(`/api/suppliers/${form.id}`, form)
    } else {
      await axios.post('/api/suppliers', form)
    }
    await store.fetchAll()
    closeDialog()
    successDialog.value = true
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || 'Erro ao salvar fornecedor. Tente novamente.'
  }
}

async function remove(item) {
  if (!confirm(`Deseja excluir ${item.name}?`)) return
  try {
    await axios.delete(`/api/suppliers/${item.id}`)
    await store.fetchAll()
  } catch (e) {
    console.error(e)
    error.value = 'Erro ao excluir fornecedor.'
  }
}

function resetFilters() {
  filters.name = ''
  filters.email = ''
  filters.phone = ''
  filterOptions.name = false
  filterOptions.email = false
  filterOptions.phone = false
}

function exportPDF() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Lista de Fornecedores', 14, 22)

  const cols = headers.filter(h => h.value !== 'actions').map(h => h.text)
  const rows = filteredSuppliers.value.map(s => [
    s.id,
    s.name,
    s.cnpj,
    s.address,
    s.city,
    s.phone,
    s.email,
    ])


  doc.autoTable({
    head: [cols],
    body: rows,
    startY: 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.save('fornecedores.pdf')
}
</script>
