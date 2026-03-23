import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FullScreenPreviewModal } from './full-screen-preview-modal';
import { Maximize } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

export function CategoryFormModal({ isOpen, onClose, onSubmit, initialData }: CategoryFormModalProps) {
  const [formData, setFormData] = useState(initialData || {});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        name: '',
        code: '',
        template: '',
        isScheduled: false,
        cronExpression: '',
      });
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isScheduled: checked }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{initialData ? '编辑分类' : '新增分类'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">分类名称</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">分类编码</Label>
              <Input id="code" name="code" value={formData.code || ''} onChange={handleChange} className="col-span-3" />
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
              <Switch id="isScheduled" checked={formData.isScheduled} onCheckedChange={handleSwitchChange} />
            </div>
            {formData.isScheduled && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cronExpression" className="text-right">Cron 表达式</Label>
                <Input id="cronExpression" name="cronExpression" value={formData.cronExpression || ''} onChange={handleChange} className="col-span-3" />
              </div>
            )}
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
        onContentChange={(newContent) => setFormData(prev => ({ ...prev, template: newContent }))}
      />
    </>
  );
}
