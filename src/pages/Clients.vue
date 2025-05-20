<template>
    <v-container fluid class="py-4">
      <!-- Toolbar -->
      <v-row class="mb-2">
        <v-col>
          <v-toolbar flat>
            <v-toolbar-title>Clientes</v-toolbar-title>
            <v-spacer />
            <v-btn color="primary" @click="openDialog">Novo Cliente</v-btn>
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
  
      <!-- Tabela de clientes filtrada -->
      <v-row>
        <v-col>
          <v-data-table
            :headers="headers"
            :items="filteredClients"
            :loading="loading"
            class="elevation-1"
            item-value="id"
          >
            <template #item.actions="{ item }">
              <v-btn icon @click="edit(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon @click="remove(item)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
  
      <!-- Diálogo de Create/Edit -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title class="text-h6">
            {{ form.id ? 'Editar Cliente' : 'Novo Cliente' }}
          </v-card-title>
          <v-card-text>
            <v-form ref="formRef" @submit.prevent="save">
              <v-text-field
                v-model="form.name"
                label="Nome"
                :rules="nameRules"
                required
              />
              <v-text-field
                v-model="form.email"
                label="E-mail"
                :rules="emailRules"
                required
              />
              <v-text-field
                v-model="form.phone"
                label="Telefone"
                :rules="phoneRules"
                required
                inputmode="numeric"
                pattern="\d*"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="closeDialog">Cancelar</v-btn>
            <v-btn color="primary" @click="save">Salvar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Diálogo de Filtros -->
      <v-dialog v-model="filterDialog" max-width="400px">
        <v-card>
          <v-card-title>Filtros</v-card-title>
          <v-card-text>
            <v-checkbox
              v-model="filterOptions.name"
              label="Filtrar por Nome"
            />
            <v-checkbox
              v-model="filterOptions.email"
              label="Filtrar por E-mail"
            />
            <v-checkbox
              v-model="filterOptions.phone"
              label="Filtrar por Telefone"
            />
  
            <v-divider class="my-2" />
  
            <v-text-field
              v-if="filterOptions.name"
              v-model="filters.name"
              label="Nome"
              clearable
            />
            <v-text-field
              v-if="filterOptions.email"
              v-model="filters.email"
              label="E-mail"
              clearable
            />
            <v-text-field
              v-if="filterOptions.phone"
              v-model="filters.phone"
              label="Telefone"
              clearable
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="resetFilters">Limpar</v-btn>
            <v-btn color="primary" @click="filterDialog = false">Aplicar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, computed } from 'vue'
  import axios from 'axios'
  import { useClientsStore } from '@/stores/clients'
  import { jsPDF } from 'jspdf'
  import 'jspdf-autotable'
  
  const store        = useClientsStore()
  const formRef      = ref(null)
  const dialog       = ref(false)
  const filterDialog = ref(false)
  
  // quais filtros estão ativos
  const filterOptions = reactive({
    name: false,
    email: false,
    phone: false,
  })
  
  // valores dos filtros
  const filters = reactive({
    name: '',
    email: '',
    phone: '',
  })
  
  const headers = [
    { text: 'ID',       value: 'id',     width: '80px' },
    { text: 'Nome',     value: 'name' },
    { text: 'E-mail',   value: 'email' },
    { text: 'Telefone', value: 'phone' },
    { text: 'Ações',    value: 'actions', sortable: false, width: '120px' },
  ]
  
  const form = reactive({
    id: null,
    name: '',
    email: '',
    phone: '',
  })
  
  const nameRules = [
    v => !!v || 'Nome é obrigatório',
    v => (v && v.length >= 3) || 'Nome deve ter ao menos 3 caracteres',
  ]
  const emailRules = [
    v => !!v || 'E-mail é obrigatório',
    v => /.+@.+\..+/.test(v) || 'E-mail deve ser válido',
  ]
  const phoneRules = [
    v => !!v || 'Telefone é obrigatório',
    v => /^\d+$/.test(v) || 'Apenas números são permitidos',
    v => (v.length >= 10 && v.length <= 11) || 'Telefone inválido',
  ]
  
  onMounted(() => {
    store.fetchAll()
  })
  
  // aplica somente os filtros selecionados
  const filteredClients = computed(() => {
    return store.list.filter(c => {
      const byName  = !filterOptions.name  || c.name.toLowerCase().includes(filters.name.toLowerCase())
      const byEmail = !filterOptions.email || c.email.toLowerCase().includes(filters.email.toLowerCase())
      const byPhone = !filterOptions.phone || c.phone.includes(filters.phone)
      return byName && byEmail && byPhone
    })
  })
  
  const loading  = computed(() => store.loading)
  
  function openDialog() {
    Object.assign(form, { id: null, name: '', email: '', phone: '' })
    formRef.value?.resetValidation()
    dialog.value = true
  }
  
  function edit(item) {
    Object.assign(form, item)
    formRef.value?.resetValidation()
    dialog.value = true
  }
  
  function closeDialog() {
    dialog.value = false
  }
  
  async function save() {
    if (!formRef.value.validate()) return
    if (form.id) {
      await axios.put(`/api/clients/${form.id}`, form)
    } else {
      await axios.post('/api/clients', form)
    }
    await store.fetchAll()
    closeDialog()
  }
  
  async function remove(item) {
    if (!confirm(`Deseja excluir ${item.name}?`)) return
    await axios.delete(`/api/clients/${item.id}`)
    await store.fetchAll()
  }
  
  // limpa filtros e opções
  function resetFilters() {
    filters.name  = ''
    filters.email = ''
    filters.phone = ''
    filterOptions.name  = false
    filterOptions.email = false
    filterOptions.phone = false
  }
  
  // exporta o que está filtrado
  function exportPDF() {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Lista de Clientes', 14, 22)
  
    const cols = headers
      .filter(h => h.value !== 'actions')
      .map(h => h.text)
    const rows = filteredClients.value.map(c => [c.id, c.name, c.email, c.phone])
  
    doc.autoTable({
      head: [cols],
      body: rows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    })
  
    doc.save('clientes.pdf')
  }
  </script>
  