<template>
  <v-card>
    <v-card-title>
      <span class="text-h6">{{ form.id ? 'Editar Estoque' : 'Novo Estoque' }}</span>
    </v-card-title>

    <v-card-text>
      <v-form ref="formRef" @submit.prevent="save">
        <v-text-field
          v-model="form.productName"
          label="Nome do Produto"
          prepend-icon="mdi-package-variant"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.quantity"
          type="number"
          label="Quantidade"
          prepend-icon="mdi-counter"
          :rules="[rules.required, rules.number]"
        />
        <v-text-field
          v-model="form.location"
          label="Localização (Corredor/Prateleira)"
          prepend-icon="mdi-map-marker"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.cep"
          label="CEP"
          prepend-icon="mdi-map-search"
          :rules="[rules.required]"
          @blur="fetchAddress"
          :error="!!cepError"
          :error-messages="cepError"
        />
        <v-text-field
          v-model="form.address"
          label="Endereço"
          prepend-icon="mdi-road"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.number"
          label="Número"
          prepend-icon="mdi-numeric"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.city"
          label="Cidade"
          prepend-icon="mdi-city"
          :rules="[rules.required]"
        />
        <v-text-field
          v-model="form.state"
          label="Estado"
          prepend-icon="mdi-map"
          :rules="[rules.required]"
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
import { ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({ stock: Object })
const emit = defineEmits(['close', 'saved'])

const formRef = ref(null)
const cepError = ref('')

const form = ref({
  id: null,
  productName: '',
  quantity: '',
  location: '',
  cep: '',
  address: '',
  number: '',
  city: '',
  state: ''
})

const rules = {
  required: v => !!v || 'Campo obrigatório',
  number: v => !isNaN(v) || 'Deve ser numérico'
}

watch(() => props.stock, (stock) => {
  if (stock) {
    form.value = { ...stock }
  } else {
    form.value = {
      id: null,
      productName: '',
      quantity: '',
      location: '',
      cep: '',
      address: '',
      number: '',
      city: '',
      state: ''
    }
  }
}, { immediate: true })

const fetchAddress = async () => {
  cepError.value = ''
  const cep = form.value.cep?.replace(/\D/g, '')
  if (cep.length !== 8) {
    cepError.value = 'CEP deve conter 8 dígitos'
    return
  }

  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json`)
    if (data.erro) {
      cepError.value = 'CEP não encontrado'
      return
    }

    form.value.address = data.logradouro || ''
    form.value.city = data.localidade || ''
    form.value.state = data.uf || ''
  } catch {
    cepError.value = 'Erro ao buscar CEP'
  }
}

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    if (form.value.id) {
      await axios.put(`/api/stock/${form.value.id}`, form.value)
    } else {
      await axios.post('/api/stock', { ...form.value, isActive: true })
    }

    emit('saved')
    emit('close')
  } catch {
    alert('Erro ao salvar estoque.')
  }
}
</script>
