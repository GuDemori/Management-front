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
        const { data } = await axios.get('/api/products')
        this.list = data
      } catch (err) {
        console.error('❌ erro ao buscar produtos:', err)
      } finally {
        this.loading = false
      }
    }
  }
})
