import { Save, Download, Share2, Moon, Sun, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ThemeProvider'
import { useAuth } from '@/components/AuthProvider'
import { cn } from '@/lib/utils'

export function TopBar({ className }) {
    const { theme, toggleTheme } = useTheme()
    const { user, signOut } = useAuth()

    return (
        <header
            className={cn(
                'h-14 border-b border-border bg-card flex items-center justify-between px-5',
                className
            )}
        >
            {/* Left: Save status */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Save className="h-3.5 w-3.5" />
                    <span className="text-xs">Saved</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">
                    {user?.email}
                </span>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
                    {theme === 'dark' ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                    <Download className="h-3.5 w-3.5" />
                    Export
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={signOut}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </header>
    )
}
