'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const statusMap = {
  PENDING: { text: '待处理', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  REVIEWED: { text: '已查看', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  RESOLVED: { text: '已解决', className: 'bg-green-100 text-green-800 border-green-200' },
};

export function FeedbackDetailModal({ isOpen, onClose, feedback }) {
  if (!feedback) return null;

  const statusInfo = statusMap[feedback.status] || { text: '未知', className: 'bg-gray-100' };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>反馈详情</DialogTitle>
          <DialogDescription>
            来自: {feedback.user?.email || feedback.user?.phone || '匿名用户'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div>
                <p className="text-sm font-medium text-slate-500 mb-2">状态</p>
                <Badge variant="outline" className={statusInfo.className}>{statusInfo.text}</Badge>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-2">提交时间</p>
                <p className="text-sm">{new Date(feedback.createdAt).toLocaleString('zh-CN')}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-2">反馈内容</p>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-md whitespace-pre-wrap text-sm">
                  {feedback.content}
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
