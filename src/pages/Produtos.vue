<template>
  <v-container fluid class="py-4">
    <!-- Toolbar -->
    <v-row class="mb-2">
      <v-col>
        <v-toolbar flat>
          <v-toolbar-title>Produtos</v-toolbar-title>
          <v-spacer />

          <!-- Botão “Adicionar” com ícone mdi-plus-box -->
          <v-btn color="primary" @click="openDialog">
            <v-icon left>mdi-plus-box</v-icon>
            Novo Produto
          </v-btn>

          <!-- Botão “Exportar PDF” com ícone mdi-file-pdf-box -->
          <v-btn color="secondary" class="ml-2" @click="exportPDF">
            <v-icon left>mdi-file-pdf-box</v-icon>
            Exportar PDF
          </v-btn>

          <!-- Botão de filtros -->
          <v-btn icon class="ml-2" @click="filterDialog = true">
            <v-icon>mdi-filter-variant</v-icon>
          </v-btn>
        </v-toolbar>
      </v-col>
    </v-row>

    <!-- Tabela de produtos filtrada -->
    <v-row>
      <v-col>
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
      </v-col>
    </v-row>

    <!-- Diálogo de Create/Edit -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">
          {{ form.id ? 'Editar Produto' : 'Novo Produto' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="save">
            <v-text-field
              v-model="form.name"
              label="Nome"
              :rules="nameRules"
              required
            />
            <v-text-field
              v-model="form.category"
              label="Categoria"
              :rules="categoryRules"
              required
            />
            <v-text-field
              v-model="form.price"
              label="Preço"
              :rules="priceRules"
              required
              inputmode="decimal"
            />
            <v-text-field
              v-model="form.stock"
              label="Estoque"
              :rules="stockRules"
              required
              inputmode="numeric"
              pattern="\d*"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" @click="save">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de Filtros -->
    <v-dialog v-model="filterDialog" max-width="400px">
      <v-card>
        <v-card-title>Filtros</v-card-title>
        <v-card-text>
          <v-checkbox v-model="filterOptions.name" label="Por Nome" />
          <v-checkbox v-model="filterOptions.category" label="Por Categoria" />
          <v-checkbox v-model="filterOptions.price" label="Por Faixa de Preço" />
          <v-divider class="my-2" />
          <v-text-field
            v-if="filterOptions.name"
            v-model="filters.name"
            label="Nome"
            clearable
          />
          <v-text-field
            v-if="filterOptions.category"
            v-model="filters.category"
            label="Categoria"
            clearable
          />
          <v-text-field
            v-if="filterOptions.price"
            v-model.number="filters.price"
            label="Preço Máximo"
            type="number"
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
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { useProductsStore } from '@/stores/products'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

const store        = useProductsStore()
const formRef      = ref(null)
const dialog       = ref(false)
const filterDialog = ref(false)

// opções de filtro ativo
const filterOptions = reactive({
  name: false,
  category: false,
  price: false,
})

// valores dos filtros
const filters = reactive({
  name: '',
  category: '',
  price: null,
})

const headers = [
  { text: 'ID',        value: 'id',        width: '80px' },
  { text: 'Nome',      value: 'name' },
  { text: 'Categoria', value: 'category' },
  { text: 'Preço',     value: 'price' },
  { text: 'Estoque',   value: 'stock' },
  { text: 'Ações',     value: 'actions', sortable: false, width: '120px' },
]

const form = reactive({
  id: null,
  name: '',
  category: '',
  price: '',
  stock: '',
})

// regras de validação
const nameRules = [
  v => !!v || 'Nome é obrigatório',
  v => (v && v.length >= 3) || 'Mínimo 3 caracteres',
]
const categoryRules = [
  v => !!v || 'Categoria é obrigatória',
]
const priceRules = [
  v => !!v || 'Preço é obrigatório',
  v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0 || 'Preço inválido',
]
const stockRules = [
  v => !!v || 'Estoque é obrigatório',
  v => /^\d+$/.test(v) || 'Apenas números',
]

onMounted(() => {
  store.fetchAll()
})

const filteredProducts = computed(() => {
  return store.list.filter(p => {
    const byName     = !filterOptions.name     || p.name.toLowerCase().includes(filters.name.toLowerCase())
    const byCategory = !filterOptions.category || p.category.toLowerCase().includes(filters.category.toLowerCase())
    const byPrice    = !filterOptions.price    || p.price <= filters.price
    return byName && byCategory && byPrice
  })
})

const loading = computed(() => store.loading)

function openDialog() {
  Object.assign(form, { id: null, name: '', category: '', price: '', stock: '' })
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
  if (form.id) {
    await axios.put(`/api/products/${form.id}`, form)
  } else {
    await axios.post('/api/products', form)
  }
  await store.fetchAll()
  closeDialog()
}

async function remove(item) {
  if (!confirm(`Excluir ${item.name}?`)) return
  await axios.delete(`/api/products/${item.id}`)
  await store.fetchAll()
}

function resetFilters() {
  filters.name     = ''
  filters.category = ''
  filters.price    = null
  filterOptions.name     = false
  filterOptions.category = false
  filterOptions.price    = false
}

function exportPDF() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Lista de Produtos', 14, 22)

  const cols = headers.filter(h => h.value !== 'actions').map(h => h.text)
  const rows = filteredProducts.value.map(p => [p.id, p.name, p.category, p.price, p.stock])

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
