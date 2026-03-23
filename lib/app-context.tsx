'use client'

import { type ReactNode } from 'react'
import { Toaster } from '@/lib/react-hot-toast'
import { ErrorBoundary } from '@/components/error-boundary'
import { useHydration } from '@/hooks/use-hydration'

export function AppProvider({ children }: { children: ReactNode }) {
  useHydration()

  return (
    <ErrorBoundary>
      {children}
      <Toaster />
    </ErrorBoundary>
  )
}

// 保持向后兼容的导出
export { useAppStore as useApp } from '@/lib/store/use-app-store'
