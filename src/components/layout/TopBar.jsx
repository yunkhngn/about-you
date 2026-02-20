import { useState } from 'react'
import { Save, Download, Share2, Moon, Sun, LogOut, Loader2, Check, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'
import { useSongs } from '@/components/SongsProvider'
import { exportSongPDF } from '@/lib/export/pdf'
import { ProfileDialog } from '@/components/auth/ProfileDialog'
import { ShareDialog } from '@/components/share/ShareDialog'
import { cn } from '@/lib/utils'

const STATUS_MAP = {
    saved: { icon: Save, text: 'Saved', className: 'text-muted-foreground' },
    saving: { icon: Loader2, text: 'Saving...', className: 'text-muted-foreground animate-pulse' },
    unsaved: { icon: Save, text: 'Unsaved', className: 'text-yellow-500' },
}

export function TopBar({ className }) {
    const { theme, toggleTheme } = useTheme()
    const { user, signOut } = useAuth()
    const { activeSong, saveStatus, isReadOnly } = useSongs()
    const [exporting, setExporting] = useState(false)
    const [shareOpen, setShareOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    const status = STATUS_MAP[saveStatus] || STATUS_MAP.saved
    const StatusIcon = status.icon

    const handleExport = async () => {
        if (!activeSong || exporting) return
        setExporting(true)
        try {
            await exportSongPDF(activeSong)
        } catch (err) {
            console.error('Export failed:', err)
        } finally {
            setExporting(false)
        }
    }

    const handleShare = () => {
        if (!activeSong?.shareId) return
        setShareOpen(true)
    }

    return (
        <>
            <header
                className={cn(
                    'h-14 border-b border-border bg-card flex items-center justify-between px-5',
                    className
                )}
            >
                {/* Left: Save status / Read-only badge */}
                <div className="flex items-center gap-3">
                    {activeSong && isReadOnly ? (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border/50">
                            Read-only
                        </span>
                    ) : (
                        <div className={cn('flex items-center gap-1.5', status.className)}>
                            <StatusIcon className={cn('h-3.5 w-3.5', saveStatus === 'saving' && 'animate-spin')} />
                            <span className="text-xs">{status.text}</span>
                        </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-xs h-8 px-2 font-normal text-muted-foreground hover:text-foreground hidden sm:flex"
                        onClick={() => setProfileOpen(true)}
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className="h-5 w-5 rounded-full object-cover" />
                        ) : (
                            <User className="h-3.5 w-3.5" />
                        )}
                        {user?.displayName || user?.email}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs h-8"
                        onClick={handleExport}
                        disabled={!activeSong || exporting}
                    >
                        {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        Export
                    </Button>
                    {!isReadOnly && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 text-xs h-8"
                            onClick={handleShare}
                            disabled={!activeSong}
                        >
                            <Share2 className="h-3.5 w-3.5" />
                            Share
                        </Button>
                    )}
                    <div className="w-px h-5 bg-border mx-1" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={signOut}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
            <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
        </>
    )
}
