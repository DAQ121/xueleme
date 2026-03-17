'use client'

import { Home, Heart, User } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTransition } from 'react'
import { useApp } from '@/lib/app-context'

const navItems = [
  { href: '/', icon: Home, label: '首页' },
  { href: '/favorites', icon: Heart, label: '收藏' },
  { href: '/profile', icon: User, label: '我的' },
]

export function BottomNav() {
  const { isFavoriting } = useApp()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleNavClick = (href: string) => {
    if (pathname !== href) {
      startTransition(() => {
        router.push(href)
      })
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border safe-area-inset-bottom z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const isFavoritesTab = item.label === '收藏'

          return (
            <motion.button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="relative flex flex-col items-center justify-center flex-1 h-full min-w-0 touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              animate={isFavoritesTab && isFavoriting ? { scale: [1, 1.2, 1], y: [0, -5, 0] } : {}}
              transition={isFavoritesTab && isFavoriting ? { duration: 0.5, ease: "easeInOut" } : {}}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-x-4 top-1 h-0.5 bg-primary rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <item.icon
                className={`w-6 h-6 transition-colors duration-150 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-xs mt-1 transition-colors duration-150 ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
