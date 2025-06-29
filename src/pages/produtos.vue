<template>
  <v-app>
    <v-container fluid class="py-4">
      <!-- Toolbar -->
     <!-- Toolbar Desktop -->
<!-- Toolbar Desktop -->
<v-toolbar flat class="mb-4" v-show="$vuetify.display.mdAndUp">
  <v-toolbar-title>Produtos</v-toolbar-title>
  <v-spacer />
  <v-text-field
    v-model="searchQuery"
    label="Buscar"
    prepend-inner-icon="mdi-magnify"
    dense
    hide-details
    outlined
    class="mr-4"
    style="max-width: 200px"
  />
  <v-select
    v-model="selectedStockId"
    :items="stock"
    item-value="id"
    item-title="name"
    label="Estoque"
    dense
    outlined
    hide-details
    style="max-width: 250px"
    class="mr-4"
  />
  <v-btn color="primary" @click="openDialog">Adicionar Produto</v-btn>
  <v-btn color="secondary" class="ml-2" @click="exportDialog = true">
    <v-icon left>mdi-file-pdf</v-icon>
    Exportar
  </v-btn>
  <v-btn icon class="ml-2" @click="filterDialog = true">
    <v-icon>mdi-filter-variant</v-icon>
  </v-btn>
</v-toolbar>

<!-- Toolbar Mobile -->
<!-- Toolbar Mobile -->
<v-row class="mb-4" v-show="$vuetify.display.smAndDown">
  <v-col cols="12">
    <v-toolbar flat>
      <v-toolbar-title>Produtos</v-toolbar-title>
    </v-toolbar>
  </v-col>

  <v-col cols="12">
    <v-text-field
      v-model="searchQuery"
      label="Buscar"
      prepend-inner-icon="mdi-magnify"
      dense
      hide-details
      outlined
    />
  </v-col>

  <v-col cols="12">
    <v-select
      v-model="selectedStockId"
      :items="stock"
      item-value="id"
      item-title="name"
      label="Estoque"
      dense
      outlined
      hide-details
    />
  </v-col>

  <v-col cols="12">
    <v-btn block color="primary" @click="openDialog">Adicionar Produto</v-btn>
  </v-col>

  <v-col cols="6">
    <v-btn block color="secondary" @click="exportDialog = true">
      <v-icon left>mdi-file-pdf</v-icon>
      Exportar
    </v-btn>
  </v-col>

  <v-col cols="6">
    <v-btn block color="grey darken-1" @click="filterDialog = true">
      <v-icon left>mdi-filter-variant</v-icon>
      Filtros
    </v-btn>
  </v-col>
</v-row>



      <!-- Alerta de Erro -->
      <v-alert v-if="error" type="error" dismissible class="mb-4" @click:close="error = ''">
        {{ error }}
      </v-alert>

      <!-- Alerta de Sucesso -->
      <v-alert v-if="successMessage" type="success" dismissible class="mb-4" @click:close="successMessage = ''">
        {{ successMessage }}
      </v-alert>

      <!-- Grade de Produtos responsiva estilo Mix Campeão -->
      <v-row dense>
        <v-col
          v-for="product in filteredProducts"
          :key="product.id"
          cols="6"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card class="text-center" outlined>
            <v-card-title class="text-subtitle-1 font-weight-bold justify-center">
              {{ product.name }}
            </v-card-title>

            <v-img
              :src="product.image_url"
              aspect-ratio="1"
              height="200"
              contain
              class="my-2"
            />

            <v-card-text class="pa-0">
              <div class="text-caption mt-2">
                <strong>Apelido:</strong>
                {{ product.nicknames?.[0]?.nickname || 'N/A' }}
              </div>
              <div class="text-caption">
                <strong>Descrição:</strong>
                {{ product.description || 'Sem descrição' }}
              </div>

              <div
                class="text-caption font-weight-medium mt-1 d-flex align-center justify-center"
                :class="product.stock_quantity > 0 ? 'text-success' : 'text-error'"
              >
                <v-icon size="10" :color="product.stock_quantity > 0 ? 'green' : 'red'" class="mr-1">mdi-circle</v-icon>
                {{ product.stock_quantity > 0 ? 'DISPONÍVEL' : 'INDISPONÍVEL' }}
              </div>
              <div class="d-flex justify-center mt-2">
                <v-btn icon class="mr-1" @click.stop="edit(product)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon class="mr-1" @click.stop="askDelete(product)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
                <v-btn icon @click.stop="openQuantityDialog(product)">
                  <v-icon>mdi-cart-plus</v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>


      <v-dialog v-model="quantityDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h6">
            Adicionar ao Carrinho
          </v-card-title>
          <v-card-text>
            <div>Produto: <strong>{{ selectedProduct?.name }}</strong></div>
            <div>Estoque disponível: <strong>{{ selectedProduct?.stock_quantity }}</strong></div>
          <v-text-field
              v-model.number="selectedQuantity"
              label="Quantidade"
              type="number"
              min="1"
              :max="selectedProduct?.stock_quantity"
              :rules="[v => v > 0 || 'Quantidade inválida']"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="quantityDialog = false">Cancelar</v-btn>
            <v-btn color="primary" @click="confirmAddToCart">Adicionar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
      <!-- Diálogo de Confirmação de Exclusão -->
      <v-dialog v-model="confirmDeleteDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h6">Confirmar Exclusão</v-card-title>
          <v-card-text>
            Tem certeza que deseja excluir
            <strong>{{ productToDelete?.name }}</strong>?
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="secondary" @click="confirmDeleteDialog = false">
              Cancelar
            </v-btn>
            <v-btn color="error" @click="remove" prepend-icon="mdi-delete">
              Excluir
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="exportDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h6">Exportar PDF</v-card-title>
          <v-card-text>
            <v-select
              v-model="selectedPrice"
              :items="['Atacado', 'Varejo']"
              label="Tipo de Preço"
              dense
              outlined
              required
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="exportDialog = false">Cancelar</v-btn>
            <v-btn color="primary" @click="handlePDFExport">Exportar</v-btn>
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
import autoTable from 'jspdf-autotable';
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const searchQuery = ref('')

