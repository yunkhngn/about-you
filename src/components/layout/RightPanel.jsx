import { useState, useMemo, useCallback, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Music, Piano, Info } from 'lucide-react'
import { PianoVisualization } from '@/components/instruments/PianoVisualization'
import { GuitarVisualization } from '@/components/instruments/GuitarVisualization'
import { useSongs } from '@/components/SongsProvider'
import {
    detectKey,
    getChordsInKey,
    getScaleNotes,
    extractChords,
    transposeContent,
} from '@/lib/music/engine'
import { playChordByName, playNote } from '@/lib/music/audio'
import { cn } from '@/lib/utils'

// Helper to parse song content
function parseContent(content) {
    if (!content) return [{ lyrics: '', chords: [] }]
    try {
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
    } catch {
        return content.split('\n').map((line) => ({ lyrics: line, chords: [] }))
    }
    return [{ lyrics: '', chords: [] }]
}

export function RightPanel({ className }) {
    const [tab, setTab] = useState('chords')
    const [selectedChord, setSelectedChord] = useState(null)
    const [transpose, setTranspose] = useState(0)
    const { activeSong, updateSong } = useSongs()

    // Parse content and extract chords
    const lines = useMemo(() => {
        return parseContent(activeSong?.content)
    }, [activeSong?.content])

    const { allChords, keyChords, detectedKey, scaleNotes } = useMemo(() => {
        const extractedChords = extractChords(lines)
        const key = detectKey(extractedChords)
        if (!key) return { allChords: extractedChords, keyChords: [], detectedKey: null, scaleNotes: [] }

        return {
            allChords: extractedChords,
            keyChords: getChordsInKey(key),
            detectedKey: key,
            scaleNotes: getScaleNotes(key)
        }
    }, [lines])

    // Sync detected key to database
    useEffect(() => {
        if (activeSong && detectedKey && activeSong.key !== detectedKey) {
            updateSong(activeSong.id, { key: detectedKey })
        }
    }, [detectedKey, activeSong, updateSong])

    // Handle chord click
    const handleChordClick = useCallback((chord) => {
        setSelectedChord(chord)
        playChordByName(chord)
    }, [])

    // Handle transpose
    const handleTranspose = useCallback((delta) => {
        const newTranspose = transpose + delta
        setTranspose(newTranspose)
        if (activeSong?.content) {
            try {
                const originalLines = JSON.parse(activeSong.content)
                const transposed = transposeContent(originalLines, newTranspose)
                updateSong(activeSong.id, { content: JSON.stringify(transposed) })
            } catch { /* ignore */ }
        }
    }, [transpose, activeSong, updateSong])

    const handlePlayNote = useCallback((note) => {
        playNote(note)
    }, [])

    return (
        <aside
            className={cn(
                'w-96 border-l border-border bg-card flex flex-col h-full overflow-y-auto',
                className
            )}
        >
            <div className="p-4">
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList>
                        <TabsTrigger value="chords">
                            <Music className="h-3.5 w-3.5 mr-1.5" />
                            Chords
                        </TabsTrigger>
                        <TabsTrigger value="info">
                            <Info className="h-3.5 w-3.5 mr-1.5" />
                            Info
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="chords">
                        <div className="pt-5 space-y-5">
                            {/* Key indicator */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                    Detected Key
                                </p>
                                {detectedKey ? (
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-mono font-semibold text-lg">
                                            {detectedKey.split(' ')[0]}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium capitalize">{detectedKey}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {scaleNotes.join(' · ')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">
                                        Add chords to detect key
                                    </p>
                                )}
                            </div>

                            {/* Chords in key */}
                            {keyChords.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                        Chords in Key
                                    </p>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {keyChords.map((chord) => (
                                            <button
                                                key={chord}
                                                onClick={() => handleChordClick(chord)}
                                                className={cn(
                                                    'h-9 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer',
                                                    selectedChord === chord
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted hover:bg-chord-highlight text-foreground'
                                                )}
                                            >
                                                {chord}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Song chords */}
                            {allChords.length > 0 && (
                                <div className="mt-6 border-t border-border pt-6">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                        Used in Song
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {allChords.length > 0 ? (
                                            allChords.map((chord) => (
                                                <button
                                                    key={chord}
                                                    onClick={() => handleChordClick(chord)}
                                                    className={cn(
                                                        'h-8 px-3 rounded text-xs font-mono transition-colors cursor-pointer',
                                                        selectedChord === chord
                                                            ? 'bg-primary text-primary-foreground font-semibold'
                                                            : 'bg-muted hover:bg-chord-highlight text-foreground font-medium'
                                                    )}
                                                >
                                                    {chord}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">
                                                No chords found in song
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Transpose */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                    Transpose
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleTranspose(-1)}
                                        className="h-8 w-8 rounded-md bg-muted hover:bg-accent text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        −
                                    </button>
                                    <span className="text-sm font-mono font-medium w-8 text-center">
                                        {transpose > 0 ? `+${transpose}` : transpose}
                                    </span>
                                    <button
                                        onClick={() => handleTranspose(1)}
                                        className="h-8 w-8 rounded-md bg-muted hover:bg-accent text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Instruments Visualizations */}
                            <div className="pt-6 border-t border-border mt-6 space-y-5">
                                <PianoVisualization chord={selectedChord} onPlayNote={handlePlayNote} />
                                <GuitarVisualization chord={selectedChord} onPlayNote={handlePlayNote} />

                                {!selectedChord && (
                                    <p className="text-xs text-muted-foreground text-center italic mt-2">
                                        Click a chord above to visualize it
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="info">
                        <div className="pt-5 space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Title</p>
                                <p className="text-sm font-medium">{activeSong?.title || 'No song selected'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Key</p>
                                <p className="text-sm font-medium font-mono capitalize">
                                    {detectedKey || 'Unknown'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Tempo</p>
                                <input
                                    type="number"
                                    value={activeSong?.tempo || 120}
                                    onChange={(e) => activeSong && updateSong(activeSong.id, { tempo: parseInt(e.target.value) || 120 })}
                                    className="text-sm font-medium font-mono bg-transparent border-b border-input outline-none w-20 focus:border-primary"
                                />
                                <span className="text-sm text-muted-foreground ml-1">BPM</span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Capo</p>
                                <input
                                    type="number"
                                    min="0"
                                    max="12"
                                    value={activeSong?.capo || 0}
                                    onChange={(e) => activeSong && updateSong(activeSong.id, { capo: parseInt(e.target.value) || 0 })}
                                    className="text-sm font-medium font-mono bg-transparent border-b border-input outline-none w-16 focus:border-primary"
                                />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Visibility</p>
                                <select
                                    value={activeSong?.visibility || 'private'}
                                    onChange={(e) => activeSong && updateSong(activeSong.id, { visibility: e.target.value })}
                                    className="text-sm font-medium bg-transparent border-b border-input outline-none cursor-pointer focus:border-primary"
                                >
                                    <option value="private">Private</option>
                                    <option value="unlisted">Unlisted</option>
                                    <option value="public">Public</option>
                                </select>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Share ID</p>
                                <p className="text-sm font-mono text-muted-foreground">
                                    {activeSong?.shareId || '—'}
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </aside>
    )
}
