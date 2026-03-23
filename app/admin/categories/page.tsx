'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryFormModal } from './components/category-form-modal';
import { Pagination } from '@/app/admin/components/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
  _count?: { cards: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

  const fetchCategories = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories?page=${page}&pageSize=${pagination.pageSize}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const json = await res.json();
      const data = json.success ? json.data : json;
      setCategories(data.list || []);
      setPagination(prev => ({ ...prev, total: data.total, page: data.page }));
    } catch (error) {
      console.error(error);
      alert('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  useEffect(() => {
    fetchCategories(pagination.page);
  }, [fetchCategories, pagination.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleFormSubmit = async (data: Omit<Category, 'id' | 'order' | 'isActive' | '_count'>) => {
    const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
    const method = editingCategory ? 'PATCH' : 'POST';
    const body = editingCategory ? data : { ...data, order: categories.length };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save category.');
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  };
  
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };
  
  const openDeleteAlert = (id: number) => {
    setDeletingCategoryId(id);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (deletingCategoryId === null) return;
    try {
      const res = await fetch(`/api/admin/categories/${deletingCategoryId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        throw new Error('Failed to delete category.');
      }
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsAlertOpen(false);
      setDeletingCategoryId(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">分类管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            共 {categories.length} 个分类，{categories.filter(c => c.isActive).length} 个已启用
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-1" />
          新增分类
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading...</p>
        ) : categories.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <p>暂无分类，点击右上角按钮新增第一个吧！</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">名称</th>
                <th className="px-6 py-3">编码</th>
                <th className="px-6 py-3">定时</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{category.name}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{category.code}</td>
                  <td className="px-6 py-4">{category.isScheduled ? '✅' : '❌'}</td>
                  <td className="px-6 py-4">{category.isActive ? '🟢' : '🔴'}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(category)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteAlert(category.id)}>
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
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

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
      />
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。该分类下的所有卡片也将被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>继续</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
