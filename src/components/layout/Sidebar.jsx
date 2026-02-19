import { useState } from 'react'
import { Search, Plus, Music2, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSongs } from '@/components/SongsProvider'
import { cn } from '@/lib/utils'

export function Sidebar({ className }) {
    const { songs, activeSongId, setActiveSongId, createSong, deleteSong, loading } = useSongs()
    const [search, setSearch] = useState('')

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
        } catch (error) {
            // Handle cases where timestamp might be invalid or not fully resolved yet
            return 'Just now'
        }
    }

    return (
        <aside
            className={cn(
                'flex flex-col h-full w-64 border-r border-border bg-card',
                className
            )}
        >
            {/* Logo */}
            <div className="px-5 py-6 border-b border-border">
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
                                onClick={() => setActiveSongId(song.id)}
                            >
                                <FileText className="h-4 w-4 mt-0.5 shrink-0 opacity-60" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{song.title}</p>
                                    <p className="text-[10px] text-muted-foreground">{formatTime(song.updatedAt)}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm('Delete this song?')) deleteSong(song.id)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive cursor-pointer"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </nav>
        </aside>
    )
}
