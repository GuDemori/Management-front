<template>
  <v-app>
    <v-container fluid class="py-4">
      <!-- Toolbar Desktop -->
      <v-toolbar flat class="mb-4" v-show="$vuetify.display.mdAndUp">
        <v-toolbar-title>Pedidos</v-toolbar-title>
        <v-spacer />
        <v-text-field v-model="search" label="Buscar por cliente ou status" prepend-inner-icon="mdi-magnify" dense
          hide-details outlined style="max-width: 250px" class="mr-4" />
        <v-btn color="primary" @click="openDialog">
          <v-icon left>mdi-plus</v-icon>
          Novo Pedido
        </v-btn>
      </v-toolbar>

      <!-- Toolbar Mobile -->
      <v-row class="mb-4" v-show="$vuetify.display.smAndDown">
        <v-col cols="12">
          <v-toolbar flat>
            <v-toolbar-title>Pedidos</v-toolbar-title>
          </v-toolbar>
        </v-col>
        <v-col cols="12">
          <v-text-field v-model="search" label="Buscar por cliente ou status" prepend-inner-icon="mdi-magnify" dense
            outlined hide-details />
        </v-col>
        <v-col cols="12">
          <v-btn block color="primary" @click="openDialog">Novo Pedido</v-btn>
        </v-col>
      </v-row>

      <!-- Alertas -->
      <v-alert v-if="error" type="error" dismissible class="mb-4" @click:close="error = ''">
        {{ error }}
      </v-alert>
      <v-alert v-if="success" type="success" dismissible class="mb-4" @click:close="success = ''">
        {{ success }}
      </v-alert>

      <!-- Lista de Pedidos -->
      <v-data-table :headers="headers" :items="filteredOrders" :loading="store.loading" item-value="id"
        class="elevation-1" :search="search" loading-text="Carregando pedidos..."
        no-data-text="Nenhum pedido encontrado">
        <template #item.actions="{ item }">
          <router-link :to="`/pedidos/${item.id}`">
            <v-btn icon>
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </router-link>
          <v-btn icon @click="editOrder(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <template #item.createdAt="{ item }">
          {{ new Date(item.createdAt).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) }}
        </template>

        <template #item.totalValue="{ item }">
          R$ {{ Number(item.totalValue).toFixed(2).replace('.', ',') }}
        </template>

        <template #item.address="{ item }">
          {{ item.addressCity }} - {{ item.addressStreet }}, {{ item.addressNumber }}
        </template>

      </v-data-table>

      <!-- Formulário -->
      <OrderForm
        :dialog="dialog"
        :order="editedOrder"
        :products="products"
        @update:dialog="dialog = $event"
        @saved="handleSave"
      />
    </v-container>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import OrderForm from '@/components/orderForm.vue'
import axios from 'axios'

const store = useOrdersStore()

const products = ref([])
const search = ref('')
const dialog = ref(false)
const editedOrder = ref(null)
const error = ref('')
const success = ref('')

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Cliente', key: 'clientName' },
  { title: 'Endereço', key: 'address' },
  { title: 'Total (R$)', key: 'totalValue' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'actions', sortable: false }
]

onMounted(async () => {
  try {
    await store.fetchAll()

    const res = await axios.get('/api/products')
    products.value = res.data
  } catch (e) {
    error.value = 'Erro ao carregar pedidos.'
  }
})

const filteredOrders = computed(() =>
  store.list.filter(order =>
    order.client_name?.toLowerCase().includes(search.value.toLowerCase()) ||
    order.status?.toLowerCase().includes(search.value.toLowerCase())
  )
)

function openDialog() {
  editedOrder.value = null
  dialog.value = true
}

function editOrder(order) {
  editedOrder.value = { ...order }
  dialog.value = true
}

async function handleSave(data) {
  try {
    if (editedOrder.value) {
      await store.update(editedOrder.value.id, data)
      success.value = 'Pedido atualizado com sucesso!'
    } else {
      await store.create(data)
      success.value = 'Pedido criado com sucesso!'
    }
    await store.fetchAll()
  } catch (e) {
    console.error('Erro ao salvar pedido:', e)
    error.value = 'Erro ao salvar pedido.'
  } finally {
    dialog.value = false
  }
}

</script>