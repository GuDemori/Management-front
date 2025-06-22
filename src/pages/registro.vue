<template>
  <v-container class="login-container" fluid>
    <v-card class="px-2 pt-3 pb-1 login-card">
      <div class="text-center mb-2">
        <v-img
          src="@/assets/logo.png"
          alt="Logo"
          width="165"
          height="165"
          class="mx-auto logo"
        />
      </div>

      <v-card-title class="text-h6 text-center mb-1">Registrar</v-card-title>

      <v-card-text class="py-0">
        <v-form ref="form" @submit.prevent="register" class="pt-0">
          <v-tabs v-model="step" align-tabs="center" grow class="mb-1" density="compact">
            <v-tab key="0" class="px-0">CONTA</v-tab>
            <v-tab key="1" class="px-0">ENDEREÇO</v-tab>
          </v-tabs>

          <v-window v-model="step">
            <!-- Etapa 1: Conta -->
            <v-window-item :value="0">
              <v-select
                v-model="establishment_type_id"
                :items="establishmentTypes"
                item-title="name"
                item-value="id"
                label="Tipo de Estabelecimento"
                prepend-inner-icon="mdi-store"
                :rules="[rules.required]"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
              />

              <v-text-field
                v-model="name"
                label="Nome do Estabelecimento"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
              />

              <v-text-field
                v-model="document"
                label="CPF ou CNPJ"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-card-account-details"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
              />

              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                :rules="[rules.required, rules.email]"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
              />

              <v-text-field
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="Senha"
                :rules="[rules.required, rules.min]"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
              />

              <v-text-field
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Confirmar Senha"
                :rules="[rules.required, rules.match]"
                prepend-inner-icon="mdi-lock-check"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field mb-1"
              />

              <v-btn
                color="darkgoldenrod"
                block
                rounded
                small
                class="mb-1"
                @click="nextStep"
              >
                Próximo
              </v-btn>
            </v-window-item>

            <!-- Etapa 2: Endereço -->
            <v-window-item :value="1">
              <v-text-field
                v-model="cep"
                label="CEP"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-map-marker"
                :loading="loadingCep"
                :error="!!errorCep"
                :error-messages="errorCep"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
                @blur="fetchAddress"
              />

              <v-text-field
                v-model="street"
                label="Logradouro"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-home"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
              />

              <v-text-field
                v-model="number"
                label="Número"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-numeric"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
              />

              <v-text-field
                v-model="complement"
                label="Complemento"
                prepend-inner-icon="mdi-text"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
              />

              <v-text-field
                v-model="district"
                label="Bairro"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-city"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
              />

              <v-text-field
                v-model="city"
                label="Cidade"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-city-variant"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field"
              />

              <v-select
                v-model="state"
                :items="states"
                label="Estado"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-map"
                variant="outlined"
                density="compact"
                hide-details="auto"
                class="input-field mb-1"
              />

              <div class="d-flex justify-space-between mb-0">
                <v-btn
                  color="white"
                  variant="outlined"
                  rounded
                  small
                  @click="prevStep"
                >
                  Voltar
                </v-btn>
                <v-btn
                  type="submit"
                  color="darkgoldenrod"
                  :loading="loading"
                  rounded
                  small
                >
                  Registrar
                </v-btn>
              </div>
            </v-window-item>
          </v-window>

          <v-alert
            v-if="errorMessage"
            type="error"
            class="mt-1"
            density="compact"
          >
            {{ errorMessage }}
          </v-alert>
        </v-form>

        <v-btn
          to="/login"
          color="white"
          variant="outlined"
          block
          rounded
          small
          class="mt-1 mb-0"
        >
          Já tenho uma conta
        </v-btn>
      </v-card-text>
    </v-card>

    <footer class="footer">© Sabor Doce</footer>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const step = ref(0)
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loadingCep = ref(false)
const errorCep = ref('')

// Dados do formulário
const establishment_type_id = ref(null)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const document = ref('')
const cep = ref('')
const street = ref('')
const number = ref('')
const complement = ref('')
const district = ref('')
const city = ref('')
const state = ref('')

const establishmentTypes = ref([])
const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const rules = {
  required: v => !!v || 'Este campo é obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido',
  min: v => (v && v.length >= 6) || 'Senha deve ter ao menos 6 caracteres',
  match: v => v === password.value || 'As senhas não coincidem'
}

onMounted(() => {
  fetchEstablishmentTypes()
})

const fetchEstablishmentTypes = async () => {
  try {
    const { data } = await axios.get('/api/establishment-types')
    establishmentTypes.value = data
  } catch {
    console.error('Erro ao buscar tipos de estabelecimento')
  }
}

const nextStep = () => (step.value = 1)
const prevStep = () => (step.value = 0)

const fetchAddress = async () => {
  errorCep.value = ''
  const raw = cep.value.replace(/\D/g, '')
  if (raw.length !== 8) {
    errorCep.value = 'CEP deve ter 8 dígitos'
    return
  }

  loadingCep.value = true
  try {
    const { data } = await axios.get(`/api/cep/${raw}`)
    if (!data) {
      errorCep.value = 'CEP não encontrado'
    } else {
      street.value     = data.address
      district.value   = data.district
      city.value       = data.city
      state.value      = data.state
      complement.value = data.complement || ''
    }
  } catch {
    errorCep.value = 'Erro ao buscar CEP'
  } finally {
    loadingCep.value = false
  }
}

const register = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    await axios.post('/api/register', {
      establishment_type_id: establishment_type_id.value,
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: confirmPassword.value,
      document: document.value,
      cep: cep.value,
      address: street.value,
      number: number.value,
      complement: complement.value,
      district: district.value,
      city: city.value,
      state: state.value
    })
    window.location.href = '/login'
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Não foi possível registrar.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  background: linear-gradient(145deg, #daa520, #f5deb3);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 8px;
}
.py-0 {
  padding-top: 0px !important;
  padding-bottom: 10px !important;
}

.login-card {
  width: 100%;
  max-width: 480px;
  background: #3d3d3d;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  padding-bottom: 20px;
}

.footer {
  position: absolute;
  bottom: 8px;
  font-size: 0.8rem;
  color: #5e5e5e;
}

/* margem mínima entre campos */
.input-field {
  margin-bottom: 20px !important;
}
.input-field.mb-1 {
  margin-bottom: 18px !important;
}
.logo {
  animation: fadeIn 1.2s ease-in-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
}
.logo:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
</style>
