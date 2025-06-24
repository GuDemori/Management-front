<template>
    <v-card>
        <v-card-title>
            <span class="text-h6">{{ form.id ? 'Editar Produto no Estoque' : 'Adicionar Produto ao Estoque' }}</span>
        </v-card-title>

        <v-card-text>
            <v-form ref="formRef" @submit.prevent="save">
                <v-select v-model="form.product_id" :items="products" item-title="name" item-value="id" label="Produto"
                    :rules="[rules.required]" prepend-icon="mdi-package-variant" />
                <v-select v-model="form.stock_id" :items="stockOptions" item-title="label" item-value="id"
                    label="Estoque" prepend-icon="mdi-warehouse"
                    :rules="[rules.required]" />
                <v-text-field v-model="form.quantity" type="number" label="Quantidade"
                    :rules="[rules.required, rules.number]" prepend-icon="mdi-counter" />
                <v-text-field v-model="form.min_stock" type="number" label="Estoque Mínimo"
                    :rules="[rules.required, rules.number]" prepend-icon="mdi-bell-alert" />
            </v-form>
        </v-card-text>

        <v-card-actions>
            <v-spacer />
            <v-btn color="grey-darkeFn-1" variant="text" @click="$emit('close')">Cancelar</v-btn>
            <v-btn color="primary" @click="save">Salvar</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
    productStock: Object,
})
const emit = defineEmits(['close', 'saved'])

const formRef = ref(null)
const form = ref({
    id: null,
    product_id: null,
    stock_id: null,
    quantity: '',
    min_stock: '',
    isActive: true,
})

const products = ref([])
const stocks = ref([])
const stockOptions = ref([])

const rules = {
    required: v => !!v || 'Campo obrigatório',
    number: v => !isNaN(v) || 'Deve ser numérico',
}

const loadOptions = async () => {
    try {
        const [productsRes, stocksRes] = await Promise.all([
            axios.get('/api/products'),
            axios.get('/api/stock'),
        ])
        products.value = productsRes.data
        stocks.value = stocksRes.data.filter(s => s.isActive)
    } catch {
        console.error('Erro ao buscar produtos ou estoques')
    }
}

const fetchStocks = async () => {
    try {
        const { data } = await axios.get('/api/stock')
        stockOptions.value = data
            .filter(s => s.isActive)
            .map(s => ({
                id: s.id,
                label: `${s.city} - #${s.id}`
            }))
    } catch {
        alert('Erro ao carregar estoques.')
    }
}

onMounted(() => {
    loadOptions()
    fetchStocks()
})

watch(() => props.productStock, (val) => {
    form.value = val
        ? { ...val }
        : {
            id: null,
            product_id: null,
            stock_id: null,
            quantity: '',
            min_stock: '',
            isActive: true,
        }
}, { immediate: true })

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