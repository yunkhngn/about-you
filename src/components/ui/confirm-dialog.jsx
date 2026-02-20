import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, variant = 'destructive' }) {
    const dialogRef = useRef(null)

    useEffect(() => {
        if (open) {
            dialogRef.current?.focus()
        }
    }, [open])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

            {/* Dialog */}
            <div
                ref={dialogRef}
                tabIndex={-1}
                className="relative bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-150"
                onKeyDown={(e) => e.key === 'Escape' && onCancel()}
            >
                <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{message}</p>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant={variant}
                        size="sm"
                        onClick={onConfirm}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    )
}
