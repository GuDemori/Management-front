// src/stores/users.js
import { defineStore } from 'pinia'
import axios from 'axios'

export const useUsersStore = defineStore('users', {
    state: () => ({
        list: [],
        loading: false,
        error: ''
    }),
    actions: {
        async fetchUsers() {
            this.loading = true
            try {
                const res = await axios.get('/api/users/all')
                this.list = res.data
            } catch (e) {
                this.error = 'Erro ao buscar usuários.'
            } finally {
                this.loading = false
            }
        }
    }
})