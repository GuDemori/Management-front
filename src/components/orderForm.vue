<template>
  <v-dialog :model-value="dialog" @update:model-value="$emit('update:dialog', $event)" max-width="800">
    <v-form ref="formRef" @submit.prevent="save">
      <v-card>
        <v-card-title class="text-h5">Editar Pedido</v-card-title>

        <v-card-text>
          <v-text-field
            v-model="form.client"
            label="Cliente"
            prepend-icon="mdi-account"
            :rules="[rules.required]"
            disabled
          />

          <v-autocomplete
            v-model="selectedProduct"
            :items="products"
            item-title="name"
            item-value="id"
            label="Buscar Produto"
            placeholder="Digite o nome ou apelido e selecione"
            :filter="customFilter"
            @update:model-value="handleAddProduct"
            clearable
          />

          <div class="mt-2">
            <v-chip
              v-for="(item, i) in form.items"
              :key="item.id"
              closable
              class="ma-1"
              @click:close="removeItem(i)"
              @click="openQuantityDialog(item)"
            >
              {{ item.product_name}} ({{ item.quantity }} und)
            </v-chip>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn type="button" text @click="$emit('update:dialog', false)">Cancelar</v-btn>
          <v-btn type="submit" color="primary">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <!-- Modal de quantidade -->
  <v-dialog v-model="quantityDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Selecionar Quantidade</v-card-title>
      <v-card-text>
        <v-text-field
          v-model.number="currentProduct.quantity"
          label="Quantidade"
          type="number"
          :rules="[rules.required, rules.positive]"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="quantityDialog = false">Cancelar</v-btn>
        <v-btn color="primary" @click="confirmQuantity">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const isClient = computed(() => auth.user?.role === 'client')

const props = defineProps({
  dialog: Boolean,
  order: Object,
  products: Array
})
const emit = defineEmits(['update:dialog', 'saved'])

const formRef = ref(null)
const form = ref({ client: '', items: [] })
const selectedProduct = ref(null)

const quantityDialog = ref(false)
const currentProduct = ref({})

const rules = {
  required: v => !!v || 'Campo obrigatório',
  positive: v => v > 0 || 'Deve ser maior que zero'
}
watch(() => props.order, (order) => {
  if (order) {
    console.log('order.items:', order.items)
    form.value = {
      client: order.clientName || '',
      items: order.items?.map(i => ({
        id: i.productId ?? i.product_id ?? i.id,
        product_id: i.productId ?? i.product_id ?? i.id,
        product_name: i.productName ?? i.product_name ?? '',
        price_unit: i.priceUnit ?? i.price_unit ?? 0,
        quantity: i.quantity ?? 1,
        subtotal: (i.quantity * (i.priceUnit ?? i.price_unit ?? 0)).toFixed(2)
      })) || []
    }
  }
}, { immediate: true })

watch(() => props.products, (val) => {
  console.log('props.products:', val)
}, { immediate: true })

const handleAddProduct = () => {
  const product = props.products.find(p => p.id === selectedProduct.value)
  if (!product || form.value.items.some(i => i.id === product.id)) return

  currentProduct.value = { ...product, quantity: 1 }
  quantityDialog.value = true
}

const confirmQuantity = () => {
  const product = currentProduct.value

  form.value.items.push({
    id: product.id,
    product_id: product.id,
    product_name: product.name,
    price_unit: product.wholesale_price,
    quantity: product.quantity,
    subtotal: (product.quantity * product.wholesale_price).toFixed(2)
  })

  selectedProduct.value = null
  quantityDialog.value = false
}

const removeItem = (index) => form.value.items.splice(index, 1)
const openQuantityDialog = (item) => {
  currentProduct.value = item
  quantityDialog.value = true
}

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const items = form.value.items.map(item => ({
    product_id: item.product_id ?? item.id,
    product_name: item.product_name ?? item.name ?? '',
    quantity: item.quantity,
    price_unit: item.price_unit ?? item.wholesale_price ?? 0,
    subtotal: Number(item.quantity * (item.price_unit ?? item.wholesale_price ?? 0)).toFixed(2)
  }))
  console.table(items)
  const payload = {
    client_id: isClient.value ? undefined : props.order.client_id,
    client_name: props.order.client_name,
    address_street: props.order.address_street,
    address_number: props.order.address_number,
    address_district: props.order.address_district,
    address_city: props.order.address_city,
    address_state: props.order.address_state,
    address_zipcode: props.order.address_zipcode,
    items
  }

  emit('saved', payload)
  emit('update:dialog', false)
}
const customFilter = (item, queryText, itemText) => {
  const text = `${item.name} ${item.nickname || ''}`.toLowerCase()
  return text.includes(queryText.toLowerCase())
}
</script>