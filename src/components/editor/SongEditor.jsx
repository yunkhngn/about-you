import { useState, useRef, useCallback, useEffect } from 'react'
import { useSongs } from '@/components/SongsProvider'
import { playChordByName } from '@/lib/music/audio'
import { cn } from '@/lib/utils'
import { GuitarVisualization } from '@/components/instruments/GuitarVisualization'
import { PianoVisualization } from '@/components/instruments/PianoVisualization'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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
 * Tooltip for previewing guitar/piano chords on hover
 */
function ChordPreviewTooltip({ chordName, position, onMouseEnter, onMouseLeave, onChordChange, isReadOnly }) {
    const [activeTab, setActiveTab] = useState('guitar')
    const [editValue, setEditValue] = useState(chordName)

    useEffect(() => {
        setEditValue(chordName)
    }, [chordName])

    const handleSave = () => {
        if (editValue.trim() !== chordName && editValue.trim() !== '') {
            onChordChange(editValue.trim())
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave()
        else if (e.key === 'Escape') setEditValue(chordName)
    }

    return (
        <div
            className="absolute z-50 bg-card border border-border rounded-lg shadow-xl p-3 w-64 animate-in fade-in zoom-in-95 duration-200"
            style={{
                left: position.x - 10, // Slight offset to align nicely 
                top: position.y + 20   // Show below the chord
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-3 border-b pb-2">
                {isReadOnly ? (
                    <h4 className="font-mono font-bold text-lg text-primary select-none">{chordName}</h4>
                ) : (
                    <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="font-mono font-bold text-lg text-primary bg-transparent outline-none w-24 border-b border-transparent hover:border-primary/50 focus:border-primary transition-colors"
                        title="Edit chord"
                    />
                )}
                <div className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Preview
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-3">
                    <TabsTrigger value="guitar">Guitar</TabsTrigger>
                    <TabsTrigger value="piano">Piano</TabsTrigger>
                </TabsList>
                <TabsContent value="guitar" className="flex justify-center mt-0">
                    <div className="transform scale-90 origin-top">
                        <GuitarVisualization chord={chordName} />
                    </div>
                </TabsContent>
                <TabsContent value="piano" className="flex justify-center mt-0">
                    <div className="transform scale-90 origin-top">
                        <PianoVisualization chord={chordName} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

/**
 * An uncontrolled contentEditable line — React never re-renders its text content.
 * We only read from it via onInput, and set it imperatively on mount / song switch.
 */
function EditableLine({ initialText, onTextChange, onDoubleClick, onKeyDown, onPasteMultiLine, lineIndex }) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (ref.current) {
            ref.current.textContent = initialText || ''
        }
    }, [])

    return (
        <div
            ref={ref}
            data-line-index={lineIndex}
            contentEditable
            suppressContentEditableWarning
            onInput={() => {
                const text = ref.current?.textContent || ''
                mountedText.current = text
                onTextChange(text)
            }}
            onPaste={(e) => {
                e.preventDefault()
                const text = e.clipboardData.getData('text/plain')
                if (text.includes('\n') && onPasteMultiLine) {
                    onPasteMultiLine(text)
                } else {
                    const selection = window.getSelection()
                    if (!selection.rangeCount) return
                    const range = selection.getRangeAt(0)
                    range.deleteContents()
                    range.insertNode(document.createTextNode(text))
                    selection.collapseToEnd()
                    const newText = ref.current?.textContent || ''
                    mountedText.current = newText
                    onTextChange(newText)
                }
            }}
            onDoubleClick={onDoubleClick}
            onKeyDown={onKeyDown}
            className="min-h-[1.75rem] text-foreground leading-relaxed outline-none whitespace-pre-wrap"
            style={{ caretColor: 'var(--primary)' }}
        />
    )
}

const SECTION_THEMES = {
    'Verse 1': { bg: 'bg-blue-500/40', text: 'text-blue-500' },
    'Chorus': { bg: 'bg-purple-500/40', text: 'text-purple-500' },
    'Verse 2': { bg: 'bg-blue-500/40', text: 'text-blue-500' },
    'Interlude': { bg: 'bg-blue-500/40', text: 'text-blue-500' },
    'Bridge': { bg: 'bg-orange-500/40', text: 'text-orange-500' },
    'Solo': { bg: 'bg-red-500/40', text: 'text-red-500' },
    'Outro': { bg: 'bg-green-500/40', text: 'text-green-500' },
}

/**
 * Renders a single line with chords above
 */
function EditorLine({ line, chords = [], section, isSectionStart, isSectionEnd, isSelected, isReadOnly, onLyricChange, onAddChord, onEditChord, lineIndex, onKeyDown, onPasteMultiLine, onLineClick }) {
    const lineRef = useRef(null)
    const contentRef = useRef(null)
    const [popover, setPopover] = useState(null)
    const [previewPopover, setPreviewPopover] = useState(null)
    const hoverTimeoutRef = useRef(null)

    const handleMouseEnterChord = (chord, chordIndex, e) => {
        // Clear any pending hide
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)

        // Don't show preview if editing
        if (popover && popover.mode === 'edit' && popover.chordIndex === chordIndex) return

        const rect = contentRef.current.getBoundingClientRect()
        // Wait a tiny bit before showing to avoid flashing when moving cursor fast
        hoverTimeoutRef.current = setTimeout(() => {
            setPreviewPopover({ chord: chord.name, x: chord.position, y: 0, index: chordIndex })
        }, 150)
    }

    const handleMouseLeaveChord = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
        // Add a delay before hiding so user can move mouse into the tooltip
        hoverTimeoutRef.current = setTimeout(() => {
            setPreviewPopover(null)
        }, 300)
    }

    const handleDoubleClick = (e) => {
        if (isReadOnly) return
        if (e.target.closest('.chord-span')) return
        // Measure position relative to the content area, not the outer container
        const rect = contentRef.current.getBoundingClientRect()
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

    const theme = section ? (SECTION_THEMES[section] || { bg: 'bg-border', text: 'text-muted-foreground' }) : null

    return (
        <div className={cn("relative group flex w-full", isSelected && 'bg-primary/10 rounded')} ref={lineRef}>
            {/* Section gutter — click to select, shift+click to extend */}
            <div
                className="w-6 flex-shrink-0 relative hidden sm:block cursor-pointer select-none line-gutter hover:bg-foreground/5 transition-colors rounded-l-sm"
                onMouseDown={(e) => {
                    e.preventDefault()
                    onLineClick && onLineClick(lineIndex, e)
                }}
            >
                {section && (
                    <div className={cn(
                        "absolute top-0 bottom-0 right-0 w-1",
                        theme.bg,
                        isSectionStart && 'rounded-t-sm top-2',
                        isSectionEnd && 'rounded-b-sm'
                    )} />
                )}
                {isSectionStart && (
                    <span className={cn('absolute top-0 right-3 text-[10px] font-bold tracking-wider uppercase whitespace-nowrap', theme.text)}>
                        {section}
                    </span>
                )}
            </div>

            {/* Content area */}
            <div className="flex-1 min-w-0 relative ml-5" ref={contentRef}>
                {/* Chord line */}
                <div className="h-5 relative select-none">
                    {chords.map((chord, i) => (
                        <span
                            key={i}
                            className={cn(
                                "chord-span absolute font-mono text-xs font-semibold cursor-pointer transition-colors z-10",
                                previewPopover?.index === i || (popover?.mode === 'edit' && popover?.chordIndex === i)
                                    ? "text-primary"
                                    : "text-chord hover:text-primary"
                            )}
                            style={{ left: chord.position }}
                            onMouseEnter={(e) => handleMouseEnterChord(chord, i, e)}
                            onMouseLeave={handleMouseLeaveChord}
                            onClick={(e) => {
                                e.stopPropagation()
                                playChordByName(chord.name)
                            }}
                            onDoubleClick={(e) => {
                                e.stopPropagation()
                                if (isReadOnly) return
                                setPopover({ x: chord.position, y: 0, mode: 'edit', chordIndex: i, initialValue: chord.name })
                            }}
                            title={isReadOnly ? "Click to play" : "Click to play, Double-click to edit"}
                        >
                            {chord.name}
                        </span>
                    ))}
                </div>

                {/* Lyric line — uncontrolled */}
                {!isReadOnly ? (
                    <EditableLine
                        lineIndex={lineIndex}
                        initialText={line}
                        onTextChange={(text) => onLyricChange(lineIndex, text)}
                        onDoubleClick={handleDoubleClick}
                        onKeyDown={(e) => onKeyDown(e, lineIndex)}
                        onPasteMultiLine={onPasteMultiLine}
                    />
                ) : (
                    <div className="min-h-[1.75rem] text-foreground leading-relaxed whitespace-pre-wrap">
                        {line}
                    </div>
                )}

                {/* Chord insertion popover */}
                {popover && (
                    <ChordPopover
                        position={popover}
                        initialValue={popover.initialValue}
                        onSave={handleSaveChord}
                        onClose={() => setPopover(null)}
                    />
                )}

                {/* Chord preview popover (Guitar/Piano) */}
                {previewPopover && !popover && (
                    <ChordPreviewTooltip
                        chordName={previewPopover.chord}
                        position={{ x: previewPopover.x, y: previewPopover.y }}
                        isReadOnly={isReadOnly}
                        onMouseEnter={() => {
                            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                        }}
                        onMouseLeave={handleMouseLeaveChord}
                        onChordChange={(newName) => {
                            onEditChord(lineIndex, previewPopover.index, newName)
                            setPreviewPopover(prev => prev ? { ...prev, chord: newName } : null)
                        }}
                    />
                )}

                {/* Hint on hover */}
                {!isReadOnly && (
                    <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-muted-foreground pointer-events-none">
                        dbl-click space for chord
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Parse song content to structured lines
 */
function parseContent(content) {
    if (!content) return [{ id: crypto.randomUUID(), lyrics: '', chords: [] }]
    try {
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(line => ({
                ...line,
                id: line.id || crypto.randomUUID(),
                section: line.section || null
            }))
        }
    } catch {
        return content.split('\n').map((line) => ({ id: crypto.randomUUID(), lyrics: line, chords: [], section: null }))
    }
    return [{ id: crypto.randomUUID(), lyrics: '', chords: [] }]
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

/**
 * Floating toolbar for setting sections
 */
function SectionToolbar({ rangeInfo, onSelectSection, onClear }) {
    if (!rangeInfo) return null

    const top = Math.max(10, rangeInfo.rect.top - 46)
    const left = rangeInfo.rect.left + (rangeInfo.rect.width / 2)

    return (
        <div
            className="section-toolbar fixed z-50 flex items-center gap-1 p-1 bg-card border border-border shadow-xl rounded-lg transform -translate-x-1/2 select-none"
            style={{ top, left }}
            onMouseDown={(e) => e.preventDefault()}
        >
            {Object.keys(SECTION_THEMES).map(sec => (
                <button
                    key={sec}
                    onMouseDown={(e) => { e.preventDefault(); onSelectSection(sec) }}
                    className="px-2.5 py-1 text-[11px] font-medium rounded hover:bg-muted text-foreground transition-colors"
                >
                    {sec}
                </button>
            ))}
            <div className="w-px h-4 bg-border mx-1" />
            <button
                onMouseDown={(e) => { e.preventDefault(); onClear() }}
                className="px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-destructive transition-colors"
                title="Clear Section"
            >
                Clear
            </button>
        </div>
    )
}

export function SongEditor({ className }) {
    const { activeSong, updateSong, isReadOnly } = useSongs()
    const [lines, setLines] = useState([{ id: crypto.randomUUID(), lyrics: '', chords: [] }])
    const [title, setTitle] = useState('')
    const [sectionPopover, setSectionPopover] = useState(null)
    const [selectedLines, setSelectedLines] = useState(null) // { start, end } for line selection
    const prevSongId = useRef(null)
    const prevContentRef = useRef(null)
    const editorContainerRef = useRef(null)

    // Sync to parent/DB helper
    const saveLines = useCallback((newLines) => {
        if (activeSong) {
            const newContent = serializeContent(newLines)
            prevContentRef.current = newContent
            updateSong(activeSong.id, { content: newContent })
        }
    }, [activeSong, updateSong])

    // Load song content when active song changes OR external changes (Transpose)
    useEffect(() => {
        if (activeSong && activeSong.id !== prevSongId.current) {
            prevSongId.current = activeSong.id
            prevContentRef.current = activeSong.content
            setTimeout(() => {
                setTitle(activeSong.title || 'Untitled Song')
                setLines(parseContent(activeSong.content))
                setSelectedLines(null)
            }, 0)
        } else if (activeSong && activeSong.content !== prevContentRef.current) {
            // Content changed externally (e.g. from Transpose in RightPanel)!
            prevContentRef.current = activeSong.content
            setLines(parseContent(activeSong.content))
        } else if (!activeSong) {
            prevSongId.current = null
            prevContentRef.current = null
            setTimeout(() => {
                setTitle('')
                setLines([{ id: crypto.randomUUID(), lyrics: '', chords: [] }])
                setSectionPopover(null)
                setSelectedLines(null)
            }, 0)
        }
    }, [activeSong])

    // Use ref to always have latest selectedLines in event handlers
    const selectedLinesRef = useRef(null)
    selectedLinesRef.current = selectedLines

    // Handle line click for section selection (click to select one line, shift+click to select range)
    const handleLineClick = useCallback((lineIndex, e) => {
        const current = selectedLinesRef.current
        if (e.shiftKey && current !== null) {
            // Extend selection from existing anchor
            const anchor = current.anchor ?? current.start
            const newStart = Math.min(anchor, lineIndex)
            const newEnd = Math.max(anchor, lineIndex)
            setSelectedLines({ start: newStart, end: newEnd, anchor })
        } else {
            // Start a new selection
            setSelectedLines({ start: lineIndex, end: lineIndex, anchor: lineIndex })
        }
    }, []) // No deps needed — reads from ref

    // Show/hide section toolbar based on selectedLines
    useEffect(() => {
        if (selectedLines === null) {
            setSectionPopover(null)
            return
        }
        // Calculate position from the selected line elements
        if (!editorContainerRef.current) return
        const lineEls = editorContainerRef.current.querySelectorAll('[data-line-index]')
        const startEl = lineEls[selectedLines.start]
        const endEl = lineEls[selectedLines.end]
        if (startEl && endEl) {
            const startRect = startEl.getBoundingClientRect()
            const endRect = endEl.getBoundingClientRect()
            const combinedRect = {
                top: startRect.top,
                left: Math.min(startRect.left, endRect.left),
                width: Math.max(startRect.right, endRect.right) - Math.min(startRect.left, endRect.left),
                height: endRect.bottom - startRect.top,
            }
            setSectionPopover({
                startIdx: selectedLines.start,
                endIdx: selectedLines.end,
                rect: combinedRect
            })
        }
    }, [selectedLines])

    // Clear line selection when clicking outside gutter / toolbar
    useEffect(() => {
        const handleMouseDown = (e) => {
            if (selectedLinesRef.current === null) return
            // Don't clear if clicking on a gutter or the section toolbar
            if (e.target.closest('.line-gutter') || e.target.closest('.section-toolbar')) return
            setSelectedLines(null)
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [])

    const handleSetSection = useCallback((sectionName) => {
        if (!sectionPopover) return
        setLines(prev => {
            const updated = [...prev]
            for (let i = sectionPopover.startIdx; i <= sectionPopover.endIdx; i++) {
                updated[i] = { ...updated[i], section: sectionName }
            }
            saveLines(updated)
            return updated
        })
        setSectionPopover(null)
        setSelectedLines(null)
    }, [sectionPopover, saveLines])

    const handleClearSection = useCallback(() => {
        if (!sectionPopover) return
        setLines(prev => {
            const updated = [...prev]
            for (let i = sectionPopover.startIdx; i <= sectionPopover.endIdx; i++) {
                const copy = { ...updated[i] }
                delete copy.section
                updated[i] = copy
            }
            saveLines(updated)
            return updated
        })
        setSectionPopover(null)
        setSelectedLines(null)
    }, [sectionPopover, saveLines])
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

    const handlePasteMultiLine = useCallback((lineIndex, text) => {
        const pastedLines = text.split(/\r?\n/)
        setLines(prev => {
            const current = prev[lineIndex]
            const selection = window.getSelection()
            let cursorOffset = current.lyrics.length
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0)
                // Check if selection is actually inside this line
                if (range.startContainer.parentElement?.closest('[contenteditable]')) {
                    cursorOffset = range.startOffset
                }
            }

            const textBefore = current.lyrics.slice(0, cursorOffset)
            const textAfter = current.lyrics.slice(cursorOffset)

            const updated = [...prev]

            // First line merges with textBefore
            updated[lineIndex] = { ...current, lyrics: textBefore + pastedLines[0] }

            // Middle lines
            const newLines = pastedLines.slice(1, -1).map(l => ({ id: crypto.randomUUID(), lyrics: l, chords: [] }))

            // Last line merges with textAfter
            const lastLine = { id: crypto.randomUUID(), lyrics: pastedLines[pastedLines.length - 1] + textAfter, chords: [] }

            if (pastedLines.length > 1) {
                updated.splice(lineIndex + 1, 0, ...newLines, lastLine)
            }

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

    const handleKeyDown = useCallback((e, lineIndex) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const selection = window.getSelection()
            let cursorOffset = 0
            if (selection.rangeCount > 0) {
                cursorOffset = selection.getRangeAt(0).startOffset
            }

            setLines((prev) => {
                const current = prev[lineIndex]
                const textBefore = current.lyrics.slice(0, cursorOffset)
                const textAfter = current.lyrics.slice(cursorOffset)

                const updated = [...prev]
                // Update current line
                updated[lineIndex] = { ...current, lyrics: textBefore }

                // Insert new line with textAfter
                updated.splice(lineIndex + 1, 0, { id: crypto.randomUUID(), lyrics: textAfter, chords: [] })

                saveLines(updated)

                setTimeout(() => {
                    const editors = document.querySelectorAll('[contenteditable]')
                    const nextEditor = editors[lineIndex + 1]
                    if (nextEditor) {
                        nextEditor.focus()
                        const sel = window.getSelection()
                        const range = document.createRange()
                        range.setStart(nextEditor.firstChild || nextEditor, 0)
                        range.collapse(true)
                        sel.removeAllRanges()
                        sel.addRange(range)
                    }
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
    }, [saveLines, lines.length])

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
                'flex-1 flex flex-col items-center overflow-y-auto bg-editor-surface relative',
                className
            )}
        >
            <SectionToolbar
                rangeInfo={sectionPopover}
                onSelectSection={handleSetSection}
                onClear={handleClearSection}
            />

            <div className="w-full max-w-2xl px-1 sm:px-10 py-16" ref={editorContainerRef}>
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
                <div>
                    {lines.map((line, i) => {
                        const isSectionStart = line.section && (i === 0 || lines[i - 1].section !== line.section)
                        const isSectionEnd = line.section && (i === lines.length - 1 || lines[i + 1].section !== line.section)
                        return (
                            <EditorLine
                                key={line.id}
                                line={line.lyrics}
                                chords={line.chords}
                                section={line.section}
                                isSectionStart={isSectionStart}
                                isSectionEnd={isSectionEnd}
                                isReadOnly={isReadOnly}
                                isSelected={selectedLines !== null && i >= selectedLines.start && i <= selectedLines.end}
                                onLineClick={handleLineClick}
                                onLyricChange={handleLyricChange}
                                onAddChord={handleAddChord}
                                onEditChord={handleEditChord}
                                lineIndex={i}
                                onKeyDown={handleKeyDown}
                                onPasteMultiLine={(text) => handlePasteMultiLine(text, i)}
                            />
                        )
                    })}
                </div>

                {/* Helper text */}
                <div className="mt-16 flex items-center gap-1.5 opacity-30">
                    <div className="w-0.5 h-5 bg-foreground animate-pulse" />
                    <span className="text-xs text-muted-foreground">
                        Double-click on a line to add a chord · Click gutter to select section · Shift+click for range
                    </span>
                </div>
            </div>
        </main>
    )
}
