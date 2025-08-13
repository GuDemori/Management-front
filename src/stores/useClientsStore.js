export const useClientsStore = defineStore('clients', {
    state: () => ({
        list: [],
        loading: false
    }),
    actions: {
        async fetchAll() {
            this.loading = true
            try {
                const { data } = await axios.get('/clients')
                this.list = data
            } catch (err) {
                console.error('Erro ao buscar clientes:', err)
            } finally {
                this.loading = false
            }
        }
    }
})