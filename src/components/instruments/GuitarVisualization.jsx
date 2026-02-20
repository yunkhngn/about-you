import { Chord, Note } from 'tonal'

// Common guitar chord voicings (standard tuning: E A D G B E)
// -1 = muted, 0 = open, 1-12 = fret number
const CHORD_VOICINGS = {
    // Basic Major
    'C': [[-1, 3, 2, 0, 1, 0], 0],
    'D': [[-1, -1, 0, 2, 3, 2], 0],
    'E': [[0, 2, 2, 1, 0, 0], 0],
    'F': [[1, 3, 3, 2, 1, 1], 0],
    'G': [[3, 2, 0, 0, 0, 3], 0],
    'A': [[-1, 0, 2, 2, 2, 0], 0],
    'B': [[-1, 2, 4, 4, 4, 2], 1],

    // Basic Minor
    'Cm': [[-1, 3, 5, 5, 4, 3], 2],
    'Dm': [[-1, -1, 0, 2, 3, 1], 0],
    'Em': [[0, 2, 2, 0, 0, 0], 0],
    'Fm': [[1, 3, 3, 1, 1, 1], 0],
    'Gm': [[3, 5, 5, 3, 3, 3], 2],
    'Am': [[-1, 0, 2, 2, 1, 0], 0],
    'Bm': [[-1, 2, 4, 4, 3, 2], 1],

    // Basic 7
    'C7': [[-1, 3, 2, 3, 1, 0], 0],
    'D7': [[-1, -1, 0, 2, 1, 2], 0],
    'E7': [[0, 2, 0, 1, 0, 0], 0],
    'F7': [[1, 3, 1, 2, 1, 1], 0],
    'G7': [[3, 2, 0, 0, 0, 1], 0],
    'A7': [[-1, 0, 2, 0, 2, 0], 0],
    'B7': [[-1, 2, 1, 2, 0, 2], 0],

    // Maj7
    'Cmaj7': [[-1, 3, 2, 0, 0, 0], 0],
    'Dmaj7': [[-1, -1, 0, 2, 2, 2], 0],
    'Emaj7': [[0, 2, 1, 1, 0, 0], 0],
    'Fmaj7': [[-1, -1, 3, 2, 1, 0], 0],
    'Gmaj7': [[3, 2, 0, 0, 0, 2], 0],
    'Amaj7': [[-1, 0, 2, 1, 2, 0], 0],
    'Bmaj7': [[-1, 2, 4, 3, 4, 2], 1], // Requested by user

    // Min7
    'Cm7': [[-1, 3, 5, 3, 4, 3], 2],
    'Dm7': [[-1, -1, 0, 2, 1, 1], 0],
    'Em7': [[0, 2, 2, 0, 3, 0], 0],
    'Fm7': [[1, 3, 1, 1, 1, 1], 0],
    'Gm7': [[3, 5, 3, 3, 3, 3], 2],
    'Am7': [[-1, 0, 2, 0, 1, 0], 0],
    'Bm7': [[-1, 2, 4, 2, 3, 2], 1],

    // Common Sharp/Flat Major
    'C#': [[-1, 4, 6, 6, 6, 4], 3],
    'Db': [[-1, 4, 6, 6, 6, 4], 3], // Enharmonic
    'Eb': [[-1, 6, 8, 8, 8, 6], 5],
    'F#': [[2, 4, 4, 3, 2, 2], 1],
    'Gb': [[2, 4, 4, 3, 2, 2], 1], // Enharmonic
    'Ab': [[4, 6, 6, 5, 4, 4], 3],
    'Bb': [[-1, 1, 3, 3, 3, 1], 0],

    // Common Sharp/Flat Minor
    'C#m': [[-1, 4, 6, 6, 5, 4], 3],
    'D#m': [[-1, 6, 8, 8, 7, 6], 5],
    'Ebm': [[-1, 6, 8, 8, 7, 6], 5],
    'F#m': [[2, 4, 4, 2, 2, 2], 1],
    'G#m': [[4, 6, 6, 4, 4, 4], 3],
    'Bbm': [[-1, 1, 3, 3, 2, 1], 0],

    // Diminished
    'Bdim': [[-1, 2, 3, 4, 3, -1], 1],
}

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e']
const FRET_COUNT = 5

export function GuitarVisualization({ chord }) {
    const voicing = chord ? CHORD_VOICINGS[chord] : null
    const frets = voicing ? voicing[0] : null
    const startFret = voicing ? voicing[1] : 0

    return (
        <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Guitar
            </p>
            <div className="bg-muted rounded-lg p-4">
                {!chord ? (
                    <div className="h-36 flex items-center justify-center">
                        <p className="text-[10px] text-muted-foreground">
                            Select a chord to visualize
                        </p>
                    </div>
                ) : !frets ? (
                    <div className="h-36 flex items-center justify-center">
                        <p className="text-[10px] text-muted-foreground">
                            No voicing for <span className="font-mono font-medium">{chord}</span>
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Chord name */}
                        <p className="text-center font-mono font-semibold text-primary text-sm mb-3">
                            {chord}
                        </p>

                        {/* Fretboard */}
                        <div className="relative mx-auto" style={{ width: '160px' }}>
                            {/* Fret number indicator */}
                            {startFret > 0 && (
                                <span className="absolute -left-5 top-3 text-[9px] text-muted-foreground font-mono">
                                    {startFret + 1}
                                </span>
                            )}

                            {/* Nut (only if starting at fret 0) */}
                            {startFret === 0 && (
                                <div className="h-1 bg-foreground/60 rounded-full mb-0.5" />
                            )}

                            {/* Strings & Frets grid */}
                            <div className="relative">
                                {/* Fret lines */}
                                {Array.from({ length: FRET_COUNT }).map((_, fretIdx) => (
                                    <div key={fretIdx} className="flex border-b border-foreground/20" style={{ height: '24px' }}>
                                        {/* String lines */}
                                        {Array.from({ length: 6 }).map((_, strIdx) => (
                                            <div
                                                key={strIdx}
                                                className="flex-1 border-r border-foreground/15 relative"
                                            >
                                                {/* Finger dot */}
                                                {frets[strIdx] === fretIdx + startFret + 1 && (
                                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                                        <span className="text-[8px] text-primary-foreground font-bold">
                                                            {frets[strIdx]}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Open/Muted indicators */}
                            <div className="flex mt-1.5">
                                {frets.map((fret, i) => (
                                    <div key={i} className="flex-1 text-center">
                                        <span className="text-[9px] text-muted-foreground font-mono">
                                            {fret === 0 ? 'O' : fret === -1 ? '×' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* String labels */}
                            <div className="flex mt-0.5">
                                {STRING_LABELS.map((label, i) => (
                                    <div key={i} className="flex-1 text-center">
                                        <span className="text-[8px] text-muted-foreground/50">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
