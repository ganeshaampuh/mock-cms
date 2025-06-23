import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    persistSession: true,
  },
})

export async function registerUser(userId: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userId,
      password: password,
    })

    if (error) {
      throw error
    }

    if (data.user?.id) {
      await supabase.from('profiles').insert({
        id: data.user?.id,
        salutation: '',
        first_name: '',
        last_name: '',
        email: '',
        profile_picture: '',
        home_address: '',
        country: '',
        date_of_birth: '',
        gender: '',
        marital_status: '',
        spouse_salutation: '',
        spouse_first_name: '',
        spouse_last_name: '',
        hobbies_and_interests: '',
        favorite_sports: '',
        preferred_music_genres: '',
        preferred_shows_and_movies: '',
      })
    }

    return data
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}

export async function loginUser(userId: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userId,
      password: password,
    })

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error logging in user:', error)
    throw error
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error logging out user:', error)
    throw error
  }
}

export async function checkAuth() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return data
}

export async function getProfile(profileId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single()

  if (error) {
    throw error
  }

  return data
}

export async function updateProfile(profile: {
  id: string | null
  salutation: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  profile_picture: string | null

  home_address: string | null
  country: string | null
  date_of_birth: string | null
  gender: string | null
  marital_status: string | null

  spouse_salutation: string | null
  spouse_first_name: string | null
  spouse_last_name: string | null

  hobbies_and_interests: string | null
  favorite_sports: string | null
  preferred_music_genres: string | null
  preferred_shows_and_movies: string | null
}) {
  const filteredPayload = Object.fromEntries(
    Object.entries(profile).filter(([_, value]) => value !== null),
  )

  if (profile.profile_picture && profile.id) {
    const { data: profilePicture, error: profilePictureError } = await supabase.storage
      .from('profile-pictures')
      .upload(profile.id, profile.profile_picture)

    if (profilePictureError) {
      throw profilePictureError
    }

    filteredPayload.profile_picture = profilePicture.path
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(filteredPayload)
    .eq('id', profile.id)

  if (error) {
    throw error
  }

  return data
}
