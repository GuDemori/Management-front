<template>
    <v-card elevation="2" max-width="400" class="mx-auto pa-4">
      <v-card-title class="justify-center text-h6">
        Faça o Login
      </v-card-title>
  
      <v-card-text>
        <v-form @submit.prevent="onSubmit">
          <v-text-field
            v-model="email"
            label="E-mail"
            type="email"
            required
          />
  
          <v-text-field
            v-model="password"
            label="Senha"
            type="password"
            required
          />
  
          <v-btn
            type="submit"
            color="primary"
            block
            class="mt-4"
          >
            Entrar
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const email = ref('')
  const password = ref('')
  const router = useRouter()
  
  function onSubmit() {
    // aqui você chamaria sua API de autenticação…
    // por enquanto, só vamos redirecionar para a home:
    router.push('/')
  }
  
  // informa ao file-based router que
  // esta página deve usar o layout “login.vue”
  definePageMeta({
    layout: 'login'
  })
  </script>
  