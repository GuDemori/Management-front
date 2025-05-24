<template>
  <component :is="layout">
    <router-view />
  </component>
</template>


<script setup>

  import { computed } from 'vue'
  import { useRoute } from 'vue-router'

  import DefaultLayout from '@/layouts/default.vue'
  import LoginLayout from '@/layouts/login.vue'

  const route = useRoute()

  const layout = computed(() => {
    return route.meta.layout === 'login' ? LoginLayout : DefaultLayout
  })

</script>
