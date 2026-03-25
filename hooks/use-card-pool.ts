import { useState, useEffect, useCallback, useRef } from 'react'
import { cardsApi } from '@/lib/api/cards'
import type { KnowledgeCard } from '@/lib/types'

const POOL_SIZE = 20
const PREFETCH_THRESHOLD = 5   // 剩余未看卡片数 ≤ 5 时触发预取

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'xueleme_visitor_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

// seed = hash(visitorId + 今日日期)，同一天同一人顺序固定，次日重新洗牌
function getSessionSeed(visitorId: string): number {
  const today = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
  const str = visitorId + today
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

interface UseCardPoolOptions {
  categoryId?: string
  enabled?: boolean // false 时不请求（mock 模式）
}

interface CardPoolState {
  pool: KnowledgeCard[]
  currentIndex: number
  isFetching: boolean
  goNext: () => void
  goPrev: () => void
  currentCard: KnowledgeCard | undefined
  markSeen: (cardId: string) => void
}

export function useCardPool({ categoryId, enabled = true }: UseCardPoolOptions): CardPoolState {
  const [pool, setPool] = useState<KnowledgeCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFetching, setIsFetching] = useState(false)

  const visitorIdRef = useRef('')
  const seedRef = useRef(0)
  const hasMoreRef = useRef(true)
  const pendingReportRef = useRef<string[]>([])
  const isFetchingRef = useRef(false)

  // 初始化 visitorId 和 seed
  useEffect(() => {
    visitorIdRef.current = getOrCreateVisitorId()
    seedRef.current = getSessionSeed(visitorIdRef.current)
  }, [])

  // 批量上报曝光，返回 Promise 供 fetchMore await
  const flushImpressions = useCallback(async () => {
    const ids = pendingReportRef.current
    if (ids.length === 0 || !visitorIdRef.current) return
    pendingReportRef.current = []
    await cardsApi.reportImpressions(visitorIdRef.current, ids).catch(() => {})
  }, [])

  // 页面卸载时上报剩余
  useEffect(() => {
    const handler = () => flushImpressions()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [flushImpressions])

  // 从服务端拉取一批卡片追加到池子
  const fetchMore = useCallback(async () => {
    if (!enabled || isFetchingRef.current || !hasMoreRef.current) return
    isFetchingRef.current = true
    setIsFetching(true)
    // 先 flush，确保 DB 中 impressions 是最新的，避免拿到重复卡片
    await flushImpressions()
    try {
      const res = await cardsApi.getList({
        categoryId,
        visitorId: visitorIdRef.current,
        seed: seedRef.current,
      })
      const newCards = res.list
      hasMoreRef.current = res.hasMore
      setPool(prev => {
        const existingIds = new Set(prev.map(c => c.id))
        const unique = newCards.filter(c => !existingIds.has(c.id))
        return [...prev, ...unique]
      })
    } catch (e) {
      // 静默失败，池子里还有卡片时用户无感
    } finally {
      isFetchingRef.current = false
      setIsFetching(false)
    }
  }, [categoryId, enabled, flushImpressions])

  // 分类切换时重置池子
  useEffect(() => {
    if (!enabled) return
    setPool([])
    setCurrentIndex(0)
    hasMoreRef.current = true
    isFetchingRef.current = false
    // 注意：不清空 pendingReportRef，fetchMore 会先 flush 再请求
    // 重新生成 seed（分类维度独立）
    seedRef.current = getSessionSeed(visitorIdRef.current + (categoryId || ''))
    fetchMore()
  }, [categoryId, enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  // 当剩余未看卡片 ≤ 阈值时，触发预取
  useEffect(() => {
    if (!enabled) return
    const remaining = pool.length - currentIndex
    if (remaining <= PREFETCH_THRESHOLD && hasMoreRef.current && !isFetchingRef.current) {
      fetchMore()
    }
  }, [currentIndex, pool.length, fetchMore, enabled])

  const markSeen = useCallback((cardId: string) => {
    pendingReportRef.current.push(cardId)
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex(prev => prev + 1)
  }, [])

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }, [])

  return {
    pool,
    currentIndex,
    isFetching,
    goNext,
    goPrev,
    currentCard: pool[currentIndex],
    markSeen,
  }
}
