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
  const [, startTransition] = useTransition()

  const handleNavClick = (href: string) => {
    if (pathname !== href) {
      startTransition(() => router.push(href))
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      {/* 毛玻璃底栏 */}
      <div className="bg-background/80 backdrop-blur-2xl border-t border-border/50">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isFavoritesTab = item.label === '收藏'

            return (
              <motion.button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                className="relative flex flex-col items-center justify-center flex-1 h-12 rounded-2xl min-w-0 touch-manipulation overflow-hidden"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                animate={isFavoritesTab && isFavoriting ? { scale: [1, 1.15, 1], y: [0, -4, 0] } : {}}
                transition={isFavoritesTab && isFavoriting ? { duration: 0.5, ease: 'easeInOut' } : {}}
                whileTap={{ scale: 0.92 }}
              >
                {/* 液态流动色块 */}
                {isActive && (
                  <motion.div
                    layoutId="liquidBlob"
                    className="absolute inset-0 rounded-2xl bg-primary/12 dark:bg-primary/18"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 28,
                      mass: 1.1,
                    }}
                    style={{ borderRadius: 16 }}
                  />
                )}

                <motion.div
                  animate={isActive ? { y: -1, scale: 1.1 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  className="relative z-10"
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground/60'
                    }`}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </motion.div>

                <motion.span
                  animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`text-[10px] mt-0.5 relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground/60'
                  }`}
                >
                  {item.label}
                </motion.span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
