import { useState } from 'react'
import { X, Search, Plus, Music2, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useSongs } from '@/components/SongsProvider'
import { useAuth } from '@/components/AuthProvider'
import { cn } from '@/lib/utils'

export function Sidebar({ className, isOpen, onClose }) {
    const { songs, activeSongId, setActiveSongId, createSong, deleteSong, loading } = useSongs()
    const { user } = useAuth()
    const [search, setSearch] = useState('')
    const [deleteTarget, setDeleteTarget] = useState(null)

    const filteredSongs = songs.filter((song) =>
        song.title.toLowerCase().includes(search.toLowerCase())
    )

    const formatTime = (timestamp) => {
        if (!timestamp) return 'Just now'
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
            if (isNaN(date.getTime())) return 'Just now'
            const now = new Date()
            const diff = now - date
            if (diff < 60000) return 'Just now'
            if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
            if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
            return date.toLocaleDateString()
        } catch {
            return 'Just now'
        }
    }

    const handleConfirmDelete = () => {
        if (deleteTarget) {
            deleteSong(deleteTarget)
            setDeleteTarget(null)
        }
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex flex-col h-full w-72 md:w-64 border-r border-border bg-card transform transition-transform duration-300 ease-in-out md:relative md:transform-none',
                    isOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full md:translate-x-0',
                    className
                )}
            >
                {/* Logo and Mobile Close */}
                <div className="px-5 py-6 border-b border-border flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <Music2 className="h-5 w-5 text-primary" />
                            <h1 className="text-lg font-display font-semibold tracking-tight">
                                About You
                            </h1>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Songwriting workspace
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* New Song + Search */}
                <div className="p-4 space-y-3">
                    <Button
                        className="w-full justify-start gap-2"
                        size="sm"
                        onClick={createSong}
                    >
                        <Plus className="h-4 w-4" />
                        New Song
                    </Button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search songs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 text-xs"
                        />
                    </div>
                </div>

                {/* Song List */}
                <nav className="flex-1 overflow-y-auto px-3 pb-4">
                    {loading ? (
                        <p className="px-2.5 py-4 text-xs text-muted-foreground text-center">Loading songs...</p>
                    ) : filteredSongs.length === 0 ? (
                        <p className="px-2.5 py-4 text-xs text-muted-foreground text-center">
                            {search ? 'No songs found' : 'No songs yet'}
                        </p>
                    ) : (
                        <>
                            <p className="px-2.5 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Songs · {filteredSongs.length}
                            </p>
                            {filteredSongs.map((song) => (
                                <div
                                    key={song.id}
                                    className={cn(
                                        'group w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer',
                                        activeSongId === song.id
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    )}
                                    onClick={() => {
                                        setActiveSongId(song.id)
                                        if (window.innerWidth < 768) onClose()
                                    }}
                                >
                                    <FileText className="h-4 w-4 mt-0.5 shrink-0 opacity-60" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">{song.title}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            {song.ownerId !== user?.uid && (
                                                <span className="text-[9px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-1 rounded-sm">Shared</span>
                                            )}
                                            <p className="text-[10px] text-muted-foreground">{formatTime(song.updatedAt)}</p>
                                        </div>
                                    </div>
                                    {song.ownerId === user?.uid && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteTarget(song.id)
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive cursor-pointer"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </nav>
            </aside>

            {/* Delete confirmation modal */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete song"
                message="Are you sure you want to delete this song? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </>
    )
}
