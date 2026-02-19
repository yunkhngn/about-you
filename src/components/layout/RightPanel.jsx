import { useState, useMemo, useCallback } from 'react'
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
    transposeChord,
} from '@/lib/music/engine'
import { playChordByName, playNote } from '@/lib/music/audio'
import { cn } from '@/lib/utils'

export function RightPanel({ className }) {
    const [tab, setTab] = useState('chords')
    const [selectedChord, setSelectedChord] = useState(null)
    const [transpose, setTranspose] = useState(0)
    const { activeSong, updateSong } = useSongs()

    // Parse content and extract chords
    const lines = useMemo(() => {
        if (!activeSong?.content) return []
        try {
            return JSON.parse(activeSong.content)
        } catch {
            return []
        }
    }, [activeSong?.content])

    const chords = useMemo(() => extractChords(lines), [lines])

    // Detect key
    const detectedKey = useMemo(() => detectKey(chords), [chords])
    const keyChords = useMemo(() => getChordsInKey(detectedKey), [detectedKey])
    const scaleNotes = useMemo(() => getScaleNotes(detectedKey), [detectedKey])

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
                'w-72 border-l border-border bg-card flex flex-col h-full overflow-y-auto',
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
                        <TabsTrigger value="instruments">
                            <Piano className="h-3.5 w-3.5 mr-1.5" />
                            Instrument
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
                            {chords.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                        Used Chords
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {chords.map((chord) => (
                                            <button
                                                key={chord}
                                                onClick={() => handleChordClick(chord)}
                                                className={cn(
                                                    'h-8 px-3 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer',
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
                        </div>
                    </TabsContent>

                    <TabsContent value="instruments">
                        <div className="pt-5 space-y-5">
                            <PianoVisualization chord={selectedChord} onPlayNote={handlePlayNote} />
                            <GuitarVisualization chord={selectedChord} onPlayNote={handlePlayNote} />

                            {!selectedChord && (
                                <p className="text-xs text-muted-foreground text-center italic mt-2">
                                    Click a chord in the Chords tab to visualize it
                                </p>
                            )}
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
