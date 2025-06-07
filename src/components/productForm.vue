<template>
  <v-form ref="formRef" @submit.prevent="submit">
    <v-tabs v-model="tab" align-tabs="center" grow>
      <v-tab>
        <v-icon left>mdi-package-variant</v-icon>
        Informações do Produto
      </v-tab>
      <v-tab>
        <v-icon left>mdi-domain</v-icon>
        Dados Comerciais
      </v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-4">
      <!-- Aba 1: Informações do Produto -->
      <v-window-item :value="0">
        <v-text-field
          v-model="form.nome"
          label="Nome do Produto"
          :rules="nameRules"
          placeholder="Ex.: Bala Recheada"
          prepend-icon="mdi-tag"
          variant="outlined"
          density="compact"
          required
        />

        <v-textarea
          v-model="form.descricao"
          label="Descrição"
          placeholder="Ex.: Pacote de 100g - sabor sortido"
          prepend-icon="mdi-text"
          variant="outlined"
          density="compact"
          auto-grow
        />
      </v-window-item>

      <!-- Aba 2: Dados Comerciais -->
      <v-window-item :value="1">
        <v-text-field
          v-model="form.valor"
          label="Valor (R$)"
          :rules="valueRules"
          placeholder="Ex.: 4.99"
          prepend-icon="mdi-currency-brl"
          type="number"
          variant="outlined"
          density="compact"
          required
        />

        <v-text-field
          v-model="form.fornecedor"
          label="Fornecedor"
          :rules="supplierRules"
          placeholder="Ex.: Doces Brasil LTDA"
          prepend-icon="mdi-domain"
          variant="outlined"
          density="compact"
          required
        />
      </v-window-item>
    </v-window>
  </v-form>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  form: Object,
  formRef: Object
})

const emit = defineEmits(['submit'])

function submit() {
  emit('submit')
}

const tab = ref(0)

const nameRules = [
  v => !!v || 'Nome do produto é obrigatório',
  v => v.length >= 3 || 'Mínimo 3 caracteres',
]

const valueRules = [
  v => !!v || 'Valor é obrigatório',
  v => parseFloat(v) > 0 || 'Valor deve ser maior que 0',
]

const supplierRules = [
  v => !!v || 'Fornecedor é obrigatório',
  v => v.length >= 3 || 'Mínimo 3 caracteres',
]
</script>
