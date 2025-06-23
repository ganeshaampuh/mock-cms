<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar'

import { onMounted, ref, watch } from 'vue'

import { useRouter, useRoute } from 'vue-router'

import { getUser, getProfile, createProfile } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

const items = ref([
  {
    title: 'Basic Details',
    url: '/profile?section=basic',
  },
  {
    title: 'Additional Details',
    url: '/profile?section=additional',
  },
  {
    title: 'Personal Preferences',
    url: '/profile?section=preferences',
  },
])

const fetchNewItems = async () => {
  const data = await getUser()

  try {
    const profile = await getProfile(data.user?.id)

    const isShowSpouse = profile.marital_status === 'Married'

    if (isShowSpouse && !items.value.some((item) => item.url === '/profile?section=spouse')) {
      items.value.push({
        title: 'Spouse Details',
        url: '/profile?section=spouse',
      })
    }
  } catch (error) {
    throw error
  }
}

watch(route, () => {
  fetchNewItems()
})

onMounted(async () => {
  const data = await getUser()

  try {
    const profile = await getProfile(data.user?.id)

    const isShowSpouse = profile.marital_status === 'Married'

    if (isShowSpouse) {
      items.value.push({
        title: 'Spouse Details',
        url: '/profile?section=spouse',
      })
    }
  } catch (error) {
    console.log('Profile not found, creating...')
    await createProfile(data.user?.id)
    throw error
  }
})
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
