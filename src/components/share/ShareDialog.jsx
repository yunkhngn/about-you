import { useState, useEffect } from 'react'
import { Share2, Link as LinkIcon, Lock, Users, Eye, Edit2, Check, X, Globe, MailPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSongs } from '@/components/SongsProvider'
import { useAuth } from '@/components/AuthProvider'

// A simple Dialog overlay and content (instead of full Shadcn imports)
function Dialog({ open, onClose, children }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6 animate-in zoom-in-95 duration-200">
                {children}
            </div>
        </div>
    )
}

export function ShareDialog({ open, onClose }) {
    const { activeSong, updateSong } = useSongs()
    const { user } = useAuth()
    const [copied, setCopied] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [newRole, setNewRole] = useState('viewer')
    const [saving, setSaving] = useState(false)

    // Local state for optimistic updates
    const [visibility, setVisibility] = useState('private')
    const [sharedEmails, setSharedEmails] = useState([])
    const [sharedRoles, setSharedRoles] = useState({})

    useEffect(() => {
        if (activeSong) {
            setVisibility(activeSong.visibility || 'private')
            setSharedEmails(activeSong.sharedEmails || [])
            setSharedRoles(activeSong.sharedRoles || {})
        }
    }, [activeSong])

    if (!activeSong) return null

    const handleCopy = () => {
        const url = `${window.location.origin}/s/${activeSong.shareId}`
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const handleVisibilityChange = async (e) => {
        const val = e.target.value
        setVisibility(val)
        await updateSong(activeSong.id, { visibility: val })
    }

    const handleAddCollaborator = async (e) => {
        e.preventDefault()
        if (!newEmail || !newEmail.includes('@')) return
        if (newEmail.toLowerCase() === user.email.toLowerCase()) return
        if (sharedEmails.includes(newEmail.toLowerCase())) return

        setSaving(true)
        const email = newEmail.toLowerCase()
        const updatedEmails = [...sharedEmails, email]
        const updatedRoles = { ...sharedRoles, [email]: newRole }

        setSharedEmails(updatedEmails)
        setSharedRoles(updatedRoles)

        try {
            await updateSong(activeSong.id, {
                sharedEmails: updatedEmails,
                sharedRoles: updatedRoles
            })
            setNewEmail('')
            setNewRole('viewer')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateRole = async (email, role) => {
        const updatedRoles = { ...sharedRoles, [email]: role }
        setSharedRoles(updatedRoles)
        await updateSong(activeSong.id, { sharedRoles: updatedRoles })
    }

    const handleRemoveCollaborator = async (email) => {
        const updatedEmails = sharedEmails.filter(e => e !== email)
        const updatedRoles = { ...sharedRoles }
        delete updatedRoles[email]

        setSharedEmails(updatedEmails)
        setSharedRoles(updatedRoles)

        await updateSong(activeSong.id, {
            sharedEmails: updatedEmails,
            sharedRoles: updatedRoles
        })
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold font-display">Share "{activeSong.title}"</h2>
                <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Visibility Settings */}
                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                        General Access
                    </label>
                    <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg border border-border/50">
                        <div className="flex items-center gap-3">
                            {visibility === 'private' && <Lock className="h-4 w-4 text-muted-foreground" />}
                            {visibility === 'unlisted' && <LinkIcon className="h-4 w-4 text-blue-500" />}
                            {visibility === 'public' && <Globe className="h-4 w-4 text-green-500" />}
                            <div>
                                <select
                                    className="bg-transparent text-sm font-medium outline-none cursor-pointer hover:underline appearance-none"
                                    value={visibility}
                                    onChange={handleVisibilityChange}
                                >
                                    <option value="private">Private</option>
                                    <option value="unlisted">Unlisted in Read-only</option>
                                    <option value="public">Public</option>
                                </select>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {visibility === 'private' && 'Only people added below can access'}
                                    {visibility === 'unlisted' && 'Anyone with the link can view'}
                                    {visibility === 'public' && 'Anyone on the internet can find and view'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Collaborator */}
                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                        Share with people
                    </label>
                    <form onSubmit={handleAddCollaborator} className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <MailPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="Add email address"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="pl-9 h-9"
                                required
                            />
                        </div>
                        <select
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm outline-none cursor-pointer focus:ring-1 focus:ring-ring"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                        >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                        </select>
                        <Button type="submit" size="sm" className="h-9 px-4" disabled={saving || !newEmail}>
                            Add
                        </Button>
                    </form>
                </div>

                {/* People List */}
                <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                        People with access
                    </label>
                    <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                        {/* Owner */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{user.email}</p>
                                    <p className="text-xs text-muted-foreground">Owner</p>
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">Owner</span>
                        </div>

                        {/* Collaborators */}
                        {sharedEmails.map((email) => (
                            <div key={email} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm">{email}</p>
                                </div>
                                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <select
                                        className="bg-transparent text-xs text-muted-foreground outline-none cursor-pointer hover:underline"
                                        value={sharedRoles[email] || 'viewer'}
                                        onChange={(e) => handleUpdateRole(email, e.target.value)}
                                    >
                                        <option value="viewer">Viewer</option>
                                        <option value="editor">Editor</option>
                                    </select>
                                    <button
                                        onClick={() => handleRemoveCollaborator(email)}
                                        className="p-1 hover:text-destructive text-muted-foreground transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Copy Link */}
                <div className="mt-6 pt-5 border-t border-border flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
                        {copied ? 'Link Copied' : 'Copy link'}
                    </Button>
                    <Button variant="default" size="sm" onClick={onClose}>
                        Done
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}
