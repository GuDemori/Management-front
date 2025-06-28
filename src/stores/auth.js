import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('authToken') || null,
    user: null,
  }),
  getters: {
    isLogged: (state) => !!state.token
  },
  actions: {
    async login(email, password) {
      const { data } = await axios.post('/api/login', { email, password })
      this.token = data.token
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('refreshToken', data.refresh_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      delete axios.defaults.headers.common['Authorization']
    },
    async refreshAccessToken() {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/refresh', { refresh_token: refreshToken })
          this.token = data.access_token
          localStorage.setItem('authToken', data.access_token)
          localStorage.setItem('refreshToken', data.refresh_token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
        } catch (error) {
          console.error('Falha ao renovar o token', error)
          this.logout()  // Pode ser redirecionado para login caso falhe
        }
      }
    },
    async fetchUser() {
      if (!this.token) return;
      try {
        const { data } = await axios.get('/api/user', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          }
        })
        this.user = data
      } catch (error) {
        console.error('Erro ao buscar usuário:', error)
        if (error.response && error.response.status === 401) {
          await this.refreshAccessToken()
          await this.fetchUser()
        }
      }
    }
  }
})