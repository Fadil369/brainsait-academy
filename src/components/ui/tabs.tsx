"use client"

import { createContext, useContext, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

type TabsCtx = {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsCtx>({
  activeTab: "",
  setActiveTab: () => {},
})

interface TabsProps {
  className?: string
  children?: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

function Tabs({
  className,
  children,
  value,
  defaultValue = "",
  onValueChange,
  orientation = "horizontal",
  ...props
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeTab = value !== undefined ? value : internalValue

  const setActiveTab = (next: string) => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={cn("group/tabs flex gap-2 flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

interface TabsListProps extends VariantProps<typeof tabsListVariants> {
  className?: string
  children?: React.ReactNode
}

function TabsList({ className, variant = "default", ...props }: TabsListProps) {
  return (
    <div
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

interface TabsTriggerProps {
  className?: string
  children?: React.ReactNode
  value: string
  disabled?: boolean
}

function TabsTrigger({ className, children, value, disabled, ...props }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  const isActive = activeTab === value

  return (
    <button
      type="button"
      data-slot="tabs-trigger"
data-state={isActive ? "active" : "inactive"}
      aria-selected={isActive}
      role="tab"
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap transition-all",
        "text-foreground/60 hover:text-foreground",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  className?: string
  children?: React.ReactNode
  value: string
}

function TabsContent({ className, children, value, ...props }: TabsContentProps) {
  const { activeTab } = useContext(TabsContext)

  if (activeTab !== value) return null

  return (
    <div
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
