import { Platform } from 'react-native'

if (Platform.OS === 'web') {
  const originalWarn = console.warn
  const originalError = console.error

  console.warn = (...args) => {
    const msg = args[0]?.toString() ?? ''
    if (msg.includes('aria-hidden') || msg.includes('startTime')) return
    originalWarn(...args)
  }

  console.error = (...args) => {
    const msg = args[0]?.toString() ?? ''
    if (msg.includes('aria-hidden') || msg.includes('startTime')) return
    originalError(...args)
  }
}

import 'expo-router/entry'
