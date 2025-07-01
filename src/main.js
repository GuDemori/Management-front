/**
 * main.js
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Store (Pinia)
import { createPinia } from 'pinia';

// Composables
import { createApp } from 'vue';

// Components
import App from './App.vue'


// Axios
import axios from 'axios'

import VueTheMask from 'vue-the-mask'


// Styles
import 'unfonts.css'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken')
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

// Create Pinia store
const pinia = createPinia()

// Register plugins (Vuetify, Axios, etc.)
registerPlugins(app)

// Use Pinia
app.use(pinia)

app.use(VueTheMask)

app.mount('#app')