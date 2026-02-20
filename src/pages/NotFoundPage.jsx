import { Link } from 'react-router-dom'
import { Music3, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6">
                <Music3 className="h-20 w-20 text-muted-foreground/30 animate-pulse" />
                <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center -rotate-12">
                    <span className="font-display font-black text-6xl text-foreground mix-blend-difference">404</span>
                </div>
            </div>

            <h1 className="font-display text-2xl font-semibold mb-2">Track Not Found</h1>
            <p className="text-muted-foreground mb-8 max-w-sm">
                The song or page you're looking for has been skipped, deleted, or never existed in the first place.
            </p>

            <Link to="/">
                <Button variant="default" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Studio
                </Button>
            </Link>
        </div>
    )
}
