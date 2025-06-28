<template>
  <v-form ref="formRef" @submit.prevent="submit">
    <v-tabs v-model="tab" align-tabs="center" grow>
      <v-tab><v-icon left>mdi-tag</v-icon>Geral</v-tab>
      <v-tab><v-icon left>mdi-domain</v-icon>Comercial</v-tab>
      <v-tab><v-icon left>mdi-tag-multiple</v-icon>Apelidos</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-4">
      <!-- Geral -->
      <v-window-item :value="0">
        <v-text-field v-model="form.name" label="Nome" :rules="nameRules" required />
        <v-textarea v-model="form.description" label="Descrição" auto-grow />
        <!-- Preview da imagem atual se houver -->
        <v-img
          v-if="form.image_url && !form.imageFile"
          :src="form.image_url"
          max-height="150"
          class="mb-3"
          cover
        />
        <!-- Campo para upload -->
        <v-file-input
          v-model="form.imageFile"
          label="Imagem do Produto"
          accept="image/*"
          prepend-icon="mdi-image"
          show-size
        >
          <template #prepend>
            <v-img
              v-if="previewUrl"
              :src="previewUrl"
              max-height="60"
              max-width="60"
              class="mr-2 rounded"
              cover
            />
          </template>
        </v-file-input>
        <v-select
          v-model="form.supplier_id"
          :items="suppliers"
          item-title="name"
          item-value="id"
          label="Fornecedor"
          :rules="[v => !!v || 'Obrigatório']"
        />
        <v-select
          v-model="form.product_category_id"
          :items="categories"
          item-title="name"
          item-value="id"
          label="Categoria"
          :rules="[v => !!v || 'Obrigatório']"
        />
      </v-window-item>

      <!-- Comercial -->
      <v-window-item :value="1">
        <v-text-field
          v-model="form.costs"
          label="Custo (R$)"
          type="number"
          :rules="moneyRules"
          required
        />
        <v-text-field
          v-model="form.wholesale_price"
          label="Preço Atacado (R$)"
          type="number"
          :rules="moneyRules"
          required
        />
        <v-text-field
          v-model="form.retail_price"
          label="Preço Varejo (R$)"
          type="number"
          :rules="moneyRules"
          required
        />
      </v-window-item>

      <!-- Apelidos -->
      <v-window-item :value="2">
        <v-text-field
          v-model="newNickname"
          label="Novo Apelido"
          @keyup.enter="addNickname"
          placeholder="Digite e pressione Enter"
        />
        <div class="mt-2">
          <v-chip
            v-for="(nick, i) in form.nicknames"
            :key="i"
            close
            @click:close="removeNickname(i)"
            class="ma-1"
          >
            {{ nick }}
          </v-chip>
        </div>
      </v-window-item>
    </v-window>
  </v-form>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  form: Object,
  suppliers: Array,
  categories: Array
})
const emit = defineEmits(['submit'])

const tab = ref(0)
const newNickname = ref('')
const formRef = ref(null)

const nameRules = [
  v => !!v || 'Nome é obrigatório',
  v => v.length >= 3 || 'Mínimo 3 caracteres'
]

const moneyRules = [
  v => !!v || 'Obrigatório',
  v => parseFloat(v) > 0 || 'Deve ser maior que zero'
]

const previewUrl = computed(() => {
  if (props.form.imageFile) {
    return URL.createObjectURL(props.form.imageFile)
  }
  return props.form.image_url || ''
})

async function submit() {
  const { valid } = await formRef.value.validate()
  if (valid) emit('submit')
}

function addNickname() {
  const val = newNickname.value.trim()
  if (val && !props.form.nicknames.includes(val)) {
    props.form.nicknames.push(val)
  }
  newNickname.value = ''
}

function removeNickname(idx) {
  props.form.nicknames.splice(idx, 1)
}
</script>
