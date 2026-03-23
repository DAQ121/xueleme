import { useEffect } from 'react'
import { useAppStore } from '@/lib/store/use-app-store'

export function useHydration() {
  const hydrate = useAppStore(state => state.hydrate)
  const isHydrated = useAppStore(state => state.isHydrated)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return isHydrated
}
