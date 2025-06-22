// import { defineStore } from 'pinia'
// import axios from 'axios'

// export const useAuthStore = defineStore('auth', {
//   state: () => ({
//     token: localStorage.getItem('authToken') || null
//   }),
//   getters: {
//     isLogged: (state) => !!state.token
//   },
//   actions: {
//     async login(email, password) {
//       const { data } = await axios.post('/api/login', { email, password })
//       this.token = data.token
//       localStorage.setItem('authToken', data.token)
//       axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
//     },
//     logout() {
//       this.token = null
//       localStorage.removeItem('authToken')
//       delete axios.defaults.headers.common['Authorization']
//     }
//   }
// })
