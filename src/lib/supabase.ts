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
  id: string
  salutation: string
  first_name: string
  last_name: string
  email: string
}) {
  const { data, error } = await supabase.from('profiles').upsert(profile).eq('id', profile.id)

  if (error) {
    throw error
  }

  return data
}
