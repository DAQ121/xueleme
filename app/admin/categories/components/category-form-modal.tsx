'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FullScreenPreviewModal } from './full-screen-preview-modal';
import { Maximize, X } from 'lucide-react';

interface ModelConfig { id: number; name: string; isDefault: boolean }

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function CategoryFormModal({ isOpen, onClose, onSubmit, initialData }: CategoryFormModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>([]);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/admin/model-configs').then(r => r.json()).then(d => setModelConfigs(d.data?.list || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (isOpen) {
      const data = initialData || {
        name: '',
        code: '',
        template: '',
        isScheduled: false,
        cronExpression: '',
      };
      setFormData(data);
      setTags(Array.isArray(data.tags) ? data.tags : []);
      setTagInput('');
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, isScheduled: checked }));
  };

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags(prev => [...prev, trimmed]);
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    // 编辑已有分类时，调用接口同步清理卡片
    if (initialData?.id) {
      await fetch(`/api/admin/categories/${initialData.id}/tags`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag }),
      });
    }
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    // 提交前把输入框里未确认的标签也加进去
    const finalTags = tagInput.trim()
      ? [...tags, tagInput.trim()].filter((t, i, arr) => arr.indexOf(t) === i)
      : tags;
    onSubmit({ ...formData, tags: finalTags });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[1100px]">
          <DialogHeader>
            <DialogTitle>{initialData ? '编辑分类' : '新增分类'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">分类名称</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">分类编码</Label>
              <Input id="code" name="code" value={formData.code || ''} onChange={handleChange} className="col-span-3" />
            </div>

            {/* 标签管理 */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">标签池</Label>
              <div className="col-span-3">
                <div
                  className="min-h-[40px] flex flex-wrap gap-1.5 p-2 rounded-md border border-input bg-background cursor-text"
                  onClick={() => tagInputRef.current?.focus()}
                >
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleRemoveTag(tag); }}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => { if (tagInput.trim()) { addTag(tagInput); setTagInput(''); } }}
                    placeholder={tags.length === 0 ? '输入标签，回车确认' : ''}
                    className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">回车或逗号分隔，Backspace 删除最后一个</p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="template" className="text-right pt-2">生成模板</Label>
              <div className="col-span-3 relative">
                <Textarea id="template" name="template" value={formData.template || ''} onChange={handleChange} />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-2 right-2 h-7 w-7"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isScheduled" className="text-right">定时生成</Label>
              <Switch id="isScheduled" checked={!!formData.isScheduled} onCheckedChange={handleSwitchChange} />
            </div>
            {formData.isScheduled && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cronExpression" className="text-right">Cron 表达式</Label>
                <Input id="cronExpression" name="cronExpression" value={formData.cronExpression || ''} onChange={handleChange} className="col-span-3" />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">使用模型</Label>
              <Select
                value={formData.modelConfigId?.toString() ?? 'default'}
                onValueChange={v => setFormData((p: any) => ({ ...p, modelConfigId: v === 'default' ? null : parseInt(v) }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="使用默认模型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">使用默认模型</SelectItem>
                  {modelConfigs.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}{c.isDefault ? ' ★' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>取消</Button>
            <Button onClick={handleSubmit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <FullScreenPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={formData.template || ''}
        onContentChange={(newContent: string) => setFormData((prev: any) => ({ ...prev, template: newContent }))}
      />
    </>
  );
}
