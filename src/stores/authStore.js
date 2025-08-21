import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (credentials) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          })
          
          if (response.ok) {
            const { user, token } = await response.json()
            set({ user, token, isAuthenticated: true })
          } else {
            throw new Error('Login failed')
          }
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        }
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      setUser: (user) => {
        set({ user })
      },
      
      setToken: (token) => {
        set({ token, isAuthenticated: !!token })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
) 