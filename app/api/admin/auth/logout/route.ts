import { cookies } from 'next/headers'
import { ok } from '@/lib/api-response'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  return ok({ message: '已退出' })
}
