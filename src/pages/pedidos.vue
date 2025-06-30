<template>
  <v-app>
    <v-container fluid class="py-4">
      <!-- Toolbar Desktop -->
      <v-toolbar flat class="mb-4" v-show="$vuetify.display.mdAndUp">
        <v-toolbar-title>Pedidos</v-toolbar-title>
        <v-spacer />
        <v-text-field
          v-model="clientSearch"
          label="Buscar por cliente"
          prepend-inner-icon="mdi-account-search"
          dense
          hide-details
          outlined
          style="max-width: 250px"
          class="mr-4"
        />

        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          item-title="title"
          item-value="value"
          label="Filtrar por status"
          prepend-inner-icon="mdi-filter"
          dense
          hide-details
          outlined
          style="max-width: 200px"
          placeholder="Todos"
        />
      </v-toolbar>

      <!-- Toolbar Mobile -->
      <v-row class="mb-4" v-show="$vuetify.display.smAndDown">
        <v-col cols="12">
          <v-toolbar flat>
            <v-toolbar-title>Pedidos</v-toolbar-title>
          </v-toolbar>
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="clientSearch"
            label="Buscar por cliente"
            prepend-inner-icon="mdi-account-search"
            dense
            hide-details
            outlined
            style="max-width: 250px"
            class="mr-4"
            placeholder="Todos"
          />

          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            label="Filtrar por status"
            prepend-inner-icon="mdi-filter"
            dense
            hide-details
            outlined
            style="max-width: 200px"
          />
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
          <v-btn
            icon
            @click="handleEditClick(item)"
          >
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
  <v-snackbar v-model="snackbar" :timeout="3000" color="warning">
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import OrderForm from '@/components/orderForm.vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const store = useOrdersStore()

const products = ref([])
const search = ref ('')
const clientSearch = ref('')
const statusFilter = ref('')
const dialog = ref(false)
const editedOrder = ref(null)
const error = ref('')
const success = ref('')

const snackbar = ref(false)
const snackbarMessage = ref('')

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Cliente', key: 'clientName' },
  { title: 'Endereço', key: 'address' },
  { title: 'Total (R$)', key: 'totalValue' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'actions', sortable: false }
]

const statusOptions = [
  { title: 'Todos', value: '' },
  { title: 'Em espera', value: 'Em espera' },
  { title: 'Preparando', value: 'Preparando' },
  { title: 'À caminho', value: 'À caminho' },
  { title: 'Entregue', value: 'Entregue' },
  { title: 'Pago', value: 'Pago' },
  { title: 'Cancelado', value: 'Cancelado' }
]

onMounted(async () => {
  try {
    await store.fetchAll()
    const res = await axios.get('/api/products')
    products.value = res.data

    console.log('Pedidos carregados:', store.list)
    console.log('Valor inicial de search:', search.value)
    console.log('Valor inicial de statusFilter:', statusFilter.value)
    console.log('Resultado do filteredOrders:', filteredOrders.value)
  } catch (e) {
    error.value = 'Erro ao carregar pedidos.'
  }
})

const filteredOrders = computed(() =>
  store.list.filter(order => {
    const matchesClient = order.clientName?.toLowerCase().includes(clientSearch.value.toLowerCase())
    const matchesStatus = statusFilter.value
      ? order.status?.toLowerCase() === statusFilter.value.toLowerCase()
      : true

    return matchesClient && matchesStatus
  })
)

function openDialog() {
  editedOrder.value = null
  dialog.value = true
}

function editOrder(order) {
  if (!canEditOrder(order)) {
    snackbarMessage.value = `Você não pode editar pedidos com o status "${order.status}".`
    snackbar.value = true
    return
  }

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
    setTimeout(() => success.value = '', 3000)
  } catch (e) {
    console.error('Erro ao salvar pedido:', e)
    error.value = 'Erro ao salvar pedido.'
    setTimeout(() => error.value = '', 3000)
  } finally {
    dialog.value = false
  }
}

const canEditOrder = (order) => {
  const isClient = auth.user?.role === 'client'
  if (isClient) return order.status === 'Em espera'
  return ['Em espera', 'Preparando'].includes(order.status)
}

function handleEditClick(order) {
  if (!canEditOrder(order)) {
    snackbarMessage.value = `Você não pode editar pedidos com o status '${order.status}'.`
    snackbar.value = true
    return
  }

  editOrder(order)
}

</script>