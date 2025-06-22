<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar'

import { useRouter } from 'vue-router'

const router = useRouter()

const items = [
  {
    title: 'Basic Details',
    url: '/profile?section=basic',
  },
  {
    title: 'Additional Details',
    url: '/profile?section=additional',
  },
  {
    title: 'Spouse Details',
    url: '/profile?section=spouse',
  },
  {
    title: 'Personal Preferences',
    url: '/profile?section=preferences',
  },
]
</script>

<template>
  <Sidebar>
    <SidebarHeader />
    <SidebarContent>
      <SidebarGroup v-for="item in items" :key="item.title">
        <SidebarGroupContent>
          <SidebarGroupItem @click="router.push(item.url)" class="cursor-pointer">
            <SidebarGroupItemLabel class="pl-8">
              {{ item.title }}
            </SidebarGroupItemLabel>
          </SidebarGroupItem>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>
</template>
