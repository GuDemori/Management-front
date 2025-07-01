<template>
  <v-card>
    <v-card-title>
      <span class="text-h6">{{ form.id ? 'Editar Estoque' : 'Novo Estoque' }}</span>
    </v-card-title>

    <v-card-text>
      <v-form ref="formRef" @submit.prevent="save">
        <v-text-field v-model="form.cep"  v-mask="'#####-###'" label="CEP" prepend-icon="mdi-map-search" :rules="[rules.required]" @blur="fetchAddress" />
        <v-text-field v-model="form.address" label="Endereço" prepend-icon="mdi-road" :rules="[rules.required]" />
        <v-text-field v-model="form.number" label="Número" prepend-icon="mdi-numeric" :rules="[rules.required]" />
        <v-text-field v-model="form.city" label="Cidade" prepend-icon="mdi-city" :rules="[rules.required]" />
        <v-text-field v-model="form.state" label="Estado" prepend-icon="mdi-map" :rules="[rules.required]" />
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
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({ stock: Object })
const emit = defineEmits(['close', 'saved'])

const formRef = ref(null)
const form = ref({
  id: null,
  cep: '',
  address: '',
  number: '',
  city: '',
  state: '',
  isActive: true,
})

const rules = {
  required: v => !!v || 'Campo obrigatório',
}

watch(() => props.stock, (stock) => {
  form.value = stock
    ? { ...stock }
    : { id: null, cep: '', address: '', number: '', city: '', state: '', isActive: true }
}, { immediate: true })

const fetchAddress = async () => {
  const rawCep = form.value.cep?.replace(/\D/g, '')
  if (rawCep.length !== 8) return
  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${rawCep}/json`)
    if (data.erro) return
    form.value.address = data.logradouro
    form.value.city = data.localidade
    form.value.state = data.uf
  } catch (e) {
    console.error('Erro ao buscar CEP')
  }
}

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  try {
    if (form.value.id) {
      await axios.put(`/api/stock/${form.value.id}`, form.value)
    } else {
      await axios.post('/api/stock', form.value)
    }
    emit('saved')
    emit('close')
  } catch {
    alert('Erro ao salvar estoque.')
  }
}
</script>
