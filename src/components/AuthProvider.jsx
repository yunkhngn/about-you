/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthChange, signIn, signUp, signOut } from '@/lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            // Only set the user in context if they have verified their email
            // (or if it's null when signed out)
            if (user && !user.emailVerified) {
                setUser(null)
            } else {
                setUser(user)
            }
            setLoading(false)
        })
        return unsubscribe
    }, [])

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
