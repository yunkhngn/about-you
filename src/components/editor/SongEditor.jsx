import { useState, useRef, useCallback, useEffect } from 'react'
import { useSongs } from '@/components/SongsProvider'
import { playChordByName } from '@/lib/music/audio'
import { cn } from '@/lib/utils'

/**
 * Chord insertion/editing popover
 */
function ChordPopover({ position, initialValue = '', onSave, onClose }) {
    const [chord, setChord] = useState(initialValue)
    const inputRef = useRef(null)

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            onSave(chord.trim())
        } else if (e.key === 'Escape') {
            onClose()
        }
    }

    return (
        <div
            className="absolute z-50 bg-card border border-border rounded-lg shadow-lg p-2"
            style={{ left: position.x, top: position.y - 40 }}
            onClick={(e) => e.stopPropagation()}
        >
            <input
                ref={inputRef}
                value={chord}
                onChange={(e) => setChord(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => onSave(chord.trim())}
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

    // Set text only when the initial text identity changes (song switch or explicit update from parent merge)
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
function EditorLine({ line, chords = [], onLyricChange, onAddChord, onEditChord, lineIndex, onKeyDown }) {
    const lineRef = useRef(null)
    const [popover, setPopover] = useState(null)

    const handleDoubleClick = (e) => {
        if (e.target.closest('.chord-span')) return
        const rect = lineRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        setPopover({ x, y: 0, mode: 'add' })
    }

    const handleSaveChord = (chordName) => {
        if (popover) {
            if (popover.mode === 'add') {
                if (chordName) onAddChord(lineIndex, popover.x, chordName)
            } else if (popover.mode === 'edit') {
                onEditChord(lineIndex, popover.chordIndex, chordName)
            }
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
                        className="chord-span absolute font-mono text-xs font-semibold text-chord cursor-pointer hover:text-primary transition-colors z-10"
                        style={{ left: chord.position }}
                        onClick={(e) => {
                            e.stopPropagation()
                            playChordByName(chord.name)
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation()
                            setPopover({ x: chord.position, y: 0, mode: 'edit', chordIndex: i, initialValue: chord.name })
                        }}
                        title="Click to play, Double-click to edit"
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
                onKeyDown={(e) => onKeyDown(e, lineIndex)}
            />

            {/* Chord insertion popover */}
            {popover && (
                <ChordPopover
                    position={popover}
                    initialValue={popover.initialValue}
                    onSave={handleSaveChord}
                    onClose={() => setPopover(null)}
                />
            )}

            {/* Hint on hover */}
            <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground pointer-events-none">
                dbl-click space for chord
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

/**
 * Get visual width of text to calculate chord offset during merge
 */
function getTextWidth(text, element) {
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    const computedStyle = window.getComputedStyle(element);
    context.font = computedStyle.font;
    return context.measureText(text).width;
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

    // Sync to parent/DB helper
    const saveLines = useCallback((newLines) => {
        if (activeSong) {
            updateSong(activeSong.id, { content: serializeContent(newLines) })
        }
    }, [activeSong, updateSong])

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
            saveLines(updated)
            return updated
        })
    }, [saveLines])

    const handleAddChord = useCallback((lineIndex, positionPx, chordName) => {
        setLines((prev) => {
            const updated = [...prev]
            const line = { ...updated[lineIndex] }
            line.chords = [...line.chords, { position: positionPx, name: chordName }]
            line.chords.sort((a, b) => a.position - b.position)
            updated[lineIndex] = line
            saveLines(updated)
            return updated
        })
    }, [saveLines])

    const handleEditChord = useCallback((lineIndex, chordIndex, newName) => {
        setLines((prev) => {
            const updated = [...prev]
            const line = { ...updated[lineIndex] }

            if (!newName || newName.trim() === '') {
                // Delete if empty
                line.chords = line.chords.filter((_, i) => i !== chordIndex)
            } else {
                // Update name
                const chords = [...line.chords]
                chords[chordIndex] = { ...chords[chordIndex], name: newName }
                line.chords = chords
            }

            updated[lineIndex] = line
            saveLines(updated)
            return updated
        })
    }, [saveLines])

    const handleRemoveChord = useCallback((lineIndex, chordIndex) => { // Kept for history compatibility if needed
        handleEditChord(lineIndex, chordIndex, '')
    }, [handleEditChord])

    const handleKeyDown = useCallback((e, lineIndex) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            // Split line logic or just new line? For now new line at end.
            // Ideally enter splits the line. But user asked for BACKSPACE merge specifically.
            // Let's stick to simple "Append new line" for Enter to keep it stable, or implement split?
            // User complaint was about *backspace*.

            setLines((prev) => {
                const updated = [...prev]
                // Insert new line after current
                updated.splice(lineIndex + 1, 0, { lyrics: '', chords: [] })
                saveLines(updated)
                // Focus is handled by effect or timeout
                setTimeout(() => {
                    const editors = document.querySelectorAll('[contenteditable]')
                    const nextEditor = editors[lineIndex + 1]
                    nextEditor?.focus()
                }, 0)
                return updated
            })
        } else if (e.key === 'Backspace') {
            const selection = window.getSelection()
            // If cursor is at start of line (offset 0) and it's collapsed
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                if (range.collapsed && range.startOffset === 0 && lineIndex > 0) {
                    e.preventDefault()

                    setLines((prev) => {
                        const current = prev[lineIndex]
                        const previous = prev[lineIndex - 1]
                        const previousTextWidth = getTextWidth(previous.lyrics, e.target) // Measure using the DOM element font

                        // Merge lyrics
                        const mergedLyrics = previous.lyrics + current.lyrics

                        // Shift current chords by previous text width
                        // This is an approximation since we don't know exact pixel width of formatted text easily without DOM
                        // But we use the helper.
                        const shiftedChords = current.chords.map(c => ({
                            ...c,
                            position: c.position + previousTextWidth
                        }))

                        const mergedChords = [...previous.chords, ...shiftedChords]

                        const updated = [...prev]
                        updated[lineIndex - 1] = { lyrics: mergedLyrics, chords: mergedChords }
                        updated.splice(lineIndex, 1) // Remove current

                        saveLines(updated)

                        // Restore focus
                        setTimeout(() => {
                            const editors = document.querySelectorAll('[contenteditable]')
                            const prevEditor = editors[lineIndex - 1]
                            if (prevEditor) {
                                prevEditor.focus()
                                // Try to set cursor at join position
                                if (previous.lyrics.length > 0) {
                                    const range = document.createRange()
                                    const sel = window.getSelection()
                                    // Find text node(s). If simple text, firstChild is text node.
                                    if (prevEditor.firstChild && prevEditor.firstChild.nodeType === Node.TEXT_NODE) {
                                        try {
                                            range.setStart(prevEditor.firstChild, previous.lyrics.length)
                                            range.collapse(true)
                                            sel.removeAllRanges()
                                            sel.addRange(range)
                                        } catch (err) {
                                            console.warn('Cursor restore failed', err)
                                        }
                                    } else if (previous.lyrics.length === 0) {
                                        // If previous line was empty, cursor at start
                                        range.setStart(prevEditor, 0)
                                        range.collapse(true)
                                        sel.removeAllRanges()
                                        sel.addRange(range)
                                    }
                                }
                            }
                        }, 0)

                        return updated
                    })
                }
            }
        } else if (e.key === 'ArrowUp' && lineIndex > 0) {
            // Optional: Handle arrow navigation
        } else if (e.key === 'ArrowDown' && lineIndex < lines.length - 1) {
            // Optional: Handle arrow navigation
        }
    }, [saveLines])

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
                            key={`${activeSong.id}-${i}`} // Use index as part of key to force re-mount on structure change (critical for uncontrolled inputs)
                            line={line.lyrics}
                            chords={line.chords}
                            lineIndex={i}
                            onLyricChange={handleLyricChange}
                            onAddChord={handleAddChord}
                            onEditChord={handleEditChord}
                            onRemoveChord={handleRemoveChord}
                            onKeyDown={handleKeyDown}
                        />
                    ))}
                </div>

                {/* Helper text */}
                <div className="mt-16 flex items-center gap-1.5 opacity-30">
                    <div className="w-0.5 h-5 bg-foreground animate-pulse" />
                    <span className="text-xs text-muted-foreground">
                        Double-click on a line to add a chord · Enter for new line · Backspace to merge
                    </span>
                </div>
            </div>
        </main>
    )
}
