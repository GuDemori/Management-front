<template>
  <v-container class="login-container" fluid>
    <v-card class="pa-6 login-card">
      <div class="text-center mb-4">
        <v-img
          src="@/assets/logo.png"
          alt="Logo"
          width="165"
          height="165"
          class="mx-auto logo"
        />
      </div>

      <v-card-title class="text-h5 text-center mb-4">Login</v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="login">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            :rules="[rules.required, rules.email]"
            prepend-inner-icon="mdi-email"
            class="input-field mb-4"
          />

          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Senha"
            variant="outlined"
            :rules="[rules.required]"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            class="input-field mb-6"
          />

          <v-alert
            v-if="errorMessage"
            type="error"
            class="mb-4"
            density="compact"
          >
            {{ errorMessage }}
          </v-alert>

          <!-- Botão Entrar -->
          <v-btn
            type="submit"
            color="darkgoldenrod"
            :loading="loading"
            block
            rounded
            size="large"
          >
            Entrar
          </v-btn>

          <!-- Botão Criar Conta -->
          <v-btn
            to="/registro"
            color="white"
            variant="outlined"
            block
            rounded
            class="mt-4"
          >
            Criar Conta
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <footer class="footer">
      © Sabor Doce
    </footer>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const rules = {
  required: v => !!v || 'Este campo é obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido'
}

const login = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('/api/login', {
      email: email.value,
      password: password.value
    })

    const token = response.data.token || response.data.access_token
    if (!token) throw new Error('Token não retornado pelo backend')

    localStorage.setItem('authToken', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    window.location.href = '/'
  } catch {
    errorMessage.value = 'Usuário ou senha inválidos.'
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
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #3d3d3d;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.footer {
  position: absolute;
  bottom: 16px;
  font-size: 0.9rem;
  color: #5e5e5e;
}

/* Campos de input */
.input-field .v-field {
  background-color: white !important;
  color: #333 !important;
}

.input-field input {
  color: #333 !important;
}

.input-field .v-label {
  color: #666 !important;
}

.input-field.v-input--focused .v-field {
  border-color: darkgoldenrod !important;
}
</style>
