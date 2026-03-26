'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Crown, Shield, User, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'

interface UserItem {
  id: string
  phone: string | null
  email: string | null
  isSubscribed: boolean
  role: 'USER' | 'ADMIN'
  createdAt: string
  _count: { favorites: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const pageSize = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.data?.list ?? [])
      setTotal(data.data?.total ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { setPage(1) }, [debouncedSearch])

  const handleToggleSubscribe = async (id: string, isSubscribed: boolean) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSubscribed: !isSubscribed }),
    })
    fetchUsers()
  }

  const handleToggleRole = async (id: string, role: string) => {
    const newRole = role === 'ADMIN' ? 'USER' : 'ADMIN'
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    fetchUsers()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该用户吗？此操作不可恢复，用户的收藏数据也会一并删除。')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    fetchUsers()
  }

  return (
    <div className="p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">用户管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {total} 位用户</p>
        </div>
      </div>

      {/* 搜索 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="搜索手机号或邮箱..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* 用户列表 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400">暂无用户</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map(user => (
              <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                {/* 头像 */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                  {user.role === 'ADMIN'
                    ? <Shield className="w-4 h-4 text-white" />
                    : <User className="w-4 h-4 text-white" />
                  }
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                      {user.phone || user.email || '未知用户'}
                    </span>
                    {user.role === 'ADMIN' && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium">管理员</span>
                    )}
                    {user.isSubscribed && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                        <Crown className="w-3 h-3" />会员
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-400">{new Date(user.createdAt).toLocaleDateString('zh-CN')} 注册</span>
                    <span className="text-xs text-slate-400">{user._count.favorites} 个收藏夹</span>
                  </div>
                </div>

                {/* 操作 */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggleSubscribe(user.id, user.isSubscribed)}
                    title={user.isSubscribed ? '取消会员' : '设为会员'}
                    className={`p-1.5 rounded-lg transition-colors ${user.isSubscribed ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <Crown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleRole(user.id, user.role)}
                    title={user.role === 'ADMIN' ? '撤销管理员' : '设为管理员'}
                    className={`p-1.5 rounded-lg transition-colors ${user.role === 'ADMIN' ? 'text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
    </div>
  )
}
