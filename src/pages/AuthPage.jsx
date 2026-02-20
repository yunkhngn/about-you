import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Music2, Loader2, Chrome } from 'lucide-react'
import { sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, updateProfile, sendEmailVerification, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function AuthPage() {
    const { signIn, signUp } = useAuth()
    const [isSignUp, setIsSignUp] = useState(false)
    const [isReset, setIsReset] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setMessage('')
        setLoading(true)

        try {
            if (isReset) {
                await sendPasswordResetEmail(auth, email)
                setMessage('Password reset email sent. Check your inbox.')
            } else if (isSignUp) {
                if (password !== confirmPassword) {
                    setError('Passwords do not match')
                    setLoading(false)
                    return
                }
                const userCredential = await signUp(email, password)
                await updateProfile(userCredential.user, { displayName })
                await sendEmailVerification(userCredential.user)
                await firebaseSignOut(auth) // force sign out after signup so they must verify
                setIsSignUp(false)
                setMessage('Account created! Please verify your email before signing in.')
                setPassword('')
                setConfirmPassword('')
                setDisplayName('')
            } else {
                const userCredential = await signIn(email, password)
                if (!userCredential.user.emailVerified) {
                    await firebaseSignOut(auth)
                    setError('Please verify your email before logging in.')
                    return
                }
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
            setError(messages[err.code] || err.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError('')
        setLoading(true)
        try {
            const provider = new GoogleAuthProvider()
            await signInWithPopup(auth, provider)
        } catch (err) {
            setError(err.message)
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
                        {isSignUp && (
                            <Input
                                type="text"
                                placeholder="Account Name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                                autoComplete="name"
                                className="h-11"
                            />
                        )}
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="h-11"
                        />
                        {!isReset && (
                            <div className="relative">
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
                                {!isSignUp && (
                                    <button
                                        type="button"
                                        onClick={() => { setIsReset(true); setError(''); setMessage('') }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-primary"
                                    >
                                        Forgot?
                                    </button>
                                )}
                            </div>
                        )}
                        {isSignUp && !isReset && (
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                minLength={6}
                                className="h-11"
                            />
                        )}
                    </div>

                    {error && (
                        <p className="text-sm text-destructive text-center">{error}</p>
                    )}
                    {message && (
                        <p className="text-sm text-green-500 text-center">{message}</p>
                    )}

                    <Button type="submit" className="w-full h-11" disabled={loading}>
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {isReset ? 'Send Reset Link' : (isSignUp ? 'Create account' : 'Sign in')}
                    </Button>
                </form>

                {!isReset && (
                    <>
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            type="button"
                            className="w-full h-11"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                        >
                            <Chrome className="h-4 w-4 mr-2" />
                            Google
                        </Button>
                    </>
                )}

                {/* Toggle */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    {isReset ? (
                        <button
                            type="button"
                            onClick={() => { setIsReset(false); setError(''); setMessage('') }}
                            className="text-primary hover:underline font-medium cursor-pointer"
                        >
                            Back to Sign In
                        </button>
                    ) : (
                        <>
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                type="button"
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); setIsReset(false) }}
                                className="text-primary hover:underline font-medium cursor-pointer"
                            >
                                {isSignUp ? 'Sign in' : 'Create one'}
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    )
}
