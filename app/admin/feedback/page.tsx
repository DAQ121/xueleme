'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, Clock, MessageSquare, Filter } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Feedback {
  id: string
  content: string
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED'
  createdAt: string
  user?: { phone: string | null; email: string | null }
}

type StatusFilter = 'ALL' | 'PENDING' | 'REVIEWED' | 'RESOLVED'

const STATUS_LABELS = {
  PENDING: { label: '待处理', cls: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  REVIEWED: { label: '已查看', cls: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  RESOLVED: { label: '已解决', cls: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
}

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'PENDING', label: '待处理' },
  { value: 'REVIEWED', label: '已查看' },
  { value: 'RESOLVED', label: '已解决' },
]

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/admin/feedback?${params}`)
      const data = await res.json()
      setFeedbacks(data)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, debouncedSearch])

  useEffect(() => { fetchFeedbacks() }, [fetchFeedbacks])

  const handleUpdateStatus = async (id: string, status: Feedback['status']) => {
    await fetch(`/api/admin/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchFeedbacks()
  }

  const pendingCount = feedbacks.filter(f => f.status === 'PENDING').length

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">反馈管理</h1>
        <p className="text-sm text-slate-500 mt-1">
          共 {feedbacks.length} 条反馈
          {pendingCount > 0 && <span className="ml-2 text-amber-500 font-medium">· {pendingCount} 条待处理</span>}
        </p>
      </div>

      {/* 状态筛选 */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTER_OPTIONS.map(opt => (
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

      {/* 搜索 */}
      <div className="relative mb-4">
        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="搜索反馈内容..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* 反馈列表 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <MessageSquare className="w-10 h-10 opacity-30" />
            <p>暂无反馈</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {feedbacks.map(fb => {
              const si = STATUS_LABELS[fb.status]
              return (
                <div key={fb.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed">{fb.content}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${si.cls}`}>{si.label}</span>
                        <span className="text-xs text-slate-400">{new Date(fb.createdAt).toLocaleString('zh-CN')}</span>
                        {fb.user && (
                          <span className="text-xs text-slate-400">{fb.user.phone || fb.user.email || '匿名用户'}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {fb.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(fb.id, 'REVIEWED')}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-500 transition-colors"
                          title="标记为已查看"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {fb.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleUpdateStatus(fb.id, 'RESOLVED')}
                          className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-400 hover:text-green-500 transition-colors"
                          title="标记为已解决"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {fb.status === 'RESOLVED' && (
                        <button
                          onClick={() => handleUpdateStatus(fb.id, 'PENDING')}
                          className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-500 transition-colors"
                          title="重新打开"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
