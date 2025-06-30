import { defineStore } from 'pinia'
import axios from 'axios'

export const useOrdersStore = defineStore('orders', {
    state: () => ({
        list: [],
        loading: false
    }),
    actions: {
        async fetchAll() {
            this.loading = true
            try {
                const { data } = await axios.get('/api/orders')
                this.list = data.data || data
            } catch (e) {
                console.error('Erro ao buscar pedidos:', e)
                throw e
            } finally {
                this.loading = false
            }
        },

        async update(id, payload) {
            try {
                const { data } = await axios.put(`/api/orders/${id}`, payload)
                const index = this.list.findIndex(o => o.id === id)
                if (index !== -1) this.list[index] = data
            } catch (e) {
                console.error('Erro ao atualizar pedido:', e)
                throw e
            }
        },

        async delete(id) {
            await axios.delete(`/api/orders/${id}`)
            this.list = this.list.filter(o => o.id !== id)
        }
    }
})