import { motion } from 'framer-motion'
import { FloatingCloseButton } from '@/components/ui/floating-close-button'

export function CardDetailModal({
  card,
  onClose,
}: {
  card: { id: string; content: string; author?: string; source?: string }
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <FloatingCloseButton onClick={onClose} />
        
        <div>
          <p className="text-lg leading-relaxed text-slate-800 dark:text-slate-100">
            {card.content}
          </p>
          {(card.author || card.source) && (
            <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 text-right">
              —— {card.author || card.source}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
