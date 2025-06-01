<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      permanent
    >
      <v-list-item to="/">
        <v-list-item-title
          class="text-h5 font-weight-bold text-center pa-4"
        >
          Sabor Doce
        </v-list-item-title>
      </v-list-item>

      <v-divider />

      <v-list>
        <v-list-item 
          to="/produtos" 
          title="Produtos" 
          prepend-icon="mdi-package-variant" 
          :active-class="'active-link'"
        />
        <v-list-item 
          to="/clients" 
          title="Clientes" 
          prepend-icon="mdi-account-multiple"
          :active-class="'active-link'"
        />
        <v-list-item 
          to="/pedidos" 
          title="Pedidos" 
          prepend-icon="mdi-truck-fast"
          :active-class="'active-link'"
        />
        <v-list-item 
          to="/fornecedores" 
          title="Fornecedores" 
          prepend-icon="mdi-account-group"
          :active-class="'active-link'"
        />
        <v-list-item 
          to="/estoque" 
          title="Estoque" 
          prepend-icon="mdi-package-variant-closed"
          :active-class="'active-link'"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app flat style="background-color: darkgoldenrod;">
      <v-btn icon @click="drawer = !drawer">
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

<style scoped>
.active-link {
  background-color: darkgoldenrod !important;
  color: white !important;
}
</style>
