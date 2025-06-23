<template>
  <v-container>
    <v-row class="justify-space-between align-center mb-4">
      <v-col cols="auto">
        <h1>Estoque</h1>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="openDialog">Adicionar Estoque</v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" dismissible>{{ error }}</v-alert>

    <v-data-table
      :headers="headers"
      :items="filteredStocks"
      :search="search"
      class="elevation-1"
    >
      <template #top>
        <v-text-field
          v-model="search"
          label="Pesquisar"
          class="mx-4"
          append-icon="mdi-magnify"
          clearable
        />
      </template>

      <template #item.actions="{ item }">
        <v-icon small class="me-2" @click="editStock(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteStock(item.id)">mdi-delete</v-icon>
        <v-icon small @click="$router.push(`/estoque/${item.id}`)">mdi-eye</v-icon>

      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="800px">
      <stock-form :stock="selectedStock" @close="closeDialog" @saved="fetchStocks" />
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import stockForm from '@/components/stockform.vue'

const loading = ref(false)
const error = ref('')
const dialog = ref(false)
const search = ref('')
const selectedStock = ref(null)
const stocks = ref([])

const headers = [
  { text: 'Produto', value: 'productName' },
  { text: 'Quantidade', value: 'quantity' },
  { text: 'Localização', value: 'location' },
  { text: 'CEP', value: 'cep' },
  { text: 'Endereço', value: 'address' },
  { text: 'Número', value: 'number' },
  { text: 'Cidade', value: 'city' },
  { text: 'Estado', value: 'state' },
  { text: 'Ações', value: 'actions', sortable: false },
]

const filteredStocks = computed(() =>
  stocks.value.filter(s => s.isActive)
)

async function fetchStocks() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.get('/api/stock')
    stocks.value = data
  } catch (err) {
    error.value = err.response?.data?.message || 'Não foi possível carregar o estoque.'
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  selectedStock.value = null
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
}

const editStock = (stock) => {
  selectedStock.value = { ...stock }
  dialog.value = true
}

function deleteStock(id) {
  if (!confirm('Deseja realmente inativar este estoque?')) return
  axios
    .patch(`/api/stock/${id}/deactivate`)
    .then(() => fetchStocks())
    .catch(() => {
      error.value = 'Erro ao inativar estoque.'
    })
}

onMounted(fetchStocks)
</script>
