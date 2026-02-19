import { useState } from 'react'
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useAuth } from '@/components/AuthProvider'

export function ProfileDialog({ open, onClose }) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Profile state
    const [displayName, setDisplayName] = useState(user?.displayName || '')
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '')

    // Security state
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [activeTab, setActiveTab] = useState('general')

    if (!open) return null

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            await updateProfile(user, {
                displayName,
                photoURL
            })
            setSuccess('Profile updated successfully')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            // Re-authenticate first
            const credential = EmailAuthProvider.credential(user.email, currentPassword)
            await reauthenticateWithCredential(user, credential)

            await updatePassword(user, newPassword)
            setSuccess('Password updated successfully')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            if (err.code === 'auth/wrong-password') {
                setError('Incorrect current password')
            } else {
                setError(err.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/40">
                    <h3 className="font-display text-lg font-semibold">User Profile</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <div className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full mb-6">
                            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
                            <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general">
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Display Name</label>
                                    <Input
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Avatar URL</label>
                                    <Input
                                        value={photoURL}
                                        onChange={(e) => setPhotoURL(e.target.value)}
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </div>

                                {error && <p className="text-destructive text-sm">{error}</p>}
                                {success && <p className="text-green-500 text-sm">{success}</p>}

                                <div className="pt-2 flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                                    <Button type="submit" disabled={loading}>Save Changes</Button>
                                </div>
                            </form>
                        </TabsContent>

                        <TabsContent value="security">
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Current Password</label>
                                    <Input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">New Password</label>
                                    <Input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Confirm New Password</label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && <p className="text-destructive text-sm">{error}</p>}
                                {success && <p className="text-green-500 text-sm">{success}</p>}

                                <div className="pt-2 flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                                    <Button type="submit" variant="destructive" disabled={loading}>Update Password</Button>
                                </div>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
