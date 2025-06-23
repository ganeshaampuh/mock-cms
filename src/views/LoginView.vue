<script setup lang="ts">
import { useForm } from 'vee-validate'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { loginUser } from '@/lib/supabase'

const schema = toTypedSchema(
  z.object({
    userId: z.string().email(),
    password: z.string().min(6),
    keepMeLoggedIn: z.boolean().default(false),
  }),
)

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: schema,
})

const router = useRouter()

const onSubmit = handleSubmit((values) => {
  loginUser(values.userId, values.password).then((data) => {
    if (data.user) {
      router.push('/profile?section=basic')
      toast({
        title: 'Logged in!',
        description: 'You are now logged in.',
      })
    } else {
      toast({
        title: 'Error logging in!',
        description: 'Please try again.',
      })
    }
  })
})
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <h1 class="text-2xl font-bold">Login</h1>
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
      <FormField v-slot="{ componentField }" name="keep-me-logged-in">
        <FormItem>
          <FormControl>
            <div class="items-top flex gap-x-2">
              <Checkbox id="keep-me-logged-in" v-bind="componentField" />
              <div class="grid gap-1.5 leading-none">
                <label
                  for="keep-me-logged-in"
                  class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Keep me logged in
                </label>
              </div>
            </div>
          </FormControl>
        </FormItem>
      </FormField>
      <Button type="submit"> Login </Button>
      <p class="text-sm text-muted-foreground">
        No account? <router-link to="/register">Register here.</router-link>
      </p>
      <p class="text-sm text-muted-foreground">Demo account: test@gmail.com / 123123</p>
    </form>
  </div>
</template>