const store = useProductsStore()
const authStore = useAuthStore();

const confirmDeleteDialog = ref(false)
const productToDelete = ref(null)

const formRef = ref(null)
const dialog = ref(false)
const filterDialog = ref(false)
const successDialog = ref(false)

const error = ref('')
const successMessage = ref('')

const exportDialog = ref(false)
const selectedPrice = ref('Atacado')

const cartStore = useCartStore()

const quantityDialog = ref(false)
const selectedProduct = ref(null)
const selectedQuantity = ref(1)

const stock = ref([])
const selectedStockId = ref(null)
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
  if (authStore.isLogged) {
    authStore.fetchUser()
      .then(() => {
        console.log('Usuário autenticado:', authStore.user)
      })
      .catch(error => {
        console.error('Erro ao buscar usuário:', error)
      })
  }

  await store.fetchAll()

  const sup = await axios.get('/api/suppliers')
  suppliers.value = sup.data.data || sup.data

  const cat = await axios.get('/api/product-categories')
  categories.value = cat.data.data || cat.data

  const { data } = await axios.get('/api/stock')
  const allStocks = data.data || data

  stock.value = allStocks
    .filter(s => s.isActive)
    .map(s => ({ ...s, name: `${s.city} - #${s.id}` }))

  const rondon = stock.value.find(s => s.city?.toLowerCase().includes('rondon'))
  selectedStockId.value = rondon?.id || stock.value[0]?.id || null

  if (selectedStockId.value) {
    await store.fetchAll(selectedStockId.value)
  }

})

const filteredProducts = computed(() =>
  store.list.filter(p => {
    const matchNameOrNickname =
      !searchQuery.value ||
      p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.nicknames?.some(n => n.nickname?.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const byName = !filterOptions.name || p.name.toLowerCase().includes(filters.name.toLowerCase())
    const bySupplier = !filterOptions.supplier || p.supplier?.name.toLowerCase().includes(filters.supplier.toLowerCase())
    const byCategory = !filterOptions.category || p.category?.name.toLowerCase().includes(filters.category.toLowerCase())
    const byNickname = !filterOptions.nickname || p.nicknames?.some(n => n.nickname.toLowerCase().includes(filters.nickname.toLowerCase()))

    return matchNameOrNickname && byName && bySupplier && byCategory && byNickname
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
    nicknames: Array.isArray(item.nicknames)
      ? item.nicknames.map(n => n.nickname)
      : []
  })
  formRef.value?.resetValidation()
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
}

function askDelete(item) {
  productToDelete.value = item
  confirmDeleteDialog.value = true
}

async function convertToWebP(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
            type: 'image/webp',
            lastModified: Date.now()
          })
          resolve(webpFile)
        }, 'image/webp', 0.8)
      }

      img.onerror = () => {
        console.warn('Erro ao converter imagem:', file.name)
        resolve(file)
      }

      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  })
}


