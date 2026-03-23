'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardFormModal } from './components/card-form-modal';
import { Pagination } from '@/app/admin/components/pagination';

interface Category {
  id: number;
  name: string;
}

interface Card {
  id: number;
  content: string;
  category: { id: number; name: string };
  tags: string[];
  likesCount: number;
  favoritesCount: number;
}

export default function AdminCardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      // Fetch categories along with cards
      const [cardsRes, categoriesRes] = await Promise.all([
        fetch(`/api/admin/cards?page=${page}&pageSize=${pagination.pageSize}`),
        fetch('/api/admin/categories'),
      ]);

      if (!cardsRes.ok || !categoriesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const cardsData = await cardsRes.json();
      const categoriesData = await categoriesRes.json();

      const cards = cardsData.success ? cardsData.data : cardsData;
      const cats = categoriesData.success ? categoriesData.data : categoriesData;

      setCards(cards.list || []);
      setPagination({
        page: cards.page,
        pageSize: cards.pageSize,
        total: cards.total
      });
      setCategories(cats.list || []);
    } catch (error) {
      console.error(error);
      alert('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  useEffect(() => {
    fetchData(pagination.page);
  }, [fetchData, pagination.page]);
  
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchData(newPage);
  };


  
  const handleFormSubmit = async (data: any) => {
    const url = editingCard ? `/api/admin/cards/${editingCard.id}` : '/api/admin/cards';
    const method = editingCard ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save card.');
      }

      setIsModalOpen(false);
      setEditingCard(null);
      fetchData(); // Refetch cards
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  };

  const handleOpenCreateModal = () => {
    fetchCategories();
    setEditingCard(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card: Card) => {
    fetchCategories();
    const initialData = {
        ...card,
        tags: Array.isArray(card.tags) ? card.tags.join(', ') : '',
        categoryId: card.category?.id
    };
    setEditingCard(initialData as any);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这张卡片吗？')) return;
    try {
      const res = await fetch(`/api/admin/cards/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('删除失败');
      fetchData();
    } catch (error) {
      alert('删除失败');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">卡片管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {cards.length} 张卡片</p>
        </div>
        <Button onClick={handleOpenCreateModal} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-1" />
          新增卡片
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading...</p>
        ) : cards.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <p>暂无卡片，点击右上角按钮新增第一张吧！</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">内容</th>
                <th className="px-6 py-3">分类</th>
                <th className="px-6 py-3">标签</th>
                <th className="px-6 py-3">点赞</th>
                <th className="px-6 py-3">收藏</th>
                <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {cards.map(card => (
                <tr key={card.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white max-w-sm truncate">{card.content}</td>
                  <td className="px-6 py-4">{card.category?.name || 'N/A'}</td>
                  <td className="px-6 py-4 flex flex-wrap gap-1">
                    {(Array.isArray(card.tags) ? card.tags : []).map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </td>
                  <td className="px-6 py-4">{card.likesCount}</td>
                  <td className="px-6 py-4">{card.favoritesCount}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(card)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(card.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination 
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={handlePageChange}
      />

      {isModalOpen && (
        <CardFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCard(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingCard}
          categories={categories}
        />
      )}
    </div>
  );
}
