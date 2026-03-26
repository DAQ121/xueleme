'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, CheckCheck, Archive, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CardFormModal } from './components/card-form-modal';

interface Category {
  id: number;
  name: string;
  tags: string[];
}

interface Card {
  id: number;
  title?: string;
  content: string;
  category: { id: number; name: string };
  tags: string[];
  status: string;
  likesCount: number;
  favoritesCount: number;
}

const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'DRAFT', label: '草稿' },
  { value: 'PUBLISHED', label: '已发布' },
  { value: 'ARCHIVED', label: '已归档' },
]

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ARCHIVED: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  ARCHIVED: '已归档',
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [batchLoading, setBatchLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: number; isBatch?: boolean }>({ open: false });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ pageSize: '50' });
      if (statusFilter) params.set('status', statusFilter);
      const [cardsRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/cards?${params}`),
        fetch('/api/admin/categories'),
      ]);
      if (!cardsRes.ok || !categoriesRes.ok) throw new Error('Failed to fetch data');
      const cardsData = await cardsRes.json();
      const categoriesData = await categoriesRes.json();
      setCards(cardsData.data?.list || []);
      setTotal(cardsData.data?.total || 0);
      setCategories(categoriesData.data?.list || []);
    } catch (error) {
      console.error(error);
      alert('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFormSubmit = async (data: any) => {
    const url = editingCard ? `/api/admin/cards/${editingCard.id}` : '/api/admin/cards';
    const method = editingCard ? 'PATCH' : 'POST';
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Failed to save card.'); }
      setIsModalOpen(false);
      setEditingCard(null);
      fetchData();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteDialog({ open: true, id });
  };

  const confirmDelete = async () => {
    const { id, isBatch } = deleteDialog;
    try {
      if (isBatch) {
        await Promise.all(selectedIds.map(cardId => fetch(`/api/admin/cards/${cardId}`, { method: 'DELETE' })));
        setSelectedIds([]);
      } else if (id) {
        await fetch(`/api/admin/cards/${id}`, { method: 'DELETE' });
      }
      fetchData();
    } finally {
      setDeleteDialog({ open: false });
    }
  };

  const handleBatchAction = async (action: 'publish' | 'archive' | 'delete') => {
    if (selectedIds.length === 0) return;

    if (action === 'delete') {
      setDeleteDialog({ open: true, isBatch: true });
      return;
    }

    setBatchLoading(true);
    try {
      const status = action === 'publish' ? 'PUBLISHED' : 'ARCHIVED';
      await Promise.all(
        selectedIds.map(id =>
          fetch(`/api/admin/cards/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
        )
      );
      setSelectedIds([]);
      fetchData();
    } finally {
      setBatchLoading(false);
    }
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === cards.length ? [] : cards.map(c => c.id));
  };

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">卡片管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {total} 张卡片 {selectedIds.length > 0 && `· 已选 ${selectedIds.length} 张`}</p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => handleBatchAction('publish')}
                disabled={batchLoading}
                className="rounded-xl"
              >
                <CheckCheck className="w-4 h-4 mr-1" />发布
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBatchAction('archive')}
                disabled={batchLoading}
                className="rounded-xl"
              >
                <Archive className="w-4 h-4 mr-1" />归档
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBatchAction('delete')}
                disabled={batchLoading}
                className="rounded-xl text-red-600 hover:bg-red-50 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-1" />删除
              </Button>
            </>
          )}
          <Button onClick={() => { setEditingCard(null); setIsModalOpen(true); }} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-1" />新增卡片
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading...</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3 w-12">
                  <Checkbox
                    checked={cards.length > 0 && selectedIds.length === cards.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3">标题</th>
                <th className="px-6 py-3">内容</th>
                <th className="px-6 py-3">分类</th>
                <th className="px-6 py-3">标签</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3">点赞</th>
                <th className="px-6 py-3">收藏</th>
                <th className="px-6 py-3"><span className="sr-only">操作</span></th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <Checkbox
                      checked={selectedIds.includes(card.id)}
                      onCheckedChange={(checked) => {
                        setSelectedIds(checked ? [...selectedIds, card.id] : selectedIds.filter(id => id !== card.id));
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-[120px] truncate">{card.title || '—'}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-sm truncate">{card.content}</td>
                  <td className="px-6 py-4">{card.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{(Array.isArray(card.tags) ? card.tags : []).join(', ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[card.status] || ''}`}>
                      {STATUS_LABEL[card.status] || card.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{card.likesCount}</td>
                  <td className="px-6 py-4">{card.favoritesCount}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingCard({ ...card, categoryId: card.category?.id }); setIsModalOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(card.id)}>
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <CardFormModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingCard(null); }}
          onSubmit={handleFormSubmit}
          initialData={editingCard}
          categories={categories}
        />
      )}

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.isBatch
                ? `确定要删除选中的 ${selectedIds.length} 张卡片吗？此操作无法撤销。`
                : '确定要删除这张卡片吗？此操作无法撤销。'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

