"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type CollapsibleContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

function useCollapsibleContext() {
  const context = React.useContext(CollapsibleContext)
  if (!context) {
    throw new Error("Collapsible components must be used within Collapsible")
  }
  return context
}

type CollapsibleProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

function Collapsible({ open, defaultOpen = false, onOpenChange, className, children }: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : internalOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  return (
    <CollapsibleContext.Provider value={{ open: currentOpen, setOpen }}>
      <div data-state={currentOpen ? "open" : "closed"} className={cn("w-full", className)}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

type CollapsibleTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

function CollapsibleTrigger({ className, onClick, type, ...props }: CollapsibleTriggerProps) {
  const { open, setOpen } = useCollapsibleContext()

  return (
    <button
      type={type ?? "button"}
      data-state={open ? "open" : "closed"}
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) {
          setOpen(!open)
        }
      }}
      {...props}
    />
  )
}

type CollapsibleContentProps = React.HTMLAttributes<HTMLDivElement>

function CollapsibleContent({ className, ...props }: CollapsibleContentProps) {
  const { open } = useCollapsibleContext()

  if (!open) {
    return null
  }

  return <div data-state={open ? "open" : "closed"} className={cn(className)} {...props} />
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
