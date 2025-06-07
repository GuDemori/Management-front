<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          label="Buscar por cliente ou status"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          dense
        />
      </v-col>

      <v-col class="text-right">
        <v-btn color="primary" @click="openDialog">
          <v-icon left>mdi-plus</v-icon>
          Novo Pedido
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="filteredOrders"
      item-value="id"
      class="elevation-1"
      :search="search"
    >
      <template #item.actions="{ item }">
        <v-btn icon @click="editOrder(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon @click="deleteOrder(item)">
          <v-icon color="red">mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <OrderForm :dialog="dialog" :order="editedOrder" @close="closeDialog" />
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import OrderForm from '@/components/orderForm.vue'

const search = ref('')
const dialog = ref(false)
const editedOrder = ref(null)

const orders = ref([
  {
    id: 1,
    client: 'João da Silva',
    date: '2025-05-29',
    status: 'Em espera',
    total: 125.5
  },
  {
    id: 2,
    client: 'Maria Oliveira',
    date: '2025-05-30',
    status: 'Entregue',
    total: 299.9
  }
])

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Cliente', key: 'client' },
  { title: 'Data', key: 'date' },
  { title: 'Status', key: 'status' },
  { title: 'Total (R$)', key: 'total' },
  { title: 'Ações', key: 'actions', sortable: false }
]

const openDialog = () => {
  editedOrder.value = null
  dialog.value = true
}

const editOrder = (order) => {
  editedOrder.value = { ...order }
  dialog.value = true
}

const deleteOrder = (order) => {
  orders.value = orders.value.filter(o => o.id !== order.id)
}

const closeDialog = () => {
  dialog.value = false
}

const filteredOrders = computed(() => {
  return orders.value.filter(order =>
    order.client.toLowerCase().includes(search.value.toLowerCase()) ||
    order.status.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>