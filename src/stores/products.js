import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductsStore = defineStore('products', {
  state: () => ({
    list: [],
    loading: false,
  }),

  actions: {
    async fetchAll(stockId = null) {
      this.loading = true
      try {
        const url = stockId ? `/api/products?stock_id=${stockId}` : '/api/products'

        const { data } = await axios.get(url)

        this.list = data
      } catch (err) {
        console.error('❌ erro ao buscar produtos:', err)
      } finally {
        this.loading = false
      }
    }
  }
})