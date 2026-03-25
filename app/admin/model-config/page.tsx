'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

const API_TYPE_OPTIONS = [
  { value: 'OPENAI', label: 'OpenAI 兼容（GPT / Claude / Qwen / DeepSeek 等）' },
  { value: 'VOLC_ENGINE', label: '火山引擎 Responses API（豆包）' },
]

interface ModelConfig {
  id: number
  name: string
  baseUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
  apiType: string
  isDefault: boolean
}

const emptyForm = { name: '', baseUrl: '', apiKey: '', model: '', temperature: 0.7, maxTokens: 2000, apiType: 'OPENAI', isDefault: false }

export default function ModelConfigPage() {
  const [configs, setConfigs] = useState<ModelConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<ModelConfig | null>(null)
  const [form, setForm] = useState<any>(emptyForm)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const fetchConfigs = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/model-configs')
    const data = await res.json()
    setConfigs(data.data?.list || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchConfigs() }, [fetchConfigs])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setIsModalOpen(true) }
  const openEdit = (c: ModelConfig) => { setEditing(c); setForm({ ...c }); setIsModalOpen(true) }

  const handleSave = async () => {
    const url = editing ? `/api/admin/model-configs/${editing.id}` : '/api/admin/model-configs'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) { const d = await res.json(); alert(d.message); return }
    setIsModalOpen(false)
    fetchConfigs()
  }

  const handleDelete = async () => {
    if (!deletingId) return
    await fetch(`/api/admin/model-configs/${deletingId}`, { method: 'DELETE' })
    setDeletingId(null)
    fetchConfigs()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">模型配置</h1>
          <p className="text-sm text-slate-500 mt-1">配置大模型 API，用于定时生成卡片内容</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-1" />新增配置
        </Button>
      </div>

      {/* 提示词格式说明 */}
      <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
        <p className="font-medium mb-1">生成模板（提示词）格式说明</p>
        <p className="text-xs leading-relaxed">在分类管理的「生成模板」中，要求模型严格输出以下 JSON 格式，系统会自动解析并入库：</p>
        <pre className="mt-2 text-xs bg-amber-100 dark:bg-amber-900/40 rounded p-2 overflow-x-auto">{`[
  {"content": "卡片正文内容，100字以内", "tags": ["标签1", "标签2"]},
  {"content": "另一张卡片内容", "tags": ["标签1"]}
]`}</pre>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading...</p>
        ) : configs.length === 0 ? (
          <p className="p-8 text-center text-slate-400">暂无配置，点击右上角新增</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">名称</th>
                <th className="px-6 py-3">类型</th>
                <th className="px-6 py-3">模型</th>
                <th className="px-6 py-3">Base URL</th>
                <th className="px-6 py-3">温度</th>
                <th className="px-6 py-3">默认</th>
                <th className="px-6 py-3"><span className="sr-only">操作</span></th>
              </tr>
            </thead>
            <tbody>
              {configs.map(c => (
                <tr key={c.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{c.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{c.apiType === 'VOLC_ENGINE' ? '火山引擎' : 'OpenAI 兼容'}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{c.model}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 max-w-[180px] truncate">{c.baseUrl}</td>
                  <td className="px-6 py-4 text-slate-500">{c.temperature}</td>
                  <td className="px-6 py-4">
                    {c.isDefault && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingId(c.id)}><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑模型配置' : '新增模型配置'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {[
              { label: '配置名称', key: 'name', placeholder: '如 GPT-4o' },
              { label: 'Base URL', key: 'baseUrl', placeholder: 'https://api.openai.com' },
              { label: 'API Key', key: 'apiKey', placeholder: editing ? '不修改请留空' : 'sk-...' },
              { label: '模型名称', key: 'model', placeholder: 'gpt-4o' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{label}</Label>
                <Input
                  className="col-span-3"
                  placeholder={placeholder}
                  value={form[key] || ''}
                  onChange={e => setForm((p: any) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">温度</Label>
              <Input
                className="col-span-3"
                type="number" min={0} max={2} step={0.1}
                value={form.temperature}
                onChange={e => setForm((p: any) => ({ ...p, temperature: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">接口类型</Label>
              <Select value={form.apiType || 'OPENAI'} onValueChange={v => setForm((p: any) => ({ ...p, apiType: v }))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {API_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">最大 Token</Label>
              <Input
                className="col-span-3"
                type="number" min={100} max={8000}
                value={form.maxTokens}
                onChange={e => setForm((p: any) => ({ ...p, maxTokens: parseInt(e.target.value) }))}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">设为默认</Label>
              <Switch checked={!!form.isDefault} onCheckedChange={v => setForm((p: any) => ({ ...p, isDefault: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={v => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>删除后，使用该配置的分类将改用默认配置。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
