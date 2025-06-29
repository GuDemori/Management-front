<!-- src/pages/suppliers.vue -->
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
            <v-icon left>mdi-file-pdf</v-icon> Exportar PDF
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

    <!-- Data-table com cabeçalho no slot top -->
    <v-data-table
      :headers="headers"
      :items="filteredSuppliers"
      :loading="loading"
      hide-default-header
      class="elevation-1"
      item-value="id"
    >
      <!-- Slot TOP: cabeçalho personalizado -->
      <template #top>
        <v-row no-gutters class="data-table-header">
          <v-col cols="1"><strong>ID</strong></v-col>
          <v-col cols="2"><strong>Nome</strong></v-col>
          <v-col cols="2"><strong>Empresa</strong></v-col>
          <v-col cols="2"><strong>Documento</strong></v-col>
          <v-col cols="1"><strong>Cidade</strong></v-col>
          <v-col cols="2"><strong>Telefone</strong></v-col>
          <v-col cols="1"><strong>E-mail</strong></v-col>
          <v-col cols="1" class="text-center"><strong>Ações</strong></v-col>
        </v-row>
      </template>

      <!-- Linhas de dados -->
      <template #item.actions="{ item }">
        <v-btn icon @click="edit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon @click="confirmDelete(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Diálogo de Create/Edit -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          {{ form.id ? 'Editar Fornecedor' : 'Novo Fornecedor' }}
        </v-card-title>
        <v-card-text>
          <SupplierForm ref="formRef" :form="form" @submit="save" />
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
          <v-checkbox v-model="filterOptions.company_name" label="Filtrar por Empresa" />
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
            v-if="filterOptions.company_name"
            v-model="filters.company_name"
            label="Empresa"
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

    <!-- Modal de confirmação de exclusão -->
    <v-dialog v-model="deleteDialog" max-width="400px" persistent>
      <v-card>
        <v-card-title class="headline">Confirmação</v-card-title>
        <v-card-text>
          Deseja excluir o fornecedor
          <strong>{{ deleteSupplier?.name }}</strong>? Esta ação é irreversível!
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" @click="removeConfirmed">Excluir</v-btn>
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import SupplierForm from '@/components/supplierForm.vue'

const store = useSuppliersStore()
const formRef = ref(null)
const dialog = ref(false)
const filterDialog = ref(false)
const deleteDialog = ref(false)
const successDialog = ref(false)
const error = ref('')
const deleteSupplier = ref(null)

const filterOptions = reactive({
  name: false,
  company_name: false,
  email: false,
  phone: false,
})
const filters = reactive({
  name: '',
  company_name: '',
  email: '',
  phone: '',
})

const headers = [
  { text: 'ID', value: 'id', width: '80px' },
  { text: 'Nome', value: 'name' },
  { text: 'Empresa', value: 'company_name' },
  { text: 'Documento', value: 'document' },
  { text: 'Cidade', value: 'city' },
  { text: 'Telefone', value: 'phone' },
  { text: 'E-mail', value: 'email' },
  { text: 'Ações', value: 'actions', sortable: false, width: '120px' },
]

const form = reactive({
  id: null,
  name: '',
  company_name: '',
  document: '',
  address: '',
  city: '',
  phone: '',
  email: '',
})

onMounted(() => store.fetchAll())

const filteredSuppliers = computed(() =>
  store.list.filter(s => {
    const byName = !filterOptions.name || s.name.toLowerCase().includes(filters.name.toLowerCase())
    const byCompany =
      !filterOptions.company_name ||
      s.company_name.toLowerCase().includes(filters.company_name.toLowerCase())
    const byEmail = !filterOptions.email || s.email.toLowerCase().includes(filters.email.toLowerCase())
    const byPhone = !filterOptions.phone || s.phone.includes(filters.phone)
    return byName && byCompany && byEmail && byPhone
  })
)
const loading = computed(() => store.loading)

function openDialog() {
  Object.assign(form, {
    id: null,
    name: '',
    company_name: '',
    document: '',
    address: '',
    city: '',
    phone: '',
    email: '',
  })
  formRef.value?.resetValidation()
  dialog.value = true
}

function edit(item) {
  Object.assign(form, {
    id: item.id, // 👈 ESSENCIAL PARA EDIÇÃO
    name: item.name ?? '',
    company_name: item.company_name ?? '',
    document: item.document ?? '',
    address: item.address ?? '',
    city: item.city ?? '',
    phone: item.phone ?? '',
    email: item.email ?? '',
  })

  formRef.value?.resetValidation()
  dialog.value = true
}



function closeDialog() {
  dialog.value = false
}

async function save() {
  error.value = ''

  const isValid = await formRef.value?.validate()
  if (!isValid) return

  try {
    if (form.id) {
      await axios.put(`/api/suppliers/${form.id}`, form)
    } else {
      await axios.post('/api/suppliers', form)
    }

    await store.fetchAll()
    formRef.value?.resetValidation()
    dialog.value = false
    successDialog.value = true
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || 'Erro ao salvar fornecedor.'
  }
}


function confirmDelete(item) {
  deleteSupplier.value = item
  deleteDialog.value = true
}

async function removeConfirmed() {
  deleteDialog.value = false
  try {
    await axios.delete(`/api/suppliers/${deleteSupplier.value.id}`)
    await store.fetchAll()
  } catch {
    error.value = 'Erro ao excluir fornecedor.'
  }
}

function resetFilters() {
  Object.assign(filters, { name: '', company_name: '', email: '', phone: '' })
  Object.assign(filterOptions, { name: false, company_name: false, email: false, phone: false })
}

function exportPDF() {
  const doc = new jsPDF()
  const cols = headers.filter(h => h.value !== 'actions').map(h => h.text)
  const rows = filteredSuppliers.value.map(s => [
    s.id,
    s.name,
    s.company_name,
    s.document,
    s.address,
    s.city,
    s.phone,
    s.email,
  ])

  autoTable(doc, {
    head: [cols],
    body: rows,
    startY: 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.setFontSize(18)
  doc.text('Lista de Fornecedores', 14, 22)
  doc.save('fornecedores.pdf')
}
</script>

<style scoped>
.data-table-header {
  background-color: #424242;
  color: white;
  padding: 8px 16px;
  border-bottom: 1px solid #616161;
}
.data-table-header > .v-col {
  display: flex;
  align-items: center;
}
.data-table-header strong {
  color: white;
}
.v-data-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
