'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Tag, Users, MessageSquare, TrendingUp, Clock } from 'lucide-react'

interface Stats {
  totalCards: number
  totalCategories: number
  totalUsers: number
  totalFeedbacks: number
  publishedCards: number
  pendingFeedbacks: number
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
  sub?: string
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">欢迎回来，这是你的内容概览</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 h-28 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatCard icon={BookOpen} label="卡片总数" value={stats.totalCards} color="#f97316" sub={`已发布 ${stats.publishedCards} 条`} />
            <StatCard icon={Tag} label="分类总数" value={stats.totalCategories} color="#6366f1" />
            <StatCard icon={Users} label="注册用户" value={stats.totalUsers} color="#22c55e" />
            <StatCard icon={MessageSquare} label="用户反馈" value={stats.totalFeedbacks} color="#3b82f6" sub={`待处理 ${stats.pendingFeedbacks} 条`} />
            <StatCard icon={TrendingUp} label="已发布卡片" value={stats.publishedCards} color="#ec4899" />
            <StatCard icon={Clock} label="待处理反馈" value={stats.pendingFeedbacks} color="#f59e0b" />
          </div>

          {/* 快捷操作 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">快捷操作</h2>
            <div className="flex flex-wrap gap-3">
              <a href="/admin/cards/new" className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors">
                + 新增卡片
              </a>
              <a href="/admin/categories" className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors">
                管理分类
              </a>
              <a href="/admin/feedback" className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors">
                查看反馈
              </a>
            </div>
          </div>
        </>
      ) : (
        <p className="text-slate-500">加载失败，请刷新重试</p>
      )}
    </div>
  )
}
