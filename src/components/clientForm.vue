<template>
  <v-form ref="localFormRef" @submit.prevent="submit">
    <v-tabs v-model="tab" align-tabs="center" grow>
      <v-tab>Dados do Cliente</v-tab>
      <v-tab>Endereço</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-4">
      <!-- Aba 1: Dados do Cliente -->
      <v-window-item :value="0">
        <v-select
          class="input-field"
          v-model="form.establishment_type_id"
          :items="establishmentTypes"
          item-title="name"
          item-value="id"
          label="Tipo de Estabelecimento"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-store"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-model="form.name"
          label="Nome do Estabelecimento"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-account"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-model="form.document"
          label="CPF ou CNPJ"
          :rules="[validateDocument]"
          placeholder="Ex.: 000.000.000-00 ou 00.000.000/0000-00"
          prepend-inner-icon="mdi-card-account-details"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-model="form.email"
          label="Email"
          :rules="[rules.required, rules.email]"
          prepend-inner-icon="mdi-email"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-if="!props.isEdit"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Senha"
          :rules="[rules.required, rules.min]"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-if="!props.isEdit"
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          label="Confirmar Senha"
          :rules="[rules.required, rules.match]"
          prepend-inner-icon="mdi-lock-check"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
          variant="outlined"
          density="compact"
        />
      </v-window-item>

      <!-- Aba 2: Endereço -->
      <v-window-item :value="1">
        <v-text-field
          v-model="form.cep"
          label="CEP"
          v-mask="'#####-###'" 
          :rules="[rules.required]"
          prepend-inner-icon="mdi-map-marker"
          :loading="loadingCep"
          :error="!!errorCep"
          :error-messages="errorCep"
          variant="outlined"
          density="compact"
          @blur="fetchAddress"
        />

        <v-text-field
          v-model="form.address"
          label="Logradouro"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-home"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-model="form.number"
          label="Número"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-numeric"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-model="form.complement"
          label="Complemento"
          prepend-inner-icon="mdi-text"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-model="form.district"
          label="Bairro"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-city"
          variant="outlined"
          density="compact"
        />

        <v-text-field
          v-model="form.city"
          label="Cidade"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-city-variant"
          variant="outlined"
          density="compact"
        />

        <v-select
          v-model="form.state"
          :items="states"
          label="Estado"
          :rules="[rules.required]"
          prepend-inner-icon="mdi-map"
          variant="outlined"
          density="compact"
        />
      </v-window-item>
    </v-window>
  </v-form>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  form: Object,
  formRef: Object,
  isEdit: Boolean
})

const emit = defineEmits(['submit'])

const submit = () => emit('submit')

const tab = ref(0)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loadingCep = ref(false)
const errorCep = ref('')
const establishmentTypes = ref([])
const localFormRef = ref(null)

const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const rules = {
  required: v => !!v || 'Este campo é obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  min: v => (v && v.length >= 6) || 'Senha deve ter ao menos 6 caracteres',
  match: v => v === props.form.password || 'As senhas não coincidem'
}

const fetchEstablishmentTypes = async () => {
  try {
    const { data } = await axios.get('/api/establishment-types')
    establishmentTypes.value = data
  } catch {
    console.error('Erro ao buscar tipos de estabelecimento')
  }
}

import { isValidCPF, isValidCNPJ } from '@/utils/validators'

function validateDocument(value) {
  if (!value) return 'Documento obrigatório'
  const clean = value.replace(/[^\d]/g, '')
  if (clean.length === 11 && !isValidCPF(clean)) return 'CPF inválido'
  if (clean.length === 14 && !isValidCNPJ(clean)) return 'CNPJ inválido'
  if (![11, 14].includes(clean.length)) return 'Deve ter 11 ou 14 dígitos'
  return true
}

const fetchAddress = async () => {
  errorCep.value = ''
  const raw = props.form.cep?.replace(/\D/g, '')
  if (!raw || raw.length !== 8) {
    errorCep.value = 'CEP deve ter 8 dígitos'
    return
  }

  loadingCep.value = true
  try {
    const { data } = await axios.get(`/api/cep/${raw}`)
    if (!data) {
      errorCep.value = 'CEP não encontrado'
    } else {
      props.form.address     = data.address
      props.form.district    = data.district
      props.form.city        = data.city
      props.form.state       = data.state
      props.form.complement  = data.complement || ''
    }
  } catch {
    errorCep.value = 'Erro ao buscar CEP'
  } finally {
    loadingCep.value = false
  }
}

  function validate() {
    return localFormRef.value?.validate()
  }

defineExpose({ validate })
onMounted(fetchEstablishmentTypes)
</script>
