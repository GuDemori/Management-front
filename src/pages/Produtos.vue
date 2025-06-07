<template>
  <v-container fluid class="py-4">
    <!-- ========== TOOLBAR ========== -->
    <v-row class="mb-2">
      <v-col>
        <v-toolbar flat>
          <v-toolbar-title>Produtos</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" @click="openDialog">Novo Produto</v-btn>
          <v-btn color="secondary" class="ml-2" @click="exportPDF">
            <v-icon left>mdi-file-pdf</v-icon>
            Exportar PDF
          </v-btn>
          <!-- Botão de filtros -->
          <v-btn icon class="ml-2" @click="filterDialog = true">
            <v-icon>mdi-filter-variant</v-icon>
          </v-btn>
        </v-toolbar>
      </v-col>
    </v-row>

    <!-- ========== GRID DE CARDS ========== -->
    <v-row dense>
      <v-col
        v-for="(product, idx) in filteredProducts"
        :key="idx"
        cols="12" sm="6" md="4" lg="3"
      >
        <v-card>
          <v-card-title class="text-h6">
            {{ product.nome }}
          </v-card-title>

          <v-card-text class="pb-0">
            {{ product.descricao }}
          </v-card-text>

          <v-divider class="my-2" />
          <v-card-actions class="d-flex align-center justify-space-between px-2">
            <span class="text-subtitle-1 font-weight-medium">
              R$ {{ product.valor }}
            </span>
            <v-btn icon @click="addToCart(product)">
              <v-icon color="blue">mdi-cart-plus</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import ProductForm from '@/components/productForm.vue'
import { useProductsStore } from '@/stores/products'

const store = useProductsStore()
const formRef = ref(null)
const dialog = ref(false)

// array local de teste
const productsList = ref([
  { nome: "jkjhkj", valor: "12", descricao: "simsim" },
  // adicione mais itens...
])

// diálogo de filtros
const filterDialog = ref(false)

// filtro de busca
const filters = reactive({ name: '' })

// lista filtrada
const filteredProducts = computed(() =>
  productsList.value.filter(p =>
    !filters.name ||
    p.nome.toLowerCase().includes(filters.name.toLowerCase())
  )
)

// stubs de ações
function openDialog()    { console.log("Abrir diálogo de novo produto") }
function addToCart(item) { console.log("Carrinho:", item) }
function exportPDF() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Lista de Produtos', 14, 22)
  const cols = ['Nome','Descrição','Valor']
  const rows = filteredProducts.value.map(p => [p.nome, p.descricao, p.valor])
  doc.autoTable({ head: [cols], body: rows, startY: 30 })
  doc.save('produtos.pdf')
}
</script>
