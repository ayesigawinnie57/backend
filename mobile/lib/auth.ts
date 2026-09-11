import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import { BASE_URL } from './api'

const storage = {
  async get(key: string) {
    if (Platform.OS === 'web') return localStorage.getItem(key)
    return SecureStore.getItemAsync(key)
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return }
    return SecureStore.setItemAsync(key, value)
  },
  async del(key: string) {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return }
    return SecureStore.deleteItemAsync(key)
  },
}

export type AuthUser = {
  id: number
  email: string
  name: string
  phone: string
  avatar: string | null
  is_staff: boolean
}

export const authApi = {
  login: (email: string, password: string) =>
    axios.post<{ access: string; refresh: string }>(`${BASE_URL}/api/auth/login/`, { email, password }),

  register: (name: string, email: string, phone: string, password: string) =>
    axios.post(`${BASE_URL}/api/auth/register/`, { name, email, phone, password }),

  profile: (token: string) =>
    axios.get<AuthUser>(`${BASE_URL}/api/auth/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateProfile: (token: string, data: Partial<Pick<AuthUser, 'phone'>>) =>
    axios.patch<AuthUser>(`${BASE_URL}/api/auth/profile/`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
}

export const tokenStore = {
  save: async (access: string, refresh: string) => {
    await storage.set('access_token', access)
    await storage.set('refresh_token', refresh)
  },
  clear: async () => {
    await storage.del('access_token')
    await storage.del('refresh_token')
  },
  getAccess: () => storage.get('access_token'),
  getRefresh: () => storage.get('refresh_token'),
}
