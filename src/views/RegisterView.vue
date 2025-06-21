<script setup lang="ts">
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { registerUser } from '@/lib/supabase'

const schema = toTypedSchema(
  z.object({
    userId: z.string().email(),
    password: z.string().min(6),
  }),
)

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: schema,
})

const router = useRouter()

const onSubmit = handleSubmit((values) => {
  registerUser(values.userId, values.password).then((data) => {
    if (data.user) {
      router.push('/login')
      toast({
        title: 'User registered!',
        description: 'You can now login.',
      })
    } else {
      toast({
        title: 'Error registering user!',
        description: 'Please try again.',
      })
    }
  })
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold">Register</h1>
    <form class="flex flex-col gap-4 w-full max-w-md mt-4" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="userId" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>User ID</FormLabel>
          <FormControl>
            <Input id="username" type="email" placeholder="User ID" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="password" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>Password</FormLabel>
          <FormControl>
            <Input id="password" type="password" placeholder="Password" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button type="submit">Register</Button>
      <p class="text-sm text-muted-foreground">
        Already have an account? <router-link to="/login">Login here.</router-link>
      </p>
    </form>
  </div>
</template>
