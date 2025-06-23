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
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { ref, onMounted, computed, watch } from 'vue'
import { getProfile, updateProfile, getUser } from '@/lib/supabase'
import { toast } from 'vue-sonner'
import { useRoute } from 'vue-router'
import { useForm } from 'vee-validate'

const route = useRoute()

const sectionActive = computed(() => {
  return route.query.section as string
})

const schema = toTypedSchema(
  z.object({
    salutation: z.string().min(1),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
  }),
)

const additionalSchema = toTypedSchema(
  z.object({
    homeAddress: z.string().min(1),
    country: z.string().min(1),
    dateOfBirth: z.string().refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 17
      }
      return age >= 17
    }, 'Must be at least 17 years old'),
    gender: z.string().min(1),
    maritalStatus: z.string().min(1),
  }),
)

const spouseSchema = toTypedSchema(
  z.object({
    spouseSalutation: z.string().min(1),
    spouseFirstName: z.string().min(1),
    spouseLastName: z.string().min(1),
  }),
)

const personalPreferencesSchema = toTypedSchema(
  z.object({
    hobbiesAndInterests: z.string().min(1),
    favoriteSports: z.string().min(1),
    preferredMusicGenres: z.string().min(1),
    preferredShowsAndMovies: z.string().min(1),
  }),
)

const validationSchema = computed(() => {
  if (sectionActive.value === 'basic') {
    return schema
  }

  if (sectionActive.value === 'additional') {
    return additionalSchema
  }

  if (sectionActive.value === 'spouse') {
    return spouseSchema
  }

  return personalPreferencesSchema
})

const { isFieldDirty, handleSubmit, resetForm } = useForm({
  validationSchema,
})

const isEdit = ref(false)

const profile = ref<{
  id: string
  salutation: string
  firstName: string
  lastName: string
  email: string
  profilePicture: File | null

  homeAddress: string
  country: string
  dateOfBirth: string
  gender: string
  maritalStatus: string

  spouseSalutation: string
  spouseFirstName: string
  spouseLastName: string

  hobbiesAndInterests: string
  favoriteSports: string
  preferredMusicGenres: string
  preferredShowsAndMovies: string
}>({
  id: '',
  salutation: '',
  firstName: '',
  lastName: '',
  email: '',
  profilePicture: null,

  homeAddress: '',
  country: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',

  spouseSalutation: '',
  spouseFirstName: '',
  spouseLastName: '',

  hobbiesAndInterests: '',
  favoriteSports: '',
  preferredMusicGenres: '',
  preferredShowsAndMovies: '',
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
  profile.value.profilePicture = profileData?.profile_picture ?? null

  profile.value.homeAddress = profileData?.home_address ?? ''
  profile.value.country = profileData?.country ?? ''
  profile.value.dateOfBirth = profileData?.date_of_birth ?? ''
  profile.value.gender = profileData?.gender ?? ''
  profile.value.maritalStatus = profileData?.marital_status ?? ''

  profile.value.spouseSalutation = profileData?.spouse_salutation ?? ''
  profile.value.spouseFirstName = profileData?.spouse_first_name ?? ''
  profile.value.spouseLastName = profileData?.spouse_last_name ?? ''

  profile.value.hobbiesAndInterests = profileData?.hobbies_and_interests ?? ''
  profile.value.favoriteSports = profileData?.favorite_sports ?? ''
  profile.value.preferredMusicGenres = profileData?.preferred_music_genres ?? ''
  profile.value.preferredShowsAndMovies = profileData?.preferred_shows_and_movies ?? ''
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
    ...(sectionActive.value === 'basic' && {
      salutation: values.salutation,
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
    }),
    ...(sectionActive.value === 'additional' && {
      home_address: values.homeAddress,
      country: values.country,
      date_of_birth: values.dateOfBirth,
      gender: values.gender,
      marital_status: values.maritalStatus,
    }),
    ...(sectionActive.value === 'spouse' && {
      spouse_salutation: values.spouseSalutation,
      spouse_first_name: values.spouseFirstName,
      spouse_last_name: values.spouseLastName,
    }),
    ...(sectionActive.value === 'preferences' && {
      hobbies_and_interests: values.hobbiesAndInterests,
      favorite_sports: values.favoriteSports,
      preferred_music_genres: values.preferredMusicGenres,
      preferred_shows_and_movies: values.preferredShowsAndMovies,
    }),
  })
    .then(() => {
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated',
      })

      isEdit.value = false

      loadProfile()
    })
    .catch(() => {
      toast({
        title: 'Error updating profile',
        description: 'Please try again',
      })
    })
})

watch(
  () => route.query.edit as string,
  async (newVal) => {
    if (newVal === 'true') {
      isEdit.value = true
      return
    }

    isEdit.value = false
  },
  {
    immediate: true,
  },
)

