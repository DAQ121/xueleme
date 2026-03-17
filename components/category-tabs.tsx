'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, GripVertical, Check } from 'lucide-react'
import { useApp } from '@/lib/app-context'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'

interface CategoryTabsProps {
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
}

function SortableCategoryBubble({
  category,
  isSelected,
  onToggle,
}: {
  category: { id: string; name: string }
  isSelected: boolean
  onToggle: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-full cursor-pointer select-none
        transition-colors duration-200
        ${isSelected 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }
        ${isDragging ? 'shadow-lg opacity-90' : ''}
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-0.5 -ml-1 opacity-50 hover:opacity-100"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <button onClick={onToggle} className="flex items-center gap-2">
        <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
        {isSelected && <Check className="w-4 h-4" />}
      </button>
    </div>
  )
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  const { categories, settings, updateCategoryOrder, setSelectedCategories } = useApp()
  const [showSettings, setShowSettings] = useState(false)
  const [tempOrder, setTempOrder] = useState<string[]>([])
  const [tempSelected, setTempSelected] = useState<string[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 根据设置排序的分类
  const sortedCategories = useMemo(() => {
    const orderMap = new Map(settings.categoryOrder.map((id, index) => [id, index]))
    return [...categories].sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? 999
      const orderB = orderMap.get(b.id) ?? 999
      return orderA - orderB
    })
  }, [categories, settings.categoryOrder])

  // 显示在Tab上的分类（已选中的）
  const visibleCategories = useMemo(() => {
    return sortedCategories.filter(c => settings.selectedCategories.includes(c.id))
  }, [sortedCategories, settings.selectedCategories])

  // 弹窗打开时锁定body滚动
  useEffect(() => {
    if (showSettings) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [showSettings])

  const openSettings = () => {
    setTempOrder(settings.categoryOrder)
    setTempSelected([...settings.selectedCategories])
    setShowSettings(true)
  }

  const handleSave = () => {
    updateCategoryOrder(tempOrder)
    setSelectedCategories(tempSelected)
    setShowSettings(false)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setTempOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleTempToggle = (categoryId: string) => {
    setTempSelected(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      }
      return [...prev, categoryId]
    })
  }

  // 临时排序的分类（用于设置面板）
  const tempSortedCategories = useMemo(() => {
    const orderMap = new Map(tempOrder.map((id, index) => [id, index]))
    return [...categories].sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? 999
      const orderB = orderMap.get(b.id) ?? 999
      return orderA - orderB
    })
  }, [categories, tempOrder])

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap
                transition-all duration-200 text-sm font-medium
                ${activeCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary/60 text-secondary-foreground hover:bg-secondary'
                }
              `}
            >
              <span>{category.name}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={openSettings}
          className="flex-shrink-0 p-2.5 rounded-full bg-secondary/60 hover:bg-secondary transition-colors"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* 设置弹窗 */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={() => setShowSettings(false)}
            />
            {/* 弹窗内容 */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[101] w-full max-w-lg mx-auto bg-background rounded-t-3xl max-h-[80vh] flex flex-col"
            >
              {/* 拖拽指示条 */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              
              <div className="px-6 pb-6 flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">管理专栏</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 rounded-full hover:bg-secondary"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  点击选择要显示的专栏，长按拖动调整顺序
                </p>

                <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={tempSortedCategories.map(c => c.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="flex flex-wrap gap-3 py-2">
                        {tempSortedCategories.map((category) => (
                          <SortableCategoryBubble
                            key={category.id}
                            category={category}
                            isSelected={tempSelected.includes(category.id)}
                            onToggle={() => handleTempToggle(category.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                <div className="flex gap-3 pt-4 pb-safe">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowSettings(false)}
                  >
                    取消
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={tempSelected.length === 0}
                  >
                    保存
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
