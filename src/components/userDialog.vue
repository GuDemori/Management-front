<template>
  <v-dialog v-model="model" max-width="650px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Criar Novo Usuário</span>
        <v-btn icon @click="model = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="save">
          <v-tabs v-model="step" align-tabs="center" grow class="mb-1" density="compact">
            <v-tab value="0">CONTA</v-tab>
            <v-tab value="1">ENDEREÇO</v-tab>
          </v-tabs>

          <v-window v-model="step">
            <!-- Etapa 1 -->
            <v-window-item :value="0">
              <v-row dense>
                <v-col cols="12">
                  <v-select
                    v-model="form.establishment_type_id"
                    :items="establishmentTypes"
                    item-title="name"
                    item-value="id"
                    label="Tipo de Estabelecimento"
                    prepend-inner-icon="mdi-domain"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="form.name"
                    label="Nome do Estabelecimento"
                    prepend-inner-icon="mdi-store"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="form.email"
                    label="Email"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    :rules="[rules.required, rules.email]"
                  />
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-model="form.role"
                    label="Tipo de Acesso"
                    :items="roles"
                    item-title="label"
                    item-value="value"
                    prepend-inner-icon="mdi-account-key"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" sm="6" v-if="!props.isEdit">
  <v-text-field
    v-model="form.password"
    label="Senha"
    type="password"
    prepend-inner-icon="mdi-lock"
    :rules="[rules.required]"
  />
</v-col>

<v-col cols="12" sm="6" v-if="!props.isEdit">
  <v-text-field
    v-model="form.confirmPassword"
    label="Confirmar Senha"
    type="password"
    prepend-inner-icon="mdi-lock-check"
    :rules="[rules.required, v => v === form.password || 'Senhas diferentes']"
  />
</v-col>


                <v-col cols="12">
                  <v-text-field
                    v-model="form.document"
                    label="CPF ou CNPJ"
                    prepend-inner-icon="mdi-card-account-details"
                    :rules="[rules.required, rules.document]"
                  />
                </v-col>

                <v-col cols="12">
                  <v-btn block color="darkgoldenrod" @click="step = 1">Próximo</v-btn>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Etapa 2 -->
            <v-window-item :value="1">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.cep"
                    label="CEP"
                    prepend-inner-icon="mdi-map-marker"
                    :rules="[rules.required]"
                    @blur="fetchAddress"
                  />
                </v-col>

                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.address"
                    label="Endereço"
                    prepend-inner-icon="mdi-home"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model="form.number"
                    label="Número"
                    prepend-inner-icon="mdi-numeric"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" sm="8">
                  <v-text-field
                    v-model="form.complement"
                    label="Complemento"
                    prepend-inner-icon="mdi-note"
                  />
                </v-col>

                <v-col cols="12" sm="6" v-if="!props.isEdit">
                  <v-text-field
                    v-model="form.password"
                    label="Senha"
                    type="password"
                    prepend-inner-icon="mdi-lock"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" sm="6" v-if="!props.isEdit">
                  <v-text-field
                    v-model="form.confirmPassword"
                    label="Confirmar Senha"
                    type="password"
                    prepend-inner-icon="mdi-lock-check"
                    :rules="[rules.required, v => v === form.password || 'Senhas diferentes']"
                  />
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-model="form.state"
                    :items="states"
                    label="Estado"
                    prepend-inner-icon="mdi-map"
                    :rules="[rules.required]"
                  />
                </v-col>

                <v-col cols="12" class="d-flex justify-space-between">
                  <v-btn text @click="step = 0">Voltar</v-btn>
                  <v-btn color="primary" type="submit">Salvar</v-btn>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>

          <v-alert v-if="error" type="error" class="mt-2" dense>{{ error }}</v-alert>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  modelValue: Boolean,
  form: Object,
  isEdit: Boolean,
})
const emit = defineEmits(['update:modelValue'])

const model = ref(false)
const step = ref(0)
const formRef = ref(null)
const error = ref('')
const establishmentTypes = ref([])

watch(() => props.modelValue, v => model.value = v)
watch(model, v => emit('update:modelValue', v))
watch(() => props.modelValue, v => {
  model.value = v
  if (v) {
    step.value = 0
    error.value = ''
  }
})

const roles = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Funcionário', value: 'coworker' },
  { label: 'Cliente', value: 'client' }
]

const rules = {
  required: v => !!v || 'Campo obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  document: v => {
    const cleaned = (v || '').replace(/\D/g, '')
    return cleaned.length === 11 || cleaned.length === 14 || 'CPF ou CNPJ inválido'
  }
}

const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const fetchEstablishmentTypes = async () => {
  try {
    const { data } = await axios.get('/api/establishment-types')
    establishmentTypes.value = data
  } catch {
    error.value = 'Erro ao buscar tipos de estabelecimento.'
  }
}

const fetchAddress = async () => {
  const raw = form.value.cep?.replace(/\D/g, '')
  if (!raw || raw.length !== 8) return

  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${raw}/json`)
    if (!data || data.erro) return
    form.value.address = data.logradouro
    form.value.district = data.bairro
    form.value.city = data.localidade
    form.value.state = data.uf
    form.value.complement = data.complemento || ''
  } catch {
    console.error('Erro ao buscar endereço via CEP')
  }
}

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    const payload = { ...props.form }
    delete payload.confirmPassword

    if (props.isEdit) {
      delete payload.password
      await axios.put(`/api/users/${props.form.id}`, payload)
    } else {
      await axios.post('/api/users', payload)
    }

    emit('update:modelValue', false)
    formRef.value.reset()
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao salvar usuário.'
  }
}

onMounted(fetchEstablishmentTypes)
</script>