watch(isEdit, async (newVal) => {
  if (newVal) {
    const data = await getProfile(profile.value.id)

    if (sectionActive.value === 'basic') {
      resetForm({
        values: {
          salutation: data?.salutation ?? '',
          firstName: data?.first_name ?? '',
          lastName: data?.last_name ?? '',
          email: data?.email ?? '',
        },
      })
    }

    if (sectionActive.value === 'additional') {
      resetForm({
        values: {
          homeAddress: data?.home_address ?? '',
          country: data?.country ?? '',
          dateOfBirth: data?.date_of_birth ?? '',
          gender: data?.gender ?? '',
          maritalStatus: data?.marital_status ?? '',
        },
      })
    }

    if (sectionActive.value === 'spouse') {
      resetForm({
        values: {
          spouseSalutation: data?.spouse_salutation ?? '',
          spouseFirstName: data?.spouse_first_name ?? '',
          spouseLastName: data?.spouse_last_name ?? '',
        },
      })
    }

    if (sectionActive.value === 'preferences') {
      resetForm({
        values: {
          hobbiesAndInterests: data?.hobbies_and_interests ?? '',
          favoriteSports: data?.favorite_sports ?? '',
          preferredMusicGenres: data?.preferred_music_genres ?? '',
          preferredShowsAndMovies: data?.preferred_shows_and_movies ?? '',
        },
      })
    }
  }
})

onMounted(async () => {
  await loadUser()
  await loadProfile()
})
</script>

