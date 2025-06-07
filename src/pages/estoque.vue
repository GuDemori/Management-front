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

    <v-data-table
      :headers="headers"
      :items="stocks"
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
      </template>
    </v-data-table>

    <!-- Diálogo -->
    <v-dialog v-model="dialog" max-width="600px">
      <stock-form :stock="selectedStock" @close="closeDialog" @saved="fetchStocks" />
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import stockForm from '@/components/stockform.vue'

const dialog = ref(false)
const search = ref('')
const selectedStock = ref(null)
const stocks = ref([])

const headers = [
  { text: 'Produto', value: 'productName' },
  { text: 'Quantidade', value: 'quantity' },
  { text: 'Localização', value: 'location' },
  { text: 'Ações', value: 'actions', sortable: false },
]

const fetchStocks = async () => {
  // Exemplo de fetch
  stocks.value = [
    {
      id: 1,
      productName: 'Doce de Leite',
      quantity: 120,
      location: 'Corredor 1 - Prateleira 2 - Gaveta 3',
    },
  ]
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

const deleteStock = (id) => {
  // Aqui entraria a lógica de exclusão com confirmação
  stocks.value = stocks.value.filter(s => s.id !== id)
}
onMounted(fetchStocks)
</script>
