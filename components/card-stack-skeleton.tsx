'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function CardStackSkeleton() {
  return (
    <div className="flex-1 w-full max-w-sm mx-auto p-4 flex flex-col items-center justify-center">
      <div className="relative w-full h-[60vh] max-h-[500px]">
        <Skeleton className="absolute w-full h-full rounded-2xl bg-slate-200 dark:bg-slate-800" style={{ transform: 'scale(0.9) translateY(-20px)', opacity: 0.5 }} />
        <Skeleton className="absolute w-full h-full rounded-2xl bg-slate-300 dark:bg-slate-700" style={{ transform: 'scale(0.95) translateY(-10px)', opacity: 0.7 }} />
        <Skeleton className="absolute w-full h-full rounded-2xl bg-slate-400 dark:bg-slate-600" />
      </div>
    </div>
  )
}
