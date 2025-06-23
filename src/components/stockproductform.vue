<template>
  <v-card>
    <v-card-title>
      <span class="text-h6">
        {{ form.id ? 'Editar Produto no Estoque' : 'Adicionar Produto ao Estoque' }}
      </span>
    </v-card-title>

    <v-card-text>
      <v-form ref="formRef" @submit.prevent="save">
        <v-select
          v-model="form.product_id"
          :items="products"
          item-title="name"
          item-value="id"
          label="Produto"
          prepend-icon="mdi-package-variant"
          :rules="[rules.required]"
          :disabled="!!form.id"
        />
        <v-text-field
          v-model="form.quantity"
          type="number"
          label="Quantidade"
          prepend-icon="mdi-counter"
          :rules="[rules.required, rules.number]"
        />
        <v-text-field
          v-model="form.min_stock"
          type="number"
          label="Estoque Mínimo (alerta)"
          prepend-icon="mdi-bell-alert"
          :rules="[rules.required, rules.number]"
        />
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color="grey-darken-1" variant="text" @click="$emit('close')">Cancelar</v-btn>
      <v-btn color="primary" @click="save">Salvar</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  stockId: Number,
  productStock: Object // para edição
})
const emit = defineEmits(['saved', 'close'])

const formRef = ref(null)
const products = ref([])
const form = ref({
  id: null,
  product_id: null,
  stock_id: null,
  quantity: 0,
  min_stock: 0,
  isActive: true
})

const rules = {
  required: v => !!v || 'Campo obrigatório',
  number: v => !isNaN(v) || 'Deve ser numérico'
}

onMounted(async () => {
  await fetchProducts()
  if (props.productStock) {
    form.value = { ...props.productStock }
  } else {
    form.value.stock_id = props.stockId
  }
})

async function fetchProducts() {
  try {
    const { data } = await axios.get('/api/products')
    products.value = data
  } catch {
    alert('Erro ao buscar produtos.')
  }
}

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    if (form.value.id) {
      await axios.put(`/api/product-stock/${form.value.id}`, form.value)
    } else {
      await axios.post('/api/product-stock', form.value)
    }
    emit('saved')
    emit('close')
  } catch {
    alert('Erro ao salvar produto no estoque.')
  }
}
</script>
