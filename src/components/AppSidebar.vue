<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar'

const items = [
  {
    title: 'Basic Details',
    url: '#',
  },
  {
    title: 'Additional Details',
    url: '#',
  },
  {
    title: 'Spouse Details',
    url: '#',
  },
  {
    title: 'Personal Preferences',
    url: '#',
  },
]
</script>

<template>
  <Sidebar>
    <SidebarHeader />
    <SidebarContent>
      <SidebarGroup v-for="item in items" :key="item.title">
        <SidebarGroupContent>
          <SidebarGroupItem>
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
