import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSongByShareId } from '@/lib/db'
import { Music2, Loader2, Lock, ArrowLeft } from 'lucide-react'
import { detectKey, extractChords } from '@/lib/music/engine'
import { Button } from '@/components/ui/button'

export default function SharedSongPage() {
    const { shareId } = useParams()
    const [song, setSong] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!shareId) return

        getSongByShareId(shareId)
            .then((data) => {
                if (!data) {
                    setError('Song not found')
                } else if (data.visibility === 'private') {
                    setError('This song is private')
                } else {
                    setSong(data)
                }
            })
            .catch(() => setError('Failed to load song'))
            .finally(() => setLoading(false))
    }, [shareId])

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h2 className="font-display text-xl font-semibold mb-2">{error}</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        This song might be private or may have been deleted.
                    </p>
                    <Link to="/">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-1.5" />
                            Go to About You
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Parse content
    let lines = []
    try {
        lines = JSON.parse(song.content || '[]')
    } catch {
        lines = (song.content || '').split('\n').map((l) => ({ lyrics: l, chords: [] }))
    }

    const chords = extractChords(lines)
    const detectedKey = detectKey(chords)

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Music2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-display font-medium">About You</span>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        Read-only
                    </span>
                </div>
            </header>

            {/* Song content */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="font-display text-3xl font-semibold mb-2">
                    {song.title || 'Untitled Song'}
                </h1>
                <p className="text-sm text-muted-foreground mb-10">
                    {detectedKey ? `Key of ${detectedKey.split(' ')[0]}` : 'Unknown key'}
                    {' · '}
                    {song.tempo || 120} BPM
                    {song.capo > 0 ? ` · Capo ${song.capo}` : ''}
                </p>

                {/* Lines */}
                <div className="space-y-1">
                    {lines.map((line, i) => (
                        <div key={i}>
                            {/* Chords */}
                            {line.chords?.length > 0 && (
                                <div className="h-5 relative">
                                    {line.chords.map((chord, j) => (
                                        <span
                                            key={j}
                                            className="absolute font-mono text-xs font-semibold text-chord"
                                            style={{ left: chord.position }}
                                        >
                                            {chord.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {/* Lyrics */}
                            {line.lyrics && (
                                <p className="text-foreground leading-relaxed">{line.lyrics}</p>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border mt-16">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        Shared with About You
                    </p>
                    <Link to="/" className="text-xs text-primary hover:underline">
                        Create your own songs →
                    </Link>
                </div>
            </footer>
        </div>
    )
}
