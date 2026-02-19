import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Music, Piano, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RightPanel({ className }) {
    const [tab, setTab] = useState('chords')

    return (
        <aside
            className={cn(
                'w-72 border-l border-border bg-card flex flex-col h-full',
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
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-mono font-semibold text-lg">
                                        C
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium">C Major</p>
                                        <p className="text-[10px] text-muted-foreground">Ionian scale</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chord suggestions */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                    Chords in Key
                                </p>
                                <div className="grid grid-cols-4 gap-1.5">
                                    {['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'].map((chord) => (
                                        <button
                                            key={chord}
                                            className="h-9 rounded-md bg-muted hover:bg-chord-highlight text-sm font-mono font-medium text-foreground transition-colors cursor-pointer"
                                        >
                                            {chord}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Transpose */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                    Transpose
                                </p>
                                <div className="flex items-center gap-2">
                                    <button className="h-8 w-8 rounded-md bg-muted hover:bg-accent text-sm font-medium transition-colors cursor-pointer">
                                        −
                                    </button>
                                    <span className="text-sm font-mono font-medium w-6 text-center">0</span>
                                    <button className="h-8 w-8 rounded-md bg-muted hover:bg-accent text-sm font-medium transition-colors cursor-pointer">
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="instruments">
                        <div className="pt-5 space-y-5">
                            {/* Piano placeholder */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                    Piano
                                </p>
                                <div className="relative h-24 bg-muted rounded-lg flex items-center justify-center">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 14 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    'rounded-b-sm transition-colors',
                                                    i % 7 === 0 || i % 7 === 3 || i % 7 === 5
                                                        ? 'w-5 h-16 bg-background border border-border'
                                                        : 'w-5 h-16 bg-background border border-border'
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className="absolute bottom-2 text-[10px] text-muted-foreground">
                                        Select a chord to visualize
                                    </p>
                                </div>
                            </div>

                            {/* Guitar placeholder */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                    Guitar
                                </p>
                                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                                    <div className="space-y-2">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-40 h-px bg-foreground/20"
                                            />
                                        ))}
                                    </div>
                                    <p className="absolute text-[10px] text-muted-foreground">
                                        Select a chord to visualize
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="info">
                        <div className="pt-5 space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Title</p>
                                <p className="text-sm font-medium">Untitled Song</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Key</p>
                                <p className="text-sm font-medium font-mono">C Major</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Tempo</p>
                                <p className="text-sm font-medium font-mono">120 BPM</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Capo</p>
                                <p className="text-sm font-medium font-mono">None</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Tags</p>
                                <p className="text-sm text-muted-foreground italic">No tags</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Visibility</p>
                                <p className="text-sm font-medium">Private</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </aside>
    )
}
