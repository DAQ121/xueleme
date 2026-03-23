'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Category {
  id: string
  name: string
  order: number
  isActive: boolean
  _count?: { cards: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), order: categories.length }),
      })
      setNewName('')
      fetchCategories()
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return
    await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName.trim() }),
    })
    setEditingId(null)
    fetchCategories()
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchCategories()
  }

  const handleDelete = async (id: string, cardCount: number) => {
    if (cardCount > 0) {
      if (!confirm(`该分类下有 ${cardCount} 张卡片，删除后卡片将失去分类。确定删除吗？`)) return
    } else {
      if (!confirm('确定删除该分类吗？')) return
    }
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    fetchCategories()
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const updated = [...categories]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    setCategories(updated)
    await Promise.all([
      fetch(`/api/admin/categories/${updated[index - 1].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: index - 1 }),
      }),
      fetch(`/api/admin/categories/${updated[index].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: index }),
      }),
    ])
  }

  const handleMoveDown = async (index: number) => {
    if (index === categories.length - 1) return
    const updated = [...categories]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setCategories(updated)
    await Promise.all([
      fetch(`/api/admin/categories/${updated[index].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: index }),
      }),
      fetch(`/api/admin/categories/${updated[index + 1].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: index + 1 }),
      }),
    ])
  }

  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">分类管理</h1>
        <p className="text-sm text-slate-500 mt-1">共 {categories.length} 个分类，{categories.filter(c => c.isActive).length} 个已启用</p>
      </div>

      {/* 新增分类 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">新增分类</p>
        <div className="flex gap-2">
          <Input
            placeholder="输入分类名称..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <Button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />添加
          </Button>
        </div>
      </div>

      {/* 分类列表 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-slate-400">暂无分类</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {categories.map((cat, index) => (
              <div key={cat.id} className={`flex items-center gap-3 px-4 py-3 transition-colors ${!cat.isActive ? 'opacity-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                {/* 排序按钮 */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="text-slate-300 hover:text-slate-500 disabled:opacity-20 text-xs leading-none">▲</button>
                  <button onClick={() => handleMoveDown(index)} disabled={index === categories.length - 1} className="text-slate-300 hover:text-slate-500 disabled:opacity-20 text-xs leading-none">▼</button>
                </div>

                <span className="text-xs text-slate-400 w-5 text-center">{index + 1}</span>

                {editingId === cat.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleUpdate(cat.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                      className="h-8 text-sm"
                    />
                    <Button size="sm" onClick={() => handleUpdate(cat.id)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg h-8">保存</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="rounded-lg h-8">取消</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{cat.name}</span>
                      <span className="text-xs text-slate-400 ml-2">{cat.id}</span>
                    </div>
                    <span className="text-xs text-slate-400 mr-2">{cat._count?.cards ?? 0} 张卡片</span>
                    {/* 上下线开关 */}
                    <button
                      onClick={() => handleToggleActive(cat.id, cat.isActive)}
                      className="text-slate-400 hover:text-orange-500 transition-colors"
                      title={cat.isActive ? '点击下线' : '点击上线'}
                    >
                      {cat.isActive
                        ? <ToggleRight className="w-5 h-5 text-green-500" />
                        : <ToggleLeft className="w-5 h-5" />
                      }
                    </button>
                    <button
                      onClick={() => { setEditingId(cat.id); setEditingName(cat.name) }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat._count?.cards ?? 0)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
