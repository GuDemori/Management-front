<template>
  <v-container class="login-container">
    <div class="logo-container">
      <v-img
        src="@/assets/logo.png"
        alt="Logo"
        width="150"
        height="150"
        contain
        class="logo"
      />
    </div>

    <v-card class="pa-6" width="400">
      <v-card-title class="text-h5">Login</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="login">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            :rules="[rules.required, rules.email]"
            prepend-inner-icon="mdi-email"
          />

          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Senha"
            :rules="[rules.required]"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-alert
            v-if="errorMessage"
            type="error"
            class="mb-4"
            dense
          >
            {{ errorMessage }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            :loading="loading"
            block
          >
            Entrar
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
    <footer class="footer">
      © Sabor Doce
    </footer>

</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);

const rules = {
  required: v => !!v || 'Este campo é obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido'
};

const login = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('/api/login', {
      email: email.value,
      password: password.value
    })
    console.log('LOGIN RESPONSE ▶', response.data)

    const token = response.data.token || response.data.access_token
    if (!token) throw new Error('Token não retornado pelo backend')

    localStorage.setItem('token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

    window.location.href = '/'
  } catch (err) {
    errorMessage.value = 'Usuário ou senha inválidos.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.logo-container {
  margin-bottom: 24px;
}
.logo {
  animation: fadeIn 1.5s ease-in-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}
.logo:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.v-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}
.footer {
  position: absolute;
  bottom: 20px;
  font-size: 0.85rem;
  color: #888;
}
</style>
