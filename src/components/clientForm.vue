<template>
  <v-form ref="formRef" @submit.prevent="submit">
    <v-tabs v-model="tab" align-tabs="center" grow>
      <v-tab>
        <v-icon left>mdi-account</v-icon>
        Dados Pessoais
      </v-tab>
      <v-tab>
        <v-icon left>mdi-phone</v-icon>
        Contato
      </v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-4">
      <!-- Aba Dados Pessoais -->
      <v-window-item :value="0">
        <v-text-field
          v-model="form.fullName"
          label="Nome Completo"
          :rules="nameRules"
          placeholder="Ex.: João da Silva"
          prepend-icon="mdi-account"
          variant="outlined"
          density="compact"
          required
        />

        <v-text-field
          v-model="form.cpfCnpj"
          label="CPF ou CNPJ"
          :rules="cpfCnpjRules"
          placeholder="Ex.: 000.000.000-00 ou 00.000.000/0000-00"
          prepend-icon="mdi-card-account-details"
          variant="outlined"
          density="compact"
          required
        />

        <v-text-field
          v-model="form.birthDate"
          label="Data de Nascimento"
          placeholder="Ex.: 01/01/2000"
          prepend-icon="mdi-calendar"
          variant="outlined"
          density="compact"
          type="date"
          required
        />
      </v-window-item>

      <!-- Aba Contato -->
      <v-window-item :value="1">
        <v-text-field
          v-model="form.address"
          label="Endereço"
          placeholder="Ex.: Rua das Flores, 123 - Centro"
          prepend-icon="mdi-map-marker"
          variant="outlined"
          density="compact"
          required
        />

        <v-text-field
          v-model="form.city"
          label="Cidade"
          placeholder="Ex.: Cianorte"
          prepend-icon="mdi-city"
          variant="outlined"
          density="compact"
          required
        />

        <v-text-field
          v-model="form.phone"
          label="Telefone"
          :rules="phoneRules"
          placeholder="Ex.: (44) 99999-0000"
          prepend-icon="mdi-phone"
          variant="outlined"
          density="compact"
          required
          inputmode="tel"
        />

        <v-text-field
          v-model="form.email"
          label="E-mail"
          :rules="emailRules"
          placeholder="Ex.: exemplo@email.com"
          prepend-icon="mdi-email"
          variant="outlined"
          density="compact"
          required
        />
      </v-window-item>
    </v-window>
  </v-form>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'

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
  v => !!v || 'Nome é obrigatório',
  v => (v && v.length >= 5) || 'Nome deve ter ao menos 5 caracteres',
]

const cpfCnpjRules = [
  v => !!v || 'CPF ou CNPJ é obrigatório',
  v => (v && v.length >= 11) || 'Informe um CPF/CNPJ válido',
]

const emailRules = [
  v => !!v || 'E-mail é obrigatório',
  v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido',
]

const phoneRules = [
  v => !!v || 'Telefone é obrigatório',
  v => /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(v) || 'Telefone inválido',
]
</script>
