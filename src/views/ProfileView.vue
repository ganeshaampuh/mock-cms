<script setup lang="ts">
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { ref, onMounted, watch } from 'vue'
import { getProfile, updateProfile, getUser } from '@/lib/supabase'
import { toast } from 'vue-sonner'

const schema = toTypedSchema(
  z.object({
    salutation: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
  }),
)

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: schema,
})

const isEdit = ref(false)

const profile = ref<{
  id: string
  salutation: string
  firstName: string
  lastName: string
  email: string
}>({
  id: '',
  salutation: '',
  firstName: '',
  lastName: '',
  email: '',
})

const loadProfile = async () => {
  if (!profile.value) {
    return
  }

  const profileData = await getProfile(profile.value.id)

  profile.value.salutation = profileData?.salutation ?? ''
  profile.value.firstName = profileData?.first_name ?? ''
  profile.value.lastName = profileData?.last_name ?? ''
  profile.value.email = profileData?.email ?? ''
}

const loadUser = async () => {
  const data = await getUser()

  profile.value.id = data.user.id ?? ''
}

const cancel = () => {
  isEdit.value = false
}

const onSubmit = handleSubmit((values) => {
  if (!profile.value!.id) {
    toast({
      title: 'Profile not found',
      description: 'Please try again',
    })
    return
  }

  updateProfile({
    id: profile.value!.id,
    salutation: values.salutation,
    first_name: values.firstName,
    last_name: values.lastName,
    email: values.email,
  })
    .then(() => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated',
      })
      isEdit.value = false
    })
    .catch(() => {
      toast({
        title: 'Error updating profile',
        description: 'Please try again',
      })
    })
})

watch(isEdit, async (newVal) => {
  if (newVal) {
    await loadProfile()
  }
})

onMounted(async () => {
  await loadUser()
  await loadProfile()
})
</script>

<template>
  <div v-if="!isEdit" class="flex flex-col items-center justify-start h-screen">
    <div class="flex flex-row gap-2 w-full max-w-md mt-4 justify-between">
      <h1 class="text-2xl font-bold">My Profile</h1>
      <Button @click="isEdit = true" variant="outline"> Edit Profile </Button>
    </div>
    <div class="flex flex-col gap-2 w-full max-w-md mt-4 text-left">
      <p>Salutation: {{ profile.salutation ? profile.salutation : '-' }}</p>
      <p>First Name: {{ profile.firstName ? profile.firstName : '-' }}</p>
      <p>Last Name: {{ profile.lastName ? profile.lastName : '-' }}</p>
      <p>Email: {{ profile.email ? profile.email : '-' }}</p>
    </div>
  </div>
  <div v-else class="flex flex-col items-center justify-start h-screen">
    <h1 class="text-2xl font-bold">Profile</h1>
    <form class="flex flex-col gap-4 w-full max-w-md mt-4" @submit="onSubmit">
      <FormField v-slot="{ componentField }" name="salutation" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>Salutation</FormLabel>
          <FormControl>
            <Select id="salutation" v-bind="componentField" class="w-full">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a salutation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mr.">Mr.</SelectItem>
                <SelectItem value="Mrs.">Mrs.</SelectItem>
                <SelectItem value="Ms.">Ms.</SelectItem>
                <SelectItem value="Dr.">Dr.</SelectItem>
                <SelectItem value="Prof.">Prof.</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="firstName" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>First Name</FormLabel>
          <FormControl>
            <Input id="firstName" type="text" placeholder="First Name" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="lastName" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>Last Name</FormLabel>
          <FormControl>
            <Input id="lastName" type="text" placeholder="Last Name" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="email" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input id="email" type="email" placeholder="Email" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button type="submit">Save</Button>
      <Button type="button" variant="outline" @click="cancel">Cancel</Button>
    </form>
  </div>
</template>
