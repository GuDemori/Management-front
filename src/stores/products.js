// src/stores/products.js
import { defineStore } from 'pinia'
import axios from 'axios'


export const useProductsStore = defineStore('products', {
  state: () => ({
    list: [],
    loading: false,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        // AQUI: endpoint da sua API (antes era '/api/products')
        const { data } = await axios.get('/api/produtos')
        console.log('⚙️ PRODUCTS FROM API:', data)
        this.list = data
      } catch (err) {
        console.error('❌ erro ao buscar produtos:', err)
      } finally {
        this.loading = false
      }
    }
  }
})
