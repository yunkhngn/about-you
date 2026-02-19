import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Music2, Loader2 } from 'lucide-react'

export default function AuthPage() {
    const { signIn, signUp } = useAuth()
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isSignUp) {
                await signUp(email, password)
            } else {
                await signIn(email, password)
            }
        } catch (err) {
            const messages = {
                'auth/email-already-in-use': 'This email is already registered',
                'auth/invalid-email': 'Invalid email address',
                'auth/weak-password': 'Password must be at least 6 characters',
                'auth/invalid-credential': 'Invalid email or password',
                'auth/user-not-found': 'No account found with this email',
                'auth/wrong-password': 'Incorrect password',
            }
            setError(messages[err.code] || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
                        <Music2 className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">
                        About You
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Your personal songwriting workspace
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="h-11"
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete={isSignUp ? 'new-password' : 'current-password'}
                            minLength={6}
                            className="h-11"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive text-center">{error}</p>
                    )}

                    <Button type="submit" className="w-full h-11" disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {isSignUp ? 'Create account' : 'Sign in'}
                    </Button>
                </form>

                {/* Toggle */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => { setIsSignUp(!isSignUp); setError('') }}
                        className="text-primary hover:underline font-medium cursor-pointer"
                    >
                        {isSignUp ? 'Sign in' : 'Create one'}
                    </button>
                </p>
            </div>
        </div>
    )
}
