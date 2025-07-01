<template>
  <v-form ref="localFormRef" @submit.prevent="submit">
    <!-- Nome -->
    <v-text-field
      v-model="form.name"
      label="Nome"
      :rules="[rules.required]"
      prepend-inner-icon="mdi-account"
      variant="outlined"
      density="compact"
    />

    <!-- Email -->
    <v-text-field
      v-model="form.email"
      type="email"
      autocomplete="off"
      label="Email"
      :rules="[rules.required, rules.email]"
      prepend-inner-icon="mdi-email"
      variant="outlined"
      density="compact"
    />

    <!-- Senha (somente no modo criação) -->
    <v-text-field
      v-if="!isEdit"
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

    <!-- Tipo de usuário -->
    <v-select
      v-model="form.role"
      :items="['admin', 'coworker']"
      label="Tipo de Usuário"
      :rules="[rules.required]"
      prepend-inner-icon="mdi-account-cog"
      variant="outlined"
      density="compact"
    />

    <!-- CPF/CNPJ -->
    <v-text-field
      v-model="form.document"
      label="CPF ou CNPJ"
      :rules="[validateDocument]"
      placeholder="000.000.000-00 ou 00.000.000/0000-00"
      prepend-inner-icon="mdi-card-account-details"
      variant="outlined"
      density="compact"
    />
  </v-form>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, defineExpose } from 'vue'
import { isValidCPF, isValidCNPJ } from '@/utils/validators'

// Props
const props = defineProps({
  modelValue: Object,
  isEdit: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['submit', 'update:modelValue'])

// Refs
const localFormRef = ref(null)
const showPassword = ref(false)
const form = ref({})

// Sincroniza o formulário com o modelValue (v-model)
watch(
  () => props.modelValue,
  (val) => {
    Object.assign(form.value, val || {})
  },
  { immediate: true, deep: true }
)

watch(form, () => emit('update:modelValue', form.value), { deep: true })

// Regras de validação
const rules = {
  required: v => !!v || 'Campo obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  min: v => v.length >= 6 || 'Mínimo 6 caracteres'
}

// Validador de CPF/CNPJ
const validateDocument = value => {
  if (!value) return 'Documento obrigatório'
  const clean = value.replace(/\D/g, '')
  if (clean.length === 11 && !isValidCPF(clean)) return 'CPF inválido'
  if (clean.length === 14 && !isValidCNPJ(clean)) return 'CNPJ inválido'
  if (![11, 14].includes(clean.length)) return 'Deve ter 11 ou 14 dígitos'
  return true
}

// Expõe para o componente pai
async function validate() {
  const result = await localFormRef.value?.validate()
  return result.valid
}
const submit = () => emit('submit')

defineExpose({ validate })
</script>
