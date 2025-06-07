<template>
  <v-container fluid class="py-4">
    <v-row class="mb-2">
      <v-col>
        <v-toolbar flat>
          <v-toolbar-title>Produtos</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" @click="openDialog">Novo Produto</v-btn>
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

    <v-data-table
      :headers="headers"
      :items="filteredProducts"
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

    <!-- Diálogo de Formulário -->
    <v-dialog v-model="dialog" max-width="500px" :fullscreen="$vuetify.display.smAndDown">
      <v-card>
        <v-card-title class="text-h6">
          {{ form.id ? 'Editar Produto' : 'Novo Produto' }}
        </v-card-title>
        <v-card-text>
          <ProductForm :form="form" :formRef="formRef" @submit="save" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" @click="closeDialog" prepend-icon="mdi-close">Cancelar</v-btn>
          <v-btn color="primary" @click="save" prepend-icon="mdi-content-save">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Filtros -->
    <v-dialog v-model="filterDialog" max-width="400px">
      <v-card>
        <v-card-title>Filtros</v-card-title>
        <v-card-text>
          <v-checkbox v-model="filterOptions.name" label="Filtrar por Nome" />
          <v-checkbox v-model="filterOptions.supplier" label="Filtrar por Fornecedor" />

          <v-divider class="my-2" />

          <v-text-field v-if="filterOptions.name" v-model="filters.name" label="Nome" clearable />
          <v-text-field v-if="filterOptions.supplier" v-model="filters.supplier" label="Fornecedor" clearable />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="resetFilters">Limpar</v-btn>
          <v-btn color="primary" @click="filterDialog = false">Aplicar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Sucesso -->
    <v-dialog v-model="successDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="headline">Sucesso</v-card-title>
        <v-card-text>
          Produto {{ form.id ? 'atualizado' : 'cadastrado' }} com sucesso!
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
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import ProductForm from '@/components/ProductForm.vue'
import { useProductsStore } from '@/stores/products'

const store = useProductsStore()
const formRef = ref(null)
const dialog = ref(false)
const filterDialog = ref(false)
const successDialog = ref(false)
const error = ref('')

const form = reactive({
  id: null,
  nome: '',
  descricao: '',
  valor: '',
  fornecedor: ''
})

const filterOptions = reactive({
  name: false,
  supplier: false
})

const filters = reactive({
  name: '',
  supplier: ''
})

const headers = [
  { text: 'ID', value: 'id', width: '60px' },
  { text: 'Nome', value: 'nome' },
  { text: 'Descrição', value: 'descricao' },
  { text: 'Valor', value: 'valor' },
  { text: 'Fornecedor', value: 'fornecedor' },
  { text: 'Ações', value: 'actions', sortable: false, width: '120px' },
]

onMounted(() => {
  store.fetchAll()
})

const filteredProducts = computed(() => {
  return store.list.filter(p => {
    const byName = !filterOptions.name || p.nome?.toLowerCase().includes(filters.name.toLowerCase())
    const bySupplier = !filterOptions.supplier || p.fornecedor?.toLowerCase().includes(filters.supplier.toLowerCase())
    return byName && bySupplier
  })
})

const loading = computed(() => store.loading)

function openDialog() {
  Object.assign(form, {
    id: null,
    nome: '',
    descricao: '',
    valor: '',
    fornecedor: ''
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
      await axios.put(`/api/products/${form.id}`, form)
    } else {
      await axios.post('/api/products', form)
    }
    await store.fetchAll()
    closeDialog()
    successDialog.value = true
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || 'Erro ao salvar produto.'
  }
}

async function remove(item) {
  if (!confirm(`Deseja excluir ${item.nome}?`)) return
  try {
    await axios.delete(`/api/products/${item.id}`)
    await store.fetchAll()
  } catch (e) {
    console.error(e)
    error.value = 'Erro ao excluir produto.'
  }
}

function resetFilters() {
  filters.name = ''
  filters.supplier = ''
  filterOptions.name = false
  filterOptions.supplier = false
}

function exportPDF() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Lista de Produtos', 14, 22)

  const cols = headers.filter(h => h.value !== 'actions').map(h => h.text)
  const rows = filteredProducts.value.map(p => [
    p.id,
    p.nome,
    p.descricao,
    p.valor,
    p.fornecedor
  ])

  doc.autoTable({
    head: [cols],
    body: rows,
    startY: 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  })

  doc.save('produtos.pdf')
}
</script>