<template>
  <div v-if="sectionActive === 'basic'">
    <div v-if="!isEdit" class="flex flex-col items-center justify-start h-screen">
      <div class="flex flex-row gap-2 w-full max-w-lg mt-4 justify-between">
        <h1 class="text-2xl font-bold">Basic Details</h1>
        <Button @click="isEdit = true" variant="outline"> Edit Profile </Button>
      </div>
      <div class="flex flex-col gap-2 w-full max-w-lg mt-4 text-left">
        <p class="font-bold">Profile Picture:</p>
        <img
          :src="'https://placehold.co/100x100'"
          alt="Profile Picture"
          class="w-24 h-24 rounded-full mb-3"
        />
        <p class="font-bold">Salutation:</p>
        <p class="mb-3">{{ profile.salutation ? profile.salutation : '-' }}</p>
        <p class="font-bold">First Name:</p>
        <p class="mb-3">{{ profile.firstName ? profile.firstName : '-' }}</p>
        <p class="font-bold">Last Name:</p>
        <p class="mb-3">{{ profile.lastName ? profile.lastName : '-' }}</p>
        <p class="font-bold">Email:</p>
        <p class="mb-3">{{ profile.email ? profile.email : '-' }}</p>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-start h-screen mt-4">
      <h1 class="text-2xl font-bold">Edit Basic Details</h1>
      <form class="flex flex-col gap-4 w-full max-w-lg mt-4" @submit="onSubmit">
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
  </div>
  <div v-if="sectionActive === 'additional'">
    <div v-if="!isEdit" class="flex flex-col items-center justify-start h-screen">
      <div class="flex flex-row gap-2 w-full max-w-lg mt-4 justify-between">
        <h1 class="text-2xl font-bold">Additional Details</h1>
        <Button @click="isEdit = true" variant="outline"> Edit Additional Details </Button>
      </div>
      <div class="flex flex-col gap-2 w-full max-w-lg mt-4 text-left">
        <p class="font-bold">Home Address:</p>
        <p class="mb-3">{{ profile.homeAddress ? profile.homeAddress : '-' }}</p>
        <p class="font-bold">Country:</p>
        <p class="mb-3">{{ profile.country ? profile.country : '-' }}</p>
        <p class="font-bold">Date of Birth:</p>
        <p class="mb-3">{{ profile.dateOfBirth ? profile.dateOfBirth : '-' }}</p>
        <p class="font-bold">Gender:</p>
        <p class="mb-3">{{ profile.gender ? profile.gender : '-' }}</p>
        <p class="font-bold">Marital Status:</p>
        <p class="mb-3">{{ profile.maritalStatus ? profile.maritalStatus : '-' }}</p>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-start h-screen mt-4">
      <h1 class="text-2xl font-bold">Edit Additional Details</h1>
      <form class="flex flex-col gap-4 w-full max-w-lg mt-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="homeAddress" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormLabel>Home Address</FormLabel>
            <FormControl>
              <Input
                id="homeAddress"
                type="text"
                placeholder="Home Address"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="country" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Input id="country" type="text" placeholder="Country" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="dateOfBirth" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormLabel>Date of Birth</FormLabel>
            <FormControl>
              <Input
                id="dateOfBirth"
                type="date"
                placeholder="Date of Birth"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="gender" :validate-on-blur="!isFieldDirty">
          <FormItem>
            <FormLabel>Gender</FormLabel>
            <FormControl>
              <Select id="gender" v-bind="componentField" class="w-full">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select a gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="maritalStatus"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>Marital Status</FormLabel>
            <FormControl>
              <Select id="maritalStatus" v-bind="componentField" class="w-full">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select a marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" @click="cancel">Cancel</Button>
      </form>
    </div>
  </div>
  <div v-if="sectionActive === 'spouse'">
    <div v-if="!isEdit" class="flex flex-col items-center justify-start h-screen">
      <div class="flex flex-row gap-2 w-full max-w-lg mt-4 justify-between">
        <h1 class="text-2xl font-bold">Spouse Details</h1>
        <Button @click="isEdit = true" variant="outline"> Edit Spouse Details </Button>
      </div>
      <div class="flex flex-col gap-2 w-full max-w-lg mt-4 text-left">
        <p class="font-bold">Salutation:</p>
        <p class="mb-3">{{ profile.spouseSalutation ? profile.spouseSalutation : '-' }}</p>
        <p class="font-bold">First Name:</p>
        <p class="mb-3">{{ profile.spouseFirstName ? profile.spouseFirstName : '-' }}</p>
        <p class="font-bold">Last Name:</p>
        <p class="mb-3">{{ profile.spouseLastName ? profile.spouseLastName : '-' }}</p>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-start h-screen mt-4">
      <h1 class="text-2xl font-bold">Edit Spouse Details</h1>
      <form class="flex flex-col gap-4 w-full max-w-lg mt-4" @submit="onSubmit">
        <FormField
          v-slot="{ componentField }"
          name="spouseSalutation"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>Salutation</FormLabel>
            <FormControl>
              <Select id="spouseSalutation" v-bind="componentField" class="w-full">
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
        <FormField
          v-slot="{ componentField }"
          name="spouseFirstName"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl>
              <Input
                id="spouseFirstName"
                type="text"
                placeholder="First Name"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="spouseLastName"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl>
              <Input
                id="spouseLastName"
                type="text"
                placeholder="Last Name"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" @click="cancel">Cancel</Button>
      </form>
    </div>
  </div>
  <div v-if="sectionActive === 'preferences'">
    <div v-if="!isEdit" class="flex flex-col items-center justify-start h-screen">
      <div class="flex flex-row gap-2 w-full max-w-lg mt-4 justify-between">
        <h1 class="text-2xl font-bold">Personal Preferences</h1>
        <Button @click="isEdit = true" variant="outline"> Edit Personal Preferences </Button>
      </div>
      <div class="flex flex-col gap-2 w-full max-w-lg mt-4 text-left">
        <p class="font-bold">Hobbies and Interests:</p>
        <p class="mb-3">
          {{ profile.hobbiesAndInterests ? profile.hobbiesAndInterests : '-' }}
        </p>
        <p class="font-bold">Favorite Sports:</p>
        <p class="mb-3">
          {{ profile.favoriteSports ? profile.favoriteSports : '-' }}
        </p>
        <p class="font-bold">Preferred Music Genres:</p>
        <p class="mb-3">
          {{ profile.preferredMusicGenres ? profile.preferredMusicGenres : '-' }}
        </p>
        <p class="font-bold">Preferred Shows and Movies:</p>
        <p class="mb-3">
          {{ profile.preferredShowsAndMovies ? profile.preferredShowsAndMovies : '-' }}
        </p>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-start h-screen mt-4">
      <h1 class="text-2xl font-bold">Edit Personal Preferences</h1>
      <form class="flex flex-col gap-4 w-full max-w-lg mt-4" @submit="onSubmit">
        <FormField
          v-slot="{ componentField }"
          name="hobbiesAndInterests"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>Hobbies and Interests</FormLabel>
            <FormControl>
              <Input
                id="hobbiesAndInterests"
                type="text"
                placeholder="Hobbies and Interests"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="favoriteSports"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>Favorite Sports</FormLabel>
            <FormControl>
              <Input
                id="favoriteSports"
                type="text"
                placeholder="Favorite Sports"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="preferredMusicGenres"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>Preferred Music Genres</FormLabel>
            <FormControl>
              <Input
                id="preferredMusicGenres"
                type="text"
                placeholder="Preferred Music Genres"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <FormField
          v-slot="{ componentField }"
          name="preferredShowsAndMovies"
          :validate-on-blur="!isFieldDirty"
        >
          <FormItem>
            <FormLabel>Preferred Shows and Movies</FormLabel>
            <FormControl>
              <Input
                id="preferredShowsAndMovies"
                type="text"
                placeholder="Preferred Shows and Movies"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" @click="cancel">Cancel</Button>
      </form>
    </div>
  </div>
</template>
