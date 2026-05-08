"use client"

import { createContext, useContext, useState } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type AccordionCtx = {
  openItems: Set<string>
  toggle: (value: string) => void
}

const AccordionContext = createContext<AccordionCtx>({
  openItems: new Set(),
  toggle: () => {},
})

const AccordionItemContext = createContext<{ value: string }>({ value: "" })

interface AccordionProps {
  className?: string
  children?: React.ReactNode
  openMultiple?: boolean
  defaultOpenItems?: string[]
}

function Accordion({ className, children, openMultiple = false, defaultOpenItems = [] }: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpenItems))

  const toggle = (value: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        if (!openMultiple) next.clear()
        next.add(value)
      }
      return next
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggle }}>
      <div data-slot="accordion" className={cn("flex w-full flex-col", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  className?: string
  children?: React.ReactNode
  value: string
}

function AccordionItem({ className, children, value }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div data-slot="accordion-item" className={cn(className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

interface AccordionTriggerProps {
  className?: string
  children?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

function AccordionTrigger({ className, children, onClick, ...props }: AccordionTriggerProps) {
  const { openItems, toggle } = useContext(AccordionContext)
  const { value } = useContext(AccordionItemContext)
  const isOpen = openItems.has(value)

  return (
    <div className="flex">
      <button
        type="button"
        data-slot="accordion-trigger"
        aria-expanded={isOpen}
        onClick={(e) => {
          toggle(value)
          onClick?.(e)
        }}
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between w-full rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        {isOpen ? (
          <ChevronUpIcon
            data-slot="accordion-trigger-icon"
            className="pointer-events-none ml-auto size-4 shrink-0 text-muted-foreground"
          />
        ) : (
          <ChevronDownIcon
            data-slot="accordion-trigger-icon"
            className="pointer-events-none ml-auto size-4 shrink-0 text-muted-foreground"
          />
        )}
      </button>
    </div>
  )
}

interface AccordionContentProps {
  className?: string
  children?: React.ReactNode
}

function AccordionContent({ className, children }: AccordionContentProps) {
  const { openItems } = useContext(AccordionContext)
  const { value } = useContext(AccordionItemContext)
  const isOpen = openItems.has(value)

  if (!isOpen) return null

  return (
    <div data-slot="accordion-content" className={cn("overflow-hidden text-sm", className)}>
      <div className="pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-foreground">
        {children}
      </div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
