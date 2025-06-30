<template>
    <v-container v-if="order" class="py-6">
        <!-- Alerta de sucesso/erro -->
        <v-alert v-if="error" type="error" dismissible class="mb-4 mx-auto" style="max-width: 900px" color="error"
            variant="tonal" rounded elevation="2" border="start" @click:close="error = ''">
            {{ error }}
        </v-alert>

        <v-alert v-if="success" type="success" dismissible class="mb-4 mx-auto" style="max-width: 900px" color="success"
            variant="tonal" rounded elevation="2" border="start" @click:close="success = ''">
            {{ success }}
        </v-alert>


        <!-- Cartão de detalhes do pedido -->
        <v-card class="mx-auto pa-6" max-width="900" elevation="2">
            <!-- conteúdo do pedido -->
        </v-card>
        <v-card class="mx-auto pa-6" max-width="900" elevation="2">
            <!-- Cabeçalho -->
            <v-row>
                <v-col cols="12" class="mb-2">
                    <v-row class="mb-4" align="center" justify="space-between">
                        <v-col cols="6" class="d-flex justify-start">
                            <router-link to="/pedidos">
                                <v-btn variant="outlined" color="secondary" prepend-icon="mdi-arrow-left">
                                    Voltar
                                </v-btn>
                            </router-link>
                        </v-col>

                        <v-col cols="6" class="d-flex justify-end">
                            <v-btn color="primary" @click="exportPDF" prepend-icon="mdi-download">
                                Exportar como PDF
                            </v-btn>
                        </v-col>
                    </v-row>
                    <h2 class="text-h6 font-weight-bold mb-4">Pedido nº {{ order.id }}</h2>
                    <p><strong>Data:</strong> {{ formatDate(order.createdAt) }}</p>
                    <p><strong>Cliente:</strong> {{ order.clientName }}</p>
                    <p><strong>Endereço:</strong> {{ order.addressStreet }}, {{ order.addressNumber }}</p>
                    <p><strong>Cidade:</strong> {{ order.addressCity }} - {{ order.addressState }}</p>
                    <div class="mt-2" style="max-width: 300px">
                        <v-select
                            v-model="order.status"
                            :items="statusOptions"
                            label="Status do Pedido"
                            density="comfortable"
                            variant="outlined"
                            @update:modelValue="updateStatus"
                            :menu-props="{ maxHeight: '200' }"
                        />
                    </div>
                </v-col>
            </v-row>

            <!-- Tabela -->
            <v-table class="mt-4 elevation-1">
                <thead>
                    <tr>
                        <th class="text-left">Qtd</th>
                        <th class="text-left">Produto</th>
                        <th class="text-left">Preço Unitário (R$)</th>
                        <th class="text-left">Subtotal (R$)</th>
                    </tr>
                </thead>
                <tbody class="dashed-border">
                    <tr v-for="item in order.items" :key="item.productId">
                        <td>{{ item.quantity }}</td>
                        <td>{{ item.productName }}</td>
                        <td>{{ formatCurrency(item.priceUnit) }}</td>
                        <td>{{ formatCurrency(item.subtotal) }}</td>
                    </tr>
                </tbody>
            </v-table>

            <!-- Total -->
            <v-row justify="end" class="mt-6">
                <v-col cols="auto">
                    <h3 class="text-h6 font-weight-bold">Total: R$ {{ formatCurrency(order.totalValue) }}</h3>
                </v-col>
            </v-row>
        </v-card>
    </v-container>

    <v-container v-else class="text-center pa-10">
        <v-progress-circular indeterminate color="primary" />
    </v-container>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const error = ref('')
const success = ref('')

const route = useRoute()
const order = ref(null)

const statusOptions = [
    'Em espera',
    'Preparando',
    'À caminho',
    'Entregue',
    'Pago',
    'Cancelado'
]

onMounted(async () => {
    const { data } = await axios.get(`/api/orders/${route.params.id}`)
    order.value = data
})

async function updateStatus(newStatus) {
    try {
        await axios.put(`/api/orders/${Number(order.value.id)}`,
            { status: newStatus })
        success.value = 'Status atualizado com sucesso!'
    } catch (e) {
        error.value = 'Erro ao atualizar status.'
    }
}

function formatCurrency(value) {
    return Number(value).toFixed(2).replace('.', ',')
}

function formatDate(date) {
    return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function exportPDF() {
    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text(`Pedido nº ${order.value.id}`, 14, 20)
    doc.setFontSize(12)
    doc.text(`Cliente: ${order.value.clientName}`, 14, 28)
    doc.text(`Data: ${formatDate(order.value.createdAt)}`, 14, 35)
    doc.text(`Endereço: ${order.value.addressStreet}, ${order.value.addressNumber}`, 14, 42)
    doc.text(`Cidade: ${order.value.addressCity} - ${order.value.addressState}`, 14, 49)

    autoTable(doc, {
        startY: 55,
        head: [['Qtd', 'Produto', 'Preço Unitário (R$)', 'Subtotal (R$)']],
        body: order.value.items.map(i => [
            i.quantity,
            i.productName,
            formatCurrency(i.priceUnit),
            formatCurrency(i.subtotal)
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] }
    })

    doc.text(`Total: R$ ${formatCurrency(order.value.totalValue)}`, 14, doc.lastAutoTable.finalY + 10)
    doc.save(`pedido_${order.value.id}.pdf`)
}
</script>

<style scoped>
.dashed-border td {
    border-bottom: 1px dashed #ccc;
}
</style>