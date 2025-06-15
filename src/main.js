/**
 * main.js
 *aaa
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Axios
import axios from 'axios'

// Styles
import 'unfonts.css'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

const app = createApp(App)

registerPlugins(app)

app.mount('#app')

