'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, X, CheckCircle, Archive, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { CardFormModal } from './components/card-form-modal'
import type { KnowledgeCard } from '@/lib/types'

type CardStatus = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

const STATUS_OPTIONS: { value: CardStatus; label: string; color: string }[] = [
  { value: 'ALL', label: '全部', color: 'text-slate-600' },
  { value: 'DRAFT', label: '草稿', color: 'text-amber-500' },
  { value: 'PUBLISHED', label: '已发布', color: 'text-green-500' },
  { value: 'ARCHIVED', label: '已下线', color: 'text-slate-400' },
]

interface CardWithCategory extends KnowledgeCard {
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  category?: { name: string }
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<CardWithCategory[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CardStatus>('ALL')
  const [editingCard, setEditingCard] = useState<CardWithCategory | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const debouncedSearch = useDebounce(search, 300)
  const pageSize = 20

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      const res = await fetch(`/api/admin/cards?${params}`)
      const data = await res.json()
      setCards(data.list)
      setTotal(data.total)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchCards() }, [fetchCards])
  useEffect(() => { setPage(1) }, [statusFilter, debouncedSearch])

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这张卡片吗？')) return
    setDeletingId(id)
    try {
      await fetch(`/api/admin/cards/${id}`, { method: 'DELETE' })
      fetchCards()
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    await fetch(`/api/admin/cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchCards()
  }

  const handleBatchPublish = async () => {
    await Promise.all([...selectedIds].map(id =>
      fetch(`/api/admin/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      })
    ))
    setSelectedIds(new Set())
    fetchCards()
  }

  const handleBatchDelete = async () => {
    if (!confirm(`确定删除选中的 ${selectedIds.size} 张卡片吗？`)) return
    await Promise.all([...selectedIds].map(id =>
      fetch(`/api/admin/cards/${id}`, { method: 'DELETE' })
    ))
    setSelectedIds(new Set())
    fetchCards()
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filteredCards = debouncedSearch
    ? cards.filter(c =>
        c.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.author?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : cards

  const statusInfo = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return { label: '已发布', cls: 'text-green-600 bg-green-50 dark:bg-green-900/20' }
      case 'DRAFT': return { label: '草稿', cls: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' }
      case 'ARCHIVED': return { label: '已下线', cls: 'text-slate-400 bg-slate-100 dark:bg-slate-800' }
      default: return { label: status, cls: '' }
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">卡片管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {total} 张卡片</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />新增卡片
        </Button>
      </div>

      {/* 状态筛选 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 搜索 + 批量操作 */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input placeholder="搜索卡片内容或作者..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <Button size="sm" onClick={handleBatchPublish} className="rounded-xl bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle className="w-4 h-4 mr-1" />批量发布 ({selectedIds.size})
            </Button>
            <Button size="sm" variant="outline" onClick={handleBatchDelete} className="rounded-xl text-red-500 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-1" />批量删除
            </Button>
          </div>
        )}
      </div>

      {/* 卡片列表 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-16 text-center text-slate-400">暂无卡片</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredCards.map(card => {
              const si = statusInfo(card.status)
              return (
                <div key={card.id} className={`flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedIds.has(card.id) ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(card.id)}
                    onChange={() => toggleSelect(card.id)}
                    className="mt-1 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 dark:text-slate-100 line-clamp-2">{card.content}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${si.cls}`}>{si.label}</span>
                      <span className="text-xs text-slate-400">{card.category?.name || card.categoryId}</span>
                      {card.author && <span className="text-xs text-slate-400">— {card.author}</span>}
                      <span className="text-xs text-slate-300">{new Date(card.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {card.status === 'DRAFT' && (
                      <button onClick={() => handleStatusChange(card.id, 'PUBLISHED')} title="发布" className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-400 hover:text-green-500 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {card.status === 'PUBLISHED' && (
                      <button onClick={() => handleStatusChange(card.id, 'ARCHIVED')} title="下线" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    {card.status === 'ARCHIVED' && (
                      <button onClick={() => handleStatusChange(card.id, 'PUBLISHED')} title="重新发布" className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-400 hover:text-green-500 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setEditingCard(card)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(card.id)} disabled={deletingId === card.id} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 分页 */}
      {total > pageSize && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">第 {page} 页，共 {Math.ceil(total / pageSize)} 页</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
            <Button variant="outline" size="sm" disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}>下一页</Button>
          </div>
        </div>
      )}

      {(isCreating || editingCard) && (
        <CardFormModal
          card={editingCard || undefined}
          onClose={() => { setIsCreating(false); setEditingCard(null) }}
          onSaved={() => { setIsCreating(false); setEditingCard(null); fetchCards() }}
        />
      )}
    </div>
  )
}
