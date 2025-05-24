<template>
  <v-app>
    <!-- MENU LATERAL -->
    <v-navigation-drawer
      v-model="drawer"
      app
      permanent
    >
      <v-list-item to="/" title="Sabor Doce" subtitle="" />

      <!-- Botão para recolher -->
      <div class="d-flex align-center justify-center" style="height: 100px;">
        <v-btn
          icon
          @click="drawer = false"
          class="border border-grey-darken-2 rounded-xl"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </div>

      <v-divider />

      <v-list>
        <v-list-item to="/produtos" title="Produtos" prepend-icon="mdi-package-variant" />
        <v-list-item to="/clients" title="Clientes" prepend-icon="mdi-account-multiple"/>
        <v-list-item to="/pedidos" title="Pedidos" prepend-icon="mdi-truck-fast"/>
        <v-list-item to="/fornecedores" title="Fornecedores" prepend-icon="mdi-account-group"/>
        <v-list-item to="/estoque" title="Estoque" prepend-icon="mdi-package-variant-closed"/>
      </v-list>
    </v-navigation-drawer>

    <!-- BARRA SUPERIOR (sem imagem) -->
    <v-app-bar
      app
      color="teal-darken-4"
      flat
    >
      <!-- Botão de menu quando drawer está fechado -->
      <v-btn
        icon
        v-if="!drawer"
        @click="drawer = true"
      >
        <v-icon class="text-white">mdi-menu</v-icon>
      </v-btn>

      <v-spacer />

      <v-btn icon>
        <v-icon class="text-white">mdi-magnify</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon class="text-white">mdi-cart</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon class="text-white">mdi-dots-vertical</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- CONTEÚDO PRINCIPAL -->
    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(true)
</script>
