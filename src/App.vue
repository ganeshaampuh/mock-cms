<script setup lang="ts">
import AppSidebar from './components/AppSidebar.vue'
import AppHeader from './components/AppHeader.vue'

import { SidebarProvider } from '@/components/ui/sidebar'
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'

import { useRoute } from 'vue-router'
import { computed } from 'vue'

import 'vue-sonner/style.css'

const route = useRoute()
const showSidebar = computed(() => route.meta.showSidebar)
const showHeader = computed(() => route.meta.showHeader)
</script>

<template>
  <AppHeader v-if="showHeader" />
  <SidebarProvider>
    <AppSidebar v-if="showSidebar" />
    <main class="w-full px-10">
      <RouterView />
    </main>
  </SidebarProvider>
  <Toaster />
</template>
