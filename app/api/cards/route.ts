import { NextResponse } from 'next/server'
import { MOCK_CARDS } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')

  let cards = MOCK_CARDS

  if (categoryId) {
    cards = MOCK_CARDS.filter(card => card.categoryId === categoryId)
  }

  // 在真实应用中，这里可能会有数据库查询和错误处理
  // 为了模拟网络延迟，可以添加一个短暂的延时
  await new Promise(resolve => setTimeout(resolve, 500))

  return NextResponse.json(cards)
}
