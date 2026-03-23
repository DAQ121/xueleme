import { cookies } from 'next/headers'
import { apiSuccess } from '@/lib/api-response'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  return apiSuccess({ message: '已退出' })
}
