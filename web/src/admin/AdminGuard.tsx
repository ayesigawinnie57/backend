import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { authApi } from '../lib/api'

type State = 'loading' | 'allowed' | 'denied'

export default function AdminGuard() {
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    // No token at all — deny immediately without a network call
    if (!localStorage.getItem('access_token')) {
      setState('denied')
      return
    }

    authApi.profile()
      .then(({ data }) => {
        setState(data.is_staff ? 'allowed' : 'denied')
      })
      .catch(() => {
        // 401 / network error — clear stale tokens and deny
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setState('denied')
      })
  }, [])

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-2 border-[#071A2B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return state === 'allowed' ? <Outlet /> : <Navigate to="/login" replace />
}
