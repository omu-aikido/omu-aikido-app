import React, { useCallback, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"

interface SidebarProps {
  position: "left" | "right"
  icon?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sidebar({
  position,
  icon,
  children,
  open: openProp,
  onOpenChange,
}: SidebarProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp !== undefined ? openProp : internalOpen
  const setOpen = useCallback(
    (v: boolean) => {
      if (onOpenChange) onOpenChange(v)
      else setInternalOpen(v)
    },
    [onOpenChange],
  )
  const sidebarRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, setOpen])

  useEffect(() => {
    setOpen(false)
  }, [setOpen, location])

  function handleOpenClick() {
    setOpen(true)
  }

  function handleCloseClick() {
    setOpen(false)
  }

  return (
    <div className="w-1/6 flex justify-end" data-testid="sidebar-trigger-container">
      <span
        className="cursor-pointer p-2 mx-3 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center h-10 w-10"
        onClick={handleOpenClick}
        id="open-sidebar-btn"
        data-testid="sidebar-button-open"
      >
        {icon}
      </span>

      {/* Overlay background */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-200/40 dark:bg-slate-800/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        id="sidebar"
        className={`fixed top-0 ${
          position === "left" ? "left-0" : "right-0"
        } h-full bg-slate-200 dark:bg-slate-800 shadow-2xl z-50 transition-transform duration-200 ease-out ${
          open
            ? "translate-x-0"
            : position === "left"
              ? "-translate-x-full"
              : "translate-x-full"
        } w-80 flex flex-col`}
        data-testid="sidebar-container"
      >
        <div className="p-6 flex-1" data-testid="sidebar-content">
          <span
            id="close-sidebar-btn"
            className="cursor-pointer flex items-center justify-center text-xl h-8 w-8 rounded-xl outline-2 outline-slate-400/60 dark:outline-slate-500/60 transition-all duration-300 ease-out hover:bg-slate-400 dark:hover:bg-slate-600 hover:scale-110 hover:-rotate-3 active:scale-95 active:-rotate-1"
            onClick={handleCloseClick}
            data-testid="sidebar-button-close"
          >
            ×
          </span>
          <div className="mt-12" data-testid="sidebar-children">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
