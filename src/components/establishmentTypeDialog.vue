<template>
  <v-dialog v-model="model" max-width="700px">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6">Tipos de Estabelecimento</span>
        <v-btn icon @click="model = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-btn color="primary" class="mb-4" @click="openForm()">Novo Tipo</v-btn>

        <v-data-table
          :headers="headers"
          :items="types"
          :loading="loading"
          class="elevation-1"
          density="comfortable"
          item-value="id"
        >
          <template #item.actions="{ item }">
            <v-icon small class="me-2" @click="openForm(item)">mdi-pencil</v-icon>
            <v-icon small @click="askDelete(item.id)">mdi-delete</v-icon>
          </template>
        </v-data-table>

        <v-alert v-if="error" type="error" class="mt-4" dense>{{ error }}</v-alert>
      </v-card-text>

      <v-divider />

      <!-- FORMULÁRIO -->
      <v-card-text v-if="formDialog">
        <v-form ref="formRef" @submit.prevent="save">
          <v-text-field
            v-model="form.name"
            label="Nome do Tipo"
            :rules="[rules.required]"
          />
          <v-text-field
            v-model="form.code"
            label="Código (3 letras)"
            :rules="[rules.required, rules.code]"
            maxlength="3"
            @input="form.code = form.code.toUpperCase()"
          />

          <div class="d-flex justify-end mt-4">
            <v-btn text @click="closeForm">Cancelar</v-btn>
            <v-btn color="primary" class="ml-2" type="submit">Salvar</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- MODAL CONFIRMAÇÃO EXCLUSÃO -->
    <v-dialog v-model="confirmDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Confirmar Exclusão</v-card-title>
        <v-card-text>
          Tem certeza de que deseja excluir este tipo de estabelecimento?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="confirmDeleteDialog = false">Cancelar</v-btn>
          <v-btn color="red" @click="confirmDelete">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const model = ref(false)
const loading = ref(false)
const error = ref('')
const types = ref([])
const formDialog = ref(false)
const formRef = ref(null)

const form = ref({
  id: null,
  name: '',
  code: '',
})

// exclusão com modal
const confirmDeleteDialog = ref(false)
const itemToDelete = ref(null)

watch(() => props.modelValue, value => model.value = value)
watch(model, value => emit('update:modelValue', value))

const headers = [
  { title: 'Nome', key: 'name', sortable: true },
  { title: 'Código', key: 'code', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false },
]

const rules = {
  required: v => !!v || 'Campo obrigatório',
  code: v => v.length === 3 || 'Código deve ter 3 letras',
}

const fetchTypes = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/establishment-types')
    types.value = data
  } catch (err) {
    error.value = 'Erro ao buscar tipos.'
  } finally {
    loading.value = false
  }
}

const openForm = (item = null) => {
  if (item) {
    form.value = { ...item }
  } else {
    form.value = { id: null, name: '', code: '' }
  }
  formDialog.value = true
}

const closeForm = () => {
  formDialog.value = false
  formRef.value?.resetValidation()
}

const save = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  error.value = ''

  try {
    if (form.value.id) {
      const { status } = await axios.put(`/api/establishment-types/${form.value.id}`, form.value)
      if (status === 200) {
        closeForm()
        fetchTypes()
      }
    } else {
      const { status } = await axios.post('/api/establishment-types', form.value)
      if (status === 201) {
        closeForm()
        fetchTypes()
      }
    }
  } catch (err) {
    console.error(err)
    error.value = err.response?.data?.message || 'Erro ao salvar tipo.'
  }
}

const askDelete = (id) => {
  itemToDelete.value = id
  confirmDeleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await axios.delete(`/api/establishment-types/${itemToDelete.value}`)
    confirmDeleteDialog.value = false
    fetchTypes()
  } catch {
    error.value = 'Erro ao excluir tipo.'
  }
}

onMounted(fetchTypes)
</script>
