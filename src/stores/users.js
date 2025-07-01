import { defineStore } from 'pinia'
import axios from 'axios'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: '',
  }),

  actions: {
    async fetchUsers(name = '') {
      try {
        this.loading = true
        const { data } = await axios.get('/api/users', {
          params: { name },
        })
        this.users = data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao buscar usuários'
      } finally {
        this.loading = false
      }
    },

    async createUser(userData) {
      try {
        await axios.post('/api/users', userData)
        await this.fetchUsers() // atualiza a lista
      } catch (err) {
        throw err
      }
    },

    async deactivateUser(userId) {
      try {
        await axios.put(`/api/users/${userId}/deactivate`)
        await this.fetchUsers()
      } catch (err) {
        throw err
      }
    },
  },
})
