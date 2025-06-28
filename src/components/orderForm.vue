<template>
  <v-dialog
    :model-value="dialog"
    @update:model-value="$emit('update:dialog', $event)"
    max-width="700"
  >
    <v-card>
      <v-card-title class="text-h5">
        {{ order?.id ? 'Editar Pedido' : 'Novo Pedido' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="save">
          <v-text-field
            v-model="form.client"
            label="Cliente"
            prepend-icon="mdi-account"
            :rules="[rules.required]"
          />
          <v-text-field
            v-model="form.products"
            label="Produtos (ex: Produto A - 2 und)"
            prepend-icon="mdi-package-variant"
            :rules="[rules.required]"
          />
          <v-text-field
            v-model="form.total"
            type="number"
            label="Valor Total"
            prepend-icon="mdi-currency-brl"
            :rules="[rules.required, rules.number]"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('update:dialog', false)">Cancelar</v-btn>
        <v-btn color="primary" @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  dialog: Boolean,
  order: Object,
})
const emit = defineEmits(['update:dialog', 'saved'])

const formRef = ref(null)
const form = ref({
  client: '',
  products: '',
  total: '',
})

const rules = {
  required: v => !!v || 'Campo obrigatório',
  number: v => !isNaN(v) || 'Valor inválido',
}

watch(() => props.order, (order) => {
  if (order) {
    form.value = { ...order }
  } else {
    form.value = { client: '', products: '', total: '' }
  }
}, { immediate: true })

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  emit('saved')
  emit('update:dialog', false)
}
</script>
