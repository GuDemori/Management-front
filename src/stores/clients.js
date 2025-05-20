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
        const { data } = await axios.get('/api/clients')  // ajuste a URL conforme o seu back
        this.list = data
      } finally {
        this.loading = false
      }
    },
  },
})
