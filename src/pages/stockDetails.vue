<template>
  <v-container>
    <v-row class="justify-space-between align-center mb-4">
      <v-col cols="auto">
        <h2>Produtos no Estoque: {{ stock?.productName }}</h2>
      </v-col>

      <v-col cols="auto" v-if="isAdmin">
        <v-btn color="primary" @click="openProductDialog">
          <v-icon left>mdi-plus-box</v-icon> Adicionar Produto ao Estoque
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" dismissible>{{ error }}</v-alert>

    <v-data-table
      :headers="headers"
      :items="filteredItems"
      class="elevation-1"
      density="compact"
    >
      <template #item.actions="{ item }">
        <v-icon small class="me-2" @click="editProduct(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteProduct(item.id)">mdi-delete</v-icon>
      </template>
    </v-data-table>

    <!-- Modal de Formulário -->
    <v-dialog v-model="productDialog" max-width="600px">
      <stockproductform
        :stock-id="stock.id"
        :product-stock="selectedProduct"
        @saved="fetchProducts"
        @close="closeProductDialog"
      />
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import stockproductform from '@/components/stockproductform.vue'

const route = useRoute()
const stock = ref(null)
const products = ref([])
const error = ref('')
const productDialog = ref(false)
const selectedProduct = ref(null)
const userRole = ref(null)

const headers = [
  { text: 'Nome', value: 'product.name' },
  { text: 'Descrição', value: 'product.description' },
  { text: 'Quantidade', value: 'quantity' },
  { text: 'Ações', value: 'actions', sortable: false }
]

const isAdmin = computed(() => userRole.value === 'admin' || userRole.value === 'coworker')

const filteredItems = computed(() =>
  products.value.filter(p => p.isActive)
)

async function fetchUser() {
  try {
    const { data } = await axios.get('/api/users')
    userRole.value = data.role
  } catch {
    userRole.value = null
  }
}

async function fetchStock() {
  try {
    const { data } = await axios.get(`/api/stock/${route.params.id}`)
    stock.value = data
  } catch {
    error.value = 'Erro ao carregar estoque'
  }
}

async function fetchProducts() {
  try {
    const { data } = await axios.get(`/api/stock/${route.params.id}/products`)
    products.value = data
  } catch {
    error.value = 'Erro ao carregar produtos do estoque'
  }
}

function openProductDialog() {
  selectedProduct.value = null
  productDialog.value = true
}

function closeProductDialog() {
  productDialog.value = false
}

function editProduct(prod) {
  selectedProduct.value = { ...prod }
  productDialog.value = true
}

function deleteProduct(id) {
  if (!confirm('Deseja realmente inativar este produto do estoque?')) return
  axios
    .patch(`/api/product-stock/${id}/deactivate`)
    .then(() => fetchProducts())
    .catch(() => {
      error.value = 'Erro ao inativar produto.'
    })
}

onMounted(async () => {
  await fetchUser()
  await fetchStock()
  await fetchProducts()
})
</script>
