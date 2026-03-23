'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface FullScreenPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentChange: (newContent: string) => void;
}

export function FullScreenPreviewModal({ isOpen, onClose, content, onContentChange }: FullScreenPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-4xl p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 border-b flex-shrink-0">
            <DialogTitle>全屏编辑模板</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex-1">
            <Textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full h-full resize-none border-0 focus:ring-0 focus:outline-none"
              placeholder="在此输入模板内容..."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
