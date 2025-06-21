<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
// import AppHeader from '@/components/AppHeader.vue'

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'

import { useRoute } from 'vue-router'
import { computed } from 'vue'

import 'vue-sonner/style.css'

const route = useRoute()
const showSidebar = computed(() => route.meta.showSidebar)
</script>

<template>
  <!-- <AppHeader /> -->
  <SidebarProvider>
    <AppSidebar v-if="showSidebar" />
    <main class="p-10 w-full">
      <SidebarTrigger v-if="showSidebar" />
      <RouterView />
    </main>
  </SidebarProvider>
  <Toaster />
</template>
