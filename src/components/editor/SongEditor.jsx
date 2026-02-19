import { useState, useRef, useCallback, useEffect } from 'react'
import { useSongs } from '@/components/SongsProvider'
import { cn } from '@/lib/utils'

/**
 * Chord insertion popover
 */
function ChordPopover({ position, onInsert, onClose }) {
    const [chord, setChord] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && chord.trim()) {
            e.preventDefault()
            onInsert(chord.trim())
        } else if (e.key === 'Escape') {
            onClose()
        }
    }

    return (
        <div
            className="absolute z-50 bg-card border border-border rounded-lg shadow-lg p-2"
            style={{ left: position.x, top: position.y - 40 }}
        >
            <input
                ref={inputRef}
                value={chord}
                onChange={(e) => setChord(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={onClose}
                placeholder="Chord..."
                className="w-20 h-7 text-xs font-mono bg-transparent border border-input rounded px-2 focus:outline-none focus:ring-1 focus:ring-ring"
            />
        </div>
    )
}

/**
 * An uncontrolled contentEditable line — React never re-renders its text content.
 * We only read from it via onInput, and set it imperatively on mount / song switch.
 */
function EditableLine({ initialText, onTextChange, onDoubleClick, onKeyDown }) {
    const ref = useRef(null)
    const mountedText = useRef(initialText)

    // Set text only when the initial text identity changes (song switch)
    useEffect(() => {
        if (ref.current && initialText !== mountedText.current) {
            ref.current.textContent = initialText || ''
            mountedText.current = initialText
        }
    }, [initialText])

    // Set text on first mount
    useEffect(() => {
        if (ref.current) {
            ref.current.textContent = initialText || ''
        }
    }, [])

    return (
        <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            onInput={() => {
                const text = ref.current?.textContent || ''
                mountedText.current = text
                onTextChange(text)
            }}
            onDoubleClick={onDoubleClick}
            onKeyDown={onKeyDown}
            className="min-h-[1.75rem] text-foreground leading-relaxed outline-none whitespace-pre-wrap"
            style={{ caretColor: 'var(--primary)' }}
        />
    )
}

/**
 * Renders a single line with chords above
 */
function EditorLine({ line, chords = [], onLyricChange, onAddChord, onRemoveChord, lineIndex, onKeyDown }) {
    const lineRef = useRef(null)
    const [popover, setPopover] = useState(null)

    const handleDoubleClick = (e) => {
        const rect = lineRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        setPopover({ x, y: 0 })
    }

    const handleInsertChord = (chordName) => {
        if (popover) {
            onAddChord(lineIndex, popover.x, chordName)
            setPopover(null)
        }
    }

    return (
        <div className="relative group" ref={lineRef}>
            {/* Chord line */}
            <div className="h-5 relative select-none">
                {chords.map((chord, i) => (
                    <span
                        key={i}
                        className="absolute font-mono text-xs font-semibold text-chord cursor-pointer hover:text-primary transition-colors"
                        style={{ left: chord.position }}
                        onDoubleClick={(e) => { e.stopPropagation(); onRemoveChord(lineIndex, i) }}
                        title="Double-click to remove"
                    >
                        {chord.name}
                    </span>
                ))}
            </div>

            {/* Lyric line — uncontrolled */}
            <EditableLine
                initialText={line}
                onTextChange={(text) => onLyricChange(lineIndex, text)}
                onDoubleClick={handleDoubleClick}
                onKeyDown={onKeyDown}
            />

            {/* Chord insertion popover */}
            {popover && (
                <ChordPopover
                    position={popover}
                    onInsert={handleInsertChord}
                    onClose={() => setPopover(null)}
                />
            )}

            {/* Hint on hover */}
            <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground">
                dbl-click for chord
            </div>
        </div>
    )
}

/**
 * Parse song content to structured lines
 */
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

function serializeContent(lines) {
    return JSON.stringify(lines)
}

export function SongEditor({ className }) {
    const { activeSong, updateSong } = useSongs()
    const [lines, setLines] = useState([{ lyrics: '', chords: [] }])
    const [title, setTitle] = useState('')
    const prevSongId = useRef(null)

    // Load song content when active song changes
    useEffect(() => {
        if (activeSong && activeSong.id !== prevSongId.current) {
            prevSongId.current = activeSong.id
            setTitle(activeSong.title || 'Untitled Song')
            setLines(parseContent(activeSong.content))
        } else if (!activeSong) {
            prevSongId.current = null
            setTitle('')
            setLines([{ lyrics: '', chords: [] }])
        }
    }, [activeSong?.id])

    const handleTitleChange = useCallback((newTitle) => {
        setTitle(newTitle)
        if (activeSong) {
            updateSong(activeSong.id, { title: newTitle })
        }
    }, [activeSong, updateSong])

    const handleLyricChange = useCallback((lineIndex, text) => {
        setLines((prev) => {
            const updated = [...prev]
            updated[lineIndex] = { ...updated[lineIndex], lyrics: text }

            if (activeSong) {
                updateSong(activeSong.id, { content: serializeContent(updated) })
            }
            return updated
        })
    }, [activeSong, updateSong])

    const handleAddChord = useCallback((lineIndex, positionPx, chordName) => {
        setLines((prev) => {
            const updated = [...prev]
            const line = { ...updated[lineIndex] }
            line.chords = [...line.chords, { position: positionPx, name: chordName }]
            line.chords.sort((a, b) => a.position - b.position)
            updated[lineIndex] = line

            if (activeSong) {
                updateSong(activeSong.id, { content: serializeContent(updated) })
            }
            return updated
        })
    }, [activeSong, updateSong])

    const handleRemoveChord = useCallback((lineIndex, chordIndex) => {
        setLines((prev) => {
            const updated = [...prev]
            const line = { ...updated[lineIndex] }
            line.chords = line.chords.filter((_, i) => i !== chordIndex)
            updated[lineIndex] = line

            if (activeSong) {
                updateSong(activeSong.id, { content: serializeContent(updated) })
            }
            return updated
        })
    }, [activeSong, updateSong])

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            setLines((prev) => {
                const updated = [...prev, { lyrics: '', chords: [] }]
                if (activeSong) {
                    updateSong(activeSong.id, { content: serializeContent(updated) })
                }
                return updated
            })
            // Focus the new line after render
            setTimeout(() => {
                const editors = document.querySelectorAll('[contenteditable]')
                const lastEditor = editors[editors.length - 1]
                lastEditor?.focus()
            }, 0)
        }
    }, [activeSong, updateSong])

    if (!activeSong) {
        return (
            <main className={cn('flex-1 flex flex-col items-center justify-center bg-editor-surface', className)}>
                <div className="text-center">
                    <p className="text-lg font-display text-muted-foreground mb-2">No song selected</p>
                    <p className="text-sm text-muted-foreground">Create a new song or select one from the sidebar</p>
                </div>
            </main>
        )
    }

    return (
        <main
            className={cn(
                'flex-1 flex flex-col items-center overflow-y-auto bg-editor-surface',
                className
            )}
        >
            <div className="w-full max-w-2xl px-10 py-16">
                {/* Song Title */}
                <input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full font-display text-3xl font-semibold text-foreground bg-transparent border-none outline-none placeholder:text-foreground/30 mb-1"
                    placeholder="Song title..."
                />
                <p className="text-sm text-muted-foreground mb-10">
                    {activeSong.key ? `Key of ${activeSong.key}` : 'No key detected'}
                    {' · '}
                    {activeSong.tempo || 120} BPM
                    {activeSong.capo > 0 ? ` · Capo ${activeSong.capo}` : ' · No capo'}
                </p>

                {/* Editor Lines */}
                <div className="space-y-1">
                    {lines.map((line, i) => (
                        <EditorLine
                            key={`${activeSong.id}-${i}`}
                            line={line.lyrics}
                            chords={line.chords}
                            lineIndex={i}
                            onLyricChange={handleLyricChange}
                            onAddChord={handleAddChord}
                            onRemoveChord={handleRemoveChord}
                            onKeyDown={handleKeyDown}
                        />
                    ))}
                </div>

                {/* Helper text */}
                <div className="mt-16 flex items-center gap-1.5 opacity-30">
                    <div className="w-0.5 h-5 bg-foreground animate-pulse" />
                    <span className="text-xs text-muted-foreground">
                        Double-click on a line to add a chord · Enter for new line
                    </span>
                </div>
            </div>
        </main>
    )
}
