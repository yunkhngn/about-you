import { useState } from 'react'
import { Search, Plus, Music2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const PLACEHOLDER_SONGS = [
    { id: '1', title: 'Untitled Song', updatedAt: 'Just now' },
    { id: '2', title: 'Midnight Blues', updatedAt: '2 hours ago' },
    { id: '3', title: 'Autumn Leaves', updatedAt: 'Yesterday' },
]

export function Sidebar({ className }) {
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState('1')

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
                <Button className="w-full justify-start gap-2" size="sm">
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
                <p className="px-2.5 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Recent
                </p>
                {PLACEHOLDER_SONGS.map((song) => (
                    <button
                        key={song.id}
                        onClick={() => setSelectedId(song.id)}
                        className={cn(
                            'w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer',
                            selectedId === song.id
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <FileText className="h-4 w-4 mt-0.5 shrink-0 opacity-60" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{song.title}</p>
                            <p className="text-[10px] text-muted-foreground">{song.updatedAt}</p>
                        </div>
                    </button>
                ))}
            </nav>
        </aside>
    )
}
