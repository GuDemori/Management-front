<template>
    <v-app>
        <v-container fluid class="py-4">
            <v-card v-if="cartItems.length" class="mb-4">
                <v-card-title class="text-h6">Carrinho de Compras</v-card-title>
                <v-divider />
                <v-select v-if="authStore.user && isAdminOrCoworker && clients.length" v-model="selectedClientId"
                    :items="clients" item-title="name" item-value="id" label="Selecionar cliente"
                    style="max-width: 300px" dense class="ml-4" />

                <v-list>
                    <v-list-item v-for="item in cartItems" :key="item.id" class="align-start">
                        <v-avatar class="mr-4" size="56">
                            <v-img :src="item.image_url" width="56" height="56" cover />
                        </v-avatar>
                        <div class="flex-grow-1">
                            <v-list-item-title>{{ item.name }}</v-list-item-title>
                            <v-list-item-subtitle>
                                <span v-if="!item.expanded">
                                    {{ item.description.slice(0, 100) }}<span v-if="item.description.length > 100">...
                                        <a @click="item.expanded = true">ver mais</a></span>
                                </span>
                                <span v-else>
                                    {{ item.description }} <a @click="item.expanded = false">ver menos</a>
                                </span>
                            </v-list-item-subtitle>

                            <div class="mt-2 d-flex align-center gap-2">
                                <v-btn icon size="x-small" @click="decrement(item)">
                                    <v-icon>mdi-minus</v-icon>
                                </v-btn>
                                <span>{{ item.quantity }}</span>
                                <v-btn icon size="x-small" @click="increment(item)">
                                    <v-icon>mdi-plus</v-icon>
                                </v-btn>
                                <span class="ml-4">R$ {{ format(item.wholesale_price) }} x {{ item.quantity }} =
                                    <strong>R$ {{ format(item.quantity * item.wholesale_price) }}</strong></span>
                            </div>
                        </div>

                        <v-list-item-action>
                            <v-btn icon color="error" @click="removeItem(item)">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>

                <v-divider class="my-4" />
                <div class="d-flex justify-space-between px-4 pb-2">
                    <strong>Total:</strong>
                    <strong>R$ {{ format(total) }}</strong>
                </div>

                <v-card-actions>
                    <v-spacer />
                    <v-btn color="error" @click="confirmClearDialog = true">Limpar Carrinho</v-btn>
                    <v-btn color="primary" @click="submitOrder">Confirmar Pedido</v-btn>
                </v-card-actions>
            </v-card>

            <v-alert v-else type="info">Seu carrinho está vazio.</v-alert>

            <v-dialog v-model="confirmClearDialog" max-width="400">
                <v-card>
                    <v-card-title class="text-h6">Limpar carrinho</v-card-title>
                    <v-card-text>Tem certeza que deseja limpar o carrinho?</v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text @click="confirmClearDialog = false">Cancelar</v-btn>
                        <v-btn color="error" @click="clearCart">Limpar</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-container>
    </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import router from '@/router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const cartStore = useCartStore()
const authStore = useAuthStore()

const confirmClearDialog = ref(false)
const clients = ref([])
const selectedClientId = ref(null)
const cartItems = computed(() => cartStore.items.map(i => ({ ...i, expanded: false })))
const total = computed(() => cartStore.items.reduce((acc, i) => acc + i.quantity * parseFloat(i.wholesale_price), 0))

const format = (n) => parseFloat(n).toFixed(2).replace('.', ',')

const isAdminOrCoworker = computed(() =>
    ['admin', 'coworker'].includes(authStore.user?.role)
)

function increment(item) {
    const max = item.stock_quantity || 0
    if (item.quantity < max) {
        item.quantity++
        cartStore.updateItem(item);
    }
}
function decrement(item) {
    if (item.quantity > 1) {
        item.quantity--;
        cartStore.updateItem(item);
    }
}
function removeItem(item) {
    cartStore.items = cartStore.items.filter(p => p.id !== item.id)
}
function clearCart() {
    cartStore.items = []
    confirmClearDialog.value = false
    router.push('/produtos')
}

async function submitOrder() {
    try {
        const user = authStore.user
        let clientId = user.id
        let address = {
            client_name: user.name,
            client_address_street: user.address,
            client_address_number: user.number,
            client_address_district: user.district,
            client_address_city: user.city,
            client_address_state: user.state,
            client_address_zipcode: user.cep
        }

        if (['admin', 'coworker'].includes(user.role)) {
            if (!selectedClientId.value) return alert('Selecione um cliente.')
            const resp = await axios.get(`/api/users/${selectedClientId.value}`)
            const client = resp.data
            clientId = client.id
            address = {
                client_name: client.name,
                client_address_street: client.address,
                client_address_number: client.number,
                client_address_district: client.district,
                client_address_city: client.city,
                client_address_state: client.state,
                client_address_zipcode: client.cep
            }
        }

        const payload = {
            client_id: clientId,
            ...address,
            total_value: total.value,
            items: cartStore.items.map(i => ({
                product_id: i.id,
                product_name: i.name,
                quantity: i.quantity,
                price_unit: i.wholesale_price,
                subtotal: (i.quantity * i.wholesale_price).toFixed(2)
            }))
        }

        await axios.post('/api/orders', payload)
        cartStore.items = []
        router.push('/produtos')
    } catch (err) {
        console.error(err)
        alert('Erro ao confirmar pedido.')
    }
}

onMounted(async () => {
    if (!authStore.user) await authStore.fetchUser()

    if (['admin', 'coworker'].includes(authStore.user.role)) {
        try {
            const resp = await axios.get('/api/users/clients')

            const users = Array.isArray(resp.data) ? resp.data : []
            clients.value = users
            selectedClientId.value = clients.value[0]?.id || null
        } catch (err) {
            console.error('Erro ao buscar usuários', err)
        }
    }
})

</script>