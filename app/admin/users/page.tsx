'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/app/admin/components/pagination';
import { Search, Crown, Shield, User, Trash2 } from 'lucide-react';

interface UserItem {
  id: string;
  phone: string | null;
  email: string | null;
  role: string;
  isSubscribed: boolean;
  createdAt: string;
  _count: { favorites: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), pageSize: pagination.pageSize.toString() });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.list);
      setPagination(prev => ({ ...prev, total: data.total, page: data.page }));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.pageSize]);

  useEffect(() => {
    // Reset page to 1 when search term changes
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [fetchUsers, pagination.page]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0) {
        setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // ... (placeholder for future actions like delete, edit role etc.)

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">用户管理</h1>
          <p className="text-sm text-slate-500 mt-1">共 {total} 位用户</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          placeholder="搜索用户邮箱或手机..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <p className="p-4 text-center">加载中...</p>
        ) : users.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <p>暂无用户</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">用户</th>
                <th className="px-6 py-3">角色</th>
                <th className="px-6 py-3">订阅</th>
                <th className="px-6 py-3">收藏夹</th>
                <th className="px-6 py-3">注册时间</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{user.email || user.phone}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">{user.isSubscribed ? '是' : '否'}</td>
                  <td className="px-6 py-4">{user._count.favorites}</td>
                  <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination 
        page={pagination.page}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
