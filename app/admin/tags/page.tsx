'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

interface Tag {
  id: number;
  name: string;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });

  const fetchTags = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tags?page=${page}&pageSize=${pagination.pageSize}`);
      if (!res.ok) throw new Error('Failed to fetch tags');
      const data = await res.json();
      setTags(data.list || []);
      setPagination(prev => ({ ...prev, total: data.total, page: data.page }));
    } catch (error) {
      console.error(error);
      alert('Failed to load tags.');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageSize]);

  useEffect(() => {
    fetchTags(pagination.page);
  }, [fetchTags, pagination.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleOpenModal = (tag: Tag | null) => {
    setEditingTag(tag);
    setTagName(tag ? tag.name : '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    setTagName('');
  };

  const handleSave = async () => {
    if (!tagName.trim()) return;

    const url = editingTag ? `/api/admin/tags/${editingTag.id}` : '/api/admin/tags';
    const method = editingTag ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save tag.');
      }
      handleCloseModal();
      fetchTags();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  };

  const openDeleteAlert = (id: number) => {
    setDeletingTagId(id);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (deletingTagId === null) return;
    try {
      const res = await fetch(`/api/admin/tags/${deletingTagId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        throw new Error('Failed to delete tag.');
      }
      fetchTags();
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setIsAlertOpen(false);
      setDeletingTagId(null);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">标签管理</h1>
            <p className="text-sm text-slate-500 mt-1">共 {tags.length} 个标签</p>
        </div>
        <Button onClick={() => handleOpenModal(null)} className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-1" />
          新增标签
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <p className="p-4 text-center text-slate-500">Loading...</p>
        ) : tags.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <p>暂无标签，点击右上角按钮新增第一个吧！</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-4 group">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{tag.name}</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(tag)}>
                        <Pencil className="w-4 h-4 text-slate-400 hover:text-orange-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteAlert(tag.id)}>
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination 
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={handlePageChange}
      />

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? '编辑标签' : '新增标签'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="name">标签名称</Label>
            <Input
              id="name"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除吗？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。这将永久删除该标签。
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
