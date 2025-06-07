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
            label="Senha"
            type="password"
            :rules="[rules.required]"
            prepend-inner-icon="mdi-lock"
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
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const rules = {
  required: v => !!v || 'Este campo é obrigatório',
  email: v => /.+@.+\..+/.test(v) || 'Email inválido'
};

const login = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.post('http://localhost:8000/api/login', {
      email: email.value,
      password: password.value
    });

    const token = response.data.token;
    localStorage.setItem('token', token);

    // Redireciona para a dashboard ou home
    window.location.href = '/dashboard';
  } catch (error) {
    errorMessage.value = 'Usuário ou senha inválidos.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
