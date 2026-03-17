'use client'

import { XCircle } from 'lucide-react'

export function FloatingCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors shadow-lg z-[999]"
    >
      <XCircle className="w-4 h-4 text-white dark:text-slate-900" />
    </button>
  )
}
