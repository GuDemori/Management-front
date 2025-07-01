<!-- src/pages/suppliers.vue -->
<template>
  <v-container fluid class="py-4">
    <!-- Toolbar -->
    <v-toolbar flat class="mb-4 d-flex align-center" style="gap: 12px; flex-wrap: wrap">
      <v-toolbar-title class="text-white font-weight-medium"
        style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
        Fornecedores
      </v-toolbar-title>
      <v-spacer />
      <v-text-field v-model="filters.name" label="Buscar por Nome" prepend-inner-icon="mdi-magnify" hide-details
        outlined dense style="max-width: 240px" />

      <v-text-field v-model="filters.phone" label="Buscar por Telefone" prepend-inner-icon="mdi-magnify" hide-details
        outlined dense style="max-width: 240px" />
      <v-btn text color="primary" class="font-weight-bold" @click="openDialog">
        NOVO FORNECEDOR
      </v-btn>

      <v-btn text color="success" class="font-weight-bold" @click="exportPDF">
        EXPORTAR PDF
      </v-btn>
    </v-toolbar>

    <!-- Alerta de erro -->
    <v-alert v-if="error" type="error" dismissible class="mb-4" @click:close="error = ''">
      {{ error }}
    </v-alert>

    <!-- Data-table com cabeçalho no slot top -->
    <v-data-table :headers="headers" :items="filteredSuppliers" :loading="loading" hide-default-header
      class="elevation-1" item-value="id">
      <!-- Slot TOP: cabeçalho personalizado -->
      <template #top>
        <v-row no-gutters class="custom-table-header">
          <v-col v-for="(header, index) in headers" :key="index" :style="getColStyle(header)"
            :class="{ 'text-center': header.value === 'actions' }">
            <strong>{{ header.text }}</strong>
          </v-col>
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
          <v-text-field v-model="filters.name" label="Nome" clearable />
          <v-text-field v-model="filters.phone" label="Telefone" clearable />
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
import logoBase64 from '@/assets/logo.png'


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

function getColStyle(header) {
  return header.width
    ? `min-width: ${header.width}; max-width: ${header.width};`
    : ''
}


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
    const byName = s.name.toLowerCase().includes(filters.name.toLowerCase())
    const byPhone = s.phone.includes(filters.phone)
    return byName && byPhone
  })
)

const loading = computed(() => store.loading)

function openDialog() {
  Object.assign(form, {
    id: null,
    name: '',
    company_name: '',
    document: '',
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
  Object.assign(filters, { name: '', phone: '' })
}


function exportPDF() {
  const doc = new jsPDF()
  const logo = new Image()
  logo.src = new URL('@/assets/logo.png', import.meta.url).href

  logo.onload = () => {
    const logoX = 14
    const logoY = 12
    const logoWidth = 30
    const logoHeight = 20

    doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight)

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Lista de Fornecedores', logoX + logoWidth + 10, logoY + 8)

    const dataHora = new Date().toLocaleString('pt-BR')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Emitido em: ${dataHora}`, 200 - 14, logoY + 8, { align: 'right' })

    doc.setDrawColor(180)
    doc.line(14, logoY + logoHeight + 2, 200 - 14, logoY + logoHeight + 2)

    const cols = headers.filter(h => h.value !== 'actions').map(h => h.text)
    const rows = filteredSuppliers.value.map(s => [
      s.id,
      s.name,
      s.company_name,
      s.document,
      s.city,
      s.phone,
      s.email,
    ])

    autoTable(doc, {
      head: [cols],
      body: rows,
      startY: logoY + logoHeight + 8,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [33, 150, 243], // azul moderado
        halign: 'center',
        valign: 'middle',
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages()
        doc.setFontSize(9)
        doc.text(`Página ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10)
      },
    })

    doc.save('fornecedores.pdf')
  }
}
</script>

<style scoped>
.custom-table-header {
  background: linear-gradient(90deg, #2c2c2c, #1e1e1e);
  /* degrade discreto */
  color: #f1f1f1;
  font-weight: 600;
  padding: 10px 20px;
  border-bottom: 2px solid #444;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-radius: 6px 6px 0 0;
}

.custom-table-header .v-col {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.data-table-header strong {
  color: white;
}

.v-data-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
