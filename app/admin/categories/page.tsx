'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Zap, ScrollText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryFormModal } from './components/category-form-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Category {
  id: number;
  name: string;
  code: string;
  template?: string;
  isScheduled: boolean;
  cronExpression?: string;
  order: number;
  isActive: boolean;
  tags: string[];
  modelConfigId?: number | null;
  _count?: { cards: number };
}

interface GenerationLog {
  id: number;
  status: string;
  generatedCount: number;
  errorMsg?: string;
  createdAt: string;
  modelConfig?: { name: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: '等待中', RUNNING: '生成中', SUCCESS: '成功', FAILED: '失败',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-slate-400', RUNNING: 'text-blue-500', SUCCESS: 'text-green-500', FAILED: 'text-red-500',
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [logsCategory, setLogsCategory] = useState<Category | null>(null);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [resultDialog, setResultDialog] = useState<{ open: boolean; success?: boolean; message?: string }>({ open: false });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data.data?.list || []);
    } catch (error) {
      console.error(error);
      alert('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleFormSubmit = async (data: Omit<Category, 'id' | 'order' | 'isActive' | '_count'>) => {
    const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
    const method = editingCategory ? 'PATCH' : 'POST';
    const body = editingCategory ? data : { ...data, order: categories.length };
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to save category.'); }
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) { alert((error as Error).message); }
  };

  const handleGenerate = async (category: Category) => {
    if (!category.template) {
      setResultDialog({ open: true, success: false, message: '请先在编辑中配置生成模板（提示词）' });
      return;
    }
    setGeneratingId(category.id);
    try {
      const res = await fetch(`/api/admin/generate/${category.id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResultDialog({ open: true, success: true, message: `生成成功，共生成 ${data.data.generatedCount} 张卡片（DRAFT 状态）` });
    } catch (error) {
      setResultDialog({ open: true, success: false, message: `生成失败：${(error as Error).message}` });
    } finally {
      setGeneratingId(null);
    }
  };

  const openLogs = async (category: Category) => {
    setLogsCategory(category);
    setLogsLoading(true);
    const res = await fetch(`/api/admin/generation-logs?categoryId=${category.id}`);
    const data = await res.json();
    setLogs(data.data?.list || []);
    setLogsLoading(false);
  };

  const handleDelete = async () => {
    if (deletingCategoryId === null) return;
    try {
      const res = await fetch(`/api/admin/categories/${deletingCategoryId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete category.');
      fetchCategories();
    } catch (error) { alert((error as Error).message); }
    finally { setIsAlertOpen(false); setDeletingCategoryId(null); }
  };

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">分类管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            共 {categories.length} 个分类，{categories.filter(c => c.isActive).length} 个已启用
          </p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setIsModalOpen(true); }} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-1" />新增分类
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading...</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">名称</th>
                <th className="px-4 py-3">标签</th>
                <th className="px-4 py-3">定时</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => {
                const tags = Array.isArray(category.tags) ? category.tags : [];
                const visibleTags = tags.slice(0, 4);
                const extraCount = tags.length - visibleTags.length;
                const isGenerating = generatingId === category.id;
                return (
                  <tr key={category.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{category.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{category.code}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {visibleTags.map(tag => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800">{tag}</span>
                        ))}
                        {extraCount > 0 && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">+{extraCount}</span>}
                        {tags.length === 0 && <span className="text-xs text-slate-400">暂无标签</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {category.isScheduled ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">✅ 已启用</span>
                          <span className="text-xs text-slate-500 font-mono">{category.cronExpression}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">❌ 未启用</span>
                      )}
                    </td>
                    <td className="px-4 py-4">{category.isActive ? '🟢' : '🔴'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleGenerate(category)} disabled={isGenerating} title="立即生成">
                          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openLogs(category)} title="生成日志">
                          <ScrollText className="w-4 h-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditingCategory(category); setIsModalOpen(true); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setDeletingCategoryId(category.id); setIsAlertOpen(true); }}>
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
      />

      {/* 生成日志弹窗 */}
      <Dialog open={!!logsCategory} onOpenChange={v => !v && setLogsCategory(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>生成日志 · {logsCategory?.name}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {logsLoading ? (
              <p className="text-center text-slate-400 py-8">加载中...</p>
            ) : logs.length === 0 ? (
              <p className="text-center text-slate-400 py-8">暂无生成记录</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 border-b dark:border-slate-700">
                  <tr>
                    <th className="py-2 text-left">时间</th>
                    <th className="py-2 text-left">模型</th>
                    <th className="py-2 text-left">状态</th>
                    <th className="py-2 text-left">生成数</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id} className="border-b dark:border-slate-800">
                      <td className="py-2 text-slate-500 text-xs">{new Date(log.createdAt).toLocaleString('zh-CN')}</td>
                      <td className="py-2 text-slate-500 text-xs">{log.modelConfig?.name || '-'}</td>
                      <td className={`py-2 text-xs font-medium ${STATUS_COLOR[log.status] || ''}`}>
                        {STATUS_LABEL[log.status] || log.status}
                        {log.errorMsg && <div className="text-red-400 font-normal mt-0.5 max-w-[160px] truncate" title={log.errorMsg}>{log.errorMsg}</div>}
                      </td>
                      <td className="py-2 text-slate-700 dark:text-slate-300">{log.generatedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>此操作无法撤销。该分类下的所有卡片也将被删除。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>继续</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resultDialog.open} onOpenChange={(open) => setResultDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{resultDialog.success ? '生成成功' : '生成失败'}</AlertDialogTitle>
            <AlertDialogDescription>{resultDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>确定</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
