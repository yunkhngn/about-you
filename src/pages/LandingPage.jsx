import { Link } from 'react-router-dom'
import { Music2, Sparkles, PenTool, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <header className="h-16 border-b border-border/40 backdrop-blur-sm bg-background/80 fixed top-0 w-full z-10 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <Music2 className="h-6 w-6 text-primary" />
                    <span className="font-display font-semibold tracking-tight text-lg">About You</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">
                        Sign In
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    <span>Your personal songwriting workspace</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-display font-semibold tracking-tight max-w-3xl mb-6 animate-in slide-in-from-bottom-8 duration-700 delay-200">
                    Write better songs, <br className="hidden md:block" />
                    <span className="text-muted-foreground">all in one place.</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-in slide-in-from-bottom-8 duration-700 delay-300">
                    A distraction-free editor with smart chord detection, transpose tools, and seamless sharing. Built for musicians.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-400">
                    <Link to="/auth">
                        <Button size="lg" className="h-12 px-8 rounded-full text-base">
                            Start Writing Now
                        </Button>
                    </Link>
                    <Link to="/auth">
                        <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-base">
                            View Demo
                        </Button>
                    </Link>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-5xl text-left animate-in slide-in-from-bottom-12 duration-1000 delay-500">
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <PenTool className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Smart Editor</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Write lyrics and chords naturally. We automatically detect keys, extract chords, and provide instant transposing.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Music2 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Chord Visualizer</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Don't know how to play a chord? See exactly how to finger any chord on both piano and guitar instantly.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Share2 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Create public or unlisted links to share your songs with bandmates, complete with transpose controls.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-border/40 mt-auto flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Made with <span className="text-red-500">❤️</span> by <a href="#" className="hover:text-primary transition-colors">Nguyen Dang Khoa</a>
                </p>
            </footer>
        </div>
    )
}
