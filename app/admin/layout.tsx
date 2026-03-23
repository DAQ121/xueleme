import type { ReactNode } from 'react'
import { AdminSidebar } from './components/admin-sidebar'

export const metadata = {
  title: '学了么后台管理',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}
