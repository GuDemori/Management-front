<template>
  <v-form ref="internalForm" @submit.prevent="submit">
    <v-tabs v-model="tab" align-tabs="center" grow>
      <v-tab>
        <v-icon left>mdi-domain</v-icon>
        Dados do Fornecedor
      </v-tab>
      <v-tab>
        <v-icon left>mdi-phone</v-icon>
        Contato
      </v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-4">
      <!-- Aba Dados do Fornecedor -->
      <v-window-item :value="0">
        <v-text-field
          v-model="form.name"
          label="Nome do Contato"
          :rules="nameRules"
          placeholder="Ex.: João Silva"
          prepend-icon="mdi-account"
          variant="outlined"
          density="compact"
          required
        />

        <v-text-field
          v-model="form.company_name"
          label="Razão Social (Empresa)"
          placeholder="Ex.: Doces Giacomini"
          prepend-icon="mdi-domain"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-model="form.document"
          label="Documento (CPF/CNPJ)"
          :rules="documentRules"
          placeholder="Ex.: 00.000.000/0000-00"
          prepend-icon="mdi-card-account-details"
          variant="outlined"
          density="compact"
        />
      </v-window-item>

      <!-- Aba Contato -->
      <v-window-item :value="1">
        <v-text-field
          v-model="form.address"
          label="Endereço"
          placeholder="Ex.: Rua das Flores, 123"
          prepend-icon="mdi-map-marker"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-model="form.city"
          label="Cidade"
          placeholder="Ex.: Cianorte"
          prepend-icon="mdi-city"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-model="form.phone"
          label="Telefone"
          :rules="phoneRules"
          placeholder="Ex.: (44) 99999-0000"
          prepend-icon="mdi-phone"
          variant="outlined"
          density="compact"
          inputmode="tel"
          required
        />

        <v-text-field
          v-model="form.email"
          label="E-mail"
          :rules="emailRules"
          placeholder="Ex.: exemplo@fornecedor.com"
          prepend-icon="mdi-email"
          variant="outlined"
          density="compact"
        />
      </v-window-item>
    </v-window>
  </v-form>
</template>

<script setup>
import { ref, defineEmits, defineProps, defineExpose } from 'vue'

const props = defineProps({
  form: Object
})
const emit = defineEmits(['submit'])
const tab = ref(0)
const internalForm = ref(null)

// expõe validate() e resetValidation() para o pai
defineExpose({
  validate: () => internalForm.value?.validate(),
  resetValidation: () => internalForm.value?.resetValidation()
})

function submit() {
  emit('submit')
}

const nameRules = [
  v => !!v || 'Nome é obrigatório',
  v => (v && v.length >= 3) || 'Nome deve ter ao menos 3 caracteres',
]

const documentRules = [
  v => !v || v.length >= 11 || 'Documento inválido',
]

const emailRules = [
  v => !v || /.+@.+\..+/.test(v) || 'E-mail deve ser válido',
]

const phoneRules = [
  v => !!v || 'Telefone é obrigatório',
  v => /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(v) || 'Telefone inválido',
]
</script>
