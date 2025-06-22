<!-- src/pages/Products.vue -->
<template>
  <v-app>
    <v-container fluid class="py-4">
      <!-- Toolbar -->
      <v-row class="mb-2">
        <v-col>
          <v-toolbar flat>
            <v-toolbar-title>Produtos</v-toolbar-title>
            <v-spacer />
            <!-- Botão sempre visível -->
            <v-btn color="primary" @click="openDialog">
              Adicionar Produto
            </v-btn>
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

      <!-- Alerta de Erro -->
      <v-alert
        v-if="error"
        type="error"
        dismissible
        class="mb-4"
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>

      <!-- Tabela de Produtos -->
      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        :loading="loading"
        class="elevation-1"
        item-value="id"
      >
        <template #item.image_url="{ item }">
          <v-avatar size="32">
            <img :src="item.image_url" alt="Imagem do produto" />
          </v-avatar>
        </template>

        <template #item.actions="{ item }">
          <!-- Botões sempre visíveis -->
          <v-btn icon @click="edit(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="remove(item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <!-- Diálogo de Formulário -->
      <v-dialog
        v-model="dialog"
        max-width="600px"
        :fullscreen="$vuetify.display.smAndDown"
      >
        <v-card>
          <v-card-title class="text-h6">
            {{ form.id ? 'Editar Produto' : 'Novo Produto' }}
          </v-card-title>
          <v-card-text>
            <ProductForm
              :form="form"
              :formRef="formRef"
              :suppliers="suppliers"
              :categories="categories"
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

      <!-- Diálogo de Filtros -->
      <v-dialog v-model="filterDialog" max-width="400px">
        <v-card>
          <v-card-title>Filtros</v-card-title>
          <v-card-text>
            <v-checkbox v-model="filterOptions.name" label="Nome" />
            <v-checkbox v-model="filterOptions.supplier" label="Fornecedor" />
            <v-checkbox v-model="filterOptions.category" label="Categoria" />
            <v-checkbox v-model="filterOptions.nickname" label="Apelido" />

            <v-divider class="my-2" />

            <v-text-field
              v-if="filterOptions.name"
              v-model="filters.name"
              label="Nome"
              clearable
            />
            <v-text-field
              v-if="filterOptions.supplier"
              v-model="filters.supplier"
              label="Fornecedor"
              clearable
            />
            <v-text-field
              v-if="filterOptions.category"
              v-model="filters.category"
              label="Categoria"
              clearable
            />
            <v-text-field
              v-if="filterOptions.nickname"
              v-model="filters.nickname"
              label="Apelido"
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
  </v-app>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import ProductForm from '@/components/ProductForm.vue'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'

const store = useProductsStore()
const auth = useAuthStore()

// Computed para isAdmin (você pode reativar mais tarde)
const isAdmin = computed(() => auth.user?.role === 'admin')

const formRef = ref(null)
const dialog = ref(false)
const filterDialog = ref(false)
const successDialog = ref(false)
const error = ref('')

const form = reactive({
  id: null,
  name: '',
  description: '',
  image_url: '',
  imageFile: null,
  costs: '',
  wholesale_price: '',
  retail_price: '',
  supplier_id: null,
  product_category_id: null,
  nicknames: []
})

const filters = reactive({
  name: '',
  supplier: '',
  category: '',
  nickname: ''
})
const filterOptions = reactive({
  name: false,
  supplier: false,
  category: false,
  nickname: false
})

const headers = [
  { text: 'ID', value: 'id', width: '60px' },
  { text: 'Imagem', value: 'image_url', width: '80px' },
  { text: 'Nome', value: 'name' },
  { text: 'Descrição', value: 'description' },
  { text: 'Fornecedor', value: 'supplier.name' },
  { text: 'Categoria', value: 'category.name' },
  { text: 'Custo', value: 'costs' },
  { text: 'Preço Atacado', value: 'wholesale_price' },
  { text: 'Preço Varejo', value: 'retail_price' },
  { text: 'Ações', value: 'actions', sortable: false, width: '120px' }
]

const loading = computed(() => store.loading)
const suppliers = ref([])
const categories = ref([])

onMounted(async () => {
  // Se você tiver fetchUser no auth store
  if (auth.fetchUser) await auth.fetchUser()

  await store.fetchAll()

  // Carrega listas
  const sup = await axios.get('/api/suppliers')
  suppliers.value = sup.data.data || sup.data

  const cat = await axios.get('/api/product_categories')
  categories.value = cat.data.data || cat.data
})

const filteredProducts = computed(() =>
  store.list.filter(p => {
    const byName = !filterOptions.name || p.name.toLowerCase().includes(filters.name.toLowerCase())
    const bySupplier = !filterOptions.supplier || p.supplier?.name.toLowerCase().includes(filters.supplier.toLowerCase())
    const byCategory = !filterOptions.category || p.category?.name.toLowerCase().includes(filters.category.toLowerCase())
    const byNickname = !filterOptions.nickname || p.nicknames?.some(n => n.nickname.toLowerCase().includes(filters.nickname.toLowerCase()))
    return byName && bySupplier && byCategory && byNickname
  })
)

function openDialog() {
  Object.assign(form, {
    id: null,
    name: '',
    description: '',
    image_url: '',
    imageFile: null,
    costs: '',
    wholesale_price: '',
    retail_price: '',
    supplier_id: null,
    product_category_id: null,
    nicknames: []
  })
  formRef.value?.resetValidation()
  dialog.value = true
}

function edit(item) {
  Object.assign(form, {
    id: item.id,
    name: item.name,
    description: item.description,
    image_url: item.image_url,
    imageFile: null,
    costs: item.costs,
    wholesale_price: item.wholesale_price,
    retail_price: item.retail_price,
    supplier_id: item.supplier_id,
    product_category_id: item.product_category_id,
    nicknames: item.nicknames.map(n => n.nickname)
  })
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
    if (form.imageFile) {
      const fd = new FormData()
      fd.append('file', form.imageFile)
      const { data: up } = await axios.post('/api/uploads', fd)
      form.image_url = up.url
    }

    let resp
    if (form.id) {
      resp = await axios.put(`/api/products/${form.id}`, form)
    } else {
      resp = await axios.post('/api/products', form)
      form.id = resp.data.id
    }

    await axios.put(`/api/products/${form.id}/nicknames`, { nicknames: form.nicknames })
    await store.fetchAll()
    closeDialog()
    successDialog.value = true
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || 'Erro ao salvar produto.'
  }
}

async function remove(item) {
  if (!confirm(`Deseja excluir ${item.name}?`)) return
  try {
    await axios.delete(`/api/products/${item.id}`)
    await store.fetchAll()
  } catch (e) {
    console.error(e)
    error.value = 'Erro ao excluir produto.'
  }
}

function resetFilters() {
  Object.assign(filters, { name: '', supplier: '', category: '', nickname: '' })
  Object.assign(filterOptions, { name: false, supplier: false, category: false, nickname: false })
}

function exportPDF() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Lista de Produtos', 14, 22)

  const cols = headers.filter(h => !['actions','image_url'].includes(h.value)).map(h => h.text)
  const rows = filteredProducts.value.map(p => [
    p.id, p.name, p.description,
    p.supplier?.name || '',
    p.category?.name || '',
    p.costs, p.wholesale_price, p.retail_price
  ])

  doc.autoTable({ head:[cols], body:rows, startY:30, styles:{fontSize:10}, headStyles:{fillColor:[41,128,185]} })
  doc.save('produtos.pdf')
}
</script>
