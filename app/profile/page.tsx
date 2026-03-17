'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, 
  Sparkles,
  MessageSquare, 
  Phone,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  XCircle,
  Check,
  Infinity,
  Settings2,
  Send
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { FloatingCloseButton } from '@/components/ui/floating-close-button'
import { BottomNav } from '@/components/bottom-nav'
import { AppProvider } from '@/lib/app-context'



// 菜单项组件
function MenuItem({ 
  icon: Icon, 
  label, 
  color, 
  onClick 
}: { 
  icon: React.ElementType
  label: string
  color: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
    >
      <div 
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="flex-1 text-left text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
    </button>
  )
}

// 主题选择器
function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  
  const themes = [
    { id: 'light', icon: Sun, label: '浅色' },
    { id: 'dark', icon: Moon, label: '深色' },
    { id: 'system', icon: Monitor, label: '跟随系统' },
  ]
  
  return (
    <div className="flex gap-2">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all ${
            theme === t.id 
              ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' 
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <t.icon className={`w-5 h-5 ${theme === t.id ? 'text-orange-500' : 'text-slate-400'}`} />
          <span className={`text-xs font-medium ${theme === t.id ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500'}`}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// 订阅弹窗
function SubscriptionModal({ onClose }: { onClose: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<'member' | 'pro'>('member')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl overflow-visible max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <FloatingCloseButton onClick={onClose} />

        <div className="px-6 pb-6">
          {/* VIP卡片 */}
          <div className="relative h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 mb-6">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 text-6xl font-black text-white/30">VIP</div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32">
              <div className="w-full h-full bg-gradient-to-tl from-white/20 to-transparent rounded-tl-full" />
            </div>
            <div className="absolute top-4 right-4 z-10">
              <span className="text-white/80 text-sm font-medium">学了么 #</span>
            </div>
            <div className="absolute bottom-4 left-4">
              <Crown className="w-10 h-10 text-white/90 mb-2" />
              <p className="text-white font-bold text-lg">成为尊享会员</p>
            </div>
          </div>

          {/* 会员特权 */}
          <div className="flex justify-around mb-6">
            {[
              { icon: Infinity, label: '无限畅刷' },
              { icon: Sparkles, label: '专属内容' },
              { icon: Settings2, label: '自定义' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>

          {/* 套餐选择 */}
          <div className="space-y-3 mb-6">
            {/* 会员版 */}
            <button
              onClick={() => setSelectedPlan('member')}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                selectedPlan === 'member'
                  ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100">会员版</span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">畅刷无限制</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100">¥9.9</span>
                    <span className="text-sm text-slate-400">/月</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedPlan === 'member' 
                    ? 'border-orange-400 bg-orange-400' 
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {selectedPlan === 'member' && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </button>

            {/* 专属版 */}
            <button
              onClick={() => setSelectedPlan('pro')}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                selectedPlan === 'pro'
                  ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-100">专属版</span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">支持自定义专栏</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-100">¥19.9</span>
                    <span className="text-sm text-slate-400">/月</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">定义你想看到的类型</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedPlan === 'pro' 
                    ? 'border-orange-400 bg-orange-400' 
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {selectedPlan === 'pro' && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </button>
          </div>

          {/* 开通按钮 */}
          <Button 
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold text-lg shadow-lg shadow-orange-500/30"
          >
            立即开通
          </Button>


        </div>
      </motion.div>
    </motion.div>
  )
}

// 意见反馈页面
function FeedbackPage({ onBack }: { onBack: () => void }) {
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (feedback.trim()) {
      setSubmitted(true)
      setTimeout(() => {
        onBack()
      }, 1500)
    }
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-50"
    >
      <div className="flex flex-col h-full pt-safe">
        <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">意见反馈</h1>
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <XCircle className="w-5 h-5 text-slate-500" />
          </button>
        </header>

        <div className="flex-1 p-4">
          {submitted ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200">感谢您的反馈!</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">您的反馈对我们非常重要，请告诉我们您的想法或建议:</p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="请输入您的意见或建议..."
                className="w-full h-48 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
              <Button
                onClick={handleSubmit}
                disabled={!feedback.trim()}
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium"
              >
                <Send className="w-4 h-4 mr-2" />
                提交反馈
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// 联系我们页面
function ContactPage({ onBack }: { onBack: () => void }) {
  const contacts = [
    { platform: '小红书', account: '@学了么官方', color: '#FF2442', icon: '📕' },
    { platform: '抖音号', account: '@xuele_official', color: '#000000', icon: '🎵' },
    { platform: '微信群', account: '扫码加入官方交流群', color: '#07C160', icon: '💬' },
  ]

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-50"
    >
      <div className="flex flex-col h-full pt-safe">
        <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">联系我们</h1>
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <XCircle className="w-5 h-5 text-slate-500" />
          </button>
        </header>

        <div className="flex-1 p-4 space-y-3">
          {contacts.map((contact, i) => (
            <motion.div
              key={contact.platform}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${contact.color}15` }}
                >
                  {contact.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{contact.platform}</h3>
                  <p className="text-sm text-slate-500">{contact.account}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 关于我们页面
function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed inset-0 bg-slate-50 dark:bg-slate-900 z-50"
    >
      <div className="flex flex-col h-full pt-safe">
        <header className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">关于我们</h1>
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <XCircle className="w-5 h-5 text-slate-500" />
          </button>
        </header>

        <div className="flex-1 p-6 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">学了么</h2>
          <p className="text-sm text-slate-400 mb-6">v1.0.0</p>
          
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed text-center">
              「学了么」是一款知识卡片学习应用，通过简洁的卡片形式，每天为您呈现有趣、有料的知识点，让学习变得轻松愉快。
            </p>
          </div>
          
          <div className="mt-8 text-center text-xs text-slate-400">
            <p>Copyright 2024 学了么团队</p>
            <p className="mt-1">保留所有权利</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ProfileContent() {
  const [currentPage, setCurrentPage] = useState<'main' | 'feedback' | 'contact' | 'about'>('main')
  const [showSubscription, setShowSubscription] = useState(false)
  const [isSubscribed] = useState(false) // 订阅状态

  return (
    <main className="flex flex-col min-h-[100dvh] bg-slate-50 dark:bg-slate-900">
      {/* 顶部渐变背景 */}
      <div className="h-32 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400" />

      {/* 内容区域 */}
      <div className="flex-1 -mt-16 px-4 pb-24">
        {/* 订阅卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden mb-4"
        >
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-orange-500" />
                  <span className={`text-sm font-medium ${isSubscribed ? 'text-green-600' : 'text-slate-500'}`}>
                    {isSubscribed ? '已订阅' : '未订阅'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  如果知识卡片对您有帮助，可以选择订阅我们
                </p>
              </div>
              <Button
                onClick={() => setShowSubscription(true)}
                className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-medium px-5 shadow-md shadow-orange-500/20"
              >
                立即订阅
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 菜单列表 - 第一组 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-700/50 mb-4">
          <div className="p-4 pb-2">
            <ThemeSelector />
          </div>
          <MenuItem 
            icon={Crown} 
            label="领取会员" 
            color="#f59e0b"
            onClick={() => setShowSubscription(true)}
          />
        </div>

        {/* 菜单列表 - 第二组 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-700/50">
          <MenuItem 
            icon={MessageSquare} 
            label="意见反馈" 
            color="#22c55e"
            onClick={() => setCurrentPage('feedback')}
          />
          <MenuItem 
            icon={Phone} 
            label="联系我们" 
            color="#3b82f6"
            onClick={() => setCurrentPage('contact')}
          />
          <MenuItem 
            icon={Sparkles} 
            label="关于我们" 
            color="#8b5cf6"
            onClick={() => setCurrentPage('about')}
          />
        </div>

        {/* 版本信息 */}
        <p className="text-center text-sm text-slate-400 mt-8">
          学了么 v1.0.0
        </p>
      </div>

      {/* 底部导航 */}
      <BottomNav />

      {/* 子页面 */}
      <AnimatePresence>
        {currentPage === 'feedback' && (
          <FeedbackPage onBack={() => setCurrentPage('main')} />
        )}
        {currentPage === 'contact' && (
          <ContactPage onBack={() => setCurrentPage('main')} />
        )}
        {currentPage === 'about' && (
          <AboutPage onBack={() => setCurrentPage('main')} />
        )}
      </AnimatePresence>

      {/* 订阅弹窗 */}
      <AnimatePresence>
        {showSubscription && (
          <SubscriptionModal onClose={() => setShowSubscription(false)} />
        )}
      </AnimatePresence>
    </main>
  )
}

export default function ProfilePage() {
  return (
    <AppProvider>
      <ProfileContent />
    </AppProvider>
  )
}
