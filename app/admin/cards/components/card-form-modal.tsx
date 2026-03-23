'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: number;
  name: string;
}

interface CardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  categories: Category[];
}

export function CardFormModal({ isOpen, onClose, onSubmit, initialData, categories }: CardFormModalProps) {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        content: '',
        categoryId: null,
        tags: '', // We'll handle tags as a comma-separated string for simplicity
        likesCount: 0,
        favoritesCount: 0,
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoryId: parseInt(value, 10) }));
  };

  const handleSubmit = () => {
    const finalData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      likesCount: parseInt(formData.likesCount, 10) || 0,
      favoritesCount: parseInt(formData.favoritesCount, 10) || 0,
    };
    onSubmit(finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? '编辑卡片' : '新增卡片'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">内容</Label>
            <Textarea id="content" name="content" value={formData.content || ''} onChange={handleChange} className="col-span-3" rows={5} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryId" className="text-right">分类</Label>
            <Select onValueChange={handleSelectChange} value={formData.categoryId?.toString()}>
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">标签</Label>
            <Input id="tags" name="tags" placeholder="用逗号分隔" value={formData.tags || ''} onChange={handleChange} className="col-span-3" />
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