async function save() {
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('description', form.description || '')
    formData.append('costs', form.costs)
    formData.append('wholesale_price', form.wholesale_price)
    formData.append('retail_price', form.retail_price)
    formData.append('supplier_id', form.supplier_id || '')
    formData.append('product_category_id', form.product_category_id)
    if (form.imageFile) {
      form.imageFile = await convertToWebP(form.imageFile)
      formData.append('image', form.imageFile)
      form.image_url = null
    } else if (form.image_url) {
      formData.append('image_url', form.image_url)
    }

    let resp
    if (form.id) {
      resp = await axios.post(`/api/products/${form.id}?_method=PUT`, formData)
    } else {
      resp = await axios.post('/api/products', formData)
      form.id = resp.data.id
    }

    await axios.put(`/api/products/${form.id}/nicknames`, {
      nicknames: form.nicknames
    })

    await store.fetchAll()
    closeDialog()
    successDialog.value = true
  } catch (e) {
    console.error(e)
    error.value = e.response?.data?.message || 'Erro ao salvar produto.'
  }
}


async function remove() {
  if (!productToDelete.value) return

  try {
    await axios.put(`/api/products/${productToDelete.value.id}/deactivate`)
    await store.fetchAll()
    confirmDeleteDialog.value = false
    productToDelete.value = null
  } catch (e) {
    console.error(e)
    error.value = 'Erro ao excluir produto.'
  }
}

function resetFilters() {
  Object.assign(filters, { name: '', supplier: '', category: '', nickname: '' })
  Object.assign(filterOptions, { name: false, supplier: false, category: false, nickname: false })
}

async function handlePDFExport() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Lista de Produtos', 14, 22)

  const max = 30
  const priceKey = selectedPrice.value === 'Atacado' ? 'wholesale_price' : 'retail_price'
  const priceLabel = selectedPrice.value === 'Atacado' ? 'Preço Atacado' : 'Preço Varejo'

  const rows = await Promise.all(
    filteredProducts.value.slice(0, max).map(async p => {
      const img = await toBase64(p.image_url)
      return {
        image: img,
        data: [
          p.id,
          p.name,
          p.description,
          p.supplier?.name || '',
          p.category?.name || '',
          p[priceKey]
        ]
      }
    })
  )

  autoTable(doc, {
    head: [['Imagem', 'ID', 'Nome', 'Descrição', 'Fornecedor', 'Categoria', priceLabel]],
    body: rows.map(r => [
      { content: '', styles: { cellWidth: 20, minCellHeight: 20 }, img: r.image },
      ...r.data
    ]),
    didDrawCell: function (data) {
      if (data.column.index === 0 && data.cell.section === 'body') {
        doc.addImage(data.row.raw[0].img, 'JPEG', data.cell.x + 2, data.cell.y + 2, 16, 16)
      }
    },
    startY: 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] }
  })

  doc.save(`produtos_preco_${selectedPrice.value.toLowerCase()}.pdf`)
}

function toBase64(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.onload = function () {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/jpeg'))
    }
    img.onerror = () => {
      console.warn('Erro ao carregar imagem:', url)
      resolve('')
    }
    img.src = url
  })
}

function addToCart(item) {
  cartStore.add(item)
}

function openQuantityDialog(product) {
  selectedProduct.value = product
  selectedQuantity.value = 1
  quantityDialog.value = true
}

function confirmAddToCart() {
  const product = selectedProduct.value
  const quantity = selectedQuantity.value

  const existingProductInCart = cartStore.items.find(item => item.id === product.id)
  const totalQuantityInCart = existingProductInCart ? existingProductInCart.quantity : 0

  const totalQuantity = totalQuantityInCart + quantity

  if (totalQuantity > product.stock_quantity) {
    error.value = `Estoque insuficiente. Disponível: ${product.stock_quantity}`

    setTimeout(() => {
      error.value = ''
    }, 3000)

    return
  }

  cartStore.add({ ...product, quantity })
  quantityDialog.value = false

  successMessage.value = `Produto "${product.name}" adicionado ao carrinho!`

  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

async function onStockChange(id) {
  selectedStockId.value = id
  try {
    await store.fetchAll(id)
  } catch (err) {
    console.error('❌ Erro ao trocar estoque:', err)
  }
}

</script>
