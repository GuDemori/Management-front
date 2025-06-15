// src/stores/suppliers.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useSuppliersStore = defineStore('suppliers', {
  state: () => ({
    list: [],
    loading: false,
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data } = await axios.get('/api/suppliers')
        this.list = data
      } catch (error) {
        console.error('Erro ao buscar fornecedores:', error)
      } finally {
        this.loading = false
      }
    },
  },
})
