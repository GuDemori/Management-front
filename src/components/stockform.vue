<template>
  <v-card>
    <v-card-title>
      <span class="text-h6">{{ stock?.id ? 'Editar Estoque' : 'Novo Estoque' }}</span>
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
          label="Localização (Corredor/Prateleira/Gaveta)"
          prepend-icon="mdi-map-marker"
          :rules="[rules.required]"
        />
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color="blue darken-1" text @click="$emit('close')">Cancelar</v-btn>
      <v-btn color="primary" @click="save">Salvar</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ stock: Object })
const emit = defineEmits(['close', 'saved'])

const formRef = ref(null)
const form = ref({
  productName: '',
  quantity: '',
  location: '',
})

const rules = {
  required: value => !!value || 'Campo obrigatório',
  number: value => !isNaN(value) || 'Deve ser numérico',
}

watch(() => props.stock, (stock) => {
  if (stock) {
    form.value = { ...stock }
  } else {
    form.value = { productName: '', quantity: '', location: '' }
  }
}, { immediate: true })

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Salvar estoque (criar ou atualizar)
  console.log('Salvando:', form.value)
  emit('saved')
  emit('close')
}
</script>
