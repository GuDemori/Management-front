// src/stores/cart.js
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
    state: () => ({
        items: []
    }),
    actions: {
        add(item) {
            const existing = this.items.find(p => p.id === item.id)
            if (existing) {
                existing.quantity += item.quantity
            } else {
                this.items.push({ ...item })
            }
        },
        updateItem(updatedItem) {
            const index = this.items.findIndex(item => item.id === updatedItem.id);
            if (index !== -1) {
                this.items[index] = updatedItem;
            }
        },
        remove(id) {
            this.items = this.items.filter(p => p.id !== id)
        },
        clear() {
            this.items = []
        }
    },
    getters: {
        count: (state) => state.items.length,
        total: (state) => state.items.reduce((sum, item) => {
            return sum + item.quantity * parseFloat(item.wholesale_price || 0)
        }, 0)
    }
})