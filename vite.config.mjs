// vite.config.mjs
import AutoImport         from 'unplugin-auto-import/vite'
import Components         from 'unplugin-vue-components/vite'
import Fonts              from 'unplugin-fonts/vite'
import Layouts            from 'vite-plugin-vue-layouts-next'
import Pages              from 'vite-plugin-pages'
import Vue                from '@vitejs/plugin-vue'
import VueRouter          from 'unplugin-vue-router/vite'
import { VueRouterAutoImports } from 'unplugin-vue-router'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

import { defineConfig }   from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    VueRouter(),
    Layouts(),
    Pages({
      dirs: 'src/pages',
      extensions: ['vue'],
      importMode: 'async',
    }),
    Vue({ template: { transformAssetUrls } }),
    Vuetify({
      autoImport: true,
      styles: { configFile: 'src/styles/settings.scss' },
    }),
    Components(),
    Fonts({
      google: {
        families: [{
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        { pinia: ['defineStore','storeToRefs'] },
      ],
      eslintrc: { enabled: true },
      vueTemplate: true,
    }),
  ],

  optimizeDeps: {
    exclude: [
      'vuetify',
      'vue-router',
      'unplugin-vue-router/runtime',
      'unplugin-vue-router/data-loaders',
      'unplugin-vue-router/data-loaders/basic',
    ],
  },

  define: { 'process.env': {} },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js','.json','.jsx','.mjs','.ts','.tsx','.vue'],
  },

  // <<< AQUI você configura a porta e o proxy para seu back-end >>>
  server: {
    port: 3000,
    proxy: {
      // qualquer request que comece com /api
      // será redirecionado para http://localhost:8000
      '/api': {
        target: 'http://localhost:8000',    // ajuste para a porta/host do seu back
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        // se seu back consumir sem o prefixo, use:
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },

  css: {
    preprocessorOptions: {
      sass: { api: 'modern-compiler' },
      scss: { api: 'modern-compiler' },
    },
  },
})
