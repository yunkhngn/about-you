import { Note } from 'tonal'
import { getChordNotes } from '@/lib/music/engine'
import { cn } from '@/lib/utils'

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const BLACK_NOTE_MAP = {
    'C': 'C#', 'D': 'D#', 'F': 'F#', 'G': 'G#', 'A': 'A#',
}
// Offset positions for black keys (relative to their white key)
const BLACK_KEY_OFFSETS = { 'C#': 0, 'D#': 1, 'F#': 3, 'G#': 4, 'A#': 5 }

export function PianoVisualization({ chord, onPlayNote }) {
    const highlightNotes = chord ? getChordNotes(chord) : []

    // Normalize notes (strip octave, use enharmonic)
    const highlightSet = new Set(
        highlightNotes.map((n) => Note.pitchClass(n))
    )

    const isHighlighted = (noteName) => {
        if (highlightSet.size === 0) return false
        // Check both the note and its enharmonic
        return highlightSet.has(noteName) || highlightSet.has(Note.enharmonic(noteName))
    }

    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Piano
            </p>
            <div className="relative bg-muted rounded-lg p-3 pb-4">
                {/* White keys */}
                <div className="flex gap-[2px] justify-center">
                    {WHITE_NOTES.map((note) => {
                        const highlighted = isHighlighted(note)
                        return (
                            <button
                                key={note}
                                onClick={() => onPlayNote?.(`${note}4`)}
                                className={cn(
                                    'w-8 h-20 rounded-b-md border transition-all duration-150 cursor-pointer',
                                    highlighted
                                        ? 'bg-primary/20 border-primary/40 shadow-sm shadow-primary/20'
                                        : 'bg-background border-border hover:bg-accent'
                                )}
                            >
                                <span className={cn(
                                    'text-[9px] block mt-14',
                                    highlighted ? 'text-primary font-semibold' : 'text-muted-foreground'
                                )}>
                                    {note}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Black keys overlay */}
                <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="relative" style={{ width: `${WHITE_NOTES.length * 34 - 2}px` }}>
                        {Object.entries(BLACK_NOTE_MAP).map(([white, black]) => {
                            const highlighted = isHighlighted(black)
                            const idx = WHITE_NOTES.indexOf(white)
                            const leftPos = idx * 34 + 22

                            return (
                                <button
                                    key={black}
                                    onClick={() => onPlayNote?.(`${black}4`)}
                                    className={cn(
                                        'absolute w-5 h-12 rounded-b-sm transition-all duration-150 pointer-events-auto cursor-pointer z-10',
                                        highlighted
                                            ? 'bg-primary shadow-md shadow-primary/30'
                                            : 'bg-foreground/80 hover:bg-foreground/70'
                                    )}
                                    style={{ left: `${leftPos}px` }}
                                />
                            )
                        })}
                    </div>
                </div>

                {!chord && (
                    <p className="text-center text-[10px] text-muted-foreground mt-2">
                        Select a chord to visualize
                    </p>
                )}
                {chord && (
                    <p className="text-center text-[10px] text-muted-foreground mt-2">
                        <span className="font-mono font-medium text-primary">{chord}</span> — {highlightNotes.join(', ')}
                    </p>
                )}
            </div>
        </div>
    )
}
