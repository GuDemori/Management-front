import { defineStore } from 'pinia'
import axios from 'axios'

export const useClientsStore = defineStore('clients', {
  state: () => ({
    list: [],
    loading: false,
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const { data } = await axios.get('/api/users')
        this.list = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : []
      } catch (error) {
        console.error('Erro ao buscar clientes:', error)
      } finally {
        this.loading = false
      }
    },
  },
})