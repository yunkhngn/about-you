import { cn } from '@/lib/utils'

export function EditorArea({ className }) {
    return (
        <main
            className={cn(
                'flex-1 flex flex-col items-center overflow-y-auto bg-editor-surface',
                className
            )}
        >
            <div className="w-full max-w-2xl px-10 py-16">
                {/* Song Title */}
                <h2 className="font-display text-3xl font-semibold text-foreground mb-1 opacity-30 select-none">
                    Untitled Song
                </h2>
                <p className="text-sm text-muted-foreground mb-10 opacity-40 select-none">
                    Key of C · 120 BPM · No capo
                </p>

                {/* Editor Content Placeholder */}
                <div className="space-y-8">
                    {/* Verse placeholder */}
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider opacity-40">
                            Verse 1
                        </p>
                        <div className="space-y-5">
                            <div className="relative">
                                <span className="absolute -top-4 left-0 font-mono text-xs text-chord opacity-40">
                                    Am
                                </span>
                                <p className="text-foreground/30 leading-relaxed">
                                    Start writing your lyrics here...
                                </p>
                            </div>
                            <div className="relative">
                                <span className="absolute -top-4 left-0 font-mono text-xs text-chord opacity-40">
                                    F
                                </span>
                                <span className="absolute -top-4 left-32 font-mono text-xs text-chord opacity-40">
                                    G
                                </span>
                                <p className="text-foreground/30 leading-relaxed">
                                    Add chords above your lyrics with a click
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chorus placeholder */}
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider opacity-40">
                            Chorus
                        </p>
                        <div className="relative">
                            <span className="absolute -top-4 left-0 font-mono text-xs text-chord opacity-40">
                                C
                            </span>
                            <span className="absolute -top-4 left-48 font-mono text-xs text-chord opacity-40">
                                G
                            </span>
                            <p className="text-foreground/30 leading-relaxed">
                                Your chorus goes here...
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cursor blink placeholder */}
                <div className="mt-12 flex items-center gap-1 opacity-20">
                    <div className="w-0.5 h-5 bg-foreground animate-pulse" />
                    <span className="text-xs text-muted-foreground">Ready to write</span>
                </div>
            </div>
        </main>
    )
}
