import * as React from "react"
import { cn } from "@/lib/utils"

function Tabs({ value, onValueChange, children, className }) {
    return (
        <div className={cn("w-full", className)} data-value={value}>
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(child, { activeValue: value, onValueChange })
                    : child
            )}
        </div>
    )
}

function TabsList({ children, className, activeValue, onValueChange }) {
    return (
        <div
            className={cn(
                "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full",
                className
            )}
        >
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(child, { activeValue, onValueChange })
                    : child
            )}
        </div>
    )
}

function TabsTrigger({ value, children, className, activeValue, onValueChange }) {
    const isActive = activeValue === value
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer flex-1",
                isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "hover:bg-background/50 hover:text-foreground"
            )}
            onClick={() => onValueChange?.(value)}
            {...className}
        >
            {children}
        </button>
    )
}

function TabsContent({ value, children, className, activeValue }) {
    if (activeValue !== value) return null
    return (
        <div
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
        >
            {children}
        </div>
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
