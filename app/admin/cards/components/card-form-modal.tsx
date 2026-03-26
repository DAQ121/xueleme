'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  tags: string[];
}

interface CardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  categories: Category[];
}

export function CardFormModal({ isOpen, onClose, onSubmit, initialData, categories }: CardFormModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const data = initialData || {
        title: '',
        content: '',
        categoryId: null,
        likesCount: 0,
        favoritesCount: 0,
      };
      setFormData(data);
      setSelectedTags(Array.isArray(data.tags) ? data.tags : []);
    }
  }, [isOpen, initialData]);

  // 当分类切换时，清空不属于新分类标签池的已选标签
  const currentCategoryTags = categories.find(c => c.id === formData.categoryId)?.tags ?? [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    const newCategoryId = parseInt(value, 10);
    const newCategoryTags = categories.find(c => c.id === newCategoryId)?.tags ?? [];
    setFormData((prev: any) => ({ ...prev, categoryId: newCategoryId }));
    // 保留仍在新分类标签池中的已选标签
    setSelectedTags(prev => prev.filter(t => newCategoryTags.includes(t)));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      tags: selectedTags,
      likesCount: parseInt(formData.likesCount, 10) || 0,
      favoritesCount: parseInt(formData.favoritesCount, 10) || 0,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? '编辑卡片' : '新增卡片'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">标题</Label>
            <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} className="col-span-3" placeholder="可选，简短概括知识点" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">内容</Label>
            <Textarea id="content" name="content" value={formData.content || ''} onChange={handleChange} className="col-span-3" rows={5} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryId" className="text-right">分类</Label>
            <Select onValueChange={handleCategoryChange} value={formData.categoryId?.toString()}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择一个分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 标签多选 */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">标签</Label>
            <div className="col-span-3">
              {!formData.categoryId ? (
                <p className="text-xs text-slate-400 py-1">请先选择分类</p>
              ) : currentCategoryTags.length === 0 ? (
                <p className="text-xs text-slate-400 py-1">该分类暂无标签，可在分类管理中添加</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {currentCategoryTags.map(tag => {
                    const selected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${
                          selected
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {selected && <X className="w-3 h-3" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="likesCount" className="text-right">点赞数</Label>
            <Input id="likesCount" name="likesCount" type="number" value={formData.likesCount || 0} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="favoritesCount" className="text-right">收藏数</Label>
            <Input id="favoritesCount" name="favoritesCount" type="number" value={formData.favoritesCount || 0} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
