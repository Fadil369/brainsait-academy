"use client"

import { cn } from "@/lib/utils"

interface ProgressProps {
  className?: string
  value?: number
  max?: number
  children?: React.ReactNode
}

function Progress({ className, value = 0, max = 100, children }: ProgressProps) {
const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("flex flex-wrap gap-3", className)}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator style={{ width: `${pct}%` }} />
      </ProgressTrack>
    </div>
  )
}

interface ProgressTrackProps {
  className?: string
  children?: React.ReactNode
}

function ProgressTrack({ className, children }: ProgressTrackProps) {
  return (
    <div
      data-slot="progress-track"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
    >
      {children}
    </div>
  )
}

interface ProgressIndicatorProps {
  className?: string
  style?: React.CSSProperties
}

function ProgressIndicator({ className, style }: ProgressIndicatorProps) {
  return (
    <div
      data-slot="progress-indicator"
      className={cn("h-full bg-primary transition-all duration-300", className)}
      style={style}
    />
  )
}

interface ProgressLabelProps {
  className?: string
  children?: React.ReactNode
}

function ProgressLabel({ className, children }: ProgressLabelProps) {
  return (
    <span data-slot="progress-label" className={cn("text-sm font-medium", className)}>
      {children}
    </span>
  )
}

interface ProgressValueProps {
  className?: string
  children?: React.ReactNode
}

function ProgressValue({ className, children }: ProgressValueProps) {
  return (
    <span
      data-slot="progress-value"
      className={cn("ml-auto text-sm text-muted-foreground tabular-nums", className)}
    >
      {children}
    </span>
  )
}

export { Progress, ProgressTrack, ProgressIndicator, ProgressLabel, ProgressValue }
