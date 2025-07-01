export const useClientsStore = defineStore('clients', {
    state: () => ({
        list: [],
        loading: false
    }),
    actions: {
        async fetchAll() {
            console.log('Chamando fetchAll')
            this.loading = true
            try {
                const { data } = await axios.get('/api/clients')
                console.log('Recebido:', data)
                this.list = data
            } catch (err) {
                console.error('Erro ao buscar clientes:', err)
            } finally {
                this.loading = false
            }
        }
    }
})