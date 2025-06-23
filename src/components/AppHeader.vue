<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <header class="border-b">
    <div class="flex h-16 items-center px-4">
      <div class="ml-auto flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu class="h-6 w-6" />
              <span class="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="router.push('/')"> Home </DropdownMenuItem>
            <DropdownMenuItem @click="router.push('/profile?section=basic')">
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem @click="router.push('/profile?section=basic&edit=true')">
              Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem @click="handleLogout"> Logout </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
