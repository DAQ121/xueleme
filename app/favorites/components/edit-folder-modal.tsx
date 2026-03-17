import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FloatingCloseButton } from '@/components/ui/floating-close-button'
import { FOLDER_COLOR_PRESETS } from '@/lib/mock-data'
import type { FavoriteFolder } from '@/lib/types'

export function EditFolderModal({
  folder,
  isNew,
  onSave,
  onClose,
}: {
  folder?: FavoriteFolder
  isNew: boolean
  onSave: (name: string, color: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState(folder?.name || '')
  const [color, setColor] = useState(folder?.color || FOLDER_COLOR_PRESETS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim(), color)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm bg-background rounded-2xl p-6 overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <FloatingCloseButton onClick={onClose} />
        <h2 className="text-lg font-semibold mb-6">
          {isNew ? '新建收藏夹' : '编辑收藏夹'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">名称</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入收藏夹名称"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">颜色</label>
            <div className="grid grid-cols-5 gap-3">
              {FOLDER_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" className="flex-1" disabled={!name.trim()}>
              保存
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
